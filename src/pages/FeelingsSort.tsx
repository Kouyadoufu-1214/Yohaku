import { useId, useState } from 'react';
import { PageHeader, MultiChoice, Button, ButtonLink, Notice, useAnnounce, Section, useFocusTitleOnChange } from '../components/ui';
import { FEELINGS, feelingLabel } from '../data/feelings';
import { useSettings } from '../lib/settings';
import { newId, putRecord } from '../lib/db';
import { href } from '../lib/router';

type Step = 'select' | 'reflect' | 'done';

export function FeelingsSort() {
  const { settings } = useSettings();
  const announce = useAnnounce();
  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [writing, setWriting] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const noteId = useId();
  const minimal = settings.mode === 'minimal';
  useFocusTitleOnChange(step);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const restart = () => {
    setSelected([]);
    setNote('');
    setWriting(false);
    setSaved(false);
    setError('');
    setStep('select');
  };

  const finishWithoutSaving = () => {
    setNote('');
    setStep('done');
  };

  const save = async () => {
    setError('');
    try {
      await putRecord('feelings', { id: newId(), createdAt: Date.now(), feelings: selected, note: note.trim() });
      setSaved(true);
      setNote('');
      setStep('done');
      announce('この端末に保存しました');
    } catch {
      setError('保存できませんでした。このブラウザでは端末内の保存が使えない設定になっている可能性があります。');
    }
  };

  if (step === 'done') {
    return (
      <div>
        <PageHeader title="気持ちの整理" back="/feelings" backLabel="気持ち" />
        <div className="gentle-card">
          <p className="gentle-card__main">ここまでで大丈夫です。</p>
          <p className="muted">{saved ? '選んだ気持ちを、この端末にだけ保存しました。' : '何も保存していません。選んだ気持ちは、どこにも残りません。'}</p>
          <div className="actions">
            <ButtonLink to="/rest" icon="rest" variant="primary">
              休憩室で休む
            </ButtonLink>
            <ButtonLink to="/card" icon="card">
              誰かに伝える
            </ButtonLink>
            <button type="button" className="btn btn--quiet" onClick={restart}>
              <span>もう一度整理する</span>
            </button>
          </div>
        </div>
        <p className="muted small">
          ひとりで抱えきれないと感じたら、<a href={href('/help')}>相談窓口</a>もあります。
        </p>
      </div>
    );
  }

  if (step === 'reflect') {
    const items = FEELINGS.filter((f) => selected.includes(f.id));
    return (
      <div>
        <PageHeader title="気持ちの整理" back="/feelings" backLabel="気持ち" />
        <div className="reflect">
          {items.length > 0 ? (
            <>
              <p className="reflect__lead">
                今は「{items.map((f) => f.label).join('」「')}」があるのですね。
              </p>
              <ul className="reflect__list">
                {items.map((f) => (
                  <li key={f.id}>
                    <p className="reflect__label">{f.label}</p>
                    <p>{f.words}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="reflect__lead">選ばなくても大丈夫です。気持ちに名前がつかないときもあります。</p>
          )}
          {note.trim() && !minimal && (
            <div className="reflect__note">
              <p className="reflect__label">書いたこと</p>
              <p className="pre-wrap">{note}</p>
            </div>
          )}
          <p className="muted small">これは診断や評価ではありません。点数もつけません。</p>
        </div>

        <Section title="終わり方を選ぶ">
          {settings.saveMode === 'ask' ? (
            <>
              <p className="muted small">保存しないのが基本です。保存すると、この端末のブラウザの中にだけ残ります（暗号化はされません）。</p>
              <div className="actions">
                <Button variant="primary" onClick={finishWithoutSaving}>
                  保存せずに終える
                </Button>
                <Button icon="save" onClick={save}>
                  この端末に保存する
                </Button>
                <Button variant="quiet" onClick={() => setStep('select')}>
                  選び直す
                </Button>
              </div>
              {error && <p className="error" role="alert">{error}</p>}
            </>
          ) : (
            <>
              <p className="muted small">保存機能は設定でオフになっています。何も保存されません。</p>
              <div className="actions">
                <Button variant="primary" onClick={finishWithoutSaving}>
                  終える
                </Button>
                <Button variant="quiet" onClick={() => setStep('select')}>
                  選び直す
                </Button>
              </div>
            </>
          )}
        </Section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="気持ちの整理"
        back="/feelings"
        backLabel="気持ち"
        lead={<p>近いと思う気持ちを、いくつでも選んでください。文章を書かなくても大丈夫です。</p>}
      />
      <MultiChoice
        legend="今の気持ち（いくつでも）"
        values={selected}
        options={FEELINGS.map((f) => ({ value: f.id, label: f.label }))}
        onToggle={toggle}
      />
      {selected.length > 0 && (
        <p className="muted small" aria-live="polite">
          選んでいる気持ち：{selected.map(feelingLabel).join('、')}
        </p>
      )}

      {!minimal && (
        <div className="optional-writing">
          {writing ? (
            <div className="field">
              <label htmlFor={noteId}>書きたいことがあれば（任意）</label>
              <textarea id={noteId} rows={5} value={note} onChange={(e) => setNote(e.target.value)} maxLength={4000} />
              <p className="field__hint">書いた内容は、保存を選ばない限りどこにも残りません。</p>
            </div>
          ) : (
            <Button variant="quiet" onClick={() => setWriting(true)}>
              書きたいことがあれば（任意）
            </Button>
          )}
        </div>
      )}

      <div className="actions">
        <Button variant="primary" onClick={() => setStep('reflect')}>
          次へ
        </Button>
        <ButtonLink to="/feelings" variant="quiet">
          やめる
        </ButtonLink>
      </div>
      <Notice>
        <p>選んだ気持ちから、病名を推測したり、点数をつけたりすることはありません。</p>
      </Notice>
    </div>
  );
}
