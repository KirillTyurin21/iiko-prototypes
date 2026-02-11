import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTableComponent, TableCellDefDirective } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { MOCK_THEMES_ARRIVALS } from '../data/mock-data';
import { ScreenTheme } from '../types';

@Component({
  selector: 'app-themes-arrivals-screen',
  standalone: true,
  imports: [CommonModule, UiTableComponent, TableCellDefDirective, IconsModule],
  template: `
    <div class="themes-screen">
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Темы — Табло прибытия</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-primary" (click)="onAdd()">
              <lucide-icon name="plus" [size]="18"></lucide-icon>
              <span>Добавить тему</span>
            </button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="themes"
          (rowClick)="onRowClick($event)"
        >
          <ng-template tableCellDef="isDefault" let-item>
            <span *ngIf="item.isDefault" class="badge default-badge">По умолчанию</span>
          </ng-template>
        </ui-table>
      </div>
    </div>
  `,
  styles: [`
    .themes-screen { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { margin-bottom: 20px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 24px; font-weight: 500; color: #212121; margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .app-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0 16px; height: 36px; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.2s; }
    .app-btn-primary { background-color: #448aff; color: #fff; }
    .app-btn-primary:hover { background-color: #2979ff; }
    .table-container { border-radius: 4px; overflow: hidden; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .default-badge { background: #e8f5e9; color: #388e3c; }
  `],
})
export class ThemesArrivalsScreenComponent {
  themes: ScreenTheme[] = [...MOCK_THEMES_ARRIVALS];

  columns: TableColumn[] = [
    { key: 'name', header: 'Название', width: '250px', sortable: true },
    { key: 'isDefault', header: 'По умолчанию', width: '150px' },
    { key: 'createdAt', header: 'Дата создания', width: '160px', sortable: true },
    { key: 'modifiedAt', header: 'Изменена', width: '160px', sortable: true },
  ];

  onRowClick(item: ScreenTheme): void {
    console.log('Theme clicked:', item);
  }

  onAdd(): void {
    console.log('Add arrival theme');
  }
}
