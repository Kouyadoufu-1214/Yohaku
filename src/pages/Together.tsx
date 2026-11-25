import { useState } from 'react';
import { PageHeader, LinkList, LinkRow } from '../components/ui';
import { Icon } from '../components/Icon';
import { TOGETHER_WORDS } from '../data/small';

export function Together() {
  const [i, setI] = useState(0);
  return (
    <div>
      <PageHeader title="誰かにそばにいてほしい" lead={<p>そう思うのは、自然なことです。</p>} />
      <div className="together-words" aria-live="polite">
        <p>{TOGETHER_WORDS[i % TOGETHER_WORDS.length]}</p>
      </div>
      <div className="actions actions--center">
        <button type="button" className="btn btn--quiet" onClick={() => setI((n) => n + 1)}>
          <Icon name="refresh" size={20} />
          <span>ほかのことばを見る</span>
        </button>
      </div>

      <h2 className="section__title">誰かとつながる方法</h2>
      <LinkList>
        <LinkRow to="/help" icon="help" label="話を聞いてくれる相談窓口" hint="電話やチャットで、専門の相談員と話せます" />
        <LinkRow to="/card" icon="card" label="身近な人に「そばにいてほしい」と伝える" hint="画面で見せたり、文章を送ったりできます" />
        <LinkRow to="/message?type=consult" icon="message" label="家族や友人に相談する文章をつくる" />
        <LinkRow to="/stories" icon="book" label="誰かの経験や手紙を読む" />
        <LinkRow to="/rest" icon="rest" label="静かな場所で過ごす" />
      </LinkList>
      <p className="muted small">このアプリには、知らない人とつながるチャット機能はありません。</p>
    </div>
  );
}
