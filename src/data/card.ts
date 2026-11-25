/**
 * 意思伝達カード。選択肢から文章を作る（外部送信はしない）。
 */

export interface CardPhrase {
  id: string;
  polite: string;
  casual: string;
}

export const CARD_PHRASES: CardPhrase[] = [
  { id: 'cant-talk', polite: '今はうまく話せません。', casual: '今はうまく話せない。' },
  { id: 'cant-explain', polite: '理由を説明することが難しいです。', casual: '理由を説明するのが難しい。' },
  { id: 'stay', polite: 'そばにいてほしいです。', casual: 'そばにいてほしい。' },
  { id: 'alone', polite: '少し一人にしてほしいです。', casual: '少し一人にしてほしい。' },
  { id: 'listen', polite: 'アドバイスよりも、話を聞いてほしいです。', casual: 'アドバイスよりも、話を聞いてほしい。' },
  { id: 'no-reply', polite: '今は返事をする余裕がありません。', casual: '今は返事をする余裕がない。' },
  { id: 'hospital', polite: '一緒に病院へ行ってほしいです。', casual: '一緒に病院へ行ってほしい。' },
  { id: 'help', polite: '助けてほしいですが、何をしてほしいかわかりません。', casual: '助けてほしいけど、何をしてほしいかわからない。' },
  { id: 'no-blame', polite: '責めないでいてもらえると助かります。', casual: '責めないでいてくれると助かる。' },
  { id: 'later', polite: '落ち着いたら、自分から連絡します。', casual: '落ち着いたら、自分から連絡するね。' },
];

export type Recipient = 'none' | 'family' | 'friend' | 'partner' | 'teacher' | 'boss' | 'medical';

export interface RecipientInfo {
  id: Recipient;
  label: string;
  casual: boolean;
  opening: string;
  closing: string;
}

export const RECIPIENTS: RecipientInfo[] = [
  { id: 'none', label: '選ばない', casual: false, opening: 'うまく話せないので、画面でお伝えします。', closing: '読んでくださり、ありがとうございます。' },
  { id: 'family', label: '家族', casual: true, opening: 'うまく言えないから、画面で伝えるね。', closing: '読んでくれてありがとう。' },
  { id: 'friend', label: '友人', casual: true, opening: 'うまく言えないから、画面で伝えるね。', closing: '読んでくれてありがとう。' },
  { id: 'partner', label: '恋人', casual: true, opening: 'うまく言えないから、画面で伝えるね。', closing: '読んでくれてありがとう。' },
  { id: 'teacher', label: '教員', casual: false, opening: '先生へ。うまくお話しできないため、画面でお伝えします。', closing: '読んでくださり、ありがとうございます。' },
  { id: 'boss', label: '上司', casual: false, opening: 'お伝えしたいことがあり、画面でお見せしています。', closing: '読んでくださり、ありがとうございます。' },
  { id: 'medical', label: '医療従事者', casual: false, opening: 'うまく説明できないため、画面でお伝えします。', closing: '読んでくださり、ありがとうございます。' },
];

export function buildCardText(phraseIds: string[], recipient: Recipient, withFrame: boolean): string {
  const r = RECIPIENTS.find((x) => x.id === recipient) ?? RECIPIENTS[0];
  const phrases = CARD_PHRASES.filter((p) => phraseIds.includes(p.id)).map((p) => (r.casual ? p.casual : p.polite));
  if (phrases.length === 0) return '';
  const parts: string[] = [];
  if (withFrame) parts.push(r.opening, '');
  parts.push(...phrases);
  if (withFrame) parts.push('', r.closing);
  return parts.join('\n');
}
