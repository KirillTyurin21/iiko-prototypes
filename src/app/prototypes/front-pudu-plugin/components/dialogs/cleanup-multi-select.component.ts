import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';
import { OrderTable } from '../../types';

@Component({
  selector: 'pudu-cleanup-multi-select',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="lg" (dialogClose)="onCancel.emit()">
      <div class="space-y-5">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Уборка посуды</h2>
          <p class="text-base text-center text-gray-300">Выберите столы для уборки</p>
        </div>

        <!-- Сетка столов -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Замапленные столы (кликабельные) -->
          <button *ngFor="let table of mappedTables"
            (click)="toggleTableSelection(table)"
            [ngClass]="isSelected(table) ? 'border-[#b8c959] bg-[#b8c959]/20' : 'border-gray-600 bg-[#2d2d2d]'"
            class="border-2 rounded-lg p-3 text-center transition-all hover:border-gray-400">
            <lucide-icon *ngIf="isSelected(table)" name="check-circle-2" [size]="20" class="text-[#b8c959] mx-auto mb-1"></lucide-icon>
            <p class="text-sm font-medium text-white">{{ table.table_name }}</p>
          </button>

          <!-- НЕзамапленные столы (disabled) -->
          <div *ngFor="let table of unmappedTables"
            class="border-2 border-gray-700 bg-[#1a1a1a] rounded-lg p-3 text-center opacity-40 cursor-not-allowed">
            <p class="text-sm text-gray-500">{{ table.table_name }}</p>
            <p class="text-xs text-gray-600">Не настроен</p>
          </div>
        </div>

        <!-- Счётчик выбранных -->
        <p class="text-sm text-gray-300 text-center">
          Выбрано столов: <span class="text-[#b8c959] font-bold">{{ selectedTables.length }}</span>
        </p>

        <!-- Footer -->
        <div class="grid grid-cols-2 gap-3">
          <button (click)="onCancel.emit()"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
            Отмена
          </button>
          <button (click)="onConfirm.emit(selectedTables)"
            [disabled]="selectedTables.length === 0 || isSubmitting"
            class="h-14 rounded font-medium transition-colors"
            [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : (selectedTables.length === 0 ? 'bg-[#1a1a1a] text-white opacity-50 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]')">
            <span *ngIf="!isSubmitting">Отправить робота</span>
            <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
              <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
              Отправка...
            </span>
          </button>
        </div>
      </div>
    </pudu-pos-dialog>
  `,
})
export class CleanupMultiSelectComponent {
  @Input() open = false;
  @Input() tables: OrderTable[] = [];
  @Output() onCancel = new EventEmitter<void>();
  @Input() isSubmitting = false;
  @Output() onConfirm = new EventEmitter<OrderTable[]>();

  selectedTables: OrderTable[] = [];

  get mappedTables(): OrderTable[] {
    return this.tables.filter(t => t.is_mapped);
  }

  get unmappedTables(): OrderTable[] {
    return this.tables.filter(t => !t.is_mapped);
  }

  isSelected(table: OrderTable): boolean {
    return this.selectedTables.some(t => t.table_id === table.table_id);
  }

  toggleTableSelection(table: OrderTable): void {
    if (this.isSelected(table)) {
      this.selectedTables = this.selectedTables.filter(t => t.table_id !== table.table_id);
    } else {
      this.selectedTables = [...this.selectedTables, table];
    }
  }
}
