import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { clearStore, countRecords, deleteDatabase, deleteRecord, getAllRecords, newId, putRecord } from '../src/lib/db';

describe('端末内保存（IndexedDB）', () => {
  it('保存・一覧・削除ができる', async () => {
    const a = { id: newId(), createdAt: 1, updatedAt: 1, text: 'いち' };
    const b = { id: newId(), createdAt: 2, updatedAt: 2, text: 'に' };
    await putRecord('notes', a);
    await putRecord('notes', b);
    const list = await getAllRecords('notes');
    expect(list.map((n) => n.text)).toEqual(['に', 'いち']); // 新しい順
    await deleteRecord('notes', a.id);
    expect(await countRecords('notes')).toBe(1);
    await clearStore('notes');
    expect(await countRecords('notes')).toBe(0);
  });

  it('同じIDで保存すると上書きになる', async () => {
    const id = newId();
    await putRecord('feelings', { id, createdAt: 1, feelings: ['anxiety'], note: '' });
    await putRecord('feelings', { id, createdAt: 1, feelings: ['fatigue'], note: 'メモ' });
    const list = await getAllRecords('feelings');
    expect(list).toHaveLength(1);
    expect(list[0].feelings).toEqual(['fatigue']);
  });

  it('データベースごと完全に削除できる', async () => {
    await putRecord('notes', { id: newId(), createdAt: 3, updatedAt: 3, text: 'のこる？' });
    await deleteDatabase();
    const dbs = await indexedDB.databases();
    expect(dbs.find((d) => d.name === 'yohaku')).toBeUndefined();
    // 削除後に再度使っても新しい空のデータベースになる
    expect(await countRecords('notes')).toBe(0);
  });
});
