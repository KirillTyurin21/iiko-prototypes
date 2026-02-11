import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiTableComponent,
  TableCellDefDirective,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiInputComponent,
  UiSelectComponent,
  UiTextareaComponent,
  UiBadgeComponent,
} from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import { Hint, CSControl, TriggerItem, RecommendationItem } from '../cs-types';
import { CS_CONTROLS, DISCOUNTS, PRODUCT_TREE } from '../data/cs-mock-data';

@Component({
  selector: 'app-hints-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiTableComponent,
    TableCellDefDirective,
    UiModalComponent,
    UiConfirmDialogComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
    UiBadgeComponent,
    IconsModule,
  ],
  template: `
    <div class="hints-screen">
      <!-- ─── Toast ─── -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- ─── Header ─── -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Подсказки</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-icon" [disabled]="!selectedHint" title="Редактировать" (click)="openEditDrawer()">
              <lucide-icon name="pencil" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-danger-icon" [disabled]="!selectedHint" title="Удалить" (click)="confirmDelete()">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-primary" (click)="openAddDrawer()">
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
          [data]="filteredHints"
          [rowKeyFn]="rowKeyFn"
          [selectedKey]="selectedHint?.id"
          [sortColumn]="sortColumn"
          [sortDirection]="sortDirection"
          [compact]="true"
          emptyMessage="Подсказки не найдены"
          (rowClick)="onRowClick($event)"
          (sort)="onSort($event)"
        >
          <ng-template tableCellDef="name" let-item>
            <span class="cell-name" (dblclick)="onDoubleClick(item)">{{ item.name }}</span>
          </ng-template>
          <ng-template tableCellDef="period" let-item>
            <span class="cell-period">{{ formatDate(item.period.startDate) }} – {{ formatDate(item.period.endDate) }}</span>
          </ng-template>
          <ng-template tableCellDef="time" let-item>
            <span class="cell-time">{{ item.time.startTime }} – {{ item.time.endTime }}</span>
          </ng-template>
          <ng-template tableCellDef="status" let-item>
            <span class="status-badge" [ngClass]="getStatusClass(item.status)">
              {{ getStatusLabel(item.status) }}
            </span>
          </ng-template>
        </ui-table>
      </div>

      <!-- ─── Delete Confirm ─── -->
      <ui-confirm-dialog
        [open]="deleteDialogOpen"
        title="Удаление подсказки"
        [message]="'Удалить подсказку «' + (selectedHint?.name || '') + '»? Подсказка будет снята со всех терминалов.'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteSelected()"
        (cancelled)="deleteDialogOpen = false"
      ></ui-confirm-dialog>

      <!-- ─── Drawer overlay ─── -->
      <div
        *ngIf="drawerOpen"
        class="drawer-overlay"
        (click)="closeDrawer()"
      ></div>

      <!-- ─── Drawer panel ─── -->
      <div class="drawer" [class.drawer-open]="drawerOpen">
        <div class="drawer-header">
          <h2 class="drawer-title">{{ editingHint ? 'Редактировать подсказку' : 'Добавить подсказку' }}</h2>
          <button class="app-btn-close" (click)="closeDrawer()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="drawer-body" *ngIf="drawerHint">
          <!-- ═══ Section 1: Основные параметры ═══ -->
          <div class="section">
            <div class="section-title">Основные параметры</div>

            <div class="field-row">
              <label class="field-label">Наименование <span class="required">*</span></label>
              <ui-input
                placeholder="Введите название подсказки"
                [(value)]="drawerHint.name"
                [error]="nameError"
              ></ui-input>
            </div>

            <div class="field-grid">
              <div class="field-row">
                <label class="field-label">Дата начала</label>
                <ui-input type="date" [(value)]="drawerHint.period.startDate"></ui-input>
              </div>
              <div class="field-row">
                <label class="field-label">Дата окончания</label>
                <ui-input type="date" [(value)]="drawerHint.period.endDate"></ui-input>
              </div>
            </div>

            <div class="field-grid">
              <div class="field-row">
                <label class="field-label">Время начала</label>
                <ui-input type="time" [(value)]="drawerHint.time.startTime"></ui-input>
              </div>
              <div class="field-row">
                <label class="field-label">Время окончания</label>
                <ui-input type="time" [(value)]="drawerHint.time.endTime"></ui-input>
              </div>
            </div>
          </div>

          <!-- ═══ Section 2: Связка блюд ═══ -->
          <div class="section">
            <div class="section-title">Связка блюд</div>
            <div class="link-row">
              <!-- Triggers card -->
              <div class="link-card">
                <div class="link-card-header">
                  <span class="link-card-label">Триггеры</span>
                  <span class="link-card-count" *ngIf="drawerHint.triggers.length">{{ drawerHint.triggers.length }}</span>
                </div>
                <div class="link-card-body">
                  <div class="trigger-list" *ngIf="drawerHint.triggers.length > 0">
                    <div class="trigger-item" *ngFor="let t of drawerHint.triggers; let i = index">
                      <div class="trigger-info">
                        <lucide-icon [name]="t.type === 'category' ? 'folder' : 'coffee'" [size]="14" class="trigger-icon"></lucide-icon>
                        <span class="trigger-name">{{ t.name }}</span>
                      </div>
                      <button class="trigger-remove" (click)="removeTrigger(i)" title="Убрать">
                        <lucide-icon name="x" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </div>
                  <div class="trigger-empty" *ngIf="drawerHint.triggers.length === 0">
                    <span>Нет триггеров</span>
                  </div>
                  <div class="add-trigger-wrapper">
                    <button class="app-btn app-btn-outline app-btn-sm app-btn-block" (click)="triggerDropdownOpen = !triggerDropdownOpen">
                      <lucide-icon name="plus" [size]="14"></lucide-icon>
                      Добавить триггер
                    </button>
                    <div class="item-dropdown" *ngIf="triggerDropdownOpen">
                      <div class="item-dropdown-scroll">
                        <div class="item-dropdown-group" *ngFor="let cat of productTree">
                          <div class="item-dropdown-cat" (click)="addTriggerCategory(cat)">
                            <lucide-icon name="folder" [size]="14" class="dd-icon"></lucide-icon>
                            <span>{{ cat.name }}</span>
                            <span class="dd-type-label">категория</span>
                          </div>
                          <div
                            class="item-dropdown-item"
                            *ngFor="let prod of cat.children"
                            (click)="addTriggerProduct(prod)"
                          >
                            <lucide-icon name="coffee" [size]="13" class="dd-icon"></lucide-icon>
                            {{ prod.name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Arrow -->
              <div class="link-arrow">
                <lucide-icon name="arrow-right" [size]="24"></lucide-icon>
              </div>

              <!-- Recommendation card -->
              <div class="link-card">
                <div class="link-card-header">
                  <span class="link-card-label">Рекомендация</span>
                </div>
                <div class="link-card-body">
                  <div class="rec-selected" *ngIf="drawerHint.recommendation">
                    <div class="rec-info">
                      <lucide-icon name="coffee" [size]="14" class="trigger-icon"></lucide-icon>
                      <span>{{ drawerHint.recommendation.name }}</span>
                    </div>
                    <button class="trigger-remove" (click)="drawerHint.recommendation = null" title="Убрать">
                      <lucide-icon name="x" [size]="14"></lucide-icon>
                    </button>
                  </div>
                  <div class="trigger-empty" *ngIf="!drawerHint.recommendation">
                    <span>Не выбрано</span>
                  </div>
                  <div class="add-trigger-wrapper">
                    <button class="app-btn app-btn-outline app-btn-sm app-btn-block" (click)="recDropdownOpen = !recDropdownOpen">
                      <lucide-icon name="search" [size]="14"></lucide-icon>
                      Выбрать блюдо
                    </button>
                    <div class="item-dropdown" *ngIf="recDropdownOpen">
                      <div class="item-dropdown-scroll">
                        <div class="item-dropdown-group" *ngFor="let cat of productTree">
                          <div class="item-dropdown-cat-label">
                            <lucide-icon name="folder" [size]="13" class="dd-icon"></lucide-icon>
                            {{ cat.name }}
                          </div>
                          <div
                            class="item-dropdown-item"
                            *ngFor="let prod of cat.children"
                            (click)="selectRecommendation(prod)"
                          >
                            <lucide-icon name="coffee" [size]="13" class="dd-icon"></lucide-icon>
                            {{ prod.name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ Section 3: Слоган ═══ -->
          <div class="section">
            <div class="section-title">Слоган рекомендации</div>
            <div class="field-row">
              <ui-textarea
                placeholder="Введите промо-текст подсказки..."
                [(value)]="drawerHint.slogan"
                [rows]="4"
              ></ui-textarea>
            </div>
          </div>

          <!-- ═══ Section 4: Скидка ═══ -->
          <div class="section">
            <div class="section-title">Скидка</div>

            <div class="field-row">
              <label class="field-label">Тип скидки</label>
              <div class="radio-group">
                <label class="radio-item" [class.radio-active]="drawerHint.discountType === 'percent'">
                  <input type="radio" name="discountType" value="percent" [(ngModel)]="drawerHint.discountType" />
                  <span>Процент (%)</span>
                </label>
                <label class="radio-item" [class.radio-active]="drawerHint.discountType === 'fixed'">
                  <input type="radio" name="discountType" value="fixed" [(ngModel)]="drawerHint.discountType" />
                  <span>Фиксированная сумма</span>
                </label>
              </div>
            </div>

            <div class="field-grid">
              <div class="field-row">
                <label class="field-label">Размер скидки</label>
                <div class="discount-input-wrapper">
                  <input
                    type="number"
                    class="discount-input"
                    [value]="drawerHint.discountValue"
                    (input)="onDiscountValueChange($event)"
                    min="0"
                  />
                  <span class="discount-suffix">{{ drawerHint.discountType === 'percent' ? '%' : '₽' }}</span>
                </div>
              </div>
              <div class="field-row">
                <label class="field-label">Скидка</label>
                <ui-select
                  [value]="drawerHint.discount || ''"
                  (valueChange)="drawerHint.discount = $event || null"
                  [options]="discountOptions"
                  placeholder="Выберите скидку..."
                ></ui-select>
              </div>
            </div>
          </div>

          <!-- ═══ Section 5: Контрол подсказки ═══ -->
          <div class="section">
            <div class="section-title">Контрол подсказки</div>
            <div class="field-row">
              <label class="field-label">Контрол</label>
              <ui-select
                [(value)]="selectedControlId"
                [options]="hintControlOptions"
                placeholder="Выберите контрол..."
              ></ui-select>
            </div>
          </div>
        </div>

        <!-- Drawer footer -->
        <div class="drawer-footer">
          <button class="app-btn app-btn-ghost" (click)="closeDrawer()">Отмена</button>
          <button class="app-btn app-btn-primary" (click)="saveDrawer()">Сохранить</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ─── General ─── */
    :host { display: block; font-family: Roboto, sans-serif; }
    .hints-screen { animation: fadeIn 0.2s ease-out; position: relative; }
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
    .app-btn-outline { background: transparent; color: #448aff; border: 1px solid #448aff; }
    .app-btn-outline:hover { background: #f0f6ff; }
    .app-btn-ghost { background: transparent; color: #616161; }
    .app-btn-ghost:hover { background: #f5f5f5; }
    .app-btn-sm { height: 30px; padding: 0 10px; font-size: 12px; }
    .app-btn-block { width: 100%; justify-content: center; }
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
    .app-btn-close {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: none; border-radius: 4px;
      background: transparent; color: #616161; cursor: pointer; transition: all 0.15s;
    }
    .app-btn-close:hover { background: #f5f5f5; color: #212121; }

    /* ─── Toolbar ─── */
    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
    .search-box { width: 280px; }

    /* ─── Table ─── */
    .table-container { border-radius: 4px; overflow: hidden; }
    .cell-name { cursor: pointer; font-weight: 500; color: #212121; }
    .cell-period { color: #616161; font-size: 13px; }
    .cell-time { color: #616161; font-size: 13px; }

    /* ─── Status badge ─── */
    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
      white-space: nowrap;
    }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-scheduled { background: #e3f2fd; color: #1565c0; }
    .status-expired { background: #f5f5f5; color: #757575; }

    /* ─── Drawer ─── */
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 100;
      animation: fadeIn 0.2s ease-out;
    }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 640px;
      background: #fff; z-index: 101; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .drawer-open { transform: translateX(0); }
    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid #e0e0e0;
    }
    .drawer-title { font-size: 18px; font-weight: 500; color: #212121; margin: 0; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .drawer-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 24px; border-top: 1px solid #e0e0e0; background: #fafafa;
    }

    /* ─── Sections ─── */
    .section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }
    .section:last-child { border-bottom: none; margin-bottom: 0; }
    .section-title {
      font-size: 13px; font-weight: 600; color: #424242; text-transform: uppercase;
      letter-spacing: 0.3px; margin-bottom: 14px;
    }

    /* ─── Fields ─── */
    .field-row { margin-bottom: 14px; }
    .field-row:last-child { margin-bottom: 0; }
    .field-label { display: block; font-size: 12px; font-weight: 500; color: #757575; margin-bottom: 6px; }
    .required { color: #e53935; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .field-grid:last-child { margin-bottom: 0; }
    .field-grid .field-row { margin-bottom: 0; }

    /* ─── Link row (triggers → recommendation) ─── */
    .link-row { display: flex; gap: 12px; align-items: stretch; }
    .link-card {
      flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .link-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; background: #fafafa; border-bottom: 1px solid #eeeeee;
    }
    .link-card-label { font-size: 12px; font-weight: 600; color: #424242; text-transform: uppercase; letter-spacing: 0.3px; }
    .link-card-count {
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%; background: #448aff; color: #fff;
      font-size: 11px; font-weight: 600;
    }
    .link-card-body { padding: 10px 12px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .link-arrow {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; width: 40px; color: #bdbdbd;
    }

    /* ─── Trigger list ─── */
    .trigger-list { display: flex; flex-direction: column; gap: 4px; }
    .trigger-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; background: #f5f5f5; border-radius: 4px;
    }
    .trigger-info { display: flex; align-items: center; gap: 6px; min-width: 0; }
    .trigger-icon { color: #757575; flex-shrink: 0; }
    .trigger-name { font-size: 13px; color: #424242; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .trigger-remove {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
    }
    .trigger-remove:hover { background: #ffebee; color: #e53935; }
    .trigger-empty { padding: 12px 0; text-align: center; color: #bdbdbd; font-size: 12px; }

    /* ─── Recommendation selected ─── */
    .rec-selected {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; background: #e3f2fd; border-radius: 4px;
    }
    .rec-info { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #1565c0; font-weight: 500; }

    /* ─── Add trigger wrapper ─── */
    .add-trigger-wrapper { position: relative; margin-top: auto; }

    /* ─── Item dropdown ─── */
    .item-dropdown {
      position: absolute; bottom: 100%; left: 0; right: 0; z-index: 50; margin-bottom: 4px;
      background: #fff; border: 1px solid #e0e0e0; border-radius: 6px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.12); animation: dropIn 0.15s ease-out;
    }
    @keyframes dropIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .item-dropdown-scroll { max-height: 260px; overflow-y: auto; padding: 4px; }
    .item-dropdown-group { margin-bottom: 2px; }
    .item-dropdown-cat {
      display: flex; align-items: center; gap: 6px; padding: 7px 10px; font-size: 13px;
      font-weight: 500; color: #424242; cursor: pointer; border-radius: 4px; transition: background 0.1s;
    }
    .item-dropdown-cat:hover { background: #e3f2fd; }
    .item-dropdown-cat-label {
      display: flex; align-items: center; gap: 6px; padding: 7px 10px; font-size: 12px;
      font-weight: 600; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .item-dropdown-item {
      display: flex; align-items: center; gap: 6px; padding: 6px 10px 6px 28px; font-size: 13px;
      color: #616161; cursor: pointer; border-radius: 4px; transition: background 0.1s;
    }
    .item-dropdown-item:hover { background: #f5f5f5; color: #212121; }
    .dd-icon { color: #9e9e9e; flex-shrink: 0; }
    .dd-type-label { margin-left: auto; font-size: 11px; color: #bdbdbd; font-weight: 400; }

    /* ─── Radio group ─── */
    .radio-group { display: flex; gap: 4px; }
    .radio-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 13px; color: #616161; cursor: pointer; transition: all 0.15s;
      user-select: none;
    }
    .radio-item input[type="radio"] { display: none; }
    .radio-item:hover { background: #f5f5f5; }
    .radio-active { border-color: #448aff; background: #e3f2fd; color: #1565c0; font-weight: 500; }

    /* ─── Discount input ─── */
    .discount-input-wrapper {
      display: flex; align-items: center; position: relative;
    }
    .discount-input {
      width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px;
      padding: 0 32px 0 10px; font-size: 13px; font-family: Roboto, sans-serif; color: #424242;
      outline: none; transition: border-color 0.15s; background: #fff;
    }
    .discount-input:focus { border-color: #448aff; }
    .discount-suffix {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      font-size: 13px; color: #9e9e9e; pointer-events: none;
    }
  `],
})
export class HintsScreenComponent implements OnInit {
  private dataService = inject(CsDataService);

