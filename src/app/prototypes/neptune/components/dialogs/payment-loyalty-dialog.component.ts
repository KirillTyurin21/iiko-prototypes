import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';
import { MockGuest, MockPoint, PaymentType } from '../../types';

@Component({
  selector: 'neptune-payment-loyalty-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">

      <!-- Header -->
      <h2 class="text-2xl text-[#b8c959] text-center">{{ title }}</h2>
      <p class="text-base text-gray-300 text-center mb-6">{{ subtitle }}</p>

      <!-- Guest info card -->
      <div *ngIf="guest" class="bg-[#2d2d2d] p-4 mb-4 flex justify-between items-center">
        <div>
          <p class="text-base font-medium text-white">{{ guestFullName }}</p>
          <span class="inline-block mt-1 px-3 py-0.5 text-xs font-bold"
                [style.background]="guest.color + '33'"
                [style.color]="guest.color">
            {{ guest.status }}
          </span>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400 uppercase tracking-wide">{{ isComp ? 'Comp баланс' : 'Баланс' }}</p>
          <p class="text-2xl font-bold text-[#b8c959]">{{ balance | number:'1.0-0' }}</p>
        </div>
      </div>

      <!-- Point type tabs (loyalty only) -->
      <div *ngIf="!isComp && guest" class="flex gap-px bg-[#555] mb-4">
        <button *ngFor="let pt of guest!.points; let i = index"
          class="flex-1 h-10 text-sm font-semibold transition-colors"
          [ngClass]="i === selectedPointIndex
            ? 'bg-[#b8c959] text-black font-bold'
            : 'bg-[#2d2d2d] text-white hover:bg-[#353535]'"
          (click)="selectedPointIndex = i">
          {{ pt.point_name }} ({{ pt.point_sum | number:'1.0-0' }})
        </button>
      </div>

      <!-- Amount input -->
      <div class="mb-4">
        <label class="block text-sm text-gray-400 mb-1">Сумма списания</label>
        <div class="h-14 bg-[#2d2d2d] flex items-center justify-end px-4 text-3xl font-bold text-white tracking-wider">
          {{ amountStr || '0' }}
        </div>
        <p class="text-xs text-gray-500 mt-1">Доступно: {{ balance | number:'1.0-0' }}</p>
      </div>

      <!-- Numpad -->
      <div class="grid grid-cols-3 gap-px bg-[#555] mb-4">
        <button *ngFor="let key of numpadKeys"
          class="h-12 text-lg font-semibold transition-colors"
          [ngClass]="key === 'C'
            ? 'bg-red-900/60 text-red-200 hover:bg-red-900/80'
            : key === '⌫'
              ? 'bg-[#d0d0d0] text-gray-700 hover:bg-[#c0c0c0]'
              : 'bg-[#f0f0f0] text-black hover:bg-[#e0e0e0]'"
          (click)="onNumpad(key)">
          {{ key }}
        </button>
      </div>

      <!-- Totals -->
      <div class="bg-[#2d2d2d] p-4 mb-4 space-y-2">
        <div class="flex justify-between text-base text-gray-300">
          <span>Итого к оплате:</span>
          <span class="font-semibold">{{ orderTotal | number:'1.0-0' }}</span>
        </div>
        <div class="flex justify-between text-base text-[#b8c959]">
          <span>{{ deductionLabel }}</span>
          <span class="font-semibold">-{{ amount | number:'1.0-0' }}</span>
        </div>
        <div class="border-t border-[#555] pt-2 flex justify-between text-base text-white">
          <span>Остаток:</span>
          <span class="font-bold">{{ remaining | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-px bg-[#555]">
        <button
          class="flex-1 h-14 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold transition-colors"
          (click)="dialogClose.emit()">
          Отмена
        </button>
        <button
          class="flex-1 h-14 font-semibold transition-colors"
          [ngClass]="canPay
            ? 'bg-[#b8c959] text-black hover:bg-[#a8b94a]'
            : 'bg-[#2d2d2d] text-gray-500 cursor-not-allowed'"
          [disabled]="!canPay"
          (click)="canPay && paymentConfirmed.emit(amount)">
          Оплатить
        </button>
      </div>

    </neptune-pos-dialog>
  `,
})
export class NeptunePaymentLoyaltyDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() guest: MockGuest | null = null;
  @Input() orderTotal = 4200;
  @Input() paymentType: PaymentType = 'loyalty';

  @Output() dialogClose = new EventEmitter<void>();
  @Output() paymentConfirmed = new EventEmitter<number>();

  amountStr = '';
  selectedPointIndex = 0;

  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.amountStr = '';
      this.selectedPointIndex = 0;
    }
  }

  get isComp(): boolean { return this.paymentType === 'comp'; }
  get title(): string { return this.isComp ? 'Оплата Comp' : 'Оплата Loyalty'; }
  get subtitle(): string { return this.isComp ? 'Списание комплиментарных баллов' : 'Списание баллов лояльности'; }
  get deductionLabel(): string { return this.isComp ? 'Списание Comp:' : 'Списание Loyalty:'; }
  get amount(): number { return parseInt(this.amountStr, 10) || 0; }

  get balance(): number {
    if (!this.guest) return 0;
    if (this.isComp) {
      const compPt = this.guest.points.find(p => p.point_id === 0);
      return compPt?.point_sum ?? 0;
    }
    return this.guest.points[this.selectedPointIndex]?.point_sum ?? 0;
  }

  get remaining(): number { return Math.max(0, this.orderTotal - this.amount); }
  get canPay(): boolean { return this.amount > 0 && this.amount <= this.balance; }

  get guestFullName(): string {
    if (!this.guest) return '';
    return `${this.guest.surname} ${this.guest.forename} ${this.guest.middlename}`;
  }

  onNumpad(key: string): void {
    if (key === 'C') {
      this.amountStr = '';
    } else if (key === '⌫') {
      this.amountStr = this.amountStr.slice(0, -1);
    } else {
      if (this.amountStr.length < 7) {
        this.amountStr += key;
      }
    }
  }
}
