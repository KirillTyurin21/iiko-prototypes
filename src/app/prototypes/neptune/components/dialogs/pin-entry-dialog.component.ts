import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'neptune-pin-entry-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="md" (dialogClose)="dialogClose.emit()">
      <!-- State switcher -->
      <div class="absolute top-2 right-2 flex gap-1 z-10">
        <button
          class="w-6 h-6 text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'input'; pin = ''"
        >L</button>
        <button
          class="w-6 h-6 text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'entered'"
        >D</button>
        <button
          class="w-6 h-6 text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
          (click)="state = 'error'"
        >E</button>
        <button
          class="w-6 h-6 text-[10px] font-bold bg-gray-700 text-gray-300 hover:bg-gray-600"
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
        class="bg-red-500/20 border border-red-500 p-3 mb-4 text-center text-sm text-red-400"
      >
        Неверный PIN-код. Попробуйте ещё раз.
      </div>

      <!-- PIN input (visual only) -->
      <div class="w-full h-14 text-2xl text-center tracking-[0.5em] bg-[#2d2d2d] text-white px-4 flex items-center justify-center font-mono">
        {{ maskedPin || '----' }}
      </div>

      <!-- Numpad -->
      <div class="grid grid-cols-3 gap-px bg-[#555] mt-px">
        <button
          *ngFor="let key of numpadKeys"
          (click)="onNumpadClick(key)"
          [disabled]="state === 'checking'"
          class="h-16 text-xl font-semibold transition-colors"
          [ngClass]="{
            'bg-[#f0f0f0] text-black hover:bg-[#e0e0e0]': key !== '←' && key !== '✕' && state !== 'checking',
            'bg-[#d0d0d0] text-gray-700 hover:bg-[#c0c0c0]': (key === '←' || key === '✕') && state !== 'checking',
            'opacity-50 cursor-not-allowed bg-[#f0f0f0] text-black': state === 'checking'
          }"
        >{{ key }}</button>
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-px bg-[#555] mt-6">
        <button
          class="h-14 bg-[#2a2a2a] text-white hover:bg-[#333] font-semibold"
          (click)="dialogClose.emit()"
        >Отмена</button>
        <button
          class="h-14 font-bold"
          [disabled]="state === 'checking' || state === 'input'"
          [ngClass]="{
            'bg-[#b8c959]/50 text-black cursor-not-allowed': state === 'checking',
            'bg-[#b8c959]/30 text-black/50 cursor-not-allowed opacity-50': state === 'input',
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
    </neptune-pos-dialog>
  `,
})
export class NeptunePinEntryDialogComponent {
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
