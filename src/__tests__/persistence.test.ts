import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nsKey, clearAllPersistence, validateStorageIsolation, setCurrentUserId, clearIndexedDB } from '../utils/persistence';

const setupIndexedDBMock = () => {
  const databases = [{ name: 'db1' }, { name: 'db2' }];
  const deleteDatabase = vi.fn().mockImplementation((_name: string) => {
    const req: any = { onsuccess: null, onerror: null, onblocked: null };
    setTimeout(() => { if (req.onsuccess) req.onsuccess({} as any); }, 0);
    return req;
  });
  (globalThis as any).indexedDB = {
    databases: vi.fn().mockResolvedValue(databases),
    deleteDatabase,
  } as any;
  return { deleteDatabase };
};

describe('persistence utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUserId(null);
  });

  it('namespaces keys by user id', () => {
    expect(nsKey('u1', 'k')).toBe('bdms:u1:k');
  });

  it('clears localStorage and sessionStorage', async () => {
    localStorage.setItem('a', '1');
    sessionStorage.setItem('b', '2');
    await clearAllPersistence();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('attempts to clear IndexedDB databases when available', async () => {
    const { deleteDatabase } = setupIndexedDBMock();
    await clearIndexedDB();
    expect(deleteDatabase).toHaveBeenCalledTimes(2);
  });

  it('validates and clears residual data when no user', () => {
    localStorage.setItem('bookFilters', '{}');
    localStorage.setItem('user', '{}');
    localStorage.setItem('bdms:other:k', 'v');
    sessionStorage.setItem('bookSearch', 'abc');
    validateStorageIsolation(null);
    expect(localStorage.getItem('user')).toBe('{}');
    expect(localStorage.getItem('bookFilters')).toBeNull();
    expect(localStorage.getItem('bdms:other:k')).toBeNull();
    expect(sessionStorage.getItem('bookSearch')).toBeNull();
  });

  it('keeps only current user namespace when logged in', () => {
    const k1 = nsKey('u1', 'bookFilters');
    const k2 = nsKey('u2', 'bookFilters');
    localStorage.setItem(k1, '{}');
    localStorage.setItem(k2, '{}');
    sessionStorage.setItem(k1, '{}');
    sessionStorage.setItem(k2, '{}');
    validateStorageIsolation('u1');
    expect(localStorage.getItem(k1)).toBe('{}');
    expect(localStorage.getItem(k2)).toBeNull();
    expect(sessionStorage.getItem(k1)).toBe('{}');
    expect(sessionStorage.getItem(k2)).toBeNull();
  });
});

