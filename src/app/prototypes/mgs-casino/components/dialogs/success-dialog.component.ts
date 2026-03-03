import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { MgsPosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'mgs-success-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, MgsPosDialogComponent],
  template: `
    <mgs-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
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

      <!-- Footer -->
      <button
        (click)="dialogClose.emit()"
        class="w-full h-14 bg-[#b8c959] text-black rounded font-bold hover:bg-[#c5d466] mt-6">
        Готово
      </button>
    </mgs-pos-dialog>
  `,
})
export class MgsSuccessDialogComponent {
  @Input() open = false;
  @Input() paymentTypeLabel = 'Cashless';
  @Input() amountDeducted = 0;
  @Input() guestName = '';
  @Input() remainingBalance = 0;
  @Output() dialogClose = new EventEmitter<void>();
}
