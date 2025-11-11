const DB_NAME = 'CricketAcademyCache';
const DB_VERSION = 1;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async initDB(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const stores = [
          'users',
          'batches',
          'content',
          'attendance',
          'yoyoTest',
          'fees',
          'analytics',
        ];

        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        });
      };
    });

    return this.initPromise;
  }

  async get<T>(store: string, key: string): Promise<T | null> {
    await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        resolve(entry ? entry.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(store: string, key: string, data: T): Promise<void> {
    await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      const request = objectStore.put(entry, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async remove(store: string, key: string): Promise<void> {
    await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(store: string): Promise<void> {
    await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    await this.initDB();
    if (!this.db) return;

    const stores = [
      'users',
      'batches',
      'content',
      'attendance',
      'yoyoTest',
      'fees',
      'analytics',
    ];

    await Promise.all(stores.map((store) => this.clear(store)));
  }

  async getLastSyncTime(store: string): Promise<number | null> {
    const syncData = await this.get<{ timestamp: number }>(
      store,
      '__last_sync__'
    );
    return syncData?.timestamp || null;
  }

  async setLastSyncTime(store: string): Promise<void> {
    await this.set(store, '__last_sync__', { timestamp: Date.now() });
  }
}

export const cacheManager = new CacheManager();
