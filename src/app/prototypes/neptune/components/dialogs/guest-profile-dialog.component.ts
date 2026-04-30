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
        <p class="text-orange-400 text-lg font-semibold">Гость не найден</p>
        <div class="bg-[#2a2a2a] mt-6">
          <button
            class="h-12 px-8 text-white hover:bg-[#333] font-semibold"
            (click)="dialogClose.emit()">
            Закрыть
          </button>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="state === 'error'" class="flex flex-col items-center justify-center py-20">
        <p class="text-red-400 text-lg font-semibold">Не удалось загрузить данные</p>
        <div class="flex gap-px bg-[#555] mt-6">
          <button
            class="h-12 px-8 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold"
            (click)="state = 'loading'">
            Повторить
          </button>
          <button
            class="h-12 px-8 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold"
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
          <!-- Avatar with color frame -->
          <div class="flex flex-col items-center">
            <div class="w-[160px] h-[160px] min-w-[160px] overflow-hidden border-[6px] border-solid"
                 [style.borderColor]="guest.color"
                 [ngClass]="roles.show_photo_role ? 'bg-[#2d2d2d]' : 'bg-[#2d2d2d] opacity-60'">
              <img *ngIf="guest.image && roles.show_photo_role"
                   [src]="guest.image"
                   class="w-full h-full object-cover"
                   alt="Фото гостя"
                   (error)="onImageError($event)">
              <div *ngIf="!guest.image || !roles.show_photo_role"
                   class="w-full h-full flex items-center justify-center">
                <span *ngIf="roles.show_fio_role && !roles.show_photo_role"
                      class="text-3xl font-bold text-gray-400">{{ initials }}</span>
                <lucide-icon *ngIf="!roles.show_fio_role || roles.show_photo_role"
                             name="user" [size]="56" class="text-gray-500"></lucide-icon>
              </div>
            </div>
            <div *ngIf="!roles.show_photo_role" class="text-[10px] text-gray-500 mt-1">
              <span class="bg-gray-700 px-1">show_photo_role</span>
            </div>
          </div>

          <!-- Info fields (label:value layout) -->
          <div class="flex-1">
            <div class="space-y-3">
              <!-- FIO -->
              <div class="flex justify-between border-b border-[#555] pb-2">
                <span class="text-sm text-gray-400">ФИО</span>
                <span *ngIf="roles.show_fio_role" class="text-base font-semibold text-white text-right">
                  {{ guest.surname }} {{ guest.forename }} {{ guest.middlename }}
                </span>
                <span *ngIf="!roles.show_fio_role" class="text-base text-gray-500 text-right">
                  Скрыто <span class="text-[10px] bg-gray-700 text-gray-400 px-1 ml-1">show_fio_role</span>
                </span>
              </div>

              <!-- Status -->
              <div class="flex justify-between border-b border-[#555] pb-2">
                <span class="text-sm text-gray-400">Статус</span>
                <span *ngIf="roles.show_state_role"
                      class="text-base font-bold"
                      [style.color]="guest.color">
                  {{ guest.status }}
                </span>
                <span *ngIf="!roles.show_state_role" class="text-base text-gray-500">
                  Скрыт <span class="text-[10px] bg-gray-700 text-gray-400 px-1 ml-1">show_state_role</span>
                </span>
              </div>

              <!-- Customer ID -->
              <div *ngIf="roles.show_id_role" class="flex justify-between border-b border-[#555] pb-2">
                <span class="text-sm text-gray-400">Customer ID</span>
                <span class="text-base text-white">{{ guest.customer_id }}</span>
              </div>

              <!-- Card number (only when identified by card) -->
              <div *ngIf="identifyMethod === 'card' && roles.show_card_role" class="flex justify-between border-b border-[#555] pb-2">
                <span class="text-sm text-gray-400">Номер карты</span>
                <span class="text-base text-white">4590 1234 5678</span>
              </div>

              <!-- Birthday -->
              <div *ngIf="roles.show_birthday_role" class="flex justify-between pb-2">
                <span class="text-sm text-gray-400">Дата рождения</span>
                <span class="text-base text-white">{{ formatBirthday(guest.birthday) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Block 2 — Balances -->
        <div class="bg-[#2d2d2d] p-5 my-4">
          <div class="grid grid-cols-2 gap-4 text-center">
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
          </div>
        </div>

        <!-- Footer -->
        <div class="grid grid-cols-2 gap-px bg-[#555] mt-6">
          <button
            class="h-14 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold"
            (click)="dialogClose.emit()">
            Закрыть
          </button>
          <button
            class="h-14 bg-[#b8c959] text-black hover:bg-[#c5d466] font-bold"
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
    card_role: true, use_cashless_role: true, use_loyalty_role: true,
    show_all_guests_role: true, show_id_role: true, show_card_role: true, show_fio_role: true,
    show_birthday_role: true, show_state_role: true, show_photo_role: true,
    show_cashless_role: true, show_loyalty_role: true,
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

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
