import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_CONTROLS } from '../data/mock-data';
import {
  ArrivalsControl,
  ArrivalsControlStatusType,
  ArrivalsThemeElement,
  ArrivalsElementType,
} from '../types';

type PanelView = 'control' | 'add-element' | 'element';

interface ElementTypeOption {
  type: ArrivalsElementType;
  label: string;
}

const KITCHEN_STATUSES = [
  'Ожидает', 'Пора готовить', 'Готовится', 'Готовится 2', 'Готовится 3', 'Готовится 4', 'Выдача', 'Подан', 'Удалён',
];

const DELIVERY_STATUSES = [
  'Новый', 'Подтвержден', 'Готовится', 'Выдача', 'Собран', 'Ожидает', 'В пути', 'Вручен', 'Закрыт', 'Удалён',
];

const BALANCER_STATUSES = [
  'Ожидает', 'Пора готовить', 'Сборка', 'Самовывоз', 'Вручен',
];

@Component({
  selector: 'app-arrivals-control-editor-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiConfirmDialogComponent,
  ],
  template: `
    <div class="editor-layout">
      <!-- ═══════ CANVAS AREA ═══════ -->
      <div class="canvas-with-emulation">
      <div class="canvas-area">
        <div class="canvas-scroll">
          <div
            class="canvas-viewport"
            [style.width.px]="1024"
            [style.height.px]="768"
            [style.transform]="'scale(' + canvasScale + ')'"
            (click)="onCanvasClick()"
          >
            <!-- Elements on canvas -->
            <div
              *ngFor="let el of control.elements"
              class="canvas-element"
              [class.selected]="selectedElementId === el.id"
              [class.dragging]="dragState?.elementId === el.id"
              [style.left.px]="el.x"
              [style.top.px]="el.y"
              [style.width.px]="el.width"
              [style.height.px]="el.height"
              [style.border-width.px]="el.borderWidth"
              [style.border-color]="el.borderColor"
              [style.border-radius.px]="el.borderRadius"
              (click)="selectElement(el.id, $event)"
              (mousedown)="onElementMouseDown($event, el)"
            >
              <span *ngIf="el.type === 'text'" class="el-text"
                [style.font-family]="el.fontFamily"
                [style.font-size.px]="el.fontSize"
                [style.font-weight]="el.fontBold ? 'bold' : 'normal'"
                [style.font-style]="el.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="el.textAlign"
              >{{ el.text || 'Type something' }}</span>
              <span *ngIf="el.type === 'image'" class="el-placeholder">
                <lucide-icon name="image" [size]="24"></lucide-icon>
              </span>
              <span *ngIf="el.type !== 'text' && el.type !== 'image' && !isOrderVariant(el.type)"
                class="el-placeholder-label">{{ el.name }}</span>

              <!-- Order items table preview -->
              <div *ngIf="el.type === 'order-items'" class="el-order-table">
                <ng-container *ngIf="!el.orderHideOnComplete || !allOrderItemsReady(el)">
                  <div class="order-table-header" *ngIf="el.orderShowHeader !== false"
                    [style.background]="el.orderHeaderBg || '#333333'"
                    [style.height.px]="el.orderHeaderHeight || 36">
                    <span *ngIf="el.orderShowName !== false" class="order-col-name"
                      [style.color]="el.orderHeaderFontColor || '#fff'"
                      [style.font-size.px]="el.orderHeaderFontSize || 14"
                      [style.font-family]="el.orderHeaderFontFamily || 'Roboto'"
                      [style.width.px]="el.orderNameColWidth || null">{{ el.orderShowNameLabel !== false ? (el.orderNameLabel || 'Наименование') : '' }}</span>
                    <span *ngIf="el.orderShowQty !== false" class="order-col-qty"
                      [style.color]="el.orderHeaderFontColor || '#fff'"
                      [style.font-size.px]="el.orderHeaderFontSize || 14"
                      [style.font-family]="el.orderHeaderFontFamily || 'Roboto'"
                      [style.width.px]="el.orderQtyColWidth || null">{{ el.orderShowQtyLabel !== false ? (el.orderQtyLabel || 'Кол-во') : '' }}</span>
                    <span *ngIf="el.orderShowStatus !== false" class="order-col-status"
                      [style.color]="el.orderHeaderFontColor || '#fff'"
                      [style.font-size.px]="el.orderHeaderFontSize || 14"
                      [style.font-family]="el.orderHeaderFontFamily || 'Roboto'"
                      [style.width.px]="el.orderStatusColWidth || null">{{ el.orderShowStatusLabel !== false ? (el.orderStatusLabel || 'Статус') : '' }}</span>
                  </div>
                  <div *ngFor="let item of getFilteredOrderItems(el)" class="order-table-row"
                    [style.background]="item.ready ? (el.orderReadyColor || '#e8f5e9') : (el.orderNotReadyColor || '#ffffff')"
                    [style.height.px]="el.orderRowHeight || 32">
                    <span *ngIf="el.orderShowName !== false" class="order-col-name"
                      [style.color]="el.orderNameFontColor || '#333'"
                      [style.font-size.px]="el.orderNameFontSize || 14"
                      [style.font-family]="el.orderNameFontFamily || 'Roboto'"
                      [style.width.px]="el.orderNameColWidth || null">{{ item.name }}</span>
                    <span *ngIf="el.orderShowQty !== false" class="order-col-qty"
                      [style.color]="el.orderQtyFontColor || '#333'"
                      [style.font-size.px]="el.orderQtyFontSize || 14"
                      [style.font-family]="el.orderQtyFontFamily || 'Roboto'"
                      [style.width.px]="el.orderQtyColWidth || null">{{ item.qty }}</span>
                    <span *ngIf="el.orderShowStatus !== false" class="order-col-status"
                      [style.color]="getStatusColor(el, item)"
                      [style.font-size.px]="el.orderStatusFontSize || 14"
                      [style.font-family]="el.orderStatusFontFamily || 'Roboto'"
                      [style.font-weight]="item.ready ? '600' : '400'"
                      [style.width.px]="el.orderStatusColWidth || null">{{ item.status }}</span>
                  </div>
                </ng-container>
                <div *ngIf="el.orderHideOnComplete && allOrderItemsReady(el)" class="order-complete-msg">
                  <lucide-icon name="check-circle" [size]="28" style="color: #4caf50"></lucide-icon>
                  <span>Заказ готов</span>
                </div>
              </div>

              <!-- ═══ B: Two zones ═══ -->
              <div *ngIf="el.type === 'order-items-zones'" class="el-order-zones">
                <div class="zones-section zones-ready">
                  <div class="zones-section-header zones-ready-header"
                    [style.background]="el.zonesReadyBg || '#e8f5e9'"
                    [style.font-size.px]="el.zonesHeaderFontSize || 11">
                    <span class="zones-icon">✔</span> {{ el.zonesReadyHeaderText || 'МОЖНО ЗАБРАТЬ' }}
                  </div>
                  <div *ngFor="let item of getReadyItems()" class="zones-row zones-row-ready"
                    [style.background]="el.zonesReadyBg || '#f1f8e9'"
                    [style.font-size.px]="el.zonesItemFontSize || 12">
                    <span class="zones-check">✔</span>
                    <span class="zones-name">{{ item.name }}</span>
                    <span class="zones-qty">×{{ item.qty }}</span>
                  </div>
                  <div *ngIf="getReadyItems().length === 0" class="zones-empty">Нет готовых блюд</div>
                </div>
                <div class="zones-section zones-pending" *ngIf="getPendingItems().length > 0">
                  <div class="zones-section-header zones-pending-header"
                    [style.background]="el.zonesPendingBg || '#fff3e0'"
                    [style.font-size.px]="el.zonesHeaderFontSize || 11">
                    <span class="zones-icon">⏳</span> {{ el.zonesPendingHeaderText || 'ГОТОВИТСЯ' }}
                  </div>
                  <div *ngFor="let item of getPendingItems()" class="zones-row zones-row-pending"
                    [style.background]="el.zonesPendingBg || '#fff8e1'"
                    [style.font-size.px]="el.zonesItemFontSize || 12">
                    <span class="zones-name">{{ item.name }}</span>
                    <span class="zones-qty">×{{ item.qty }}</span>
                  </div>
                </div>
                <div *ngIf="el.zonesShowAllReadyMsg !== false && getPendingItems().length === 0 && getReadyItems().length > 0" class="zones-all-ready">
                  <span class="zones-all-ready-icon">✔</span>
                  <span>Заказ полностью готов</span>
                </div>
              </div>

              <!-- ═══ C: Progress bar ═══ -->
              <div *ngIf="el.type === 'order-items-progress'" class="el-order-progress">
                <div class="progress-hero">
                  <div class="progress-circle"
                    [style.width.px]="el.progressCircleSize || 64"
                    [style.height.px]="el.progressCircleSize || 64">
                    <svg viewBox="0 0 80 80" class="progress-svg">
                      <circle cx="40" cy="40" r="34" class="progress-track"
                        [style.stroke]="el.progressTrackColor || '#e0e0e0'"></circle>
                      <circle cx="40" cy="40" r="34" class="progress-fill"
                        [style.stroke]="el.progressCircleColor || '#4caf50'"
                        [style.stroke-dasharray]="getProgressDash()"
                        [style.stroke-dashoffset]="getProgressOffset()">
                      </circle>
                    </svg>
                    <div class="progress-text">
                      <span *ngIf="el.progressShowPercent !== false" class="progress-pct">{{ getReadyPercent() }}%</span>
                      <span *ngIf="el.progressShowCount !== false" class="progress-count">{{ getReadyItems().length }}/{{ orderMockItems.length }}</span>
                    </div>
                  </div>
                </div>
                <div class="progress-list">
                  <div *ngFor="let item of orderMockItems" class="progress-item" [class.ready]="item.ready"
                    [style.font-size.px]="el.progressItemFontSize || 12">
                    <span class="progress-marker" [class.ready]="item.ready">{{ item.ready ? '✔' : '○' }}</span>
                    <span class="progress-name">{{ item.name }}</span>
                    <span class="progress-qty">×{{ item.qty }}</span>
                    <span class="progress-status" [class.ready]="item.ready">{{ item.status }}</span>
                  </div>
                </div>
              </div>

              <!-- ═══ D: Checklist ═══ -->
              <div *ngIf="el.type === 'order-items-checklist'" class="el-order-checklist">
                <div class="checklist-header">
                  <span>Состав заказа</span>
                  <span *ngIf="el.checklistShowCounter !== false" class="checklist-counter">{{ getReadyItems().length }}/{{ orderMockItems.length }} ✔</span>
                </div>
                <div class="checklist-items">
                  <div *ngFor="let item of orderMockItems" class="checklist-row" [class.ready]="item.ready"
                    [style.background]="item.ready ? (el.checklistReadyBg || '#f1f8e9') : 'transparent'"
                    [style.font-size.px]="el.checklistItemFontSize || 12">
                    <span class="checklist-marker" [class.ready]="item.ready">
                      {{ item.ready ? '✔' : '○' }}
                    </span>
                    <span class="checklist-name"
                      [class.ready]="item.ready && el.checklistStrikethrough !== false">{{ item.name }}</span>
                    <span class="checklist-qty">×{{ item.qty }}</span>
                  </div>
                </div>
                <div *ngIf="getReadyItems().length === orderMockItems.length" class="checklist-done">
                  ✔ {{ el.checklistDoneText || 'Заказ полностью готов' }}
                </div>
              </div>

              <!-- ═══ E: Cards ═══ -->
              <div *ngIf="el.type === 'order-items-cards'" class="el-order-cards">
                <div class="cards-header">
                  <span>Состав заказа</span>
                  <span class="cards-counter">{{ getReadyItems().length }}/{{ orderMockItems.length }}</span>
                </div>
                <div class="cards-grid" [style.gap.px]="el.cardsGap || 4">
                  <div *ngFor="let item of orderMockItems" class="card-tile"
                    [class.ready]="item.ready"
                    [style.width]="'calc(' + (100 / (el.cardsPerRow || 2)) + '% - ' + (el.cardsGap || 4) + 'px)'"
                    [style.border-color]="item.ready ? (el.cardsReadyBorderColor || '#4caf50') : '#e0e0e0'">
                    <div class="card-status-bar" [class.ready]="item.ready"
                      [style.background]="item.ready ? (el.cardsReadyBg || '#e8f5e9') : (el.cardsPendingBg || '#fff3e0')"
                      [style.color]="item.ready ? '#2e7d32' : '#e65100'">
                      {{ item.ready ? '✔ ГОТОВО' : '⏳ ' + item.status }}
                    </div>
                    <div class="card-body" [style.font-size.px]="el.cardsItemFontSize || 11">
                      <span class="card-name">{{ item.name }}</span>
                      <span class="card-qty">×{{ item.qty }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selection handles -->
              <ng-container *ngIf="selectedElementId === el.id">
                <div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div>
                <div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div>
                <div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div>
                <div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div>
                <div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div>
                <div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div>
                <div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div>
                <div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════ EMULATION PANEL ═══════ -->
      <div class="emulation-panel" [class.collapsed]="!emulationOpen">
        <div class="emulation-header" (click)="emulationOpen = !emulationOpen">
          <span>🍳 Эмуляция кухни</span>
          <span class="emulation-badge">{{ getReadyItems().length }}/{{ orderMockItems.length }}</span>
          <lucide-icon [name]="emulationOpen ? 'chevron-down' : 'chevron-up'" [size]="16" style="color:#fff; margin-left:auto"></lucide-icon>
        </div>
        <div *ngIf="emulationOpen" class="emulation-body">
          <div class="emulation-order-info">
            Заказ #1247 &nbsp;•&nbsp; Стол 5 &nbsp;•&nbsp; {{ orderMockItems.length }} позиций &nbsp;•&nbsp;
            Готовность: <strong>{{ getReadyItems().length }}/{{ orderMockItems.length }}</strong>
          </div>
          <table class="emulation-table">
            <thead>
              <tr>
                <th class="emu-th-name">Блюдо</th>
                <th class="emu-th-qty">Кол.</th>
                <th class="emu-th-status">Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of orderMockItems; let i = index" [class.emu-ready]="item.ready">
                <td class="emu-td-name">{{ item.name }}</td>
                <td class="emu-td-qty">{{ item.qty }}</td>
                <td class="emu-td-status">
                  <select class="emu-select" [ngModel]="item.status" (ngModelChange)="onEmulationStatusChange(i, $event)"
                    [class.emu-s-ready]="item.status === 'Готово'"
                    [class.emu-s-cooking]="item.status === 'Готовится'"
                    [class.emu-s-waiting]="item.status === 'Ожидает'">
                    <option value="Ожидает">⚪ Ожидает</option>
                    <option value="Готовится">🟡 Готовится</option>
                    <option value="Готово">🟢 Готово</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="emulation-actions">
            <button class="emu-btn" (click)="runScenario()" title="Пошаговый сценарий">
              {{ scenarioRunning ? '⏸ Стоп' : '▶ Сценарий' }}
            </button>
            <button class="emu-btn" (click)="setAllReady()" title="Все позиции — Готово">⏩ Всё готово</button>
            <button class="emu-btn" (click)="resetEmulation()" title="Сбросить в исходное">🔄 Сброс</button>
            <button class="emu-btn" (click)="addDish()" [disabled]="orderMockItems.length >= 12" title="Добавить блюдо">+ Блюдо</button>
            <button class="emu-btn" (click)="removeDish()" [disabled]="orderMockItems.length <= 1" title="Удалить последнее">− Блюдо</button>
          </div>
        </div>
      </div>
      </div>

      <!-- ═══════ RIGHT PANEL ═══════ -->
      <div class="control-panel">
        <!-- Панель управления (collapsed by default) -->
        <div class="panel-header" (click)="toolPanelOpen = !toolPanelOpen">
          <span>Панель управления</span>
          <lucide-icon [name]="toolPanelOpen ? 'chevron-up' : 'chevron-down'" [size]="18"></lucide-icon>
        </div>

        <div *ngIf="toolPanelOpen" class="tool-panel-body">
          <div class="tool-row">
            <span class="tool-label">Границы:</span>
            <button class="tool-btn" [class.active]="showBorders" (click)="showBorders = !showBorders" title="Показать границы">
              <lucide-icon name="scan" [size]="16"></lucide-icon>
            </button>
          </div>
          <div class="tool-row">
            <span class="tool-label">Привязка:</span>
            <button class="tool-btn" [class.active]="snapToGrid" (click)="snapToGrid = !snapToGrid" title="Привязка к сетке">
              <lucide-icon name="grid-3x3" [size]="16"></lucide-icon>
            </button>
            <button class="tool-btn" [class.active]="snapToObjects" (click)="snapToObjects = !snapToObjects" title="Привязка к объектам">
              <lucide-icon name="magnet" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="panel-body">

          <!-- ──── VIEW: Control properties ──── -->
          <ng-container *ngIf="panelView === 'control'">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon>
              <span class="bc-link">Контрол</span>
            </div>

            <div class="field-group">
              <label class="field-label">Имя контрола</label>
              <input class="field-input" [(ngModel)]="control.name" />
            </div>

            <div class="field-group">
              <select class="field-select" [ngModel]="control.statusType" (ngModelChange)="onStatusTypeChange($event)">
                <option value="kitchen">Статусы кухни</option>
                <option value="delivery">Статусы доставки</option>
                <option value="balancer">Статусы балансира</option>
              </select>
            </div>

            <!-- Status list -->
            <div class="status-list">
              <div *ngFor="let status of currentStatuses; let i = index; trackBy: trackByIndex"
                class="status-item"
                [class.highlighted]="highlightedStatuses.has(status)">
                <span class="status-name" [class.bold]="highlightedStatuses.has(status)">{{ status }}</span>
                <div class="status-actions">
                  <button class="status-btn" [class.active]="highlightedStatuses.has(status)"
                    (click)="toggleStatusHighlight(status)" title="Выделить">
                    <lucide-icon name="copy" [size]="14"></lucide-icon>
                  </button>
                  <button class="status-btn" title="Копировать">
                    <lucide-icon name="clipboard" [size]="14"></lucide-icon>
                  </button>
                  <button class="status-btn" title="Удалить">
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>

            <div class="section-divider">Элементы</div>

            <!-- List of existing elements -->
            <div *ngFor="let el of control.elements; let i = index" class="element-list-item"
              [class.active]="selectedElementId === el.id"
              (click)="selectElementFromList(el.id)">
              <span class="el-list-name">{{ el.name || getElementTypeLabel(el.type) }}</span>
              <div class="el-list-actions">
                <button class="el-list-btn" title="Видимость">
                  <lucide-icon name="eye" [size]="14"></lucide-icon>
                </button>
                <button class="el-list-btn" title="Копировать">
                  <lucide-icon name="copy" [size]="14"></lucide-icon>
                </button>
                <button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить">
                  <lucide-icon name="x" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>

            <button class="btn-add-element" (click)="panelView = 'add-element'">
              Добавить элемент
            </button>
          </ng-container>

          <!-- ──── VIEW: Add element picker ──── -->
          <ng-container *ngIf="panelView === 'add-element'">
            <div class="add-element-header">
              <span class="add-element-title">Добавить элемент</span>
              <button class="icon-btn-sm" (click)="panelView = 'control'">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <div class="element-type-list">
              <div
                *ngFor="let et of elementTypes"
                class="element-type-item"
                (click)="addElement(et.type)"
              >
                {{ et.label }}
              </div>
            </div>
          </ng-container>

          <!-- ──── VIEW: Element properties ──── -->
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon>
              <span class="bc-link" (click)="deselectElement()">Контрол</span>
              <span class="bc-separator">/</span>
              <span class="bc-current">{{ selectedElement.name }}</span>
            </div>

            <!-- ── Text element ── -->
            <ng-container *ngIf="selectedElement.type === 'text'">
              <div class="field-group">
                <label class="field-label">Текст</label>
                <textarea class="field-textarea" rows="3"
                  [(ngModel)]="selectedElement.text"></textarea>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Семейство</label>
                    <select class="field-select" [(ngModel)]="selectedElement.fontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.fontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row" style="gap: 16px;">
                    <label class="field-check">
                      <input type="checkbox" [(ngModel)]="selectedElement.fontBold" /> <strong>B</strong>
                    </label>
                    <label class="field-check">
                      <input type="checkbox" [(ngModel)]="selectedElement.fontItalic" /> <em>I</em>
                    </label>
                  </div>
                  <div class="fields-row" style="gap: 4px; margin-top: 8px;">
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'left'" (click)="selectedElement.textAlign = 'left'">
                      <lucide-icon name="align-left" [size]="16"></lucide-icon>
                    </button>
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'center'" (click)="selectedElement.textAlign = 'center'">
                      <lucide-icon name="align-center" [size]="16"></lucide-icon>
                    </button>
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'right'" (click)="selectedElement.textAlign = 'right'">
                      <lucide-icon name="align-right" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Image element ── -->
            <ng-container *ngIf="selectedElement.type === 'image'">
              <div class="field-group">
                <label class="field-label">URL изображения</label>
                <input class="field-input" [(ngModel)]="selectedElement.imageUrl" placeholder="https://..." />
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Generic element ── -->
            <ng-container *ngIf="isGenericElement(selectedElement.type)">
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Order items element ── -->
            <ng-container *ngIf="selectedElement.type === 'order-items'">
              <!-- Данные -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-data')">
                  <span>Данные</span>
                  <lucide-icon [name]="isSectionOpen('order-data') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-data')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Режим отображения</label>
                    <select class="field-select" [(ngModel)]="selectedElement.orderDisplayMode">
                      <option value="all">Все блюда</option>
                      <option value="ready-only">Только готовые</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Триггерный статус</label>
                    <select class="field-select" [(ngModel)]="selectedElement.orderTriggerStatus">
                      <option value="">— Выберите статус —</option>
                      <option *ngFor="let s of currentStatuses" [value]="s">{{ s }}</option>
                    </select>
                  </div>
                  <label class="field-check" style="margin-top: 8px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.orderHideOnComplete" />
                    Скрывать при полной готовности
                  </label>
                </div>
              </div>

              <!-- Колонки -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-columns')">
                  <span>Колонки</span>
                  <lucide-icon [name]="isSectionOpen('order-columns') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-columns')" class="section-content">
                  <label class="field-check" style="margin-bottom: 6px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.orderShowName" /> Наименование
                  </label>
                  <label class="field-check" style="margin-bottom: 6px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.orderShowQty" /> Количество
                  </label>
                  <label class="field-check">
                    <input type="checkbox" [(ngModel)]="selectedElement.orderShowStatus" /> Статус
                  </label>
                </div>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Настройки таблицы -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-table')">
                  <span>Настройки таблицы</span>
                  <lucide-icon [name]="isSectionOpen('order-table') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-table')" class="section-content">
                  <div class="section-divider-bold">Ширина колонок</div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Название</label><input type="number" [(ngModel)]="selectedElement.orderNameColWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Кол-во</label><input type="number" [(ngModel)]="selectedElement.orderQtyColWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Статус</label><input type="number" [(ngModel)]="selectedElement.orderStatusColWidth" class="field-input-sm" /></div>
                  </div>
                  <div class="section-divider-bold">Заголовок</div>
                  <label class="field-check" style="margin-bottom: 8px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.orderShowHeader" />
                    Показывать заголовок
                  </label>
                  <div class="fields-row">
                    <div class="field-sm">
                      <label>Фон</label>
                      <input type="color" [(ngModel)]="selectedElement.orderHeaderBg" class="field-color" />
                    </div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.orderHeaderHeight" class="field-input-sm" /></div>
                  </div>
                  <div class="section-divider-bold">Заголовки колонок</div>
                  <div class="field-group">
                    <label class="field-check" style="margin-bottom: 4px;">
                      <input type="checkbox" [(ngModel)]="selectedElement.orderShowNameLabel" /> Показывать
                    </label>
                    <label class="field-label">Колонка названия</label>
                    <input class="field-input" [(ngModel)]="selectedElement.orderNameLabel" />
                  </div>
                  <div class="field-group">
                    <label class="field-check" style="margin-bottom: 4px;">
                      <input type="checkbox" [(ngModel)]="selectedElement.orderShowQtyLabel" /> Показывать
                    </label>
                    <label class="field-label">Колонка кол-ва</label>
                    <input class="field-input" [(ngModel)]="selectedElement.orderQtyLabel" />
                  </div>
                  <div class="field-group">
                    <label class="field-check" style="margin-bottom: 4px;">
                      <input type="checkbox" [(ngModel)]="selectedElement.orderShowStatusLabel" /> Показывать
                    </label>
                    <label class="field-label">Колонка статуса</label>
                    <input class="field-input" [(ngModel)]="selectedElement.orderStatusLabel" />
                  </div>
                  <div class="section-divider-bold">Строка</div>
                  <div class="field-sm"><label>Высота строки</label><input type="number" [(ngModel)]="selectedElement.orderRowHeight" class="field-input-sm" /></div>
                </div>
              </div>

              <!-- Подсветка строк -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-highlight')">
                  <span>Подсветка строк</span>
                  <lucide-icon [name]="isSectionOpen('order-highlight') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-highlight')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Готовые строки</label>
                    <input type="color" [(ngModel)]="selectedElement.orderReadyColor" class="field-color" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Неготовые строки</label>
                    <input type="color" [(ngModel)]="selectedElement.orderNotReadyColor" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Шрифт заголовка -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-header-font')">
                  <span>Шрифт заголовка</span>
                  <lucide-icon [name]="isSectionOpen('order-header-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-header-font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.orderHeaderFontColor" class="field-color" />
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.orderHeaderFontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Шрифт</label>
                    <select class="field-select" [(ngModel)]="selectedElement.orderHeaderFontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Название шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-name-font')">
                  <span>Название шрифт</span>
                  <lucide-icon [name]="isSectionOpen('order-name-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-name-font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.orderNameFontColor" class="field-color" />
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.orderNameFontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Шрифт</label>
                    <select class="field-select" [(ngModel)]="selectedElement.orderNameFontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Количество шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-qty-font')">
                  <span>Количество шрифт</span>
                  <lucide-icon [name]="isSectionOpen('order-qty-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-qty-font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.orderQtyFontColor" class="field-color" />
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.orderQtyFontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Шрифт</label>
                    <select class="field-select" [(ngModel)]="selectedElement.orderQtyFontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Статус шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('order-status-font')">
                  <span>Статус шрифт</span>
                  <lucide-icon [name]="isSectionOpen('order-status-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('order-status-font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.orderStatusFontColor" class="field-color" />
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.orderStatusFontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Шрифт</label>
                    <select class="field-select" [(ngModel)]="selectedElement.orderStatusFontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── B: Two Zones element ── -->
            <ng-container *ngIf="selectedElement.type === 'order-items-zones'">
              <!-- Зоны -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('zones-settings')">
                  <span>Настройки зон</span>
                  <lucide-icon [name]="isSectionOpen('zones-settings') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('zones-settings')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Заголовок «Готово»</label>
                    <input class="field-input" [(ngModel)]="selectedElement.zonesReadyHeaderText" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Заголовок «Готовится»</label>
                    <input class="field-input" [(ngModel)]="selectedElement.zonesPendingHeaderText" />
                  </div>
                  <label class="field-check" style="margin-top: 8px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.zonesShowAllReadyMsg" />
                    Показывать сообщение «Заказ полностью готов»
                  </label>
                </div>
              </div>

              <!-- Цвета -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('zones-colors')">
                  <span>Цвета зон</span>
                  <lucide-icon [name]="isSectionOpen('zones-colors') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('zones-colors')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Фон зоны «Готово»</label>
                    <input type="color" [(ngModel)]="selectedElement.zonesReadyBg" class="field-color" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Фон зоны «Готовится»</label>
                    <input type="color" [(ngModel)]="selectedElement.zonesPendingBg" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('zones-font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('zones-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('zones-font')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Заголовок</label><input type="number" [(ngModel)]="selectedElement.zonesHeaderFontSize" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Элемент</label><input type="number" [(ngModel)]="selectedElement.zonesItemFontSize" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── C: Progress element ── -->
            <ng-container *ngIf="selectedElement.type === 'order-items-progress'">
              <!-- Прогресс-круг -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('progress-circle')">
                  <span>Прогресс-круг</span>
                  <lucide-icon [name]="isSectionOpen('progress-circle') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('progress-circle')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Цвет прогресса</label>
                    <input type="color" [(ngModel)]="selectedElement.progressCircleColor" class="field-color" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет трека</label>
                    <input type="color" [(ngModel)]="selectedElement.progressTrackColor" class="field-color" />
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер (px)</label><input type="number" [(ngModel)]="selectedElement.progressCircleSize" class="field-input-sm" /></div>
                  </div>
                  <label class="field-check" style="margin-top: 8px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.progressShowPercent" />
                    Показывать процент
                  </label>
                  <label class="field-check" style="margin-top: 4px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.progressShowCount" />
                    Показывать счётчик (2/4)
                  </label>
                </div>
              </div>

              <!-- Шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('progress-font')">
                  <span>Шрифт списка</span>
                  <lucide-icon [name]="isSectionOpen('progress-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('progress-font')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.progressItemFontSize" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── D: Checklist element ── -->
            <ng-container *ngIf="selectedElement.type === 'order-items-checklist'">
              <!-- Настройки чеклиста -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('checklist-settings')">
                  <span>Настройки чеклиста</span>
                  <lucide-icon [name]="isSectionOpen('checklist-settings') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('checklist-settings')" class="section-content">
                  <label class="field-check" style="margin-bottom: 6px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.checklistStrikethrough" />
                    Зачёркивать готовые
                  </label>
                  <label class="field-check" style="margin-bottom: 6px;">
                    <input type="checkbox" [(ngModel)]="selectedElement.checklistShowCounter" />
                    Показывать счётчик
                  </label>
                  <div class="field-group" style="margin-top: 8px;">
                    <label class="field-label">Текст завершения</label>
                    <input class="field-input" [(ngModel)]="selectedElement.checklistDoneText" />
                  </div>
                </div>
              </div>

              <!-- Цвета -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('checklist-colors')">
                  <span>Цвета</span>
                  <lucide-icon [name]="isSectionOpen('checklist-colors') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('checklist-colors')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Фон готовых</label>
                    <input type="color" [(ngModel)]="selectedElement.checklistReadyBg" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('checklist-font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('checklist-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('checklist-font')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.checklistItemFontSize" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── E: Cards element ── -->
            <ng-container *ngIf="selectedElement.type === 'order-items-cards'">
              <!-- Сетка карточек -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('cards-grid')">
                  <span>Сетка карточек</span>
                  <lucide-icon [name]="isSectionOpen('cards-grid') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('cards-grid')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Карточек в строке</label>
                    <select class="field-select" [(ngModel)]="selectedElement.cardsPerRow">
                      <option [ngValue]="2">2</option>
                      <option [ngValue]="3">3</option>
                      <option [ngValue]="4">4</option>
                    </select>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Отступ (px)</label><input type="number" [(ngModel)]="selectedElement.cardsGap" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Цвета -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('cards-colors')">
                  <span>Цвета</span>
                  <lucide-icon [name]="isSectionOpen('cards-colors') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('cards-colors')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Рамка готовой карточки</label>
                    <input type="color" [(ngModel)]="selectedElement.cardsReadyBorderColor" class="field-color" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Фон статус-бара «Готово»</label>
                    <input type="color" [(ngModel)]="selectedElement.cardsReadyBg" class="field-color" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">Фон статус-бара «Готовится»</label>
                    <input type="color" [(ngModel)]="selectedElement.cardsPendingBg" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('cards-font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('cards-font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('cards-font')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.cardsItemFontSize" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

          </ng-container>
        </div>

        <!-- Panel footer -->
        <div class="panel-footer">
          <button class="btn-save" (click)="save()">СОХРАНИТЬ</button>
          <button class="btn-back" (click)="goBack()">НАЗАД</button>
        </div>
      </div>

      <!-- Toast notification -->
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>

      <!-- Delete confirm dialog -->
      <ui-confirm-dialog
        *ngIf="deleteElementTarget"
        [open]="true"
        title="Удалить элемент"
        [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDeleteElement()"
        (cancelled)="deleteElementTarget = null"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .editor-layout {
      display: flex; height: calc(100vh - 110px); margin: -20px -24px;
      font-family: Roboto, sans-serif;
    }

    /* ═══ Canvas ═══ */
    .canvas-area {
      flex: 1; min-width: 0; overflow: auto;
      background: #e0e0e0;
    }
    .canvas-scroll {
      display: flex; align-items: flex-start; justify-content: flex-start;
      min-height: 100%; padding: 0;
    }
    .canvas-viewport {
      position: relative; transform-origin: top left;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .canvas-element {
      position: absolute; border-style: dashed; cursor: move;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.5); transition: box-shadow 0.15s;
      font-size: 13px; color: #333; overflow: hidden;
      user-select: none;
    }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected {
      border-style: solid; border-color: #448aff !important;
      box-shadow: 0 0 0 1px #448aff;
    }
    .canvas-element.dragging { opacity: 0.85; transition: none; }

    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-counter { font-size: 20px; font-weight: 500; }
    .el-time { font-size: 16px; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

    .handle {
      position: absolute; width: 8px; height: 8px; background: #fff;
      border: 2px solid #448aff; z-index: 2;
    }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; }
    .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; }
    .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; }
    .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; }
    .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }

    /* ═══ Right Panel ═══ */
    .control-panel {
      width: 320px; flex-shrink: 0;
      display: flex; flex-direction: column;
      background: #fff; border-left: 1px solid #e0e0e0;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333;
      border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none;
    }
    .panel-header:hover { background: #fafafa; }

    /* ═══ Tool panel (Панель управления) ═══ */
    .tool-panel-body {
      padding: 12px 16px; border-bottom: 1px solid #e0e0e0;
    }
    .tool-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .tool-row:last-child { margin-bottom: 0; }
    .tool-label { font-size: 13px; color: #757575; min-width: 70px; }
    .tool-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer; transition: all 0.15s;
    }
    .tool-btn:hover { background: #f0f0f0; }
    .tool-btn.active { background: #e3f2fd; border-color: #448aff; color: #448aff; }

    .panel-body {
      flex: 1; overflow-y: auto; padding: 16px;
    }

    .panel-footer {
      display: flex; gap: 12px; padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
    }
    .btn-save {
      flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px;
      background: transparent; color: #333; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; letter-spacing: 0.5px;
      transition: all 0.15s;
    }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back {
      flex: 1; height: 36px; border: none; border-radius: 4px;
      background: #ff9800; color: #fff; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; letter-spacing: 0.5px;
      transition: all 0.15s;
    }
    .btn-back:hover { background: #f57c00; }

    /* ═══ Panel breadcrumb ═══ */
    .panel-breadcrumb {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 16px; font-size: 14px;
    }
    .bc-home { color: #ff6d00; cursor: pointer; }
    .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; }
    .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; }
    .bc-current { color: #333; font-weight: 500; }

    /* ═══ Form fields ═══ */
    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-textarea {
      width: 100%; padding: 8px 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; resize: vertical; transition: border-color 0.15s;
    }
    .field-textarea:focus { outline: none; border-color: #448aff; }
    .field-select {
      width: 100%; height: 36px; padding: 0 8px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      background: #fff; cursor: pointer; box-sizing: border-box;
    }
    .field-color {
      width: 48px; height: 32px; padding: 0; border: 1px solid #e0e0e0;
      border-radius: 4px; cursor: pointer;
    }
    .fields-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .field-sm { flex: 1; }
    .field-sm label { display: block; font-size: 11px; color: #9e9e9e; margin-bottom: 2px; }
    .field-input-sm {
      width: 100%; height: 30px; padding: 0 6px;
      border: 1px solid #e0e0e0; border-radius: 3px;
      font-size: 13px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box;
    }
    .field-input-sm:focus { outline: none; border-color: #448aff; }
    .field-check { display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer; }

    .align-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer; transition: all 0.15s;
    }
    .align-btn:hover { background: #f0f0f0; }
    .align-btn.active { background: #e3f2fd; border-color: #448aff; color: #448aff; }

    /* ═══ Sections & dividers ═══ */
    .section-divider {
      position: relative; text-align: center;
      margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e;
    }
    .section-divider::before, .section-divider::after {
      content: ''; position: absolute; top: 50%;
      width: calc(50% - 50px); height: 1px; background: #e0e0e0;
    }
    .section-divider::before { left: 0; }
    .section-divider::after { right: 0; }

    .section-divider-bold {
      font-size: 14px; font-weight: 600; color: #333;
      margin: 16px 0 10px; padding-bottom: 4px;
    }

    .collapsible-section { border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; font-size: 14px; font-weight: 500; color: #333;
      cursor: pointer; user-select: none;
    }
    .section-header:hover { color: #448aff; }
    .section-content { padding-bottom: 12px; }

    /* ═══ Status list ═══ */
    .status-list { margin-bottom: 16px; }
    .status-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s; font-size: 13px;
    }
    .status-item:hover { background: #fafafa; }
    .status-item.highlighted { background: #fff3e0; }
    .status-name { flex: 1; color: #333; }
    .status-name.bold { font-weight: 600; color: #e65100; }
    .status-actions { display: flex; gap: 2px; }
    .status-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
      transition: all 0.15s;
    }
    .status-btn:hover { background: #e0e0e0; color: #424242; }
    .status-btn.active { color: #448aff; }

    /* ═══ Element list ═══ */
    .element-list-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; margin-bottom: 4px; border-radius: 4px;
      cursor: pointer; transition: background 0.15s; font-size: 13px;
    }
    .element-list-item:hover { background: #f5f5f5; }
    .element-list-item.active { background: #e3f2fd; }
    .el-list-name { flex: 1; }
    .el-list-actions { display: flex; gap: 2px; }
    .el-list-btn {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
    }
    .el-list-btn:hover { background: #e0e0e0; color: #424242; }
    .el-list-delete {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
    }
    .el-list-delete:hover { background: #ffebee; color: #e53935; }

    .btn-add-element {
      width: 100%; height: 40px; border: none; border-radius: 4px;
      background: #448aff; color: #fff; font-size: 14px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer;
      transition: background 0.15s; margin-top: 8px;
    }
    .btn-add-element:hover { background: #2979ff; }

    /* ═══ Add element type list ═══ */
    .add-element-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .add-element-title { font-size: 18px; font-weight: 500; color: #333; }
    .icon-btn-sm {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border: none; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer;
    }
    .icon-btn-sm:hover { background: #f0f0f0; }

    .element-type-list { display: flex; flex-direction: column; }
    .element-type-item {
      padding: 12px 8px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background 0.15s;
    }
    .element-type-item:hover { background: #f5f5f5; }
    .element-type-item:last-child { border-bottom: none; }

    /* ═══ Toast ═══ */
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      padding: 10px 24px; background: #333; color: #fff;
      border-radius: 6px; font-size: 14px; z-index: 9000;
      animation: toastIn 0.3s ease;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }

    /* ═══ Price element ═══ */
    .el-price {
      display: flex; align-items: center; gap: 4px;
      width: 100%; padding: 4px; word-break: break-word;
      color: #333; font-size: 13px;
    }
    .el-price .price-icon { color: #ff6d00; flex-shrink: 0; }

    .product-binding { margin-bottom: 16px; }
    .binding-info {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; background: #e8f5e9; border-radius: 6px;
      margin-bottom: 8px; font-size: 13px; color: #2e7d32;
    }
    .binding-icon { flex-shrink: 0; color: #43a047; }
    .binding-name { font-weight: 500; }
    .binding-size { font-weight: 400; color: #558b2f; }
    .binding-empty {
      padding: 10px 12px; background: #fff3e0; border-radius: 6px;
      margin-bottom: 8px; font-size: 13px; color: #e65100;
    }
    .btn-select-product {
      width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: #fff; color: #448aff; font-size: 13px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .btn-select-product:hover { background: #e3f2fd; border-color: #448aff; }

    /* ═══ Product navigator ═══ */
    .navigator-list { display: flex; flex-direction: column; margin-top: 8px; }
    .navigator-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 8px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background 0.15s;
    }
    .navigator-item:hover { background: #f5f5f5; }
    .navigator-item:last-child { border-bottom: none; }
    .nav-icon-folder { color: #ff9800; }
    .nav-icon-product { color: #448aff; }
    .nav-item-name { flex: 1; }
    .nav-chevron { color: #bdbdbd; }
    .nav-breadcrumbs {
      display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
      margin-bottom: 8px; font-size: 12px;
    }
    .btn-nav-back {
      display: flex; align-items: center; gap: 6px;
      width: 100%; height: 34px; border: none; border-radius: 4px;
      background: #f5f5f5; color: #757575; font-size: 13px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer;
      transition: background 0.15s; margin-top: 8px; padding: 0 12px;
    }
    .btn-nav-back:hover { background: #eeeeee; color: #333; }
    .navigator-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 32px 0; color: #bdbdbd; font-size: 14px;
    }
    .empty-icon { color: #e0e0e0; }
    .nav-product-title {
      font-size: 14px; font-weight: 500; color: #333;
      padding: 4px 0 8px; border-bottom: 1px solid #e0e0e0;
    }

    /* ═══ Order items table preview ═══ */
    .el-order-table {
      display: flex; flex-direction: column;
      width: 100%; height: 100%; overflow: hidden;
      font-family: Roboto, sans-serif;
    }
    .order-table-header {
      display: flex; align-items: center;
      padding: 0 4px; flex-shrink: 0;
      font-weight: 600;
    }
    .order-table-row {
      display: flex; align-items: center;
      padding: 0 4px;
      border-bottom: 1px solid #e0e0e0;
    }
    .order-col-name { flex: 3; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 2px; }
    .order-col-qty { flex: 1; text-align: center; padding: 0 2px; }
    .order-col-status { flex: 2; text-align: center; padding: 0 2px; }
    .order-col-name[style*="width"], .order-col-qty[style*="width"], .order-col-status[style*="width"] { flex: none; }
    .order-complete-msg {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 100%; height: 100%; gap: 8px; font-size: 18px; font-weight: 600; color: #4caf50;
    }

    /* ═══ canvas-with-emulation wrapper ═══ */
    .canvas-with-emulation {
      flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
    }

    /* ═══ B: Two Zones ═══ */
    .el-order-zones {
      display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; font-family: Roboto, sans-serif;
    }
    .zones-section { display: flex; flex-direction: column; }
    .zones-section-header {
      padding: 4px 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    }
    .zones-ready-header { background: #e8f5e9; color: #2e7d32; }
    .zones-pending-header { background: #fff3e0; color: #e65100; }
    .zones-icon { margin-right: 4px; }
    .zones-row {
      display: flex; align-items: center; padding: 2px 6px; font-size: 12px; border-bottom: 1px solid #eee;
    }
    .zones-row-ready { background: #f1f8e9; }
    .zones-row-pending { background: #fff8e1; }
    .zones-check { color: #4caf50; margin-right: 4px; font-weight: 600; }
    .zones-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .zones-qty { color: #757575; font-size: 11px; margin-left: 4px; }
    .zones-empty { padding: 6px; font-size: 11px; color: #9e9e9e; text-align: center; }
    .zones-all-ready {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px; font-size: 14px; font-weight: 600; color: #4caf50; background: #e8f5e9;
    }
    .zones-all-ready-icon { font-size: 18px; }

    /* ═══ C: Progress ═══ */
    .el-order-progress {
      display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; font-family: Roboto, sans-serif;
    }
    .progress-hero { display: flex; align-items: center; justify-content: center; padding: 6px 0; flex-shrink: 0; }
    .progress-circle { position: relative; width: 64px; height: 64px; }
    .progress-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .progress-track { fill: none; stroke: #e0e0e0; stroke-width: 6; }
    .progress-fill { fill: none; stroke: #4caf50; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.5s; }
    .progress-text {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center;
    }
    .progress-pct { font-size: 14px; font-weight: 700; color: #333; }
    .progress-count { font-size: 9px; color: #9e9e9e; }
    .progress-list { flex: 1; overflow: hidden; }
    .progress-item {
      display: flex; align-items: center; gap: 4px; padding: 2px 6px; font-size: 12px; border-bottom: 1px solid #f0f0f0;
    }
    .progress-item.ready { background: #f1f8e9; }
    .progress-marker { width: 14px; text-align: center; font-size: 11px; color: #bdbdbd; }
    .progress-marker.ready { color: #4caf50; }
    .progress-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .progress-qty { color: #757575; font-size: 11px; }
    .progress-status { font-size: 10px; font-weight: 500; color: #c62828; min-width: 50px; text-align: right; }
    .progress-status.ready { color: #2e7d32; }

    /* ═══ D: Checklist ═══ */
    .el-order-checklist {
      display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; font-family: Roboto, sans-serif;
    }
    .checklist-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 6px; font-size: 12px; font-weight: 600; color: #333; border-bottom: 1px solid #e0e0e0;
    }
    .checklist-counter { font-size: 11px; color: #4caf50; }
    .checklist-items { flex: 1; overflow: hidden; }
    .checklist-row {
      display: flex; align-items: center; gap: 4px; padding: 3px 6px; font-size: 12px; border-bottom: 1px solid #f0f0f0;
    }
    .checklist-row.ready { background: #f1f8e9; }
    .checklist-marker { width: 16px; text-align: center; font-size: 12px; color: #bdbdbd; }
    .checklist-marker.ready { color: #4caf50; }
    .checklist-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .checklist-name.ready { text-decoration: line-through; color: #9e9e9e; }
    .checklist-qty { color: #757575; font-size: 11px; }
    .checklist-done {
      display: flex; align-items: center; justify-content: center; padding: 8px;
      font-size: 13px; font-weight: 600; color: #4caf50; background: #e8f5e9;
    }

    /* ═══ E: Cards/Tiles ═══ */
    .el-order-cards {
      display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; font-family: Roboto, sans-serif;
    }
    .cards-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 6px; font-size: 12px; font-weight: 600; color: #333; border-bottom: 1px solid #e0e0e0;
    }
    .cards-counter { font-size: 11px; color: #757575; }
    .cards-grid {
      flex: 1; display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; overflow: hidden;
      align-content: flex-start;
    }
    .card-tile {
      width: calc(50% - 2px); border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .card-tile.ready { border-color: #4caf50; }
    .card-status-bar {
      padding: 2px 4px; font-size: 9px; font-weight: 700; text-align: center;
      background: #fff3e0; color: #e65100; letter-spacing: 0.3px;
    }
    .card-status-bar.ready { background: #e8f5e9; color: #2e7d32; }
    .card-body {
      display: flex; align-items: center; justify-content: space-between;
      padding: 3px 4px; font-size: 11px;
    }
    .card-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-qty { color: #757575; font-size: 10px; margin-left: 4px; }

    /* ═══ Emulation Panel ═══ */
    .emulation-panel {
      border-top: 2px solid #ff6d00; background: #263238; flex-shrink: 0;
      transition: max-height 0.3s ease;
    }
    .emulation-panel.collapsed { }
    .emulation-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; font-size: 14px; font-weight: 600; color: #fff;
      cursor: pointer; user-select: none;
    }
    .emulation-header:hover { background: rgba(255,255,255,0.05); }
    .emulation-badge {
      background: #ff6d00; color: #fff; font-size: 11px; padding: 1px 8px;
      border-radius: 10px; font-weight: 600;
    }
    .emulation-body { padding: 10px 14px 14px; }
    .emulation-order-info {
      font-size: 12px; color: #90a4ae; margin-bottom: 8px;
    }
    .emulation-order-info strong { color: #ff6d00; }
    .emulation-table {
      width: 100%; border-collapse: collapse; font-size: 13px; color: #eceff1; margin-bottom: 10px;
    }
    .emulation-table thead th {
      text-align: left; padding: 4px 8px; font-weight: 600; font-size: 11px;
      color: #90a4ae; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 1px solid #37474f;
    }
    .emu-th-name { width: 45%; }
    .emu-th-qty { width: 15%; text-align: center; }
    .emu-th-status { width: 40%; }
    .emulation-table tbody tr {
      border-bottom: 1px solid #37474f; transition: background 0.15s;
    }
    .emulation-table tbody tr:hover { background: rgba(255,255,255,0.03); }
    .emulation-table tbody tr.emu-ready { background: rgba(76,175,80,0.1); }
    .emu-td-name { padding: 5px 8px; }
    .emu-td-qty { padding: 5px 8px; text-align: center; }
    .emu-td-status { padding: 5px 8px; }
    .emu-select {
      width: 100%; height: 28px; padding: 0 6px; border: 1px solid #455a64;
      border-radius: 4px; background: #37474f; color: #eceff1;
      font-size: 12px; font-family: Roboto, sans-serif; cursor: pointer;
    }
    .emu-select:focus { outline: none; border-color: #ff6d00; }
    .emu-s-ready { border-color: #4caf50; }
    .emu-s-cooking { border-color: #ff9800; }
    .emu-s-waiting { border-color: #455a64; }
    .emulation-actions {
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .emu-btn {
      height: 30px; padding: 0 12px; border: 1px solid #455a64; border-radius: 4px;
      background: #37474f; color: #eceff1; font-size: 12px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s;
      white-space: nowrap;
    }
    .emu-btn:hover { background: #455a64; border-color: #ff6d00; }
    .emu-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class ArrivalsControlEditorScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);

  control: ArrivalsControl = {
    id: 0,
    name: 'Новый контрол',
    statusType: 'delivery',
    elements: [],
  };

  // Tool panel
  toolPanelOpen = false;
  showBorders = false;
  snapToGrid = false;
  snapToObjects = false;

  // Status management
  highlightedStatuses = new Set<string>();

  panelView: PanelView = 'control';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 1.0;

  // Drag & resize state
  dragState: {
    elementId: string;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
  } | null = null;

  resizeState: {
    elementId: string;
    handle: string;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
    startElW: number;
    startElH: number;
  } | null = null;

  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);

  openSections = new Set<string>();

  elementTypes: ElementTypeOption[] = [
    { type: 'text', label: 'Текст' },
    { type: 'image', label: 'Изображение' },
    { type: 'order-number', label: 'Номер заказа' },
    { type: 'table-number', label: 'Номер стола' },
    { type: 'order-status', label: 'Статус заказа' },
    { type: 'cooking-start-time', label: 'Время начала приготовления заказа' },
    { type: 'cooking-end-time', label: 'Время завершения приготовления заказа' },
    { type: 'system-cooking-time', label: 'Системное время приготовления заказа' },
    { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа' },
    { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания' },
    { type: 'client-name', label: 'Имя клиента' },
    { type: 'client-phone', label: 'Номер телефона клиента' },
    { type: 'courier-name', label: 'Имя назначенного курьера' },
    { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа' },
    { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки' },
    { type: 'dispatch-time', label: 'Время отправки заказа' },
    { type: 'travel-time', label: 'Время в пути' },
    { type: 'delivery-time', label: 'Время доставки заказа' },
    { type: 'delivery-status', label: 'Статус доставки' },
    { type: 'client-comment', label: 'Комментарий от клиента' },
    { type: 'client-delivery-time', label: 'Время доставки, обозначенное клиентом' },
    { type: 'cancel-reason', label: 'Причина отмены заказа' },
    { type: 'cancel-comment', label: 'Комментарий к отмене заказа' },
    { type: 'cancel-time', label: 'Время отмены заказа' },
    { type: 'external-data', label: 'Внешние данные' },
    { type: 'order-items', label: 'A. Состав заказа — Таблица' },
    { type: 'order-items-zones', label: 'B. Состав заказа — Две зоны' },
    { type: 'order-items-progress', label: 'C. Состав заказа — Прогресс' },
    { type: 'order-items-checklist', label: 'D. Состав заказа — Чеклист' },
    { type: 'order-items-cards', label: 'E. Состав заказа — Карточки' },
  ];

  orderMockItems = [
    { name: 'Шашлык из свинины', qty: 2, status: 'Готово', ready: true },
    { name: 'Салат Цезарь', qty: 1, status: 'Готово', ready: true },
    { name: 'Стейк Рибай', qty: 1, status: 'Готовится', ready: false },
    { name: 'Картофель фри', qty: 3, status: 'Ожидает', ready: false },
  ];

  get currentStatuses(): string[] {
    switch (this.control.statusType) {
      case 'kitchen': return KITCHEN_STATUSES;
      case 'delivery': return DELIVERY_STATUSES;
      case 'balancer': return BALANCER_STATUSES;
      default: return DELIVERY_STATUSES;
    }
  }

  get selectedElement(): ArrivalsThemeElement | null {
    if (!this.selectedElementId) return null;
    return this.control.elements.find(e => e.id === this.selectedElementId) ?? null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const numId = Number(id);
      const allControls: ArrivalsControl[] = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
      const found = allControls.find(c => c.id === numId);
      if (found) {
        this.control = JSON.parse(JSON.stringify(found));
        if (!this.control.elements) {
          this.control.elements = [];
        }
      }
    } else {
      this.control.id = Date.now();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.stopScenario();
  }

  onStatusTypeChange(value: ArrivalsControlStatusType): void {
    this.control.statusType = value;
    this.highlightedStatuses = new Set<string>();
  }

  trackByIndex(index: number): number {
    return index;
  }

  getElementTypeLabel(type: string): string {
    return this.elementTypes.find(et => et.type === type)?.label ?? type;
  }

  getFilteredOrderItems(el: ArrivalsThemeElement): { name: string; qty: number; status: string; ready: boolean }[] {
    if (el.orderDisplayMode === 'ready-only') {
      return this.orderMockItems.filter(i => i.ready);
    }
    return this.orderMockItems;
  }

  allOrderItemsReady(el: ArrivalsThemeElement): boolean {
    const items = this.getFilteredOrderItems(el);
    return items.length > 0 && items.every(i => i.ready);
  }

  getStatusColor(el: ArrivalsThemeElement, item: { ready: boolean }): string {
    if (el.orderStatusFontColor && el.orderStatusFontColor !== '#333333') {
      return el.orderStatusFontColor;
    }
    return item.ready ? '#2e7d32' : '#c62828';
  }

  toggleStatusHighlight(status: string): void {
    if (this.highlightedStatuses.has(status)) {
      this.highlightedStatuses.delete(status);
    } else {
      this.highlightedStatuses.add(status);
    }
  }

  onCanvasClick(): void {
    if (this.dragState || this.resizeState) return;
    this.deselectElement();
  }

  /* ── Drag ── */

  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.classList.contains('handle')) return;

    event.preventDefault();
    event.stopPropagation();
    this.selectedElementId = el.id;
    this.panelView = 'element';

    this.dragState = {
      elementId: el.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElX: el.x,
      startElY: el.y,
    };

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Resize ── */

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.resizeState = {
      elementId: el.id,
      handle,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElX: el.x,
      startElY: el.y,
      startElW: el.width,
      startElH: el.height,
    };

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Shared mouse handlers ── */

  private onDocMouseMove(event: MouseEvent): void {
    const scale = this.canvasScale;
    if (this.dragState) {
      const dx = (event.clientX - this.dragState.startMouseX) / scale;
      const dy = (event.clientY - this.dragState.startMouseY) / scale;
      const el = this.control.elements.find(e => e.id === this.dragState!.elementId);
      if (el) {
        el.x = Math.max(0, Math.round(this.dragState.startElX + dx));
        el.y = Math.max(0, Math.round(this.dragState.startElY + dy));
      }
    }

    if (this.resizeState) {
      const dx = (event.clientX - this.resizeState.startMouseX) / scale;
      const dy = (event.clientY - this.resizeState.startMouseY) / scale;
      const el = this.control.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const h = this.resizeState.handle;
        const minSize = 20;

        if (h.includes('r')) {
          el.width = Math.max(minSize, Math.round(this.resizeState.startElW + dx));
        }
        if (h.includes('l')) {
          const newW = Math.max(minSize, Math.round(this.resizeState.startElW - dx));
          el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - newW));
          el.width = newW;
        }

        if (h.includes('b')) {
          el.height = Math.max(minSize, Math.round(this.resizeState.startElH + dy));
        }
        if (h.includes('t')) {
          const newH = Math.max(minSize, Math.round(this.resizeState.startElH - dy));
          el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - newH));
          el.height = newH;
        }
      }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null;
    this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  selectElement(id: string, event: Event): void {
    event.stopPropagation();
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  selectElementFromList(id: string): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  deselectElement(): void {
    this.selectedElementId = null;
    this.panelView = 'control';
  }

  addElement(type: ArrivalsElementType): void {
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    const el: ArrivalsThemeElement = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      type,
      name: label,
      x: 20 + this.control.elements.length * 20,
      y: 20 + this.control.elements.length * 20,
      width: 120,
      height: 60,
      borderWidth: 1,
      borderColor: '#000000',
      borderRadius: 0,
    };

    if (type === 'text') {
      el.text = 'Type something';
      el.fontFamily = 'Arial';
      el.fontSize = 14;
      el.fontBold = false;
      el.fontItalic = false;
      el.textAlign = 'left';
    }

    if (type === 'order-items') {
      el.width = 400;
      el.height = 200;
      el.orderDisplayMode = 'all';
      el.orderTriggerStatus = '';
      el.orderHideOnComplete = false;
      el.orderShowName = true;
      el.orderShowQty = true;
      el.orderShowStatus = true;
      el.orderNameColWidth = 150;
      el.orderQtyColWidth = 50;
      el.orderStatusColWidth = 80;
      el.orderShowHeader = true;
      el.orderHeaderBg = '#333333';
      el.orderHeaderHeight = 36;
      el.orderShowNameLabel = true;
      el.orderShowQtyLabel = true;
      el.orderShowStatusLabel = true;
      el.orderNameLabel = 'Наименование';
      el.orderQtyLabel = 'Кол-во';
      el.orderStatusLabel = 'Статус';
      el.orderRowHeight = 32;
      el.orderReadyColor = '#e8f5e9';
      el.orderNotReadyColor = '#ffffff';
      el.orderHeaderFontSize = 14;
      el.orderHeaderFontFamily = 'Roboto';
      el.orderHeaderFontColor = '#ffffff';
      el.orderNameFontSize = 14;
      el.orderNameFontFamily = 'Roboto';
      el.orderNameFontColor = '#333333';
      el.orderQtyFontSize = 14;
      el.orderQtyFontFamily = 'Roboto';
      el.orderQtyFontColor = '#333333';
      el.orderStatusFontSize = 14;
      el.orderStatusFontFamily = 'Roboto';
      el.orderStatusFontColor = '#333333';
    }

    if (type === 'order-items-zones' || type === 'order-items-progress' ||
        type === 'order-items-checklist' || type === 'order-items-cards') {
      el.width = 400;
      el.height = 260;
    }

    if (type === 'order-items-zones') {
      el.zonesReadyBg = '#e8f5e9';
      el.zonesPendingBg = '#fff3e0';
      el.zonesReadyHeaderText = 'МОЖНО ЗАБРАТЬ';
      el.zonesPendingHeaderText = 'ГОТОВИТСЯ';
      el.zonesShowAllReadyMsg = true;
      el.zonesItemFontSize = 12;
      el.zonesHeaderFontSize = 11;
    }

    if (type === 'order-items-progress') {
      el.progressCircleColor = '#4caf50';
      el.progressTrackColor = '#e0e0e0';
      el.progressShowPercent = true;
      el.progressShowCount = true;
      el.progressCircleSize = 64;
      el.progressItemFontSize = 12;
    }

    if (type === 'order-items-checklist') {
      el.checklistStrikethrough = true;
      el.checklistShowCounter = true;
      el.checklistReadyBg = '#f1f8e9';
      el.checklistDoneText = 'Заказ полностью готов';
      el.checklistItemFontSize = 12;
    }

    if (type === 'order-items-cards') {
      el.cardsPerRow = 2;
      el.cardsReadyBorderColor = '#4caf50';
      el.cardsReadyBg = '#e8f5e9';
      el.cardsPendingBg = '#fff3e0';
      el.cardsGap = 4;
      el.cardsItemFontSize = 11;
    }

    this.control.elements.push(el);
    this.selectedElementId = el.id;
    this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void {
    event.stopPropagation();
    this.deleteElementTarget = el;
  }

  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.control.elements = this.control.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) {
        this.deselectElement();
      }
      this.deleteElementTarget = null;
    }
  }

  toggleSection(key: string): void {
    if (this.openSections.has(key)) {
      this.openSections.delete(key);
    } else {
      this.openSections.add(key);
    }
  }

  isSectionOpen(key: string): boolean {
    return this.openSections.has(key);
  }

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image', 'order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards'].includes(type);
  }

  // ═══ Emulation panel state ═══
  emulationOpen = false;
  scenarioRunning = false;
  private scenarioTimer: any = null;

  private readonly extraDishes = [
    'Том ям', 'Маргарита', 'Борщ', 'Филе лосося', 'Паста Карбонара',
    'Греческий салат', 'Куриные крылья', 'Тирамису',
  ];

  isOrderVariant(type: ArrivalsElementType): boolean {
    return ['order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards'].includes(type);
  }

  getReadyItems(): { name: string; qty: number; status: string; ready: boolean }[] {
    return this.orderMockItems.filter(i => i.ready);
  }

  getPendingItems(): { name: string; qty: number; status: string; ready: boolean }[] {
    return this.orderMockItems.filter(i => !i.ready);
  }

  getReadyPercent(): number {
    if (this.orderMockItems.length === 0) return 0;
    return Math.round((this.getReadyItems().length / this.orderMockItems.length) * 100);
  }

  getProgressDash(): string {
    const r = 34;
    const c = 2 * Math.PI * r;
    return `${c}`;
  }

  getProgressOffset(): string {
    const r = 34;
    const c = 2 * Math.PI * r;
    const pct = this.getReadyPercent() / 100;
    return `${c * (1 - pct)}`;
  }

  onEmulationStatusChange(index: number, newStatus: string): void {
    this.orderMockItems[index].status = newStatus;
    this.orderMockItems[index].ready = newStatus === 'Готово';
  }

  setAllReady(): void {
    this.orderMockItems.forEach(item => {
      item.status = 'Готово';
      item.ready = true;
    });
  }

  resetEmulation(): void {
    this.stopScenario();
    this.orderMockItems = [
      { name: 'Шашлык из свинины', qty: 2, status: 'Готово', ready: true },
      { name: 'Салат Цезарь', qty: 1, status: 'Готово', ready: true },
      { name: 'Стейк Рибай', qty: 1, status: 'Готовится', ready: false },
      { name: 'Картофель фри', qty: 3, status: 'Ожидает', ready: false },
    ];
  }

  addDish(): void {
    const available = this.extraDishes.filter(d => !this.orderMockItems.find(i => i.name === d));
    const name = available.length > 0 ? available[0] : `Блюдо #${this.orderMockItems.length + 1}`;
    this.orderMockItems.push({ name, qty: 1, status: 'Ожидает', ready: false });
  }

  removeDish(): void {
    if (this.orderMockItems.length > 1) {
      this.orderMockItems.pop();
    }
  }

  runScenario(): void {
    if (this.scenarioRunning) {
      this.stopScenario();
      return;
    }
    // Reset all to "Ожидает" first
    this.orderMockItems.forEach(item => {
      item.status = 'Ожидает';
      item.ready = false;
    });
    this.scenarioRunning = true;
    let step = 0;
    const totalSteps = this.orderMockItems.length * 2; // each item: waiting → cooking → ready
    const tick = () => {
      if (step >= totalSteps || !this.scenarioRunning) {
        this.scenarioRunning = false;
        return;
      }
      const itemIdx = Math.floor(step / 2);
      const phase = step % 2;
      if (itemIdx < this.orderMockItems.length) {
        if (phase === 0) {
          this.orderMockItems[itemIdx].status = 'Готовится';
          this.orderMockItems[itemIdx].ready = false;
        } else {
          this.orderMockItems[itemIdx].status = 'Готово';
          this.orderMockItems[itemIdx].ready = true;
        }
      }
      step++;
      this.scenarioTimer = setTimeout(tick, 1200);
    };
    this.scenarioTimer = setTimeout(tick, 800);
  }

  private stopScenario(): void {
    this.scenarioRunning = false;
    if (this.scenarioTimer) {
      clearTimeout(this.scenarioTimer);
      this.scenarioTimer = null;
    }
  }

  save(): void {
    const allControls: ArrivalsControl[] = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
    const idx = allControls.findIndex(c => c.id === this.control.id);
    if (idx >= 0) {
      allControls[idx] = JSON.parse(JSON.stringify(this.control));
    } else {
      allControls.push(JSON.parse(JSON.stringify(this.control)));
    }
    this.storage.save('web-screens', 'arrivals-controls', allControls);

    // Also update list if it's a new control
    const list: any[] = this.storage.load('web-screens', 'arrivals-controls-list', []);
    if (!list.find((i: any) => i.id === this.control.id)) {
      list.push({
        id: this.control.id,
        name: this.control.name,
        itemType: 'control',
        resolution: '1024x768',
        createdBy: 'Мой',
      });
      this.storage.save('web-screens', 'arrivals-controls-list', list);
    }

    this.showToast('Контрол сохранён');
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/arrivals-controls']);
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
