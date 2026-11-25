# 画面遷移図

URL はハッシュ形式（例：`https://…/#/life/wake/futon`）です。
**ヘッダーの「相談窓口」（`#/help`）と下部ナビゲーションは、休憩室の全画面表示中を除くすべての画面に表示** されます（全画面表示中も「相談窓口」ボタンは表示）。

```mermaid
flowchart TB
  Home["ホーム #/<br/>今、どう過ごしたいですか？"]

  Home --> Rest["心の休憩室 #/rest"]
  Rest --> Immersive["全画面表示"]
  Immersive -->|表示を戻す / Esc| Rest

  Home --> Together["そばにいてほしい #/together"]
  Together --> Help
  Together --> Card
  Together --> MsgConsult["連絡文（相談） #/message?type=consult"]
  Together --> Stories

  Home --> Life["日常生活支援 #/life"]
  Life --> LifeCat["カテゴリ #/life/:category"]
  LifeCat --> LifeItem["項目 #/life/:category/:item<br/>小さな行動を一つずつ"]
  LifeItem -->|今はしない| Rest
  LifeItem --> Message
  LifeItem --> StepPlan
  Life --> Steps["少しずつ戻る #/steps"]
  Steps --> StepPlan["計画 #/steps/:id"]
  Life --> Small["少しだけ何か #/small"]

  Home --> Sort["気持ちの整理 #/feelings/sort"]
  Sort -->|選ぶ → 次へ| Reflect["受け止めのことば"]
  Reflect -->|保存せずに終える / 保存する| Done["終わり"]
  Done --> Rest
  Done --> Card

  Home --> Card["気持ちを伝えるカード #/card"]
  Card --> Present["画面に大きく表示"]

  Home --> Stories["誰かの経験 #/stories"]
  Stories --> Story["体験談・手紙 #/stories/:id"]

  Home --> Help["相談窓口・緊急時 #/help"]
  Help -->|tel: / 外部リンク| External(("電話・外部サイト"))

  Feelings["気持ち #/feelings"] --> Sort
  Feelings --> Leave["置いていく場所 #/feelings/leave"]
  Feelings --> Card
  Feelings --> Message["連絡文 #/message"]
  Feelings --> Records["保存した記録 #/feelings/records"]
  Records -->|開く ?id=| Leave

  Settings["設定 #/settings"] --> Privacy["プライバシーポリシー #/privacy"]
  Settings --> Terms["利用規約 #/terms"]
  Settings --> About["余白。について #/about"]
  Settings --> Supporters["支える人へ #/supporters"]
  Supporters --> Help
```

## 下部ナビゲーションと現在地

| ナビ | 現在地として扱う画面 |
| --- | --- |
| ホーム | `#/` |
| 休憩 | `#/rest` |
| 生活支援 | `#/life/*`, `#/steps/*`, `#/small` |
| 気持ち | `#/feelings/*`, `#/card`, `#/message` |
| 設定 | `#/settings`, `#/privacy`, `#/terms`, `#/about` |

## 表示モード別のホーム

| 最小 | 標準 | 全機能 |
| --- | --- | --- |
| 静かに過ごしたい | 8つすべて | 8つすべて |
| 誰かにそばにいてほしい | ＋ 伝えるカード / 相談窓口・緊急時 | ＋ 伝えるカード / 相談窓口・緊急時 |
| 日常生活がつらい | | ＋ ほかの機能（連絡文・置いていく・生活に戻る・記録・支える人・設定） |
| 気持ちをうまく伝えられない | | |
| 相談先を探したい | | |

## 存在しない URL

`#/does-not-exist` などは「ページが見つかりませんでした」を表示し、ホームと相談窓口へのボタンを出します。
