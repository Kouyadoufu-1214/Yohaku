import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/** 表示モード。精神状態の評価ではなく「画面に出す情報の量」の好み。 */
export type DisplayMode = 'minimal' | 'standard' | 'full';
export type Theme = 'system' | 'light' | 'dark';
export type FontSize = 's' | 'm' | 'l' | 'xl';
/** 記録の保存設定。ask = 毎回たずねる（保存ボタンを表示） / never = 保存機能を使わない */
export type SaveMode = 'ask' | 'never';
export type SceneId = 'rain' | 'night' | 'sea' | 'forest' | 'stars' | 'dusk' | 'fire';

export interface Settings {
  mode: DisplayMode;
  theme: Theme;
  fontSize: FontSize;
  /** 環境音の音量 0〜1 */
  volume: number;
  /** null = 端末（OS）の「視差効果を減らす」設定に従う */
  reduceMotion: boolean | null;
  saveMode: SaveMode;
  /** 表示設定を端末に記憶するか */
  remember: boolean;
  restScene: SceneId;
  restShowText: boolean;
}

export const STORAGE_KEY = 'yohaku.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  mode: 'standard',
  theme: 'system',
  fontSize: 'm',
  volume: 0.4,
  reduceMotion: null,
  saveMode: 'ask',
  remember: true,
  restScene: 'rain',
  restShowText: true,
};

const MODES: DisplayMode[] = ['minimal', 'standard', 'full'];
const THEMES: Theme[] = ['system', 'light', 'dark'];
const FONTS: FontSize[] = ['s', 'm', 'l', 'xl'];
const SCENES: SceneId[] = ['rain', 'night', 'sea', 'forest', 'stars', 'dusk', 'fire'];

/** 保存値を検証しながら読み込む（壊れた値や想定外の値は初期値に戻す） */
export function parseSettings(raw: string | null): Settings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  let obj: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
    obj = parsed as Record<string, unknown>;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
  if (obj.remember === false) return { ...DEFAULT_SETTINGS, remember: false };
  const pick = <T,>(value: unknown, list: readonly T[], fallback: T): T =>
    list.includes(value as T) ? (value as T) : fallback;
  const volume =
    typeof obj.volume === 'number' && obj.volume >= 0 && obj.volume <= 1 ? obj.volume : DEFAULT_SETTINGS.volume;
  return {
    mode: pick(obj.mode, MODES, DEFAULT_SETTINGS.mode),
    theme: pick(obj.theme, THEMES, DEFAULT_SETTINGS.theme),
    fontSize: pick(obj.fontSize, FONTS, DEFAULT_SETTINGS.fontSize),
    volume,
    reduceMotion: typeof obj.reduceMotion === 'boolean' ? obj.reduceMotion : null,
    saveMode: pick(obj.saveMode, ['ask', 'never'] as const, DEFAULT_SETTINGS.saveMode),
    remember: true,
    restScene: pick(obj.restScene, SCENES, DEFAULT_SETTINGS.restScene),
    restShowText: typeof obj.restShowText === 'boolean' ? obj.restShowText : true,
  };
}

/** remember=false のときは「記憶しない」という印だけを残し、他の設定は保存しない */
export function serializeSettings(s: Settings): string {
  if (!s.remember) return JSON.stringify({ remember: false });
  return JSON.stringify(s);
}

function readStored(): Settings {
  try {
    return parseSettings(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  /** 実際にアニメーションを減らすか（OS設定も考慮した結果） */
  motionReduced: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readStored);
  const [osReduce, setOsReduce] = useState<boolean>(prefersReducedMotion);

  useEffect(() => {
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {
      return;
    }
    const onChange = () => setOsReduce(mq!.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);

  const motionReduced = settings.reduceMotion ?? osReduce;
  // 利用者が設定を変えたときだけ保存する（起動しただけ・全削除した直後には書き込まない）
  const persist = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-font', settings.fontSize);
    root.setAttribute('data-mode', settings.mode);
    root.setAttribute('data-motion', motionReduced ? 'reduce' : 'full');
    if (!persist.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeSettings(settings));
    } catch {
      /* 保存できない環境（プライベートブラウズ等）でも動作は続ける */
    }
  }, [settings, motionReduced]);

  const update = useCallback((patch: Partial<Settings>) => {
    persist.current = true;
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  /** 初期状態に戻す（保存されていた設定も消す） */
  const reset = useCallback(() => {
    persist.current = false;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const value = useMemo(() => ({ settings, update, reset, motionReduced }), [settings, update, reset, motionReduced]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('SettingsProvider がありません');
  return ctx;
}
