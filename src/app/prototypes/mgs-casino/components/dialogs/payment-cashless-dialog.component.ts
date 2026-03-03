import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { MgsPosDialogComponent } from '../pos-dialog.component';
import { MockGuest } from '../../types';

@Component({
  selector: 'mgs-payment-cashless-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, MgsPosDialogComponent, DecimalPipe],
  template: `
    <mgs-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
      <!-- Header -->
      <h2 class="text-2xl text-[#b8c959] text-center">Оплата Cashless</h2>
      <p class="text-base text-gray-300 text-center mb-6">
        Списание кэш-поинтов со счёта гостя
      </p>

      <!-- Guest info card -->
      <div
        *ngIf="guest"
        class="bg-[#2d2d2d] rounded p-4 mb-4 flex justify-between items-center"
      >
        <div>
          <span class="text-white font-semibold">{{ guestFullName }}</span>
          <span
            class="ml-2 inline-block text-xs px-2 py-0.5 rounded-full"
            [style.background-color]="guest.color + '33'"
            [style.color]="guest.color"
          >
            {{ guest.status }}
          </span>
        </div>
        <div class="text-[#b8c959] font-bold text-lg">
          {{ balance | number:'1.0-0' }}
        </div>
      </div>

      <!-- Amount input section -->
      <div>
        <label class="text-sm text-gray-300 mb-2 block">Сумма списания</label>
        <div
          class="w-full h-14 text-2xl text-center bg-[#b8c959]/20 border border-[#b8c959] text-white rounded px-4 flex items-center justify-center font-mono"
        >
          {{ amountStr || '0' }}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Доступно для списания: {{ balance | number:'1.0-0' }}
        </div>
      </div>

      <!-- Numpad -->
      <div class="grid grid-cols-3 gap-2 mt-4">
        <button
          *ngFor="let key of numpadKeys"
          type="button"
          class="h-16 rounded text-xl font-semibold transition-colors"
          [ngClass]="
            key === '←' || key === '✕'
              ? 'bg-[#2d2d2d] text-gray-300 hover:bg-[#353535]'
              : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'
          "
          (click)="onNumpadClick(key)"
        >
          {{ key }}
        </button>
      </div>

      <!-- Totals block -->
      <div class="bg-[#2d2d2d] rounded p-4 space-y-2 mt-4">
        <div class="flex justify-between text-base">
          <span class="text-gray-300">Сумма заказа:</span>
          <span class="font-semibold text-white">{{ orderTotal | number:'1.0-0' }}</span>
        </div>
        <div class="flex justify-between text-base text-[#b8c959]">
          <span>Списание Cashless:</span>
          <span class="font-semibold">-{{ amount | number:'1.0-0' }}</span>
        </div>
        <div class="h-px bg-gray-600 my-2"></div>
        <div class="flex justify-between text-xl font-bold">
          <span class="text-white">Остаток к оплате:</span>
          <span class="text-[#b8c959]">{{ remaining | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-3 mt-6">
        <button
          type="button"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold transition-colors"
          (click)="dialogClose.emit()"
        >
          Отмена
        </button>
        <button
          type="button"
          class="h-14 rounded font-bold transition-colors"
          [ngClass]="
            canPay
              ? 'bg-[#b8c959] text-black hover:bg-[#c5d466]'
              : 'bg-[#b8c959]/50 text-black/50 cursor-not-allowed opacity-50'
          "
          [disabled]="!canPay"
          (click)="canPay && paymentConfirmed.emit(amount)"
        >
          Списать {{ amount | number:'1.0-0' }}
        </button>
      </div>
    </mgs-pos-dialog>
  `,
})
export class MgsPaymentCashlessDialogComponent {
  @Input() open = false;
  @Input() guest: MockGuest | null = null;
  @Input() orderTotal = 4200;

  @Output() dialogClose = new EventEmitter<void>();
  @Output() paymentConfirmed = new EventEmitter<number>();

  amountStr = '';

  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✕'];

  get amount(): number {
    return parseInt(this.amountStr, 10) || 0;
  }

  get balance(): number {
    return this.guest?.balance_cash ?? 0;
  }

  get remaining(): number {
    return Math.max(0, this.orderTotal - this.amount);
  }

  get canPay(): boolean {
    return this.amount > 0 && this.amount <= this.balance;
  }

  get guestFullName(): string {
    if (!this.guest) return '';
    return `${this.guest.surname} ${this.guest.forename} ${this.guest.middlename}`;
  }

  onNumpadClick(key: string): void {
    if (key === '←') {
      this.amountStr = this.amountStr.slice(0, -1);
    } else if (key === '✕') {
      this.amountStr = '';
    } else if (this.amountStr.length < 7) {
      this.amountStr += key;
    }
  }
}
