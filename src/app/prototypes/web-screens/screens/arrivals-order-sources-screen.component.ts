import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import {
  UiButtonComponent,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiInputComponent,
  UiAlertComponent,
} from '@/components/ui';
import {
  NetworkOrderSourceConfig,
  CommonOrderSourceSetting,
  OrderSourceSetting,
  OrderSourceRef,
  RestaurantOrderSourceConfig,
  SoundTerminalGroupV2,
  DvArrivalsDisplay,
} from '../types';
import {
  MOCK_NETWORK_ORDER_SOURCE_CONFIG,
  MOCK_ORDER_SOURCES,
  MOCK_SOUND_TERMINAL_GROUPS_V2,
  MOCK_RMS_DISPLAYS,
} from '../data/mock-data';
import {
  OrderSourceTreeComponent,
  OrderSourceTreeNode,
} from '../components/order-sources/order-source-tree.component';
import {
  SourcePickerModalComponent,
  OrderSourceDraft,
} from '../components/order-sources/source-picker-modal.component';
import { CommonSettingFieldsComponent } from '../components/order-sources/common-setting-fields.component';
import { SourceSettingsTableComponent } from '../components/order-sources/source-settings-table.component';
import { AppliedInfoComponent } from '../components/order-sources/applied-info.component';

/**
 * «Источники заказов» (Электронная очередь).
 * Дерево заведение → терминалы → дисплеи + назначение общей настройки
 * на сеть или конкретный ресторан + выбор источника из справочника.
 */
