import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { UiConfirmDialogComponent } from '@/components/ui';

/**
 * Кнопка Reset — сбрасывает localStorage данных текущего прототипа к начальному состоянию.
 *
 * Размещается в top-bar, слева от бейджа «Прототип».
 * Показывается только если у текущего прототипа есть сохранённые данные.
 * При клике — показывает диалог подтверждения, после подтверждения — очищает данные и перезагружает страницу.
 */
@Component({
  selector: 'app-reset-button',
  standalone: true,
  imports: [CommonModule, IconsModule, UiConfirmDialogComponent],
  template: `
    <button
      *ngIf="hasData"
      (click)="showConfirm = true"
      class="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium
             bg-red-600 text-white hover:bg-red-700
             transition-colors duration-150"
      title="Сбросить данные прототипа к начальному состоянию"
    >
      <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
      Reset
    </button>

    <ui-confirm-dialog
      [open]="showConfirm"
      title="Сбросить данные?"
      message="Все сохранённые изменения в этом прототипе будут удалены. Данные вернутся к начальному состоянию."
      confirmText="Сбросить"
      cancelText="Отмена"
      variant="danger"
      (confirmed)="onConfirmReset()"
      (cancelled)="showConfirm = false"
    ></ui-confirm-dialog>
  `,
})
export class ResetButtonComponent {
  private router = inject(Router);
  private storage = inject(StorageService);

  showConfirm = false;

  /** Текущий slug прототипа из URL (например 'pudu-admin') */
  get currentSlug(): string | null {
    const match = this.router.url.match(/^\/prototype\/([^/?]+)/);
    return match ? match[1] : null;
  }

  /** Есть ли сохранённые данные у текущего прототипа */
  get hasData(): boolean {
    const slug = this.currentSlug;
    return slug ? this.storage.hasData(slug) : false;
  }

  onConfirmReset(): void {
    const slug = this.currentSlug;
    if (slug) {
      this.storage.reset(slug);
      // Перезагрузка страницы чтобы все компоненты пересоздались с начальными данными
      window.location.reload();
    }
    this.showConfirm = false;
  }
}
