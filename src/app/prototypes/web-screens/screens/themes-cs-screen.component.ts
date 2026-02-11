import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UiTableComponent,
  TableCellDefDirective,
  UiConfirmDialogComponent,
  UiInputComponent,
} from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import { CSTheme } from '../cs-types';

@Component({
  selector: 'app-themes-cs-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiTableComponent,
    TableCellDefDirective,
    UiConfirmDialogComponent,
    UiInputComponent,
    IconsModule,
  ],
  template: `
    <div class="themes-screen">
      <!-- ─── Toast ─── -->
      <div
        *ngIf="toastMessage"
        class="toast"
      >
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- ─── Header ─── -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Темы</h1>
          <div class="header-actions">
            <button
              class="app-btn app-btn-icon"
              [disabled]="!selectedTheme"
              title="Редактировать"
              (click)="editSelected()"
            >
              <lucide-icon name="pencil" [size]="16"></lucide-icon>
            </button>
            <button
              class="app-btn app-btn-icon"
              [disabled]="!selectedTheme"
              title="Дублировать"
              (click)="duplicateSelected()"
            >
              <lucide-icon name="copy" [size]="16"></lucide-icon>
            </button>
            <button
              class="app-btn app-btn-icon app-btn-danger-icon"
              [disabled]="!selectedTheme"
              title="Удалить"
              (click)="confirmDelete()"
            >
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-primary" (click)="createTheme()">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              <span>Добавить</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Toolbar: Search ─── -->
      <div class="toolbar">
        <div class="search-box">
          <ui-input
            placeholder="Поиск по названию..."
            iconName="search"
            [(value)]="searchQuery"
            (valueChange)="applyFilters()"
          ></ui-input>
        </div>
      </div>

      <!-- ─── Table ─── -->
      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="filteredThemes"
          [rowKeyFn]="rowKeyFn"
          [selectedKey]="selectedTheme?.id"
          [sortColumn]="sortColumn"
          [sortDirection]="sortDirection"
          [compact]="true"
          emptyMessage="Темы не найдены"
          (rowClick)="onRowClick($event)"
          (sort)="onSort($event)"
        >
          <ng-template tableCellDef="name" let-item>
            <span class="cell-name" (dblclick)="onDoubleClick(item)">{{ item.name }}</span>
          </ng-template>
          <ng-template tableCellDef="description" let-item>
            <span class="cell-description">{{ item.description || '—' }}</span>
          </ng-template>
          <ng-template tableCellDef="updatedAt" let-item>
            <span class="cell-date">{{ item.updatedAt }}</span>
          </ng-template>
          <ng-template tableCellDef="elementsCount" let-item>
            <span class="cell-count">{{ item.elementsCount }}</span>
          </ng-template>
        </ui-table>
      </div>

      <!-- ─── Delete Confirm ─── -->
      <ui-confirm-dialog
        [open]="deleteDialogOpen"
        title="Удаление темы"
        [message]="'Удалить тему «' + (selectedTheme?.name || '') + '»? Это действие нельзя отменить.'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteSelected()"
        (cancelled)="deleteDialogOpen = false"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [`
    /* ─── General ─── */
    :host { display: block; font-family: Roboto, sans-serif; }
    .themes-screen { animation: fadeIn 0.2s ease-out; position: relative; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* ─── Toast ─── */
    .toast {
      position: fixed; top: 20px; right: 20px; z-index: 200;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 6px;
      background: #323232; color: #fff; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

    /* ─── Page header ─── */
    .page-header { margin-bottom: 16px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 20px; font-weight: 500; color: #212121; margin: 0; }
    .header-actions { display: flex; gap: 6px; align-items: center; }

    /* ─── Buttons ─── */
    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 14px; height: 34px; border: none; border-radius: 4px;
      font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-icon {
      width: 34px; height: 34px; padding: 0; justify-content: center;
      background: transparent; color: #616161; border: 1px solid #e0e0e0; border-radius: 4px;
    }
    .app-btn-icon:hover { background: #f5f5f5; color: #212121; }
    .app-btn-danger-icon {
      width: 34px; height: 34px; padding: 0; justify-content: center;
      background: transparent; color: #e53935; border: 1px solid #e0e0e0; border-radius: 4px;
    }
    .app-btn-danger-icon:hover { background: #ffebee; }

    /* ─── Toolbar ─── */
    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
    .search-box { width: 280px; }

    /* ─── Table ─── */
    .table-container { border-radius: 4px; overflow: hidden; }
    .cell-name { cursor: pointer; font-weight: 500; color: #212121; }
    .cell-description { color: #757575; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; display: inline-block; }
    .cell-date { color: #757575; font-size: 13px; }
    .cell-count { color: #757575; }
  `],
})
export class ThemesCsScreenComponent implements OnInit {
  private dataService = inject(CsDataService);
  private router = inject(Router);

  // ─── State ─────────────────────────────────
  themes: CSTheme[] = [];
  filteredThemes: CSTheme[] = [];
  selectedTheme: CSTheme | null = null;
  searchQuery = '';
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Dialogs
  deleteDialogOpen = false;

  // Toast
  toastMessage = '';
  private toastTimer: any;

  // Table config
  columns: TableColumn[] = [
    { key: 'name', header: 'Название', sortable: true },
    { key: 'description', header: 'Описание' },
    { key: 'updatedAt', header: 'Дата изменения', width: '180px', sortable: true },
    { key: 'elementsCount', header: 'Кол-во элементов', width: '160px', sortable: true, align: 'center' },
  ];

  rowKeyFn = (item: CSTheme) => item.id;

  // ─── Lifecycle ─────────────────────────────

  ngOnInit(): void {
    this.loadThemes();
  }

  // ─── Data ──────────────────────────────────

  private loadThemes(): void {
    this.themes = this.dataService.themes;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.themes];

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      const key = this.sortColumn as keyof CSTheme;
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    this.filteredThemes = result;
  }

  // ─── Sort ──────────────────────────────────

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.applyFilters();
  }

  // ─── Row interactions ──────────────────────

  onRowClick(item: CSTheme): void {
    this.selectedTheme = this.selectedTheme?.id === item.id ? null : item;
  }

  onDoubleClick(item: CSTheme): void {
    this.selectedTheme = item;
    this.navigateToEditor(item.id);
  }

  // ─── Create ────────────────────────────────

  createTheme(): void {
    const now = new Date().toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const newTheme = this.dataService.addTheme({
      name: 'Новая тема',
      description: '',
      updatedAt: now,
      elementsCount: 0,
      elements: [],
    });
    this.loadThemes();
    this.showToast(`Тема «${newTheme.name}» создана`);
    this.navigateToEditor(newTheme.id);
  }

  // ─── Edit ──────────────────────────────────

  editSelected(): void {
    if (!this.selectedTheme) return;
    this.navigateToEditor(this.selectedTheme.id);
  }

  // ─── Duplicate ─────────────────────────────

  duplicateSelected(): void {
    if (!this.selectedTheme) return;
    const copy = this.dataService.duplicateTheme(this.selectedTheme.id);
    if (copy) {
      this.loadThemes();
      this.selectedTheme = copy;
      this.showToast(`Тема «${copy.name}» создана`);
    }
  }

  // ─── Delete ────────────────────────────────

  confirmDelete(): void {
    if (!this.selectedTheme) return;
    this.deleteDialogOpen = true;
  }

  deleteSelected(): void {
    if (!this.selectedTheme) return;
    const name = this.selectedTheme.name;
    this.dataService.deleteTheme(this.selectedTheme.id);
    this.selectedTheme = null;
    this.deleteDialogOpen = false;
    this.loadThemes();
    this.showToast(`Тема «${name}» удалена`);
  }

  // ─── Navigation ────────────────────────────

  private navigateToEditor(themeId: number): void {
    this.router.navigate(['/prototype/web-screens/theme-editor', themeId]);
  }

  // ─── Toast ─────────────────────────────────

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
