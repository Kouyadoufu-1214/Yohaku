import { useEffect, useId, useState } from 'react';
import { PageHeader, Button, ButtonLink, ConfirmDialog, Notice, useAnnounce, useFocusTitleOnChange } from '../components/ui';
import { useSettings } from '../lib/settings';
import { getAllRecords, newId, putRecord, type NoteRecord } from '../lib/db';
import { dateStamp, downloadText } from '../lib/share';
import { href, queryParam } from '../lib/router';

type View = 'write' | 'released';

export function LeaveWords() {
  const { settings } = useSettings();
  const announce = useAnnounce();
  const [text, setText] = useState('');
  const [view, setView] = useState<View>('write');
  const [editing, setEditing] = useState<NoteRecord | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState('');
  const fieldId = useId();
  const hintId = useId();
  useFocusTitleOnChange(view);

  // 保存済みのものを開く（記録の画面から ?id= で）
  useEffect(() => {
    const id = queryParam('id');
    if (!id) return;
    getAllRecords('notes')
      .then((list) => {
        const found = list.find((n) => n.id === id);
        if (found) {
          setEditing(found);
          setText(found.text);
        }
      })
      .catch(() => setError('保存した内容を読み込めませんでした。'));
  }, []);

  const release = () => {
    setText('');
    setEditing(null);
    setSavedAt(null);
    setView('released');
  };

  const save = async () => {
    if (!text.trim()) return;
    setError('');
    const now = Date.now();
    const record: NoteRecord = editing
      ? { ...editing, text, updatedAt: now }
      : { id: newId(), createdAt: now, updatedAt: now, text };
    try {
      await putRecord('notes', record);
      setEditing(record);
      setSavedAt(now);
      announce('この端末に保存しました');
    } catch {
      setError('保存できませんでした。このブラウザでは端末内の保存が使えない設定になっている可能性があります。');
    }
  };

  const exportText = () => {
    if (!text.trim()) return;
    downloadText(text, `yohaku-kotoba-${dateStamp()}.txt`);
    announce('テキストファイルとして書き出しました');
  };

  const clear = () => {
    setText('');
    setConfirmClear(false);
    announce('書いた内容を消しました');
    document.getElementById(fieldId)?.focus();
  };

  if (view === 'released') {
    return (
      <div>
        <PageHeader title="気持ちを置いていく場所" back="/feelings" backLabel="気持ち" />
        <div className="gentle-card released">
          <p className="gentle-card__main">ことばを、ここに置いていきました。</p>
          <p className="muted">書いた内容は保存されず、どこにも残っていません。</p>
          <div className="actions">
            <Button variant="primary" onClick={() => setView('write')}>
              また書く
            </Button>
            <ButtonLink to="/rest" icon="rest">
              休憩室へ
            </ButtonLink>
            <ButtonLink to="/" variant="quiet">
              ホームへ
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const empty = text.trim() === '';

  return (
    <div>
      <PageHeader
        title="気持ちを置いていく場所"
        back="/feelings"
        backLabel="気持ち"
        lead={<p>誰にも見せずに、思っていることを書き出せます。書いたものは、どこにも送られません。</p>}
      />
      <div className="field">
        <label htmlFor={fieldId}>ここに書く{editing && '（保存した内容を開いています）'}</label>
        <textarea
          id={fieldId}
          className="leave-textarea"
          rows={10}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSavedAt(null);
          }}
          aria-describedby={hintId}
          maxLength={20000}
          spellCheck={false}
          autoComplete="off"
        />
        <p className="field__hint" id={hintId}>
          保存しないのが基本です。何も選ばずに画面を離れると、書いた内容は残りません。
        </p>
      </div>

      <div className="actions actions--stack">
        <Button variant="primary" onClick={release}>
          保存せずに閉じる
        </Button>
        {settings.saveMode === 'ask' && (
          <Button icon="save" onClick={save} disabled={empty}>
            {editing ? '変更を端末に保存する' : 'この端末に保存する'}
          </Button>
        )}
        <Button icon="download" onClick={exportText} disabled={empty}>
          テキストとして書き出す
        </Button>
        <Button icon="trash" variant="quiet" onClick={() => setConfirmClear(true)} disabled={empty}>
          書いた内容を消す
        </Button>
      </div>
      {savedAt && (
        <p className="success" role="status">
          この端末に保存しました。<a href={href('/feelings/records')}>保存した記録</a>から見たり消したりできます。
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <Notice title="保存について">
        <p>「この端末に保存する」を選んだときだけ、このブラウザの中に保存されます。保存した内容は暗号化されていません。家族などと共有している端末では、ほかの人に見られる可能性があります。</p>
        <p>「テキストとして書き出す」は、端末にファイルを作ります。ファイルの扱いは、ご自身で管理してください。</p>
      </Notice>

      <ConfirmDialog
        open={confirmClear}
        title="書いた内容を消しますか？"
        confirmLabel="消す"
        onConfirm={clear}
        onCancel={() => setConfirmClear(false)}
      >
        <p>入力欄の文章を消します。{editing ? '保存済みの内容は「保存した記録」から削除できます。' : '保存はされていないため、元に戻せません。'}</p>
      </ConfirmDialog>
    </div>
  );
}
