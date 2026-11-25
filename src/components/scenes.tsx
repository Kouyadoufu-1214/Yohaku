import type { SceneId } from '../lib/settings';

/**
 * 心の休憩室の背景（すべて自作のSVG。外部の画像素材は使用しない）
 * アニメーションはゆっくり・低コントラストにし、点滅（1秒に3回以上の明滅）を起こさない。
 */

export const SCENE_LABELS: Record<SceneId, string> = {
  rain: '雨の降る窓辺',
  night: '静かな夜の部屋',
  sea: '海辺',
  forest: '森の中',
  stars: '星空',
  dusk: '夕暮れ',
  fire: '暖炉のある部屋',
};

export const SCENE_SOUND_LABELS: Record<SceneId, string> = {
  rain: '雨の音',
  night: '夜の静かな空気の音',
  sea: '波の音',
  forest: '木の葉と鳥の声',
  stars: '夜風の音',
  dusk: '夕方の風の音',
  fire: '薪の燃える音',
};

export const SCENE_ORDER: SceneId[] = ['rain', 'night', 'sea', 'forest', 'stars', 'dusk', 'fire'];

/** 決まった並びの疑似乱数（描画のたびに位置が変わらないように） */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function RainScene() {
  const lines = Array.from({ length: 34 }, (_, i) => {
    const x = 195 + seeded(i) * 410;
    const y = seeded(i + 100) * 360;
    return { x, y };
  });
  const drops = [
    { x: 260, d: 0, dur: 13 },
    { x: 340, d: 4, dur: 16 },
    { x: 470, d: 2, dur: 12 },
    { x: 545, d: 7, dur: 15 },
    { x: 410, d: 10, dur: 14 },
  ];
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill="#D8D3C9" />
      <rect x="0" y="500" width="800" height="100" fill="#CBC5B9" />
      <rect x="170" y="70" width="460" height="400" rx="6" fill="#B4A389" />
      <clipPath id="glass">
        <rect x="190" y="90" width="420" height="360" />
      </clipPath>
      <rect x="190" y="90" width="420" height="360" fill="#AAB8BB" />
      <g clipPath="url(#glass)">
        <path d="M190 360 L230 330 L260 345 L300 300 L340 330 L380 310 L420 340 L470 290 L520 325 L560 305 L610 335 L610 450 L190 450 Z" fill="#9AABAF" />
        <path d="M190 400 L250 380 L320 395 L400 370 L480 392 L560 378 L610 390 L610 450 L190 450 Z" fill="#8FA1A5" />
        <g className="anim rain-fall">
          {lines.map((l, i) => (
            <g key={i}>
              <line x1={l.x} y1={l.y - 360} x2={l.x - 3} y2={l.y - 340} stroke="#E4EAEA" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
              <line x1={l.x} y1={l.y} x2={l.x - 3} y2={l.y + 20} stroke="#E4EAEA" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {drops.map((d, i) => (
          <ellipse
            key={i}
            className="anim drop"
            cx={d.x}
            cy={110}
            rx="3.2"
            ry="4.4"
            fill="#EEF2F1"
            fillOpacity="0.7"
            style={{ animationDelay: `${d.d}s`, animationDuration: `${d.dur}s` }}
          />
        ))}
      </g>
      <rect x="397" y="90" width="6" height="360" fill="#B4A389" />
      <rect x="190" y="267" width="420" height="6" fill="#B4A389" />
      <rect x="150" y="468" width="500" height="20" rx="3" fill="#A69479" />
      <path d="M480 440 h34 v22 a10 10 0 0 1 -10 10 h-14 a10 10 0 0 1 -10 -10 Z" fill="#EDE7DC" />
      <path d="M514 446 a8 8 0 0 1 0 14" stroke="#EDE7DC" strokeWidth="4" fill="none" />
      <path className="anim steam" d="M492 432 c-4 -8 4 -12 0 -20 M502 432 c-4 -8 4 -12 0 -20" stroke="#F6F3EE" strokeOpacity="0.7" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function NightScene() {
  const stars = Array.from({ length: 10 }, (_, i) => ({ x: 400 + seeded(i + 7) * 210, y: 110 + seeded(i + 33) * 170, r: 0.8 + seeded(i + 51) * 1.2 }));
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill="#2E3641" />
      <rect y="470" width="800" height="130" fill="#252B33" />
      <rect x="380" y="80" width="250" height="250" rx="4" fill="#3C4552" />
      <rect x="392" y="92" width="226" height="226" fill="#1D2735" />
      <circle cx="560" cy="150" r="26" fill="#E6E0CC" />
      <circle cx="571" cy="143" r="24" fill="#1D2735" />
      {stars.map((s, i) => (
        <circle key={i} className="anim star" cx={s.x} cy={s.y} r={s.r} fill="#E7E4D8" style={{ animationDelay: `${(i % 5) * 1.3}s` }} />
      ))}
      <rect x="502" y="92" width="6" height="226" fill="#3C4552" />
      <rect x="392" y="202" width="226" height="6" fill="#3C4552" />
      <ellipse className="anim glow" cx="200" cy="330" rx="190" ry="150" fill="#F0D9AE" fillOpacity="0.16" />
      <rect x="110" y="400" width="190" height="14" rx="3" fill="#4A4038" />
      <rect x="125" y="414" width="10" height="70" fill="#40372F" />
      <rect x="275" y="414" width="10" height="70" fill="#40372F" />
      <rect x="196" y="320" width="8" height="80" fill="#8A7E70" />
      <rect x="170" y="394" width="60" height="8" rx="3" fill="#8A7E70" />
      <path d="M160 320 L240 320 L222 268 L178 268 Z" fill="#D8C5A5" />
      <path d="M690 470 c-6 -40 4 -70 20 -100 c-2 30 -6 60 -4 100 Z" fill="#3E4A44" />
      <path d="M700 470 c10 -30 26 -50 50 -64 c-16 22 -26 42 -34 64 Z" fill="#46534C" />
      <rect x="680" y="470" width="44" height="40" rx="4" fill="#4E4740" />
    </svg>
  );
}

function SeaScene() {
  const wave = (y: number, amp: number) => {
    let d = `M-200 ${y}`;
    for (let x = -200; x < 1200; x += 100) d += ` q 50 ${-amp} 100 0`;
    d += ` V 600 H -200 Z`;
    return d;
  };
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill="#DCE4E2" />
      <circle cx="560" cy="170" r="40" fill="#EFE9DA" />
      <path d="M0 300 h800 v200 h-800 Z" fill="#94AEAF" />
      <rect y="298" width="800" height="4" fill="#86A1A3" />
      <path className="anim wave wave--slow" d={wave(350, 6)} fill="#88A3A5" />
      <path className="anim wave wave--mid" d={wave(400, 8)} fill="#7E9A9C" />
      <path className="anim wave wave--fast" d={wave(445, 7)} fill="#A3BAB9" />
      <path className="anim shore" d="M-20 480 C 150 465 300 492 450 476 S 700 470 820 484 V 600 H -20 Z" fill="#EFEBE1" />
      <path d="M-20 492 C 150 480 300 505 450 490 S 700 485 820 498 V 600 H -20 Z" fill="#E3DAC7" />
    </svg>
  );
}

function ForestScene() {
  const tree = (x: number, base: number, h: number, w: number, fill: string, key: string) => (
    <path key={key} d={`M${x} ${base - h} L${x + w / 2} ${base} L${x - w / 2} ${base} Z`} fill={fill} />
  );
  const far = [60, 150, 250, 330, 430, 520, 610, 700, 780].map((x, i) => tree(x, 380, 170 + seeded(i) * 60, 110, '#B7C5B1', `f${i}`));
  const mid = [20, 140, 290, 400, 560, 680, 800].map((x, i) => tree(x, 450, 220 + seeded(i + 9) * 70, 140, '#95A994', `m${i}`));
  const leaves = [
    { x: 220, d: 0, dur: 19 },
    { x: 470, d: 6, dur: 23 },
    { x: 640, d: 12, dur: 21 },
  ];
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill="#D9E2D4" />
      <polygon className="anim rays" points="430,0 520,0 380,600 250,600" fill="#F6F4EE" fillOpacity="0.35" />
      <polygon className="anim rays rays--late" points="560,0 610,0 520,600 450,600" fill="#F6F4EE" fillOpacity="0.25" />
      {far}
      {mid}
      <rect y="440" width="800" height="160" fill="#AAB89F" />
      <rect x="110" y="250" width="26" height="260" fill="#71836F" />
      <path d="M123 120 L200 300 L46 300 Z" fill="#7F937D" />
      <path d="M123 190 L215 390 L31 390 Z" fill="#788C76" />
      <rect x="650" y="280" width="22" height="230" fill="#71836F" />
      <path d="M661 170 L730 330 L592 330 Z" fill="#7F937D" />
      <ellipse cx="400" cy="520" rx="420" ry="30" fill="#9DAD93" />
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          className="anim leaf"
          cx={l.x}
          cy={-20}
          rx="6"
          ry="3"
          fill="#A9B98F"
          style={{ animationDelay: `${l.d}s`, animationDuration: `${l.dur}s` }}
        />
      ))}
    </svg>
  );
}

