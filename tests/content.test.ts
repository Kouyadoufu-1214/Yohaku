import { describe, expect, it } from 'vitest';
import { LIFE_CATEGORIES } from '../src/data/life';
import { STEP_PLANS } from '../src/data/steps';
import { STORIES, STORY_CATEGORIES } from '../src/data/stories';
import { SNS_RESOURCES, TEL_RESOURCES, INFO_SITES } from '../src/data/resources';
import { FEELINGS } from '../src/data/feelings';
import { SUPPORTER_SOURCES } from '../src/data/supporters';

const ROUTES = /^\/(life|steps|message|card|feelings\/leave|help|rest|stories)(\/[\w-]+)?(\?type=\w+)?$/;

describe('支援コンテンツ', () => {
  it('日常生活支援：仕様の6カテゴリと各項目に、2つ以上の小さな行動がある', () => {
    expect(LIFE_CATEGORIES.map((c) => c.label)).toEqual(['起床', '食事', '身だしなみ', '学校・仕事', '外出', '家事']);
    const labels = LIFE_CATEGORIES.flatMap((c) => c.items.map((i) => i.label));
    for (const l of [
      '布団から出られない', '身体を起こす気力がない', '朝の準備ができない',
      '食事を作る気力がない', '食欲がない', '買い物に行けない',
      'お風呂に入る気力がない', '歯を磨くことが難しい', '着替えができない',
      '学校に行くことが難しい', '仕事に行くことが難しい', '欠席や欠勤の連絡ができない', '提出物が進められない',
      '外に出ることが怖い', '人に会いたくない', '外出の準備ができない',
      '部屋を片付けられない', '洗濯物がたまっている', 'やるべきことが整理できない',
    ]) {
      expect(labels).toContain(l);
    }
    for (const c of LIFE_CATEGORIES) for (const i of c.items) expect(i.suggestions.length, i.id).toBeGreaterThanOrEqual(2);
  });

  it('食事の項目には医療機関・相談窓口への案内がある', () => {
    const food = LIFE_CATEGORIES.find((c) => c.id === 'food')!;
    for (const i of food.items) expect(i.careNote).toMatch(/医療機関|相談窓口/);
  });

  it('アプリ内リンクはすべて存在する画面を指す', () => {
    const links = [
      ...LIFE_CATEGORIES.flatMap((c) => c.items.flatMap((i) => i.links ?? [])),
      ...STEP_PLANS.flatMap((p) => p.links ?? []),
    ];
    for (const l of links) expect(l.to, l.label).toMatch(ROUTES);
  });

  it('気持ちの選択肢は仕様の11個', () => {
    expect(FEELINGS.map((f) => f.label)).toEqual(['不安', '悲しみ', '孤独', '恐怖', '焦り', '怒り', '疲労', '無気力', '罪悪感', '何も感じない', '自分でもわからない']);
  });

  it('体験談はすべてサンプル（架空）として扱われ、カテゴリが存在する', () => {
    const cats = STORY_CATEGORIES.map((c) => c.id) as string[];
    for (const s of STORIES) {
      expect(s.sample).toBe(true);
      expect(cats).toContain(s.category);
    }
    for (const c of STORY_CATEGORIES) expect(STORIES.some((s) => s.category === c.id), c.id).toBe(true);
  });

  it('少しずつ戻る：仕様の6つの計画がある', () => {
    expect(STEP_PLANS.map((p) => p.label)).toEqual(['外出の準備', '学校への復帰', 'アルバイトの再開', '人と会う準備', '趣味の再開', '医療機関の受診']);
  });

  it('相談窓口：受付時間・料金・対象・対象地域・出典がすべてある', () => {
    for (const r of [...TEL_RESOURCES, ...SNS_RESOURCES]) {
      expect(r.hours.length, r.id).toBeGreaterThan(0);
      expect(r.fee, r.id).toBeTruthy();
      expect(r.target, r.id).toBeTruthy();
      expect(r.region, r.id).toBeTruthy();
      expect(r.source.url, r.id).toMatch(/^https:\/\//);
      for (const c of r.contacts) expect(c.href, r.id).toMatch(c.kind === 'tel' ? /^tel:\d{3,11}$/ : /^https:\/\//);
    }
  });

  it('外部リンクはすべて https', () => {
    for (const u of [...INFO_SITES.map((s) => s.url), ...SUPPORTER_SOURCES.map((s) => s.url)]) expect(u).toMatch(/^https:\/\//);
  });

  it('指示書で指定された3つの相談先を含む', () => {
    const urls = INFO_SITES.map((s) => s.url);
    expect(urls).toContain('https://www.mhlw.go.jp/mamorouyokokoro/');
    expect(urls).toContain('https://www.mhlw.go.jp/mamorouyokokoro/soudan/sns/');
    expect(urls).toContain('https://talkme.jp/');
  });
});

describe('相談窓口の最新状況', () => {
  it('受付の一時休止が確認された窓口には、出典つきのお知らせがある', () => {
    for (const id of ['inochi-sos', 'ikizurabit']) {
      const r = [...TEL_RESOURCES, ...SNS_RESOURCES].find((x) => x.id === id)!;
      expect(r.status?.text).toMatch(/一時休止/);
      expect(r.status?.source.url).toMatch(/^https:\/\//);
    }
  });
});
