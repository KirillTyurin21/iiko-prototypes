import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { UiBadgeComponent } from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';

@Component({
  selector: 'app-plugin-status-bar',
  standalone: true,
  imports: [CommonModule, IconsModule, UiBadgeComponent],
  template: `
    <div
      class="flex items-center gap-3 px-4 py-3 rounded-lg border mb-4"
      [class.bg-green-50]="state.isPluginConfigured()"
      [class.border-green-200]="state.isPluginConfigured()"
      [class.bg-red-50]="!state.isPluginConfigured()"
      [class.border-red-200]="!state.isPluginConfigured()"
    >
      <div
        class="w-3 h-3 rounded-full"
        [class.bg-green-500]="state.isPluginConfigured()"
        [class.bg-red-500]="!state.isPluginConfigured()"
      ></div>
      <span class="text-sm font-medium" *ngIf="state.isPluginConfigured()">
        Плагин настроен
        <span class="text-text-secondary font-normal ml-1" *ngIf="state.getActiveCredentials() as cred">
          (terminal: {{ cred.terminalId | slice:0:15 }}...)
        </span>
      </span>
      <span class="text-sm font-medium text-red-700" *ngIf="!state.isPluginConfigured()">
        Плагин не настроен — откройте Дополнения → Настройка WB Pay
      </span>
      <ui-badge
        *ngIf="state.isPluginConfigured()"
        variant="success"
        class="ml-auto"
      >Active</ui-badge>
    </div>
  `,
})
export class PluginStatusBarComponent {
  state = inject(WbPayStateService);
}
