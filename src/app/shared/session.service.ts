import { Injectable, isDevMode } from '@angular/core';

const TOKEN_STORAGE_KEY = '__session_token';

/**
 * Лёгкий сервис для чтения данных сессии из серверного токена.
 *
 * Токен передаётся в URL как ?_s=BASE64URL_PAYLOAD.HMAC_SIGNATURE.
 * Payload — открытый JSON с полями {type, slugs, exp}.
 * HMAC-подпись проверяется только на сервере — здесь мы просто
 * декодируем payload для UX-фильтрации прототипов.
 *
 * При первом парсинге токен сохраняется в localStorage.
 * При F5 на глубоких маршрутах (где _s уже нет в URL) —
 * читается из localStorage.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private slugs: string[] = [];
  private sessionType = '';

  constructor() {
    this.initSession();
  }

  /** Инициализация: devMode → URL → localStorage → пусто */
  private initSession(): void {
    // Dev-режим (localhost) — полный доступ без токена
    if (isDevMode()) {
      this.sessionType = 'master';
      this.slugs = ['*'];
      return;
    }

    // 1. Пробуем из URL (?_s=TOKEN)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('_s');

    if (urlToken) {
      this.parseToken(urlToken);
      // Сохраняем для F5 на глубоких маршрутах
      try { localStorage.setItem(TOKEN_STORAGE_KEY, urlToken); } catch {}

      // Мгновенно очищаем ?_s= из адресной строки —
      // токен не должен быть виден пользователю и попадать в историю
      try {
        params.delete('_s');
        const cleanSearch = params.toString();
        const cleanUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '');
        window.history.replaceState(null, '', cleanUrl);
      } catch {}

      return;
    }

    // 2. Fallback: читаем из localStorage (после F5)
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        this.parseToken(stored);
      }
    } catch {}
  }

  /** Декодирует payload из токена, проверяет exp */
  private parseToken(token: string): void {
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) return;

    try {
      const encoded = token.substring(0, dotIndex);
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const payload = JSON.parse(json);

      // Проверяем срок действия
      if (payload.exp && Date.now() > payload.exp) {
        // Токен истёк — удаляем из localStorage
        try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
        return;
      }

      this.sessionType = payload.type || '';
      this.slugs = Array.isArray(payload.slugs) ? payload.slugs : [];
    } catch {
      // невалидный токен — удаляем
      try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
    }
  }

  /** Очистка сессии (при logout) */
  clearSession(): void {
    this.slugs = [];
    this.sessionType = '';
    try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch {}
  }

  /** Есть ли мастер-доступ (все прототипы) */
  isMaster(): boolean {
    return this.slugs.includes('*');
  }

  /** Есть ли доступ к конкретному slug */
  hasAccess(slug: string): boolean {
    return this.slugs.includes('*') || this.slugs.includes(slug);
  }

  /** Список доступных slugs */
  getAccessibleSlugs(): string[] {
    return [...this.slugs];
  }

  /** Есть ли хотя бы одна активная сессия */
  isAuthenticated(): boolean {
    return this.slugs.length > 0;
  }

  /** Тип сессии: 'master' | 'group' | 'proto' | '' */
  getSessionType(): string {
    return this.sessionType;
  }
}