function StarsScene() {
  const stars = Array.from({ length: 46 }, (_, i) => ({
    x: seeded(i + 200) * 800,
    y: seeded(i + 400) * 380,
    r: 0.7 + seeded(i + 600) * 1.6,
    delay: seeded(i + 800) * 8,
    dur: 5 + seeded(i + 900) * 5,
  }));
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A2330" />
          <stop offset="1" stopColor="#2B3747" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#night-sky)" />
      {stars.map((s, i) => (
        <circle
          key={i}
          className="anim star"
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#ECE9DD"
          style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
      <path d="M0 470 L120 400 L210 440 L330 360 L450 430 L560 380 L680 440 L800 400 V600 H0 Z" fill="#18202A" />
      <path d="M0 520 C 200 490 360 530 520 505 S 760 500 800 515 V600 H0 Z" fill="#131A22" />
    </svg>
  );
}

function DuskScene() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B7B3C4" />
          <stop offset="0.55" stopColor="#D8BFB8" />
          <stop offset="1" stopColor="#E8CFB5" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#dusk-sky)" />
      <circle className="anim sun" cx="420" cy="370" r="46" fill="#F0DAB6" />
      <g className="anim cloud">
        <ellipse cx="200" cy="170" rx="90" ry="16" fill="#EAD8CB" fillOpacity="0.7" />
        <ellipse cx="560" cy="120" rx="120" ry="14" fill="#E5D3CB" fillOpacity="0.6" />
        <ellipse cx="640" cy="240" rx="70" ry="10" fill="#EAD8CB" fillOpacity="0.55" />
      </g>
      <path d="M0 400 C 150 360 260 390 400 375 S 650 350 800 380 V600 H0 Z" fill="#8F9A92" />
      <path d="M0 450 C 180 420 320 460 480 440 S 700 430 800 445 V600 H0 Z" fill="#717E77" />
      <path d="M0 510 C 200 490 380 520 560 500 S 760 495 800 505 V600 H0 Z" fill="#59665F" />
    </svg>
  );
}

