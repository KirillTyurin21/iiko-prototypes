import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';
import { MockGuest, IdentifyMethod, DemoRoles } from '../../types';

@Component({
  selector: 'neptune-guest-profile-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="lg"
                        [borderColor]="guest?.color || ''"
                        (dialogClose)="dialogClose.emit()">

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
          <!-- Avatar -->
          <div class="w-[128px] h-[128px] min-w-[128px] rounded-lg overflow-hidden"
               [ngClass]="roles.show_photo_role ? 'bg-[#2d2d2d]' : 'bg-[#2d2d2d] opacity-30'">
            <img *ngIf="guest.image && roles.show_photo_role"
                 [src]="guest.image"
                 class="w-full h-full object-cover"
                 alt="Фото гостя"
                 (error)="onImageError($event)">
            <div *ngIf="!guest.image || !roles.show_photo_role"
                 class="w-full h-full flex items-center justify-center">
              <span *ngIf="roles.show_fio_role && !roles.show_photo_role"
                    class="text-2xl font-bold text-gray-400">{{ initials }}</span>
              <lucide-icon *ngIf="!roles.show_fio_role || roles.show_photo_role"
                           name="user" [size]="48" class="text-gray-500"></lucide-icon>
            </div>
            <div *ngIf="!roles.show_photo_role" class="absolute text-xs text-gray-500 mt-1">
              <span class="bg-gray-700 px-1 rounded text-[10px]">show_photo_role</span>
            </div>
          </div>

          <!-- Info card -->
          <div class="flex-1">
            <div class="bg-white text-black p-3 rounded mb-2">
              <!-- FIO -->
              <div *ngIf="roles.show_fio_role" class="text-lg font-semibold text-black">
                {{ guest.surname }} {{ guest.forename }} {{ guest.middlename }}
              </div>
              <div *ngIf="!roles.show_fio_role" class="text-lg font-semibold text-gray-300">
                ФИО скрыто
                <span class="text-[10px] bg-gray-200 text-gray-500 px-1 rounded ml-1">show_fio_role</span>
              </div>

              <!-- Status -->
              <div *ngIf="roles.show_state_role">
                <span
                  class="inline-block px-3 py-1 rounded-full text-sm font-bold mt-1"
                  [style.background]="guest.color + '33'"
                  [style.color]="guest.color">
                  {{ guest.status }}
                </span>
              </div>
              <div *ngIf="!roles.show_state_role" class="text-sm text-gray-300 mt-1">
                Статус скрыт
                <span class="text-[10px] bg-gray-200 text-gray-500 px-1 rounded ml-1">show_state_role</span>
              </div>

              <!-- Customer ID -->
              <div *ngIf="roles.show_id_role" class="text-sm text-gray-600 mt-2">
                Customer ID: {{ guest.customer_id }}
              </div>

              <!-- Card number (only when identified by card) -->
              <div *ngIf="identifyMethod === 'card' && roles.show_card_role" class="text-sm text-gray-600">
                Номер карты: 4590 1234 5678
              </div>

              <!-- Birthday -->
              <div *ngIf="roles.show_birthday_role" class="text-sm text-gray-600">
                Дата рождения: {{ formatBirthday(guest.birthday) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Block 2 — Balances -->
        <div class="bg-[#b8c959]/20 border border-[#b8c959] rounded p-5 my-4">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div [ngClass]="{'opacity-30': !roles.show_cashless_role}">
              <div class="text-2xl font-bold text-[#b8c959]">{{ roles.show_cashless_role ? (guest.balance_cash | number:'1.0-0') : '—' }}</div>
              <div class="text-xs text-gray-400">
                Cashless
                <span *ngIf="!roles.show_cashless_role" class="block text-[10px] text-gray-500">show_cashless_role</span>
              </div>
            </div>
            <div [ngClass]="{'opacity-30': !roles.show_loyalty_role}">
              <div class="text-2xl font-bold text-[#b8c959]">{{ roles.show_loyalty_role ? (loyaltyTotal | number:'1.0-0') : '—' }}</div>
              <div class="text-xs text-gray-400">
                Loyalty
                <span *ngIf="!roles.show_loyalty_role" class="block text-[10px] text-gray-500">show_loyalty_role</span>
              </div>
            </div>
            <div [ngClass]="{'opacity-30': !roles.show_comp_role}">
              <div class="text-2xl font-bold text-[#b8c959]">{{ roles.show_comp_role ? (compBalance | number:'1.0-0') : '—' }}</div>
              <div class="text-xs text-gray-400">
                Comp
                <span *ngIf="!roles.show_comp_role" class="block text-[10px] text-gray-500">show_comp_role</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Block 3 — Points detail -->
        <div *ngIf="roles.show_loyalty_role" class="bg-[#2d2d2d] rounded p-4 mt-4">
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
  @Input() identifyMethod: IdentifyMethod | null = null;
  @Input() roles: DemoRoles = {
    card_role: true, use_cashless_role: true, use_loyalty_role: true, use_comp_role: true,
    show_all_guests_role: true, show_id_role: true, show_card_role: true, show_fio_role: true,
    show_birthday_role: true, show_state_role: true, show_photo_role: true,
    show_cashless_role: true, show_loyalty_role: true, show_comp_role: true,
  };

  @Output() dialogClose = new EventEmitter<void>();
  @Output() payAction = new EventEmitter<void>();

  state: 'loading' | 'data' | 'not-found' | 'error' = 'data';

  get initials(): string {
    if (!this.guest) return '';
    return (this.guest.surname.charAt(0) + this.guest.forename.charAt(0)).toUpperCase();
  }

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

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
