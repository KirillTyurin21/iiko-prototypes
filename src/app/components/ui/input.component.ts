import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

/* ─────────────────────────────────────────────
   UiInputComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div [ngClass]="{'w-full': fullWidth}">
      <label *ngIf="label" class="block text-xs font-medium text-text-secondary mb-1">
        {{ label }}
      </label>
      <div class="relative">
        <div *ngIf="iconName" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <lucide-icon [name]="iconName" [size]="16"></lucide-icon>
        </div>
        <input
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          [ngClass]="inputClasses"
        />
      </div>
      <p *ngIf="error" class="mt-1 text-xs text-app-danger">{{ error }}</p>
      <p *ngIf="hint && !error" class="mt-1 text-xs text-text-secondary">{{ hint }}</p>
    </div>
  `,
})
export class UiInputComponent {
  @Input() label = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() value = '';
  @Input() iconName?: string;
  @Output() valueChange = new EventEmitter<string>();

  get inputClasses(): string {
    const base =
      'w-full h-9 rounded border bg-surface text-sm text-text-primary outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    const pad = this.iconName ? 'pl-8 pr-3' : 'px-3';
    const state = this.error
      ? 'border-app-danger focus:ring-2 focus:ring-app-danger/20'
      : 'border-border hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20';
    return `${base} ${pad} ${state}`;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}

/* ─────────────────────────────────────────────
   UiTextareaComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [ngClass]="{'w-full': fullWidth}">
      <label *ngIf="label" class="block text-xs font-medium text-text-secondary mb-1">
        {{ label }}
      </label>
      <textarea
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        [attr.rows]="rows"
        (input)="onInput($event)"
        [ngClass]="textareaClasses"
      ></textarea>
      <p *ngIf="error" class="mt-1 text-xs text-app-danger">{{ error }}</p>
      <p *ngIf="hint && !error" class="mt-1 text-xs text-text-secondary">{{ hint }}</p>
    </div>
  `,
})
export class UiTextareaComponent {
  @Input() label = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() value = '';
  @Input() rows = 4;
  @Output() valueChange = new EventEmitter<string>();

  get textareaClasses(): string {
    const base =
      'w-full min-h-[80px] rounded border bg-surface text-sm text-text-primary px-3 py-2 outline-none transition-colors duration-150 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed';
    const state = this.error
      ? 'border-app-danger focus:ring-2 focus:ring-app-danger/20'
      : 'border-border hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20';
    return `${base} ${state}`;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}

/* ─────────────────────────────────────────────
   UiSelectComponent
   ───────────────────────────────────────────── */
export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [ngClass]="{'w-full': fullWidth}">
      <label *ngIf="label" class="block text-xs font-medium text-text-secondary mb-1">
        {{ label }}
      </label>
      <select
        [disabled]="disabled"
        [value]="value"
        (change)="onChange($event)"
        [ngClass]="selectClasses"
      >
        <option *ngIf="placeholder" value="" disabled>{{ placeholder }}</option>
        <option *ngFor="let opt of options" [value]="opt.value">{{ opt.label }}</option>
      </select>
      <p *ngIf="error" class="mt-1 text-xs text-app-danger">{{ error }}</p>
    </div>
  `,
})
export class UiSelectComponent {
  @Input() label = '';
  @Input() error = '';
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() fullWidth = true;
  @Input() value = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  get selectClasses(): string {
    const base =
      'w-full h-9 rounded border bg-surface text-sm text-text-primary px-3 outline-none transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none';
    const state = this.error
      ? 'border-app-danger focus:ring-2 focus:ring-app-danger/20'
      : 'border-border hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20';
    return `${base} ${state}`;
  }

  onChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }
}

/* ─────────────────────────────────────────────
   UiCheckboxComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      class="inline-flex items-center gap-2 cursor-pointer select-none"
      [ngClass]="{'opacity-50 cursor-not-allowed': disabled}"
    >
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggle()"
        class="w-4 h-4 rounded border-border text-app-primary focus:ring-2 focus:ring-app-primary/30 cursor-pointer disabled:cursor-not-allowed"
      />
      <span *ngIf="label" class="text-sm text-text-primary">{{ label }}</span>
    </label>
  `,
})
export class UiCheckboxComponent {
  @Input() label = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}

/* ─────────────────────────────────────────────
   UiToggleComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      class="inline-flex items-center gap-2.5 cursor-pointer select-none"
      [ngClass]="{'opacity-50 cursor-not-allowed': disabled}"
    >
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked"
        [disabled]="disabled"
        (click)="onToggle()"
        class="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-app-primary/30"
        [ngClass]="checked ? 'bg-app-primary' : 'bg-gray-300'"
      >
        <span
          class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ml-0.5"
          [ngClass]="checked ? 'translate-x-4' : 'translate-x-0'"
        ></span>
      </button>
      <span *ngIf="label" class="text-sm text-text-primary">{{ label }}</span>
    </label>
  `,
})
export class UiToggleComponent {
  @Input() label = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
