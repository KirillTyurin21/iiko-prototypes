import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_LIST } from '../data/mock-data';
import { ArrivalsThemeListItem } from '../types';

@Component({
  selector: 'app-themes-arrivals-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, UiConfirmDialogComponent],
  template: `
    <div class="themes-screen">
      <div class="page-header">
        <h1 class="page-title">Темы</h1>
        <div class="header-actions">
          <button class="btn-header btn-outlined-orange">ИМПОРТ/ЭКСПОРТ</button>
          <button class="btn-header btn-outlined-blue">СОЗДАТЬ ПАПКУ</button>
          <button class="btn-header btn-add" (click)="onAdd()">
            <lucide-icon name="file" [size]="16"></lucide-icon>
            ДОБАВИТЬ
          </button>
        </div>
      </div>

      <div class="content-layout">
        <div class="table-area">
          <table class="themes-table">
            <thead>
              <tr>
                <th class="col-name">Название</th>
                <th class="col-resolution">Разрешение</th>
                <th class="col-created">Создано</th>
                <th class="col-actions">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items" class="theme-row" (click)="onRowClick(item)">
                <td class="col-name">
                  <div class="name-cell">
                    <lucide-icon
                      [name]="item.itemType === 'folder' ? 'folder' : 'file'"
                      [size]="20"
                      [ngClass]="item.itemType === 'folder' ? 'icon-folder' : 'icon-file'"
                    ></lucide-icon>
                    <span>{{ item.name }}</span>
                  </div>
                </td>
                <td class="col-resolution">{{ item.resolution || '' }}</td>
                <td class="col-created">{{ item.createdBy || '' }}</td>
                <td class="col-actions">
                  <div class="actions-cell">
                    <button class="icon-btn" title="Редактировать"
                      (click)="onEdit(item, $event)">
                      <lucide-icon name="pencil" [size]="18"></lucide-icon>
                    </button>
                    <button class="icon-btn" title="Удалить"
                      (click)="onDelete(item, $event)">
                      <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                    </button>
                    <button class="icon-btn" title="Копировать"
                      (click)="$event.stopPropagation()">
                      <lucide-icon name="copy" [size]="18"></lucide-icon>
                    </button>
                    <button *ngIf="item.itemType === 'theme'" class="icon-btn" title="Предпросмотр"
                      (click)="$event.stopPropagation()">
                      <lucide-icon name="eye" [size]="18"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="preview-area">
          <span class="preview-hint">Кликните на тему для предпросмотра</span>
        </div>
      </div>

      <ui-confirm-dialog
        *ngIf="deleteTarget"
        title="Удалить"
        [message]="'Удалить «' + deleteTarget.name + '»?'"
        confirmText="Удалить"
        confirmColor="red"
        (confirmed)="confirmDelete()"
        (cancelled)="deleteTarget = null"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [`
    .themes-screen { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .page-title { font-size: 24px; font-weight: 500; color: #212121; margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .btn-header {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 20px; height: 36px; border-radius: 4px;
      font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .btn-outlined-orange { background: transparent; border: 2px solid #ff6d00; color: #ff6d00; }
    .btn-outlined-orange:hover { background: #fff3e0; }
    .btn-outlined-blue { background: transparent; border: 2px solid #448aff; color: #448aff; }
    .btn-outlined-blue:hover { background: #e3f2fd; }
    .btn-add { background: transparent; border: 2px solid #616161; color: #424242; }
    .btn-add:hover { background: #f5f5f5; }

    .content-layout { display: flex; gap: 24px; }
    .table-area { flex: 1; min-width: 0; }
    .preview-area {
      width: 260px; flex-shrink: 0;
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 16px; color: #9e9e9e; font-size: 14px;
    }

    .themes-table { width: 100%; border-collapse: collapse; font-size: 14px; font-family: Roboto, sans-serif; }
    .themes-table thead { border-bottom: 2px solid #e0e0e0; }
    .themes-table th {
      text-align: left; padding: 10px 12px; font-weight: 500;
      color: #757575; font-size: 13px; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .themes-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .theme-row { cursor: pointer; transition: background 0.15s; }
    .theme-row:hover { background: #f5f5f5; }

    .name-cell { display: flex; align-items: center; gap: 10px; }
    .icon-folder { color: #ff9800; }
    .icon-file { color: #bdbdbd; }

    .col-name { width: 280px; }
    .col-resolution { width: 160px; color: #616161; }
    .col-created { width: 100px; color: #616161; }
    .col-actions { width: 160px; }

    .actions-cell { display: flex; gap: 4px; }
    .icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: none; border-radius: 4px;
      background: transparent; color: #9e9e9e; cursor: pointer; transition: all 0.15s;
    }
    .icon-btn:hover { background: #e0e0e0; color: #424242; }

    .preview-hint { text-align: center; line-height: 1.5; }
  `],
})
export class ThemesArrivalsScreenComponent {
  private router = inject(Router);
  private storage = inject(StorageService);

  items: ArrivalsThemeListItem[] = this.storage.load('web-screens', 'arrivals-list', [...MOCK_ARRIVALS_LIST]);
  deleteTarget: ArrivalsThemeListItem | null = null;

  onRowClick(item: ArrivalsThemeListItem): void {
    if (item.itemType === 'theme') {
      this.router.navigate(['/prototype/web-screens/arrivals-theme-editor', item.id]);
    }
  }

  onEdit(item: ArrivalsThemeListItem, event: Event): void {
    event.stopPropagation();
    if (item.itemType === 'theme') {
      this.router.navigate(['/prototype/web-screens/arrivals-theme-editor', item.id]);
    }
  }

  onAdd(): void {
    this.router.navigate(['/prototype/web-screens/arrivals-theme-editor', 'new']);
  }

  onDelete(item: ArrivalsThemeListItem, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = item;
  }

  confirmDelete(): void {
    if (this.deleteTarget) {
      this.items = this.items.filter(i => i.id !== this.deleteTarget!.id);
      this.storage.save('web-screens', 'arrivals-list', this.items);
      this.deleteTarget = null;
    }
  }
}
