import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { PageHeader, Choice, Switch, Button, Notice, useAnnounce, Section } from '../components/ui';
import { Icon } from '../components/Icon';
import {
  MESSAGE_TYPES,
  REASON_LABELS,
  defaultOptions,
  generateMessage,
  messageToText,
  typeInfo,
  type Length,
  type MessageOptions,
  type MessageType,
  type Politeness,
  type Reason,
  type When,
} from '../lib/messageTemplates';
import { useSettings } from '../lib/settings';
import { copyText, canShareText, shareText } from '../lib/share';
import { queryParam } from '../lib/router';

const INSTITUTION: MessageType[] = ['school', 'university', 'parttime', 'work', 'hospital'];

function politenessOptions(type: MessageType): { value: Politeness; label: string }[] {
  if (INSTITUTION.includes(type)) {
    return [
      { value: 'formal', label: 'とてもていねい' },
      { value: 'polite', label: 'ていねい' },
      { value: 'casual', label: 'やわらかめ' },
    ];
  }
  return [
    { value: 'formal', label: 'かしこまった' },
    { value: 'polite', label: 'ていねい' },
    { value: 'casual', label: '親しい相手向け' },
  ];
}

function readType(): MessageType | null {
  const t = queryParam('type');
  return MESSAGE_TYPES.some((m) => m.id === t) ? (t as MessageType) : null;
}

