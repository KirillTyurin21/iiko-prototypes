import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';
import { MockDish } from '../../data/mock-data';

/** М14: Подтверждение доставки блюд (только для фудкорта — ручной ввод стола) */
@Component({
  selector: 'pudu-send-dish-confirm',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onCancel.emit()">
      <div class="space-y-5 mb-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-blue-400 text-center mb-2">Доставка блюд</h2>
          <p class="text-base text-center text-gray-300">Подтвердите отправку робота на раздачу</p>
        </div>

        <!-- Status icon -->
        <div class="flex flex-col items-center text-center space-y-3">
          <div class="rounded-full bg-blue-500/20 p-6">
            <lucide-icon name="utensils" [size]="48" class="text-blue-400"></lucide-icon>
          </div>
        </div>

        <!-- Info card -->
        <div class="bg-white text-black p-4 rounded space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Стол</span>
            <span class="text-sm font-medium">{{ tableName || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Блюд (позиций)</span>
            <span class="text-sm font-medium">{{ dishes.length }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Рейсов</span>
            <span class="text-sm font-medium">{{ totalTrips }}</span>
          </div>
        </div>

        <!-- Список блюд -->
        <div class="space-y-1 max-h-40 overflow-auto">
          <div *ngFor="let dish of dishes" class="flex items-center gap-2 text-sm text-gray-300 py-1">
            <span class="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>
            <span class="flex-1">{{ dish.name }}</span>
            <span class="text-gray-400">× {{ dish.quantity }}</span>
          </div>
        </div>

        <!-- Hint -->
        <div class="text-xs text-gray-500 text-center">
          Макс. {{ maxDishesPerTrip }} блюд за рейс
        </div>
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-3">
        <button (click)="onCancel.emit()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
          Отмена
        </button>
        <button (click)="onConfirm.emit()"
          [disabled]="!tableName || isSubmitting"
          class="h-14 rounded text-base font-bold transition-colors"
          [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'">
          <span *ngIf="!isSubmitting">Отправить</span>
          <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
            <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
            Отправка...
          </span>
        </button>
      </div>
    </pudu-pos-dialog>
  `,
})
export class SendDishConfirmComponent {
  @Input() open = false;
  @Input() tableName = '';
  @Input() dishes: MockDish[] = [];
  @Input() maxDishesPerTrip = 4;
  @Output() onCancel = new EventEmitter<void>();
  @Input() isSubmitting = false;
  @Output() onConfirm = new EventEmitter<void>();

  get totalTrips(): number {
    return Math.ceil(this.dishes.length / this.maxDishesPerTrip) || 1;
  }
}
