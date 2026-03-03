import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { MgsPosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'mgs-error-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, MgsPosDialogComponent],
  template: `
    <mgs-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
      <!-- Status icon -->
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
          <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-semibold text-red-400 text-center mb-4">Ошибка</h2>

      <!-- Message -->
      <p class="text-sm text-gray-300 text-center mb-6">{{ message }}</p>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-3">
        <button
          (click)="dialogClose.emit()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold">
          Закрыть
        </button>
        <button
          (click)="retryAction.emit()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold">
          Повторить
        </button>
      </div>
    </mgs-pos-dialog>
  `,
})
export class MgsErrorDialogComponent {
  @Input() open = false;
  @Input() message = 'Не удалось выполнить операцию.';
  @Output() dialogClose = new EventEmitter<void>();
  @Output() retryAction = new EventEmitter<void>();
}
