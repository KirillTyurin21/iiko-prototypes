import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-qr-cashier-phase',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onCancel.emit()">
      <div class="space-y-5 mb-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Оплата по QR</h2>
          <p class="text-base text-center text-gray-300">Робот у кассы — положите чек</p>
        </div>

        <!-- Status icon -->
        <div class="flex flex-col items-center text-center space-y-3">
          <div class="rounded-full bg-[#b8c959]/20 p-6">
            <lucide-icon name="printer" [size]="48" class="text-[#b8c959]"></lucide-icon>
          </div>
        </div>

        <!-- Phrase -->
        <div class="bg-[#b8c959]/20 border border-[#b8c959] rounded p-4 text-center">
          <p class="text-base text-white font-medium">«Положите чек для {{ tableName }}»</p>
        </div>

        <!-- Info card -->
        <div class="bg-white text-black p-4 rounded space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Стол</span>
            <span class="text-sm font-medium">{{ tableName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Сумма</span>
            <span class="text-sm font-medium">{{ total | number }} ₽</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Робот</span>
            <span class="text-sm font-medium">{{ robotName }}</span>
          </div>
        </div>

        <!-- Timer -->
        <div class="text-center">
          <p class="text-xs text-gray-400 mb-1">Тайм-аут ожидания</p>
          <p class="text-3xl font-bold text-[#b8c959]">{{ formatTime(countdown) }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-3">
        <button (click)="onCancel.emit()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
          Отмена
        </button>
        <button (click)="onSendToGuest.emit()"
          class="h-14 bg-[#b8c959] text-black rounded text-base font-bold hover:bg-[#c5d466] transition-colors">
          Отправить к гостю
        </button>
      </div>
    </pudu-pos-dialog>
  `,
})
export class QrCashierPhaseComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() tableName = '';
  @Input() robotName = '';
  @Input() total = 0;
  @Input() cashierTimeout = 30;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSendToGuest = new EventEmitter<void>();
  @Output() onTimeout = new EventEmitter<void>();

  countdown = 30;
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
    this.countdown = this.cashierTimeout;
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
