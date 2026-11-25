/**
 * 意思伝達カードを画像（PNG）にする。Canvas 2D API のみを使用（外部ライブラリなし）。
 */

// 行頭に来てはいけない文字（簡易的な禁則処理）
const NO_LINE_START = new Set('、。，．,.・：；？！?!ー〜）」』】〕〉》ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ'.split(''));

/** 日本語向けの折り返し。1文字ずつ幅を測り、行頭禁則文字は前の行にぶら下げる */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }
    let line = '';
    for (const ch of Array.from(paragraph)) {
      const candidate = line + ch;
      if (line !== '' && measure(candidate) > maxWidth && !NO_LINE_START.has(ch)) {
        lines.push(line);
        line = ch;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

export interface CardImageColors {
  background: string;
  text: string;
  muted: string;
  line: string;
}

const FONT_STACK = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif';

export async function renderCardImage(text: string, colors: CardImageColors): Promise<Blob> {
  const width = 1080;
  const padding = 96;
  const fontSize = text.length > 160 ? 44 : 52;
  const lineHeight = Math.round(fontSize * 1.75);

  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d');
  if (!mctx) throw new Error('画像を作成できませんでした');
  mctx.font = `500 ${fontSize}px ${FONT_STACK}`;
  const lines = wrapText(text.trim(), width - padding * 2, (s) => mctx.measureText(s).width);

  const headerHeight = 120;
  const footerHeight = 110;
  const height = Math.max(1080, padding * 2 + headerHeight + lines.length * lineHeight + footerHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('画像を作成できませんでした');

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = colors.muted;
  ctx.font = `400 34px ${FONT_STACK}`;
  ctx.textBaseline = 'top';
  ctx.fillText('伝えたいこと', padding, padding);

  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padding, padding + 70);
  ctx.lineTo(padding + 120, padding + 70);
  ctx.stroke();

  ctx.fillStyle = colors.text;
  ctx.font = `500 ${fontSize}px ${FONT_STACK}`;
  let y = padding + headerHeight;
  for (const line of lines) {
    ctx.fillText(line, padding, y);
    y += lineHeight;
  }

  ctx.fillStyle = colors.muted;
  ctx.font = `400 30px ${FONT_STACK}`;
  ctx.fillText('余白。', padding, height - padding - 30);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('画像を作成できませんでした'))), 'image/png');
  });
}

/** 現在のテーマの色を CSS 変数から読む */
export function currentCardColors(): CardImageColors {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    background: v('--color-bg', '#F4F2ED'),
    text: v('--color-text', '#34423A'),
    muted: v('--color-text-muted', '#56635B'),
    line: v('--color-primary', '#7C9485'),
  };
}
