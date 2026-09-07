import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { OrderSourceSetting, OrderSourceRef } from '../../types';

/**
 * Таблица настроек источников: приоритетные настройки поверх общей.
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
                class="sst-delete"
                (click)="delete.emit(s.id)"
                [attr.aria-label]="'Удалить настройку: ' + sourceName(s.sourceId)"
                title="Удалить"
              >
                <lucide-icon name="trash-2" [size]="14"></lucide-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="sst-empty" *ngIf="sourceSettings.length === 0">
        <lucide-icon name="list" [size]="16"></lucide-icon>
        <span>Нет настроек источников — действует общая настройка</span>
      </div>
    </div>
  `,
  styles: [
    `
      .sst { border: 1px solid #d6d6d6; border-radius: 4px; overflow: hidden; }
      .sst-table { width: 100%; border-collapse: collapse; }
      .sst-table th {
        padding: 10px 12px;
        text-align: left;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: var(--dt-text-secondary);
        background: var(--dt-table-head);
      }
      .sst-table td {
        padding: 10px 12px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13.5px;
        color: var(--dt-text-primary);
      }
      .sst-table tbody tr:last-child td { border-bottom: none; }
      .sst-name { font-weight: 500; }
      .sst-actions { text-align: right; white-space: nowrap; }
      .sst-delete {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border: none;
        border-radius: 4px;
        background: none;
        color: var(--dt-text-disable);
        cursor: pointer;
      }
      .sst-delete:hover { background: var(--dt-brand-negative-lighter); color: var(--dt-brand-negative); }

      .sst-empty {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 18px 14px;
        font-size: 13px;
        color: var(--dt-text-disable);
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
