import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTableComponent, TableCellDefDirective } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { MOCK_DISPLAYS } from '../data/mock-data';
import { CustomerScreenDisplay } from '../types';

@Component({
  selector: 'app-displays-screen',
  standalone: true,
  imports: [CommonModule, UiTableComponent, TableCellDefDirective, IconsModule],
  template: `
    <div class="displays-screen">
      <!-- Page title bar (Web style) -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Дисплеи</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-primary" (click)="onAdd()">
              <lucide-icon name="plus" [size]="18"></lucide-icon>
              <span>Добавить</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="displays"
          (rowClick)="onRowClick($event)"
        >
          <!-- Status cell -->
          <ng-template tableCellDef="status" let-item>
            <div class="status-cell">
              <span
                class="status-dot"
                [class.active]="item.status === 'active'"
                [class.inactive]="item.status === 'inactive'"
              ></span>
              <span>{{ item.status === 'active' ? 'Активен' : 'Неактивен' }}</span>
            </div>
          </ng-template>

          <!-- Orientation cell -->
          <ng-template tableCellDef="orientation" let-item>
            <span>{{ item.orientation === 'landscape' ? 'Горизонтальная' : 'Вертикальная' }}</span>
          </ng-template>
        </ui-table>
      </div>
    </div>
  `,
  styles: [`
    .displays-screen {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .page-header {
      margin-bottom: 20px;
    }
    .page-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title {
      font-size: 24px;
      font-weight: 500;
      color: #212121;
      line-height: 1.2;
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 8px;
    }
    .app-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 36px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      font-family: Roboto, sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .app-btn-primary {
      background-color: #448aff;
      color: #fff;
    }
    .app-btn-primary:hover {
      background-color: #2979ff;
    }
    .table-container {
      border-radius: 4px;
      overflow: hidden;
    }
    .status-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .status-dot.active {
      background-color: #4caf50;
    }
    .status-dot.inactive {
      background-color: #bdbdbd;
    }
  `],
})
export class DisplaysScreenComponent {
  displays: CustomerScreenDisplay[] = [...MOCK_DISPLAYS];

  columns: TableColumn[] = [
    { key: 'name', header: 'Название', width: '200px', sortable: true },
    { key: 'description', header: 'Описание', width: '250px' },
    { key: 'resolution', header: 'Разрешение', width: '120px' },
    { key: 'orientation', header: 'Ориентация', width: '140px' },
    { key: 'status', header: 'Статус', width: '130px', sortable: true },
    { key: 'theme', header: 'Тема', width: '160px' },
    { key: 'terminal', header: 'Терминал', width: '160px' },
  ];

  onRowClick(item: CustomerScreenDisplay): void {
    // Будет реализовано позже — переход к деталям дисплея
    console.log('Display clicked:', item);
  }

  onAdd(): void {
    // Будет реализовано позже — добавление нового дисплея
    console.log('Add display');
  }
}
