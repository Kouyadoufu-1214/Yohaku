/**
 * コピー・共有・書き出し。いずれも利用者がボタンを押したときだけ動作し、
 * アプリ側から勝手に送信することはない。
 */

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 下の方法を試す */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.className = 'visually-hidden';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function canShareText(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export type ShareResult = 'shared' | 'cancelled' | 'unsupported' | 'failed';

/** OS の共有機能を開く（送信先は利用者が選ぶ） */
export async function shareText(text: string, title?: string): Promise<ShareResult> {
  if (!canShareText()) return 'unsupported';
  try {
    await navigator.share({ text, ...(title ? { title } : {}) });
    return 'shared';
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}

export async function shareFile(file: File, title?: string): Promise<ShareResult> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (!canShareText() || !nav.canShare?.({ files: [file] })) return 'unsupported';
  try {
    await navigator.share({ files: [file], ...(title ? { title } : {}) });
    return 'shared';
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}

/** 端末にファイルとして保存（ダウンロード） */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(text: string, filename: string): void {
  // Windows のメモ帳などでも文字化けしないよう BOM 付き UTF-8 にする
  downloadBlob(new Blob(['﻿', text], { type: 'text/plain;charset=utf-8' }), filename);
}

export function dateStamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`;
}
