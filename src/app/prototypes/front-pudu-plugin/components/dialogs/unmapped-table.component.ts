import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-unmapped-table',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onClose.emit()">
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div class="rounded-full bg-orange-500/20 p-6">
          <lucide-icon name="alert-circle" [size]="48" class="text-orange-400"></lucide-icon>
        </div>
        <h2 class="text-2xl font-semibold text-orange-400">Стол не настроен</h2>
        <p class="text-sm text-gray-300">
          Стол «{{ tableName }}» не привязан к точке робота.
        </p>
        <p class="text-sm text-gray-300">
          Настройте маппинг в <span class="text-[#b8c959] font-medium">Web → Маппинг столов</span>.
        </p>
      </div>
      <button (click)="onClose.emit()"
        class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors mt-6">
        Закрыть
      </button>
    </pudu-pos-dialog>
  `,
})
export class UnmappedTableComponent {
  @Input() open = false;
  @Input() tableName = '';
  @Output() onClose = new EventEmitter<void>();
}
