import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiInputComponent,
  UiConfirmDialogComponent,
  SelectOption,
} from '@/components/ui';
import {
  NetworkOrderSourceConfig,
  CommonOrderSourceSetting,
  OrderSourceSetting,
  OrderSourceRef,
} from '../../types';
import { CommonSettingFieldsComponent } from './common-setting-fields.component';
import { SourceSettingsTableComponent } from './source-settings-table.component';
import { SourcePickerModalComponent, OrderSourceDraft } from './source-picker-modal.component';

export interface OrderSourceRestaurantInfo {
  id: number;
  name: string;
}

/**
 * Модалка «Настройки экрана Arrivals» (системные настройки раздела «Настройка терминалов»).
 * Разделы: «Настройки источника» (общая настройка, справочник общих настроек с именами,
 * единые настройки источников) + «Назначение на рестораны» (глобальная/дочерняя, массово).
 */
@Component({
  selector: 'app-system-settings-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiInputComponent,
    UiConfirmDialogComponent,
    CommonSettingFieldsComponent,
    SourceSettingsTableComponent,
    SourcePickerModalComponent,
  ],
  template: `
    <div class="ssm-overlay" *ngIf="open" (click)="onOverlayClick($event)">
      <div class="ssm-modal" role="dialog" aria-label="Настройки экрана Arrivals">
        <div class="ssm-header">
          <h3 class="ssm-title">Настройки экрана Arrivals</h3>
          <button class="ssm-close" (click)="close.emit()" aria-label="Закрыть">
            <lucide-icon name="x" [size]="18"></lucide-icon>
          </button>
        </div>

        <div class="ssm-body" *ngIf="draft">
          <!-- ═══ Настройки источника ═══ -->
          <div class="ssm-section">
            <h4 class="ssm-section-title">Настройки источника</h4>

            <div class="ssm-sub">
              <span class="ssm-sub-label">Общая настройка (сеть)</span>
              <span class="ssm-sub-hint">Действует для ресторанов без собственной настройки</span>
            </div>
            <app-common-setting-fields
              [setting]="draft.global"
              (changed)="markDirty()"
            ></app-common-setting-fields>

            <div class="ssm-sub ssm-sub--mt">
              <span class="ssm-sub-label">Общие настройки</span>
              <ui-button variant="secondary" size="sm" iconName="plus" (click)="addCommonSetting()">
                Добавить настройку
              </ui-button>
            </div>
            <div class="ssm-list" *ngIf="draft.commonSettings.length > 0">
              <div
                class="ssm-list-item"
                *ngFor="let c of draft.commonSettings"
                [class.ssm-list-item--active]="selectedCommonId === c.id"
                (click)="selectedCommonId = c.id"
              >
                <span class="ssm-list-name">{{ c.name }}</span>
                <span class="ssm-list-meta">длина {{ c.length }}{{ c.prefix ? ' · префикс «' + c.prefix + '»' : '' }}</span>
                <button
                  type="button"
                  class="ssm-list-delete"
                  (click)="requestDeleteCommon(c.id, $event)"
                  [attr.aria-label]="'Удалить настройку ' + c.name"
                  title="Удалить"
                >
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
            <div class="ssm-empty" *ngIf="draft.commonSettings.length === 0">
              Нет собственных общих настроек — используется глобальная
            </div>

            <div class="ssm-list" *ngIf="selectedCommon">
              <ui-input
                label="Название настройки"
                [value]="selectedCommon.name"
                (valueChange)="selectedCommon.name = $event; markDirty()"
              ></ui-input>
              <div class="ssm-selected-fields">
                <app-common-setting-fields
                  [setting]="selectedCommon"
                  (changed)="markDirty()"
                ></app-common-setting-fields>
              </div>
            </div>

            <div class="ssm-sub ssm-sub--mt">
              <span class="ssm-sub-label">Настройки источников</span>
              <ui-button variant="secondary" size="sm" iconName="plus" (click)="pickerOpen = true">
                Добавить источник
              </ui-button>
            </div>
            <app-source-settings-table
              [sourceSettings]="draft.sourceSettings"
              [sources]="sources"
              (delete)="onDeleteSourceSetting($event)"
            ></app-source-settings-table>
            <div class="ssm-hint">
              <lucide-icon name="info" [size]="13"></lucide-icon>
              <span>Настройка источника перекрывает общую настройку; общая применяется к остальным источникам.</span>
            </div>
          </div>

          <!-- ═══ Назначение на рестораны ═══ -->
          <div class="ssm-section">
            <h4 class="ssm-section-title">Назначение на рестораны</h4>

            <div class="ssm-sub">
              <span class="ssm-sub-label">Массовое назначение</span>
            </div>
            <div class="ssm-mass">
              <select class="ssm-select" [(ngModel)]="massSettingId">
                <option [ngValue]="null">Глобальная ({{ draft.global.name }})</option>
                <option *ngFor="let c of draft.commonSettings" [ngValue]="c.id">{{ c.name }}</option>
              </select>
              <ui-button variant="secondary" size="sm" (click)="applyToAll()">
                Применить ко всем ресторанам
              </ui-button>
            </div>

            <table class="ssm-table">
              <thead>
                <tr>
                  <th>Ресторан</th>
                  <th>Общая настройка</th>
                  <th class="ssm-check-col"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of restaurants">
                  <td class="ssm-cell-name">{{ r.name }}</td>
                  <td>
                    <select
                      class="ssm-select ssm-select--row"
                      [ngModel]="restaurantSettingId(r.id)"
                      (ngModelChange)="onRestaurantSettingChange(r.id, $event)"
                    >
                      <option [ngValue]="null">Глобальная ({{ draft.global.name }})</option>
                      <option *ngFor="let c of draft.commonSettings" [ngValue]="c.id">{{ c.name }}</option>
                    </select>
                  </td>
                  <td class="ssm-check-col">
                    <input
                      type="checkbox"
                      class="ssm-check"
                      [checked]="checkedRestaurantIds.has(r.id)"
                      (change)="toggleChecked(r.id)"
                      [attr.aria-label]="'Выбрать ресторан ' + r.name"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <ui-button
              variant="secondary"
              size="sm"
              [disabled]="checkedRestaurantIds.size === 0"
              (click)="applyToChecked()"
            >
              Применить к выбранным ({{ checkedRestaurantIds.size }})
            </ui-button>
          </div>
        </div>

        <div class="ssm-footer">
          <ui-button variant="secondary" size="sm" (click)="close.emit()">Закрыть</ui-button>
          <ui-button variant="primary" size="sm" (click)="confirmSave()">Сохранить</ui-button>
        </div>
      </div>

      <!-- Модалка: добавить настройку источника -->
      <app-source-picker-modal
        [open]="pickerOpen"
        [sources]="sources"
        (close)="pickerOpen = false"
        (confirm)="onAddSource($event)"
      ></app-source-picker-modal>

      <!-- Подтверждения -->
      <ui-confirm-dialog
        [open]="deleteCommonId !== null"
        title="Удалить общую настройку?"
        [message]="deleteCommonId !== null ? 'Настройка «' + commonName(deleteCommonId) + '» будет удалена. Рестораны, которым она назначена, вернутся к глобальной настройке.' : ''"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDeleteCommon()"
        (cancelled)="deleteCommonId = null"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [
    `
      .ssm-overlay {
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 40px 16px;
        font-family: Roboto, sans-serif;
      }
      .ssm-modal {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 860px;
        max-height: calc(100vh - 80px);
        background: var(--dt-surface-primary);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-l, 0 6px 28px 6px rgba(33,33,33,0.12));
        overflow: hidden;
      }
      .ssm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        border-bottom: 1px solid #e0e0e0;
      }
      .ssm-title { margin: 0; font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }
      .ssm-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 4px;
        background: none;
        color: var(--dt-text-secondary);
        cursor: pointer;
      }
      .ssm-close:hover { background: #ebebeb; }

      .ssm-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .ssm-section { display: flex; flex-direction: column; gap: 10px; }
      .ssm-section-title {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--dt-text-primary);
        padding-bottom: 8px;
        border-bottom: 1px solid #e0e0e0;
      }

      .ssm-sub {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .ssm-sub--mt { margin-top: 6px; }
      .ssm-sub-label {
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: var(--dt-text-secondary);
      }
      .ssm-sub-hint { font-size: 12px; color: var(--dt-text-disable); }

      .ssm-list {
        display: flex;
        flex-direction: column;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        overflow: hidden;
      }
      .ssm-list-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        font-size: 13.5px;
        color: var(--dt-text-primary);
      }
      .ssm-list-item:last-child { border-bottom: none; }
      .ssm-list-item:hover { background: #ebebeb; }
      .ssm-list-item--active {
        background: var(--dt-surface-sidebar-selected);
        box-shadow: inset 2px 0 0 var(--dt-brand-accent);
      }
      .ssm-list-name { font-weight: 500; }
      .ssm-list-meta { flex: 1; min-width: 0; font-size: 12px; color: var(--dt-text-secondary); }
      .ssm-list-delete {
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
      .ssm-list-delete:hover { background: var(--dt-brand-negative-lighter); color: var(--dt-brand-negative); }

      .ssm-selected-fields { margin-top: 10px; }
      .ssm-empty { padding: 12px; font-size: 13px; color: var(--dt-text-disable); }

      .ssm-hint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--dt-text-secondary);
      }

      .ssm-mass { display: flex; align-items: center; gap: 10px; }
      .ssm-select {
        flex: 1;
        min-width: 0;
        height: 34px;
        padding: 0 8px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: var(--dt-text-primary);
        background: var(--dt-surface-primary);
      }
      .ssm-select--row { width: 100%; }

      .ssm-table { width: 100%; border-collapse: collapse; }
      .ssm-table th {
        padding: 9px 12px;
        text-align: left;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: var(--dt-text-secondary);
        background: var(--dt-table-head);
      }
      .ssm-table td {
        padding: 8px 12px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13.5px;
        color: var(--dt-text-primary);
      }
      .ssm-cell-name { font-weight: 500; }
      .ssm-check-col { width: 36px; text-align: center; }
      .ssm-check { width: 15px; height: 15px; accent-color: var(--dt-brand-accent); cursor: pointer; }

      .ssm-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 20px;
        border-top: 1px solid #e0e0e0;
        background: var(--dt-surface-variant);
      }
    `,
  ],
})
export class SystemSettingsModalComponent implements OnChanges {
  @Input() open = false;
  @Input() config!: NetworkOrderSourceConfig;
  @Input() restaurants: OrderSourceRestaurantInfo[] = [];
  @Input() sources: OrderSourceRef[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NetworkOrderSourceConfig>();

  draft: NetworkOrderSourceConfig | null = null;
  selectedCommonId: string | null = null;
  massSettingId: string | null = null;
  checkedRestaurantIds = new Set<number>();
  pickerOpen = false;
  deleteCommonId: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.config) {
      const clone = JSON.parse(JSON.stringify(this.config)) as NetworkOrderSourceConfig;
      this.draft = clone;
      this.selectedCommonId = clone.commonSettings.length > 0 ? clone.commonSettings[0].id : null;
      this.massSettingId = null;
      this.checkedRestaurantIds = new Set();
      this.deleteCommonId = null;
    }
  }

  get selectedCommon(): CommonOrderSourceSetting | null {
    if (!this.draft || !this.selectedCommonId) return null;
    return this.draft.commonSettings.find(c => c.id === this.selectedCommonId) ?? null;
  }

  markDirty(): void {
    /* черновик мутируется напрямую — сохранение по кнопке */
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ssm-overlay')) {
      this.close.emit();
    }
  }

  /* ── Общие настройки (дочерние) ── */

  addCommonSetting(): void {
    if (!this.draft) return;
    const idx = this.draft.commonSettings.length + 1;
    const clone: CommonOrderSourceSetting = {
      id: 'c' + Date.now(),
      name: 'Общая настройка ' + idx,
      prefix: this.draft.global.prefix,
      length: this.draft.global.length,
      fillSymbols: this.draft.global.fillSymbols,
    };
    this.draft.commonSettings.push(clone);
    this.selectedCommonId = clone.id;
  }

  requestDeleteCommon(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.deleteCommonId = id;
  }

  confirmDeleteCommon(): void {
    const d = this.draft;
    const deleteId = this.deleteCommonId;
    if (!d || deleteId === null) return;
    d.commonSettings = d.commonSettings.filter(c => c.id !== deleteId);
    // Рестораны, которым была назначена удалённая настройка, возвращаются к глобальной
    d.restaurants = d.restaurants.map(r =>
      r.commonSettingId === deleteId ? { ...r, commonSettingId: null } : r
    );
    if (this.selectedCommonId === deleteId) {
      this.selectedCommonId = d.commonSettings.length > 0 ? d.commonSettings[0].id : null;
    }
    if (this.massSettingId === deleteId) this.massSettingId = null;
    this.deleteCommonId = null;
  }

  commonName(id: string | null): string {
    if (!id || !this.draft) return 'Глобальная';
    return this.draft.commonSettings.find(c => c.id === id)?.name ?? 'Глобальная';
  }

  /* ── Настройки источников ── */

  onAddSource(draft: OrderSourceDraft): void {
    if (!this.draft) return;
    const setting: OrderSourceSetting = {
      id: 's' + Date.now(),
      sourceId: draft.sourceId,
      prefix: draft.prefix,
      length: draft.length,
      fillSymbols: draft.fillSymbols,
    };
    this.draft.sourceSettings.push(setting);
    this.pickerOpen = false;
  }

  onDeleteSourceSetting(id: string): void {
    if (!this.draft) return;
    this.draft.sourceSettings = this.draft.sourceSettings.filter(s => s.id !== id);
  }

  /* ── Назначение ── */

  restaurantSettingId(restaurantId: number): string | null {
    if (!this.draft) return null;
    return this.draft.restaurants.find(r => r.restaurantId === restaurantId)?.commonSettingId ?? null;
  }

  onRestaurantSettingChange(restaurantId: number, settingId: string | null): void {
    if (!this.draft) return;
    const existing = this.draft.restaurants.find(r => r.restaurantId === restaurantId);
    if (existing) {
      existing.commonSettingId = settingId;
    } else {
      this.draft.restaurants.push({ restaurantId, commonSettingId: settingId });
    }
  }

  toggleChecked(restaurantId: number): void {
    const next = new Set(this.checkedRestaurantIds);
    if (next.has(restaurantId)) next.delete(restaurantId);
    else next.add(restaurantId);
    this.checkedRestaurantIds = next;
  }

  applyToAll(): void {
    if (!this.draft) return;
    for (const r of this.restaurants) {
      const existing = this.draft.restaurants.find(c => c.restaurantId === r.id);
      if (existing) existing.commonSettingId = this.massSettingId;
      else this.draft.restaurants.push({ restaurantId: r.id, commonSettingId: this.massSettingId });
    }
  }

  applyToChecked(): void {
    if (!this.draft) return;
    for (const id of this.checkedRestaurantIds) {
      const existing = this.draft.restaurants.find(c => c.restaurantId === id);
      if (existing) existing.commonSettingId = this.massSettingId;
      else this.draft.restaurants.push({ restaurantId: id, commonSettingId: this.massSettingId });
    }
    this.checkedRestaurantIds = new Set();
  }

  confirmSave(): void {
    if (!this.draft) return;
    this.save.emit(JSON.parse(JSON.stringify(this.draft)));
    this.close.emit();
  }
}
