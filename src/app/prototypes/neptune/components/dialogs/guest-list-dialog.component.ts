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
        <div class="grid grid-cols-2 gap-3">
          <button *ngFor="let g of guests"
            class="flex items-start gap-3 p-3 bg-[#2d2d2d] hover:bg-[#353535] transition-colors text-left border-2"
            [style.border-color]="g.color"
            (click)="guestSelected.emit(g)">
            <!-- Photo -->
            <img *ngIf="g.image" [src]="g.image" [alt]="g.surname"
                 class="w-20 h-20 object-cover flex-shrink-0 bg-[#555]">
            <div *ngIf="!g.image"
                 class="w-20 h-20 flex-shrink-0 bg-[#555] flex items-center justify-center">
              <lucide-icon name="user" [size]="32" class="text-gray-500"></lucide-icon>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0 py-1">
              <p class="text-sm font-medium text-white leading-tight">{{ g.surname }} {{ g.forename }} {{ g.middlename }}</p>
              <span class="inline-block mt-1 px-2 py-0.5 text-xs font-bold"
                    [style.background]="g.color + '33'"
                    [style.color]="g.color">
                {{ g.status }}
              </span>
              <p class="text-xs text-gray-400 mt-1">{{ g.customer_id }}</p>
            </div>
          </button>
        </div>
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
