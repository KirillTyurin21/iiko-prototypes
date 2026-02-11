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
  UiBadgeComponent,
} from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import {
  CSControl,
  ControlElement,
  ControlElementLayout,
  ControlElementBorder,
  ControlElementFont,
  ElementTypeOption,
  getAnimationElements,
  getHintElements,
  defaultLayout,
  defaultBorder,
  defaultFont,
} from '../cs-types';

@Component({
  selector: 'app-controls-screen',
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
    UiBadgeComponent,
    IconsModule,
  ],
  template: `
    <div class="controls-screen">
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
          <h1 class="page-title">Контролы</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-icon" [disabled]="!selectedControl" title="Редактировать" (click)="openEditDrawer()">
              <lucide-icon name="pencil" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-icon app-btn-danger-icon" [disabled]="!selectedControl" title="Удалить" (click)="confirmDelete()">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-primary" (click)="openTypeDialog()">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              <span>Добавить</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Toolbar: Search + Filter ─── -->
      <div class="toolbar">
        <div class="search-box">
          <ui-input
            placeholder="Поиск по названию..."
            iconName="search"
            [(value)]="searchQuery"
            (valueChange)="applyFilters()"
          ></ui-input>
        </div>
        <div class="filter-group">
          <button
            class="filter-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >Все</button>
          <button
            class="filter-btn"
            [class.active]="activeFilter === 'animation'"
            (click)="setFilter('animation')"
          >
            <span class="dot dot-blue"></span>
            Анимации
          </button>
          <button
            class="filter-btn"
            [class.active]="activeFilter === 'hint'"
            (click)="setFilter('hint')"
          >
            <span class="dot dot-orange"></span>
            Подсказки
          </button>
        </div>
      </div>

      <!-- ─── Table ─── -->
      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="filteredControls"
          [rowKeyFn]="rowKeyFn"
          [selectedKey]="selectedControl?.id"
          [sortColumn]="sortColumn"
          [sortDirection]="sortDirection"
          [compact]="true"
          emptyMessage="Контролы не найдены"
          (rowClick)="onRowClick($event)"
          (sort)="onSort($event)"
        >
          <ng-template tableCellDef="name" let-item>
            <span class="cell-name" (dblclick)="onDoubleClick(item)">{{ item.name }}</span>
          </ng-template>
          <ng-template tableCellDef="type" let-item>
            <span class="type-badge" [class.type-animation]="item.type === 'animation'" [class.type-hint]="item.type === 'hint'">
              <span class="dot" [class.dot-blue]="item.type === 'animation'" [class.dot-orange]="item.type === 'hint'"></span>
              {{ item.type === 'animation' ? 'Анимация' : 'Подсказка' }}
            </span>
          </ng-template>
          <ng-template tableCellDef="elementsCount" let-item>
            <span class="cell-count">{{ item.elementsCount }}</span>
          </ng-template>
        </ui-table>
      </div>

      <!-- ─── Type Selection Modal ─── -->
      <ui-modal
        [open]="typeDialogOpen"
        title="Выберите тип контрола"
        size="sm"
        (modalClose)="typeDialogOpen = false"
      >
        <div class="type-cards">
          <div class="type-card" (click)="createControl('animation')">
            <div class="type-card-icon type-card-icon-blue">
              <lucide-icon name="film" [size]="28"></lucide-icon>
            </div>
            <div class="type-card-body">
              <div class="type-card-title">Контрол анимации</div>
              <div class="type-card-desc">Визуальный контрол для анимаций при добавлении блюда в заказ</div>
            </div>
          </div>
          <div class="type-card" (click)="createControl('hint')">
            <div class="type-card-icon type-card-icon-orange">
              <lucide-icon name="lightbulb" [size]="28"></lucide-icon>
            </div>
            <div class="type-card-body">
              <div class="type-card-title">Контрол подсказки</div>
              <div class="type-card-desc">Контрол для карточек подсказок с рекомендациями и скидками</div>
            </div>
          </div>
        </div>
        <div modalFooter></div>
      </ui-modal>

      <!-- ─── Delete Confirm ─── -->
      <ui-confirm-dialog
        [open]="deleteDialogOpen"
        title="Удаление контрола"
        [message]="'Удалить контрол \\'' + (selectedControl?.name || '') + '\\'? Это действие нельзя отменить.'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteSelected()"
        (cancelled)="deleteDialogOpen = false"
      ></ui-confirm-dialog>

      <!-- ─── Clear elements confirm ─── -->
      <ui-confirm-dialog
        [open]="clearElementsDialogOpen"
        title="Очистить элементы"
        message="Удалить все элементы из контрола? Обязательные элементы не будут удалены."
        confirmText="Очистить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="clearAllElements()"
        (cancelled)="clearElementsDialogOpen = false"
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
          <h2 class="drawer-title">{{ editingControl ? editingControl.name : 'Новый контрол' }}</h2>
          <button class="app-btn-close" (click)="closeDrawer()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <div class="drawer-body" *ngIf="drawerControl">
          <!-- Type badge -->
          <div class="field-row">
            <label class="field-label">Тип</label>
            <span class="type-badge" [class.type-animation]="drawerControl.type === 'animation'" [class.type-hint]="drawerControl.type === 'hint'">
              <span class="dot" [class.dot-blue]="drawerControl.type === 'animation'" [class.dot-orange]="drawerControl.type === 'hint'"></span>
              {{ drawerControl.type === 'animation' ? 'Анимация' : 'Подсказка' }}
            </span>
          </div>

          <!-- Name -->
          <div class="field-row">
            <label class="field-label">Название <span class="required">*</span></label>
            <ui-input
              placeholder="Введите название контрола"
              [(value)]="drawerControl.name"
              [error]="nameError"
            ></ui-input>
          </div>

          <!-- ─── Preview Canvas ─── -->
          <div class="field-row">
            <label class="field-label">Превью</label>
            <div class="preview-canvas">
              <div class="preview-canvas-inner">
                <div
                  *ngFor="let elem of drawerControl.elements"
                  class="preview-element"
                  [style.left.px]="scaleX(elem.settings.layout.x)"
                  [style.top.px]="scaleY(elem.settings.layout.y)"
                  [style.width.px]="scaleX(elem.settings.layout.width)"
                  [style.height.px]="scaleY(elem.settings.layout.height)"
                  [style.background-color]="previewBgColor(elem)"
                  [style.border]="previewBorder(elem)"
                  [style.border-radius.px]="elem.settings.border.radius * previewScale"
                  [style.z-index]="elem.settings.layout.zIndex"
                  [style.transform]="'rotate(' + elem.settings.layout.rotation + 'deg)'"
                  [style.opacity]="elem.settings.layout.bgOpacity / 100"
                  [title]="elem.name"
                >
                  <span class="preview-element-label" *ngIf="scaleX(elem.settings.layout.width) > 30 && scaleY(elem.settings.layout.height) > 14">
                    {{ elem.name | slice:0:12 }}
                  </span>
                </div>
                <div *ngIf="drawerControl.elements.length === 0" class="preview-empty-hint">
                  Нет элементов
                </div>
              </div>
            </div>
          </div>

          <!-- Elements section -->
          <div class="elements-section">
            <div class="elements-header">
              <span class="elements-title">Элементы ({{ drawerControl.elements.length }})</span>
              <div class="elements-actions">
                <div class="add-element-wrapper">
                  <button class="app-btn app-btn-outline app-btn-sm" (click)="toggleDropdown()">
                    <lucide-icon name="plus" [size]="14"></lucide-icon>
                    Добавить элемент
                  </button>
                  <div class="element-dropdown" *ngIf="showDropdown">
                    <div class="element-dropdown-scroll">
                      <div
                        class="element-dropdown-item"
                        *ngFor="let el of availableElements"
                        (click)="addElement(el)"
                      >
                        <div class="element-dropdown-name">{{ el.name }}</div>
                        <div class="element-dropdown-desc">{{ el.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  class="app-btn app-btn-ghost app-btn-sm"
                  [disabled]="drawerControl.elements.length === 0"
                  (click)="clearElementsDialogOpen = true"
                >
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  Очистить
                </button>
              </div>
            </div>

            <!-- Element list -->
            <div class="element-list" *ngIf="drawerControl.elements.length > 0">
              <div
                class="element-row"
                *ngFor="let elem of drawerControl.elements; let i = index"
              >
                <!-- Collapsed header -->
                <div class="element-row-header" (click)="toggleElement(elem.id)">
                  <div class="element-row-left">
                    <lucide-icon
                      [name]="expandedElementId === elem.id ? 'chevron-down' : 'chevron-right'"
                      [size]="14"
                      class="expand-icon"
                    ></lucide-icon>
                    <lucide-icon [name]="getElementIcon(elem.type)" [size]="16" class="element-icon"></lucide-icon>
                    <span class="element-name">{{ elem.name }}</span>
                    <span class="element-type-label">{{ elem.type }}</span>
                    <span class="element-required-badge" *ngIf="elem.isRequired">обяз.</span>
                  </div>
                  <button
                    *ngIf="!elem.isRequired"
                    class="element-delete-btn"
                    (click)="removeElement(i); $event.stopPropagation()"
                    title="Удалить элемент"
                  >
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>

                <!-- Expanded settings -->
                <div class="element-settings" *ngIf="expandedElementId === elem.id">

                  <!-- ── Layout (Макет) ── -->
                  <div class="settings-group">
                    <div class="settings-group-title">
                      <lucide-icon name="layout" [size]="13"></lucide-icon>
                      Макет
                    </div>
                    <div class="settings-grid">
                      <div class="settings-field">
                        <label>Цвет фона</label>
                        <div class="color-input-row">
                          <input type="color" [(ngModel)]="elem.settings.layout.bgColor" class="color-swatch" />
                          <input type="text" [(ngModel)]="elem.settings.layout.bgColor" class="settings-input settings-input-text color-hex" />
                        </div>
                      </div>
                      <div class="settings-field">
                        <label>Прозрачность (%)</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.bgOpacity" class="settings-input" min="0" max="100" />
                      </div>
                      <div class="settings-field">
                        <label>X</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.x" class="settings-input" />
                      </div>
                      <div class="settings-field">
                        <label>Y</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.y" class="settings-input" />
                      </div>
                      <div class="settings-field">
                        <label>Ширина</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.width" class="settings-input" />
                      </div>
                      <div class="settings-field">
                        <label>Высота</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.height" class="settings-input" />
                      </div>
                      <div class="settings-field">
                        <label>Z-index</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.zIndex" class="settings-input" />
                      </div>
                      <div class="settings-field">
                        <label>Поворот (°)</label>
                        <input type="number" [(ngModel)]="elem.settings.layout.rotation" class="settings-input" />
                      </div>
                      <div class="settings-field settings-field-wide">
                        <label>Padding (T, R, B, L)</label>
                        <div class="padding-inputs">
                          <input type="number" [(ngModel)]="elem.settings.layout.padding[0]" class="settings-input" />
                          <input type="number" [(ngModel)]="elem.settings.layout.padding[1]" class="settings-input" />
                          <input type="number" [(ngModel)]="elem.settings.layout.padding[2]" class="settings-input" />
                          <input type="number" [(ngModel)]="elem.settings.layout.padding[3]" class="settings-input" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- ── Border (Граница) ── -->
                  <div class="settings-group">
                    <div class="settings-group-title">
                      <lucide-icon name="square" [size]="13"></lucide-icon>
                      Граница
                    </div>
                    <div class="settings-grid">
                      <div class="settings-field">
                        <label>Тип границы</label>
                        <select [(ngModel)]="elem.settings.border.type" class="settings-select">
                          <option *ngFor="let bt of borderTypes" [value]="bt.value">{{ bt.label }}</option>
                        </select>
                      </div>
                      <div class="settings-field">
                        <label>Ширина (px)</label>
                        <input type="number" [(ngModel)]="elem.settings.border.width" class="settings-input" min="0" />
                      </div>
                      <div class="settings-field">
                        <label>Цвет границы</label>
                        <div class="color-input-row">
                          <input type="color" [(ngModel)]="elem.settings.border.color" class="color-swatch" />
                          <input type="text" [(ngModel)]="elem.settings.border.color" class="settings-input settings-input-text color-hex" />
                        </div>
                      </div>
                      <div class="settings-field">
                        <label>Скругление (px)</label>
                        <input type="number" [(ngModel)]="elem.settings.border.radius" class="settings-input" min="0" />
                      </div>
                    </div>
                  </div>

                  <!-- ── Font (Шрифт) — textual elements only ── -->
                  <div class="settings-group" *ngIf="elem.settings.font">
                    <div class="settings-group-title">
                      <lucide-icon name="type" [size]="13"></lucide-icon>
                      Шрифт
                    </div>
                    <div class="settings-grid">
                      <div class="settings-field">
                        <label>Цвет шрифта</label>
                        <div class="color-input-row">
                          <input type="color" [(ngModel)]="elem.settings.font!.color" class="color-swatch" />
                          <input type="text" [(ngModel)]="elem.settings.font!.color" class="settings-input settings-input-text color-hex" />
                        </div>
                      </div>
                      <div class="settings-field">
                        <label>Размер (px)</label>
                        <input type="number" [(ngModel)]="elem.settings.font!.size" class="settings-input" min="1" />
                      </div>
                      <div class="settings-field settings-field-wide">
                        <label>Семейство шрифта</label>
                        <select [(ngModel)]="elem.settings.font!.family" class="settings-select">
                          <option *ngFor="let ff of fontFamilies" [value]="ff">{{ ff }}</option>
                        </select>
                      </div>
                      <div class="settings-field settings-field-wide">
                        <label>Выравнивание</label>
                        <div class="toggle-group">
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.align === 'left'"
                            (click)="elem.settings.font!.align = 'left'"
                            title="По левому краю"
                          >
                            <lucide-icon name="align-left" [size]="14"></lucide-icon>
                          </button>
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.align === 'center'"
                            (click)="elem.settings.font!.align = 'center'"
                            title="По центру"
                          >
                            <lucide-icon name="align-center" [size]="14"></lucide-icon>
                          </button>
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.align === 'right'"
                            (click)="elem.settings.font!.align = 'right'"
                            title="По правому краю"
                          >
                            <lucide-icon name="align-right" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      </div>
                      <div class="settings-field">
                        <label>Стиль</label>
                        <div class="toggle-group">
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.style === 'normal'"
                            (click)="elem.settings.font!.style = 'normal'"
                            title="Обычный"
                          >N</button>
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.style === 'italic'"
                            (click)="elem.settings.font!.style = 'italic'"
                            title="Курсив"
                          ><em>I</em></button>
                        </div>
                      </div>
                      <div class="settings-field">
                        <label>Начертание</label>
                        <div class="toggle-group">
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.weight === 'normal'"
                            (click)="elem.settings.font!.weight = 'normal'"
                            title="Обычный"
                          >N</button>
                          <button
                            class="toggle-btn"
                            [class.active]="elem.settings.font!.weight === 'bold'"
                            (click)="elem.settings.font!.weight = 'bold'"
                            title="Жирный"
                          ><strong>B</strong></button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Empty elements -->
            <div class="elements-empty" *ngIf="drawerControl.elements.length === 0">
              <lucide-icon name="layers" [size]="32" class="text-gray-300"></lucide-icon>
              <span>Нет элементов</span>
              <span class="elements-empty-hint">Нажмите «Добавить элемент» чтобы начать</span>
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
    .controls-screen { animation: fadeIn 0.2s ease-out; position: relative; }
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
    .filter-group { display: flex; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .filter-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 0 14px; height: 34px; border: none;
      background: #fff; color: #616161; font-size: 13px; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s;
      border-right: 1px solid #e0e0e0;
    }
    .filter-btn:last-child { border-right: none; }
    .filter-btn:hover { background: #f5f5f5; }
    .filter-btn.active { background: #e3f2fd; color: #1976d2; font-weight: 500; }

    /* ─── Dots ─── */
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot-blue { background: #448aff; }
    .dot-orange { background: #ff6d00; }

    /* ─── Type badge ─── */
    .type-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;
    }
    .type-animation { background: #e3f2fd; color: #1976d2; }
    .type-hint { background: #fff3e0; color: #e65100; }

    /* ─── Table ─── */
    .table-container { border-radius: 4px; overflow: hidden; }
    .cell-name { cursor: pointer; font-weight: 500; color: #212121; }
    .cell-count { color: #757575; }

    /* ─── Type cards (modal) ─── */
    .type-cards { display: flex; flex-direction: column; gap: 10px; }
    .type-card {
      display: flex; gap: 14px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;
      cursor: pointer; transition: all 0.15s;
    }
    .type-card:hover { border-color: #448aff; background: #f8fbff; box-shadow: 0 0 0 1px #448aff; }
    .type-card-icon {
      width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .type-card-icon-blue { background: #e3f2fd; color: #1976d2; }
    .type-card-icon-orange { background: #fff3e0; color: #e65100; }
    .type-card-body { min-width: 0; }
    .type-card-title { font-size: 14px; font-weight: 500; color: #212121; margin-bottom: 4px; }
    .type-card-desc { font-size: 12px; color: #757575; line-height: 1.4; }

    /* ─── Drawer ─── */
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 100;
      animation: fadeIn 0.2s ease-out;
    }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 680px;
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

    /* ─── Fields ─── */
    .field-row { margin-bottom: 16px; }
    .field-label { display: block; font-size: 12px; font-weight: 500; color: #757575; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .required { color: #e53935; }

    /* ─── Preview Canvas ─── */
    .preview-canvas {
      width: 100%; height: 200px; background: #1a1a2e; border-radius: 6px;
      overflow: hidden; position: relative; border: 1px solid #e0e0e0;
    }
    .preview-canvas-inner {
      position: relative; width: 100%; height: 100%;
    }
    .preview-element {
      position: absolute; border-radius: 2px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; box-sizing: border-box;
      transition: all 0.15s ease;
    }
    .preview-element-label {
      font-size: 8px; color: rgba(255,255,255,0.85); text-align: center;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      padding: 0 2px; pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .preview-empty-hint {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: rgba(255,255,255,0.3); font-size: 13px; pointer-events: none;
    }

    /* ─── Elements section ─── */
    .elements-section { margin-top: 8px; }
    .elements-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .elements-title { font-size: 13px; font-weight: 500; color: #424242; text-transform: uppercase; letter-spacing: 0.3px; }
    .elements-actions { display: flex; gap: 6px; align-items: center; }

    /* ─── Add element dropdown ─── */
    .add-element-wrapper { position: relative; }
    .element-dropdown {
      position: absolute; top: 100%; left: 0; z-index: 50; margin-top: 4px;
      width: 320px; background: #fff; border: 1px solid #e0e0e0; border-radius: 6px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.12);
      animation: dropIn 0.15s ease-out;
    }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .element-dropdown-scroll { max-height: 320px; overflow-y: auto; padding: 4px; }
    .element-dropdown-item {
      padding: 8px 12px; cursor: pointer; border-radius: 4px; transition: background 0.1s;
    }
    .element-dropdown-item:hover { background: #f5f5f5; }
    .element-dropdown-name { font-size: 13px; font-weight: 500; color: #212121; }
    .element-dropdown-desc { font-size: 11px; color: #9e9e9e; margin-top: 2px; }

    /* ─── Element list ─── */
    .element-list { display: flex; flex-direction: column; gap: 1px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
    .element-row { background: #fafafa; }
    .element-row-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; cursor: pointer; transition: background 0.1s;
      user-select: none;
    }
    .element-row-header:hover { background: #f0f0f0; }
    .element-row-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .expand-icon { color: #9e9e9e; flex-shrink: 0; }
    .element-icon { color: #757575; flex-shrink: 0; }
    .element-name { font-size: 13px; font-weight: 500; color: #424242; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .element-type-label { font-size: 11px; color: #bdbdbd; flex-shrink: 0; }
    .element-required-badge {
      font-size: 9px; font-weight: 600; color: #e65100; background: #fff3e0;
      padding: 1px 5px; border-radius: 3px; text-transform: uppercase;
      letter-spacing: 0.3px; flex-shrink: 0;
    }
    .element-delete-btn {
      display: flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border: none; border-radius: 4px;
      background: transparent; color: #bdbdbd; cursor: pointer; transition: all 0.15s;
    }
    .element-delete-btn:hover { background: #ffebee; color: #e53935; }

    /* ─── Element settings ─── */
    .element-settings {
      padding: 12px 12px 12px 36px; border-top: 1px solid #eeeeee;
      background: #fff;
    }
    .settings-group { margin-bottom: 14px; }
    .settings-group:last-child { margin-bottom: 0; }
    .settings-group-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 600; color: #9e9e9e; text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 8px;
    }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
    .settings-field label {
      display: block; font-size: 10px; color: #9e9e9e; margin-bottom: 3px;
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .settings-field-wide { grid-column: span 2; }
    .settings-input {
      width: 100%; height: 28px; border: 1px solid #e0e0e0; border-radius: 3px;
      padding: 0 6px; font-size: 12px; font-family: Roboto, sans-serif; color: #424242;
      outline: none; transition: border-color 0.15s; background: #fff;
      box-sizing: border-box;
    }
    .settings-input:focus { border-color: #448aff; }
    .settings-input-text { min-width: 0; }
    .padding-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; }

    /* ─── Color input ─── */
    .color-input-row {
      display: flex; gap: 4px; align-items: center;
    }
    .color-swatch {
      width: 28px; height: 28px; padding: 1px; border: 1px solid #e0e0e0;
      border-radius: 3px; cursor: pointer; background: none; flex-shrink: 0;
    }
    .color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
    .color-swatch::-webkit-color-swatch { border: none; border-radius: 2px; }
    .color-hex { flex: 1; font-family: 'Roboto Mono', monospace; font-size: 11px; }

    /* ─── Select (native) ─── */
    .settings-select {
      width: 100%; height: 28px; border: 1px solid #e0e0e0; border-radius: 3px;
      padding: 0 6px; font-size: 12px; font-family: Roboto, sans-serif; color: #424242;
      outline: none; transition: border-color 0.15s; background: #fff;
      cursor: pointer; box-sizing: border-box;
      -webkit-appearance: none; -moz-appearance: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239e9e9e'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 8px center;
      padding-right: 24px;
    }
    .settings-select:focus { border-color: #448aff; }

    /* ─── Toggle group ─── */
    .toggle-group { display: flex; gap: 2px; }
    .toggle-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 28px; border: 1px solid #e0e0e0; border-radius: 3px;
      background: #fff; color: #757575; cursor: pointer; font-size: 13px; font-family: Roboto, sans-serif;
      transition: all 0.15s;
    }
    .toggle-btn:hover { background: #f5f5f5; }
    .toggle-btn.active { background: #e3f2fd; border-color: #448aff; color: #1976d2; }

    /* ─── Empty elements ─── */
    .elements-empty {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 32px 0; color: #bdbdbd; font-size: 13px;
    }
    .elements-empty-hint { font-size: 11px; color: #ccc; }
  `],
})
export class ControlsScreenComponent implements OnInit {
  private dataService = inject(CsDataService);