  // ─── State ─────────────────────────────────
  hints: Hint[] = [];
  filteredHints: Hint[] = [];
  selectedHint: Hint | null = null;
  searchQuery = '';
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Drawer
  drawerOpen = false;
  drawerHint: Hint | null = null;
  editingHint: Hint | null = null;
  nameError = '';
  selectedControlId = '';

  // Dropdowns
  triggerDropdownOpen = false;
  recDropdownOpen = false;

  // Dialogs
  deleteDialogOpen = false;

  // Toast
  toastMessage = '';
  private toastTimer: any;

  // Product tree for trigger / recommendation selection
  productTree = PRODUCT_TREE;

  // Options
  discountOptions: SelectOption[] = DISCOUNTS.map(d => ({
    value: d.name,
    label: `${d.name} (${d.type === 'percent' ? d.value + '%' : d.value + ' ₽'})`,
  }));

  hintControlOptions: SelectOption[] = [];

  // Table config
  columns: TableColumn[] = [
    { key: 'name', header: 'Название', sortable: true },
    { key: 'period', header: 'Период действия', width: '200px' },
    { key: 'time', header: 'Время действия', width: '150px' },
    { key: 'status', header: 'Статус', width: '140px' },
  ];

  rowKeyFn = (item: Hint) => item.id;

