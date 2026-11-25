import { useEffect, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { href } from '../lib/router';
import { ambient, type AudioState } from '../lib/audio';
import { SCENE_LABELS } from './scenes';

const NAV: { to: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { to: '/', label: 'ホーム', icon: 'home', match: (p) => p === '/' },
  { to: '/rest', label: '休憩', icon: 'rest', match: (p) => p.startsWith('/rest') },
  { to: '/life', label: '生活支援', icon: 'life', match: (p) => p.startsWith('/life') || p.startsWith('/steps') || p.startsWith('/small') },
  { to: '/feelings', label: '気持ち', icon: 'feelings', match: (p) => p.startsWith('/feelings') || p.startsWith('/card') || p.startsWith('/message') },
  { to: '/settings', label: '設定', icon: 'settings', match: (p) => p.startsWith('/settings') || p.startsWith('/privacy') || p.startsWith('/terms') || p.startsWith('/about') },
];

function useAudioState(): AudioState {
  const [s, setS] = useState<AudioState>(ambient.getState());
  useEffect(() => ambient.subscribe(setS), []);
  return s;
}

export function Layout({ path, immersive, children }: { path: string; immersive: boolean; children: ReactNode }) {
  const audio = useAudioState();

  const skipToMain = (e: React.MouseEvent) => {
    e.preventDefault();
    const main = document.getElementById('main');
    main?.focus();
  };

  return (
    <div className={`app${immersive ? ' is-immersive' : ''}`}>
      <a className="skip-link" href="#main" onClick={skipToMain}>
        本文へ移動
      </a>
      {!immersive && (
        <header className="app-header">
          <div className="app-header__inner">
            <a className="brand" href={href('/')} aria-label="余白。ホームへ">
              <span className="brand__mark" aria-hidden="true" />
              <span className="brand__name">余白。</span>
            </a>
            <div className="app-header__actions">
              {audio.playing && (
                <button type="button" className="pill" onClick={() => ambient.stop()}>
                  <Icon name="stop" size={18} />
                  <span>
                    音を止める<span className="visually-hidden">（{SCENE_LABELS[audio.playing]}の環境音）</span>
                  </span>
                </button>
              )}
              <a className={`help-button${path === '/help' ? ' is-current' : ''}`} href={href('/help')} aria-current={path === '/help' ? 'page' : undefined}>
                <Icon name="help" size={20} />
                <span>相談窓口</span>
              </a>
            </div>
          </div>
        </header>
      )}
      <main id="main" tabIndex={-1} className="main">
        {children}
      </main>
      {!immersive && (
        <nav className="bottom-nav" aria-label="主なメニュー">
          <ul>
            {NAV.map((n) => {
              const current = n.match(path);
              return (
                <li key={n.to}>
                  <a href={href(n.to)} aria-current={current ? 'page' : undefined} className={current ? 'is-current' : undefined}>
                    <Icon name={n.icon} />
                    <span>{n.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
