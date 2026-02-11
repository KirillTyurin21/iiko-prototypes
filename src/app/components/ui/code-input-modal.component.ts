import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'ui-code-input-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl shadow-elevation-modal p-8 w-full max-w-sm mx-4 animate-fade-in">
        <!-- Icon -->
        <div class="flex justify-center mb-5">
          <div class="w-[60px] h-[60px] rounded-full bg-app-primary/10 flex items-center justify-center">
            <lucide-icon name="lock" [size]="28" class="text-app-primary"></lucide-icon>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-xl font-semibold text-center text-text-primary mb-1">{{ title }}</h2>

        <!-- Subtitle -->
        <p *ngIf="subtitle" class="text-sm text-text-secondary text-center mb-6">{{ subtitle }}</p>
        <div *ngIf="!subtitle" class="mb-6"></div>

        <!-- Input -->
        <div class="mb-4">
          <input
            #codeInput
            type="text"
            [(ngModel)]="code"
            placeholder="Код доступа"
            class="w-full px-4 py-3 text-center text-lg tracking-widest uppercase font-mono border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary focus:border-app-primary"
            (keydown.enter)="onSubmit()"
          />
        </div>

        <!-- Error -->
        <p *ngIf="error" class="text-red-500 text-sm text-center mb-4">{{ error }}</p>

        <!-- Submit button -->
        <button
          type="button"
          class="w-full py-3 bg-app-primary text-white font-medium rounded-lg hover:bg-app-primary/90 transition-colors"
          (click)="onSubmit()"
        >
          Войти
        </button>

        <!-- Back link -->
        <div class="text-center mt-4">
          <span
            class="text-sm text-text-secondary hover:text-app-primary cursor-pointer"
            (click)="onClose()"
          >
            Вернуться на главную
          </span>
        </div>
      </div>
    </div>
  `,
})
export class CodeInputModalComponent implements OnChanges {
  @Input() title = 'Введите код доступа';
  @Input() subtitle = '';
  @Input() visible = false;
  @Input() error = '';

  @Output() codeSubmitted = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('codeInput') codeInput!: ElementRef<HTMLInputElement>;

  code = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.code = '';
      setTimeout(() => this.codeInput?.nativeElement?.focus(), 50);
    }
    if (changes['visible'] && !this.visible) {
      this.code = '';
    }
  }

  onSubmit(): void {
    const trimmed = this.code.trim().toUpperCase();
    if (trimmed) {
      this.codeSubmitted.emit(trimmed);
    }
  }

  onClose(): void {
    this.code = '';
    this.closed.emit();
  }
}
