/**
 * 専門の相談窓口。
 *
 * 掲載内容は、以下の公式ページを 2026年11月25日 に確認したもの。
 * - 厚生労働省「まもろうよ こころ」 https://www.mhlw.go.jp/mamorouyokokoro/
 * - 同「電話相談窓口」 https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel/
 * - 同「SNS相談」 https://www.mhlw.go.jp/mamorouyokokoro/soudan/sns/
 * - NPO法人あなたのいばしょ https://talkme.jp/ （サイトの説明文）
 *
 * 公式ページに記載がない項目は「記載なし」とし、推測で補わない。
 * 情報は変わることがあるため、公開前・定期的に再確認すること（docs/content-review.md）。
 */

export const RESOURCES_CHECKED_AT = '2026年11月25日';

export interface Resource {
  id: string;
  name: string;
  org?: string;
  description?: string;
  contacts: { label: string; href: string; kind: 'tel' | 'web' | 'line' }[];
  hours: string[];
  fee: string;
  target: string;
  region: string;
  notes?: string[];
  /** 一時休止など、利用前に必ず知ってほしい最新の状況 */
  status?: { text: string; source: { label: string; url: string } };
  source: { label: string; url: string };
}

const LIFELINK_PAUSE = {
  text: '運営団体の相談受付ページ（2026年11月25日確認）によると、「#いのちSOS」（電話・メール相談）と「生きづらびっと」（SNS相談）は、システムのセキュリティ対策のため、2026年11月1日から11月末まで相談の受付を一時休止しています。12月以降の予定は、ライフリンクのサイト（lifelink.or.jp）で知らせるとされています。休止中は、ほかの窓口を利用してください。',
  source: { label: 'ライフリンク 相談受付ページの「ご相談受付の一時休止について」', url: 'https://www.lsystem.org/inochi-web' },
};

const TEL_SOURCE = { label: '厚生労働省「まもろうよ こころ」電話相談窓口', url: 'https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel/' };
const SNS_SOURCE = { label: '厚生労働省「まもろうよ こころ」SNS相談', url: 'https://www.mhlw.go.jp/mamorouyokokoro/soudan/sns/' };
const REGION_NATIONAL = '記載なし（厚生労働省の相談窓口一覧に掲載）';

