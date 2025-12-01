import logger from '@/utils/logger';
import config from '@/config/environment';

type CacheValue = any;

class InMemoryCache {
  private store: Map<string, { value: CacheValue; expiresAt: number }> = new Map();

  get<T = any>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set(key: string, value: CacheValue, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

class CacheManager {
  private memory = new InMemoryCache();
  private prefix = 'cache:';

  constructor() {
    if (config.features.enableCache) {
      logger.info('Cache layer enabled');
    }
  }

  buildKey(namespace: string, parts: any): string {
    const base = typeof parts === 'string' ? parts : JSON.stringify(parts);
    return `${this.prefix}${namespace}:${base}`;
  }

  get<T = any>(namespace: string, parts: any): T | undefined {
    const key = this.buildKey(namespace, parts);
    return this.memory.get<T>(key);
  }

  set(namespace: string, parts: any, value: CacheValue, ttlMs: number): void {
    const key = this.buildKey(namespace, parts);
    this.memory.set(key, value, ttlMs);
  }

  invalidateNamespace(namespace: string): void {
    // Simple approach: clear all for now (low cardinality expected)
    this.memory.clear();
  }

  clearAll(): void {
    this.memory.clear();
  }
}

export const cache = new CacheManager();
export default cache;