function FireScene() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill="#3A312B" />
      <rect y="480" width="800" height="120" fill="#2E2722" />
      <ellipse className="anim glow" cx="400" cy="500" rx="330" ry="70" fill="#E7A86C" fillOpacity="0.14" />
      <rect x="200" y="150" width="400" height="34" rx="4" fill="#6B5C52" />
      <rect x="230" y="184" width="340" height="300" fill="#5D5048" />
      <path d="M280 484 V300 a120 110 0 0 1 240 0 V484 Z" fill="#1F1A17" />
      <g className="flames">
        <path className="anim flame flame--1" d="M400 460 C 340 440 345 370 380 330 C 380 370 400 380 404 350 C 410 320 430 300 420 260 C 470 310 470 400 400 460 Z" fill="#D98C5F" />
        <path className="anim flame flame--2" d="M360 462 C 330 440 335 400 352 380 C 356 405 370 410 372 392 C 390 410 395 445 360 462 Z" fill="#E3A066" />
        <path className="anim flame flame--3" d="M440 462 C 470 440 468 405 452 385 C 450 410 436 412 434 396 C 418 415 412 445 440 462 Z" fill="#E3A066" />
        <path className="anim flame flame--4" d="M402 462 C 375 448 378 410 396 388 C 398 410 410 414 414 400 C 428 420 428 448 402 462 Z" fill="#F0C98B" />
      </g>
      <rect x="320" y="455" width="160" height="18" rx="9" fill="#6B4E3A" />
      <rect x="340" y="466" width="130" height="16" rx="8" fill="#5A4130" transform="rotate(-4 405 474)" />
      <rect x="180" y="484" width="440" height="14" rx="3" fill="#6B5C52" />
      <rect x="640" y="380" width="70" height="100" rx="6" fill="#4B3F37" />
      <rect x="650" y="372" width="50" height="10" rx="4" fill="#5A4C43" />
    </svg>
  );
}

export function SceneArt({ id }: { id: SceneId }) {
  switch (id) {
    case 'rain':
      return <RainScene />;
    case 'night':
      return <NightScene />;
    case 'sea':
      return <SeaScene />;
    case 'forest':
      return <ForestScene />;
    case 'stars':
      return <StarsScene />;
    case 'dusk':
      return <DuskScene />;
    case 'fire':
      return <FireScene />;
  }
}
