import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-mode-switcher',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex items-center gap-1 bg-surface-secondary border-b border-border px-4 py-2">
      <button
        (click)="modeChange.emit('main')"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        [class.bg-white]="activeMode === 'main'"
        [class.shadow-sm]="activeMode === 'main'"
        [class.text-app-primary]="activeMode === 'main'"
        [class.text-text-secondary]="activeMode !== 'main'"
        [class.hover:text-text-primary]="activeMode !== 'main'"
      >
        <lucide-icon name="layout-dashboard" [size]="16"></lucide-icon>
        Обзор
      </button>
      <button
        (click)="modeChange.emit('plugin')"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        [class.bg-white]="activeMode === 'plugin'"
        [class.shadow-sm]="activeMode === 'plugin'"
        [class.text-app-primary]="activeMode === 'plugin'"
        [class.text-text-secondary]="activeMode !== 'plugin'"
        [class.hover:text-text-primary]="activeMode !== 'plugin'"
      >
        <lucide-icon name="monitor" [size]="16"></lucide-icon>
        Плагин Front
      </button>
      <button
        (click)="modeChange.emit('admin')"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        [class.bg-white]="activeMode === 'admin'"
        [class.shadow-sm]="activeMode === 'admin'"
        [class.text-app-primary]="activeMode === 'admin'"
        [class.text-text-secondary]="activeMode !== 'admin'"
        [class.hover:text-text-primary]="activeMode !== 'admin'"
      >
        <lucide-icon name="settings" [size]="16"></lucide-icon>
        Панель Web
      </button>
    </div>
  `,
})
export class ModeSwitcherComponent {
  @Input() activeMode: 'main' | 'plugin' | 'admin' = 'main';
  @Output() modeChange = new EventEmitter<'main' | 'plugin' | 'admin'>();
}
