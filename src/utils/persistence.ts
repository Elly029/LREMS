export const STORAGE_NS = 'bdms';

declare global {
  interface Window {
    __BDMS_CURRENT_USER_ID?: string | null;
    __BDMS_IS_FIRST_LOGIN?: boolean;
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

// Session tracking for first login detection
export const SESSION_KEYS = {
  FIRST_LOGIN_COMPLETED: 'firstLoginCompleted',
  TOUR_COMPLETED: 'hasSeenTour',
  EVALUATOR_TOUR_COMPLETED: 'evaluatorDashboardTourCompleted',
  SESSION_ID: 'sessionId',
};

// Generate a unique session ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Check if this is the user's first ever login (never logged in before)
export const isFirstEverLogin = (userId: string): boolean => {
  const key = nsKey(userId, SESSION_KEYS.FIRST_LOGIN_COMPLETED);
  return localStorage.getItem(key) !== 'true';
};

// Mark that the user has completed their first login
export const markFirstLoginCompleted = (userId: string): void => {
  const key = nsKey(userId, SESSION_KEYS.FIRST_LOGIN_COMPLETED);
  localStorage.setItem(key, 'true');
};

// Check if tour has been completed for this user
export const hasTourBeenCompleted = (userId: string): boolean => {
  const key = nsKey(userId, SESSION_KEYS.TOUR_COMPLETED);
  return localStorage.getItem(key) === 'true';
};

// Mark tour as completed for this user
export const markTourCompleted = (userId: string): void => {
  const key = nsKey(userId, SESSION_KEYS.TOUR_COMPLETED);
  localStorage.setItem(key, 'true');
};

// Check if evaluator tour has been completed for this user
export const hasEvaluatorTourBeenCompleted = (userId: string): boolean => {
  const key = nsKey(userId, SESSION_KEYS.EVALUATOR_TOUR_COMPLETED);
  return localStorage.getItem(key) === 'true';
};

// Mark evaluator tour as completed for this user
export const markEvaluatorTourCompleted = (userId: string): void => {
  const key = nsKey(userId, SESSION_KEYS.EVALUATOR_TOUR_COMPLETED);
  localStorage.setItem(key, 'true');
};

// Track if this is a fresh login session (not a page refresh)
export const setIsFirstLogin = (isFirst: boolean): void => {
  if (typeof window !== 'undefined') {
    window.__BDMS_IS_FIRST_LOGIN = isFirst;
  }
};

export const getIsFirstLogin = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.__BDMS_IS_FIRST_LOGIN === true;
};

// Create a new session for the user
export const createUserSession = (userId: string): string => {
  const sessionId = generateSessionId();
  const key = nsKey(userId, SESSION_KEYS.SESSION_ID);
  sessionStorage.setItem(key, sessionId);
  return sessionId;
};

// Get current session ID
export const getCurrentSessionId = (userId: string): string | null => {
  const key = nsKey(userId, SESSION_KEYS.SESSION_ID);
  return sessionStorage.getItem(key);
};

// Check if session exists (to detect page refresh vs new login)
export const hasExistingSession = (userId: string): boolean => {
  return getCurrentSessionId(userId) !== null;
};

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

// Keys that should be preserved across logouts (per-user persistent data)
const PRESERVED_KEY_PATTERNS = [
  SESSION_KEYS.FIRST_LOGIN_COMPLETED,
  SESSION_KEYS.TOUR_COMPLETED,
  SESSION_KEYS.EVALUATOR_TOUR_COMPLETED,
];

// Check if a key should be preserved
const shouldPreserveKey = (key: string): boolean => {
  return PRESERVED_KEY_PATTERNS.some(pattern => key.includes(pattern));
};

// Clear session storage completely, but preserve certain localStorage keys
export const clearAllPersistence = async (): Promise<void> => {
  // Preserve tour completion flags before clearing
  const preservedData: Record<string, string> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && shouldPreserveKey(key)) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          preservedData[key] = value;
        }
      }
    }
  } catch {}
  
  // Clear all storage
  clearLocalAndSessionStorage();
  await clearIndexedDB();
  
  // Restore preserved data
  try {
    for (const [key, value] of Object.entries(preservedData)) {
      localStorage.setItem(key, value);
    }
  } catch {}
};

const knownLegacyKeys = new Set([
  'bookFilters',
  'bookSort',
  'bookSearch',
  'hasSeenTour',
  'evaluatorDashboardTourCompleted',
  'evaluator_group_by',
  'user',
  'firstLoginCompleted',
  'sessionId',
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

