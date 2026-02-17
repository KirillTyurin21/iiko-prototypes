import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-send-menu-confirm',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onCancel.emit()">
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Отправить меню</h2>
          <p class="text-base text-center text-gray-300">Робот доставит меню к столу</p>
        </div>

        <!-- Info card -->
        <div class="bg-white text-black p-4 rounded space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Стол</span>
            <span class="text-sm font-medium">{{ tableName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Робот</span>
            <span class="text-sm font-medium">{{ robotName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Фраза у стола</span>
            <span class="text-sm font-medium italic">«{{ phrase }}»</span>
          </div>
          <!-- Фраза при заборе меню (D7.1, З-15) -->
          <div class="h-px bg-gray-200"></div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Фраза при заборе</span>
            <span class="text-sm font-medium italic">«{{ phrasePickup }}»</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="grid grid-cols-2 gap-3">
          <button (click)="onCancel.emit()"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
            Отмена
          </button>
          <button (click)="onConfirm.emit()"
            [disabled]="isSubmitting"
            class="h-14 rounded font-medium transition-colors"
            [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'">
            <span *ngIf="!isSubmitting">Отправить</span>
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
export class SendMenuConfirmComponent {
  @Input() open = false;
  @Input() tableName = '';
  @Input() robotName = '';
  @Input() phrase = '';
  @Input() phrasePickup = '';
  @Output() onCancel = new EventEmitter<void>();
  @Input() isSubmitting = false;
  @Output() onConfirm = new EventEmitter<void>();
}
