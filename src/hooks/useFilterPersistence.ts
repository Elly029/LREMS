import { useState, useEffect } from 'react';
import { nsKey, getCurrentUserId } from '../utils/persistence';

interface UseFilterPersistenceOptions<T> {
  key: string;
  defaultValue: T;
  storage?: 'session' | 'local';
  userId?: string;
}

export function useFilterPersistence<T>({
  key,
  defaultValue,
  storage = 'session',
  userId
}: UseFilterPersistenceOptions<T>): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageObject = storage === 'session' ? sessionStorage : localStorage;
  const resolvedUserId = userId ?? getCurrentUserId();
  const resolvedKey = resolvedUserId ? nsKey(resolvedUserId, key) : key;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storageObject.getItem(resolvedKey) ?? storageObject.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from ${storage}Storage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      storageObject.setItem(resolvedKey, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to ${storage}Storage:`, error);
    }
  }, [resolvedKey, key, state, storageObject, storage]);

  const clearState = () => {
    setState(defaultValue);
    try {
      storageObject.removeItem(resolvedKey);
    } catch (error) {
      console.error(`Error removing ${key} from ${storage}Storage:`, error);
    }
  };

  return [state, setState, clearState];
}
