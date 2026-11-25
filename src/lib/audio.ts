import type { SceneId } from './settings';

/**
 * 環境音エンジン（Web Audio API による合成音。音声ファイルを使わないため、素材の権利問題がありません）
 *
 * - 利用者が再生ボタンを押したときだけ AudioContext を作成・再生する（自動再生しない）
 * - 再生開始・停止は数秒かけてゆっくり音量を変える（突然の音を出さない）
 * - 外部への通信は行わない
 */

export interface AudioState {
  playing: SceneId | null;
  muted: boolean;
  volume: number;
}

type Listener = (s: AudioState) => void;

interface ActiveScene {
  id: SceneId;
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
  timers: number[];
}

const FADE_IN = 2.5;
const FADE_OUT = 1.2;

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private crackle: AudioBuffer | null = null;
  private drops: AudioBuffer | null = null;
  private active: ActiveScene | null = null;
  private listeners = new Set<Listener>();
  private state: AudioState = { playing: null, muted: false, volume: 0.4 };

  get supported(): boolean {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  getState(): AudioState {
    return this.state;
  }

  private emit(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.effectiveVolume();
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.noise = makeNoiseBuffer(ctx, 6);
    this.crackle = makeCrackleBuffer(ctx, 9);
    this.drops = makeDropsBuffer(ctx, 7);
    return ctx;
  }

  private effectiveVolume(): number {
    if (this.state.muted) return 0;
    // 聴感に合わせて二乗カーブにし、最大値も控えめにする
    return Math.pow(this.state.volume, 2) * 0.9;
  }

  setVolume(v: number) {
    const volume = Math.min(1, Math.max(0, v));
    this.emit({ volume });
    this.applyVolume();
  }

  setMuted(muted: boolean) {
    this.emit({ muted });
    this.applyVolume();
  }

  private applyVolume() {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(this.effectiveVolume(), this.ctx.currentTime, 0.15);
  }

  async play(id: SceneId) {
    if (!this.supported) return;
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* noop */
      }
    }
    if (this.active?.id === id) return;
    this.stopActive();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_IN);
    gain.connect(this.master!);
    const scene: ActiveScene = { id, gain, sources: [], timers: [] };
    this.build(scene);
    this.active = scene;
    this.emit({ playing: id });
  }

  stop() {
    this.stopActive();
    this.emit({ playing: null });
  }

  private stopActive() {
    const scene = this.active;
    const ctx = this.ctx;
    if (!scene || !ctx) return;
    this.active = null;
    scene.timers.forEach((t) => window.clearTimeout(t));
    const now = ctx.currentTime;
    scene.gain.gain.cancelScheduledValues(now);
    scene.gain.gain.setValueAtTime(scene.gain.gain.value, now);
    scene.gain.gain.linearRampToValueAtTime(0, now + FADE_OUT);
    scene.sources.forEach((s) => {
      try {
        s.stop(now + FADE_OUT + 0.1);
      } catch {
        /* noop */
      }
    });
    window.setTimeout(() => scene.gain.disconnect(), (FADE_OUT + 0.3) * 1000);
  }

  // ---- 合成のための部品 ----

  private loop(scene: ActiveScene, buffer: AudioBuffer, offset = 0): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.start(ctx.currentTime, offset % buffer.duration);
    scene.sources.push(src);
    return src;
  }

  private filter(type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = q;
    return f;
  }

  private gainNode(value: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    return g;
  }

  /** ゆっくり揺らぐ変化（LFO）を AudioParam に加える */
  private lfo(scene: ActiveScene, target: AudioParam, frequency: number, depth: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.frequency.value = frequency;
    const g = ctx.createGain();
    g.gain.value = depth;
    osc.connect(g).connect(target);
    osc.start();
    scene.sources.push(osc);
  }

  /** ノイズ → フィルター群 → 音量 → シーン出力 */
  private layer(scene: ActiveScene, buffer: AudioBuffer, filters: BiquadFilterNode[], level: number, offset = 0): GainNode {
    let node: AudioNode = this.loop(scene, buffer, offset);
    for (const f of filters) {
      node.connect(f);
      node = f;
    }
    const g = this.gainNode(level);
    node.connect(g).connect(scene.gain);
    return g;
  }

  private build(scene: ActiveScene) {
    const n = this.noise!;
    switch (scene.id) {
      case 'rain': {
        this.layer(scene, n, [this.filter('highpass', 400), this.filter('lowpass', 6500)], 0.16);
        this.layer(scene, n, [this.filter('lowpass', 900)], 0.32, 2.1);
        this.layer(scene, this.drops!, [this.filter('bandpass', 2600, 0.8)], 0.5);
        break;
      }
      case 'night': {
        this.layer(scene, n, [this.filter('lowpass', 240)], 0.5);
        const air = this.layer(scene, n, [this.filter('bandpass', 1100, 0.6)], 0.025, 3.3);
        this.lfo(scene, air.gain, 0.04, 0.015);
        break;
      }
      case 'sea': {
        const lp = this.filter('lowpass', 650);
        const body = this.layer(scene, n, [lp], 0.38);
        this.lfo(scene, body.gain, 0.075, 0.22);
        this.lfo(scene, lp.frequency, 0.075, 320);
        const foam = this.layer(scene, n, [this.filter('highpass', 1600), this.filter('lowpass', 5000)], 0.04, 1.7);
        this.lfo(scene, foam.gain, 0.075, 0.035);
        break;
      }
      case 'forest': {
        const leaves = this.layer(scene, n, [this.filter('bandpass', 2400, 0.6)], 0.1);
        this.lfo(scene, leaves.gain, 0.05, 0.06);
        this.layer(scene, n, [this.filter('lowpass', 420)], 0.14, 2.5);
        this.scheduleBirds(scene);
        break;
      }
      case 'stars': {
        const bp = this.filter('bandpass', 480, 1.6);
        const wind = this.layer(scene, n, [bp], 0.34);
        this.lfo(scene, bp.frequency, 0.03, 160);
        this.lfo(scene, wind.gain, 0.025, 0.14);
        break;
      }
      case 'dusk': {
        const bp = this.filter('bandpass', 850, 0.9);
        const breeze = this.layer(scene, n, [bp], 0.18);
        this.lfo(scene, bp.frequency, 0.05, 250);
        this.lfo(scene, breeze.gain, 0.04, 0.08);
        this.layer(scene, n, [this.filter('lowpass', 200)], 0.24, 4.2);
        break;
      }
      case 'fire': {
        const rumble = this.layer(scene, n, [this.filter('lowpass', 330)], 0.42);
        this.lfo(scene, rumble.gain, 0.2, 0.06);
        this.layer(scene, this.crackle!, [this.filter('highpass', 900), this.filter('lowpass', 7000)], 0.55);
        break;
      }
    }
  }

  /** 森の鳥の声：まれに、小さく、やわらかい立ち上がりで */
  private scheduleBirds(scene: ActiveScene) {
    const ctx = this.ctx!;
    const chirp = () => {
      if (this.active !== scene) return;
      const t0 = ctx.currentTime + 0.05;
      const notes = 2 + Math.floor(Math.random() * 3);
      const base = 2600 + Math.random() * 1200;
      for (let i = 0; i < notes; i++) {
        const start = t0 + i * (0.16 + Math.random() * 0.08);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, start);
        osc.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.2), start + 0.09);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.018, start + 0.03);
        g.gain.linearRampToValueAtTime(0, start + 0.12);
        osc.connect(g).connect(scene.gain);
        osc.start(start);
        osc.stop(start + 0.15);
      }
      scene.timers.push(window.setTimeout(chirp, 7000 + Math.random() * 11000));
    };
    scene.timers.push(window.setTimeout(chirp, 5000 + Math.random() * 5000));
  }
}

function makeNoiseBuffer(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** 暖炉のぱちぱち音：まばらな短いノイズの粒 */
function makeCrackleBuffer(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  let t = 0;
  while (t < len) {
    t += Math.floor(sr * (0.04 + Math.random() * 0.45));
    const amp = 0.15 + Math.random() * 0.45;
    const dur = Math.floor(sr * (0.002 + Math.random() * 0.012));
    for (let i = 0; i < dur && t + i < len; i++) {
      d[t + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (dur / 3));
    }
  }
  return buf;
}

/** 窓に当たる雨粒：細かい粒をまばらに */
function makeDropsBuffer(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  let t = 0;
  while (t < len) {
    t += Math.floor(sr * (0.01 + Math.random() * 0.09));
    const amp = 0.05 + Math.random() * 0.2;
    const dur = Math.floor(sr * (0.001 + Math.random() * 0.004));
    for (let i = 0; i < dur && t + i < len; i++) {
      d[t + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (dur / 4));
    }
  }
  return buf;
}

export const ambient = new AmbientEngine();
