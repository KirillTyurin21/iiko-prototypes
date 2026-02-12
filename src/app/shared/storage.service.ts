import { Injectable } from '@angular/core';

const STORAGE_PREFIX = 'prototype';

/**
 * Универсальный сервис для сохранения данных прототипов в localStorage.
 *
 * Ключи формируются как: `prototype:<slug>:<key>`
 *
 * Использование:
 *   save('pudu-admin', 'robots', robotsArray)
 *   load('pudu-admin', 'robots', INITIAL_ROBOTS)
 *   reset('pudu-admin')  // удаляет ВСЕ данные прототипа
 *   hasData('pudu-admin') // есть ли сохранённые данные
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private buildKey(slug: string, key: string): string {
    return `${STORAGE_PREFIX}:${slug}:${key}`;
  }

  /** Сохранить данные */
  save<T>(slug: string, key: string, data: T): void {
    try {
      const storageKey = this.buildKey(slug, key);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn(`[StorageService] Failed to save ${slug}:${key}`, e);
    }
  }

  /** Загрузить данные. Если нет сохранённых — вернуть fallback */
  load<T>(slug: string, key: string, fallback: T): T {
    try {
      const storageKey = this.buildKey(slug, key);
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[StorageService] Failed to load ${slug}:${key}`, e);
      return fallback;
    }
  }

  /** Проверить, есть ли сохранённые данные у прототипа */
  hasData(slug: string): boolean {
    const prefix = `${STORAGE_PREFIX}:${slug}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) return true;
    }
    return false;
  }

  /** Удалить ВСЕ сохранённые данные конкретного прототипа */
  reset(slug: string): void {
    const prefix = `${STORAGE_PREFIX}:${slug}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /** Удалить данные по конкретному ключу */
  remove(slug: string, key: string): void {
    localStorage.removeItem(this.buildKey(slug, key));
  }
}
