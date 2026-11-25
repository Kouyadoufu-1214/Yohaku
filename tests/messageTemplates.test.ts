import { describe, expect, it } from 'vitest';
import {
  MESSAGE_TYPES,
  defaultOptions,
  generateMessage,
  messageToText,
  type Length,
  type MessageType,
  type Politeness,
  type Reason,
} from '../src/lib/messageTemplates';

const POLITENESS: Politeness[] = ['formal', 'polite', 'casual'];
const LENGTHS: Length[] = ['short', 'normal', 'long'];
const REASONS: Reason[] = ['health', 'mind', 'circumstance', 'none'];

describe('連絡文テンプレート', () => {
  it('すべての組み合わせで、空でなく不自然な文字列を含まない文章ができる', () => {
    for (const t of MESSAGE_TYPES) {
      for (const politeness of POLITENESS) {
        for (const length of LENGTHS) {
          for (const reason of REASONS) {
            for (const when of ['today', 'tomorrow', 'custom'] as const) {
              const m = generateMessage({ ...defaultOptions(t.id), politeness, length, reason, when });
              expect(m.body.trim().length, `${t.id}/${politeness}/${length}/${reason}`).toBeGreaterThan(10);
              expect(m.body).not.toMatch(/undefined|null|NaN|\[object/);
              expect(m.body).not.toMatch(/、、|。。|、。/);
              expect(m.body).not.toMatch(/\n{3,}/);
              if (t.hasSubject) expect(m.subject, t.id).toBeTruthy();
            }
          }
        }
      }
    }
  });

  it('「理由は書かない」を選ぶと体調や事情に触れない', () => {
    for (const t of MESSAGE_TYPES.filter((x) => x.usesReason)) {
      for (const politeness of POLITENESS) {
        const m = generateMessage({ ...defaultOptions(t.id), reason: 'none', politeness });
        expect(m.body).not.toMatch(/体調|心身|事情|調子/);
      }
    }
  });

  it('病名を書かせない（病名に当たる語を出力しない）', () => {
    for (const t of MESSAGE_TYPES) {
      for (const reason of REASONS) {
        const m = generateMessage({ ...defaultOptions(t.id), reason, length: 'long' });
        expect(m.body).not.toMatch(/うつ|鬱|障害|病名|診断/);
      }
    }
  });

  it('名前が空欄のときは「○○」で示し、入力されたときはその名前を使う', () => {
    const empty = generateMessage(defaultOptions('university'));
    expect(empty.body).toContain('○○先生');
    const named = generateMessage({ ...defaultOptions('university'), recipient: '山田先生', sender: '佐藤', className: '心理学概論', studentId: 'A123' });
    expect(named.body).toContain('山田先生');
    expect(named.body).toContain('佐藤');
    expect(named.body).toContain('心理学概論');
    expect(named.subject).toContain('A123');
  });

  it('学校：保護者からの連絡では子どもの名前を主語にする', () => {
    const m = generateMessage({ ...defaultOptions('school'), relation: 'guardian', studentName: '花子', sender: '山田', className: '2年3組' });
    expect(m.body).toContain('花子は本日');
    expect(m.body).toContain('保護者');
  });

  it('入力欄の改行は1行にまとめられる', () => {
    const m = generateMessage({ ...defaultOptions('parttime'), sender: '佐藤\n\n太郎' });
    expect(m.body).toContain('佐藤 太郎');
  });

  it('病院：電話メモ形式を作れる', () => {
    const m = generateMessage({ ...defaultOptions('hospital'), format: 'phone' });
    expect(m.body).toContain('電話で話すときのメモ');
    expect(m.body).toContain('うまく話せなくてすみません');
  });

  it('相談：してほしいことが文章に反映される', () => {
    const wishes = ['listen', 'together', 'hospital', 'know', 'noreply'] as const;
    const bodies = wishes.map((wish) => generateMessage({ ...defaultOptions('consult'), wish }).body);
    expect(new Set(bodies).size).toBe(wishes.length);
  });

  it('件名つきでコピー用の文章にまとめられる', () => {
    const m = generateMessage(defaultOptions('work'));
    expect(messageToText(m, m.subject ?? '', m.body)).toMatch(/^件名：/);
    const n = generateMessage(defaultOptions('decline'));
    expect(messageToText(n, '', n.body)).toBe(n.body);
  });

  it('すべての種類に既定のていねいさがある', () => {
    const ids: MessageType[] = ['school', 'university', 'parttime', 'work', 'decline', 'postpone', 'hospital', 'consult'];
    for (const id of ids) expect(defaultOptions(id).politeness).toMatch(/formal|polite|casual/);
  });
});