  // ─── State ─────────────────────────────────
  controls: CSControl[] = [];
  filteredControls: CSControl[] = [];
  selectedControl: CSControl | null = null;
  searchQuery = '';
  activeFilter: 'all' | 'animation' | 'hint' = 'all';
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Drawer
  drawerOpen = false;
  drawerControl: CSControl | null = null;
  editingControl: CSControl | null = null;
  nameError = '';

  // Elements
  expandedElementId: number | null = null;
  showDropdown = false;
  availableElements: ElementTypeOption[] = [];
  private nextElementId = 100;

  // Dialogs
  typeDialogOpen = false;
  deleteDialogOpen = false;
  clearElementsDialogOpen = false;

  // Toast
  toastMessage = '';
  private toastTimer: any;

  // ─── Reference data ────────────────────────

  fontFamilies: string[] = ['Roboto', 'Arial', 'Open Sans', 'Montserrat', 'PT Sans', 'Inter'];

  borderTypes: { value: string; label: string }[] = [
    { value: 'none', label: 'Нет' },
    { value: 'solid', label: 'Сплошная' },
    { value: 'dashed', label: 'Пунктирная' },
    { value: 'dotted', label: 'Точечная' },
  ];

  // Preview scaling — assume design canvas is ~800×480
  readonly canvasWidth = 800;
  readonly canvasHeight = 480;
  // Preview widget is 100% drawer body width × 200px
  get previewScale(): number {
    return 200 / this.canvasHeight;
  }