@Component({
  selector: 'app-arrivals-order-sources-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiModalComponent,
    UiConfirmDialogComponent,
    UiInputComponent,
    UiAlertComponent,
    OrderSourceTreeComponent,
    SourcePickerModalComponent,
    CommonSettingFieldsComponent,
    SourceSettingsTableComponent,
    AppliedInfoComponent,
  ],
  template: `
    <div class="os">
      <!-- Сохранение: обратная связь -->
      <div
        class="os-feedback"
        [class.os-feedback--success]="saveSuccess"
        [class.os-feedback--error]="saveError"
        *ngIf="saveSuccess || saveError"
      >
        <lucide-icon [name]="saveSuccess ? 'check-circle-2' : 'alert-circle'" [size]="16"></lucide-icon>
        <span>{{ feedbackText }}</span>
      </div>

      <!-- Заголовок -->
      <div class="os-header">
        <h1 class="os-title">Источники заказов</h1>
        <div class="os-header-actions">
          <button class="os-save" [class.os-save--active]="hasUnsavedChanges" (click)="save()">СОХРАНИТЬ</button>
          <button class="os-info" title="Информация" aria-label="Информация">
            <lucide-icon name="info" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Загрузка -->
      <div class="os-loading" *ngIf="isLoading" aria-label="Загрузка">
        <div class="os-skeleton os-skeleton--title"></div>
        <div class="os-skeleton-row">
          <div class="os-skeleton os-skeleton--tree"></div>
          <div class="os-skeleton os-skeleton--panel"></div>
        </div>
      </div>

      <ng-container *ngIf="!isLoading">
        <div class="os-search">
          <lucide-icon name="search" [size]="15"></lucide-icon>
          <input type="text" [(ngModel)]="searchTerm" placeholder="Поиск по ресторанам / терминалам / дисплеям" />
        </div>

        <div class="os-split">
          <div class="os-tree">
            <app-order-source-tree
              [groups]="groups"
              [displaysMap]="displaysMap"
              [configs]="network.restaurants"
              [selected]="selected"
              [checkedRestaurantIds]="checkedIds"
              [searchTerm]="searchTerm"
              (select)="selectNode($event)"
              (toggleCheck)="onToggleCheck($event)"
              (apply)="massOpen = true"
            ></app-order-source-tree>
          </div>

          <div class="os-panel">
            <!-- ─── Панель: Вся сеть ─── -->
            <ng-container *ngIf="selected.kind === 'network'">
              <div class="os-panel-head">
                <div class="os-panel-head-main">
                  <span class="os-panel-icon"><lucide-icon name="building-2" [size]="18"></lucide-icon></span>
                  <div>
                    <div class="os-panel-title">Общая настройка (вся сеть)</div>
                    <div class="os-panel-sub">Действует для всех ресторанов без собственной настройки</div>
                  </div>
                </div>
              </div>

              <div class="os-panel-body">
                <ui-alert variant="info" title="Приоритет настроек" [dismissible]="false">
                  Настройка конкретного источника перекрывает общую настройку; общая применяется к остальным источникам.
                </ui-alert>

                <app-common-setting-fields
                  [setting]="network.common"
                  (changed)="markUnsaved()"
                ></app-common-setting-fields>

                <div class="os-section-head">
                  <h3 class="os-section-title">Настройки источников</h3>
                  <ui-button variant="secondary" size="sm" iconName="plus" (click)="openPicker('network')">
                    Добавить источник
                  </ui-button>
                </div>
                <app-source-settings-table
                  [sourceSettings]="network.common.sourceSettings"
                  [sources]="sources"
                  (delete)="deleteSource(network.common, $event)"
                ></app-source-settings-table>

                <div class="os-section-head os-section-head--mt">
                  <h3 class="os-section-title">Назначение на рестораны</h3>
                  <ui-button variant="secondary" size="sm" (click)="requestApplyToAll()">
                    Применить ко всем ресторанам
                  </ui-button>
                </div>
                <table class="os-table">
                  <thead>
                    <tr>
                      <th>Ресторан</th>
                      <th>Применяется</th>
                      <th class="os-table-actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let cfg of network.restaurants">
                      <td class="os-cell-name">{{ restaurantName(cfg.restaurantId) }}</td>
                      <td>
                        <span class="os-badge" [class.os-badge--own]="!cfg.usesNetwork">
                          {{ cfg.usesNetwork ? 'Сетевая' : 'Своя (длина ' + (cfg.own?.length ?? '—') + ')' }}
                        </span>
                      </td>
                      <td class="os-table-actions">
                        <button
                          type="button"
                          class="os-link-btn"
                          *ngIf="cfg.usesNetwork"
                          (click)="makeOwn(cfg.restaurantId)"
                        >
                          Сделать свои настройки
                        </button>
                        <button
                          type="button"
                          class="os-link-btn"
                          *ngIf="!cfg.usesNetwork"
                          (click)="requestReturn(cfg.restaurantId)"
                        >
                          Вернуть сетевую
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ng-container>

            <!-- ─── Панель: Ресторан ─── -->
            <ng-container *ngIf="selected.kind === 'restaurant'">
              <ng-container *ngIf="cfg(selected.restaurantId) as rcfg">
                <div class="os-panel-head">
                  <div class="os-panel-head-main">
                    <span class="os-panel-icon"><lucide-icon name="store" [size]="18"></lucide-icon></span>
                    <div>
                      <div class="os-panel-title">{{ restaurantName(selected.restaurantId) }}</div>
                      <div class="os-panel-sub">
                        {{ rcfg.usesNetwork ? 'Использует общую настройку сети' : 'Использует собственную настройку' }}
                      </div>
                    </div>
                  </div>
                  <span class="os-badge" [class.os-badge--own]="!rcfg.usesNetwork">
                    {{ rcfg.usesNetwork ? 'Сетевая' : 'Своя' }}
                  </span>
                </div>

                <div class="os-panel-body">
                  <ui-alert
                    variant="warning"
                    *ngIf="(displaysMap[selected.restaurantId] || []).length === 0"
                    title="RMS офлайн"
                    [dismissible]="false"
                  >
                    Не удалось загрузить список дисплеев ресторана.
                  </ui-alert>

                  <div class="os-mode">
                    <label class="os-radio">
                      <input
                        type="radio"
                        name="os-mode"
                        [checked]="rcfg.usesNetwork"
                        (change)="onModeChange(selected.restaurantId, true)"
                      />
                      <span>Использовать общую настройку сети</span>
                    </label>
                    <label class="os-radio">
                      <input
                        type="radio"
                        name="os-mode"
                        [checked]="!rcfg.usesNetwork"
                        (change)="onModeChange(selected.restaurantId, false)"
                      />
                      <span>Своя настройка</span>
                    </label>
                  </div>

                  <div class="os-mode-hint" *ngIf="!rcfg.usesNetwork">
                    <lucide-icon name="info" [size]="14"></lucide-icon>
                    <span>В ресторане может быть только одна общая настройка.</span>
                  </div>

                  <ng-container *ngIf="!rcfg.usesNetwork && rcfg.own">
                    <app-common-setting-fields
                      [setting]="rcfg.own"
                      (changed)="markUnsaved()"
                    ></app-common-setting-fields>

                    <div class="os-section-head">
                      <h3 class="os-section-title">Настройки источников</h3>
                      <ui-button variant="secondary" size="sm" iconName="plus" (click)="openPicker(selected.restaurantId)">
                        Добавить источник
                      </ui-button>
                    </div>
                    <app-source-settings-table
                      [sourceSettings]="rcfg.own.sourceSettings"
                      [sources]="sources"
                      (delete)="deleteSource(rcfg.own!, $event)"
                    ></app-source-settings-table>
                  </ng-container>

                  <div class="os-panel-foot" *ngIf="!rcfg.usesNetwork">
                    <ui-button variant="secondary" size="sm" (click)="requestReturn(selected.restaurantId)">
                      Вернуть сетевую настройку
                    </ui-button>
                  </div>
                </div>
              </ng-container>
            </ng-container>

            <!-- ─── Панель: Терминал ─── -->
            <ng-container *ngIf="selected.kind === 'terminal'">
              <div class="os-panel-head">
                <div class="os-panel-head-main">
                  <span class="os-panel-icon"><lucide-icon name="computer" [size]="18"></lucide-icon></span>
                  <div>
                    <div class="os-panel-title">{{ terminalName(selected.restaurantId, selected.terminalId) }}</div>
                    <div class="os-panel-sub">Ресторан: {{ restaurantName(selected.restaurantId) }}</div>
                  </div>
                </div>
              </div>

              <div class="os-panel-body">
                <app-applied-info
                  [restaurantName]="restaurantName(selected.restaurantId)"
                  [setting]="effectiveSetting(selected.restaurantId)"
                  [sources]="sources"
                ></app-applied-info>

                <div class="os-section-head">
                  <h3 class="os-section-title">Дисплеи терминала</h3>
                </div>
                <div class="os-display-list" *ngIf="(displaysMap[selected.restaurantId] || []).length > 0">
                  <button
                    type="button"
                    class="os-display-row"
                    *ngFor="let d of displaysMap[selected.restaurantId]"
                    (click)="selectNode({ kind: 'display', restaurantId: selected.restaurantId, displayId: d.id })"
                  >
                    <lucide-icon name="monitor" [size]="15"></lucide-icon>
                    <span class="os-display-row-name">{{ d.name }}</span>
                    <span class="os-display-row-theme">{{ d.themeName }}</span>
                    <span class="os-dot" [class.os-dot--on]="d.isOnline" [class.os-dot--off]="!d.isOnline"></span>
                  </button>
                </div>
                <div class="os-mode-hint" *ngIf="(displaysMap[selected.restaurantId] || []).length === 0">
                  <lucide-icon name="info" [size]="14"></lucide-icon>
                  <span>Дисплеи не найдены (RMS офлайн).</span>
                </div>
              </div>
            </ng-container>

            <!-- ─── Панель: Дисплей ─── -->
            <ng-container *ngIf="selected.kind === 'display'">
              <div class="os-panel-head">
                <div class="os-panel-head-main">
                  <span class="os-panel-icon"><lucide-icon name="monitor" [size]="18"></lucide-icon></span>
                  <div>
                    <div class="os-panel-title">{{ displayName(selected.restaurantId, selected.displayId) }}</div>
                    <div class="os-panel-sub">Ресторан: {{ restaurantName(selected.restaurantId) }}</div>
                  </div>
                </div>
                <span
                  class="os-status-pill"
                  [class.os-status-pill--on]="isDisplayOnline(selected.restaurantId, selected.displayId)"
                >
                  {{ isDisplayOnline(selected.restaurantId, selected.displayId) ? 'Онлайн' : 'Офлайн' }}
                </span>
              </div>

              <div class="os-panel-body">
                <div class="os-field-static">
                  <span class="os-field-static-label">Тема</span>
                  <span class="os-field-static-value">{{ displayTheme(selected.restaurantId, selected.displayId) }}</span>
                </div>

                <app-applied-info
                  [restaurantName]="restaurantName(selected.restaurantId)"
                  [setting]="effectiveSetting(selected.restaurantId)"
                  [sources]="sources"
                ></app-applied-info>
              </div>
            </ng-container>
          </div>
        </div>
      </ng-container>

      <!-- Модалка: добавить настройку источника -->
      <app-source-picker-modal
        [open]="pickerOpen"
        [sources]="sources"
        (close)="pickerOpen = false"
        (confirm)="onAddSource($event)"
      ></app-source-picker-modal>

      <!-- Модалка: массовое назначение -->
      <ui-modal
        *ngIf="massOpen"
        [open]="true"
        title="Применить к выбранным"
        size="sm"
        (modalClose)="massOpen = false"
      >
        <p class="text-sm text-text-secondary">
          К выбранным ресторанам ({{ checkedIds.size }}) можно применить общую настройку сети
          или сделать им собственные настройки — копию сетевой.
        </p>
        <div class="flex flex-col gap-2 mt-4">
          <ui-button variant="secondary" size="md" [fullWidth]="true" (click)="massApply('network')">
            Назначить сетевую настройку
          </ui-button>
          <ui-button variant="primary" size="md" [fullWidth]="true" (click)="massApply('copy')">
            Сделать свои настройки (копия сетевой)
          </ui-button>
        </div>
        <div modalFooter class="flex items-center justify-end gap-2">
          <ui-button variant="ghost" size="sm" (click)="massOpen = false">Отмена</ui-button>
        </div>
      </ui-modal>

      <!-- Подтверждение: вернуть сетевую -->
      <ui-confirm-dialog
        [open]="confirmReturnId !== null"
        title="Вернуть сетевую настройку?"
        [message]="confirmReturnId !== null ? 'Собственная настройка ресторана «' + restaurantName(confirmReturnId) + '» будет удалена. Ресторан вернётся к общей настройке сети.' : ''"
        confirmText="Вернуть сетевую"
        (confirmed)="confirmReturn()"
        (cancelled)="confirmReturnId = null"
      ></ui-confirm-dialog>

      <!-- Подтверждение: применить ко всем -->
      <ui-confirm-dialog
        [open]="confirmAll"
        title="Применить ко всем ресторанам?"
        message="Все рестораны будут использовать общую настройку сети. Собственные настройки будут удалены."
        confirmText="Применить"
        (confirmed)="confirmApplyToAll()"
        (cancelled)="confirmAll = false"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .os {
        animation: os-fade 0.2s ease-out;
        font-family: Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
      @keyframes os-fade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ── Feedback ── */
      .os-feedback {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        padding: 10px 14px;
        border-radius: 4px;
        font-size: 13.5px;
      }
      .os-feedback--success { background: var(--dt-brand-positive-lighter); color: var(--dt-brand-positive-darker); }
      .os-feedback--error { background: var(--dt-brand-negative-lighter); color: var(--dt-brand-negative-darker); }

      /* ── Header ── */
      .os-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .os-title { margin: 0; font-size: 22px; font-weight: 500; color: var(--dt-text-primary); }
      .os-header-actions { display: flex; align-items: center; gap: 8px; }
      .os-save {
        padding: 0 16px;
        height: 36px;
        border: none;
        border-radius: 4px;
        background: var(--dt-brand-accent);
        color: #fff;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        font-weight: 500;
        letter-spacing: 0.2px;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .os-save:hover { background: #3969d5; }
      .os-save--active { background: var(--dt-brand-warning-dark); }
      .os-info {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-primary);
        color: var(--dt-text-secondary);
        cursor: pointer;
      }
      .os-info:hover { background: #ebebeb; }

      /* ── Loading ── */
      .os-loading { display: flex; flex-direction: column; gap: 12px; }
      .os-skeleton {
        border-radius: 4px;
        background: linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: os-shimmer 1.2s ease-in-out infinite;
      }
      @keyframes os-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .os-skeleton--title { height: 28px; width: 260px; }
      .os-skeleton-row { display: flex; gap: 12px; }
      .os-skeleton--tree { height: 480px; flex: 0 0 320px; }
      .os-skeleton--panel { height: 480px; flex: 1; }

      /* ── Search ── */
      .os-search {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding: 0 12px;
        height: 36px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-primary);
        color: var(--dt-text-secondary);
      }
      .os-search input {
        flex: 1;
        border: none;
        outline: none;
        background: none;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: var(--dt-text-primary);
      }

      /* ── Split ── */
      .os-split {
        display: flex;
        flex: 1;
        min-height: 480px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-primary);
        overflow: hidden;
      }
      .os-tree {
        flex: 0 0 320px;
        max-width: 320px;
        border-right: 1px solid #d6d6d6;
        background: var(--dt-surface-variant);
        overflow-y: auto;
      }
      .os-panel { flex: 1; min-width: 0; overflow-y: auto; }

      /* ── Panel head ── */
      .os-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 20px;
        border-bottom: 1px solid #e0e0e0;
        background: var(--dt-surface-primary);
      }
      .os-panel-head-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .os-panel-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 4px;
        background: var(--dt-brand-accent-lighter);
        color: var(--dt-brand-accent);
        flex-shrink: 0;
      }
      .os-panel-title { font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
      .os-panel-sub { font-size: 12px; color: var(--dt-text-secondary); margin-top: 1px; }

      .os-panel-body { padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 16px; }

      /* ── Sections ── */
      .os-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .os-section-head--mt { margin-top: 4px; }
      .os-section-title { margin: 0; font-size: 14px; font-weight: 500; color: var(--dt-text-primary); }

      /* ── Badges / pills ── */
      .os-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 500;
        white-space: nowrap;
        background: var(--dt-brand-accent-lighter);
        color: var(--dt-brand-accent-dark);
      }
      .os-badge--own { background: var(--dt-brand-warning-lighter); color: var(--dt-brand-warning-darker); }
      .os-status-pill {
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 500;
        background: var(--dt-brand-negative-lighter);
        color: var(--dt-brand-negative-dark);
      }
      .os-status-pill--on { background: var(--dt-brand-positive-lighter); color: var(--dt-brand-positive-dark); }

      /* ── Table ── */
      .os-table { width: 100%; border-collapse: collapse; }
      .os-table th {
        padding: 10px 12px;
        text-align: left;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: var(--dt-text-secondary);
        background: var(--dt-table-head);
      }
      .os-table td {
        padding: 10px 12px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13.5px;
        color: var(--dt-text-primary);
      }
      .os-table-actions { text-align: right; white-space: nowrap; }
      .os-cell-name { font-weight: 500; }

      .os-link-btn {
        border: none;
        background: none;
        padding: 2px 4px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        color: var(--dt-brand-accent);
        cursor: pointer;
      }
      .os-link-btn:hover { text-decoration: underline; }

      /* ── Mode radio ── */
      .os-mode {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 14px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-variant);
      }
      .os-radio {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13.5px;
        color: var(--dt-text-primary);
        cursor: pointer;
      }
      .os-radio input { accent-color: var(--dt-brand-accent); margin: 0; }

      .os-mode-hint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--dt-text-secondary);
      }

      /* ── Static fields ── */
      .os-field-static {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        font-size: 13.5px;
      }
      .os-field-static-label { color: var(--dt-text-secondary); }
      .os-field-static-value { color: var(--dt-text-primary); font-weight: 500; }

      /* ── Display list ── */
      .os-display-list { display: flex; flex-direction: column; border: 1px solid #d6d6d6; border-radius: 4px; overflow: hidden; }
      .os-display-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: none;
        border-bottom: 1px solid #e0e0e0;
        background: var(--dt-surface-primary);
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: var(--dt-text-primary);
        text-align: left;
        cursor: pointer;
      }
      .os-display-row:last-child { border-bottom: none; }
      .os-display-row:hover { background: #ebebeb; }
      .os-display-row-name { font-weight: 500; }
      .os-display-row-theme { flex: 1; min-width: 0; color: var(--dt-text-secondary); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .os-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .os-dot--on { background: var(--dt-brand-positive); }
      .os-dot--off { background: var(--dt-text-disable); }

      .os-panel-foot { display: flex; justify-content: flex-end; }
    `,
  ],
})
export class ArrivalsOrderSourcesScreenComponent implements OnInit {
  private storage = inject(StorageService);

