import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTableComponent, TableCellDefDirective } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { MOCK_TERMINALS } from '../data/mock-data';
import { ArrivalTerminal } from '../types';

@Component({
  selector: 'app-terminals-screen',
  standalone: true,
  imports: [CommonModule, UiTableComponent, TableCellDefDirective, IconsModule],
  template: `
    <div class="terminals-screen">
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Терминалы</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-primary" (click)="onAdd()">
              <lucide-icon name="plus" [size]="18"></lucide-icon>
              <span>Добавить терминал</span>
            </button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="terminals"
          (rowClick)="onRowClick($event)"
        >
          <ng-template tableCellDef="status" let-item>
            <div class="status-cell">
              <span
                class="status-dot"
                [class.online]="item.status === 'online'"
                [class.offline]="item.status === 'offline'"
              ></span>
              <span>{{ item.status === 'online' ? 'Онлайн' : 'Офлайн' }}</span>
            </div>
          </ng-template>

          <ng-template tableCellDef="lastSync" let-item>
            <span>{{ formatDate(item.lastSync) }}</span>
          </ng-template>
        </ui-table>
      </div>
    </div>
  `,
  styles: [`
    .terminals-screen { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { margin-bottom: 20px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 24px; font-weight: 500; color: #212121; margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .app-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0 16px; height: 36px; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.2s; }
    .app-btn-primary { background-color: #448aff; color: #fff; }
    .app-btn-primary:hover { background-color: #2979ff; }
    .table-container { border-radius: 4px; overflow: hidden; }
    .status-cell { display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.online { background-color: #4caf50; }
    .status-dot.offline { background-color: #f44336; }
  `],
})
export class TerminalsScreenComponent {
  terminals: ArrivalTerminal[] = [...MOCK_TERMINALS];

  columns: TableColumn[] = [
    { key: 'name', header: 'Название', width: '200px', sortable: true },
    { key: 'location', header: 'Расположение', width: '220px' },
    { key: 'status', header: 'Статус', width: '130px', sortable: true },
    { key: 'ip', header: 'IP-адрес', width: '160px' },
    { key: 'lastSync', header: 'Последняя синхр.', width: '180px', sortable: true },
  ];

  onRowClick(item: ArrivalTerminal): void {
    console.log('Terminal clicked:', item);
  }

  onAdd(): void {
    console.log('Add terminal');
  }

  formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
