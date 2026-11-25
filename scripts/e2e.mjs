// 余白。動作確認スクリプト（ブラウザでの自動テスト）
//
// 前提: npm run build を実行済みであること。Playwright（Chromium）が必要です。
//   node scripts/e2e.mjs            … テストを実行し、結果を test-results/ に出力
//   SCREENSHOTS=1 node scripts/e2e.mjs … 主要画面のスクリーンショットも保存
//
// 確認すること
//   - すべての画面が表示でき、見出しがある
//   - スマートフォン幅で横スクロールが発生しない／操作部品が重ならない
//   - axe-core による WCAG 2.2 AA の自動チェック
//   - 主要な操作（表示モード・休憩室・生活支援・気持ち・カード・連絡文・保存と削除・設定）
//   - アプリ外へのネットワーク通信が発生しない（入力内容が送信されない）
//   - CSP 違反やエラーが出ない
//   - オフラインでも開ける（Service Worker）

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const PORT = 4174;
const BASE = `http://localhost:${PORT}/`;
const OUT = 'test-results';
const SHOTS = process.env.SCREENSHOTS === '1';
mkdirSync(OUT, { recursive: true });
if (SHOTS) mkdirSync(join(OUT, 'screenshots'), { recursive: true });

const ROUTES = [
  '/', '/rest', '/life', '/life/wake', '/life/wake/futon', '/life/food/cook', '/life/school-work/absence',
  '/feelings', '/feelings/sort', '/feelings/leave', '/feelings/records', '/card', '/message', '/message?type=hospital',
  '/stories', '/stories/sample-school', '/steps', '/steps/clinic', '/supporters', '/help', '/settings',
  '/privacy', '/terms', '/about', '/together', '/small', '/does-not-exist',
];

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
}
async function check(name, fn) {
  try {
    const detail = await fn();
    record(name, true, typeof detail === 'string' ? detail : '');
  } catch (e) {
    record(name, false, e instanceof Error ? e.message.split('\n')[0] : String(e));
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('preview server did not start')), 20000);
  server.stdout.on('data', (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(t);
      resolve();
    }
  });
});

const browser = await chromium.launch();
const externalRequests = [];
const pageErrors = [];
const cspViolations = [];

async function newContext(options = {}) {
  const context = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1, ...options });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  context.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:') && !url.startsWith('blob:')) externalRequests.push(url);
  });
  await context.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return context;
}

function watch(page, label) {
  page.on('pageerror', (e) => pageErrors.push(`${label}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = m.text();
      if (text.startsWith('CSP violation')) cspViolations.push(`${label}: ${text}`);
      else pageErrors.push(`${label}: ${text}`);
    }
  });
}

async function go(page, route) {
  await page.goto(`${BASE}#${route}`);
  await page.waitForSelector('#page-title');
}

async function layoutProblems(page) {
  return page.evaluate(() => {
    const problems = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1) problems.push(`横スクロール ${document.documentElement.scrollWidth}px > ${vw}px`);
    const els = [...document.querySelectorAll('a, button, input:not([type=radio]):not([type=checkbox]), textarea, select, label.choice__option, label.chip, label.phrase, .mode-switch__option')].filter((el) => {
      const r = el.getBoundingClientRect();
      const visible = typeof el.checkVisibility === 'function' ? el.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true }) : true;
      return r.width > 1 && r.height > 1 && visible && !el.closest('.visually-hidden, .skip-link, dialog:not([open]), details:not([open]) > :not(summary)');
    });
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) problems.push(`はみ出し: ${el.textContent?.trim().slice(0, 20)}`);
    }
    // 操作部品どうしの重なり（入れ子・固定ナビとの重なりは除く）
    for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) {
        const a = els[i];
        const b = els[j];
        if (a.contains(b) || b.contains(a)) continue;
        if (a.closest('.bottom-nav, .app-header') || b.closest('.bottom-nav, .app-header')) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w > 2 && h > 2) problems.push(`重なり: 「${a.textContent?.trim().slice(0, 12)}」と「${b.textContent?.trim().slice(0, 12)}」`);
      }
    }
    return problems.slice(0, 5);
  });
}