  // Table config
  columns: TableColumn[] = [
    { key: 'name', header: 'Название', sortable: true },
    { key: 'type', header: 'Тип', width: '160px' },
    { key: 'elementsCount', header: 'Кол-во элементов', width: '160px', sortable: true, align: 'center' },
  ];

  rowKeyFn = (item: CSControl) => item.id;

  // ─── Lifecycle ─────────────────────────────

  ngOnInit(): void {
    this.loadControls();
  }

  // ─── Data ──────────────────────────────────

  private loadControls(): void {
    this.controls = this.dataService.controls;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.controls];

    // Type filter
    if (this.activeFilter !== 'all') {
      result = result.filter(c => c.type === this.activeFilter);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      const key = this.sortColumn as keyof CSControl;
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

    this.filteredControls = result;
  }

  // ─── Filter ────────────────────────────────

  setFilter(filter: 'all' | 'animation' | 'hint'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  // ─── Sort ──────────────────────────────────

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.applyFilters();
  }

  // ─── Row interactions ──────────────────────

  onRowClick(item: CSControl): void {
    this.selectedControl = this.selectedControl?.id === item.id ? null : item;
  }

  onDoubleClick(item: CSControl): void {
    this.selectedControl = item;
    this.openEditDrawer();
  }

  // ─── Type dialog ───────────────────────────

