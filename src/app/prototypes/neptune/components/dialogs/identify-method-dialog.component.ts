import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentifyMethod } from '../../types';
import { NeptunePosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'neptune-identify-method-dialog',
  standalone: true,
  imports: [CommonModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" title="Идентификация гостя" (dialogClose)="dialogClose.emit()">

      <h2 class="text-2xl text-[#b8c959] text-center mb-6">Идентификация гостя</h2>
      <p class="text-base text-gray-300 text-center mb-6">Выберите способ идентификации:</p>

      <div class="space-y-px bg-[#555]">
        <!-- Card scan -->
        <button (click)="select('card')"
                class="w-full flex items-center justify-center p-5 bg-[#e8e8e8]
                       hover:bg-[#d8d8d8] transition-colors text-left">
          <span class="text-base font-semibold text-black">Сканирование карты</span>
        </button>

        <!-- ID input -->
        <button (click)="select('id')"
                class="w-full flex items-center justify-center p-5 bg-[#e8e8e8]
                       hover:bg-[#d8d8d8] transition-colors text-left">
          <span class="text-base font-semibold text-black">Ввод Customer ID</span>
        </button>
      </div>

      <!-- Footer -->
      <div class="bg-[#2a2a2a] mt-6">
        <button class="w-full h-14 text-white hover:bg-[#333] font-semibold"
                (click)="dialogClose.emit()">
          Отмена
        </button>
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