  // ─── Lifecycle ─────────────────────────────

  ngOnInit(): void {
    this.loadHints();
    this.buildControlOptions();
  }

  // ─── Data ──────────────────────────────────

  private loadHints(): void {
    this.hints = this.dataService.hints;
    this.applyFilters();
  }

  private buildControlOptions(): void {
    const hintControls = this.dataService.controls.filter(c => c.type === 'hint');
    this.hintControlOptions = [
      { value: '', label: '— Не выбран —' },
      ...hintControls.map(c => ({ value: String(c.id), label: c.name })),
    ];
  }

  applyFilters(): void {
    let result = [...this.hints];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(h => h.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const key = this.sortColumn;
      let aVal: any;
      let bVal: any;
      if (key === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (key === 'period') {
        aVal = a.period.startDate;
        bVal = b.period.startDate;
      } else if (key === 'status') {
        aVal = a.status;
        bVal = b.status;
      } else {
        aVal = (a as any)[key];
        bVal = (b as any)[key];
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    this.filteredHints = result;
  }

  // ─── Sort ──────────────────────────────────

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.applyFilters();
  }

  // ─── Format helpers ────────────────────────

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Активна';
      case 'scheduled': return 'Запланирована';
      case 'expired': return 'Истекла';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'scheduled': return 'status-scheduled';
      case 'expired': return 'status-expired';
      default: return '';
    }
  }