  openTypeDialog(): void {
    this.typeDialogOpen = true;
  }

  createControl(type: 'animation' | 'hint'): void {
    this.typeDialogOpen = false;
    this.editingControl = null;

    const elements: ControlElement[] = [];

    // БП-7: Auto-add required "Баннер подсказки" for hint controls
    if (type === 'hint') {
      elements.push({
        id: this.nextElementId++,
        type: 'hint-banner',
        name: 'Баннер подсказки',
        isRequired: true,
        settings: {
          layout: defaultLayout({ x: 0, y: 0, width: 300, height: 200 }),
          border: defaultBorder(),
          // hint-banner is not textual — no font
        },
      });
    }

    this.drawerControl = {
      id: 0,
      name: '',
      type,
      elementsCount: elements.length,
      elements,
    };
    this.nameError = '';
    this.expandedElementId = null;
    this.showDropdown = false;
    this.availableElements = type === 'animation' ? getAnimationElements() : getHintElements();
    this.drawerOpen = true;
  }

  // ─── Edit ──────────────────────────────────

  openEditDrawer(): void {
    if (!this.selectedControl) return;
    const source = this.controls.find(c => c.id === this.selectedControl!.id);
    if (!source) return;
    this.editingControl = source;
    this.drawerControl = JSON.parse(JSON.stringify(source));
    this.nameError = '';
    this.expandedElementId = null;
    this.showDropdown = false;
    this.availableElements = source.type === 'animation' ? getAnimationElements() : getHintElements();
    this.drawerOpen = true;
  }