async function axe(page) {
  // CSP によりページ内へのスクリプト挿入は禁止されているため、DevTools プロトコル経由で評価する
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
    return r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')}`);
  });
}

// ------------------------------------------------------------
// 1. すべての画面：表示・横スクロール・重なり・アクセシビリティ（スマートフォン / ライト・ダーク）
// ------------------------------------------------------------
for (const scheme of ['light', 'dark']) {
  const context = await newContext({ colorScheme: scheme });
  const page = await context.newPage();
  watch(page, `mobile-${scheme}`);
  for (const route of ROUTES) {
    await check(`[スマホ/${scheme}] ${route} を表示できる・横スクロールや重なりがない・axe違反なし`, async () => {
      await go(page, route);
      const title = await page.textContent('#page-title');
      assert(title && title.trim().length > 0, '見出しがない');
      assert(await page.isVisible('.help-button'), '相談窓口への導線が見えない');
      const probs = await layoutProblems(page);
      assert(probs.length === 0, probs.join(' / '));
      const v = await axe(page);
      assert(v.length === 0, v.join(' | '));
      if (SHOTS && scheme === 'light') await page.screenshot({ path: join(OUT, 'screenshots', `mobile-${route.replace(/[/?=]/g, '_') || 'home'}.png`), fullPage: true });
      if (SHOTS && scheme === 'dark' && ['/', '/rest', '/help'].includes(route)) await page.screenshot({ path: join(OUT, 'screenshots', `mobile-dark-${route.replace(/[/?=]/g, '_')}.png`), fullPage: true });
      return title.trim();
    });
  }
  await context.close();
}

// ------------------------------------------------------------
// 2. パソコン幅・タブレット幅・小さいスマートフォン幅・最大文字サイズ
// ------------------------------------------------------------
for (const [label, viewport, extra] of [
  ['PC', { width: 1280, height: 800 }, {}],
  ['PC小', { width: 1024, height: 700 }, {}],
  ['タブレット', { width: 820, height: 1180 }, {}],
  ['小さいスマホ', { width: 320, height: 640 }, {}],
  ['小さいスマホ+特大文字', { width: 320, height: 640 }, { font: 'xl' }],
]) {
  const pc = label.startsWith('PC');
  const context = await newContext({ viewport, isMobile: !pc, hasTouch: !pc, userAgent: undefined });
  const page = await context.newPage();
  watch(page, label);
  if (extra.font) {
    await page.goto(BASE);
    await page.evaluate((f) => localStorage.setItem('yohaku.settings.v1', JSON.stringify({ fontSize: f, mode: 'full' })), extra.font);
  }
  for (const route of ROUTES) {
    await check(`[${label}] ${route} 横スクロール・重なりなし`, async () => {
      await go(page, route);
      const probs = await layoutProblems(page);
      assert(probs.length === 0, probs.join(' / '));
      if (SHOTS && label === 'PC' && ['/', '/rest', '/help'].includes(route)) await page.screenshot({ path: join(OUT, 'screenshots', `pc-${route.replace(/[/?=]/g, '_')}.png`) });
    });
  }
  await context.close();
}

// ------------------------------------------------------------
// 3. 操作の確認（スマートフォン）
// ------------------------------------------------------------
const context = await newContext();
const page = await context.newPage();
watch(page, 'flows');
const SECRET = '誰にも見せない秘密のことば12345';

await check('ホーム：起動時にログインやアンケートなしでホームが表示される', async () => {
  await page.goto(BASE);
  await page.waitForSelector('#page-title');
  const t = await page.textContent('#page-title');
  assert(t.includes('今、どう過ごしたいですか'), t);
  const n = await page.locator('.home-choice').count();
  assert(n === 8, `選択肢が${n}個`);
});

await check('ホーム：8つの選択肢がそれぞれ正しい画面へ移動する', async () => {
  const expected = ['心の休憩室', '誰かにそばにいてほしい', '日常生活の支援', '気持ちの整理', '気持ちを伝えるカード', '誰かの経験を知る', '少しだけ何かをしたい', '相談窓口・緊急時'];
  for (let i = 0; i < expected.length; i++) {
    await go(page, '/');
    await page.locator('.home-choice').nth(i).click();
    await page.waitForFunction((e) => document.getElementById('page-title')?.textContent?.includes(e), expected[i]);
  }
});

