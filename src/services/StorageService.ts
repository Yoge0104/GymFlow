// ===================================================================
// GymFlow — Versioned Client-Side Storage Engine (GymFlowDB)
// ===================================================================

import { INITIAL_MOCK_DATA } from '@/lib/mock-data';

const DB_KEY = 'gymflow_db_v3';
type DBData = typeof INITIAL_MOCK_DATA & Record<string, any>;

type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

class StorageEngine {
  private cache: DBData | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === DB_KEY) {
          try {
            if (event.newValue) {
              this.cache = JSON.parse(event.newValue);
            }
          } catch (e) {
            console.error('Storage sync error:', e);
          }
          this.notifyListeners();
        }
      });
    }
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public init(): DBData {
    if (!this.isClient()) {
      return INITIAL_MOCK_DATA as DBData;
    }

    if (this.cache && this.isInitialized) {
      return this.cache;
    }

    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial data in case new modules were added
        this.cache = { ...INITIAL_MOCK_DATA, ...parsed };
      } else {
        this.cache = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
        localStorage.setItem(DB_KEY, JSON.stringify(this.cache));
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      this.cache = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    }

    this.isInitialized = true;
    return this.cache as DBData;
  }

  private persist() {
    if (!this.isClient() || !this.cache) return;
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.cache));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public subscribe(listener: ChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  public getCollection<T = any>(collectionName: keyof DBData | string): T[] {
    const db = this.init();
    const list = (db as any)[collectionName];
    return Array.isArray(list) ? (JSON.parse(JSON.stringify(list)) as T[]) : [];
  }

  public getItemById<T = any>(collectionName: string, id: string): T | null {
    const items = this.getCollection<any>(collectionName);
    const item = items.find((x) => x.id === id);
    return item ? (JSON.parse(JSON.stringify(item)) as T) : null;
  }

  public saveItem<T extends { id?: string }>(
    collectionName: string,
    item: T
  ): T {
    const db = this.init();
    let list: any[] = (db as any)[collectionName] || [];

    const itemToSave = { ...item };
    if (!itemToSave.id) {
      itemToSave.id = `${collectionName.slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    const index = list.findIndex((x) => x.id === itemToSave.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...itemToSave };
    } else {
      list.unshift(itemToSave);
    }

    (db as any)[collectionName] = list;
    this.persist();
    return itemToSave as T;
  }

  public deleteItem(collectionName: string, id: string): boolean {
    const db = this.init();
    const list: any[] = (db as any)[collectionName] || [];
    const filtered = list.filter((x) => x.id !== id);

    if (filtered.length !== list.length) {
      (db as any)[collectionName] = filtered;
      this.persist();
      return true;
    }
    return false;
  }

  public getSettings<T = any>(key: 'platformSettings' | 'gymSettings'): T {
    const db = this.init();
    return (db as any)[key] || (INITIAL_MOCK_DATA as any)[key];
  }

  public saveSettings<T = any>(
    key: 'platformSettings' | 'gymSettings',
    settings: Partial<T>
  ): T {
    const db = this.init();
    const current = (db as any)[key] || {};
    const updated = { ...current, ...settings };
    (db as any)[key] = updated;
    this.persist();
    return updated as T;
  }

  public resetDatabase(): void {
    if (!this.isClient()) return;
    this.cache = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    localStorage.setItem(DB_KEY, JSON.stringify(this.cache));
    this.notifyListeners();
  }

  public exportDatabase(): string {
    const db = this.init();
    return JSON.stringify(db, null, 2);
  }
}

export const StorageService = new StorageEngine();
