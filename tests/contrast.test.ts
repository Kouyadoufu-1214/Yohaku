import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** tokens.css から各テーマの色を読み取り、WCAG 2.2 AA のコントラスト比を確認する */
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function block(selector: string): Record<string, string> {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error(`not found: ${selector}`);
  const start = css.indexOf('{', i);
  const end = css.indexOf('}', start);
  const out: Record<string, string> = {};
  for (const m of css.slice(start + 1, end).matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}

function luminance(hex: string): number {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const themes = {
  light: block(':root {'),
  dark: block(":root[data-theme='dark']"),
};

// [前景, 背景, 必要な比]
const TEXT = 4.5;
const UI = 3;
const pairs: [string, string, number][] = [
  ['text', 'bg', TEXT],
  ['text', 'surface', TEXT],
  ['text', 'surface-2', TEXT],
  ['text-muted', 'bg', TEXT],
  ['text-muted', 'surface', TEXT],
  ['text-muted', 'notice-bg', TEXT],
  ['link', 'bg', TEXT],
  ['link', 'surface', TEXT],
  ['on-primary', 'primary-strong', TEXT],
  ['on-accent', 'accent', TEXT],
  ['text', 'sub', TEXT],
  ['on-primary', 'primary-strong', TEXT],
  ['text', 'notice-bg', TEXT],
  ['text', 'care-bg', TEXT],
  ['text', 'emergency-bg', TEXT],
  ['toast-text', 'toast-bg', TEXT],
  ['error', 'bg', TEXT],
  ['success', 'bg', TEXT],
  ['border-strong', 'bg', UI],
  ['border-strong', 'surface', UI],
  ['selected-border', 'sub', UI],
  ['selected-border', 'bg', UI],
  ['focus', 'bg', UI],
  ['focus', 'surface', UI],
  ['primary-strong', 'bg', UI],
];

describe('色のコントラスト（WCAG 2.2 AA）', () => {
  for (const [name, t] of Object.entries(themes)) {
    for (const [fg, bg, min] of pairs) {
      it(`${name}: ${fg} / ${bg} ≥ ${min}`, () => {
        expect(t[fg], `--color-${fg}`).toBeTruthy();
        expect(t[bg], `--color-${bg}`).toBeTruthy();
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  }

  it('端末設定によるダークテーマと手動のダークテーマが同じ色', () => {
    const media = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'));
    const auto = block.call(null, ":root:not([data-theme='light'])");
    expect(media.length).toBeGreaterThan(0);
    expect(auto).toEqual(themes.dark);
  });
});
