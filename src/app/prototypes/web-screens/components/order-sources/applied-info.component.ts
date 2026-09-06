import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { CommonOrderSourceSetting, OrderSourceRef } from '../../types';

/**
 * Readonly-блок «Применяется» для терминалов и дисплеев:
 * показывает, какая настройка действует, с превью номера заказа.
 */
@Component({
  selector: 'app-applied-info',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="api">
      <div class="api-title">
        <lucide-icon name="info" [size]="14"></lucide-icon>
        <span>Применяется к узлу</span>
      </div>

      <div class="api-row">
        <span class="api-label">Настройка</span>
        <span class="api-value">
          {{ restaurantName }}: общая настройка (длина {{ setting.length }}{{ setting.prefix ? ', префикс «' + setting.prefix + '»' : '' }})
        </span>
      </div>

      <div class="api-row">
        <span class="api-label">Превью номера</span>
        <span class="api-preview">{{ preview(setting) }}</span>
      </div>

      <ng-container *ngIf="kioskSetting">
        <div class="api-row">
          <span class="api-label">Источник «{{ sourceName(kioskSetting.sourceId) }}»</span>
          <span class="api-preview">{{ preview(kioskSetting) }}</span>
        </div>
        <div class="api-hint">
          <lucide-icon name="info" [size]="13"></lucide-icon>
          <span>Настройка источника перекрывает общую настройку.</span>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .api {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-variant);
      }
      .api-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--dt-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .api-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        font-size: 13.5px;
      }
      .api-label { color: var(--dt-text-secondary); flex-shrink: 0; }
      .api-value { color: var(--dt-text-primary); text-align: right; }
      .api-preview {
        font-weight: 500;
        font-size: 15px;
        letter-spacing: 1px;
        color: var(--dt-text-primary);
      }
      .api-hint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--dt-text-secondary);
      }
    `,
  ],
})
export class AppliedInfoComponent {
  @Input() restaurantName = '';
  @Input() setting!: CommonOrderSourceSetting;
  @Input() sources: OrderSourceRef[] = [];

  get kioskSetting() {
    return this.setting.sourceSettings.find(s => s.sourceId === 'kiosk') ?? null;
  }

  sourceName(sourceId: string): string {
    return this.sources.find(s => s.id === sourceId)?.name ?? 'Неизвестный источник';
  }

  preview(s: CommonOrderSourceSetting | { prefix: string; length: number; fillSymbols: string }): string {
    let digits = '12345';
    if (s.length > 0) {
      digits = digits.slice(0, s.length);
      const fill = s.fillSymbols || '0';
      while (digits.length < s.length) {
        digits = fill + digits;
      }
    }
    return (s.prefix || '') + digits;
  }
}
