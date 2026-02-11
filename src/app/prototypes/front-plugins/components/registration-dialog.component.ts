import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from './pos-dialog.component';

/**
 * Модальное окно регистрации — ТЁМНАЯ POS-тема.
 * Форма с полями клиента и кнопками действий.
 */
@Component({
  selector: 'pos-registration-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" maxWidth="xl" [closable]="true" (dialogClose)="onClose.emit()">
      <div class="flex flex-col space-y-6">
        <!-- Заголовок -->
        <h2 class="text-2xl font-bold text-[#b8c959] text-center">Регистрация</h2>

        <!-- Форма -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <!-- Номер телефона -->
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-300">Номер телефона</label>
            <input
              type="text"
              [(ngModel)]="formData.phone"
              class="h-12 bg-white text-black rounded px-3 outline-none"
              placeholder="79001234567"
            />
          </div>

          <!-- Номер карты -->
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-300">Номер карты</label>
            <input
              type="text"
              [(ngModel)]="formData.cardNumber"
              class="h-12 bg-white text-black rounded px-3 outline-none"
              placeholder="111"
            />
          </div>

          <!-- Имя -->
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-300">Имя</label>
            <input
              type="text"
              [(ngModel)]="formData.name"
              class="h-12 bg-white text-black rounded px-3 outline-none"
              placeholder="Имя клиента"
            />
          </div>

          <!-- Дата рождения -->
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-300">Дата рождения</label>
            <input
              type="date"
              [(ngModel)]="formData.birthDate"
              class="h-12 bg-white text-black rounded px-3 outline-none"
            />
          </div>

          <!-- Группа -->
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-300">Группа</label>
            <input
              type="text"
              [(ngModel)]="formData.group"
              class="h-12 bg-white text-black rounded px-3 outline-none"
              placeholder="TEST"
            />
          </div>

          <!-- Пол -->
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-300">Пол</label>
            <select
              [(ngModel)]="formData.gender"
              class="h-12 bg-white text-black rounded px-3 outline-none appearance-none"
            >
              <option value="Мужской">Мужской</option>
              <option value="Женский">Женский</option>
            </select>
          </div>

          <!-- E-mail (на всю ширину) -->
          <div class="flex flex-col gap-1 col-span-2">
            <label class="text-sm text-gray-300">E-mail</label>
            <input
              type="email"
              [(ngModel)]="formData.email"
              class="h-12 bg-white text-black rounded px-3 outline-none"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="grid grid-cols-5 gap-2">
          <button
            class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors"
            (click)="onAccrue.emit(formData)"
          >
            Начислить
          </button>
          <button
            class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors"
            (click)="onDeduct.emit(formData)"
          >
            Списать
          </button>
          <button
            class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors"
            (click)="onUnlinkCard.emit(formData)"
          >
            Отвязать карту
          </button>
          <button
            class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors"
            (click)="onCancel.emit()"
          >
            Отмена
          </button>
          <button
            class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors"
            (click)="onSave.emit(formData)"
          >
            Изменить данные
          </button>
        </div>
      </div>
    </pos-dialog>
  `,
})
export class RegistrationDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAccrue = new EventEmitter<any>();
  @Output() onDeduct = new EventEmitter<any>();
  @Output() onUnlinkCard = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  formData = {
    phone: '79001234567',
    cardNumber: '111',
    name: 'Тест',
    birthDate: '',
    group: 'TEST',
    gender: 'Мужской',
    email: '',
  };
}
