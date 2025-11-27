import { useState, useEffect } from 'react';

interface UseFilterPersistenceOptions<T> {
  key: string;
  defaultValue: T;
  storage?: 'session' | 'local';
}

export function useFilterPersistence<T>({
  key,
  defaultValue,
  storage = 'session'
}: UseFilterPersistenceOptions<T>): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageObject = storage === 'session' ? sessionStorage : localStorage;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storageObject.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from ${storage}Storage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      storageObject.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to ${storage}Storage:`, error);
    }
  }, [key, state, storageObject, storage]);

  const clearState = () => {
    setState(defaultValue);
    try {
      storageObject.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from ${storage}Storage:`, error);
    }
  };

  return [state, setState, clearState];
}
