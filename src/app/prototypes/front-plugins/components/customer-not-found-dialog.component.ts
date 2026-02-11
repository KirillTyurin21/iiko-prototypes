import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosDialogComponent } from './pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pos-customer-not-found-dialog',
  standalone: true,
  imports: [CommonModule, PosDialogComponent, IconsModule],
  template: `
    <pos-dialog [open]="open" [maxWidth]="'md'" (dialogClose)="onClose.emit()">
      <div class="space-y-6">
        <!-- Иконка -->
        <div class="flex justify-center">
          <div class="rounded-full bg-orange-500/20 p-6">
            <lucide-icon name="alert-circle" [size]="64" class="text-orange-400"></lucide-icon>
          </div>
        </div>

        <!-- Заголовок -->
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-[#b8c959]">Клиент не найден</h2>
          <p class="text-gray-300 text-sm">
            Клиент не найден или не прошёл регистрацию в программе лояльности
          </p>
        </div>

        <!-- Кнопки -->
        <div class="space-y-2">
          <button
            (click)="onClose.emit()"
            class="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Закрыть без клиента
          </button>
          <button
            (click)="onSearchAnother.emit()"
            class="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Найти другого
          </button>
          <button
            (click)="onClose.emit()"
            class="w-full h-12 text-base text-gray-400 hover:text-white hover:bg-[#2d2d2d] bg-transparent border-none rounded font-medium transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </pos-dialog>
  `,
})
export class PosCustomerNotFoundDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSearchAnother = new EventEmitter<void>();
}