await check('表示モード：最小では大きなボタン5つ、全機能では「ほかの機能」が出る。どのモードでも相談窓口が見える', async () => {
  await go(page, '/');
  await page.getByText('最小', { exact: true }).click();
  assert((await page.locator('.home-choice').count()) === 5, '最小の選択肢数');
  if (SHOTS) await page.screenshot({ path: join(OUT, 'screenshots', 'mobile-home-minimal.png'), fullPage: true });
  assert(await page.isVisible('.help-button'), '最小：相談窓口');
  assert((await page.getAttribute('html', 'data-mode')) === 'minimal', 'data-mode');
  await page.getByText('全機能', { exact: true }).click();
  assert(await page.isVisible('#home-more-title'), 'ほかの機能');
  if (SHOTS) await page.screenshot({ path: join(OUT, 'screenshots', 'mobile-home-full.png'), fullPage: true });
  assert(await page.isVisible('.help-button'), '全機能：相談窓口');
  // ナビゲーションで主要機能に行ける
  for (const label of ['休憩', '生活支援', '気持ち', '設定', 'ホーム']) {
    await page.locator('.bottom-nav a', { hasText: label }).click();
    await page.waitForSelector('#page-title');
  }
  await page.getByText('標準', { exact: true }).click();
});

await check('ナビゲーション：下部メニューの現在地が aria-current で示される', async () => {
  await go(page, '/life');
  const cur = await page.getAttribute('.bottom-nav a[aria-current="page"]', 'href');
  assert(cur === '#/life', String(cur));
});

await check('休憩室：音は自動再生されず、押すと再生・止められる。背景・文章・動き・全画面を切り替えられる', async () => {
  await go(page, '/rest');
  assert(!(await page.isVisible('.pill')), '自動再生されている');
  await page.locator('.scene-option', { hasText: '星空' }).click();
  assert((await page.getAttribute('.rest-stage', 'data-scene')) === 'stars', '背景変更');
  await page.getByRole('button', { name: /を流す/ }).click();
  await page.waitForSelector('.pill');
  await page.getByRole('button', { name: 'ミュート' }).click();
  await page.getByRole('button', { name: 'ミュート中' }).click();
  await page.locator('#rest-volume').fill('20');
  await page.getByRole('button', { name: '音を止める' }).first().click();
  await page.waitForSelector('.pill', { state: 'detached' });
  await page.locator('.switch', { hasText: 'ことばを表示する' }).click();
  assert(!(await page.isVisible('.rest-stage__words')), '文章を隠せない');
  await page.locator('.switch', { hasText: '動きを止める' }).click();
  assert((await page.getAttribute('html', 'data-motion')) === 'reduce', '動きを止められない');
  await page.locator('.switch', { hasText: '動きを止める' }).click();
  assert((await page.getAttribute('html', 'data-motion')) === 'full', '動きを戻せない');
  await page.getByRole('button', { name: '全画面で表示する' }).click();
  await page.waitForSelector('.rest-stage.is-immersive');
  if (SHOTS) await page.screenshot({ path: join(OUT, 'screenshots', 'mobile-rest-immersive.png') });
  assert(await page.isVisible('.rest-stage__overlay a[href="#/help"]'), '全画面でも相談窓口が見える');
  assert(!(await page.isVisible('.bottom-nav')), '全画面でナビが隠れる');
  await page.getByRole('button', { name: '表示を戻す' }).click();
  await page.waitForSelector('.bottom-nav');
  await page.locator('.switch', { hasText: 'ことばを表示する' }).click();
  assert(await page.isVisible('.rest-stage__words'), '文章を戻せない');
});

await check('休憩室：利用時間の計測や目標がない', async () => {
  await go(page, '/rest');
  const text = await page.textContent('main');
  assert(!/分間|経過|達成|目標|連続/.test(text), '時間や目標に関する表示がある');
});