  // ─── Row interactions ──────────────────────

  onRowClick(item: Hint): void {
    this.selectedHint = this.selectedHint?.id === item.id ? null : item;
  }

  onDoubleClick(item: Hint): void {
    this.selectedHint = item;
    this.openEditDrawer();
  }

  // ─── Add ───────────────────────────────────

  openAddDrawer(): void {
    this.editingHint = null;
    this.drawerHint = {
      id: 0,
      name: '',
      status: 'scheduled',
      period: { startDate: '', endDate: '' },
      time: { startTime: '00:00', endTime: '23:59' },
      slogan: '',
      discountType: 'percent',
      discountValue: 0,
      discount: null,
      triggers: [],
      recommendation: null,
      image: null,
      imageSource: null,
      controlId: null,
    };
    this.selectedControlId = '';
    this.nameError = '';
    this.triggerDropdownOpen = false;
    this.recDropdownOpen = false;
    this.buildControlOptions();
    this.drawerOpen = true;
  }

  // ─── Edit ──────────────────────────────────

  openEditDrawer(): void {
    if (!this.selectedHint) return;
    const source = this.hints.find(h => h.id === this.selectedHint!.id);
    if (!source) return;
    this.editingHint = source;
    this.drawerHint = JSON.parse(JSON.stringify(source));
    this.selectedControlId = source.controlId != null ? String(source.controlId) : '';
    this.nameError = '';
    this.triggerDropdownOpen = false;
    this.recDropdownOpen = false;
    this.buildControlOptions();
    this.drawerOpen = true;
  }

