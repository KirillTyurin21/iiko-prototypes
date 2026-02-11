import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosDialogComponent } from './pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pos-customer-blocked-dialog',
  standalone: true,
  imports: [CommonModule, PosDialogComponent, IconsModule],
  template: `
    <pos-dialog [open]="open" [maxWidth]="'md'" (dialogClose)="onClose.emit()">
      <div class="space-y-6">
        <!-- Иконка -->
        <div class="flex justify-center">
          <div class="rounded-full bg-red-500/20 p-6">
            <lucide-icon name="shield-alert" [size]="64" class="text-red-400"></lucide-icon>
          </div>
        </div>

        <!-- Заголовок -->
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-red-400">Карта заблокирована</h2>
          <p class="text-gray-300 text-sm">
            Карта клиента заблокирована. Обратитесь в службу поддержки.
          </p>
        </div>

        <!-- Кнопки -->
        <div class="grid grid-cols-2 gap-3">
          <button
            (click)="onClose.emit()"
            class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Закрыть
          </button>
          <button
            (click)="onSearchAnother.emit()"
            class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Найти другого клиента
          </button>
        </div>
      </div>
    </pos-dialog>
  `,
})
export class PosCustomerBlockedDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSearchAnother = new EventEmitter<void>();
}
