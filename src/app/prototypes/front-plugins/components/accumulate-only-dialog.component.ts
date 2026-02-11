import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosDialogComponent } from './pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-accumulate-only-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, PosDialogComponent, IconsModule],
  template: `
    <pos-dialog [open]="open" maxWidth="lg" (dialogClose)="onClose.emit()">
      <!-- Заголовок -->
      <h2 class="text-[#b8c959] text-2xl font-bold text-center mb-1">Оплата заказа</h2>
      <p class="text-gray-300 text-center mb-6">Клиент: Петров П.П.</p>

      <!-- Warning -->
      <div class="bg-orange-500/20 border border-orange-500/40 p-4 rounded mb-5 flex gap-3">
        <lucide-icon name="info" [size]="20" class="text-orange-400 flex-shrink-0 mt-0.5"></lucide-icon>
        <span class="text-sm text-gray-200">
          Клиент не завершил регистрацию. Бонусы можно только копить.
        </span>
      </div>

      <!-- Промокод -->
      <div class="mb-5">
        <label class="text-sm text-gray-300 block mb-1.5">Промокод</label>
        <div class="flex gap-2">
          <input
            type="text"
            [(ngModel)]="promoCode"
            placeholder="Введите промокод"
            class="flex-1 h-12 px-4 bg-white text-black rounded text-sm outline-none"
          />
          <button class="h-12 px-6 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#252525] transition-colors">
            Применить
          </button>
        </div>
      </div>

      <!-- Итоги -->
      <div class="bg-[#2d2d2d] p-4 rounded mb-6">
        <div class="flex justify-between text-xl font-bold mb-1">
          <span>Сумма заказа</span>
          <span>1 800 ₽</span>
        </div>
        <div class="h-px bg-gray-600 my-2"></div>
        <div class="flex justify-between text-xl font-bold">
          <span>Будет начислено бонусов</span>
          <span class="text-[#b8c959]">+90 ₽</span>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="grid grid-cols-2 gap-3">
        <button
          (click)="onClose.emit()"
          class="h-14 bg-[#1a1a1a] text-white rounded text-base font-medium hover:bg-[#252525] transition-colors"
        >
          Отмена
        </button>
        <button
          class="h-14 bg-[#b8c959] text-black rounded text-base font-bold hover:bg-[#c5d466] transition-colors"
        >
          К оплате 1 800 ₽
        </button>
      </div>
    </pos-dialog>
  `,
})
export class AccumulateOnlyDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();

  promoCode = '';
}
