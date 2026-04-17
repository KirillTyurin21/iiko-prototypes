import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';
import { MockGuest } from '../../types';

@Component({
  selector: 'neptune-guest-profile-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="lg" (dialogClose)="dialogClose.emit()">

      <!-- State switcher (debug) -->
      <div class="absolute top-2 right-2 flex gap-1 z-10">
        <button class="text-xs text-gray-600 hover:text-gray-400 px-1" (click)="state = 'loading'">L</button>
        <button class="text-xs text-gray-600 hover:text-gray-400 px-1" (click)="state = 'data'">D</button>
        <button class="text-xs text-gray-600 hover:text-gray-400 px-1" (click)="state = 'error'">E</button>
        <button class="text-xs text-gray-600 hover:text-gray-400 px-1" (click)="state = 'not-found'">0</button>
      </div>

      <!-- Loading -->
      <div *ngIf="state === 'loading'" class="flex flex-col items-center justify-center py-20">
        <lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
        <p class="text-gray-400 text-sm mt-4">Загрузка профиля...</p>
      </div>

      <!-- Not found -->
      <div *ngIf="state === 'not-found'" class="flex flex-col items-center justify-center py-20">
        <lucide-icon name="alert-circle" [size]="48" class="text-orange-400"></lucide-icon>
        <p class="text-orange-400 text-lg font-semibold mt-4">Гость не найден</p>
        <button
          class="mt-6 h-12 px-8 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold"
          (click)="dialogClose.emit()">
          Закрыть
        </button>
      </div>

      <!-- Error -->
      <div *ngIf="state === 'error'" class="flex flex-col items-center justify-center py-20">
        <lucide-icon name="wifi-off" [size]="48" class="text-red-400"></lucide-icon>
        <p class="text-red-400 text-lg font-semibold mt-4">Не удалось загрузить данные</p>
        <div class="flex gap-3 mt-6">
          <button
            class="h-12 px-8 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold"
            (click)="state = 'loading'">
            Повторить
          </button>
          <button
            class="h-12 px-8 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold"
            (click)="dialogClose.emit()">
            Закрыть
          </button>
        </div>
      </div>

      <!-- Data -->
      <div *ngIf="state === 'data' && guest">

        <!-- Header -->
        <h2 class="text-2xl text-[#b8c959] text-center">Профиль гостя</h2>
        <p class="text-base text-gray-300 text-center mb-6">Информация о госте казино</p>

        <!-- Block 1 — Main info -->
        <div class="flex gap-6">
          <!-- Avatar placeholder -->
          <div class="w-[128px] h-[128px] min-w-[128px] rounded-lg bg-[#2d2d2d] flex items-center justify-center">
            <lucide-icon name="user" [size]="48" class="text-gray-500"></lucide-icon>
          </div>

          <!-- Info card -->
          <div class="flex-1">
            <div class="bg-white text-black p-3 rounded mb-2">
              <div class="text-lg font-semibold text-black">
                {{ guest.surname }} {{ guest.forename }} {{ guest.middlename }}
              </div>
              <span
                class="inline-block px-3 py-1 rounded-full text-sm font-bold mt-1"
                [style.background]="guest.color + '33'"
                [style.color]="guest.color">
                {{ guest.status }}
              </span>
              <div class="text-sm text-gray-600 mt-2">Customer ID: {{ guest.customer_id }}</div>
              <div class="text-sm text-gray-600">Номер карты: 4590 1234 5678</div>
              <div class="text-sm text-gray-600">Дата рождения: {{ formatBirthday(guest.birthday) }}</div>
            </div>
          </div>
        </div>

        <!-- Block 2 — Balances -->
        <div class="bg-[#b8c959]/20 border border-[#b8c959] rounded p-5 my-4">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-[#b8c959]">{{ guest.balance_cash | number:'1.0-0' }}</div>
              <div class="text-xs text-gray-400">Cashless</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#b8c959]">{{ loyaltyTotal | number:'1.0-0' }}</div>
              <div class="text-xs text-gray-400">Loyalty</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#b8c959]">{{ compBalance | number:'1.0-0' }}</div>
              <div class="text-xs text-gray-400">Comp</div>
            </div>
          </div>
        </div>

        <!-- Block 3 — Points detail -->
        <div class="bg-[#2d2d2d] rounded p-4 mt-4">
          <div
            *ngFor="let pt of guest.points; let last = last"
            class="flex justify-between py-2"
            [class.border-b]="!last"
            [class.border-gray-600]="!last">
            <span class="text-sm text-gray-300">{{ pt.point_name }}</span>
            <span class="text-sm font-semibold text-white">{{ pt.point_sum | number:'1.0-0' }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="grid grid-cols-2 gap-3 mt-6">
          <button
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold"
            (click)="dialogClose.emit()">
            Закрыть
          </button>
          <button
            class="h-14 bg-[#b8c959] text-black hover:bg-[#c5d466] rounded font-bold"
            (click)="payAction.emit()">
            К оплате
          </button>
        </div>

      </div>

    </neptune-pos-dialog>
  `,
})
export class NeptuneGuestProfileDialogComponent {
  @Input() open = false;
  @Input() guest: MockGuest | null = null;

  @Output() dialogClose = new EventEmitter<void>();
  @Output() payAction = new EventEmitter<void>();

  state: 'loading' | 'data' | 'not-found' | 'error' = 'data';

  formatBirthday(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }

  get loyaltyTotal(): number {
    return this.guest?.points.reduce((s, p) => s + p.point_sum, 0) ?? 0;
  }

  get compBalance(): number {
    return this.guest?.points.find(p => p.point_id === 0)?.point_sum ?? 0;
  }
}
