import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

/* ─────────────────────────────────────────────
   UiBadgeComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
})
export class UiBadgeComponent {
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'default';

  private readonly variantClasses: Record<string, string> = {
    default: 'bg-surface-tertiary text-text-secondary',
    primary: 'bg-blue-50 text-app-primary',
    success: 'bg-green-50 text-app-success',
    warning: 'bg-orange-50 text-app-warning',
    danger: 'bg-red-50 text-app-danger',
    info: 'bg-blue-50 text-blue-600',
  };

  get badgeClasses(): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
    const variant = this.variantClasses[this.variant] || this.variantClasses['default'];
    return `${base} ${variant}`;
  }
}

/* ─────────────────────────────────────────────
   UiStatusDotComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-status-dot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5">
      <span
        class="w-2 h-2 rounded-full shrink-0"
        [ngClass]="dotClasses"
      ></span>
      <span *ngIf="label" class="text-sm text-text-primary">{{ label }}</span>
    </span>
  `,
})
export class UiStatusDotComponent {
  @Input() color: 'green' | 'red' | 'yellow' | 'gray' | 'blue' = 'gray';
  @Input() label?: string;
  @Input() pulse = false;

  private readonly colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
  };

  get dotClasses(): string {
    const colorCls = this.colorClasses[this.color] || this.colorClasses['gray'];
    const pulseCls = this.pulse ? 'animate-pulse' : '';
    return `${colorCls} ${pulseCls}`.trim();
  }
}

/* ─────────────────────────────────────────────
   UiAlertComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div
      *ngIf="visible"
      class="flex gap-3 rounded border p-3"
      [ngClass]="alertClasses"
    >
      <lucide-icon [name]="iconName" [size]="18" class="shrink-0 mt-0.5"></lucide-icon>
      <div class="flex-1 min-w-0">
        <p *ngIf="title" class="text-sm font-medium mb-0.5">{{ title }}</p>
        <div class="text-sm"><ng-content></ng-content></div>
      </div>
      <button
        *ngIf="dismissible"
        type="button"
        class="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
        (click)="onDismiss()"
      >
        <lucide-icon name="x" [size]="16"></lucide-icon>
      </button>
    </div>
  `,
})
export class UiAlertComponent {
  @Input() variant: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() title?: string;
  @Input() dismissible = false;
  @Output() dismissed = new EventEmitter<void>();

  visible = true;

  private readonly alertStyles: Record<string, string> = {
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-orange-200 bg-orange-50 text-orange-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  };

  private readonly alertIcons: Record<string, string> = {
    info: 'info',
    success: 'check-circle-2',
    warning: 'alert-triangle',
    error: 'alert-circle',
  };

  get alertClasses(): string {
    return this.alertStyles[this.variant] || this.alertStyles['info'];
  }

  get iconName(): string {
    return this.alertIcons[this.variant] || 'info';
  }

  onDismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}

/* ─────────────────────────────────────────────
   UiEmptyStateComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-12">
      <div *ngIf="iconName" class="mb-3 text-text-disabled">
        <lucide-icon [name]="iconName" [size]="48"></lucide-icon>
      </div>
      <h3 class="text-base font-medium text-text-primary mb-1">{{ title }}</h3>
      <p *ngIf="description" class="text-sm text-text-secondary max-w-xs mb-4">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class UiEmptyStateComponent {
  @Input() title = '';
  @Input() description?: string;
  @Input() iconName?: string;
}

/* ─────────────────────────────────────────────
   UiBreadcrumbsComponent
   ───────────────────────────────────────────── */
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

@Component({
  selector: 'ui-breadcrumbs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex items-center gap-1 text-sm" aria-label="Breadcrumbs">
      <ng-container *ngFor="let item of items; let last = last">
        <button
          *ngIf="item.onClick && !last; else plainText"
          type="button"
          class="text-app-primary hover:underline focus:outline-none"
          (click)="item.onClick!()"
        >
          {{ item.label }}
        </button>
        <ng-template #plainText>
          <span class="text-text-secondary">{{ item.label }}</span>
        </ng-template>
        <span *ngIf="!last" class="text-text-disabled mx-0.5">/</span>
      </ng-container>
    </nav>
  `,
})
export class UiBreadcrumbsComponent {
  @Input() items: BreadcrumbItem[] = [];
}

/* ─────────────────────────────────────────────
   UiDividerComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-divider',
  standalone: true,
  template: `<hr class="border-t border-border my-4" />`,
})
export class UiDividerComponent {}

/* ─────────────────────────────────────────────
   UiSkeletonComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="animate-pulse bg-surface-tertiary rounded" [ngClass]="className">&nbsp;</div>`,
})
export class UiSkeletonComponent {
  @Input() className = 'h-4 w-full';
}