await check('生活支援：行動を一つずつ提示し、「別の方法を見る」「今はしない」が使える', async () => {
  await go(page, '/life');
  await page.getByRole('link', { name: /起床/ }).click();
  await page.getByRole('link', { name: '布団から出られない' }).click();
  const first = await page.textContent('.gentle-card__main');
  await page.getByRole('button', { name: '別の方法を見る' }).click();
  const second = await page.textContent('.gentle-card__main');
  assert(first !== second, '別の方法に変わらない');
  await page.getByRole('button', { name: '今はしない' }).click();
  assert((await page.textContent('.gentle-card__main')).includes('しなくて大丈夫'), '今はしない');
  await go(page, '/life/food/appetite');
  assert(await page.isVisible('.notice--care'), '医療機関への案内がない');
});

await check('気持ちの整理：複数選択・保存せずに終える（初期）・保存する', async () => {
  await go(page, '/feelings/sort');
  await page.getByText('不安', { exact: true }).click();
  await page.getByText('疲労', { exact: true }).click();
  await page.getByRole('button', { name: '書きたいことがあれば（任意）' }).click();
  await page.locator('textarea').fill(SECRET);
  await page.getByRole('button', { name: '次へ' }).click();
  const lead = await page.textContent('.reflect__lead');
  assert(lead.includes('不安') && lead.includes('疲労'), lead);
  if (SHOTS) await page.screenshot({ path: join(OUT, 'screenshots', 'mobile-feelings-reflect.png'), fullPage: true });
  const all = await page.textContent('main');
  assert(!/点|スコア|診断名|うつ病/.test(all.replace('点数もつけません', '')), '点数化・病名の表示がある');
  await page.getByRole('button', { name: '保存せずに終える' }).click();
  assert((await page.textContent('main')).includes('何も保存していません'), '保存しない');
  await page.getByRole('button', { name: 'もう一度整理する' }).click();
  await page.getByText('孤独', { exact: true }).click();
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('button', { name: 'この端末に保存する' }).click();
  await page.waitForSelector('text=この端末にだけ保存しました');
});

await check('気持ちを置いていく場所：保存しないのが初期。保存・書き出し・削除ができる', async () => {
  await go(page, '/feelings/leave');
  await page.locator('textarea').fill(SECRET);
  await page.getByRole('button', { name: '保存せずに閉じる' }).click();
  await page.waitForSelector('text=ことばを、ここに置いていきました');
  await page.getByRole('button', { name: 'また書く' }).click();
  assert((await page.inputValue('textarea')) === '', '内容が残っている');
  await page.locator('textarea').fill(SECRET);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'テキストとして書き出す' }).click()]);
  const path = await download.path();
  assert(readFileSync(path, 'utf8').includes(SECRET), '書き出した内容');
  await page.getByRole('button', { name: 'この端末に保存する' }).click();
  await page.waitForSelector('.success');
  await page.getByRole('button', { name: '書いた内容を消す' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '消す' }).click();
  assert((await page.inputValue('textarea')) === '', '消えていない');
});

await check('保存した記録：再読み込み後も残り、1件ずつ削除できる', async () => {
  await page.reload();
  await go(page, '/feelings/records');
  await page.waitForSelector('.record');
  const before = await page.locator('.record').count();
  assert(before === 2, `記録が${before}件`);
  assert((await page.textContent('main')).includes(SECRET.slice(0, 8)), '保存したことば');
  await page.locator('.record').first().getByRole('button', { name: '削除' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '削除する' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.record').length === 1);
});

await check('意思伝達カード：選択から文章生成・編集・大きく表示・コピー・画像保存', async () => {
  await go(page, '/card');
  await page.locator('.phrase', { hasText: '今はうまく話せません。' }).click();
  await page.locator('.phrase', { hasText: 'そばにいてほしいです。' }).click();
  await page.locator('.choice__option', { hasText: '家族' }).click();
  const text = await page.inputValue('textarea');
  assert(text.includes('今はうまく話せない。') && text.includes('そばにいてほしい。'), text);
  await page.locator('.choice__option', { hasText: '上司' }).click();
  assert((await page.inputValue('textarea')).includes('今はうまく話せません。'), '相手で言い方が変わらない');
  await page.locator('textarea').fill('編集した文章です。');
  await page.getByRole('button', { name: '画面に大きく表示する' }).click();
  await page.waitForSelector('dialog.present[open]');
  assert((await page.textContent('.present__text')).includes('編集した文章です'), '表示内容');
  await page.getByRole('button', { name: '閉じる' }).click();
  await page.getByRole('button', { name: 'コピー' }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert(clip === '編集した文章です。', `clipboard: ${clip}`);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '画像として保存' }).click()]);
  const buf = readFileSync(await download.path());
  assert(buf.subarray(1, 4).toString() === 'PNG', 'PNG ではない');
});