function TextField({ label, value, onChange, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} maxLength={80} autoComplete="off" />
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export function MessagePage() {
  const { settings } = useSettings();
  const announce = useAnnounce();
  const minimal = settings.mode === 'minimal';
  const [type, setType] = useState<MessageType | null>(readType);
  const [opts, setOpts] = useState<MessageOptions>(() => defaultOptions(readType() ?? 'school'));
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [edited, setEdited] = useState(false);
  const subjectId = useId();
  const bodyId = useId();

  // 同じ画面のまま ?type= が変わった場合にも対応
  useEffect(() => {
    const onHash = () => {
      const t = readType();
      if (t) chooseType(t);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const generated = useMemo(() => generateMessage(opts), [opts]);
  // 書きかえるまでは、選んだ内容から作った文章をそのまま表示する
  const subject = edited ? editedSubject : (generated.subject ?? '');
  const body = edited ? editedBody : generated.body;
  const startEditing = () => {
    if (!edited) {
      setEditedSubject(generated.subject ?? '');
      setEditedBody(generated.body);
      setEdited(true);
    }
  };

  const set = <K extends keyof MessageOptions>(key: K, value: MessageOptions[K]) => setOpts((o) => ({ ...o, [key]: value }));

  function chooseType(t: MessageType) {
    setType(t);
    setEdited(false);
    setOpts((o) => ({ ...defaultOptions(t), sender: o.sender }));
  }

  const fullText = messageToText(generated, subject, body);

  const onCopy = async () => {
    announce((await copyText(fullText)) ? 'コピーしました' : 'コピーできませんでした。文章を長押しして選択してください');
  };
  const onShare = async () => {
    const r = await shareText(fullText);
    if (r === 'unsupported') announce('この端末では共有機能が使えません。コピーして使ってください');
    else if (r === 'failed') announce('共有できませんでした');
  };

  const info = type ? typeInfo(type) : null;

  return (
    <div>
      <PageHeader
        title="連絡文をつくる"
        lead={<p>連絡するのがつらいときのための文章です。病名や詳しい事情を書く必要はありません。できた文章は自由に書きかえられます。</p>}
      />

      <Choice<MessageType>
        legend="どんな連絡ですか"
        value={type ?? ('' as MessageType)}
        onChange={chooseType}
        columns={2}
        options={MESSAGE_TYPES.map((m) => ({ value: m.id, label: m.label, hint: minimal ? undefined : m.description }))}
      />

      {type && info && (
        <>
          <Section title="文章の調整">
            <TypeFields type={type} opts={opts} set={set} kind="choices" />
            {info.usesReason && (
              <Choice<Reason>
                legend="理由の書き方"
                hint="くわしく書かなくても、連絡は伝わります。"
                value={opts.reason}
                onChange={(v) => set('reason', v)}
                columns={2}
                options={(Object.keys(REASON_LABELS) as Reason[]).map((r) => ({ value: r, label: REASON_LABELS[r] }))}
              />
            )}
            {info.usesWhen && (type !== 'hospital' || opts.hospitalPurpose === 'change') && (
              <>
                <Choice<When>
                  legend={type === 'hospital' ? '予約している日' : 'いつのことですか'}
                  value={opts.when}
                  onChange={(v) => set('when', v)}
                  chips
                  options={[
                    { value: 'today', label: '今日' },
                    { value: 'tomorrow', label: '明日' },
                    { value: 'custom', label: '日付を書く' },
                  ]}
                />
                {opts.when === 'custom' && (
                  <TextField label="日付や期間" value={opts.customDate} onChange={(v) => set('customDate', v)} placeholder="例：5月20日（月）" />
                )}
              </>
            )}
            {!minimal && (
              <>
                <Choice<Politeness> legend="ていねいさ" value={opts.politeness} onChange={(v) => set('politeness', v)} chips options={politenessOptions(type)} />
                <Choice<Length>
                  legend="長さ"
                  value={opts.length}
                  onChange={(v) => set('length', v)}
                  chips
                  options={[
                    { value: 'short', label: '短め' },
                    { value: 'normal', label: 'ふつう' },
                    { value: 'long', label: '長め' },
                  ]}
                />
              </>
            )}
          </Section>

          <details className="details" open={settings.mode === 'full'}>
            <summary>名前などを入れる（任意）</summary>
            <p className="muted small">入力しなくても大丈夫です。空欄の部分は「○○」になります。入力した内容は保存されません。</p>
            <TypeFields type={type} opts={opts} set={set} kind="names" />
          </details>

          <Section title="できた文章">
            {info.hasSubject && opts.format !== 'phone' && (
              <div className="field">
                <label htmlFor={subjectId}>件名（メールの場合）</label>
                <input
                  id={subjectId}
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    startEditing();
                    setEditedSubject(e.target.value);
                  }}
                />
              </div>
            )}
            <div className="field">
              <label htmlFor={bodyId}>本文（書きかえられます）</label>
              <textarea
                id={bodyId}
                rows={12}
                value={body}
                onChange={(e) => {
                  startEditing();
                  setEditedBody(e.target.value);
                }}
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
              <Button variant="primary" icon="copy" onClick={onCopy}>
                コピー
              </Button>
              {canShareText() && (
                <Button icon="share" onClick={onShare}>
                  共有
                </Button>
              )}
            </div>
            <Notice>
              <p>文章はこの画面の中で作られ、どこにも送信・保存されません。送るときは、コピーしてメールやメッセージに貼り付けてください。</p>
            </Notice>
          </Section>
        </>
      )}
    </div>
  );
}

function TypeFields({
  type,
  opts,
  set,
  kind,
}: {
  type: MessageType;
  opts: MessageOptions;
  set: <K extends keyof MessageOptions>(key: K, value: MessageOptions[K]) => void;
  kind: 'choices' | 'names';
}): ReactNode {
  const c = kind === 'choices';
  const n = kind === 'names';
  const recipientLabel: Record<MessageType, string> = {
    school: '先生の名前',
    university: '先生の名前',
    parttime: '連絡する相手（店長など）',
    work: '連絡する相手',
    decline: '相手の名前',
    postpone: '相手の名前',
    hospital: '',
    consult: '相手の名前',
  };
  return (
    <div className="type-fields">
      {c && type === 'school' && (
        <Choice<'self' | 'guardian'>
          legend="連絡する人"
          value={opts.relation}
          onChange={(v) => set('relation', v)}
          chips
          options={[
            { value: 'self', label: '本人' },
            { value: 'guardian', label: '保護者' },
          ]}
        />
      )}
      {n && recipientLabel[type] && <TextField label={recipientLabel[type]} value={opts.recipient} onChange={(v) => set('recipient', v)} placeholder={type === 'school' || type === 'university' ? '例：山田先生' : undefined} />}
      {n && type !== 'decline' && type !== 'postpone' && type !== 'consult' && <TextField label={type === 'school' && opts.relation === 'guardian' ? '保護者の名前' : '自分の名前'} value={opts.sender} onChange={(v) => set('sender', v)} />}
      {n && type === 'school' && opts.relation === 'guardian' && <TextField label="子どもの名前" value={opts.studentName} onChange={(v) => set('studentName', v)} />}
      {n && type === 'school' && <TextField label="学年・クラス" value={opts.className} onChange={(v) => set('className', v)} placeholder="例：2年3組" />}
      {n && type === 'university' && (
        <>
          <TextField label="授業名" value={opts.className} onChange={(v) => set('className', v)} />
          <TextField label="学籍番号" value={opts.studentId} onChange={(v) => set('studentId', v)} />
        </>
      )}
      {n && type === 'parttime' && <TextField label="シフトの時間" value={opts.shift} onChange={(v) => set('shift', v)} placeholder="例：17時から22時" />}
      {c && type === 'work' && (
        <>
          <Choice<MessageOptions['duration']>
            legend="休む期間"
            value={opts.duration}
            onChange={(v) => set('duration', v)}
            chips
            options={[
              { value: 'day', label: 'その日だけ' },
              { value: 'days', label: 'しばらく' },
              { value: 'undecided', label: 'まだわからない' },
            ]}
          />
          <Switch label="急ぎの仕事の共有について一言入れる" checked={opts.handover} onChange={(v) => set('handover', v)} />
        </>
      )}
      {n && (type === 'decline' || type === 'postpone') && <TextField label="何の予定ですか" value={opts.event} onChange={(v) => set('event', v)} placeholder="例：土曜日のごはん" />}
      {c && type === 'decline' && (
        <Choice<MessageOptions['futureWish']>
          legend="また誘ってほしいですか"
          value={opts.futureWish}
          onChange={(v) => set('futureWish', v)}
          columns={2}
          options={[
            { value: 'again', label: 'また誘ってほしい' },
            { value: 'none', label: '書かない' },
          ]}
        />
      )}
      {c && type === 'postpone' && (
        <Choice<MessageOptions['proposal']>
          legend="次の予定について"
          value={opts.proposal}
          onChange={(v) => set('proposal', v)}
          columns={2}
          options={[
            { value: 'later', label: '改めて連絡すると書く' },
            { value: 'none', label: '書かない' },
          ]}
        />
      )}
      {c && type === 'hospital' && (
        <>
          <Choice<MessageOptions['hospitalPurpose']>
            legend="問い合わせの内容"
            value={opts.hospitalPurpose}
            onChange={(v) => set('hospitalPurpose', v)}
            columns={1}
            options={[
              { value: 'first', label: '初めて受診したい（予約）' },
              { value: 'change', label: '予約を変更したい' },
              { value: 'question', label: '受診の流れを知りたい' },
            ]}
          />
          <Choice<MessageOptions['format']>
            legend="使い方"
            value={opts.format}
            onChange={(v) => set('format', v)}
            columns={2}
            options={[
              { value: 'text', label: 'メール・フォーム用' },
              { value: 'phone', label: '電話で読み上げるメモ' },
            ]}
          />
        </>
      )}
      {c && type === 'consult' && (
        <Choice<MessageOptions['wish']>
          legend="してほしいこと"
          value={opts.wish}
          onChange={(v) => set('wish', v)}
          columns={1}
          options={[
            { value: 'listen', label: '話を聞いてほしい' },
            { value: 'together', label: 'そばにいてほしい' },
            { value: 'hospital', label: '病院のことを一緒に考えてほしい' },
            { value: 'know', label: '知っておいてほしいだけ' },
            { value: 'noreply', label: '返事はいらない' },
          ]}
        />
      )}
    </div>
  );
}
