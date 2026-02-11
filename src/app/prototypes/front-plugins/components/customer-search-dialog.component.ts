import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosDialogComponent } from './pos-dialog.component';

@Component({
  selector: 'pos-customer-search-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" [maxWidth]="'lg'" (dialogClose)="onClose.emit()">
      <div class="space-y-5">
        <!-- Заголовок -->
        <div class="text-center space-y-1">
          <h2 class="text-2xl font-bold text-[#b8c959]">Премиум бонус</h2>
          <p class="text-sm text-[#b8c959]">Введите номер телефона или проведите картой</p>
        </div>

        <!-- Переключатель типа поиска -->
        <div class="grid grid-cols-2 gap-2">
          <button
            (click)="searchType = 'phone'; value = ''"
            class="h-10 rounded text-sm font-medium transition-colors"
            [ngClass]="searchType === 'phone'
              ? 'bg-[#b8c959] text-black'
              : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'"
          >
            Телефон
          </button>
          <button
            (click)="searchType = 'card'; value = ''"
            class="h-10 rounded text-sm font-medium transition-colors"
            [ngClass]="searchType === 'card'
              ? 'bg-[#b8c959] text-black'
              : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'"
          >
            Карта
          </button>
        </div>

        <!-- Поле ввода карты -->
        <div *ngIf="searchType === 'card'">
          <input
            type="text"
            [value]="value"
            readonly
            placeholder="Проведите картой..."
            class="w-full h-14 text-lg bg-[#b8c959]/20 border border-[#b8c959] text-white rounded px-4 outline-none placeholder-[#b8c959]/50"
          />
        </div>

        <!-- Поле ввода телефона -->
        <div *ngIf="searchType === 'phone'">
          <input
            type="text"
            [value]="formattedPhone"
            readonly
            placeholder="+7 (___) ___-__-__"
            class="w-full h-14 text-lg bg-white text-black rounded px-4 outline-none"
          />
        </div>

        <!-- Цифровая клавиатура -->
        <div class="grid grid-cols-3 gap-2">
          <button
            *ngFor="let key of numpadKeys"
            (click)="onNumpadPress(key)"
            class="h-16 text-2xl bg-white text-black hover:bg-gray-100 border border-gray-300 rounded font-medium transition-colors flex items-center justify-center"
          >
            {{ key }}
          </button>
        </div>

        <!-- Кнопки действий -->
        <div class="grid grid-cols-2 gap-3">
          <button
            (click)="onClose.emit()"
            class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            Отмена
          </button>
          <button
            (click)="onConfirm.emit(value)"
            class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          >
            ОК
          </button>
        </div>
      </div>
    </pos-dialog>
  `,
})
export class PosCustomerSearchDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<string>();

  searchType: 'phone' | 'card' = 'phone';
  value = '';

  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✕'];

  get formattedPhone(): string {
    const digits = this.value.replace(/\D/g, '');
    if (!digits) return '';
    let result = '+7';
    if (digits.length > 0) result += ' (' + digits.substring(0, 3);
    if (digits.length >= 3) result += ') ';
    if (digits.length > 3) result += digits.substring(3, 6);
    if (digits.length > 6) result += '-' + digits.substring(6, 8);
    if (digits.length > 8) result += '-' + digits.substring(8, 10);
    return result;
  }

  onNumpadPress(key: string): void {
    if (key === '←') {
      this.value = this.value.slice(0, -1);
    } else if (key === '✕') {
      this.value = '';
    } else {
      if (this.searchType === 'phone' && this.value.length >= 10) return;
      this.value += key;
    }
  }
}
