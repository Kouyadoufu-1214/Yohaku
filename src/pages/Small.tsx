import { useState } from 'react';
import { PageHeader, ButtonLink } from '../components/ui';
import { Icon } from '../components/Icon';
import { SMALL_THINGS } from '../data/small';

export function Small() {
  const [i, setI] = useState(0);
  const [notNow, setNotNow] = useState(false);
  const item = SMALL_THINGS[i % SMALL_THINGS.length];
  return (
    <div>
      <PageHeader title="少しだけ何かをしたい" lead={<p>とても小さなことを、一つだけ。しなくても大丈夫です。</p>} />
      {notNow ? (
        <div className="gentle-card" aria-live="polite">
          <p className="gentle-card__main">今はしなくて大丈夫です。</p>
          <p className="muted">何かをしたいと思えたこと自体を、大切にしてください。</p>
          <div className="actions">
            <ButtonLink to="/rest" icon="rest" variant="primary">
              休憩室へ
            </ButtonLink>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setNotNow(false);
                setI((n) => n + 1);
              }}
            >
              <span>別のものを見る</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="gentle-card" aria-live="polite">
          <p className="gentle-card__main">{item.text}</p>
          {item.hint && <p className="muted">{item.hint}</p>}
          <div className="actions">
            <button type="button" className="btn btn--secondary" onClick={() => setI((n) => n + 1)}>
              <Icon name="refresh" size={20} />
              <span>別のものを見る</span>
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setNotNow(true)}>
              <span>今はしない</span>
            </button>
          </div>
        </div>
      )}
      <div className="actions">
        <ButtonLink to="/steps" icon="steps" variant="quiet">
          少しずつ生活に戻るための段階を見る
        </ButtonLink>
      </div>
    </div>
  );
}
