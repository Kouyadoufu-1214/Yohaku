import { PageHeader, Notice, ButtonLink } from '../components/ui';
import { STORIES, STORY_CATEGORIES, findStory } from '../data/stories';
import { href } from '../lib/router';
import { NotFound } from './NotFound';

function SampleBadge() {
  return <span className="badge">サンプル（架空）</span>;
}

export function Stories() {
  return (
    <div>
      <PageHeader
        title="誰かの経験を知る"
        lead={<p>つらさを経験した人の話や手紙です。読みたいものだけ、読みたいときに。比べる必要はありません。</p>}
      />
      <Notice title="開発中のお知らせ">
        <p>現在ここにある文章は、すべて開発用のサンプル（架空の体験談）です。実在の人物の体験ではありません。</p>
        <p>実際の体験談は、ご本人の同意と運営者による内容の確認を経たものだけを掲載する予定です。投稿の受付は行っていません。</p>
      </Notice>
      {STORY_CATEGORIES.map((cat) => {
        const list = STORIES.filter((s) => s.category === cat.id);
        if (list.length === 0) return null;
        return (
          <section key={cat.id} className="section" aria-labelledby={`cat-${cat.id}`}>
            <h2 className="section__title" id={`cat-${cat.id}`}>
              {cat.label}
            </h2>
            <ul className="link-list">
              {list.map((s) => (
                <li key={s.id}>
                  <a className="link-row" href={href(`/stories/${s.id}`)}>
                    <span className="link-row__text">
                      <span className="link-row__label">{s.title}</span>
                      <span className="link-row__hint">
                        <SampleBadge />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="muted small">いいね数やランキング、コメント機能はありません。</p>
    </div>
  );
}

export function StoryPage({ id }: { id: string }) {
  const story = findStory(id);
  if (!story) return <NotFound />;
  const cat = STORY_CATEGORIES.find((c) => c.id === story.category);
  return (
    <article className="story">
      <PageHeader title={story.title} back="/stories" backLabel="一覧へ" lead={<p className="muted">{cat?.label}</p>} />
      <p>
        <SampleBadge /> <span className="muted small">この文章は開発用の架空のサンプルです。</span>
      </p>
      <div className="story__body">
        {story.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="story__end">
        <p className="muted">読んで、つらくなったときは無理をせず、休んでください。</p>
        <div className="actions">
          <ButtonLink to="/stories" variant="primary">
            一覧へ戻る
          </ButtonLink>
          <ButtonLink to="/rest" icon="rest">
            休憩室へ
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
