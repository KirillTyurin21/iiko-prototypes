import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    this.cleanupLegacyAuth();
  }

  /**
   * Одноразовая очистка мёртвых ключей от удалённой клиентской auth-системы.
   * Можно удалить этот метод через ~1 месяц (после апреля 2026).
   */
  private cleanupLegacyAuth(): void {
    const cleanupKey = 'auth_cleanup_v1';
    if (localStorage.getItem(cleanupKey)) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('master_access') ||
        key.startsWith('list_access') ||
        key.startsWith('proto_access:') ||
        key.startsWith('group_access:') ||
        key.startsWith('__rl_') ||
        key.startsWith('__fp_') ||
        key === 'access_config_version'
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    try {
      indexedDB.deleteDatabase('rate-limit-db');
    } catch {
      // IndexedDB может быть недоступна
    }

    localStorage.setItem(cleanupKey, '1');
  }
}