  network!: NetworkOrderSourceConfig;
  groups: SoundTerminalGroupV2[] = [];
  displaysMap: Record<number, DvArrivalsDisplay[]> = {};
  sources: OrderSourceRef[] = [];

  selected: OrderSourceTreeNode = { kind: 'network' };
  checkedIds = new Set<number>();
  searchTerm = '';

  isLoading = true;
  hasUnsavedChanges = false;
  saveSuccess = false;
  saveError = false;
  feedbackText = '';

  pickerOpen = false;
  /** Контекст добавления источника: 'network' или restaurantId */
  pickerTarget: 'network' | number = 'network';

  massOpen = false;
  confirmReturnId: number | null = null;
  confirmAll = false;

  ngOnInit(): void {
    this.sources = this.storage.load('web-screens', 'order-sources-refs', JSON.parse(JSON.stringify(MOCK_ORDER_SOURCES)));
    this.network = this.storage.load(
      'web-screens',
      'order-sources-network',
      JSON.parse(JSON.stringify(MOCK_NETWORK_ORDER_SOURCE_CONFIG))
    );
    this.groups = JSON.parse(JSON.stringify(MOCK_SOUND_TERMINAL_GROUPS_V2));
    this.displaysMap = JSON.parse(JSON.stringify(MOCK_RMS_DISPLAYS));

    // Конфиг должен существовать для каждого ресторана сети
    for (const g of this.groups) {
      if (!this.network.restaurants.some(c => c.restaurantId === g.id)) {
        this.network.restaurants.push({ restaurantId: g.id, usesNetwork: true, own: null });
      }
    }

    // Имитация загрузки
    setTimeout(() => (this.isLoading = false), 550);
  }

