import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { MgsPosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'mgs-pin-entry-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, MgsPosDialogComponent],
  template: `
    <mgs-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
      <!-- State switcher -->
      <div class="absolute top-2 right-2 flex gap-1 z-10">
        <button
          class="w-6 h-6 rounded text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'input'; pin = ''"
        >L</button>
        <button
          class="w-6 h-6 rounded text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'entered'"
        >D</button>
        <button
          class="w-6 h-6 rounded text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'error'"
        >E</button>
        <button
          class="w-6 h-6 rounded text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'checking'"
        >C</button>
      </div>

      <!-- Header -->
      <h2 class="text-2xl text-[#b8c959] text-center">Авторизация гостя</h2>
      <p class="text-base text-gray-300 text-center mb-6">Введите PIN-код для подтверждения операции</p>

      <!-- Guest name -->
      <div class="text-center text-white font-semibold mb-4">{{ guestName }}</div>

      <!-- Error banner -->
      <div
        *ngIf="state === 'error'"
        class="bg-red-500/20 border border-red-500 rounded p-3 mb-4 text-center text-sm text-red-400"
      >
        Неверный PIN-код. Попробуйте ещё раз.
      </div>

      <!-- PIN input (visual only) -->
      <div class="w-full h-14 text-2xl text-center tracking-[0.5em] bg-[#b8c959]/20 border border-[#b8c959] text-white rounded px-4 flex items-center justify-center font-mono">
        {{ maskedPin || '----' }}
      </div>

      <!-- Numpad -->
      <div class="grid grid-cols-3 gap-2 mt-4">
        <button
          *ngFor="let key of numpadKeys"
          (click)="onNumpadClick(key)"
          [disabled]="state === 'checking'"
          class="h-16 rounded text-xl font-semibold transition-colors"
          [ngClass]="{
            'bg-[#1a1a1a] text-white hover:bg-[#252525]': key !== '←' && key !== '✕' && state !== 'checking',
            'bg-[#2d2d2d] text-gray-300 hover:bg-[#353535]': (key === '←' || key === '✕') && state !== 'checking',
            'opacity-50 cursor-not-allowed': state === 'checking'
          }"
        >{{ key }}</button>
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-3 mt-6">
        <button
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-semibold"
          (click)="dialogClose.emit()"
        >Отмена</button>
        <button
          class="h-14 rounded font-bold"
          [disabled]="state === 'checking' || state === 'input'"
          [ngClass]="{
            'bg-[#b8c959]/50 text-black cursor-not-allowed': state === 'checking',
            'bg-[#b8c959]/50 text-black/50 cursor-not-allowed opacity-50': state === 'input',
            'bg-[#b8c959] text-black hover:bg-[#c5d466]': state !== 'checking' && state !== 'input'
          }"
          (click)="onConfirm()"
        >
          <span *ngIf="state === 'checking'" class="flex items-center justify-center gap-2">
            <lucide-icon name="loader-2" [size]="18" class="animate-spin"></lucide-icon>
            Проверка...
          </span>
          <span *ngIf="state !== 'checking'">Подтвердить</span>
        </button>
      </div>
    </mgs-pos-dialog>
  `,
})
export class MgsPinEntryDialogComponent {
  @Input() open = false;
  @Input() guestName = '';

  @Output() dialogClose = new EventEmitter<void>();
  @Output() pinConfirmed = new EventEmitter<string>();

  pin = '';
  state: 'input' | 'entered' | 'checking' | 'error' = 'input';

  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✕'];

  get maskedPin(): string {
    return '●'.repeat(this.pin.length);
  }

  onNumpadClick(key: string): void {
    if (this.state === 'checking') return;
    if (key === '←') {
      this.pin = this.pin.slice(0, -1);
    } else if (key === '✕') {
      this.pin = '';
    } else if (this.pin.length < 8) {
      this.pin += key;
    }
    this.state = this.pin.length > 0 ? 'entered' : 'input';
  }

  onConfirm(): void {
    if (!this.pin || this.state === 'checking') return;
    this.pinConfirmed.emit(this.pin);
  }
}
