import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-qr-guest-phase',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onCancel.emit()">
      <div class="space-y-5 mb-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Ожидание оплаты</h2>
          <p class="text-base text-center text-gray-300">Робот у стола — гость сканирует QR</p>
        </div>

        <!-- Mock QR code -->
        <div class="flex flex-col items-center space-y-3">
          <div class="bg-white p-4 rounded-lg">
            <div class="w-[150px] h-[150px] bg-gray-200 rounded flex items-center justify-center">
              <lucide-icon name="qr-code" [size]="80" class="text-gray-500"></lucide-icon>
            </div>
          </div>
          <p class="text-xs text-gray-400">Гость сканирует QR для оплаты</p>
        </div>

        <!-- Info -->
        <div class="bg-white text-black p-4 rounded space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Сумма к оплате</span>
            <span class="text-sm font-bold text-[#b8c959]">{{ total | number }} ₽</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Стол</span>
            <span class="text-sm font-medium">{{ tableName }}</span>
          </div>
        </div>

        <!-- Timer -->
        <div class="text-center">
          <p class="text-xs text-gray-400 mb-1">Ожидание оплаты</p>
          <p class="text-3xl font-bold text-[#b8c959]">{{ formatTime(countdown) }}</p>
        </div>
      </div>

      <!-- Footer: demo button -->
      <button (click)="onPaymentConfirmed.emit()"
        class="w-full h-14 bg-[#b8c959] text-black rounded text-base font-bold hover:bg-[#c5d466] transition-colors">
        Оплата подтверждена
      </button>
    </pudu-pos-dialog>
  `,
})
export class QrGuestPhaseComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() tableName = '';
  @Input() total = 0;
  @Input() guestWaitTime = 120;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onPaymentConfirmed = new EventEmitter<void>();
  @Output() onTimeout = new EventEmitter<void>();

  countdown = 120;
  private intervalId: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.countdown = this.guestWaitTime;
    this.stopTimer();
    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopTimer();
        this.onTimeout.emit();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
