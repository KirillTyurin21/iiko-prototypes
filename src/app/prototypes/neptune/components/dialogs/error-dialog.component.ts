import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';
import { ErrorScenario } from '../../types';

@Component({
  selector: 'neptune-error-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
      <!-- Title -->
      <h2 class="text-2xl font-semibold text-red-400 text-center mb-2 mt-2">
        {{ scenario?.title || 'Ошибка' }}
      </h2>

      <!-- HTTP code badge -->
      <div *ngIf="scenario?.httpCode" class="flex justify-center mb-3">
        <span class="text-xs font-mono px-2 py-0.5 bg-red-900/40 text-red-300">
          HTTP {{ scenario!.httpCode }}
        </span>
      </div>

      <!-- Message -->
      <p class="text-sm text-gray-300 text-center mb-4">{{ scenario?.message || message }}</p>

      <!-- Action hint -->
      <div *ngIf="scenario?.action" class="bg-[#2d2d2d] p-3 mb-6">
        <div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Действие плагина</div>
        <p class="text-sm text-gray-200">{{ scenario!.action }}</p>
      </div>

      <!-- Footer -->
      <div class="grid gap-px bg-[#555] mt-4" [ngClass]="scenario?.retryable ? 'grid-cols-2' : 'grid-cols-1'">
        <button
          (click)="dialogClose.emit()"
          class="h-14 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold">
          Закрыть
        </button>
        <button *ngIf="scenario?.retryable"
          (click)="retryAction.emit()"
          class="h-14 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold">
          Повторить
        </button>
      </div>
    </neptune-pos-dialog>
  `,
})
export class NeptuneErrorDialogComponent {
  @Input() open = false;
  @Input() message = 'Не удалось выполнить операцию.';
  @Input() scenario: ErrorScenario | null = null;
  @Output() dialogClose = new EventEmitter<void>();
  @Output() retryAction = new EventEmitter<void>();
}
