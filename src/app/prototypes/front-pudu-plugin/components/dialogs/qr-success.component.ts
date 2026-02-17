import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-qr-success',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="sm" (dialogClose)="onClose.emit()">
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div class="rounded-full bg-[#b8c959]/20 p-6">
          <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
        </div>
        <h2 class="text-2xl font-normal text-[#b8c959]">Оплата прошла</h2>
        <p class="text-sm text-gray-300">«{{ phraseSuccess }}»</p>
        <p class="text-sm text-gray-400">Сумма: {{ total | number }} ₽ · {{ tableName }}</p>
      </div>
      <button (click)="onClose.emit()"
        class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors mt-6">
        Готово
      </button>
    </pudu-pos-dialog>
  `,
})
export class QrSuccessComponent {
  @Input() open = false;
  @Input() tableName = '';
  @Input() total = 0;
  @Input() phraseSuccess = 'Спасибо за оплату!';
  @Output() onClose = new EventEmitter<void>();
}
