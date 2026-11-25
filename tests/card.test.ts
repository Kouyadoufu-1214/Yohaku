import { describe, expect, it } from 'vitest';
import { CARD_PHRASES, RECIPIENTS, buildCardText } from '../src/data/card';
import { wrapText } from '../src/lib/cardImage';

describe('意思伝達カード', () => {
  it('仕様にある8つの選択肢と6つの相手を含む', () => {
    const texts = CARD_PHRASES.map((p) => p.polite);
    for (const s of [
      '今はうまく話せません。',
      '理由を説明することが難しいです。',
      'そばにいてほしいです。',
      '少し一人にしてほしいです。',
      'アドバイスよりも、話を聞いてほしいです。',
      '今は返事をする余裕がありません。',
      '一緒に病院へ行ってほしいです。',
      '助けてほしいですが、何をしてほしいかわかりません。',
    ]) {
      expect(texts).toContain(s);
    }
    const labels = RECIPIENTS.map((r) => r.label);
    for (const l of ['家族', '友人', '恋人', '教員', '上司', '医療従事者']) expect(labels).toContain(l);
  });

  it('何も選ばないと空になる', () => {
    expect(buildCardText([], 'family', true)).toBe('');
  });

  it('家族にはくだけた言い方、上司にはていねいな言い方になる', () => {
    expect(buildCardText(['cant-talk'], 'family', false)).toBe('今はうまく話せない。');
    expect(buildCardText(['cant-talk'], 'boss', false)).toBe('今はうまく話せません。');
  });

  it('あいさつを入れると、はじめと終わりの文がつく', () => {
    const t = buildCardText(['stay', 'listen'], 'teacher', true);
    const lines = t.split('\n');
    expect(lines[0]).toContain('先生へ');
    expect(lines.at(-1)).toContain('ありがとうございます');
  });
});

describe('画像用の折り返し', () => {
  const measure = (s: string) => Array.from(s).length * 10;
  it('幅に合わせて折り返す', () => {
    expect(wrapText('あいうえおかきくけこ', 50, measure)).toEqual(['あいうえお', 'かきくけこ']);
  });
  it('句読点を行頭に置かない', () => {
    const lines = wrapText('あいうえお。かきくけ', 50, measure);
    expect(lines[0]).toBe('あいうえお。');
    expect(lines.every((l) => !l.startsWith('。'))).toBe(true);
  });
  it('改行と空行を保つ', () => {
    expect(wrapText('あ\n\nい', 100, measure)).toEqual(['あ', '', 'い']);
  });
});
