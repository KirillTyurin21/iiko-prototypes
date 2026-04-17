import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';
import { MockGuestListItem } from '../../types';

@Component({
  selector: 'neptune-guest-list-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="lg" (dialogClose)="dialogClose.emit()">
      <!-- State switcher -->
      <div class="absolute top-2 right-2 flex gap-1 z-10">
        <button
          class="w-7 h-7 text-xs font-bold"
          [class]="state === 'loading' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#353535]'"
          (click)="state = 'loading'">L</button>
        <button
          class="w-7 h-7 text-xs font-bold"
          [class]="state === 'data' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#353535]'"
          (click)="state = 'data'">D</button>
        <button
          class="w-7 h-7 text-xs font-bold"
          [class]="state === 'error' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#353535]'"
          (click)="state = 'error'">E</button>
        <button
          class="w-7 h-7 text-xs font-bold"
          [class]="state === 'empty' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#353535]'"
          (click)="state = 'empty'">0</button>
      </div>

      <!-- Header -->
      <h2 class="text-2xl text-[#b8c959] text-center">Гости в казино</h2>
      <p class="text-base text-gray-300 text-center mb-6">Выберите гостя для идентификации</p>

      <!-- Loading state -->
      <div *ngIf="state === 'loading'" class="flex flex-col items-center justify-center py-16 gap-4">
        <lucide-icon name="loader-2" class="animate-spin text-gray-400" [size]="48"></lucide-icon>
        <p class="text-gray-400">Загрузка списка...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="state === 'empty'" class="flex flex-col items-center justify-center py-16 gap-4">
        <p class="text-gray-400 text-lg">Нет гостей в казино</p>
      </div>

      <!-- Error state -->
      <div *ngIf="state === 'error'" class="flex flex-col items-center justify-center py-16 gap-4">
        <p class="text-red-400 text-lg">Не удалось загрузить список</p>
        <div class="flex gap-px bg-[#555] mt-2">
          <button
            class="px-6 py-3 bg-[#b8c959] text-black font-semibold hover:bg-[#a8b94a] transition-colors"
            (click)="state = 'loading'">
            Повторить
          </button>
          <button
            class="px-6 py-3 bg-[#2a2a2a] text-white font-semibold hover:bg-[#333] transition-colors"
            (click)="dialogClose.emit()">
            Закрыть
          </button>
        </div>
      </div>

      <!-- Data state -->
      <div *ngIf="state === 'data'" class="max-h-[400px] overflow-y-auto">
        <button *ngFor="let g of guests; let last = last"
          class="w-full flex items-center gap-4 p-4 bg-[#2d2d2d] hover:bg-[#353535] transition-colors text-left"
          [class.border-b]="!last"
          [class.border-[#555]]="!last"
          (click)="guestSelected.emit(g)">
          <!-- Color indicator -->
          <div class="w-1 h-10 flex-shrink-0" [style.background]="g.color"></div>
          <!-- Name + ID -->
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-white">{{ g.surname }} {{ g.forename }} {{ g.middlename }}</p>
            <p class="text-sm text-gray-400">{{ g.customer_id }}</p>
          </div>
          <!-- Status badge -->
          <span class="px-3 py-1 text-xs font-bold flex-shrink-0"
                [style.background]="g.color + '33'"
                [style.color]="g.color">
            {{ g.status }}
          </span>
        </button>
      </div>

      <!-- Footer -->
      <div class="bg-[#2a2a2a] mt-6">
        <button class="w-full h-14 text-white hover:bg-[#333] font-semibold"
                (click)="dialogClose.emit()">
          Закрыть
        </button>
      </div>
    </neptune-pos-dialog>
  `,
})
export class NeptuneGuestListDialogComponent {
  @Input() open = false;
  @Input() guests: MockGuestListItem[] = [];

  @Output() dialogClose = new EventEmitter<void>();
  @Output() guestSelected = new EventEmitter<MockGuestListItem>();

  state: 'loading' | 'data' | 'empty' | 'error' = 'data';
}
