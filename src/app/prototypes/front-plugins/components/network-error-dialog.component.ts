import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from './pos-dialog.component';

/**
 * Модальное окно ошибки сети — ТЁМНАЯ POS-тема.
 * Использует PosDialogComponent как обёртку.
 */
@Component({
  selector: 'pos-network-error-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" maxWidth="md" [closable]="false">
      <div class="flex flex-col items-center text-center space-y-6 py-4">
        <!-- Иконка -->
        <div class="rounded-full bg-orange-500/20 p-6">
          <lucide-icon name="wifi-off" [size]="64" class="text-orange-400"></lucide-icon>
        </div>
        <!-- Текст -->
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-[#b8c959]">Ошибка соединения</h2>
          <p class="text-base text-gray-300">{{ subtitle }}</p>
        </div>
        <!-- Кнопки -->
        <div class="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            class="h-14 text-base rounded bg-[#1a1a1a] text-white hover:bg-[#252525] border-none transition-colors"
            (click)="onCloseWithout.emit()"
          >
            Закрыть без клиента
          </button>
          <button
            class="h-14 text-base rounded bg-[#1a1a1a] text-white hover:bg-[#252525] border-none transition-colors"
            (click)="onRetry.emit()"
          >
            Повторить
          </button>
        </div>
      </div>
    </pos-dialog>
  `,
})
export class NetworkErrorDialogComponent {
  @Input() open = false;
  @Input() subtitle = 'Не удалось подключиться к серверу. Проверьте сетевое соединение и попробуйте снова.';
  @Output() onClose = new EventEmitter<void>();
  @Output() onCloseWithout = new EventEmitter<void>();
  @Output() onRetry = new EventEmitter<void>();
}
