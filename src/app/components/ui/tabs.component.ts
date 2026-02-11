import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

export interface TabItem {
  key: string;
  label: string;
  iconName?: string;
  badge?: number;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex border-b border-border">
      <button
        *ngFor="let tab of tabs"
        type="button"
        class="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors outline-none whitespace-nowrap"
        [ngClass]="tab.key === activeTab
          ? 'text-app-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'"
        (click)="onTabClick(tab.key)"
      >
        <lucide-icon
          *ngIf="tab.iconName"
          [name]="tab.iconName"
          [size]="16"
        ></lucide-icon>
        {{ tab.label }}
        <span
          *ngIf="tab.badge !== undefined && tab.badge !== null"
          class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold bg-app-primary text-white leading-none"
        >
          {{ tab.badge }}
        </span>

        <!-- Active indicator -->
        <span
          *ngIf="tab.key === activeTab"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-app-primary"
        ></span>
      </button>
    </div>
  `,
})
export class UiTabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  onTabClick(key: string): void {
    this.activeTab = key;
    this.tabChange.emit(key);
  }
}
