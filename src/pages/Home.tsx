import { useEffect } from 'react';
import { Icon, type IconName } from '../components/Icon';
import { useSettings, type DisplayMode } from '../lib/settings';
import { href } from '../lib/router';

interface HomeChoice {
  to: string;
  label: string;
  hint: string;
  icon: IconName;
  /** 最小表示モードでも出す */
  minimal?: boolean;
}

const CHOICES: HomeChoice[] = [
  { to: '/rest', label: '静かに過ごしたい', hint: '何もしなくていい、休憩の部屋', icon: 'rest', minimal: true },
  { to: '/together', label: '誰かにそばにいてほしい', hint: 'そばにいることば・誰かに伝える方法', icon: 'together', minimal: true },
  { to: '/life', label: '日常生活がつらい', hint: '起きる・食べる・連絡するなどの小さな工夫', icon: 'life', minimal: true },
  { to: '/feelings/sort', label: '気持ちを整理したい', hint: '選ぶだけで、言葉にしなくても大丈夫', icon: 'feelings' },
  { to: '/card', label: '気持ちをうまく伝えられない', hint: '画面で見せられる「伝えるカード」', icon: 'card', minimal: true },
  { to: '/stories', label: '誰かの経験を知りたい', hint: '体験談や手紙を読む', icon: 'book' },
  { to: '/small', label: '少しだけ何かをしたい', hint: 'とても小さなことを一つだけ', icon: 'small' },
  { to: '/help', label: '相談先を探したい', hint: '電話やチャットの専門の相談窓口', icon: 'help', minimal: true },
];

const MORE: { to: string; label: string; icon: IconName }[] = [
  { to: '/message', label: '連絡文をつくる', icon: 'message' },
  { to: '/feelings/leave', label: '気持ちを置いていく場所', icon: 'leave' },
  { to: '/steps', label: '少しずつ生活に戻る', icon: 'steps' },
  { to: '/feelings/records', label: '保存した記録を見る', icon: 'records' },
  { to: '/supporters', label: '支える人へ', icon: 'people' },
  { to: '/settings', label: '設定', icon: 'settings' },
];

const MODE_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: 'minimal', label: '最小' },
  { value: 'standard', label: '標準' },
  { value: 'full', label: '全機能' },
];

export function Home() {
  const { settings, update } = useSettings();
  const mode = settings.mode;
  const minimal = mode === 'minimal';
  const choices = minimal ? CHOICES.filter((c) => c.minimal) : CHOICES;

  useEffect(() => {
    document.title = '余白。';
  }, []);

  return (
    <div className={`home home--${mode}`}>
      <header className="home__header">
        <p className="home__tagline">何者にもならなくていい時間。</p>
        <h1 id="page-title" tabIndex={-1} className="home__question">
          今、どう過ごしたいですか？
        </h1>
        {!minimal && <p className="home__sub">選ばなくても大丈夫です。ここにいるだけでも。</p>}
      </header>

      <nav aria-labelledby="page-title">
        <ul className={`home-choices${minimal ? ' is-minimal' : ''}`}>
          {choices.map((c) => (
            <li key={c.to}>
              <a className="home-choice" href={href(c.to)}>
                <span className="home-choice__icon">
                  <Icon name={c.icon} size={minimal ? 30 : 26} />
                </span>
                <span className="home-choice__text">
                  <span className="home-choice__label">{c.label}</span>
                  {!minimal && <span className="home-choice__hint">{c.hint}</span>}
                </span>
                <Icon name="chevron" size={20} className="home-choice__chevron" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {!minimal && (
        <section className="home-quick" aria-labelledby="home-quick-title">
          <h2 id="home-quick-title" className="visually-hidden">
            すぐに使えるもの
          </h2>
          <a className="quick-link" href={href('/card')}>
            <Icon name="card" />
            <span>伝えるカード</span>
          </a>
          <a className="quick-link quick-link--help" href={href('/help')}>
            <Icon name="help" />
            <span>相談窓口・緊急時</span>
          </a>
        </section>
      )}

      {mode === 'full' && (
        <section className="home-more" aria-labelledby="home-more-title">
          <h2 id="home-more-title" className="section__title">
            ほかの機能
          </h2>
          <ul className="more-grid">
            {MORE.map((m) => (
              <li key={m.to}>
                <a className="more-link" href={href(m.to)}>
                  <Icon name={m.icon} size={22} />
                  <span>{m.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <fieldset className="mode-switch">
        <legend>画面に出す量</legend>
        <div className="mode-switch__options">
          {MODE_OPTIONS.map((o) => (
            <label key={o.value} className={`mode-switch__option${mode === o.value ? ' is-checked' : ''}`}>
              <input type="radio" name="home-mode" value={o.value} checked={mode === o.value} onChange={() => update({ mode: o.value })} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        <p className="mode-switch__hint">その日の気分で、いつでも変えられます。どの表示でも相談窓口は使えます。</p>
      </fieldset>

      {!minimal && (
        <p className="home__footer">
          <a href={href('/supporters')}>支える立場の方へ</a>
          <span aria-hidden="true"> ・ </span>
          <a href={href('/about')}>余白。について</a>
        </p>
      )}
    </div>
  );
}
