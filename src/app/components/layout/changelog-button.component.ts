import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES } from '@/shared/prototypes.registry';
import { ChangelogRelease } from '@/shared/changelog.types';
import { ChangelogModalComponent } from './changelog-modal.component';

/**
 * Кнопка Changelog — показывает версию и дату обновления текущего прототипа.
 *
 * Размещается в top-bar, между Reset и бейджем «Прототип».
 * Показывается только на страницах прототипов (не на главной).
 * При клике — открывает модальное окно с историей изменений.
 *
 * Changelog данные загружаются лениво из `changelog.data.ts` каждого прототипа.
 */
@Component({
  selector: 'app-changelog-button',
  standalone: true,
  imports: [CommonModule, IconsModule, ChangelogModalComponent],
  template: `
    <button
      *ngIf="currentVersion"
      (click)="openChangelog()"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium
             bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:text-text-primary
             transition-colors duration-150 border border-border/50"
      title="Показать историю изменений"
    >
      <span class="font-semibold text-text-primary">v{{ currentVersion }}</span>
      <span class="text-text-disabled">·</span>
      <span>{{ formattedDate }}</span>
      <lucide-icon name="scroll-text" [size]="13" class="ml-0.5 opacity-60"></lucide-icon>
    </button>

    <app-changelog-modal
      [open]="showModal"
      [releases]="releases"
      [prototypeName]="prototypeName"
      (modalClose)="showModal = false"
    ></app-changelog-modal>
  `,
})
export class ChangelogButtonComponent {
  private router = inject(Router);

  releases: ChangelogRelease[] = [];
  showModal = false;
  loaded = false;

  /** Текущий slug прототипа из URL */
  get currentSlug(): string | null {
    const match = this.router.url.match(/^\/prototype\/([^/?]+)/);
    return match ? match[1] : null;
  }

  /** Имя текущего прототипа */
  get prototypeName(): string {
    const proto = PROTOTYPES.find(p => this.router.url.startsWith(p.path));
    return proto?.label || '';
  }

  /** Текущая версия (из первого элемента changelog) */
  get currentVersion(): string | null {
    if (this.releases.length > 0) {
      return this.releases[0].version;
    }
    return this._preloadedVersion;
  }

  /** Форматированная дата последнего обновления */
  get formattedDate(): string {
    const release = this.releases[0];
    if (!release) return this._preloadedDate || '';
    return this.formatShortDate(release.date);
  }

  // Предзагруженные значения (до полной загрузки changelog)
  private _preloadedVersion: string | null = null;
  private _preloadedDate: string | null = null;
  private _lastSlug: string | null = null;

  /** При каждой проверке — если slug изменился, подгрузить данные */
  ngDoCheck(): void {
    const slug = this.currentSlug;
    if (slug && slug !== this._lastSlug) {
      this._lastSlug = slug;
      this.releases = [];
      this.loaded = false;
      this._preloadedVersion = null;
      this._preloadedDate = null;
      this.loadChangelog(slug);
    }
    if (!slug) {
      this._lastSlug = null;
      this.releases = [];
      this._preloadedVersion = null;
      this._preloadedDate = null;
    }
  }

  openChangelog(): void {
    this.showModal = true;
  }

  /** Загружает changelog.data.ts для указанного slug */
  private async loadChangelog(slug: string): Promise<void> {
    try {
      const module = await this.importChangelog(slug);
      if (module && this._lastSlug === slug) {
        this.releases = module.CHANGELOG || [];
        this.loaded = true;
      }
    } catch {
      // Changelog не существует для этого прототипа — ничего не показываем
      this.releases = [];
    }
  }

  /** Dynamic import по slug */
  private importChangelog(slug: string): Promise<{ CHANGELOG: ChangelogRelease[] }> {
    switch (slug) {
      case 'demo':
        return import('../../prototypes/demo/changelog.data');
      case 'front-plugins':
        return import('../../prototypes/front-plugins/changelog.data');
      case 'web-screens':
        return import('../../prototypes/web-screens/changelog.data');
      case 'eagle':
        return import('../../prototypes/eagle/changelog.data');
      case 'falcon':
        return import('../../prototypes/falcon/changelog.data');
      case 'neptune':
        return import('../../prototypes/neptune/changelog.data');
      case 'demo-wizard':
        return import('../../prototypes/demo-wizard/changelog.data');
      case 'comet':
        return import('../../prototypes/comet/changelog.data');
      default:
        return Promise.reject('Unknown prototype');
    }
  }

  /** Форматирует дату коротко: 17.02.2026 */
  private formatShortDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }
}
