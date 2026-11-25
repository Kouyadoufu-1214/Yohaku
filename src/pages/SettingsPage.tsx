import { useEffect, useState } from 'react';
import { PageHeader, Choice, Switch, Section, ConfirmDialog, LinkList, LinkRow, Notice, useAnnounce } from '../components/ui';
import { useSettings, type DisplayMode, type FontSize, type SaveMode, type Theme } from '../lib/settings';
import { countRecords, deleteAllLocalData } from '../lib/db';
import { ambient } from '../lib/audio';

export function SettingsPage() {
  const { settings, update, reset, motionReduced } = useSettings();
  const announce = useAnnounce();
  const [confirm, setConfirm] = useState(false);
  const [counts, setCounts] = useState<{ notes: number; feelings: number } | null>(null);

  useEffect(() => {
    Promise.all([countRecords('notes'), countRecords('feelings')])
      .then(([notes, feelings]) => setCounts({ notes, feelings }))
      .catch(() => setCounts(null));
  }, []);

  const deleteAll = async () => {
    setConfirm(false);
    ambient.stop();
    try {
      await deleteAllLocalData({ caches: false });
      reset();
      setCounts({ notes: 0, feelings: 0 });
      announce('この端末に保存されていたデータをすべて削除しました');
    } catch {
      announce('削除の途中で問題が起きました。ブラウザの設定からサイトのデータを削除することもできます');
    }
  };

  const hasRecords = counts !== null && counts.notes + counts.feelings > 0;

  return (
    <div>
      <PageHeader title="設定" lead={<p>表示や保存のしかたを変えられます。いつでも元に戻せます。</p>} />

      <Section title="表示">
        <Choice<DisplayMode>
          legend="表示モード"
          hint="その日の状態に合わせて、画面に出す情報の量を変えられます。状態の評価ではありません。"
          value={settings.mode}
          onChange={(v) => update({ mode: v })}
          columns={1}
          options={[
            { value: 'minimal', label: '最小表示', hint: '大きなボタンと、主な機能だけ' },
            { value: 'standard', label: '標準表示', hint: '基本的な機能' },
            { value: 'full', label: '全機能表示', hint: '記録の振り返りなど、すべての機能' },
          ]}
        />
        <Choice<Theme>
          legend="テーマ"
          value={settings.theme}
          onChange={(v) => update({ theme: v })}
          chips
          options={[
            { value: 'system', label: '端末に合わせる' },
            { value: 'light', label: 'ライト' },
            { value: 'dark', label: 'ダーク' },
          ]}
        />
        <Choice<FontSize>
          legend="文字の大きさ"
          value={settings.fontSize}
          onChange={(v) => update({ fontSize: v })}
          chips
          options={[
            { value: 's', label: '小さめ' },
            { value: 'm', label: '標準' },
            { value: 'l', label: '大きめ' },
            { value: 'xl', label: 'とても大きく' },
          ]}
        />
        <Switch
          label="動きを少なくする"
          hint={settings.reduceMotion === null ? '今は端末の設定に合わせています。' : undefined}
          checked={motionReduced}
          onChange={(v) => update({ reduceMotion: v })}
        />
        {settings.reduceMotion !== null && (
          <button type="button" className="btn btn--quiet btn--small" onClick={() => update({ reduceMotion: null })}>
            <span>動きの設定を端末に合わせる</span>
          </button>
        )}
      </Section>

      <Section title="音">
        <div className="range">
          <label htmlFor="settings-volume">環境音の音量</label>
          <input
            id="settings-volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(settings.volume * 100)}
            aria-valuetext={`${Math.round(settings.volume * 100)}パーセント`}
            onChange={(e) => update({ volume: Number(e.target.value) / 100 })}
          />
          <output htmlFor="settings-volume">{Math.round(settings.volume * 100)}%</output>
        </div>
        <p className="muted small">音は「心の休憩室」で、再生ボタンを押したときだけ流れます。</p>
      </Section>

      <Section title="データの保存">
        <Choice<SaveMode>
          legend="気持ちの記録の保存"
          value={settings.saveMode}
          onChange={(v) => update({ saveMode: v })}
          columns={1}
          options={[
            { value: 'ask', label: '毎回えらぶ', hint: '「保存する」を押したときだけ保存します（初期設定は保存しない）' },
            { value: 'never', label: '保存機能を使わない', hint: '保存ボタンを表示しません' },
          ]}
        />
        <Switch
          label="表示の設定をこの端末に記憶する"
          hint="オフにすると、テーマや文字の大きさなどは次に開いたときに初期状態に戻ります。"
          checked={settings.remember}
          onChange={(v) => update({ remember: v })}
        />
        <Notice title="保存について">
          <p>保存した内容は、この端末のブラウザの中にだけ保存されます。外部のサーバーには送られません。</p>
          <p>保存した内容は暗号化されていません。家族などと共有している端末では、ほかの人に見られる可能性があります。</p>
          <p>ブラウザの履歴やサイトデータを消すと、保存した内容も消えることがあります。別の端末やブラウザには引き継がれません。</p>
        </Notice>
      </Section>

      <Section title="保存データの削除">
        <p className="muted small">
          {counts === null
            ? '保存されている記録の数を確認できませんでした。'
            : hasRecords
              ? 'この端末に保存されている記録があります。'
              : 'この端末に保存されている記録はありません。'}
        </p>
        <button type="button" className="btn btn--secondary" onClick={() => setConfirm(true)}>
          <span>この端末のデータをすべて削除する</span>
        </button>
        <p className="muted small">気持ちの記録・置いていったことば・表示の設定を削除します。オフライン用に保存しているアプリ本体は残ります。</p>
      </Section>

      <Section title="このアプリについて">
        <LinkList>
          <LinkRow to="/privacy" label="プライバシーポリシー" />
          <LinkRow to="/terms" label="利用規約" />
          <LinkRow to="/about" label="余白。について" />
          <LinkRow to="/supporters" label="支える人へ" />
        </LinkList>
      </Section>

      <ConfirmDialog
        open={confirm}
        title="データをすべて削除しますか？"
        confirmLabel="すべて削除する"
        onConfirm={deleteAll}
        onCancel={() => setConfirm(false)}
      >
        <p>この端末に保存した記録と設定を、すべて削除します。削除したデータは元に戻せません。</p>
      </ConfirmDialog>
    </div>
  );
}
