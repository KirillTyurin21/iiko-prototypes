import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="buttonClasses"
      (click)="handleClick($event)"
    >
      <!-- Spinner -->
      <svg
        *ngIf="loading"
        class="animate-spin"
        [ngClass]="spinnerSizeClass"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>

      <!-- Icon -->
      <lucide-icon
        *ngIf="iconName && !loading"
        [name]="iconName"
        [size]="iconSize"
      ></lucide-icon>

      <!-- Content -->
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() iconName?: string;

  get iconSize(): number {
    return this.size === 'sm' ? 14 : this.size === 'lg' ? 18 : 16;
  }

  get spinnerSizeClass(): string {
    return this.size === 'sm' ? 'w-3 h-3' : this.size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  }

  private readonly variantClasses: Record<string, string> = {
    primary:
      'bg-app-primary text-white hover:bg-app-primary-dark active:bg-blue-800 focus:ring-2 focus:ring-app-primary/40',
    secondary:
      'bg-surface-secondary text-text-primary hover:bg-surface-tertiary active:bg-gray-300 border border-border focus:ring-2 focus:ring-gray-300',
    outline:
      'bg-transparent text-app-primary border border-app-primary hover:bg-app-primary/5 active:bg-app-primary/10 focus:ring-2 focus:ring-app-primary/30',
    danger:
      'bg-app-danger text-white hover:bg-red-700 active:bg-red-800 focus:ring-2 focus:ring-app-danger/40',
    ghost:
      'bg-transparent text-text-secondary hover:bg-surface-secondary active:bg-surface-tertiary focus:ring-2 focus:ring-gray-200',
    success:
      'bg-app-success text-white hover:bg-green-700 active:bg-green-800 focus:ring-2 focus:ring-app-success/40',
  };

  private readonly sizeClasses: Record<string, string> = {
    sm: 'h-7 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2.5',
  };

  get buttonClasses(): string {
    const base =
      'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 outline-none select-none whitespace-nowrap';
    const variantCls = this.variantClasses[this.variant] || this.variantClasses['primary'];
    const sizeCls = this.sizeClasses[this.size] || this.sizeClasses['md'];
    const widthCls = this.fullWidth ? 'w-full' : '';
    const disabledCls = this.disabled || this.loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
    return `${base} ${variantCls} ${sizeCls} ${widthCls} ${disabledCls}`.trim();
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
