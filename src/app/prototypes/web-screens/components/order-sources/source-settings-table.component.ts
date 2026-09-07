import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { OrderSourceSetting, OrderSourceRef } from '../../types';

/**
 * Таблица настроек источников (стиль WFDS): приоритетные настройки поверх настройки отображения.
 */
@Component({
  selector: 'app-source-settings-table',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="sst">
      <table class="sst-table">
        <thead>
          <tr>
            <th>Источник</th>
            <th>Префикс</th>
            <th>Длина</th>
            <th>Символы заполнения</th>
            <th class="sst-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of sourceSettings">
            <td class="sst-name">{{ sourceName(s.sourceId) }}</td>
            <td>{{ s.prefix || '—' }}</td>
            <td>{{ s.length }}</td>
            <td>{{ s.fillSymbols || '—' }}</td>
            <td class="sst-actions">
              <button
                type="button"
                class="ds-icon-btn ds-icon-btn--danger"
                (click)="delete.emit(s.id)"
                [attr.aria-label]="'Удалить настройку: ' + sourceName(s.sourceId)"
                title="Удалить"
              >
                <lucide-icon name="trash-2" [size]="16"></lucide-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="sst-empty" *ngIf="sourceSettings.length === 0">
        <lucide-icon name="list" [size]="16"></lucide-icon>
        <span>Нет настроек источников — действует настройка отображения</span>
      </div>
    </div>
  `,
  styles: [
    `
      .sst { border: 1px solid #D6D6D6; border-radius: 4px; overflow: hidden; background: #FFFFFF; }
      .sst-table { width: 100%; border-collapse: collapse; }
      .sst-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #616161;
        background: #F0F5FF;
      }
      .sst-table td {
        padding: 12px 16px;
        border-top: 1px solid #E0E0E0;
        font-size: 13.5px;
        color: #333333;
      }
      .sst-table tbody tr:hover td { background: #EBEBEB; }
      .sst-name { font-weight: 500; }
      .sst-actions { text-align: right; white-space: nowrap; }

      .ds-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: none;
        color: #616161;
        cursor: pointer;
      }
      .ds-icon-btn:hover { background: #EBEBEB; }
      .ds-icon-btn--danger:hover { background: #FFF2F2; color: #FF5252; }

      .sst-empty {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 18px 16px;
        font-size: 13px;
        color: #9E9E9E;
        border-top: 1px solid #E0E0E0;
      }
    `,
  ],
})
export class SourceSettingsTableComponent {
  @Input() sourceSettings: OrderSourceSetting[] = [];
  @Input() sources: OrderSourceRef[] = [];

  @Output() delete = new EventEmitter<string>();

  sourceName(sourceId: string): string {
    return this.sources.find(s => s.id === sourceId)?.name ?? 'Неизвестный источник';
  }
}
