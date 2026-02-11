import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-send-dish-blocked',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onClose.emit()">
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div class="rounded-full bg-gray-600/30 p-6">
          <lucide-icon name="package" [size]="48" class="text-gray-400"></lucide-icon>
        </div>
        <h2 class="text-2xl font-normal text-gray-400">Доставка блюд</h2>
        <p class="text-sm text-gray-300">
          Сценарий находится в разработке.
        </p>
      </div>

      <!-- Info banner -->
      <div class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4 mt-4">
        <lucide-icon name="info" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
        <div>
          <p class="text-sm text-white font-medium mb-1">Статус: [BLOCKED]</p>
          <p class="text-sm text-gray-300">
            Требуется решение по терминалу на раздаче. Подробности — в ADR (02-Архитектура/).
          </p>
        </div>
      </div>

      <button (click)="onClose.emit()"
        class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors mt-6">
        Закрыть
      </button>
    </pudu-pos-dialog>
  `,
})
export class SendDishBlockedComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
}