export const TEL_RESOURCES: Resource[] = [
  {
    id: 'inochi-sos',
    name: '#いのちSOS',
    org: '特定非営利活動法人 自殺対策支援センターライフリンク',
    description: '「死にたい」「消えたい」「生きることに疲れた」などの気持ちを、専門の相談員が受け止め、状況を一緒に整理し、必要な支援策などを一緒に考えます。（公式ページの説明より）',
    contacts: [{ label: '0120-061-338', href: 'tel:0120061338', kind: 'tel' }],
    hours: ['24時間 365日（厚生労働省のページの記載。下の休止のお知らせもご確認ください）'],
    fee: 'フリーダイヤル・無料',
    target: '記載なし',
    region: REGION_NATIONAL,
    status: LIFELINK_PAUSE,
    source: TEL_SOURCE,
  },
  {
    id: 'yorisoi',
    name: 'よりそいホットライン',
    org: '一般社団法人 社会的包摂サポートセンター',
    description: 'ガイダンスで専門的な対応も選べます（外国語含む）。（公式ページの説明より）',
    contacts: [
      { label: '0120-279-338', href: 'tel:0120279338', kind: 'tel' },
      { label: '福島県から 0120-279-226', href: 'tel:0120279226', kind: 'tel' },
      { label: 'IP電話（050）から 050-3655-0279', href: 'tel:05036550279', kind: 'tel' },
    ],
    hours: ['24時間対応'],
    fee: 'フリーダイヤル・無料（050で始まるIP電話用の番号の料金は記載なし）',
    target: '記載なし',
    region: '記載なし（福島県からは専用の番号）',
    source: TEL_SOURCE,
  },
  {
    id: 'inochinodenwa-free',
    name: 'いのちの電話（フリーダイヤル）',
    org: '一般社団法人 日本いのちの電話連盟',
    contacts: [
      { label: '0120-783-556', href: 'tel:0120783556', kind: 'tel' },
      { label: 'IP電話から 03-6634-7830（通話料有料）', href: 'tel:0366347830', kind: 'tel' },
    ],
    hours: ['毎日16時から21時まで', '毎月10日午前8時から翌日午前8時まで'],
    fee: 'フリーダイヤル・無料（IP電話用の番号は通話料有料）',
    target: '記載なし',
    region: REGION_NATIONAL,
    notes: ['全国のいのちの電話の一覧は、日本いのちの電話連盟のサイトで見られます。'],
    source: TEL_SOURCE,
  },
  {
    id: 'inochinodenwa-navi',
    name: 'いのちの電話（ナビダイヤル）',
    org: '一般社団法人 日本いのちの電話連盟',
    contacts: [{ label: '0570-783-556', href: 'tel:0570783556', kind: 'tel' }],
    hours: ['午前10時から午後10時まで（ナビダイヤル受付センターに順次つながります）'],
    fee: '通話料がかかります（電話会社の通話料割引サービスや、携帯電話の料金定額プランの無料通信は適用されません）',
    target: '記載なし',
    region: REGION_NATIONAL,
    source: TEL_SOURCE,
  },
  {
    id: 'kokoro-dial',
    name: 'こころの健康相談統一ダイヤル',
    description: '電話をかけた所在地の都道府県・政令指定都市が実施している「こころの健康電話相談」等の公的な相談機関につながります。（公式ページの説明より）',
    contacts: [{ label: '0570-064-556', href: 'tel:0570064556', kind: 'tel' }],
    hours: ['相談対応の曜日・時間は都道府県によって異なります'],
    fee: '通話料がかかります（電話会社の通話料割引サービスや、携帯電話の料金定額プランの無料通信は適用されません）',
    target: '記載なし',
    region: '電話をかけた所在地の都道府県・政令指定都市の窓口につながります',
    notes: ['050で始まるIP電話からは接続できません。各都道府県・政令指定都市の窓口の番号は、厚生労働省のページで確認できます。'],
    source: TEL_SOURCE,
  },
  {
    id: 'childline',
    name: 'チャイルドライン',
    org: '特定非営利活動法人 チャイルドライン支援センター',
    contacts: [
      { label: '0120-99-7777', href: 'tel:0120997777', kind: 'tel' },
      { label: 'チャット相談', href: 'https://childline.or.jp/chat', kind: 'web' },
    ],
    hours: ['電話：毎日 午後4時から午後9時', 'チャット：月曜日から土曜日 16時から21時', '12月29日〜1月3日は相談受付休止'],
    fee: '電話はフリーダイヤル・無料',
    target: '18歳までの子ども',
    region: REGION_NATIONAL,
    notes: ['050で始まるIP電話などからは接続できない場合があります。'],
    source: TEL_SOURCE,
  },
  {
    id: 'kodomo-sos',
    name: '24時間子供SOSダイヤル',
    org: '文部科学省',
    description: 'いじめやその他のこどものSOS全般について、夜間・休日を含めて24時間いつでも相談できます。（公式ページの説明より）',
    contacts: [{ label: '0120-0-78310', href: 'tel:0120078310', kind: 'tel' }],
    hours: ['24時間対応'],
    fee: 'フリーダイヤル・無料',
    target: 'こども',
    region: '電話をかけた所在地の教育委員会の相談機関につながります',
    notes: ['一部のIP電話などからは接続できない場合があります。'],
    source: TEL_SOURCE,
  },
  {
    id: 'kodomo-jinken',
    name: 'こどもの人権110番',
    org: '法務省',
    description: '法務局・地方法務局の職員、または人権擁護委員が話を聞き、どうしたらいいか一緒に考えます。相談は無料、相談内容の秘密は守られます。（公式ページの説明より）',
    contacts: [{ label: '0120-007-110', href: 'tel:0120007110', kind: 'tel' }],
    hours: ['平日 午前8時30分から午後5時15分まで'],
    fee: 'フリーダイヤル・無料',
    target: 'こども',
    region: REGION_NATIONAL,
    notes: ['一部のIP電話などからは接続できない場合があります。'],
    source: TEL_SOURCE,
  },
];

