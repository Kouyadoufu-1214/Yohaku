/**
 * 端末内保存（IndexedDB）。外部への送信は一切行わない。
 * 保存は利用者が「保存する」を選んだときだけ行う。
 * ※ 保存内容は暗号化されていません（画面上でもそのように説明しています）。
 */

export const DB_NAME = 'yohaku';
export const DB_VERSION = 1;

export interface NoteRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  text: string;
}

export interface FeelingRecord {
  id: string;
  createdAt: number;
  /** 選んだ気持ちのID（feelings.ts） */
  feelings: string[];
  note: string;
}

export type StoreName = 'notes' | 'feelings';
type RecordOf<S extends StoreName> = S extends 'notes' ? NoteRecord : FeelingRecord;

export class StorageUnavailableError extends Error {
  constructor(message = 'この端末・ブラウザでは保存機能を利用できません') {
    super(message);
    this.name = 'StorageUnavailableError';
  }
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getIndexedDB(): IDBFactory {
  const idb = (globalThis as { indexedDB?: IDBFactory }).indexedDB;
  if (!idb) throw new StorageUnavailableError();
  return idb;
}

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = getIndexedDB().open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(e instanceof StorageUnavailableError ? e : new StorageUnavailableError());
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('feelings')) db.createObjectStore('feelings', { keyPath: 'id' });
    };
    req.onsuccess = () => {
      const db = req.result;
      // 他のタブで削除・更新された場合に接続を閉じる
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(new StorageUnavailableError());
    req.onblocked = () => reject(new StorageUnavailableError('別のタブで開かれているため処理できません'));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        let result: T;
        req.onsuccess = () => {
          result = req.result;
        };
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error ?? new Error('保存処理に失敗しました'));
        t.onabort = () => reject(t.error ?? new Error('保存処理が中断されました'));
      }),
  );
}

export function newId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function putRecord<S extends StoreName>(store: S, value: RecordOf<S>): Promise<void> {
  await tx(store, 'readwrite', (s) => s.put(value));
}

export async function getAllRecords<S extends StoreName>(store: S): Promise<RecordOf<S>[]> {
  const list = await tx<RecordOf<S>[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<RecordOf<S>[]>);
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteRecord(store: StoreName, id: string): Promise<void> {
  await tx(store, 'readwrite', (s) => s.delete(id));
}

export async function clearStore(store: StoreName): Promise<void> {
  await tx(store, 'readwrite', (s) => s.clear());
}

export async function countRecords(store: StoreName): Promise<number> {
  return tx<number>(store, 'readonly', (s) => s.count());
}

/** データベースそのものを削除する（完全削除） */
export async function deleteDatabase(): Promise<void> {
  if (dbPromise) {
    try {
      (await dbPromise).close();
    } catch {
      /* noop */
    }
    dbPromise = null;
  }
  let idb: IDBFactory;
  try {
    idb = getIndexedDB();
  } catch {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const req = idb.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error('削除に失敗しました'));
    req.onblocked = () => resolve();
  });
}

/** 保存されているすべての端末内データを削除する（記録・設定・オフライン用キャッシュ） */
export async function deleteAllLocalData(options: { caches: boolean }): Promise<void> {
  await deleteDatabase();
  // GitHub Pages などでは同じオリジンにほかのサイトが同居するため、このアプリのキーだけを消す
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith('yohaku.')) keys.push(k);
      }
      keys.forEach((k) => storage.removeItem(k));
    } catch {
      /* noop */
    }
  }
  if (options.caches && 'caches' in window) {
    const keys = await window.caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('yohaku-')).map((k) => window.caches.delete(k)));
  }
}
