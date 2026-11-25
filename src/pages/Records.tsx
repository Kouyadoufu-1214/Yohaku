import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Section, ConfirmDialog, Notice, useAnnounce } from '../components/ui';
import { Icon } from '../components/Icon';
import { deleteRecord, getAllRecords, type FeelingRecord, type NoteRecord } from '../lib/db';
import { feelingLabel } from '../data/feelings';
import { dateStamp, downloadText, formatDateTime } from '../lib/share';
import { href } from '../lib/router';

type Pending = { store: 'notes' | 'feelings'; id: string } | null;

export function Records() {
  const announce = useAnnounce();
  const [notes, setNotes] = useState<NoteRecord[] | null>(null);
  const [feelings, setFeelings] = useState<FeelingRecord[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [pending, setPending] = useState<Pending>(null);

  const load = useCallback(async () => {
    try {
      const [n, f] = await Promise.all([getAllRecords('notes'), getAllRecords('feelings')]);
      setNotes(n);
      setFeelings(f);
    } catch {
      setUnavailable(true);
      setNotes([]);
      setFeelings([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async () => {
    if (!pending) return;
    try {
      await deleteRecord(pending.store, pending.id);
      announce('削除しました');
    } catch {
      announce('削除できませんでした');
    }
    setPending(null);
    void load();
  };

  const loading = notes === null || feelings === null;
  const nothing = !loading && notes.length === 0 && feelings.length === 0;

  return (
    <div>
      <PageHeader
        title="保存した記録"
        back="/feelings"
        backLabel="気持ち"
        lead={<p>この端末に保存したものだけが表示されます。数や回数の集計はしません。</p>}
      />
      {unavailable && (
        <Notice>
          <p>このブラウザでは端末内の保存が使えないため、記録を表示できません。</p>
        </Notice>
      )}
      {loading && <p className="muted">読み込んでいます…</p>}
      {nothing && !unavailable && (
        <p className="muted">保存したものはありません。保存しないことも、まったく問題ありません。</p>
      )}

      {notes && notes.length > 0 && (
        <Section title="置いていったことば">
          <ul className="record-list">
            {notes.map((n) => (
              <li key={n.id} className="record">
                <p className="record__date">{formatDateTime(n.updatedAt)}</p>
                <p className="record__text pre-wrap">{n.text.length > 200 ? `${n.text.slice(0, 200)}…` : n.text}</p>
                <div className="record__actions">
                  <a className="btn btn--quiet btn--small" href={href(`/feelings/leave?id=${encodeURIComponent(n.id)}`)}>
                    <span>開く</span>
                  </a>
                  <button type="button" className="btn btn--quiet btn--small" onClick={() => downloadText(n.text, `yohaku-kotoba-${dateStamp(new Date(n.createdAt))}.txt`)}>
                    <Icon name="download" size={18} />
                    <span>書き出す</span>
                  </button>
                  <button type="button" className="btn btn--quiet btn--small" onClick={() => setPending({ store: 'notes', id: n.id })}>
                    <Icon name="trash" size={18} />
                    <span>削除</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {feelings && feelings.length > 0 && (
        <Section title="気持ちの記録">
          <ul className="record-list">
            {feelings.map((f) => (
              <li key={f.id} className="record">
                <p className="record__date">{formatDateTime(f.createdAt)}</p>
                <p className="record__text">{f.feelings.length ? f.feelings.map(feelingLabel).join('、') : '（気持ちは選ばなかった）'}</p>
                {f.note && <p className="record__note pre-wrap">{f.note}</p>}
                <div className="record__actions">
                  <button type="button" className="btn btn--quiet btn--small" onClick={() => setPending({ store: 'feelings', id: f.id })}>
                    <Icon name="trash" size={18} />
                    <span>削除</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <p className="muted small">
        すべての記録をまとめて消すときは、<a href={href('/settings')}>設定</a>の「保存データの削除」を使ってください。
      </p>

      <ConfirmDialog open={pending !== null} title="この記録を削除しますか？" confirmLabel="削除する" onConfirm={remove} onCancel={() => setPending(null)}>
        <p>削除した記録は、元に戻せません。</p>
      </ConfirmDialog>
    </div>
  );
}
