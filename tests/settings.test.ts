import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, parseSettings, serializeSettings } from '../src/lib/settings';

describe('設定の読み込み', () => {
  it('保存がないときは初期値（標準表示・保存は毎回えらぶ）', () => {
    const s = parseSettings(null);
    expect(s).toEqual(DEFAULT_SETTINGS);
    expect(s.mode).toBe('standard');
    expect(s.saveMode).toBe('ask');
  });

  it('壊れた値・想定外の値は初期値に戻す', () => {
    expect(parseSettings('{not json')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('"text"')).toEqual(DEFAULT_SETTINGS);
    const s = parseSettings(JSON.stringify({ mode: 'evil', theme: '<script>', fontSize: 99, volume: 7, restScene: 'x' }));
    expect(s.mode).toBe('standard');
    expect(s.theme).toBe('system');
    expect(s.fontSize).toBe('m');
    expect(s.volume).toBe(DEFAULT_SETTINGS.volume);
    expect(s.restScene).toBe('rain');
  });

  it('正しい値は読み込む', () => {
    const s = parseSettings(JSON.stringify({ mode: 'minimal', theme: 'dark', fontSize: 'xl', volume: 0.2, reduceMotion: true, saveMode: 'never', restScene: 'fire', restShowText: false }));
    expect(s).toMatchObject({ mode: 'minimal', theme: 'dark', fontSize: 'xl', volume: 0.2, reduceMotion: true, saveMode: 'never', restScene: 'fire', restShowText: false });
  });

  it('「記憶しない」のときは、その印以外を保存しない', () => {
    const raw = serializeSettings({ ...DEFAULT_SETTINGS, remember: false, mode: 'minimal', theme: 'dark' });
    expect(JSON.parse(raw)).toEqual({ remember: false });
    expect(parseSettings(raw)).toEqual({ ...DEFAULT_SETTINGS, remember: false });
  });
});
