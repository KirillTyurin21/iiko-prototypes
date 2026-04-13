import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsDataService } from '../cs-data.service';
import { CSRestaurant, CSTerminalV2, TerminalScreenshot } from '../cs-types';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-cs-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <!-- Toast -->
    <div
      *ngIf="showToast"
      class="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg animate-fade-in"
      [ngClass]="toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      <lucide-icon [name]="toastType === 'success' ? 'check-circle-2' : 'alert-circle'" [size]="18"></lucide-icon>
      <span>{{ toastMessage }}</span>
    </div>

    <div class="cs-page" (click)="onPageClick($event)">
      <!-- ── Toolbar ── -->
      <div class="cs-toolbar">
        <h2 class="cs-toolbar-title">Настройки экрана</h2>
        <div class="cs-toolbar-actions">
          <button class="cs-btn cs-btn-primary" (click)="save()">СОХРАНИТЬ</button>
          <button
            class="cs-btn cs-btn-outline"
            [disabled]="selectedTerminals.size === 0 || isSending"
            (click)="sendSettings()"
          >
            <lucide-icon [name]="isSending ? 'loader-2' : 'settings'" [size]="16" [class.cs-spin]="isSending"></lucide-icon>
            {{ isSending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ НАСТРОЙКИ' + (selectedTerminals.size > 0 ? ' (' + selectedTerminals.size + ')' : '') }}
          </button>
        </div>
      </div>

      <!-- ── Search row ── -->
      <div class="cs-search-row">
        <input
          type="text"
          class="cs-search-input"
          placeholder="Поиск по ресторану"
          [(ngModel)]="searchRestaurant"
        />
        <input
          type="text"
          class="cs-search-input"
          placeholder="Поиск по терминалу"
          [(ngModel)]="searchTerminal"
        />
      </div>

      <!-- ── System settings button ── -->
      <div class="cs-system-row">
        <button class="cs-btn cs-btn-green" (click)="showSystemSettingsModal = true">
          СИСТЕМНЫЕ НАСТРОЙКИ
        </button>
      </div>

      <!-- ── Accordion of restaurants ── -->
      <div class="cs-accordion" *ngFor="let restaurant of getFilteredRestaurants()">
        <!-- Accordion header -->
        <div
          class="cs-accordion-header"
          (click)="toggleRestaurant(restaurant.id)"
        >
          <span class="cs-accordion-name">
            Торг. предприятие ({{ getFilteredTerminals(restaurant).length }})
          </span>
          <div class="cs-accordion-right">
            <span class="cs-accordion-count">
              {{ getFilteredTerminals(restaurant).length }}
              {{ getTerminalWord(getFilteredTerminals(restaurant).length) }}
            </span>
            <lucide-icon
              [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'"
              [size]="20"
              class="cs-accordion-chevron"
            ></lucide-icon>
          </div>
        </div>

        <!-- Accordion content -->
        <div class="cs-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead>
                <tr>
                  <th class="cs-th cs-th-checkbox">
                    <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                      <input
                        type="checkbox"
                        class="cs-checkbox"
                        [checked]="isRestaurantSelected(restaurant)"
                        (change)="toggleSelectRestaurant(restaurant)"
                      />
                    </label>
                  </th>
                  <th class="cs-th cs-th-terminal">Кассовый аппарат</th>
                  <th class="cs-th cs-th-theme">Тема</th>
                  <th class="cs-th cs-th-multi">Кампании</th>
                  <th class="cs-th cs-th-multi">Настройки</th>
                  <th class="cs-th cs-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let terminal of getFilteredTerminals(restaurant)"
                  class="cs-row"
                >
                  <!-- Checkbox -->
                  <td class="cs-td cs-td-checkbox">
                    <label class="cs-checkbox-wrap">
                      <input
                        type="checkbox"
                        class="cs-checkbox"
                        [checked]="selectedTerminals.has(terminal.id)"
                        (change)="toggleTerminal(terminal.id)"
                      />
                    </label>
                  </td>

                  <!-- Terminal info -->
                  <td class="cs-td cs-td-terminal">
                    <div class="cs-terminal-row">
                      <lucide-icon name="monitor" [size]="18" class="cs-terminal-icon"></lucide-icon>
                      <span class="cs-terminal-name">{{ terminal.name }}</span>
                      <button class="cs-edit-name-btn" title="Переименовать" (click)="$event.stopPropagation()">
                        <lucide-icon name="pencil" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </td>

                  <!-- Theme select -->
                  <td class="cs-td cs-td-theme">
                    <div class="cs-field-cell" (click)="$event.stopPropagation()">
                      <span class="cs-field-label">Выбрать</span>
                      <div class="cs-field-dropdown">
                        <select
                          class="cs-select"
                          [ngModel]="terminal.themeId"
                          (ngModelChange)="onThemeChange(restaurant.id, terminal, $event)"
                        >
                          <option [ngValue]="null">Выбрать</option>
                          <option
                            *ngFor="let theme of dataService.themeOptions"
                            [ngValue]="theme.id"
                          >{{ theme.name }}</option>
                        </select>
                        <button
                          class="cs-clear-btn"
                          *ngIf="terminal.themeId !== null"
                          (click)="onThemeChange(restaurant.id, terminal, null); $event.stopPropagation()"
                        >
                          <lucide-icon name="x" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </td>

                  <!-- Campaigns multi-select -->
                  <td class="cs-td cs-td-multi">
                    <div class="cs-field-cell" (click)="$event.stopPropagation()">
                      <span class="cs-field-label">Выбрать</span>
                      <div class="cs-field-dropdown">
                        <button
                          class="cs-multiselect-trigger"
                          (click)="toggleDropdown(terminal.id, 'campaigns')"
                          type="button"
                        >
                          <span class="cs-multiselect-text">
                            {{ getCampaignsSummary(terminal) }}
                          </span>
                          <lucide-icon
                            [name]="isDropdownOpen(terminal.id, 'campaigns') ? 'chevron-up' : 'chevron-down'"
                            [size]="14"
                            class="cs-multiselect-chevron"
                          ></lucide-icon>
                        </button>
                        <button
                          class="cs-clear-btn"
                          *ngIf="terminal.campaignIds.length > 0"
                          (click)="clearCampaigns(restaurant.id, terminal); $event.stopPropagation()"
                        >
                          <lucide-icon name="x" [size]="14"></lucide-icon>
                        </button>
                        <div
                          class="cs-multiselect-dropdown"
                          *ngIf="isDropdownOpen(terminal.id, 'campaigns')"
                        >
                          <label
                            class="cs-multiselect-option"
                            *ngFor="let opt of dataService.campaignOptions"
                          >
                            <input
                              type="checkbox"
                              class="cs-checkbox cs-checkbox--small"
                              [checked]="terminal.campaignIds.includes(opt.id)"
                              (change)="toggleCampaign(restaurant.id, terminal, opt.id)"
                            />
                            <span>{{ opt.name }}</span>
                          </label>
                          <div *ngIf="dataService.campaignOptions.length === 0" class="cs-multiselect-empty">
                            Нет доступных кампаний
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Settings (hints) multi-select -->
                  <td class="cs-td cs-td-multi">
                    <div class="cs-field-cell" (click)="$event.stopPropagation()">
                      <span class="cs-field-label">Выбрать</span>
                      <div class="cs-field-dropdown">
                        <button
                          class="cs-multiselect-trigger"
                          (click)="toggleDropdown(terminal.id, 'hints')"
                          type="button"
                        >
                          <span class="cs-multiselect-text">
                            {{ getHintsSummary(terminal) }}
                          </span>
                          <lucide-icon
                            [name]="isDropdownOpen(terminal.id, 'hints') ? 'chevron-up' : 'chevron-down'"
                            [size]="14"
                            class="cs-multiselect-chevron"
                          ></lucide-icon>
                        </button>
                        <button
                          class="cs-clear-btn"
                          *ngIf="terminal.hintIds.length > 0"
                          (click)="clearHints(restaurant.id, terminal); $event.stopPropagation()"
                        >
                          <lucide-icon name="x" [size]="14"></lucide-icon>
                        </button>
                        <div
                          class="cs-multiselect-dropdown"
                          *ngIf="isDropdownOpen(terminal.id, 'hints')"
                        >
                          <label
                            class="cs-multiselect-option"
                            *ngFor="let opt of dataService.hintOptions"
                          >
                            <input
                              type="checkbox"
                              class="cs-checkbox cs-checkbox--small"
                              [checked]="terminal.hintIds.includes(opt.id)"
                              (change)="toggleHint(restaurant.id, terminal, opt.id)"
                            />
                            <span>{{ opt.name }}</span>
                          </label>
                          <div *ngIf="dataService.hintOptions.length === 0" class="cs-multiselect-empty">
                            Нет доступных настроек
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="cs-td cs-td-actions">
                    <button
                      class="cs-icon-btn"
                      *ngIf="terminal.supportsScreenshot && terminal.isOnline"
                      [disabled]="screenshotLoadingId === terminal.id"
                      title="Получить скриншот"
                      (click)="requestScreenshot(terminal, restaurant)"
                    >
                      <lucide-icon
                        [name]="screenshotLoadingId === terminal.id ? 'loader-2' : 'camera'"
                        [size]="18"
                        [class.cs-spin]="screenshotLoadingId === terminal.id"
                      ></lucide-icon>
                    </button>
                    <button
                      class="cs-icon-btn cs-icon-btn--add"
                      *ngIf="!terminal.supportsScreenshot || !terminal.isOnline"
                      title="Добавить"
                    >
                      <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
                    </button>
                  </td>
                </tr>

                <!-- Empty state -->
                <tr *ngIf="getFilteredTerminals(restaurant).length === 0">
                  <td colspan="6" class="cs-td-empty">
                    <div class="cs-empty-state">
                      <lucide-icon name="monitor" [size]="32" class="text-gray-300"></lucide-icon>
                      <span>Нет терминалов, соответствующих фильтру</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer: default bindings -->
          <div class="cs-default-row">
            <span class="cs-default-label">Привязка по умолчанию:</span>
            <div class="cs-default-fields">
              <div class="cs-field-cell">
                <span class="cs-field-label">Выбрать</span>
                <div class="cs-field-dropdown">
                  <select class="cs-select cs-select-sm">
                    <option>{{ getDefaultThemeName(restaurant) }}</option>
                  </select>
                  <button class="cs-clear-btn">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
              <div class="cs-field-cell">
                <span class="cs-field-label">Выбрать</span>
                <div class="cs-field-dropdown">
                  <select class="cs-select cs-select-sm">
                    <option>{{ getDefaultCampaignsSummary(restaurant) }}</option>
                  </select>
                  <button class="cs-clear-btn">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
              <div class="cs-field-cell">
                <span class="cs-field-label">Выбрать</span>
                <div class="cs-field-dropdown">
                  <select class="cs-select cs-select-sm">
                    <option>{{ getDefaultHintsSummary(restaurant) }}</option>
                  </select>
                  <button class="cs-clear-btn">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No restaurants -->
      <div *ngIf="getFilteredRestaurants().length === 0" class="cs-no-data">
        <lucide-icon name="monitor" [size]="48" class="text-gray-300"></lucide-icon>
        <p class="text-gray-500 mt-2">
          {{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет подключённых ресторанов' }}
        </p>
      </div>
    </div>

    <!-- Screenshot Modal -->
    <div class="cs-modal-overlay" *ngIf="screenshotModal" (click)="closeScreenshotModal()">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header">
          <h3 class="cs-modal-title">Скриншот экрана</h3>
          <button class="cs-icon-btn" (click)="closeScreenshotModal()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="cs-modal-body">
          <div class="cs-screenshot-image-wrap">
            <img [src]="getScreenshotUrl(screenshotModal)" [alt]="'Скриншот: ' + screenshotModal.terminalName" class="cs-screenshot-img" />
          </div>
          <div class="cs-screenshot-meta">
            <div class="cs-meta-row">
              <span class="cs-meta-label">Ресторан</span>
              <span class="cs-meta-value">{{ screenshotModal.restaurantName }}</span>
            </div>
            <div class="cs-meta-row">
              <span class="cs-meta-label">Терминал</span>
              <span class="cs-meta-value">{{ screenshotModal.terminalName }}</span>
            </div>
            <div class="cs-meta-row">
              <span class="cs-meta-label">Время снимка</span>
              <span class="cs-meta-value">{{ formatScreenshotTime(screenshotModal) }}</span>
            </div>
            <div class="cs-meta-row">
              <span class="cs-meta-label">Разрешение</span>
              <span class="cs-meta-value">{{ screenshotModal.resolution }}</span>
            </div>
          </div>
        </div>
        <div class="cs-modal-footer">
          <button class="cs-btn cs-btn-outline" (click)="closeScreenshotModal()">Закрыть</button>
        </div>
      </div>
    </div>

    <!-- System Settings Modal -->
    <div class="cs-modal-overlay" *ngIf="showSystemSettingsModal" (click)="showSystemSettingsModal = false">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header">
          <h3 class="cs-modal-title">Системные настройки</h3>
          <button class="cs-icon-btn" (click)="showSystemSettingsModal = false">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="cs-modal-body">
          <p style="color: #757575; font-size: 14px;">Настройки системного уровня будут доступны в следующей версии.</p>
        </div>
        <div class="cs-modal-footer">
          <button class="cs-btn cs-btn-outline" (click)="showSystemSettingsModal = false">Закрыть</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page ── */
    :host {
      display: block;
      min-height: 100%;
    }
    .cs-page {
      padding: 0;
      background: transparent;
      min-height: 100%;
      font-family: 'Roboto', sans-serif;
    }

    /* ── Toolbar ── */
    .cs-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .cs-toolbar-title {
      font-size: 20px;
      font-weight: 400;
      color: rgba(0,0,0,.87);
      margin: 0;
    }
    .cs-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* ── Search row ── */
    .cs-search-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .cs-search-input {
      padding: 8px 14px;
      font-size: 14px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0,0,0,.23);
      border-radius: 4px;
      background: #fff;
      color: rgba(0,0,0,.87);
      width: 220px;
      transition: border-color .15s;
    }
    .cs-search-input::placeholder {
      color: #9e9e9e;
    }
    .cs-search-input:focus {
      border-color: #1976d2;
      outline: none;
      box-shadow: 0 0 0 1px #1976d2;
    }

    /* ── System settings row ── */
    .cs-system-row {
      margin-bottom: 20px;
    }

    /* ── Buttons ── */
    .cs-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      border-radius: 4px;
      cursor: pointer;
      transition: all .15s ease;
      white-space: nowrap;
      border: 1px solid transparent;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: .3px;
    }
    .cs-btn-outline {
      background: #fff;
      color: rgba(0,0,0,.6);
      border-color: rgba(0,0,0,.23);
    }
    .cs-btn-outline:hover {
      background: #f5f5f5;
      border-color: rgba(0,0,0,.4);
    }
    .cs-btn-primary {
      background: #1976d2;
      color: #fff;
      border-color: #1976d2;
      box-shadow: 0 2px 4px rgba(25,118,210,.3);
    }
    .cs-btn-primary:hover {
      background: #1565c0;
    }
    .cs-btn-green {
      background: #4caf50;
      color: #fff;
      border-color: #4caf50;
      box-shadow: 0 2px 4px rgba(76,175,80,.3);
    }
    .cs-btn-green:hover {
      background: #43a047;
    }

    /* ── Accordion ── */
    .cs-accordion {
      background: #fff;
      border: 1px solid rgba(0,0,0,.12);
      border-radius: 4px;
      margin-bottom: 8px;
      overflow: visible;
    }
    .cs-accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      cursor: pointer;
      user-select: none;
      transition: background .15s;
    }
    .cs-accordion-header:hover {
      background: #fafafa;
    }
    .cs-accordion-name {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0,0,0,.87);
    }
    .cs-accordion-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cs-accordion-count {
      font-size: 13px;
      color: #757575;
    }
    .cs-accordion-chevron {
      color: #9e9e9e;
    }
    .cs-accordion-body {
      border-top: 1px solid rgba(0,0,0,.12);
    }

    /* ── Table ── */
    .cs-table-wrap {
      overflow: visible;
    }
    .cs-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      min-width: 900px;
    }
    .cs-th {
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #616161;
      text-align: left;
      background: #fafafa;
      border-bottom: 1px solid rgba(0,0,0,.12);
      white-space: nowrap;
    }
    .cs-th-checkbox { width: 44px; }
    .cs-th-terminal { width: 280px; }
    .cs-th-theme { width: 220px; }
    .cs-th-multi { width: 200px; }
    .cs-th-actions { width: 56px; text-align: center; }

    .cs-td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(0,0,0,.06);
      vertical-align: middle;
      font-size: 14px;
      color: rgba(0,0,0,.87);
    }
    .cs-td-checkbox { vertical-align: middle; }
    .cs-td-actions { text-align: center; vertical-align: middle; }
    .cs-td-theme { vertical-align: middle; }
    .cs-td-multi { vertical-align: middle; position: relative; }

    .cs-row { transition: background .1s; }
    .cs-row:hover { background: #f8fbff; }

    .cs-td-empty {
      padding: 40px 16px;
      text-align: center;
    }
    .cs-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #9e9e9e;
      font-size: 14px;
    }

    /* ── Terminal cell ── */
    .cs-terminal-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cs-terminal-icon {
      color: #9e9e9e;
      flex-shrink: 0;
    }
    .cs-terminal-name {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0,0,0,.87);
    }
    .cs-edit-name-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: #bdbdbd;
      border-radius: 50%;
      transition: all .15s;
    }
    .cs-edit-name-btn:hover {
      background: #f5f5f5;
      color: #757575;
    }

    /* ── Field cell (Выбрать + dropdown + clear) ── */
    .cs-field-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cs-field-label {
      font-size: 11px;
      color: #9e9e9e;
      line-height: 1;
    }
    .cs-field-dropdown {
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    }
    .cs-clear-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: #bdbdbd;
      border-radius: 50%;
      flex-shrink: 0;
      transition: all .15s;
    }
    .cs-clear-btn:hover {
      background: #f5f5f5;
      color: #757575;
    }

    /* ── Checkbox ── */
    .cs-checkbox-wrap {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .cs-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(0,0,0,.38);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      transition: all .15s;
      flex-shrink: 0;
      background: #fff;
    }
    .cs-checkbox:hover {
      border-color: #1976d2;
    }
    .cs-checkbox:checked {
      background: #1976d2;
      border-color: #1976d2;
    }
    .cs-checkbox:checked::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 5px;
      width: 5px;
      height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .cs-checkbox--small {
      width: 16px;
      height: 16px;
    }
    .cs-checkbox--small:checked::after {
      top: 0px;
      left: 4px;
      width: 4px;
      height: 8px;
    }

    /* ── Native select (theme) ── */
    .cs-select {
      flex: 1;
      min-width: 0;
      padding: 6px 28px 6px 10px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0,0,0,.2);
      border-radius: 4px;
      background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23757575'/%3E%3C/svg%3E") no-repeat right 10px center;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      color: rgba(0,0,0,.87);
      transition: border-color .15s;
    }
    .cs-select:hover {
      border-color: rgba(0,0,0,.4);
    }
    .cs-select:focus {
      border-color: #1976d2;
      outline: none;
      box-shadow: 0 0 0 1px #1976d2;
    }
    .cs-select-sm {
      padding: 5px 28px 5px 8px;
      font-size: 12px;
    }

    /* ── Multi-select ── */
    .cs-multiselect-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      min-width: 0;
      padding: 6px 10px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0,0,0,.2);
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      color: rgba(0,0,0,.87);
      text-align: left;
      transition: border-color .15s;
      gap: 4px;
    }
    .cs-multiselect-trigger:hover {
      border-color: rgba(0,0,0,.4);
    }
    .cs-multiselect-trigger:focus {
      border-color: #1976d2;
      outline: none;
      box-shadow: 0 0 0 1px #1976d2;
    }
    .cs-multiselect-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .cs-multiselect-chevron {
      color: #757575;
      flex-shrink: 0;
    }
    .cs-multiselect-dropdown {
      position: absolute;
      top: calc(100% + 2px);
      left: 0;
      right: 0;
      min-width: 200px;
      background: #fff;
      border: 1px solid rgba(0,0,0,.12);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      z-index: 30;
      max-height: 220px;
      overflow-y: auto;
      padding: 4px 0;
      animation: cs-dropdown-in .12s ease-out;
    }
    @keyframes cs-dropdown-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cs-multiselect-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: background .1s;
      color: rgba(0,0,0,.87);
    }
    .cs-multiselect-option:hover {
      background: #f5f5f5;
    }
    .cs-multiselect-empty {
      padding: 12px;
      font-size: 13px;
      color: #9e9e9e;
      text-align: center;
    }

    /* ── Icon button ── */
    .cs-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all .15s;
      color: #757575;
    }
    .cs-icon-btn:hover { background: #f5f5f5; }
    .cs-icon-btn--add { color: #9e9e9e; }
    .cs-icon-btn--add:hover { color: #616161; }

    /* ── Footer default row ── */
    .cs-default-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: #fafafa;
      border-top: 1px solid rgba(0,0,0,.06);
      font-size: 13px;
      color: #757575;
      flex-wrap: wrap;
    }
    .cs-default-label {
      font-weight: 500;
      color: rgba(0,0,0,.6);
      white-space: nowrap;
    }
    .cs-default-fields {
      display: flex;
      gap: 16px;
      flex: 1;
    }

    /* ── No data ── */
    .cs-no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 24px;
      text-align: center;
    }

    /* ── Disabled states ── */
    .cs-btn-primary:disabled {
      background: #90caf9;
      border-color: #90caf9;
      cursor: not-allowed;
    }
    .cs-btn-outline:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    /* ── Spinner ── */
    @keyframes cs-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .cs-spin {
      animation: cs-spin 1s linear infinite;
    }

    /* ── Modal ── */
    .cs-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: cs-overlay-in .2s ease-out;
    }
    @keyframes cs-overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .cs-modal {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 24px 48px rgba(0,0,0,.2);
      max-width: 720px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      animation: cs-modal-in .25s ease-out;
    }
    @keyframes cs-modal-in {
      from { opacity: 0; transform: scale(.95) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .cs-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0,0,0,.12);
    }
    .cs-modal-title {
      font-size: 18px;
      font-weight: 500;
      color: rgba(0,0,0,.87);
      margin: 0;
    }
    .cs-modal-body {
      padding: 20px;
    }
    .cs-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 20px;
      border-top: 1px solid rgba(0,0,0,.12);
    }

    /* ── Screenshot ── */
    .cs-screenshot-image-wrap {
      background: #263238;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .cs-screenshot-img {
      width: 100%;
      display: block;
    }
    .cs-screenshot-meta {
      background: #f5f5f5;
      border-radius: 6px;
      padding: 12px 16px;
    }
    .cs-meta-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(0,0,0,.06);
    }
    .cs-meta-row:last-child {
      border-bottom: none;
    }
    .cs-meta-label {
      color: #757575;
      font-weight: 500;
    }
    .cs-meta-value {
      color: rgba(0,0,0,.87);
    }
  `],
})
export class CsTerminalsScreenComponent {
  dataService = inject(CsDataService);

  expandedRestaurants = new Set<number>();
  selectedTerminals = new Set<number>();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  openDropdown: { terminalId: number; column: 'campaigns' | 'hints' } | null = null;
  isSending = false;
  screenshotLoadingId: number | null = null;
  screenshotModal: TerminalScreenshot | null = null;
  showSystemSettingsModal = false;

  // Search filters
  searchRestaurant = '';
  searchTerminal = '';

  constructor() {
    const restaurants = this.dataService.restaurants;
    if (restaurants.length > 0) {
      this.expandedRestaurants.add(restaurants[0].id);
    }
  }

  // ─── Filtering ──────────────────────────────

  getFilteredRestaurants(): CSRestaurant[] {
    let list = this.dataService.restaurants;
    if (this.searchRestaurant) {
      const q = this.searchRestaurant.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    if (this.searchTerminal) {
      const q = this.searchTerminal.toLowerCase();
      list = list.filter(r =>
        r.terminals.some(t => t.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getFilteredTerminals(restaurant: CSRestaurant): CSTerminalV2[] {
    if (!this.searchTerminal) return restaurant.terminals;
    const q = this.searchTerminal.toLowerCase();
    return restaurant.terminals.filter(t => t.name.toLowerCase().includes(q));
  }

  // ─── Accordion ──────────────────────────────

  toggleRestaurant(id: number): void {
    if (this.expandedRestaurants.has(id)) {
      this.expandedRestaurants.delete(id);
    } else {
      this.expandedRestaurants.add(id);
    }
  }

  // ─── Selection ──────────────────────────────

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedTerminals.clear();
    } else {
      for (const r of this.dataService.restaurants) {
        for (const t of this.getVisibleTerminals(r)) {
          this.selectedTerminals.add(t.id);
        }
      }
    }
  }

  isAllSelected(): boolean {
    let total = 0;
    for (const r of this.dataService.restaurants) {
      total += this.getVisibleTerminals(r).length;
    }
    return total > 0 && this.selectedTerminals.size >= total;
  }

  toggleSelectRestaurant(restaurant: CSRestaurant): void {
    const visible = this.getVisibleTerminals(restaurant);
    const allSelected = visible.every(t => this.selectedTerminals.has(t.id));
    if (allSelected) {
      for (const t of visible) {
        this.selectedTerminals.delete(t.id);
      }
    } else {
      for (const t of visible) {
        this.selectedTerminals.add(t.id);
      }
    }
  }

  isRestaurantSelected(restaurant: CSRestaurant): boolean {
    const visible = this.getVisibleTerminals(restaurant);
    return visible.length > 0 && visible.every(t => this.selectedTerminals.has(t.id));
  }

  toggleTerminal(id: number): void {
    if (this.selectedTerminals.has(id)) {
      this.selectedTerminals.delete(id);
    } else {
      this.selectedTerminals.add(id);
    }
  }

  // ─── Terminals filter ───────────────────────

  getVisibleTerminals(restaurant: CSRestaurant): CSTerminalV2[] {
    return restaurant.terminals;
  }

  // ─── Clear helpers ──────────────────────────

  clearCampaigns(restaurantId: number, terminal: CSTerminalV2): void {
    terminal.campaignIds = [];
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  clearHints(restaurantId: number, terminal: CSTerminalV2): void {
    terminal.hintIds = [];
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  // ─── Theme ──────────────────────────────────

  onThemeChange(restaurantId: number, terminal: CSTerminalV2, themeId: number | null): void {
    terminal.themeId = themeId;
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  // ─── Multi-select dropdowns ─────────────────

  toggleDropdown(terminalId: number, column: 'campaigns' | 'hints'): void {
    if (this.openDropdown?.terminalId === terminalId && this.openDropdown?.column === column) {
      this.openDropdown = null;
    } else {
      this.openDropdown = { terminalId, column };
    }
  }

  isDropdownOpen(terminalId: number, column: 'campaigns' | 'hints'): boolean {
    return this.openDropdown?.terminalId === terminalId && this.openDropdown?.column === column;
  }

  closeDropdown(): void {
    this.openDropdown = null;
  }

  onPageClick(event: Event): void {
    if (this.openDropdown) {
      this.openDropdown = null;
    }
  }

  toggleCampaign(restaurantId: number, terminal: CSTerminalV2, campaignId: number): void {
    const idx = terminal.campaignIds.indexOf(campaignId);
    if (idx >= 0) {
      terminal.campaignIds.splice(idx, 1);
    } else {
      terminal.campaignIds.push(campaignId);
    }
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  toggleHint(restaurantId: number, terminal: CSTerminalV2, hintId: number): void {
    const idx = terminal.hintIds.indexOf(hintId);
    if (idx >= 0) {
      terminal.hintIds.splice(idx, 1);
    } else {
      terminal.hintIds.push(hintId);
    }
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  // ─── Summaries ──────────────────────────────

  getCampaignsSummary(terminal: CSTerminalV2): string {
    if (terminal.campaignIds.length === 0) return '— Не выбрано —';
    if (terminal.campaignIds.length === 1) {
      const opt = this.dataService.campaignOptions.find(c => c.id === terminal.campaignIds[0]);
      return opt?.name ?? '1 выбрано';
    }
    return terminal.campaignIds.length + ' выбрано';
  }

  getHintsSummary(terminal: CSTerminalV2): string {
    if (terminal.hintIds.length === 0) return '— Не выбрано —';
    if (terminal.hintIds.length === 1) {
      const opt = this.dataService.hintOptions.find(h => h.id === terminal.hintIds[0]);
      return opt?.name ?? '1 выбрано';
    }
    return terminal.hintIds.length + ' выбрано';
  }

  // ─── Default bindings (footer) ──────────────

  getDefaultThemeName(restaurant: CSRestaurant): string {
    const themeCounts = new Map<number | null, number>();
    for (const t of restaurant.terminals) {
      themeCounts.set(t.themeId, (themeCounts.get(t.themeId) ?? 0) + 1);
    }
    let maxId: number | null = null;
    let maxCount = 0;
    themeCounts.forEach((count, id) => {
      if (count > maxCount) { maxCount = count; maxId = id; }
    });
    return this.dataService.getThemeName(maxId);
  }

  getDefaultCampaignsSummary(restaurant: CSRestaurant): string {
    const allIds = new Set<number>();
    for (const t of restaurant.terminals) {
      for (const id of t.campaignIds) allIds.add(id);
    }
    if (allIds.size === 0) return '—';
    const names = Array.from(allIds)
      .map(id => this.dataService.campaignOptions.find(c => c.id === id)?.name)
      .filter(Boolean);
    return names.length <= 2 ? names.join(', ') : names.length + ' кампаний';
  }

  getDefaultHintsSummary(restaurant: CSRestaurant): string {
    const allIds = new Set<number>();
    for (const t of restaurant.terminals) {
      for (const id of t.hintIds) allIds.add(id);
    }
    if (allIds.size === 0) return '—';
    const names = Array.from(allIds)
      .map(id => this.dataService.hintOptions.find(h => h.id === id)?.name)
      .filter(Boolean);
    return names.length <= 2 ? names.join(', ') : names.length + ' подсказок';
  }

  // ─── Actions ────────────────────────────────

  deleteTerminal(restaurant: CSRestaurant, terminal: CSTerminalV2): void {
    restaurant.terminals = restaurant.terminals.filter(t => t.id !== terminal.id);
    this.selectedTerminals.delete(terminal.id);
    this.dataService.updateRestaurants(this.dataService.restaurants);
  }

  save(): void {
    this.dataService.updateRestaurants(this.dataService.restaurants);
    this.showToastMessage('Настройки терминалов сохранены', 'success');
  }

  // ─── Format ─────────────────────────────────

  formatLastActivity(terminal: CSTerminalV2): string {
    if (!terminal.lastActivity) return '—';
    const d = new Date(terminal.lastActivity);
    if (isNaN(d.getTime())) return terminal.lastActivity;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const tz = terminal.lastActivityTimezone || '';
    return dd + '.' + mm + '.' + yyyy + ', ' + hh + ':' + min + ':' + ss + ' ' + tz;
  }

  getTerminalWord(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return 'терминалов';
    if (mod10 === 1) return 'терминал';
    if (mod10 >= 2 && mod10 <= 4) return 'терминала';
    return 'терминалов';
  }

  // ─── Send settings ─────────────────────────

  async sendSettings(): Promise<void> {
    if (this.selectedTerminals.size === 0 || this.isSending) return;
    const ids = Array.from(this.selectedTerminals);
    this.isSending = true;
    this.showToastMessage('Отправка настроек на ' + ids.length + ' ' + this.getTerminalWord(ids.length) + '...', 'success');
    try {
      await this.dataService.sendSettings(ids);
      this.showToastMessage('Настройки успешно отправлены на ' + ids.length + ' ' + this.getTerminalWord(ids.length), 'success');
      this.selectedTerminals.clear();
    } catch {
      this.showToastMessage('Ошибка при отправке настроек', 'error');
    } finally {
      this.isSending = false;
    }
  }

  // ─── Screenshot ─────────────────────────────

  async requestScreenshot(terminal: CSTerminalV2, restaurant: CSRestaurant): Promise<void> {
    if (this.screenshotLoadingId || !terminal.supportsScreenshot) return;
    if (!terminal.isOnline) {
      this.showToastMessage('Терминал «' + terminal.name + '» недоступен', 'error');
      return;
    }
    this.screenshotLoadingId = terminal.id;
    this.showToastMessage('Получение скриншота с «' + terminal.name + '»...', 'success');
    try {
      const screenshot = await this.dataService.requestScreenshot(terminal.id);
      if (screenshot) {
        this.screenshotModal = screenshot;
      }
    } catch (e: any) {
      this.showToastMessage(e?.message || 'Ошибка получения скриншота', 'error');
    } finally {
      this.screenshotLoadingId = null;
    }
  }

  closeScreenshotModal(): void {
    this.screenshotModal = null;
  }

  getScreenshotUrl(screenshot: TerminalScreenshot): string {
    if (screenshot.imageUrl) return screenshot.imageUrl;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23263238' width='1920' height='1080'/%3E%3Crect x='40' y='40' width='1840' height='200' rx='12' fill='%2337474f'/%3E%3Ctext x='960' y='160' font-family='sans-serif' font-size='64' fill='%23fff' text-anchor='middle'%3ECustomer Screen%3C/text%3E%3Crect x='80' y='300' width='500' height='680' rx='12' fill='%2337474f'/%3E%3Crect x='640' y='300' width='500' height='680' rx='12' fill='%2337474f'/%3E%3Crect x='1200' y='300' width='640' height='320' rx='12' fill='%2337474f'/%3E%3Crect x='1200' y='660' width='640' height='320' rx='12' fill='%2337474f'/%3E%3Ctext x='330' y='660' font-family='sans-serif' font-size='24' fill='%2390a4ae' text-anchor='middle'%3E%D0%9C%D0%B5%D0%BD%D1%8E%3C/text%3E%3Ctext x='890' y='660' font-family='sans-serif' font-size='24' fill='%2390a4ae' text-anchor='middle'%3E%D0%90%D0%BA%D1%86%D0%B8%D0%B8%3C/text%3E%3Ctext x='1520' y='480' font-family='sans-serif' font-size='24' fill='%2390a4ae' text-anchor='middle'%3E%D0%9F%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D0%B7%D0%BA%D0%B8%3C/text%3E%3Ctext x='1520' y='840' font-family='sans-serif' font-size='24' fill='%2390a4ae' text-anchor='middle'%3E%D0%98%D0%BD%D1%84%D0%BE%3C/text%3E%3C/svg%3E";
  }

  formatScreenshotTime(screenshot: TerminalScreenshot): string {
    if (!screenshot.capturedAt) return '—';
    const d = new Date(screenshot.capturedAt);
    if (isNaN(d.getTime())) return screenshot.capturedAt;
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '.' + mm + '.' + d.getFullYear() + ', ' + hh + ':' + min + ':' + ss + ' (' + screenshot.timezoneLabel + ')';
  }

  // ─── Toast ──────────────────────────────────

  private showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
