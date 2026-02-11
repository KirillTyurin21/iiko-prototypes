import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosDialogComponent } from './pos-dialog.component';
import { CustomerData } from '../types';

@Component({
  selector: 'pos-customer-found-dialog',
  standalone: true,
  imports: [CommonModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" [maxWidth]="'lg'" (dialogClose)="onClose.emit()">
      <div class="space-y-5">
        <!-- Заголовок -->
        <h2 class="text-2xl font-bold text-[#b8c959] text-center">Клиент найден</h2>

        <!-- Данные клиента -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">ФИО</span>
            <span class="text-white font-medium">{{ customer.full_name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Телефон</span>
            <span class="text-white font-medium">{{ customer.phone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Номер карты</span>
            <span class="text-white font-medium">{{ customer.card_code }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Дата рождения</span>
            <span class="text-white font-medium">{{ customer.birth_date }}</span>
          </div>
        </div>

        <!-- 4 карточки -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white text-black p-4 rounded">
            <div class="text-xs text-gray-500 mb-1">Программа лояльности</div>
            <div class="font-semibold">{{ customer.program_name }}</div>
          </div>
          <div class="bg-white text-black p-4 rounded">
            <div class="text-xs text-gray-500 mb-1">Статус гостя</div>
            <div class="font-semibold">{{ customer.status_name }}</div>
          </div>
          <div class="bg-white text-black p-4 rounded">
            <div class="text-xs text-gray-500 mb-1">Скидка</div>
            <div class="font-semibold">{{ customer.discount_percent }}%</div>
          </div>
          <div class="bg-white text-black p-4 rounded">
            <div class="text-xs text-gray-500 mb-1">% бонусов</div>
            <div class="font-semibold">{{ customer.bonus_percent }}%</div>
          </div>
        </div>

        <!-- Блок бонусов -->
        <div class="bg-[#b8c959]/20 border border-[#b8c959] text-white p-5 rounded">
          <div class="text-center">
            <div class="text-xs text-[#b8c959] mb-1">Баланс бонусов</div>
            <div class="text-3xl font-bold text-[#b8c959]">
              {{ customer.bonus_balance | number:'1.0-0' }}
            </div>
            <div class="text-sm text-gray-300 mt-2">
              Доступно к списанию: <span class="text-white font-medium">{{ customer.max_bonus_out | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="grid grid-cols-2 gap-3">
          <button
            (click)="onClose.emit()"
            class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Отмена
          </button>
          <button
            (click)="onConfirm.emit()"
            class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Ввести клиента
          </button>
        </div>
      </div>
    </pos-dialog>
  `,
})
export class PosCustomerFoundDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();

  customer: CustomerData = {
    full_name: 'Иванов Иван Иванович',
    phone: '+7 (999) 123-45-67',
    card_code: '1234 5678 9012 3456',
    birth_date: '15.03.1990',
    program_name: 'Премиум бонус',
    status_name: 'Золотой',
    discount_percent: 10,
    bonus_percent: 5,
    bonus_balance: 2450,
    max_bonus_out: 1500,
  };
}
