import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosDialogComponent } from './pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, PosDialogComponent, IconsModule],
  template: `
    <pos-dialog [open]="open" maxWidth="lg" (dialogClose)="onClose.emit()">
      <!-- Заголовок -->
      <h2 class="text-[#b8c959] text-2xl font-bold text-center mb-1">Оплата заказа</h2>
      <p class="text-gray-300 text-center mb-6">Клиент: Иванов И.И. &bull; +7 (999) 123-45-67</p>

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

      <!-- Списание бонусов -->
      <div class="bg-[#b8c959]/15 border border-[#b8c959]/40 p-5 rounded mb-5">
        <div class="text-sm text-gray-200 mb-3">Доступно бонусов: <span class="font-semibold">800 ₽</span></div>
        <input
          type="number"
          [(ngModel)]="bonusAmount"
          placeholder="0"
          class="w-full h-14 text-xl font-semibold text-center bg-white text-black rounded outline-none mb-1.5"
        />
        <div class="text-xs text-gray-300 text-center mb-4">Введите сумму бонусов для списания</div>
        <button
          (click)="isAccumulating = !isAccumulating"
          class="w-full h-11 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#252525] transition-colors"
        >
          {{ isAccumulating ? 'Включить списание' : 'Копить бонусы' }}
        </button>
      </div>

      <!-- Итоги -->
      <div class="bg-[#2d2d2d] p-4 rounded mb-6">
        <div class="flex justify-between text-sm text-gray-200 mb-1">
          <span>Сумма заказа</span>
          <span>{{ orderTotal | number:'1.0-0' }} ₽</span>
        </div>
        <div *ngIf="bonusDeduction > 0" class="flex justify-between text-sm text-red-400 mb-1">
          <span>Списание бонусов</span>
          <span>-{{ bonusDeduction | number:'1.0-0' }} ₽</span>
        </div>
        <div class="h-px bg-gray-600 my-2"></div>
        <div class="flex justify-between text-xl font-bold">
          <span>Итого к оплате</span>
          <span class="text-[#b8c959]">{{ finalAmount | number:'1.0-0' }} ₽</span>
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
          К оплате {{ finalAmount | number:'1.0-0' }} ₽
        </button>
      </div>
    </pos-dialog>
  `,
})
export class PaymentDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();

  promoCode = '';
  bonusAmount = '0';
  isAccumulating = false;
  orderTotal = 2500;

  get bonusDeduction(): number {
    return parseInt(this.bonusAmount, 10) || 0;
  }

  get finalAmount(): number {
    return this.orderTotal - this.bonusDeduction;
  }
}