await check('連絡文作成：種類・理由・長さを選んで文章ができ、理由は書かないも選べる', async () => {
  await go(page, '/message?type=school');
  let body = await page.inputValue('textarea');
  assert(body.includes('欠席'), body);
  await page.locator('.choice__option', { hasText: '理由は書かない' }).click();
  body = await page.inputValue('textarea');
  assert(!/体調|心身/.test(body), body);
  await page.locator('.choice__option', { hasText: '短め' }).click();
  const short = await page.inputValue('textarea');
  await page.locator('.choice__option', { hasText: '長め' }).click();
  const long = await page.inputValue('textarea');
  assert(long.length > short.length, '長さが変わらない');
  await page.locator('.choice__option', { hasText: '病院への問い合わせ' }).click();
  await page.locator('.choice__option', { hasText: '電話で読み上げるメモ' }).click();
  assert((await page.inputValue('textarea')).includes('電話で話すときのメモ'), '電話メモ');
  await page.getByRole('button', { name: 'コピー' }).click();
});

await check('少しずつ戻る：できた・飛ばす・やり直しができ、連続日数や達成率は出ない', async () => {
  await go(page, '/steps/outing');
  await page.locator('.step').first().getByRole('button', { name: 'できた' }).click();
  await page.locator('.step').nth(1).getByRole('button', { name: '飛ばす' }).click();
  assert((await page.locator('.step--done').count()) === 1, 'できた');
  assert(!/%|日連続|達成率/.test(await page.textContent('main')), '達成率などの表示');
  await page.getByRole('button', { name: '最初からやり直す' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'やり直す' }).click();
  assert((await page.locator('.step--done').count()) === 0, 'やり直し');
});

await check('体験談：すべてサンプル表示がある。いいね・ランキングがない', async () => {
  await go(page, '/stories');
  const links = await page.locator('main .link-row').count();
  const badges = await page.locator('main .link-row .badge').count();
  assert(links > 0 && links === badges, `${links} / ${badges}`);
  const main = (await page.textContent('main')).replace('いいね数やランキング、コメント機能はありません。', '');
  assert(!/いいね|ランキング|フォロワー|コメント/.test(main), 'SNS的な表示');
});

await check('相談窓口：受付時間・料金・対象地域・情報確認日を表示し、外部リンクは安全に開く', async () => {
  await go(page, '/help');
  const text = await page.textContent('main');
  for (const w of ['受付時間', '料金', '対象地域', '情報確認日', '119', 'まもろうよ こころ', 'あなたのいばしょ', '運営者は、利用者の記録や入力内容を見ることができません']) assert(text.includes(w), `「${w}」がない`);
  const ext = await page.$$eval('a[target=_blank]', (as) => as.map((a) => ({ href: a.href, rel: a.rel })));
  assert(ext.length > 0, '外部リンクがない');
  for (const e of ext) assert(e.href.startsWith('https://') && e.rel.includes('noopener') && e.rel.includes('noreferrer'), `${e.href} ${e.rel}`);
});

await check('設定：テーマ・文字サイズ・表示モードを変更でき、再読み込み後も保たれる', async () => {
  await go(page, '/settings');
  await page.locator('.choice__option', { hasText: 'ダーク' }).click();
  await page.locator('.choice__option', { hasText: 'とても大きく' }).click();
  await page.reload();
  await page.waitForSelector('#page-title');
  assert((await page.getAttribute('html', 'data-theme')) === 'dark', 'theme');
  assert((await page.getAttribute('html', 'data-font')) === 'xl', 'font');
  const size = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  assert(parseFloat(size) > 20, size);
  await page.locator('.choice__option', { hasText: '端末に合わせる' }).click();
  await page.locator('.choice__option', { hasText: '標準' }).first().click();
});

