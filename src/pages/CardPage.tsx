import { useEffect, useId, useRef, useState } from 'react';
import { PageHeader, Choice, Switch, Button, Notice, Section, useAnnounce } from '../components/ui';
import { Icon } from '../components/Icon';
import { CARD_PHRASES, RECIPIENTS, buildCardText, type Recipient } from '../data/card';
import { useSettings } from '../lib/settings';
import { copyText, canShareText, shareText, shareFile, downloadBlob, dateStamp } from '../lib/share';
import { renderCardImage } from '../lib/cardImage';

/** 画像は相手に見せるものなので、テーマにかかわらず読みやすい明るい配色で作る */
const IMAGE_COLORS = { background: '#F4F2ED', text: '#2B3730', muted: '#4F5D55', line: '#7C9485' };

export function CardPage() {
  const { settings } = useSettings();
  const announce = useAnnounce();
  const minimal = settings.mode === 'minimal';
  const [phrases, setPhrases] = useState<string[]>([]);
  const [recipient, setRecipient] = useState<Recipient>('none');
  const [withFrame, setWithFrame] = useState(true);
  const [editedText, setEditedText] = useState('');
  const [edited, setEdited] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const textId = useId();

  const generated = buildCardText(phrases, recipient, withFrame && !minimal);
  // 書きかえるまでは、選んだ内容から作った文章をそのまま表示する
  const text = edited ? editedText : generated;

  const toggle = (id: string) => setPhrases((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const hasText = text.trim() !== '';

  const onCopy = async () => {
    announce((await copyText(text)) ? 'コピーしました' : 'コピーできませんでした。文章を長押しして選択してください');
  };

  const onImage = async () => {
    try {
      const blob = await renderCardImage(text, IMAGE_COLORS);
      downloadBlob(blob, `yohaku-card-${dateStamp()}.png`);
      announce('画像を保存しました');
    } catch {
      announce('画像を作成できませんでした');
    }
  };

  const onShare = async () => {
    const r = await shareText(text);
    if (r === 'unsupported') announce('この端末では共有機能が使えません。コピーして使ってください');
    else if (r === 'failed') announce('共有できませんでした');
  };

  const onShareImage = async () => {
    try {
      const blob = await renderCardImage(text, IMAGE_COLORS);
      const file = new File([blob], `yohaku-card-${dateStamp()}.png`, { type: 'image/png' });
      const r = await shareFile(file);
      if (r === 'unsupported') {
        downloadBlob(blob, file.name);
        announce('この端末では画像の共有ができないため、画像を保存しました');
      } else if (r === 'failed') announce('共有できませんでした');
    } catch {
      announce('画像を作成できませんでした');
    }
  };

  return (
    <div>
      <PageHeader
        title="気持ちを伝えるカード"
        lead={<p>うまく話せないときに、画面を見せて伝えるためのカードです。選んだ内容が勝手に送られることはありません。</p>}
      />

      <fieldset className="choice">
        <legend>伝えたいこと（いくつでも）</legend>
        <div className="phrase-list">
          {CARD_PHRASES.map((p) => {
            const checked = phrases.includes(p.id);
            return (
              <label key={p.id} className={`phrase${checked ? ' is-checked' : ''}`}>
                <input type="checkbox" checked={checked} onChange={() => toggle(p.id)} />
                <span className="phrase__mark" aria-hidden="true">
                  <Icon name="check" size={18} />
                </span>
                <span>{p.polite}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {!minimal && (
        <>
          <Choice<Recipient>
            legend="伝える相手"
            hint="相手に合わせて、言い方を少し変えます。"
            value={recipient}
            onChange={setRecipient}
            chips
            options={RECIPIENTS.map((r) => ({ value: r.id, label: r.label }))}
          />
          <Switch label="はじめと終わりのあいさつを入れる" checked={withFrame} onChange={setWithFrame} />
        </>
      )}

      <div className="field">
        <label htmlFor={textId}>伝える文章（書きかえられます）</label>
        <textarea
          id={textId}
          rows={7}
          value={text}
          placeholder="上から伝えたいことを選ぶと、ここに文章ができます。"
          onChange={(e) => {
            setEditedText(e.target.value);
            setEdited(true);
          }}
          maxLength={2000}
        />
        {edited && (
          <button
            type="button"
            className="btn btn--quiet btn--small"
            onClick={() => setEdited(false)}
          >
            <Icon name="refresh" size={18} />
            <span>選んだ内容で作り直す</span>
          </button>
        )}
      </div>

      <div className="actions">
        <Button variant="primary" icon="expand" onClick={() => setPresenting(true)} disabled={!hasText}>
          画面に大きく表示する
        </Button>
        <Button icon="copy" onClick={onCopy} disabled={!hasText}>
          コピー
        </Button>
        {!minimal && (
          <Button icon="image" onClick={onImage} disabled={!hasText}>
            画像として保存
          </Button>
        )}
        {canShareText() && (
          <Button icon="share" onClick={onShare} disabled={!hasText}>
            共有
          </Button>
        )}
        {canShareText() && !minimal && (
          <Button icon="share" onClick={onShareImage} disabled={!hasText}>
            画像で共有
          </Button>
        )}
      </div>

      {!minimal && (
        <Section>
          <Notice>
            <p>「共有」を押すと、端末の共有画面が開きます。送る相手やアプリは、あなたが選びます。このアプリが自動で送ることはありません。</p>
            <p>電話やメッセージが難しいときは、文章を短くするだけでも伝わることがあります。</p>
          </Notice>
        </Section>
      )}

      {presenting && <PresentCard text={text} onClose={() => setPresenting(false)} />}
    </div>
  );
}

function PresentCard({ text, onClose }: { text: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState(1);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    }
  }, []);
  return (
    <dialog
      ref={ref}
      className="present"
      aria-label="伝えたいこと"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="present__controls">
        <button type="button" className="btn btn--secondary btn--small" onClick={() => setSize((s) => Math.max(0.8, s - 0.2))} aria-label="文字を小さくする">
          <span aria-hidden="true">小</span>
        </button>
        <button type="button" className="btn btn--secondary btn--small" onClick={() => setSize((s) => Math.min(2, s + 0.2))} aria-label="文字を大きくする">
          <span aria-hidden="true">大</span>
        </button>
        <button type="button" className="btn btn--primary btn--small" onClick={onClose} autoFocus>
          <Icon name="close" size={18} />
          <span>閉じる</span>
        </button>
      </div>
      <div className="present__text pre-wrap" style={{ fontSize: `${1.6 * size}rem` }}>
        {text}
      </div>
    </dialog>
  );
}