  // ─── Delete ────────────────────────────────

  confirmDelete(): void {
    if (!this.selectedControl) return;
    this.deleteDialogOpen = true;
  }

  deleteSelected(): void {
    if (!this.selectedControl) return;
    this.dataService.deleteControl(this.selectedControl.id);
    const name = this.selectedControl.name;
    this.selectedControl = null;
    this.deleteDialogOpen = false;
    this.loadControls();
    this.showToast(`Контрол «${name}» удалён`);
  }

  // ─── Drawer ────────────────────────────────

  closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerControl = null;
    this.editingControl = null;
    this.showDropdown = false;
    this.expandedElementId = null;
  }

  saveDrawer(): void {
    if (!this.drawerControl) return;

    // Validate
    if (!this.drawerControl.name.trim()) {
      this.nameError = 'Название обязательно';
      return;
    }
    this.nameError = '';

    this.drawerControl.elementsCount = this.drawerControl.elements.length;

    if (this.editingControl) {
      // Update
      this.dataService.updateControl(this.drawerControl);
      this.showToast(`Контрол «${this.drawerControl.name}» сохранён`);
    } else {
      // Create
      const created = this.dataService.addControl(this.drawerControl);
      this.showToast(`Контрол «${created.name}» создан`);
    }

    this.selectedControl = null;
    this.closeDrawer();
    this.loadControls();
  }

  // ─── Elements ──────────────────────────────

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  addElement(opt: ElementTypeOption): void {
    if (!this.drawerControl) return;
    const isTextual = opt.isTextual;
    const elem: ControlElement = {
      id: this.nextElementId++,
      type: opt.type,
      name: opt.name,
      settings: {
        layout: defaultLayout(),
        border: defaultBorder(),
        ...(isTextual ? { font: defaultFont() } : {}),
      },
    };
    this.drawerControl.elements = [...this.drawerControl.elements, elem];
    this.showDropdown = false;
    this.expandedElementId = elem.id;
  }

  removeElement(index: number): void {
    if (!this.drawerControl) return;
    const removed = this.drawerControl.elements[index];
    // Cannot delete required elements
    if (removed.isRequired) return;
    if (this.expandedElementId === removed.id) {
      this.expandedElementId = null;
    }
    this.drawerControl.elements = this.drawerControl.elements.filter((_, i) => i !== index);
  }

  clearAllElements(): void {
    if (!this.drawerControl) return;
    // Keep required elements (e.g. hint-banner)
    this.drawerControl.elements = this.drawerControl.elements.filter(e => e.isRequired);
    this.expandedElementId = null;
    this.clearElementsDialogOpen = false;
  }

  toggleElement(id: number): void {
    this.expandedElementId = this.expandedElementId === id ? null : id;
  }

  getElementIcon(type: string): string {
    const icons: Record<string, string> = {
      'area': 'square',
      'text': 'type',
      'image': 'image',
      'product-image': 'image',
      'product-name': 'tag',
      'full-product-name': 'tag',
      'foreign-product-name': 'languages',
      'price': 'dollar-sign',
      'product-description': 'align-left',
      'foreign-product-description': 'align-left',
      'last-added-dish': 'utensils',
      'quantity': 'hash',
      'measurement-unit': 'ruler',
      'nutritional-value': 'heart',
      'product-scale': 'maximize-2',
      'hint-slogan': 'message-square',
      'hint-banner': 'image',
      'discount-name': 'percent',
      'discount-size': 'percent',
      'discounted-price': 'dollar-sign',
      'old-price': 'dollar-sign',
    };
    return icons[type] || 'box';
  }

  // ─── Preview helpers ───────────────────────

  /** Palette of distinguishable element colors for the preview */
  private readonly PREVIEW_COLORS = [
    '#448aff', '#ff6d00', '#66bb6a', '#ab47bc', '#ef5350',
    '#26c6da', '#ffa726', '#78909c', '#ec407a', '#8d6e63',
  ];

  scaleX(val: number): number {
    return val * this.previewScale;
  }

  scaleY(val: number): number {
    return val * this.previewScale;
  }

  previewBgColor(elem: ControlElement): string {
    // Use element bgColor if not white/transparent, otherwise pick from palette
    const bg = elem.settings.layout.bgColor;
    if (bg && bg !== '#ffffff' && bg !== '#FFFFFF') {
      return bg;
    }
    // Deterministic color from element id
    const idx = elem.id % this.PREVIEW_COLORS.length;
    return this.PREVIEW_COLORS[idx];
  }

  previewBorder(elem: ControlElement): string {
    const b = elem.settings.border;
    if (b.type === 'none' || b.width === 0) return 'none';
    const w = Math.max(1, b.width * this.previewScale);
    return `${w}px ${b.type} ${b.color}`;
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
