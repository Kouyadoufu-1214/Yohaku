import { useEffect, useRef, useState } from 'react';
import { PageHeader, Section, Switch, Button } from '../components/ui';
import { Icon } from '../components/Icon';
import { SceneArt, SCENE_LABELS, SCENE_ORDER, SCENE_SOUND_LABELS } from '../components/scenes';
import { useSettings, type SceneId } from '../lib/settings';
import { ambient, type AudioState } from '../lib/audio';
import { href } from '../lib/router';

const SWATCH: Record<SceneId, [string, string]> = {
  rain: ['#AAB8BB', '#B4A389'],
  night: ['#1D2735', '#D8C5A5'],
  sea: ['#DCE4E2', '#94AEAF'],
  forest: ['#D9E2D4', '#95A994'],
  stars: ['#1A2330', '#ECE9DD'],
  dusk: ['#D8BFB8', '#8F9A92'],
  fire: ['#3A312B', '#E3A066'],
};

export function Rest({ onImmersiveChange }: { onImmersiveChange: (v: boolean) => void }) {
  const { settings, update, motionReduced } = useSettings();
  const scene = settings.restScene;
  const [audio, setAudio] = useState<AudioState>(ambient.getState());
  const [immersive, setImmersive] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLButtonElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => ambient.subscribe(setAudio), []);

  useEffect(() => {
    onImmersiveChange(immersive);
  }, [immersive, onImmersiveChange]);

  // 全画面表示の終了（Esc キーやOSの操作）に合わせる
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImmersive(false);
    };
    document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (immersive) exitRef.current?.focus();
  }, [immersive]);

  const enterImmersive = () => {
    setImmersive(true);
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {
        /* 全画面に対応していない端末では、画面いっぱいの表示だけにする */
      });
    }
  };

  const exitImmersive = () => {
    setImmersive(false);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    window.setTimeout(() => enterRef.current?.focus(), 50);
  };

  const playing = audio.playing === scene;
  const toggleSound = () => {
    if (playing) ambient.stop();
    else void ambient.play(scene);
  };

  const chooseScene = (id: SceneId) => {
    update({ restScene: id });
    // 音を流している場合は、新しい背景の音にゆっくり切り替える
    if (audio.playing) void ambient.play(id);
  };

  const stage = (
    <div ref={stageRef} className={`rest-stage${immersive ? ' is-immersive' : ''}${motionReduced ? ' is-still' : ''}`} data-scene={scene}>
      <div className="rest-stage__art">
        <SceneArt id={scene} />
      </div>
      <p className="visually-hidden">背景：{SCENE_LABELS[scene]}</p>
      {settings.restShowText && (
        <div className="rest-stage__words">
          <p>ここでは、何もしなくて大丈夫です。</p>
          {!immersive && <p className="rest-stage__words-sub">ぼんやりしていても、眠ってしまっても、いいのです。</p>}
        </div>
      )}
      {immersive && (
        <div className="rest-stage__overlay">
          <button ref={exitRef} type="button" className="overlay-btn" onClick={exitImmersive}>
            <Icon name="close" size={20} />
            <span>表示を戻す</span>
          </button>
          <a className="overlay-btn" href={href('/help')} onClick={() => exitImmersive()}>
            <Icon name="help" size={20} />
            <span>相談窓口</span>
          </a>
        </div>
      )}
    </div>
  );

  if (immersive) return stage;

  return (
    <div className="rest">
      <PageHeader title="心の休憩室" lead={<p>何もする必要はありません。ただ、ここにいるだけでいい場所です。時間は計りません。</p>} />
      {stage}

      <Section title="背景">
        <div className="scene-picker" role="radiogroup" aria-label="背景を選ぶ">
          {SCENE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={scene === id}
              className={`scene-option${scene === id ? ' is-checked' : ''}`}
              onClick={() => chooseScene(id)}
            >
              <span className="scene-option__swatch" aria-hidden="true" data-scene={id}>
                <span style={{ background: SWATCH[id][0] }} />
                <span style={{ background: SWATCH[id][1] }} />
              </span>
              <span className="scene-option__label">{SCENE_LABELS[id]}</span>
              {scene === id && <Icon name="check" size={18} className="scene-option__check" />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="環境音">
        {ambient.supported ? (
          <>
            <p className="muted small">音は自動では流れません。押したときだけ、ゆっくり小さく流れ始めます。音はこの端末の中で作られていて、通信はしません。</p>
            <div className="sound-controls">
              <Button variant="primary" icon={playing ? 'stop' : 'play'} onClick={toggleSound} pressed={playing}>
                {playing ? '音を止める' : `${SCENE_SOUND_LABELS[scene]}を流す`}
              </Button>
              <Button icon={audio.muted ? 'mute' : 'volume'} onClick={() => ambient.setMuted(!audio.muted)} pressed={audio.muted}>
                {audio.muted ? 'ミュート中' : 'ミュート'}
              </Button>
            </div>
            <div className="range">
              <label htmlFor="rest-volume">音量</label>
              <input
                id="rest-volume"
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(settings.volume * 100)}
                aria-valuetext={`${Math.round(settings.volume * 100)}パーセント`}
                onChange={(e) => update({ volume: Number(e.target.value) / 100 })}
              />
              <output htmlFor="rest-volume">{Math.round(settings.volume * 100)}%</output>
            </div>
          </>
        ) : (
          <p className="muted">このブラウザでは環境音を再生できません。</p>
        )}
      </Section>

      <Section title="表示">
        <Switch label="ことばを表示する" checked={settings.restShowText} onChange={(v) => update({ restShowText: v })} />
        <Switch
          label="動きを止める"
          hint="背景のアニメーションを止めます。アプリ全体の動きも少なくなります。"
          checked={motionReduced}
          onChange={(v) => update({ reduceMotion: v })}
        />
        <div className="actions">
          <button ref={enterRef} type="button" className="btn btn--secondary" onClick={enterImmersive}>
            <Icon name="expand" size={20} />
            <span>全画面で表示する</span>
          </button>
        </div>
        <p className="muted small">全画面のときも、画面の上に「表示を戻す」と「相談窓口」が出ています。Esc キーでも戻れます。</p>
      </Section>
    </div>
  );
}
