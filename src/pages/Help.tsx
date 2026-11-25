import { PageHeader, ExternalLink, Notice, useOnline } from '../components/ui';
import { Icon } from '../components/Icon';
import { INFO_SITES, RESOURCES_CHECKED_AT, SNS_RESOURCES, TEL_RESOURCES, type Resource } from '../data/resources';
import { useSettings } from '../lib/settings';

function ResourceCard({ r, compact }: { r: Resource; compact: boolean }) {
  return (
    <li className="resource">
      <h3 className="resource__name">{r.name}</h3>
      {r.org && <p className="resource__org">{r.org}</p>}
      {r.status && (
        <div className="resource__status" role="note">
          <p className="resource__status-title">
            <Icon name="info" size={18} />
            <span>受付を一時休止しているとのお知らせがあります</span>
          </p>
          <p>{r.status.text}</p>
          <p className="resource__source">
            出典：<ExternalLink url={r.status.source.url}>{r.status.source.label}</ExternalLink>
          </p>
        </div>
      )}
      {r.description && !compact && <p className="resource__desc">{r.description}</p>}
      <ul className="resource__contacts">
        {r.contacts.map((c) => (
          <li key={c.href}>
            <ExternalLink url={c.href} className={c.kind === 'tel' ? 'contact contact--tel' : 'contact contact--web'}>
              {c.label}
            </ExternalLink>
          </li>
        ))}
      </ul>
      <dl className="resource__facts">
        <div>
          <dt>受付時間</dt>
          <dd>
            {r.hours.map((h) => (
              <span key={h} className="block">
                {h}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>料金</dt>
          <dd>{r.fee}</dd>
        </div>
        {!compact && (
          <>
            <div>
              <dt>対象</dt>
              <dd>{r.target}</dd>
            </div>
            <div>
              <dt>対象地域</dt>
              <dd>{r.region}</dd>
            </div>
          </>
        )}
      </dl>
      {r.notes && !compact && (
        <ul className="resource__notes">
          {r.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {!compact && (
        <p className="resource__source">
          情報確認日：{RESOURCES_CHECKED_AT}　出典：<ExternalLink url={r.source.url}>{r.source.label}</ExternalLink>
        </p>
      )}
    </li>
  );
}

export function Help() {
  const online = useOnline();
  const { settings } = useSettings();
  const compact = settings.mode === 'minimal';

  return (
    <div className="help">
      <PageHeader title="相談窓口・緊急時" lead={<p>話を聞いてくれる専門の窓口があります。電話でも、文字でも相談できます。</p>} />

      <section className="emergency" aria-labelledby="emergency-title">
        <h2 id="emergency-title" className="emergency__title">
          命や体に危険が迫っているとき
        </h2>
        <p>
          すぐに <strong>119番</strong>（救急）に連絡してください。事件や事故など身の危険があるときは <strong>110番</strong>（警察）です。
        </p>
        <div className="emergency__actions">
          <a className="emergency__call" href="tel:119">
            <Icon name="phone" />
            <span>119番に電話する</span>
          </a>
          <a className="emergency__call emergency__call--sub" href="tel:110">
            <Icon name="phone" />
            <span>110番に電話する</span>
          </a>
        </div>
      </section>

      {!online && (
        <Notice title="今はオフラインです">
          <p>電話はかけられますが、Webやチャットの相談窓口を開くにはインターネット接続が必要です。</p>
        </Notice>
      )}

      <section className="section" aria-labelledby="tel-title">
        <h2 className="section__title" id="tel-title">
          電話で話したい
        </h2>
        <ul className="resource-list">
          {TEL_RESOURCES.map((r) => (
            <ResourceCard key={r.id} r={r} compact={compact} />
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="sns-title">
        <h2 className="section__title" id="sns-title">
          文字（チャット・SNS）で話したい
        </h2>
        <p className="muted small">LINEやWebのチャットで相談できます。開くにはインターネット接続が必要です。</p>
        <ul className="resource-list">
          {SNS_RESOURCES.map((r) => (
            <ResourceCard key={r.id} r={r} compact={compact} />
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="sites-title">
        <h2 className="section__title" id="sites-title">
          ほかの窓口を探す
        </h2>
        <ul className="source-list">
          {INFO_SITES.map((s) => (
            <li key={s.url}>
              <ExternalLink url={s.url}>{s.name}</ExternalLink>
              <p className="muted small">{s.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <Notice title="このアプリについて、知っておいてほしいこと">
        <p>余白。は医療行為・診断・治療・カウンセリングの代わりにはなりません。</p>
        <p>このアプリの運営者は、利用者の記録や入力内容を見ることができません。そのため、緊急時に運営者が気づいたり、対応したりすることはできません。</p>
        <p>
          受付時間や番号などは、{RESOURCES_CHECKED_AT}に各公式ページで確認した内容です。変わることがあるため、利用する前に公式サイトもご確認ください。公式ページに記載がない項目は「記載なし」としています。
        </p>
      </Notice>
    </div>
  );
}
