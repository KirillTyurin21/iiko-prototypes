import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { IdentifyMethod } from '../../types';
import { NeptunePosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'neptune-identify-method-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" title="Идентификация гостя" (dialogClose)="dialogClose.emit()">

      <div class="py-2">
        <p class="text-sm text-gray-500 mb-4">Выберите способ идентификации гостя в системе:</p>

        <div class="space-y-3">
          <!-- Card scan -->
          <button (click)="select('card')"
                  class="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200
                         hover:border-blue-300 hover:bg-blue-50 transition-all duration-200
                         cursor-pointer group text-left">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 shrink-0">
              <lucide-icon name="credit-card" [size]="24" class="text-blue-600"></lucide-icon>
            </div>
            <div>
              <div class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                Сканирование карты
              </div>
              <div class="text-sm text-gray-500 mt-0.5">
                POST /v1/search/card — поиск гостя по номеру карты лояльности
              </div>
            </div>
            <lucide-icon name="chevron-right" [size]="18" class="text-gray-300 ml-auto shrink-0"></lucide-icon>
          </button>

          <!-- ID input -->
          <button (click)="select('id')"
                  class="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200
                         hover:border-green-300 hover:bg-green-50 transition-all duration-200
                         cursor-pointer group text-left">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 shrink-0">
              <lucide-icon name="hash" [size]="24" class="text-green-600"></lucide-icon>
            </div>
            <div>
              <div class="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                Ввод Customer ID
              </div>
              <div class="text-sm text-gray-500 mt-0.5">
                POST /v1/search/id — прямой ввод идентификатора гостя
              </div>
            </div>
            <lucide-icon name="chevron-right" [size]="18" class="text-gray-300 ml-auto shrink-0"></lucide-icon>
          </button>
        </div>
      </div>

    </neptune-pos-dialog>
  `,
})
export class NeptuneIdentifyMethodDialogComponent {
  @Input() open = false;
  @Output() dialogClose = new EventEmitter<void>();
  @Output() methodSelected = new EventEmitter<IdentifyMethod>();

  select(method: IdentifyMethod): void {
    this.methodSelected.emit(method);
  }
}
