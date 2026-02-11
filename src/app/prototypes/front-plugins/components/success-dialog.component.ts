import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosDialogComponent } from './pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [CommonModule, PosDialogComponent, IconsModule],
  template: `
    <pos-dialog [open]="open" maxWidth="sm" (dialogClose)="onClose.emit()">
      <div class="flex flex-col items-center text-center">
        <!-- Иконка -->
        <div class="rounded-full bg-[#b8c959]/20 p-6 animate-pulse mb-5">
          <lucide-icon name="check-circle-2" [size]="80" class="text-[#b8c959]"></lucide-icon>
        </div>

        <!-- Заголовок -->
        <h2 class="text-[#b8c959] text-3xl font-bold mb-1">Оплата успешна</h2>
        <p class="text-gray-300 text-lg mb-6">Чек закрыт</p>

        <!-- Итоги -->
        <div class="bg-white text-black p-5 rounded w-full mb-6">
          <div class="flex justify-between text-sm mb-1.5">
            <span>Списано бонусов</span>
            <span>300 ₽</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span>Начислено бонусов</span>
            <span class="text-green-600">+125 ₽</span>
          </div>
          <div class="h-px bg-gray-300 my-2"></div>
          <div class="flex justify-between font-bold text-base">
            <span>Новый баланс</span>
            <span class="text-green-600">1 075 ₽</span>
          </div>
        </div>

        <!-- Кнопка -->
        <button
          (click)="onClose.emit()"
          class="w-full h-14 bg-[#1a1a1a] text-white rounded text-base font-medium hover:bg-[#252525] transition-colors"
        >
          Готово
        </button>
      </div>
    </pos-dialog>
  `,
})
export class SuccessDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
}
