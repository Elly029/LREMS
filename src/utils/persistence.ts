export const STORAGE_NS = 'bdms';

declare global {
  interface Window {
    __BDMS_CURRENT_USER_ID?: string | null;
  }
}

export const setCurrentUserId = (userId: string | null) => {
  if (typeof window !== 'undefined') {
    window.__BDMS_CURRENT_USER_ID = userId ?? null;
  }
};

export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.__BDMS_CURRENT_USER_ID ?? null;
};

export const nsKey = (userId: string, key: string) => `${STORAGE_NS}:${userId}:${key}`;

export const getNamespacedItem = (storage: Storage, userId: string, key: string): string | null => {
  return storage.getItem(nsKey(userId, key));
};

export const setNamespacedItem = (storage: Storage, userId: string, key: string, value: string) => {
  storage.setItem(nsKey(userId, key), value);
};

export const removeNamespacedItem = (storage: Storage, userId: string, key: string) => {
  storage.removeItem(nsKey(userId, key));
};

export const migrateLegacyKey = (storage: Storage, legacyKey: string, userId: string) => {
  try {
    const existing = storage.getItem(legacyKey);
    if (existing !== null) {
      setNamespacedItem(storage, userId, legacyKey, existing);
      storage.removeItem(legacyKey);
    }
  } catch {}
};

export const clearLocalAndSessionStorage = () => {
  try {
    localStorage.clear();
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}
};

export const clearIndexedDB = async (): Promise<void> => {
  try {
    const anyIndexedDB: any = indexedDB as any;
    if (typeof anyIndexedDB.databases === 'function') {
      const dbs = await anyIndexedDB.databases();
      for (const db of dbs) {
        if (db && db.name) {
          await new Promise<void>((resolve) => {
            const request = indexedDB.deleteDatabase(db.name as string);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          });
        }
      }
    }
  } catch {}
};

export const clearAllPersistence = async (): Promise<void> => {
  clearLocalAndSessionStorage();
  await clearIndexedDB();
};

const knownLegacyKeys = new Set([
  'bookFilters',
  'bookSort',
  'bookSearch',
  'hasSeenTour',
  'evaluatorDashboardTourCompleted',
  'evaluator_group_by',
  'user',
]);

export const validateStorageIsolation = (currentUserId: string | null) => {
  try {
    const allLocalKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allLocalKeys.push(k);
    }
    const allSessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) allSessionKeys.push(k);
    }

    const namespacePrefix = currentUserId ? `${STORAGE_NS}:${currentUserId}:` : null;

    for (const k of allLocalKeys) {
      if (k === 'user') continue;
      if (namespacePrefix) {
        if (!k.startsWith(namespacePrefix)) {
          localStorage.removeItem(k);
        }
      } else {
        if (knownLegacyKeys.has(k) || k.startsWith(`${STORAGE_NS}:`)) {
          localStorage.removeItem(k);
        }
      }
    }

    for (const k of allSessionKeys) {
      if (namespacePrefix) {
        if (!k.startsWith(namespacePrefix)) {
          sessionStorage.removeItem(k);
        }
      } else {
        if (knownLegacyKeys.has(k) || k.startsWith(`${STORAGE_NS}:`)) {
          sessionStorage.removeItem(k);
        }
      }
    }
  } catch {}
};

