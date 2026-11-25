import { useEffect, useRef, useState } from 'react';
import { Layout } from './components/Layout';
import { AnnounceProvider } from './components/ui';
import { useRoute } from './lib/router';
import { useSettings } from './lib/settings';
import { ambient } from './lib/audio';
import { Home } from './pages/Home';
import { Rest } from './pages/Rest';
import { Life, LifeCategoryPage, LifeItemPage } from './pages/Life';
import { FeelingsHub } from './pages/FeelingsHub';
import { FeelingsSort } from './pages/FeelingsSort';
import { LeaveWords } from './pages/LeaveWords';
import { Records } from './pages/Records';
import { CardPage } from './pages/CardPage';
import { MessagePage } from './pages/MessagePage';
import { Stories, StoryPage } from './pages/Stories';
import { Steps, StepPlanPage } from './pages/Steps';
import { Supporters } from './pages/Supporters';
import { Help } from './pages/Help';
import { SettingsPage } from './pages/SettingsPage';
import { Privacy, Terms, About } from './pages/Documents';
import { Together } from './pages/Together';
import { Small } from './pages/Small';
import { NotFound } from './pages/NotFound';

function renderRoute(path: string, setImmersive: (v: boolean) => void) {
  const parts = path.split('/').filter(Boolean);
  const [a, b, c] = parts;
  switch (a) {
    case undefined:
      return <Home />;
    case 'rest':
      return <Rest onImmersiveChange={setImmersive} />;
    case 'life':
      if (b && c) return <LifeItemPage categoryId={b} itemId={c} />;
      if (b) return <LifeCategoryPage categoryId={b} />;
      return <Life />;
    case 'feelings':
      if (b === 'sort') return <FeelingsSort />;
      if (b === 'leave') return <LeaveWords />;
      if (b === 'records') return <Records />;
      return <FeelingsHub />;
    case 'card':
      return <CardPage />;
    case 'message':
      return <MessagePage />;
    case 'stories':
      return b ? <StoryPage id={b} /> : <Stories />;
    case 'steps':
      return b ? <StepPlanPage id={b} /> : <Steps />;
    case 'supporters':
      return <Supporters />;
    case 'help':
      return <Help />;
    case 'settings':
      return <SettingsPage />;
    case 'privacy':
      return <Privacy />;
    case 'terms':
      return <Terms />;
    case 'about':
      return <About />;
    case 'together':
      return <Together />;
    case 'small':
      return <Small />;
    default:
      return <NotFound />;
  }
}

export function App() {
  const path = useRoute();
  const { settings } = useSettings();
  const [immersive, setImmersive] = useState(false);
  const first = useRef(true);

  // 環境音の音量を設定と同期
  useEffect(() => {
    ambient.setVolume(settings.volume);
  }, [settings.volume]);

  // 画面が変わったら先頭へ移動し、見出しにフォーカスを移す（スクリーンリーダー・キーボード利用のため）
  useEffect(() => {
    if (!path.startsWith('/rest')) setImmersive(false);
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    const t = window.setTimeout(() => {
      const h = document.getElementById('page-title');
      h?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(t);
  }, [path]);

  return (
    <AnnounceProvider>
      <Layout path={path} immersive={immersive}>
        {/* 画面ごとに状態をリセットするため path を key にする */}
        <div key={path} className="route">
          {renderRoute(path, setImmersive)}
        </div>
      </Layout>
    </AnnounceProvider>
  );
}
