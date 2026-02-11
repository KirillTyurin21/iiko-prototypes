import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

/**
 * Модальное окно ошибки соединения — СВЕТЛАЯ тема.
 * Свой overlay, без PosDialogComponent.
 */
@Component({
  selector: 'pos-error-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white rounded-lg p-8 max-w-[450px] w-full mx-4 animate-scale-in">
        <div class="flex flex-col items-center text-center space-y-6 py-4">
          <!-- Иконка -->
          <div class="rounded-full bg-red-100 p-4">
            <lucide-icon name="wifi-off" [size]="64" class="text-red-500"></lucide-icon>
          </div>
          <!-- Текст -->
          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-gray-900">Ошибка соединения</h2>
            <p class="text-base text-gray-500">{{ subtitle }}</p>
          </div>
          <!-- Кнопки -->
          <div class="grid grid-cols-2 gap-3 w-full pt-2">
            <button
              class="h-14 text-base rounded border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 transition-colors"
              (click)="onCloseWithout.emit()"
            >
              Закрыть без клиента
            </button>
            <button
              class="h-14 text-base rounded bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              (click)="onRetry.emit()"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ErrorDialogComponent {
  @Input() open = false;
  @Input() subtitle = 'Не удалось подключиться к серверу. Проверьте сетевое соединение и попробуйте снова.';
  @Output() onClose = new EventEmitter<void>();
  @Output() onCloseWithout = new EventEmitter<void>();
  @Output() onRetry = new EventEmitter<void>();
}
