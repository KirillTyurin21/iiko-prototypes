import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

/**
 * Модальное окно загрузки — СВЕТЛАЯ тема.
 * Без кнопки закрытия, только индикатор и сообщение.
 */
@Component({
  selector: 'pos-loading-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white rounded-lg p-8 max-w-[350px] w-full mx-4 animate-scale-in">
        <div class="flex flex-col items-center text-center space-y-6 py-6">
          <lucide-icon name="loader-2" [size]="64" class="text-blue-500 animate-spin"></lucide-icon>
          <div class="space-y-2">
            <p class="text-xl font-semibold text-gray-900">{{ message }}</p>
            <p class="text-sm text-gray-500">Подождите</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoadingDialogComponent {
  @Input() open = false;
  @Input() message = 'Поиск клиента...';
  @Output() onClose = new EventEmitter<void>();
}
