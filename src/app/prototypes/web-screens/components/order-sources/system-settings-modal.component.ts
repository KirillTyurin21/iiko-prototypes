import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiInputComponent,
  UiConfirmDialogComponent,
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
 * Две вкладки: «Настройки» (справочник настроек отображения + источники) и
 * «Назначение настроек» (таблица ресторанов, массовое назначение). Отслеживание
 * несохранённых изменений с подтверждением при закрытии/переключении.
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
          <div class="ssm-header-right">
            <span class="ssm-dirty" *ngIf="dirty">Есть несохранённые изменения</span>
            <button class="ssm-close" (click)="requestClose()" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="ssm-tabs">
          <button
            type="button"
            class="ssm-tab"
            [class.ssm-tab--active]="activeTab === 'settings'"
            (click)="activeTab = 'settings'"
          >Настройки</button>
          <button
            type="button"
            class="ssm-tab"
            [class.ssm-tab--active]="activeTab === 'assignment'"
            (click)="activeTab = 'assignment'"
          >Назначение настроек</button>
        </div>

        <div class="ssm-body" *ngIf="draft">

          <!-- ═══ Вкладка: Настройки ═══ -->
          <ng-container *ngIf="activeTab === 'settings'">
            <div class="ssm-section">
              <div class="ssm-sub">
                <span class="ssm-sub-label">Настройки отображения заказов</span>
                <ui-button variant="secondary" size="sm" iconName="plus" (click)="addCommonSetting()">
                  Добавить настройку
                </ui-button>
              </div>
              <div class="ssm-list" *ngIf="draft.commonSettings.length > 0">
                <div
                  class="ssm-list-item"
                  *ngFor="let c of draft.commonSettings"
                  [class.ssm-list-item--active]="selectedCommonId === c.id"
                  (click)="selectCommon(c.id)"
                >
                  <span class="ssm-list-name">{{ c.name }}</span>
                  <span class="ssm-tag" *ngIf="c.isGlobal">Сеть</span>
                  <span class="ssm-list-meta">длина {{ c.length }}{{ c.prefix ? ' · префикс «' + c.prefix + '»' : '' }}</span>
                  <button
                    type="button"
                    *ngIf="!c.isGlobal"
                    class="ssm-list-delete"
                    (click)="requestDeleteCommon(c.id, $event)"
                    [attr.aria-label]="'Удалить настройку ' + c.name"
                    title="Удалить"
                  >
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>

              <div class="ssm-selected" *ngIf="selectedCommon">
                <ui-input
                  label="Название настройки"
                  [value]="selectedCommon.name"
                  (valueChange)="selectedCommon.name = $event; markDirty()"
                ></ui-input>
                <app-common-setting-fields
                  [setting]="selectedCommon"
                  [title]="selectedCommon.isGlobal ? 'Настройка по умолчанию (сеть)' : 'Параметры настройки'"
                  (changed)="markDirty()"
                ></app-common-setting-fields>
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
                <span>Настройка источника перекрывает настройку отображения; настройка отображения применяется к остальным источникам.</span>
              </div>
            </div>
          </ng-container>

          <!-- ═══ Вкладка: Назначение настроек ═══ -->
          <ng-container *ngIf="activeTab === 'assignment'">
            <div class="ssm-section">
              <div class="ssm-sub">
                <span class="ssm-sub-label">Массовое назначение</span>
              </div>
              <div class="ssm-mass">
                <select class="ssm-select" [(ngModel)]="massSettingId">
                  <option [ngValue]="null">{{ globalSettingName() }}</option>
                  <option *ngFor="let c of childSettings" [ngValue]="c.id">{{ c.name }}</option>
                </select>
                <ui-button variant="secondary" size="sm" (click)="applyToAll()">
                  Применить ко всем ресторанам
                </ui-button>
              </div>

              <table class="ssm-table">
                <thead>
                  <tr>
                    <th class="ssm-check-col">
                      <input
                        type="checkbox"
                        class="ssm-check"
                        [checked]="allChecked"
                        (change)="toggleAll($event)"
                        aria-label="Выделить все рестораны"
                      />
                    </th>
                    <th>Ресторан</th>
                    <th>Настройка отображения</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of restaurants">
                    <td class="ssm-check-col">
                      <input
                        type="checkbox"
                        class="ssm-check"
                        [checked]="checkedRestaurantIds.has(r.id)"
                        (change)="toggleChecked(r.id)"
                        [attr.aria-label]="'Выбрать ресторан ' + r.name"
                      />
                    </td>
                    <td class="ssm-cell-name">{{ r.name }}</td>
                    <td>
                      <select
                        class="ssm-select ssm-select--row"
                        [ngModel]="restaurantSettingId(r.id)"
                        (ngModelChange)="onRestaurantSettingChange(r.id, $event)"
                      >
                        <option [ngValue]="null">{{ globalSettingName() }}</option>
                        <option *ngFor="let c of childSettings" [ngValue]="c.id">{{ c.name }}</option>
                      </select>
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
          </ng-container>
        </div>

        <div class="ssm-footer">
          <ui-button variant="secondary" size="sm" (click)="requestClose()">Закрыть</ui-button>
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

      <!-- Подтверждение удаления настройки -->
      <ui-confirm-dialog
        [open]="deleteCommonId !== null"
        title="Удалить настройку?"
        [message]="deleteCommonId !== null ? 'Настройка «' + commonName(deleteCommonId) + '» будет удалена. Рестораны, которым она назначена, вернутся к настройке по умолчанию (сеть).' : ''"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDeleteCommon()"
        (cancelled)="deleteCommonId = null"
      ></ui-confirm-dialog>

      <!-- Подтверждение несохранённых изменений -->
      <div class="ssm-confirm-overlay" *ngIf="unsavedOpen" (click)="unsavedCancel()">
        <div class="ssm-confirm-card" (click)="$event.stopPropagation()">
          <h4 class="ssm-confirm-title">Есть несохранённые изменения</h4>
          <p class="ssm-confirm-text">{{ unsavedText }}</p>
          <div class="ssm-confirm-actions">
            <ui-button variant="secondary" size="sm" (click)="unsavedDiscard()">Не сохранять</ui-button>
            <ui-button variant="secondary" size="sm" (click)="unsavedCancel()">Отмена</ui-button>
            <ui-button variant="primary" size="sm" (click)="unsavedSave()">Сохранить</ui-button>
          </div>
        </div>
      </div>
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
      .ssm-header-right { display: flex; align-items: center; gap: 12px; }
      .ssm-dirty {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #f57c00;
      }
      .ssm-dirty::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
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

      .ssm-tabs {
        display: flex;
        gap: 4px;
        padding: 0 20px;
        border-bottom: 1px solid #e0e0e0;
        background: var(--dt-surface-variant);
      }
      .ssm-tab {
        border: none;
        background: none;
        cursor: pointer;
        padding: 10px 14px;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        font-weight: 500;
        color: var(--dt-text-secondary);
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
      }
      .ssm-tab:hover { color: var(--dt-text-primary); }
      .ssm-tab--active { color: var(--dt-brand-accent); border-bottom-color: var(--dt-brand-accent); }

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
      .ssm-tag {
        display: inline-flex;
        align-items: center;
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 500;
        background: #e3f2fd;
        color: var(--dt-brand-accent);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
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

      .ssm-selected { display: flex; flex-direction: column; gap: 12px; }

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

      .ssm-confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 80;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .ssm-confirm-card {
        width: 100%;
        max-width: 420px;
        background: var(--dt-surface-primary);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-l, 0 6px 28px 6px rgba(33,33,33,0.12));
        padding: 20px;
      }
      .ssm-confirm-title { margin: 0 0 8px; font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }
      .ssm-confirm-text { margin: 0 0 16px; font-size: 13.5px; color: var(--dt-text-secondary); }
      .ssm-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
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
  activeTab: 'settings' | 'assignment' = 'settings';
  selectedCommonId: string | null = null;
  massSettingId: string | null = null;
  checkedRestaurantIds = new Set<number>();
  pickerOpen = false;
  deleteCommonId: string | null = null;
  dirty = false;
  unsavedOpen = false;
  unsavedMode: 'close' | 'switch' = 'close';
  unsavedPendingSwitchId: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.config) {
      const clone = JSON.parse(JSON.stringify(this.config)) as NetworkOrderSourceConfig;
      this.draft = clone;
      const g = clone.commonSettings.find(c => c.isGlobal);
      this.selectedCommonId = g ? g.id : (clone.commonSettings.length > 0 ? clone.commonSettings[0].id : null);
      this.activeTab = 'settings';
      this.massSettingId = null;
      this.checkedRestaurantIds = new Set();
      this.pickerOpen = false;
      this.deleteCommonId = null;
      this.dirty = false;
      this.unsavedOpen = false;
      this.unsavedPendingSwitchId = null;
    }
  }

  get selectedCommon(): CommonOrderSourceSetting | null {
    if (!this.draft || !this.selectedCommonId) return null;
    return this.draft.commonSettings.find(c => c.id === this.selectedCommonId) ?? null;
  }

  get globalSetting(): CommonOrderSourceSetting | null {
    if (!this.draft) return null;
    return this.draft.commonSettings.find(c => c.isGlobal) ?? null;
  }

  get childSettings(): CommonOrderSourceSetting[] {
    if (!this.draft) return [];
    return this.draft.commonSettings.filter(c => !c.isGlobal);
  }

  get allChecked(): boolean {
    return this.restaurants.length > 0 && this.restaurants.every(r => this.checkedRestaurantIds.has(r.id));
  }

  get unsavedText(): string {
    return this.unsavedMode === 'switch'
      ? 'Сохранить изменения перед переключением на другую настройку?'
      : 'Сохранить изменения перед закрытием?';
  }

  globalSettingName(): string {
    return this.globalSetting?.name ?? 'Настройка по умолчанию (сеть)';
  }

  markDirty(): void {
    this.dirty = true;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ssm-overlay')) {
      this.requestClose();
    }
  }

  requestClose(): void {
    if (this.dirty) {
      this.unsavedMode = 'close';
      this.unsavedPendingSwitchId = null;
      this.unsavedOpen = true;
    } else {
      this.close.emit();
    }
  }

  selectCommon(id: string): void {
    if (id === this.selectedCommonId) return;
    if (this.dirty) {
      this.unsavedMode = 'switch';
      this.unsavedPendingSwitchId = id;
      this.unsavedOpen = true;
    } else {
      this.selectedCommonId = id;
    }
  }

  unsavedSave(): void {
    this.saveDraft();
    if (this.unsavedMode === 'switch' && this.unsavedPendingSwitchId) {
      this.selectedCommonId = this.unsavedPendingSwitchId;
    } else {
      this.close.emit();
    }
    this.unsavedOpen = false;
    this.unsavedPendingSwitchId = null;
  }

  unsavedDiscard(): void {
    if (this.unsavedMode === 'switch' && this.unsavedPendingSwitchId) {
      this.selectedCommonId = this.unsavedPendingSwitchId;
    } else {
      this.close.emit();
    }
    this.unsavedOpen = false;
    this.unsavedPendingSwitchId = null;
  }

  unsavedCancel(): void {
    this.unsavedOpen = false;
    this.unsavedPendingSwitchId = null;
  }

  /* ── Настройки отображения (справочник, глобальная — неудаляемая) ── */

  addCommonSetting(): void {
    if (!this.draft) return;
    const g = this.globalSetting;
    const idx = this.draft.commonSettings.length + 1;
    const clone: CommonOrderSourceSetting = {
      id: 'c' + Date.now(),
      name: 'Настройка отображения ' + idx,
      prefix: g ? g.prefix : '',
      length: g ? g.length : 5,
      fillSymbols: g ? g.fillSymbols : '',
    };
    this.draft.commonSettings.push(clone);
    this.selectedCommonId = clone.id;
    this.markDirty();
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
    // Рестораны, которым была назначена удалённая настройка, возвращаются к сетевой
    d.restaurants = d.restaurants.map(r =>
      r.commonSettingId === deleteId ? { ...r, commonSettingId: null } : r
    );
    if (this.selectedCommonId === deleteId) {
      const g = d.commonSettings.find(c => c.isGlobal);
      this.selectedCommonId = g ? g.id : (d.commonSettings.length > 0 ? d.commonSettings[0].id : null);
    }
    if (this.massSettingId === deleteId) this.massSettingId = null;
    this.deleteCommonId = null;
    this.markDirty();
  }

  commonName(id: string | null): string {
    if (!id || !this.draft) return this.globalSettingName();
    return this.draft.commonSettings.find(c => c.id === id)?.name ?? this.globalSettingName();
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
    this.markDirty();
  }

  onDeleteSourceSetting(id: string): void {
    if (!this.draft) return;
    this.draft.sourceSettings = this.draft.sourceSettings.filter(s => s.id !== id);
    this.markDirty();
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
    this.markDirty();
  }

  toggleChecked(restaurantId: number): void {
    const next = new Set(this.checkedRestaurantIds);
    if (next.has(restaurantId)) next.delete(restaurantId);
    else next.add(restaurantId);
    this.checkedRestaurantIds = next;
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.checkedRestaurantIds = new Set(this.restaurants.map(r => r.id));
    } else {
      this.checkedRestaurantIds = new Set();
    }
  }

  applyToAll(): void {
    if (!this.draft) return;
    for (const r of this.restaurants) {
      const existing = this.draft.restaurants.find(c => c.restaurantId === r.id);
      if (existing) existing.commonSettingId = this.massSettingId;
      else this.draft.restaurants.push({ restaurantId: r.id, commonSettingId: this.massSettingId });
    }
    this.markDirty();
  }

  applyToChecked(): void {
    if (!this.draft) return;
    for (const id of this.checkedRestaurantIds) {
      const existing = this.draft.restaurants.find(c => c.restaurantId === id);
      if (existing) existing.commonSettingId = this.massSettingId;
      else this.draft.restaurants.push({ restaurantId: id, commonSettingId: this.massSettingId });
    }
    this.checkedRestaurantIds = new Set();
    this.markDirty();
  }

  saveDraft(): void {
    if (!this.draft) return;
    this.save.emit(JSON.parse(JSON.stringify(this.draft)));
    this.dirty = false;
  }

  confirmSave(): void {
    if (!this.draft) return;
    this.saveDraft();
    this.close.emit();
  }
}
