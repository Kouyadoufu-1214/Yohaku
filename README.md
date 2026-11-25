# 余白。

**何者にもならなくていい時間。**

精神的な不調、抑うつ、不安、孤独、生きづらさを抱えている人の「つらいときの生活」を支える、完全無料のWebアプリ（PWA）です。
心を治すことではなく、心がつらいときの日常を少しだけ楽にすることを目的にしています。

- 完全無料・広告なし・課金なし・会員登録なし
- 入力内容を外部に送信しない（アクセス解析・行動追跡もなし）
- 外部API・外部AI・外部フォント・外部画像に依存しない
- オフラインでも基本機能が使える
- スマートフォン（iOS / Android）・パソコンに対応

> 本アプリは医療行為・診断・治療・カウンセリングの代わりではありません。
> 命に関わる緊急時は 119番 に連絡してください。

---

## 主な機能

| 機能 | 内容 |
| --- | --- |
| ホーム | 「今、どう過ごしたいですか？」から、説明しなくても必要な機能へ |
| 表示モード | 最小・標準・全機能。その日の状態に合わせて画面の情報量を変更（評価ではない） |
| 心の休憩室 | 7つの背景と環境音。何もしなくていい場所。時間の計測や目標はなし |
| 日常生活支援 | 起床・食事・身だしなみ・学校仕事・外出・家事の19項目。小さな行動を一つずつ |
| 気持ちの整理 | 11の気持ちから複数選択。文章は任意。病名推測・点数化なし |
| 気持ちを置いていく場所 | 誰にも見せない書き出し。初期設定は「保存しない」 |
| 気持ちを伝えるカード | 選ぶだけで文章を作り、画面提示・コピー・画像保存・共有 |
| 連絡文をつくる | 欠席・欠勤・断る・延期・病院・相談の8種類。テンプレートのみで生成 |
| 誰かの経験を知る | 体験談と手紙（現在はすべて架空のサンプルと明記） |
| 少しずつ生活に戻る | 外出・復学・受診など6つを小さな段階に。日数や達成率は出さない |
| 支える人へ | 家族・友人・教員・職場の人向け。厚生労働省の公開情報を引用 |
| 相談窓口・緊急時 | すべての画面から1タップ。受付時間・料金・対象・地域・確認日つき |

詳しくは [docs/features.md](docs/features.md) を参照してください。

## はじめかた（開発者向け）

必要なもの：Node.js 20.19 以上（22 推奨）

```bash
npm install        # 依存パッケージのインストール
npm run dev        # 開発サーバー（http://localhost:5173）
npm test           # 単体テスト（Vitest）
npm run build      # 型チェック + 本番ビルド（dist/ に出力）
npm run preview    # ビルド結果の確認（http://localhost:4173）
npm run e2e        # ブラウザでの自動テスト（要 Playwright、build 後に実行）
```

`npm run e2e` には Playwright と Chromium が必要です（`npm i -D playwright && npx playwright install chromium`）。
アイコン画像の再生成は `npm run icons`（同じく Playwright が必要）。

## 技術構成

- React 19 + TypeScript + Vite（ランタイム依存は React のみ）
- ルーティング：ハッシュ方式の自作ルーター（静的ホスティングで追加設定不要）
- 保存：IndexedDB（記録）・localStorage（表示設定）。いずれも端末内のみ
- オフライン：ビルド時に自動生成する Service Worker（Workbox 等は不使用）
- 環境音：Web Audio API でその場で合成（音声ファイルなし）
- 背景イラスト・アイコン：自作の SVG
- セキュリティ：CSP（`<meta>` と `_headers`）、外部リンクは `noopener noreferrer`、`Referrer-Policy: no-referrer`

構成図は [docs/architecture.md](docs/architecture.md) を参照してください。

## ディレクトリ

```
├── index.html                 … エントリ（ビルド時に CSP を埋め込み）
├── public/                    … そのまま配信するファイル（manifest, icons, boot.js, _headers）
├── src/
│   ├── main.tsx / App.tsx     … 起動・画面の切り替え
│   ├── components/            … 共通部品（Layout, ui, Icon, scenes）
│   ├── pages/                 … 各画面
│   ├── data/                  … 支援コンテンツ（文章・相談窓口情報）
│   ├── lib/                   … 設定・保存・音・共有・テンプレート
│   ├── styles/                … CSS（tokens.css が配色の定義）
│   └── sw-template.js         … Service Worker のひな形
├── tests/                     … 単体テスト
├── scripts/                   … e2e テスト・アイコン生成
└── docs/                      … 設計資料・規約案・手順書
```

## ドキュメント

| 資料 | ファイル |
| --- | --- |
| 機能一覧 | [docs/features.md](docs/features.md) |
| システム構成図 | [docs/architecture.md](docs/architecture.md) |
| 画面遷移図 | [docs/screen-flow.md](docs/screen-flow.md) |
| UIデザイン・配色 | [docs/design.md](docs/design.md) |
| データ保存仕様 | [docs/data-storage.md](docs/data-storage.md) |
| プライバシーポリシー案 | [docs/privacy-policy.md](docs/privacy-policy.md) |
| 利用規約案 | [docs/terms.md](docs/terms.md) |
| 無料公開の手順書 | [docs/deploy.md](docs/deploy.md) |
| テスト結果 | [docs/test-results.md](docs/test-results.md) |
| 使用素材とライセンス | [docs/licenses.md](docs/licenses.md) |
| 支援コンテンツの確認状況（管理用） | [docs/content-review.md](docs/content-review.md) |
| 今後の改善点 | [docs/roadmap.md](docs/roadmap.md) |

## 公開前に必ず行うこと

1. **心理・医療の専門家による内容確認**（未確認の文章は [docs/content-review.md](docs/content-review.md) に一覧）
2. **当事者・利用者による操作性の検証**
3. **相談窓口情報の再確認**（受付時間・休止情報は変わります。最終確認日：2026年11月25日）
4. プライバシーポリシー・利用規約の運営者名と連絡先の記入、法的な確認
5. ソースコードのライセンスの決定（未定）