  /* ── Данные ── */

  restaurantName(id: number): string {
    return this.groups.find(g => g.id === id)?.name ?? 'Ресторан ' + id;
  }

  cfg(restaurantId: number): RestaurantOrderSourceConfig {
    return (
      this.network.restaurants.find(c => c.restaurantId === restaurantId) ??
      { restaurantId, usesNetwork: true, own: null }
    );
  }

  effectiveSetting(restaurantId: number): CommonOrderSourceSetting {
    const cfg = this.cfg(restaurantId);
    return !cfg.usesNetwork && cfg.own ? cfg.own : this.network.common;
  }

  sourceName(sourceId: string): string {
    return this.sources.find(s => s.id === sourceId)?.name ?? 'Неизвестный источник';
  }

  terminalName(restaurantId: number, terminalId: number): string {
    const g = this.groups.find(x => x.id === restaurantId);
    return g?.terminals.find(t => t.id === terminalId)?.name ?? 'Терминал ' + terminalId;
  }

  displayName(restaurantId: number, displayId: string): string {
    return (this.displaysMap[restaurantId] || []).find(d => d.id === displayId)?.name ?? 'Дисплей';
  }

  displayTheme(restaurantId: number, displayId: string): string {
    return (this.displaysMap[restaurantId] || []).find(d => d.id === displayId)?.themeName ?? '—';
  }

