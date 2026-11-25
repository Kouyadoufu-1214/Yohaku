import { useState } from 'react';
import { PageHeader, LinkList, LinkRow, Notice, Section, ButtonLink } from '../components/ui';
import { Icon } from '../components/Icon';
import { LIFE_CATEGORIES, findCategory } from '../data/life';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { NotFound } from './NotFound';

export function Life() {
  const { settings } = useSettings();
  const minimal = settings.mode === 'minimal';
  return (
    <div>
      <PageHeader
        title="日常生活の支援"
        lead={!minimal && <p>つらいときの生活を、少しだけ楽にする工夫を集めました。どれも、しなくても大丈夫です。</p>}
      />
      <LinkList label="生活の場面">
        {LIFE_CATEGORIES.map((c) => (
          <LinkRow key={c.id} to={`/life/${c.id}`} label={c.label} hint={minimal ? undefined : c.description} large={minimal} />
        ))}
      </LinkList>
      {!minimal && (
        <Section title="少し先のこと">
          <LinkList>
            <LinkRow to="/steps" icon="steps" label="少しずつ生活に戻る" hint="外出・学校・受診などを小さな段階に分ける" />
            <LinkRow to="/small" icon="small" label="少しだけ何かをしたい" hint="とても小さなことを一つだけ" />
          </LinkList>
        </Section>
      )}
    </div>
  );
}

export function LifeCategoryPage({ categoryId }: { categoryId: string }) {
  const { settings } = useSettings();
  const cat = findCategory(categoryId);
  if (!cat) return <NotFound />;
  const minimal = settings.mode === 'minimal';
  return (
    <div>
      <PageHeader title={cat.label} back="/life" backLabel="生活支援" lead={!minimal && <p>近いものを選んでください。</p>} />
      <LinkList label={`${cat.label}で困っていること`}>
        {cat.items.map((it) => (
          <LinkRow key={it.id} to={`/life/${cat.id}/${it.id}`} label={it.label} large={minimal} />
        ))}
      </LinkList>
    </div>
  );
}

export function LifeItemPage({ categoryId, itemId }: { categoryId: string; itemId: string }) {
  const { settings } = useSettings();
  const cat = findCategory(categoryId);
  const item = cat?.items.find((i) => i.id === itemId);
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<'show' | 'notnow' | 'try'>('show');
  if (!cat || !item) return <NotFound />;
  const minimal = settings.mode === 'minimal';
  const s = item.suggestions[index % item.suggestions.length];
  const total = item.suggestions.length;

  const next = () => {
    setIndex((i) => (i + 1) % total);
    setState('show');
  };

  return (
    <div>
      <PageHeader title={item.label} back={`/life/${cat.id}`} backLabel={cat.label} lead={<p>{item.note}</p>} />

      {state === 'notnow' ? (
        <div className="gentle-card" role="region" aria-live="polite" aria-label="今はしない">
          <p className="gentle-card__main">今は、しなくて大丈夫です。</p>
          <p className="muted">何もしないことを選ぶのも、自分を大切にする方法の一つです。</p>
          <div className="actions">
            <ButtonLink to="/rest" icon="rest" variant="primary">
              休憩室で休む
            </ButtonLink>
            <button type="button" className="btn btn--secondary" onClick={next}>
              <Icon name="refresh" size={20} />
              <span>別の方法を見る</span>
            </button>
            <ButtonLink to={`/life/${cat.id}`} variant="quiet">
              一覧に戻る
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="gentle-card" aria-live="polite">
          <p className="gentle-card__label">
            できそうなこと<span className="visually-hidden">（{total}こ中 {(index % total) + 1}こめ）</span>
          </p>
          <p className="gentle-card__main">{s.text}</p>
          {s.hint && !minimal && <p className="muted">{s.hint}</p>}
          {state === 'try' && (
            <p className="gentle-card__after">ゆっくりで大丈夫です。途中でやめても、できなくても、それでかまいません。</p>
          )}
          <div className="actions">
            {state !== 'try' && (
              <button type="button" className="btn btn--primary" onClick={() => setState('try')}>
                <span>やってみる</span>
              </button>
            )}
            <button type="button" className="btn btn--secondary" onClick={next}>
              <Icon name="refresh" size={20} />
              <span>別の方法を見る</span>
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setState('notnow')}>
              <span>今はしない</span>
            </button>
          </div>
        </div>
      )}

      {item.careNote && (
        <Notice tone="care" title="心配なときは">
          <p>{item.careNote}</p>
          <p>
            <a href={href('/help')}>相談窓口を見る</a>
          </p>
        </Notice>
      )}

      {item.links && item.links.length > 0 && (
        <Section title="使えるもの">
          <LinkList>
            {item.links.map((l) => (
              <LinkRow key={l.to + l.label} to={l.to} label={l.label} />
            ))}
          </LinkList>
        </Section>
      )}

      {!minimal && (
        <details className="details">
          <summary>ほかの方法をまとめて見る</summary>
          <ul className="plain-list">
            {item.suggestions.map((x) => (
              <li key={x.text}>
                {x.text}
                {x.hint && <span className="muted small"> — {x.hint}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
