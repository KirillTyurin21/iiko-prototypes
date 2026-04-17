import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';
import { MockOrderItem } from '../../types';

@Component({
  selector: 'neptune-success-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
      <!-- Status icon -->
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 rounded-full bg-[#b8c959]/20 flex items-center justify-center">
          <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959] animate-pulse"></lucide-icon>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-semibold text-[#b8c959] text-center mb-6">Операция выполнена</h2>

      <!-- Result block -->
      <div class="bg-[#2d2d2d] rounded p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-300">Тип оплаты:</span>
          <span class="text-white">{{ paymentTypeLabel }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-300">Списано:</span>
          <span class="text-white">{{ amountDeducted | number:'1.2-2' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-300">Гость:</span>
          <span class="text-white">{{ guestName }}</span>
        </div>
        <div class="h-px bg-gray-600 my-2"></div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-300 font-semibold">Остаток на счёте:</span>
          <span class="text-[#b8c959] font-semibold">{{ remainingBalance | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Receipt simulation -->
      <div *ngIf="orderItems.length > 0" class="mt-4">
        <div class="flex items-center gap-2 mb-2">
          <lucide-icon name="receipt" [size]="14" class="text-gray-400"></lucide-icon>
          <span class="text-xs text-gray-400 uppercase tracking-wide">Имитация пречека</span>
        </div>
        <div class="bg-white text-black rounded p-4 font-mono text-xs leading-relaxed"
             style="font-family: 'Courier New', monospace;">
          <div class="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
            <div class="font-bold text-sm">ПРЕЧЕК</div>
          </div>

          <div *ngFor="let item of orderItems" class="flex justify-between">
            <span>{{ item.name }}
              <span *ngIf="item.quantity > 1"> x{{ item.quantity }}</span>
            </span>
            <span>{{ item.price * item.quantity }}</span>
          </div>

          <div class="border-t border-dashed border-gray-400 mt-2 pt-2 flex justify-between font-bold">
            <span>ИТОГО:</span>
            <span>{{ orderTotal | number:'1.0-0' }}</span>
          </div>

          <div class="border-t border-dashed border-gray-400 mt-2 pt-2 text-gray-600">
            <div class="flex justify-between">
              <span>{{ paymentTypeLabel }}:</span>
              <span>-{{ amountDeducted | number:'1.0-0' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Остаток на счёте:</span>
              <span>{{ remainingBalance | number:'1.0-0' }}</span>
            </div>
          </div>

          <div class="border-t border-dashed border-gray-400 mt-2 pt-2 text-center text-gray-500">
            {{ prechequeText }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <button
        (click)="dialogClose.emit()"
        class="w-full h-14 bg-[#b8c959] text-black rounded font-bold hover:bg-[#c5d466] mt-6">
        Готово
      </button>
    </neptune-pos-dialog>
  `,
})
export class NeptuneSuccessDialogComponent {
  @Input() open = false;
  @Input() paymentTypeLabel = 'Cashless';
  @Input() amountDeducted = 0;
  @Input() guestName = '';
  @Input() remainingBalance = 0;
  @Input() orderItems: MockOrderItem[] = [];
  @Input() orderTotal = 0;
  @Output() dialogClose = new EventEmitter<void>();

  get prechequeText(): string {
    return `Списание MGS: ${this.amountDeducted} руб.`;
  }
}