  isDisplayOnline(restaurantId: number, displayId: string): boolean {
    return (this.displaysMap[restaurantId] || []).find(d => d.id === displayId)?.isOnline ?? false;
  }

  /* ── Действия ── */

  selectNode(node: OrderSourceTreeNode): void {
    this.selected = node;
  }

  markUnsaved(): void {
    this.hasUnsavedChanges = true;
  }

  save(): void {
    this.storage.save('web-screens', 'order-sources-network', this.network);
    this.storage.save('web-screens', 'order-sources-refs', this.sources);
    this.hasUnsavedChanges = false;
    this.showFeedback(true, 'Настройки сохранены');
  }

  private showFeedback(success: boolean, text: string): void {
    this.saveSuccess = success;
    this.saveError = !success;
    this.feedbackText = text;
    setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = false;
    }, 3200);
  }

  /** «Сделать свои настройки»: ресторан получает копию сетевой настройки */
  makeOwn(restaurantId: number): void {
    const cfg = this.cfg(restaurantId);
    if (!cfg.usesNetwork) return;
    cfg.usesNetwork = false;
    cfg.own = JSON.parse(JSON.stringify(this.network.common));
    this.markUnsaved();
  }

  /** Запрос подтверждения возврата на сетевую */
  requestReturn(restaurantId: number): void {
    this.confirmReturnId = restaurantId;
  }

  confirmReturn(): void {
    if (this.confirmReturnId === null) return;
    const cfg = this.cfg(this.confirmReturnId);
    cfg.usesNetwork = true;
    cfg.own = null;
    this.confirmReturnId = null;
    this.markUnsaved();
  }

  requestApplyToAll(): void {
    this.confirmAll = true;
  }

  confirmApplyToAll(): void {
    for (const cfg of this.network.restaurants) {
      cfg.usesNetwork = true;
      cfg.own = null;
    }
    this.confirmAll = false;
    this.markUnsaved();
  }

  onModeChange(restaurantId: number, useNetwork: boolean): void {
    if (useNetwork) {
      this.requestReturn(restaurantId);
    } else {
      this.makeOwn(restaurantId);
    }
  }

  onToggleCheck(restaurantId: number): void {
    const next = new Set(this.checkedIds);
    if (next.has(restaurantId)) {
      next.delete(restaurantId);
    } else {
      next.add(restaurantId);
    }
    this.checkedIds = next;
  }

  massApply(action: 'network' | 'copy'): void {
    for (const id of this.checkedIds) {
      const cfg = this.cfg(id);
      if (action === 'network') {
        cfg.usesNetwork = true;
        cfg.own = null;
      } else {
        cfg.usesNetwork = false;
        cfg.own = JSON.parse(JSON.stringify(this.network.common));
      }
    }
    this.checkedIds = new Set();
    this.massOpen = false;
    this.markUnsaved();
  }

  openPicker(target: 'network' | number): void {
    this.pickerTarget = target;
    this.pickerOpen = true;
  }

  onAddSource(draft: OrderSourceDraft): void {
    const setting: OrderSourceSetting = {
      id: 's' + Date.now(),
      sourceId: draft.sourceId,
      prefix: draft.prefix,
      length: draft.length,
      fillSymbols: draft.fillSymbols,
    };
    if (this.pickerTarget === 'network') {
      this.network.common.sourceSettings.push(setting);
    } else {
      const cfg = this.cfg(this.pickerTarget as number);
      if (cfg.own) {
        cfg.own.sourceSettings.push(setting);
      }
    }
    this.pickerOpen = false;
    this.markUnsaved();
  }

  deleteSource(ctx: CommonOrderSourceSetting, settingId: string): void {
    ctx.sourceSettings = ctx.sourceSettings.filter(s => s.id !== settingId);
    this.markUnsaved();
  }
}
