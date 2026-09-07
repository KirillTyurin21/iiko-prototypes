import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeElement, ArrivalsElementType } from '../../types';
import { OrderMockItem, EMU_ITEM_STATUSES } from './element-defaults';

@Component({
  selector: 'app-control-element-renderer',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <span *ngIf="element.type === 'text'" class="el-text"
      [style.font-family]="element.fontFamily"
      [style.font-size.px]="element.fontSize"
      [style.font-weight]="element.fontBold ? 'bold' : 'normal'"
      [style.font-style]="element.fontItalic ? 'italic' : 'normal'"
      [style.text-align]="element.textAlign"
    >{{ element.text || 'Type something' }}</span>

    <span *ngIf="element.type === 'image'" class="el-placeholder">
      <lucide-icon name="image" [size]="24"></lucide-icon>
    </span>

    <span *ngIf="element.type !== 'text' && element.type !== 'image' && element.type !== 'external-order-number' && !isOrderVariant(element.type)"
      class="el-placeholder-label">{{ element.name }}</span>

    <!-- ═══ External Order Number ═══ -->
    <span *ngIf="element.type === 'external-order-number'" class="el-text"
      [style.font-family]="element.fontFamily"
      [style.font-size.px]="element.fontSize"
      [style.font-weight]="element.fontBold ? 'bold' : 'normal'"
      [style.font-style]="element.fontItalic ? 'italic' : 'normal'"
      [style.text-align]="element.textAlign"
    >{{ getExternalNumberPreview(element) }}</span>

    <!-- ═══ A: Order items table ═══ -->
    <div *ngIf="element.type === 'order-items'" class="el-order-table">
      <ng-container *ngIf="!element.orderHideOnComplete || !allOrderItemsReady(element)">
        <div class="order-table-header" *ngIf="element.orderShowHeader !== false"
          [style.background]="element.orderHeaderBg || '#333333'"
          [style.height.px]="element.orderHeaderHeight || 36">
          <span *ngIf="element.orderShowName !== false" class="order-col-name"
            [style.color]="element.orderHeaderFontColor || '#fff'"
            [style.font-size.px]="element.orderHeaderFontSize || 14"
            [style.font-family]="element.orderHeaderFontFamily || 'Roboto'"
            [style.width.px]="element.orderNameColWidth || null">{{ element.orderShowNameLabel !== false ? (element.orderNameLabel || 'Наименование') : '' }}</span>
          <span *ngIf="element.orderShowQty !== false" class="order-col-qty"
            [style.color]="element.orderHeaderFontColor || '#fff'"
            [style.font-size.px]="element.orderHeaderFontSize || 14"
            [style.font-family]="element.orderHeaderFontFamily || 'Roboto'"
            [style.width.px]="element.orderQtyColWidth || null">{{ element.orderShowQtyLabel !== false ? (element.orderQtyLabel || 'Кол-во') : '' }}</span>
          <span *ngIf="element.orderShowStatus !== false" class="order-col-status"
            [style.color]="element.orderHeaderFontColor || '#fff'"
            [style.font-size.px]="element.orderHeaderFontSize || 14"
            [style.font-family]="element.orderHeaderFontFamily || 'Roboto'"
            [style.width.px]="element.orderStatusColWidth || null">{{ element.orderShowStatusLabel !== false ? (element.orderStatusLabel || 'Статус') : '' }}</span>
        </div>
        <div *ngFor="let item of getFilteredOrderItems(element)" class="order-table-row"
          [style.background]="item.ready ? (element.orderReadyColor || '#e8f5e9') : (element.orderNotReadyColor || '#ffffff')"
          [style.height.px]="element.orderRowHeight || 32"
          [style.opacity]="item.delivered ? '0.45' : '1'"
          [style.text-decoration]="item.delivered ? 'line-through' : 'none'">
          <span *ngIf="element.orderShowName !== false" class="order-col-name"
            [style.color]="element.orderNameFontColor || '#333'"
            [style.font-size.px]="element.orderNameFontSize || 14"
            [style.font-family]="element.orderNameFontFamily || 'Roboto'"
            [style.width.px]="element.orderNameColWidth || null">{{ item.name }}</span>
          <span *ngIf="element.orderShowQty !== false" class="order-col-qty"
            [style.color]="element.orderQtyFontColor || '#333'"
            [style.font-size.px]="element.orderQtyFontSize || 14"
            [style.font-family]="element.orderQtyFontFamily || 'Roboto'"
            [style.width.px]="element.orderQtyColWidth || null">{{ item.qty }}</span>
          <span *ngIf="element.orderShowStatus !== false" class="order-col-status"
            [style.color]="getStatusColor(element, item)"
            [style.font-size.px]="element.orderStatusFontSize || 14"
            [style.font-family]="element.orderStatusFontFamily || 'Roboto'"
            [style.font-weight]="item.ready ? '600' : '400'"
            [style.width.px]="element.orderStatusColWidth || null">{{ (element.orderHidePendingStatusText && !item.ready) ? '' : item.status }}</span>
        </div>
      </ng-container>
      <div *ngIf="element.orderHideOnComplete && allOrderItemsReady(element)" class="order-complete-msg">
        <lucide-icon name="check-circle" [size]="28" style="color: #4caf50"></lucide-icon>
        <span>Заказ готов</span>
      </div>
    </div>

    <!-- ═══ B: Two zones ═══ -->
    <div *ngIf="element.type === 'order-items-zones'" class="el-order-zones">
      <div class="zones-section zones-ready">
        <div class="zones-section-header zones-ready-header"
          [style.background]="element.zonesReadyBg || '#e8f5e9'"
          [style.font-size.px]="element.zonesHeaderFontSize || 11">
          <span class="zones-icon">✔</span> {{ element.zonesReadyHeaderText || 'МОЖНО ЗАБРАТЬ' }}
        </div>
        <div *ngFor="let item of getReadyItems()" class="zones-row zones-row-ready"
          [style.background]="element.zonesReadyBg || '#f1f8e9'"
          [style.font-size.px]="element.zonesItemFontSize || 12">
          <span class="zones-check">✔</span>
          <span class="zones-name">{{ item.name }}</span>
          <span class="zones-qty">×{{ item.qty }}</span>
        </div>
        <div *ngIf="getReadyItems().length === 0" class="zones-empty">Нет готовых блюд</div>
      </div>
      <div class="zones-section zones-pending" *ngIf="getPendingItems().length > 0">
        <div class="zones-section-header zones-pending-header"
          [style.background]="element.zonesPendingBg || '#fff3e0'"
          [style.font-size.px]="element.zonesHeaderFontSize || 11">
          <span class="zones-icon">⏳</span> {{ element.zonesPendingHeaderText || 'ГОТОВИТСЯ' }}
        </div>
        <div *ngFor="let item of getPendingItems()" class="zones-row zones-row-pending"
          [style.background]="element.zonesPendingBg || '#fff8e1'"
          [style.font-size.px]="element.zonesItemFontSize || 12">
          <span class="zones-name">{{ item.name }}</span>
          <span class="zones-qty">×{{ item.qty }}</span>
        </div>
      </div>
      <div *ngIf="element.zonesShowAllReadyMsg !== false && getPendingItems().length === 0 && getReadyItems().length > 0" class="zones-all-ready">
        <span class="zones-all-ready-icon">✔</span>
        <span>Заказ полностью готов</span>
      </div>
    </div>

    <!-- ═══ C: Progress ═══ -->
    <div *ngIf="element.type === 'order-items-progress'" class="el-order-progress">
      <div class="progress-hero">
        <div class="progress-circle"
          [style.width.px]="element.progressCircleSize || 64"
          [style.height.px]="element.progressCircleSize || 64">
          <svg viewBox="0 0 80 80" class="progress-svg">
            <circle cx="40" cy="40" r="34" class="progress-track"
              [style.stroke]="element.progressTrackColor || '#e0e0e0'"></circle>
            <circle cx="40" cy="40" r="34" class="progress-fill"
              [style.stroke]="element.progressCircleColor || '#4caf50'"
              [style.stroke-dasharray]="getProgressDash()"
              [style.stroke-dashoffset]="getProgressOffset()">
            </circle>
          </svg>
          <div class="progress-text">
            <span *ngIf="element.progressShowPercent !== false" class="progress-pct">{{ getReadyPercent() }}%</span>
            <span *ngIf="element.progressShowCount !== false" class="progress-count">{{ getReadyItems().length }}/{{ orderMockItems.length }}</span>
          </div>
        </div>
      </div>
      <div class="progress-list">
        <div *ngFor="let item of orderMockItems" class="progress-item" [class.ready]="item.ready"
          [style.font-size.px]="element.progressItemFontSize || 12">
          <span class="progress-marker" [class.ready]="item.ready">{{ item.ready ? '✔' : '○' }}</span>
          <span class="progress-name">{{ item.name }}</span>
          <span class="progress-qty">×{{ item.qty }}</span>
          <span class="progress-status" [class.ready]="item.ready">{{ item.status }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ D: Checklist ═══ -->
    <div *ngIf="element.type === 'order-items-checklist'" class="el-order-checklist">
      <div class="checklist-header">
        <span>Состав заказа</span>
        <span *ngIf="element.checklistShowCounter !== false" class="checklist-counter">{{ getReadyItems().length }}/{{ orderMockItems.length }} ✔</span>
      </div>
      <div class="checklist-items">
        <div *ngFor="let item of orderMockItems" class="checklist-row" [class.ready]="item.ready"
          [style.background]="item.ready ? (element.checklistReadyBg || '#f1f8e9') : 'transparent'"
          [style.font-size.px]="element.checklistItemFontSize || 12">
          <span class="checklist-marker" [class.ready]="item.ready">
            {{ item.ready ? '✔' : '○' }}
          </span>
          <span class="checklist-name"
            [class.ready]="item.ready && element.checklistStrikethrough !== false">{{ item.name }}</span>
          <span class="checklist-qty">×{{ item.qty }}</span>
        </div>
      </div>
      <div *ngIf="getReadyItems().length === orderMockItems.length" class="checklist-done">
        ✔ {{ element.checklistDoneText || 'Заказ полностью готов' }}
      </div>
    </div>

    <!-- ═══ E: Cards ═══ -->
    <div *ngIf="element.type === 'order-items-cards'" class="el-order-cards">
      <div class="cards-header">
        <span>Состав заказа</span>
        <span class="cards-counter">{{ getReadyItems().length }}/{{ orderMockItems.length }}</span>
      </div>
      <div class="cards-grid" [style.gap.px]="element.cardsGap || 4">
        <div *ngFor="let item of orderMockItems" class="card-tile"
          [class.ready]="item.ready"
          [style.width]="'calc(' + (100 / (element.cardsPerRow || 2)) + '% - ' + (element.cardsGap || 4) + 'px)'"
          [style.border-color]="item.ready ? (element.cardsReadyBorderColor || '#4caf50') : '#e0e0e0'">
          <div class="card-status-bar" [class.ready]="item.ready"
            [style.background]="item.ready ? (element.cardsReadyBg || '#e8f5e9') : (element.cardsPendingBg || '#fff3e0')"
            [style.color]="item.ready ? '#2e7d32' : '#e65100'">
            {{ item.ready ? '✔ ГОТОВО' : '⏳ ' + item.status }}
          </div>
          <div class="card-body" [style.font-size.px]="element.cardsItemFontSize || 11">
            <span class="card-name">{{ item.name }}</span>
            <span class="card-qty">×{{ item.qty }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Counter ═══ -->
    <div *ngIf="element.type === 'counter'" class="el-counter"
      [style.font-family]="element.fontFamily || 'Roboto'"
      [style.font-size.px]="element.fontSize || 14"
      [style.font-weight]="element.fontBold ? 'bold' : 'normal'"
      [style.font-style]="element.fontItalic ? 'italic' : 'normal'"
      [style.text-align]="element.textAlign || 'center'">
      <ng-container *ngIf="element.counterDisplayMode !== 'circle'">
        {{ getCounterText() }}
      </ng-container>
      <div *ngIf="element.counterDisplayMode === 'circle'" class="counter-circle-wrap">
        <div class="counter-circle"
          [style.width.px]="element.counterCircleSize || 48"
          [style.height.px]="element.counterCircleSize || 48">
          <svg viewBox="0 0 80 80" class="counter-svg">
            <circle cx="40" cy="40" r="34" class="counter-track"
              [style.stroke]="element.counterCircleTrackColor || '#e0e0e0'"></circle>
            <circle cx="40" cy="40" r="34" class="counter-fill"
              [style.stroke]="element.counterCircleColor || '#4caf50'"
              [style.stroke-dasharray]="213.6"
              [style.stroke-dashoffset]="213.6 - 213.6 * getCounterPercent() / 100"></circle>
          </svg>
          <div class="counter-circle-text">
            <span *ngIf="element.counterShowPercent" class="counter-pct">{{ getCounterPercent() }}%</span>
            <span class="counter-count">{{ getCounterMatched() }}/{{ orderMockItems.length }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ═══ A: Order items table ═══ */
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

    /* ═══ E: Cards ═══ */
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

    /* Counter */
    .el-counter {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%; font-family: Roboto, sans-serif;
    }
    .counter-circle-wrap { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .counter-circle { position: relative; }
    .counter-svg { width: 100%; height: 100%; }
    .counter-track { fill: none; stroke-width: 6; }
    .counter-fill { fill: none; stroke-width: 6; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 0.3s; }
    .counter-circle-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; flex-direction: column; align-items: center; }
    .counter-pct { display: block; font-size: inherit; font-weight: inherit; font-family: inherit; font-style: inherit; color: inherit; }
    .counter-count { display: block; font-size: inherit; font-family: inherit; font-style: inherit; color: inherit; opacity: 0.6; }
  `],
})
export class ControlElementRendererComponent {
  @Input() element!: ArrivalsThemeElement;
  @Input() orderMockItems: OrderMockItem[] = [];

  private readonly statuses = EMU_ITEM_STATUSES;

  isOrderVariant(type: ArrivalsElementType): boolean {
    return ['order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards', 'counter'].includes(type);
  }

  getFilteredOrderItems(el: ArrivalsThemeElement): (OrderMockItem & { ready: boolean })[] {
    let items = this.orderMockItems.map(item => ({
      ...item,
      ready: this.isItemReady(el, item),
    }));
    if (el.orderHideDeliveredItems) {
      items = items.filter(i => !i.delivered);
    }
    if (el.orderDisplayMode === 'ready-only') {
      items = items.filter(i => i.ready);
    }
    if (el.orderGroupReadyFirst !== false) {
      items.sort((a, b) => (a.ready === b.ready ? 0 : a.ready ? -1 : 1));
    }
    return items;
  }

  allOrderItemsReady(el: ArrivalsThemeElement): boolean {
    const items = this.orderMockItems.filter(i => !i.delivered);
    return items.length > 0 && items.every(i => this.isItemReady(el, i));
  }

  isItemReady(el: ArrivalsThemeElement, item: { status: string }): boolean {
    const triggerStatus = el.orderTriggerStatus || 'Готово';
    const triggerIdx = this.statuses.indexOf(triggerStatus);
    if (triggerIdx === -1) return false;
    const itemIdx = this.statuses.indexOf(item.status);
    return itemIdx >= triggerIdx;
  }

  getStatusColor(el: ArrivalsThemeElement, item: { ready: boolean }): string {
    if (item.ready) {
      return (el.orderReadyStatusFontColor && el.orderReadyStatusFontColor !== '#333333') ? el.orderReadyStatusFontColor : '#2e7d32';
    }
    return (el.orderPendingStatusFontColor && el.orderPendingStatusFontColor !== '#333333') ? el.orderPendingStatusFontColor : '#c62828';
  }

  getReadyItems(): OrderMockItem[] {
    return this.orderMockItems.filter(i => i.ready);
  }

  getPendingItems(): OrderMockItem[] {
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

  getCounterMatched(): number {
    const statuses = this.element.counterStatuses || ['Готово'];
    return this.orderMockItems.filter(i => {
      if (statuses.includes(i.status)) return true;
      if (statuses.includes('Готово') && (i.status === 'Выдача' || i.status === 'Подан')) return true;
      return false;
    }).length;
  }

  getCounterPercent(): number {
    if (this.orderMockItems.length === 0) return 0;
    return Math.round((this.getCounterMatched() / this.orderMockItems.length) * 100);
  }

  getCounterText(): string {
    const matched = this.getCounterMatched();
    if (this.element.counterDisplayMode === 'fraction') {
      return matched + '/' + this.orderMockItems.length;
    }
    return matched + ' из ' + this.orderMockItems.length;
  }

  getExternalNumberPreview(el: ArrivalsThemeElement): string {
    if (el.externalDemoNumber) return el.externalDemoNumber;
    const prefix = el.externalPrefix || '';
    const suffix = el.externalSuffix || '';
    const sourceMap: Record<string, string> = { front: 'FR-', kiosk: 'K-', delivery: 'DEL-', website: 'WEB-', app: 'APP-', external: 'EXT-', pickup: 'PK-' };
    const demo = el.externalSource ? (sourceMap[el.externalSource] || 'EXT-') : 'EXT-';
    return prefix + demo + '12345' + suffix;
  }
}
