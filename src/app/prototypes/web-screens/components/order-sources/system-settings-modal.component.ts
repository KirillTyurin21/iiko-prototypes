import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
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
            <button type="button" class="ds-icon-btn" (click)="requestClose()" aria-label="Закрыть" title="Закрыть">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="ssm-seg">
          <button
            type="button"
            class="ssm-seg-btn"
            [class.ssm-seg-btn--active]="activeTab === 'settings'"
            (click)="activeTab = 'settings'"
          >Настройки</button>
          <button
            type="button"
            class="ssm-seg-btn"
            [class.ssm-seg-btn--active]="activeTab === 'assignment'"
            (click)="activeTab = 'assignment'"
          >Назначение настроек</button>
        </div>

        <div class="ssm-body" *ngIf="draft">

          <!-- ═══ Вкладка: Настройки ═══ -->
          <ng-container *ngIf="activeTab === 'settings'">
            <div class="ssm-section">
              <div class="ssm-sub">
                <span class="ssm-sub-label">Настройки отображения заказов</span>
                <button type="button" class="ds-btn ds-btn--outlined" (click)="addCommonSetting()">
                  <lucide-icon name="plus" [size]="16"></lucide-icon>
                  Добавить настройку
                </button>
              </div>

              <div class="ssm-list" *ngIf="draft.commonSettings.length > 0">
                <div
                  class="ssm-list-item"
                  *ngFor="let c of draft.commonSettings"
                  [class.ssm-list-item--active]="selectedCommonId === c.id"
                  (click)="selectCommon(c.id)"
                >
                  <span class="ssm-list-name">{{ c.name }}</span>
                  <span class="ds-status" *ngIf="c.isGlobal">Сеть</span>
                  <span class="ssm-list-meta">длина {{ c.length }}{{ c.prefix ? ' · префикс «' + c.prefix + '»' : '' }}</span>
                  <button
                    type="button"
                    *ngIf="!c.isGlobal"
                    class="ds-icon-btn ds-icon-btn--danger"
                    (click)="requestDeleteCommon(c.id, $event)"
                    [attr.aria-label]="'Удалить настройку ' + c.name"
                    title="Удалить"
                  >
                    <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                  </button>
                </div>
              </div>

              <div class="ssm-selected" *ngIf="selectedCommon">
                <div class="ds-field">
                  <label class="ds-field-label">Название настройки</label>
                  <input
                    class="ds-field-input"
                    type="text"
                    [ngModel]="selectedCommon.name"
                    (ngModelChange)="onNameChange($event)"
                  />
                </div>
                <app-common-setting-fields
                  [setting]="selectedCommon"
                  [title]="selectedCommon.isGlobal ? 'Настройка по умолчанию (сеть)' : 'Параметры настройки'"
                  (changed)="markDirty()"
                ></app-common-setting-fields>
              </div>

              <div class="ssm-sub ssm-sub--mt">
                <span class="ssm-sub-label">Настройки источников</span>
                <button type="button" class="ds-btn ds-btn--outlined" (click)="pickerOpen = true">
                  <lucide-icon name="plus" [size]="16"></lucide-icon>
                  Добавить источник
                </button>
              </div>
              <app-source-settings-table
                [sourceSettings]="draft.sourceSettings"
                [sources]="sources"
                (delete)="onDeleteSourceSetting($event)"
              ></app-source-settings-table>
              <div class="ssm-hint">
                <lucide-icon name="info" [size]="14"></lucide-icon>
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
                <select class="ds-select" [(ngModel)]="massSettingId">
                  <option [ngValue]="null">{{ globalSettingName() }}</option>
                  <option *ngFor="let c of childSettings" [ngValue]="c.id">{{ c.name }}</option>
                </select>
                <button type="button" class="ds-btn ds-btn--outlined" (click)="applyToAll()">
                  Применить ко всем ресторанам
                </button>
              </div>

              <div class="ssm-table-wrap">
                <table class="ds-table">
                  <thead>
                    <tr>
                      <th class="ds-table-check">
                        <input
                          type="checkbox"
                          class="ds-check"
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
                      <td class="ds-table-check">
                        <input
                          type="checkbox"
                          class="ds-check"
                          [checked]="checkedRestaurantIds.has(r.id)"
                          (change)="toggleChecked(r.id)"
                          [attr.aria-label]="'Выбрать ресторан ' + r.name"
                        />
                      </td>
                      <td class="ssm-cell-name">{{ r.name }}</td>
                      <td>
                        <select
                          class="ds-select"
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
              </div>
              <button
                type="button"
                class="ds-btn ds-btn--outlined"
                [disabled]="checkedRestaurantIds.size === 0"
                (click)="applyToChecked()"
              >
                Применить к выбранным ({{ checkedRestaurantIds.size }})
              </button>
            </div>
          </ng-container>
        </div>

        <div class="ssm-footer">
          <button type="button" class="ds-btn ds-btn--neutral" (click)="requestClose()">Закрыть</button>
          <button type="button" class="ds-btn ds-btn--primary" (click)="confirmSave()">Сохранить</button>
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
      <div class="ssm-confirm-overlay" *ngIf="deleteCommonId !== null" (click)="deleteCommonId = null">
        <div class="ssm-confirm-card" (click)="$event.stopPropagation()">
          <h4 class="ssm-confirm-title">Удалить настройку?</h4>
          <p class="ssm-confirm-text">
            {{ deleteCommonId !== null ? 'Настройка «' + commonName(deleteCommonId) + '» будет удалена. Рестораны, которым она назначена, вернутся к настройке по умолчанию (сеть).' : '' }}
          </p>
          <div class="ssm-confirm-actions">
            <button type="button" class="ds-btn ds-btn--neutral" (click)="deleteCommonId = null">Отмена</button>
            <button type="button" class="ds-btn ds-btn--danger" (click)="confirmDeleteCommon()">Удалить</button>
          </div>
        </div>
      </div>

      <!-- Подтверждение несохранённых изменений -->
      <div class="ssm-confirm-overlay" *ngIf="unsavedOpen" (click)="unsavedCancel()">
        <div class="ssm-confirm-card" (click)="$event.stopPropagation()">
          <h4 class="ssm-confirm-title">Есть несохранённые изменения</h4>
          <p class="ssm-confirm-text">{{ unsavedText }}</p>
          <div class="ssm-confirm-actions">
            <button type="button" class="ds-btn ds-btn--neutral" (click)="unsavedDiscard()">Не сохранять</button>
            <button type="button" class="ds-btn ds-btn--neutral" (click)="unsavedCancel()">Отмена</button>
            <button type="button" class="ds-btn ds-btn--primary" (click)="unsavedSave()">Сохранить</button>
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
        z-index: 130;
        background: rgba(33, 33, 33, 0.32);
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
        max-width: 880px;
        max-height: calc(100vh - 80px);
        background: #FFFFFF;
        border-radius: 4px;
        box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.9), 0 8px 10px 0 rgba(214, 214, 214, 0.9);
        overflow: hidden;
      }
      .ssm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid #D6D6D6;
      }
      .ssm-title { margin: 0; font-size: 16px; font-weight: 500; color: #333333; }
      .ssm-header-right { display: flex; align-items: center; gap: 12px; }
      .ssm-dirty {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #EA7806;
      }
      .ssm-dirty::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }

      .ssm-seg {
        display: inline-flex;
        gap: 2px;
        margin: 12px 24px 0;
        padding: 3px;
        background: #F5F5F5;
        border-radius: 6px;
      }
      .ssm-seg-btn {
        border: none;
        background: none;
        cursor: pointer;
        padding: 7px 18px;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #616161;
        transition: background 0.15s, color 0.15s;
      }
      .ssm-seg-btn:hover { color: #333333; }
      .ssm-seg-btn--active {
        background: #FFFFFF;
        color: #448AFF;
        box-shadow: 0 1px 2px 0 rgba(33, 33, 33, 0.12);
      }

      .ssm-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 16px 24px 20px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .ssm-section { display: flex; flex-direction: column; gap: 12px; }
      .ssm-sub {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .ssm-sub--mt { margin-top: 4px; }
      .ssm-sub-label {
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #616161;
      }

      .ssm-list {
        display: flex;
        flex-direction: column;
        border: 1px solid #D6D6D6;
        border-radius: 4px;
        overflow: hidden;
      }
      .ssm-list-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 14px;
        border-bottom: 1px solid #E0E0E0;
        cursor: pointer;
        font-size: 13.5px;
        color: #333333;
      }
      .ssm-list-item:last-child { border-bottom: none; }
      .ssm-list-item:hover { background: #EBEBEB; }
      .ssm-list-item--active {
        background: #F0F5FF;
        box-shadow: inset 2px 0 0 #448AFF;
      }
      .ssm-list-name { font-weight: 500; }
      .ssm-list-meta { flex: 1; min-width: 0; font-size: 12px; color: #616161; }

      .ssm-selected { display: flex; flex-direction: column; gap: 14px; }

      .ssm-hint {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 12.5px;
        color: #616161;
      }
      .ssm-hint lucide-icon { flex: none; margin-top: 1px; }

      .ssm-mass { display: flex; align-items: center; gap: 10px; }
      .ssm-mass .ds-select { flex: 1; width: auto; min-width: 0; }

      .ssm-table-wrap { border: 1px solid #D6D6D6; border-radius: 4px; overflow: hidden; }
      .ssm-cell-name { font-weight: 500; }

      .ssm-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 24px;
        border-top: 1px solid #D6D6D6;
        background: #FFFFFF;
      }

      .ssm-confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 140;
        background: rgba(33, 33, 33, 0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .ssm-confirm-card {
        width: 100%;
        max-width: 440px;
        background: #FFFFFF;
        border-radius: 4px;
        box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.9), 0 8px 10px 0 rgba(214, 214, 214, 0.9);
        padding: 24px;
      }
      .ssm-confirm-title { margin: 0 0 8px; font-size: 16px; font-weight: 500; color: #333333; }
      .ssm-confirm-text { margin: 0 0 20px; font-size: 13.5px; color: #616161; }
      .ssm-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }

      /* ── DS-кнопки ── */
      .ds-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 36px;
        padding: 0 16px;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .ds-btn:disabled { background: #EBEBEB; color: #9E9E9E; border-color: transparent; cursor: default; }
      .ds-btn--primary { background: #448AFF; color: #FFFFFF; }
      .ds-btn--primary:hover:not(:disabled) { background: #3969D5; }
      .ds-btn--neutral { background: #FFFFFF; color: #333333; border-color: #D6D6D6; }
      .ds-btn--neutral:hover:not(:disabled) { background: #FAFAFA; }
      .ds-btn--outlined { background: #FFFFFF; color: #448AFF; border-color: #448AFF; }
      .ds-btn--outlined:hover:not(:disabled) { background: rgba(68, 138, 255, 0.06); }
      .ds-btn--danger { background: #FF5252; color: #FFFFFF; }
      .ds-btn--danger:hover:not(:disabled) { background: #F4372F; }

      /* ── Иконочная кнопка ── */
      .ds-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: none;
        color: #616161;
        cursor: pointer;
      }
      .ds-icon-btn:hover { background: #EBEBEB; }
      .ds-icon-btn--danger:hover { background: #FFF2F2; color: #FF5252; }

      /* ── Статус-бейдж ── */
      .ds-status {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #448AFF;
        background: rgba(68, 138, 255, 0.12);
      }

      /* ── Поле формы ── */
      .ds-field { display: flex; flex-direction: column; gap: 6px; }
      .ds-field-label { font-size: 12px; font-weight: 500; color: #616161; }
      .ds-field-input {
        width: 100%;
        height: 38px;
        padding: 0 12px;
        border: 1px solid #D6D6D6;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: #333333;
        background: #FFFFFF;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .ds-field-input::placeholder { color: #BDBDBD; }
      .ds-field-input:focus { border-color: #448AFF; box-shadow: 0 0 0 2px rgba(68, 138, 255, 0.16); }

      /* ── Селект ── */
      .ds-select {
        width: 100%;
        height: 38px;
        padding: 0 32px 0 12px;
        border: 1px solid #D6D6D6;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: #333333;
        background-color: #FFFFFF;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23616161' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        outline: none;
        appearance: none;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .ds-select:focus { border-color: #448AFF; box-shadow: 0 0 0 2px rgba(68, 138, 255, 0.16); }

      /* ── Таблица ── */
      .ds-table { width: 100%; border-collapse: collapse; }
      .ds-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #616161;
        background: #F0F5FF;
      }
      .ds-table td {
        padding: 12px 16px;
        border-top: 1px solid #E0E0E0;
        font-size: 13.5px;
        color: #333333;
        background: #FFFFFF;
      }
      .ds-table tbody tr:hover td { background: #EBEBEB; }
      .ds-table-check { width: 44px; text-align: center; }
      .ds-check { width: 16px; height: 16px; accent-color: #448AFF; cursor: pointer; }
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

  onNameChange(val: string): void {
    if (this.selectedCommon) {
      this.selectedCommon.name = val;
      this.markDirty();
    }
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
