import { Injectable } from '@angular/core';
import { ACCESS_CONFIG, GroupAccessEntry } from './access-codes';

const LS_MASTER = 'master_access';
const LS_LIST = 'list_access';
const LS_GROUP_PREFIX = 'group_access_';
const LS_PROTO_PREFIX = 'proto_access_';

@Injectable({ providedIn: 'root' })
export class AccessCodeService {

  // ───── Public methods ─────

  /**
   * Читает query-параметр `code` из hash-based URL и, если валиден, сохраняет доступ.
   * Формат: `#/prototype/slug?code=XXX`
   */
  checkCodeFromUrl(): void {
    const hash = window.location.hash; // e.g. "#/prototype/slug?code=XXX"
    if (!hash) return;

    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return;

    const queryString = hash.substring(qIndex + 1);
    const params = new URLSearchParams(queryString);
    const code = params.get('code');

    if (code) {
      this.validateAndStoreCode(code);
    }
  }

  /**
   * Проверяет код и сохраняет соответствующий доступ в localStorage.
   */
  validateAndStoreCode(code: string): {
    valid: boolean;
    type: 'master' | 'group' | 'prototype' | 'invalid';
    label?: string;
  } {
    // 1. Мастер-код
    if (code === ACCESS_CONFIG.masterCode) {
      this.storeAccess(LS_MASTER, code, ACCESS_CONFIG.masterTtlDays);
      this.storeAccess(LS_LIST, '', 30); // доступ к списку — 30 дней
      return { valid: true, type: 'master', label: 'Мастер-доступ' };
    }

    // 2. Групповой код
    for (const group of ACCESS_CONFIG.groups) {
      if (code === group.code) {
        const groupKey = LS_GROUP_PREFIX + group.code;
        this.storeAccess(groupKey, code, group.ttlDays);
        return { valid: true, type: 'group', label: group.label };
      }
    }

    // 3. Код прототипа
    for (const [slug, entry] of Object.entries(ACCESS_CONFIG.prototypes)) {
      if (code === entry.code) {
        const protoKey = LS_PROTO_PREFIX + slug;
        this.storeAccess(protoKey, code, entry.ttlDays);
        return { valid: true, type: 'prototype', label: slug };
      }
    }

    return { valid: false, type: 'invalid' };
  }

  /**
   * Проверяет доступ к конкретному прототипу по slug.
   */
  hasAccessToPrototype(slug: string): boolean {
    // Мастер-доступ
    if (this.hasMasterAccess()) return true;

    // Групповой доступ — проверяем все группы, содержащие slug
    for (const group of ACCESS_CONFIG.groups) {
      if (group.prototypeSlugs.includes(slug)) {
        const groupKey = LS_GROUP_PREFIX + group.code;
        if (this.isStoredAccessValid(groupKey)) return true;
      }
    }

    // Индивидуальный доступ
    return this.isStoredAccessValid(LS_PROTO_PREFIX + slug);
  }

  /**
   * Проверяет доступ к списку прототипов (только мастер-код даёт доступ к списку).
   */
  hasAccessToList(): boolean {
    return this.isStoredAccessValid(LS_LIST);
  }

  /**
   * Проверяет наличие активного мастер-доступа.
   */
  hasMasterAccess(): boolean {
    return this.isStoredAccessValid(LS_MASTER);
  }

  /**
   * Возвращает список slug-ов прототипов, к которым есть доступ.
   */
  getAccessiblePrototypeSlugs(): string[] {
    const slugs = new Set<string>();

    // Мастер — все прототипы
    if (this.hasMasterAccess()) {
      for (const slug of Object.keys(ACCESS_CONFIG.prototypes)) {
        slugs.add(slug);
      }
      return Array.from(slugs);
    }

    // Групповые доступы
    for (const group of ACCESS_CONFIG.groups) {
      const groupKey = LS_GROUP_PREFIX + group.code;
      if (this.isStoredAccessValid(groupKey)) {
        for (const s of group.prototypeSlugs) {
          slugs.add(s);
        }
      }
    }

    // Индивидуальные доступы
    for (const slug of Object.keys(ACCESS_CONFIG.prototypes)) {
      if (this.isStoredAccessValid(LS_PROTO_PREFIX + slug)) {
        slugs.add(slug);
      }
    }

    return Array.from(slugs);
  }

  /**
   * Возвращает группы, к которым у пользователя есть доступ.
   * При мастер-доступе возвращает пустой массив (не нужны — всё доступно через полный список).
   */
  getAccessibleGroups(): GroupAccessEntry[] {
    if (this.hasMasterAccess()) return [];

    return ACCESS_CONFIG.groups.filter(group => {
      const groupKey = LS_GROUP_PREFIX + group.code;
      return this.isStoredAccessValid(groupKey);
    });
  }

  /**
   * Удаляет все коды доступа из localStorage.
   */
  revokeAll(): void {
    localStorage.removeItem(LS_MASTER);
    localStorage.removeItem(LS_LIST);

    for (const group of ACCESS_CONFIG.groups) {
      localStorage.removeItem(LS_GROUP_PREFIX + group.code);
    }

    for (const slug of Object.keys(ACCESS_CONFIG.prototypes)) {
      localStorage.removeItem(LS_PROTO_PREFIX + slug);
    }
  }

  // ───── Private helpers ─────

  /**
   * Проверяет, что запись в localStorage существует и не просрочена.
   */
  private isStoredAccessValid(key: string): boolean {
    const raw = localStorage.getItem(key);
    if (!raw) return false;

    try {
      const data = JSON.parse(raw) as { expiresAt: number };
      return Date.now() < data.expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Записывает доступ в localStorage с вычислением expiresAt.
   */
  private storeAccess(key: string, code: string, ttlDays: number): void {
    const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
    const data = JSON.stringify({ code, expiresAt });
    localStorage.setItem(key, data);
  }

  /**
   * Извлекает slug из пути '/prototype/some-slug' → 'some-slug'.
   */
  private getSlugFromPath(path: string): string {
    const match = path.match(/\/prototype\/([^/?#]+)/);
    return match ? match[1] : '';
  }
}
