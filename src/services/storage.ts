import { Platform } from 'react-native';

class StorageAdapter {
  private memory = new Map<string, string>();

  getItem(key: string): string | null {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return this.memory.get(key) || null;
      }
    }
    return this.memory.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {}
    }
    this.memory.set(key, value);
  }

  removeItem(key: string): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
    }
    this.memory.delete(key);
  }

  clear(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch (e) {}
    }
    this.memory.clear();
  }
}

export const appStorage = new StorageAdapter();
