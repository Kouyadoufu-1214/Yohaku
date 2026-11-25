import { PageHeader, Notice, ExternalLink, ButtonLink } from '../components/ui';
import { SUPPORTER_SECTIONS, SUPPORTER_SOURCES } from '../data/supporters';

export function Supporters() {
  return (
    <div className="supporters">
      <PageHeader
        title="支える人へ"
        lead={<p>家族、友人、恋人、先生、職場の方など、心がつらい人のそばにいる方へ。公的機関が公開している情報をもとにまとめています。</p>}
      />
      <nav className="toc" aria-label="このページの内容">
        <ul>
          {SUPPORTER_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#sup-${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(`sup-${s.id}`);
                  el?.scrollIntoView({ block: 'start' });
                  el?.focus({ preventScroll: true });
                }}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {SUPPORTER_SECTIONS.map((s) => (
        <section key={s.id} className="section" aria-labelledby={`sup-${s.id}`}>
          <h2 className="section__title" id={`sup-${s.id}`} tabIndex={-1}>
            {s.title}
          </h2>
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.quote && (
            <figure className="quote">
              <blockquote>
                {s.quote.text.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </blockquote>
              <figcaption>{s.quote.source}</figcaption>
            </figure>
          )}
          {s.points && (
            <ul className="plain-list">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="section" aria-labelledby="sup-sources">
        <h2 className="section__title" id="sup-sources">
          参照した情報
        </h2>
        <ul className="source-list">
          {SUPPORTER_SOURCES.map((s) => (
            <li key={s.url}>
              <ExternalLink url={s.url}>{s.name}</ExternalLink>
              <p className="muted small">{s.note}</p>
            </li>
          ))}
        </ul>
        <p className="muted small">2026年11月25日に参照先を確認しました。外部サイトを開くにはインターネット接続が必要です。</p>
      </section>

      <Notice>
        <p>このページは、医学的な説明や診断の方法を示すものではありません。具体的な対応に迷うときは、医療機関や相談窓口に相談してください。支える人自身が相談することもできます。</p>
      </Notice>
      <div className="actions">
        <ButtonLink to="/help" icon="help" variant="primary">
          相談窓口を見る
        </ButtonLink>
        <ButtonLink to="/card" icon="card">
          伝えるカードについて
        </ButtonLink>
      </div>
    </div>
  );
}
