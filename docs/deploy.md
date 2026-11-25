# 無料公開の手順書

余白。はビルドすると `dist/` に静的ファイルだけが出力されます。サーバーやデータベースは不要で、無料の静的ホスティングで公開できます。
PWA（ホーム画面への追加・オフライン）には **HTTPS** が必要ですが、以下のサービスはいずれも標準で HTTPS です。

## 共通：ビルド

```bash
npm ci
npm test
npm run build      # dist/ に出力
npm run preview    # http://localhost:4173 で確認
```

- `base: './'`（相対パス）とハッシュ方式の URL を使っているため、サブディレクトリ（`https://<user>.github.io/<repo>/`）でもそのまま動きます
- サーバー側のリダイレクト設定（SPA 用の 404 対策）は不要です

---

## 方法 A：GitHub Pages（推奨・設定が少ない）

1. GitHub のリポジトリで **Settings → Pages** を開く
2. **Build and deployment → Source** を「**GitHub Actions**」にする
3. このリポジトリの `.github/workflows/deploy-pages.yml` が、`main` ブランチへ push されるたびに「テスト → ビルド → 公開」を行います（Actions タブから手動実行も可能）
4. 公開 URL：`https://<ユーザー名>.github.io/<リポジトリ名>/`

注意点

- **リポジトリが非公開の場合**、GitHub Pages の利用には有料プランが必要になることがあります。無料プランで公開する場合はリポジトリを公開にしてください（GitHub の最新の条件を確認してください）
- GitHub Pages では HTTP ヘッダーを設定できないため、CSP は `index.html` の `<meta>` で適用されます。`frame-ancestors`（他サイトへの埋め込み防止）は `<meta>` では効かないため、より厳密にしたい場合は方法 B / C を検討してください
- **通信ログ**：GitHub の公式ドキュメント（[About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)）には「GitHub Pages のサイトが訪問されると、訪問者の IP アドレスがセキュリティ目的で記録・保存される」と記載されています（2026年11月25日確認）。プライバシーポリシー案の 6 に反映済みです

## 方法 B：Cloudflare Pages

1. Cloudflare のダッシュボード → **Workers & Pages → Create → Pages → Connect to Git**
2. リポジトリを選び、ビルド設定を入力
   - Build command：`npm run build`
   - Build output directory：`dist`
   - 環境変数：`NODE_VERSION = 22`
3. `public/_headers` が `dist/_headers` にコピーされ、CSP・`X-Frame-Options`・`Permissions-Policy` などのヘッダーが自動で適用されます
4. **通信ログ**：Cloudflare がアクセス記録をどのように扱うかは、公開前に Cloudflare のプライバシーポリシーで確認してください（本手順書の作成時点では未確認）。Web Analytics は有効にしないでください

## 方法 C：Netlify

1. **Add new site → Import an existing project** でリポジトリを選択
2. Build command：`npm run build`、Publish directory：`dist`
3. `_headers` によるヘッダー設定が適用されます
4. **通信ログ**：Netlify の扱いを公開前に確認してください（未確認）。Analytics 機能は有効にしないでください

---

## 公開後の確認

- [ ] スマートフォンの Safari / Chrome で開き、ホーム画面に追加できる
- [ ] 一度開いたあと機内モードにして、アプリが開ける
- [ ] 相談窓口のリンク・電話番号が正しく開く
- [ ] ブラウザの開発者ツールの Network タブで、外部への通信がない
- [ ] 開発者ツールの Console に CSP 違反が出ていない

## 更新のしかた

`main` に push すると自動で再公開されます（方法 A〜C 共通）。
Service Worker はファイルの内容から作ったバージョン名でキャッシュを入れ替えるため、利用者は次に開いたときに新しい版に切り替わります。入力中の文章が消えないよう、アプリ側から強制的に再読み込みすることはしません。

## 費用

| 項目 | 費用 |
| --- | --- |
| ホスティング（上記 3 つの無料枠） | 0 円 |
| 独自ドメイン（任意） | 年間 1,000〜数千円程度（任意。なくても公開可能） |
| 外部 API・サーバー・データベース | 不要 |

## 独自ドメインを使う場合

各サービスの「Custom domain」設定から追加できます。HTTPS 証明書は自動で発行されます。
