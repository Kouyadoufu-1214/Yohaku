import { PageHeader, LinkList, LinkRow } from '../components/ui';
import { useSettings } from '../lib/settings';

export function FeelingsHub() {
  const { settings } = useSettings();
  const minimal = settings.mode === 'minimal';
  const full = settings.mode === 'full';
  return (
    <div>
      <PageHeader title="気持ち" lead={!minimal && <p>整理する、置いていく、誰かに伝える。どれも、途中でやめて大丈夫です。</p>} />
      <LinkList label="気持ちに関する機能">
        <LinkRow to="/feelings/sort" icon="feelings" label="気持ちを整理する" hint={minimal ? undefined : '選ぶだけで、文章は書かなくても大丈夫'} large={minimal} />
        <LinkRow to="/feelings/leave" icon="leave" label="気持ちを置いていく場所" hint={minimal ? undefined : '誰にも見せずに書き出す（保存しないのが基本）'} large={minimal} />
        <LinkRow to="/card" icon="card" label="気持ちを伝えるカード" hint={minimal ? undefined : '話せないときに、画面で見せる'} large={minimal} />
        {!minimal && <LinkRow to="/message" icon="message" label="連絡文をつくる" hint="欠席・欠勤・断る・相談などの文章" />}
        {!minimal && <LinkRow to="/stories" icon="book" label="誰かの経験を知る" hint="体験談や手紙を読む" />}
        {full && <LinkRow to="/feelings/records" icon="records" label="保存した記録を見る" hint="この端末に保存したものだけが表示されます" />}
      </LinkList>
    </div>
  );
}