await check('設定：保存機能を使わない設定にすると保存ボタンが消える', async () => {
  await go(page, '/settings');
  await page.locator('.choice__option', { hasText: '保存機能を使わない' }).click();
  await go(page, '/feelings/leave');
  assert((await page.getByRole('button', { name: 'この端末に保存する' }).count()) === 0, '保存ボタンが残っている');
  await go(page, '/settings');
  await page.locator('.choice__option', { hasText: '毎回えらぶ' }).click();
});

await check('設定：データをすべて削除すると、記録と設定が端末から消える', async () => {
  await go(page, '/settings');
  // 同じオリジンにある別サイトのデータは消さないことも確認する
  await page.evaluate(() => localStorage.setItem('other-site-key', 'keep'));
  await page.getByRole('button', { name: 'この端末のデータをすべて削除する' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'すべて削除する' }).click();
  await page.waitForTimeout(500);
  const state = await page.evaluate(async () => ({
    yohakuKeys: Object.keys(localStorage).filter((k) => k.startsWith('yohaku.')),
    other: localStorage.getItem('other-site-key'),
    dbs: (await indexedDB.databases()).map((d) => d.name),
  }));
  assert(state.yohakuKeys.length === 0, `localStorage に ${state.yohakuKeys.join(',')}`);
  assert(state.other === 'keep', '別サイトのデータまで消えた');
  assert(!state.dbs.includes('yohaku'), 'IndexedDB が残っている');
  await page.evaluate(() => localStorage.removeItem('other-site-key'));
  await go(page, '/feelings/records');
  await page.waitForSelector('text=保存したものはありません');
  return JSON.stringify(state);
});

await check('キーボード：Tab で「本文へ移動」→ 主要な操作に移動できる', async () => {
  await go(page, '/');
  await page.reload();
  await page.waitForSelector('#page-title');
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.textContent);
  assert(first?.includes('本文へ移動'), String(first));
  await page.keyboard.press('Enter');
  const focused = await page.evaluate(() => document.activeElement?.id);
  assert(focused === 'main', String(focused));
});

await check('画面遷移時に見出しへフォーカスが移る', async () => {
  await go(page, '/');
  await page.locator('.home-choice').first().click();
  await page.waitForFunction(() => document.activeElement?.id === 'page-title');
});

// ------------------------------------------------------------
// 4. オフライン
// ------------------------------------------------------------
await check('オフライン：一度開いたあとは、通信がなくても基本機能を使える', async () => {
  const ctx = await newContext();
  const p = await ctx.newPage();
  watch(p, 'offline');
  await p.goto(BASE);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload();
  await p.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await ctx.setOffline(true);
  await p.reload();
  await p.waitForSelector('#page-title');
  for (const r of ['/rest', '/life/wake/futon', '/card', '/message?type=work', '/help']) {
    await go(p, r);
  }
  assert(await p.isVisible('text=今はオフラインです'), 'オフライン表示');
  await ctx.setOffline(false);
  await ctx.close();
});

// ------------------------------------------------------------
// 5. 通信・エラー
// ------------------------------------------------------------
await check('アプリの外への通信が一度も発生していない（入力内容は送信されない）', async () => {
  assert(externalRequests.length === 0, externalRequests.slice(0, 5).join(', '));
});
await check('CSP（Content Security Policy）違反がない', async () => {
  assert(cspViolations.length === 0, cspViolations.slice(0, 3).join(' | '));
});
await check('JavaScript のエラーがない', async () => {
  assert(pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
});

await context.close();
await browser.close();
server.kill();

const passed = results.filter((r) => r.ok).length;
const summary = `${passed} / ${results.length} passed`;
console.log(`\n${summary}`);
writeFileSync(join(OUT, 'e2e-results.json'), JSON.stringify({ date: new Date().toISOString(), summary, results }, null, 2));
process.exit(passed === results.length ? 0 : 1);