  // ─── Delete ────────────────────────────────

  confirmDelete(): void {
    if (!this.selectedHint) return;
    this.deleteDialogOpen = true;
  }

  deleteSelected(): void {
    if (!this.selectedHint) return;
    const name = this.selectedHint.name;
    this.dataService.deleteHint(this.selectedHint.id);
    this.selectedHint = null;
    this.deleteDialogOpen = false;
    this.loadHints();
    this.showToast(`Подсказка «${name}» удалена`);
  }

  // ─── Drawer ────────────────────────────────

  closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerHint = null;
    this.editingHint = null;
    this.triggerDropdownOpen = false;
    this.recDropdownOpen = false;
  }

  saveDrawer(): void {
    if (!this.drawerHint) return;

    if (!this.drawerHint.name.trim()) {
      this.nameError = 'Название обязательно';
      return;
    }
    this.nameError = '';

    // Determine status from dates
    this.drawerHint.status = this.computeStatus(this.drawerHint);

    // Map controlId
    this.drawerHint.controlId = this.selectedControlId ? Number(this.selectedControlId) : null;

    if (this.editingHint) {
      this.dataService.updateHint(this.drawerHint);
      this.showToast(`Подсказка «${this.drawerHint.name}» сохранена`);
    } else {
      const created = this.dataService.addHint(this.drawerHint);
      this.showToast(`Подсказка «${created.name}» создана`);
    }

    this.selectedHint = null;
    this.closeDrawer();
    this.loadHints();
  }

  private computeStatus(hint: Hint): 'active' | 'scheduled' | 'expired' {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (hint.period.endDate && hint.period.endDate < todayStr) return 'expired';
    if (hint.period.startDate && hint.period.startDate > todayStr) return 'scheduled';
    return 'active';
  }

  // ─── Triggers ──────────────────────────────

  addTriggerCategory(cat: { id: number; name: string }): void {
    if (!this.drawerHint) return;
    const exists = this.drawerHint.triggers.some(t => t.id === cat.id && t.type === 'category');
    if (!exists) {
      this.drawerHint.triggers = [...this.drawerHint.triggers, { id: cat.id, name: cat.name, type: 'category' }];
    }
    this.triggerDropdownOpen = false;
  }

  addTriggerProduct(prod: { id: number; name: string }): void {
    if (!this.drawerHint) return;
    const exists = this.drawerHint.triggers.some(t => t.id === prod.id && t.type === 'product');
    if (!exists) {
      this.drawerHint.triggers = [...this.drawerHint.triggers, { id: prod.id, name: prod.name, type: 'product' }];
    }
    this.triggerDropdownOpen = false;
  }

  removeTrigger(index: number): void {
    if (!this.drawerHint) return;
    this.drawerHint.triggers = this.drawerHint.triggers.filter((_, i) => i !== index);
  }

  // ─── Recommendation ────────────────────────

  selectRecommendation(prod: { id: number; name: string }): void {
    if (!this.drawerHint) return;
    this.drawerHint.recommendation = { id: prod.id, name: prod.name, type: 'product' };
    this.recDropdownOpen = false;
  }

  // ─── Discount value ────────────────────────

  onDiscountValueChange(event: Event): void {
    if (!this.drawerHint) return;
    const val = (event.target as HTMLInputElement).valueAsNumber;
    this.drawerHint.discountValue = isNaN(val) ? 0 : val;
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