export const SNS_RESOURCES: Resource[] = [
  {
    id: 'anatano-ibasho',
    name: 'あなたのいばしょ チャット相談',
    org: '特定非営利活動法人 あなたのいばしょ',
    description: '24時間365日、年齢や性別を問わず、誰でも無料・匿名で利用できるチャット相談窓口です。（公式ページの説明より）',
    contacts: [{ label: 'あなたのいばしょ（talkme.jp）', href: 'https://talkme.jp/', kind: 'web' }],
    hours: ['24時間365日'],
    fee: '無料',
    target: '年齢や性別を問わず誰でも',
    region: '記載なし',
    notes: ['匿名で利用できると記載されています。'],
    source: { label: 'NPO法人あなたのいばしょ／厚生労働省「まもろうよ こころ」SNS相談', url: 'https://talkme.jp/' },
  },
  {
    id: 'ikizurabit',
    name: '生きづらびっと',
    org: '特定非営利活動法人 自殺対策支援センターライフリンク',
    description: 'SNSやチャットによる自殺防止の相談を行い、必要に応じて電話や対面による支援や居場所活動等へのつなぎも行います。（公式ページの説明より）',
    contacts: [
      { label: 'LINEで相談（友だち追加）', href: 'https://line.me/R/ti/p/%40eds9972b', kind: 'line' },
      { label: 'Webフォームで相談', href: 'https://www.lsystem.org/inochi-web', kind: 'web' },
      { label: '生きづらびっと ホームページ', href: 'https://yorisoi-chat.jp/', kind: 'web' },
    ],
    hours: ['月・金 6時〜22時30分（受付は22時まで）', '日・火・水・木・土 8時〜22時30分（受付は22時まで）', '（厚生労働省のページの記載。下の休止のお知らせもご確認ください）'],
    status: LIFELINK_PAUSE,
    fee: '記載なし',
    target: '記載なし（SNS相談は年齢や性別を問わず利用できると案内されています）',
    region: REGION_NATIONAL,
    source: SNS_SOURCE,
  },
  {
    id: 'kokoro-hotchat',
    name: 'こころのほっとチャット',
    org: '特定非営利活動法人 東京メンタルヘルス・スクエア',
    description: '主要SNS（LINE、Facebook）およびウェブチャットから、年齢・性別を問わず相談に応じます。（公式ページの説明より）',
    contacts: [
      { label: 'LINEで相談（友だち追加）', href: 'https://line.me/R/ti/p/%40tch1397q', kind: 'line' },
      { label: 'ウェブチャットの案内', href: 'https://www.npo-tms.or.jp/public/kokoro_hotchat/', kind: 'web' },
    ],
    hours: ['毎日 7時から23時50分（23時まで受付）'],
    fee: '記載なし',
    target: '年齢・性別を問わず',
    region: REGION_NATIONAL,
    source: SNS_SOURCE,
  },
  {
    id: 'bond',
    name: '10代20代の女性のためのLINE相談',
    org: '特定非営利活動法人 BONDプロジェクト',
    contacts: [{ label: 'LINEで相談（友だち追加）', href: 'https://line.me/R/ti/p/%40ahl0608p', kind: 'line' }],
    hours: ['毎週 月曜日・水曜日・金曜日・土曜日・日曜日', '14時から22時（21時30分まで受付）'],
    fee: '記載なし',
    target: '10代〜20代の女性',
    region: REGION_NATIONAL,
    source: SNS_SOURCE,
  },
];

export const INFO_SITES = [
  {
    name: '厚生労働省「まもろうよ こころ」',
    description: '悩みや不安を抱えて困っているときに相談できる、電話・SNSの窓口などを紹介している厚生労働省のサイトです。',
    url: 'https://www.mhlw.go.jp/mamorouyokokoro/',
  },
  {
    name: '厚生労働省「SNS相談窓口」',
    description: 'LINEなどのSNSやチャットで相談できる団体の一覧です。',
    url: 'https://www.mhlw.go.jp/mamorouyokokoro/soudan/sns/',
  },
  {
    name: 'NPO法人あなたのいばしょ',
    description: '24時間365日、無料・匿名で利用できるチャット相談窓口です。',
    url: 'https://talkme.jp/',
  },
];
