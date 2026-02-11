import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-error-dialog',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" theme="light" (dialogClose)="onClose.emit()">
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div class="rounded-full bg-red-500/20 p-6">
          <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Ошибка</h2>
        <p class="text-sm text-gray-500">
          Не удалось отправить команду роботу. Проверьте подключение к серверу NE.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-6">
        <button (click)="onClose.emit()"
          class="h-14 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors">
          Закрыть
        </button>
        <button (click)="onRetry.emit()"
          class="h-14 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors">
          Повторить
        </button>
      </div>
    </pudu-pos-dialog>
  `,
})
export class PuduErrorDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onRetry = new EventEmitter<void>();
}
