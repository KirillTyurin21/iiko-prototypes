import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsDataService } from '../cs-data.service';
import { CSRestaurant, CSTerminalV2, TerminalTableRow, TerminalRowKind, TerminalScreenshot, TerminalThemeStructure, ThemeElementInfo, HintAssignmentInfo } from '../cs-types';
import { IconsModule } from '@/shared/icons.module';
import { CsTableRowComponent } from '../components/cs-table-row.component';
import { CsComboboxComponent } from '../components/cs-combobox.component';
import { StorageService } from '@/shared/storage.service';
import { NetworkOrderSourceConfig, OrderSourceRef, CommonOrderSourceSetting, OrderSourceSetting, RestaurantOrderSourceConfig, DisplaySetting } from '../types';
import { MOCK_NETWORK_ORDER_SOURCE_CONFIG, MOCK_ORDER_SOURCES, MOCK_DISPLAY_SETTINGS } from '../data/mock-data';
import { SystemSettingsModalComponent, OrderSourceRestaurantInfo } from '../components/order-sources/system-settings-modal.component';

@Component({
  selector: 'app-cs-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CsTableRowComponent, CsComboboxComponent, SystemSettingsModalComponent],
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

    <!-- Page -->
    <div class="cs-page">

      <!-- Toolbar -->
      <div class="cs-toolbar">
        <h2 class="cs-toolbar-title">Настройка терминалов</h2>
        <div class="cs-toolbar-actions">
          <button class="cs-btn cs-btn-primary" (click)="save()">Сохранить</button>
          <button
            class="cs-btn cs-btn-outline"
            [disabled]="selectedRowIds.size === 0 || isSending"
            (click)="sendSettings()"
          >
            <lucide-icon [name]="isSending ? 'loader-2' : 'send'" [size]="16" [class.cs-spin]="isSending"></lucide-icon>
            {{ isSending ? 'Отправка...' : 'Отправить настройки' + (selectedRowIds.size > 0 ? ' (' + selectedRowIds.size + ')' : '') }}
          </button>
          <button class="cs-icon-btn-round" title="Информация">
            <lucide-icon name="info" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Variant Switcher (segmented button) -->
      <div class="cs-variant-switcher">
        <span class="cs-variant-label">Вариант дизайна:</span>
        <div class="cs-variant-segments">
          <button
            *ngFor="let v of variants"
            class="cs-variant-btn"
            [class.cs-variant-btn--active]="activeVariant === v.id"
            (click)="activeVariant = v.id"
          >
            <lucide-icon [name]="v.icon" [size]="14"></lucide-icon>
            {{ v.label }}
          </button>
        </div>
      </div>

      <!-- ─── Variant A: Текущий вид ─── -->
      <ng-container *ngIf="activeVariant === 'A'">

      <!-- Search + System button -->
      <div class="cs-controls-row">
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по ресторану</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по ресторану" [(ngModel)]="searchRestaurant" (ngModelChange)="invalidateCache()" />
        </div>
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по терминалу</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по терминалу" [(ngModel)]="searchTerminal" (ngModelChange)="invalidateCache()" />
        </div>
      </div>

      <!-- Restaurants accordions -->
      <div class="cs-accordion" *ngFor="let restaurant of filteredRestaurants; trackBy: trackByRestaurantId">
        <div class="cs-accordion-header" (click)="toggleRestaurant(restaurant.id)">
          <span class="cs-accordion-name">{{ restaurant.name }}</span>
          <div class="cs-accordion-right">
            <span
              class="cs-accordion-badge"
              [class.cs-accordion-badge--own]="isOwnOrderSourceSetting(restaurant.id)"
              title="Общая настройка источника заказов"
            >{{ orderSourceBadge(restaurant.id) }}</span>
            <span class="cs-accordion-count">{{ getRowCount(restaurant) }} {{ getTerminalWord(getRowCount(restaurant)) }}</span>
            <lucide-icon
              [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'"
              [size]="20"
              class="cs-accordion-chevron"
            ></lucide-icon>
          </div>
        </div>

        <div class="cs-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
          <!-- Table -->
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead>
                <tr class="cs-table-header-row">
                  <th class="cs-th cs-th--name">
                    <div class="cs-th-content">
                      <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                        <input
                          type="checkbox"
                          class="cs-checkbox"
                          [checked]="areAllRowsSelected(restaurant)"
                          (change)="toggleAllRows(restaurant)"
                        />
                      </label>
                      <span>Кассовый аппарат</span>
                    </div>
                  </th>
                  <th class="cs-th cs-th--theme">Тема</th>
                  <th class="cs-th cs-th--groups">Терминальные группы</th>
                  <th class="cs-th cs-th--campaigns">Кампании</th>
                  <th class="cs-th cs-th--settings">Настройки</th>
                  <th class="cs-th cs-th--actions"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let row of getVisibleRows(restaurant); trackBy: trackByRowId"
                  app-cs-table-row
                  [row]="row"
                  [selected]="selectedRowIds.has(row.id)"
                  [themeOptions]="dataService.themeOptions"
                  [terminalGroupOptions]="dataService.terminalGroupOptions"
                  [campaignOptions]="dataService.campaignOptions"
                  [settingsOptions]="settingsOptions"
                  [settingValue]="displaySettingByRow.get(row.id) ?? null"
                  (settingsChange)="onRowSettingsChange($event)"
                  (toggleExpand)="toggleComputerExpand($event)"
                  (toggleSelect)="toggleRowSelect($event)"
                  (themeChange)="onThemeChange(restaurant.id, $event)"
                  (terminalGroupsChange)="onGroupsChange(restaurant.id, $event)"
                  (campaignChange)="onCampaignChange(restaurant.id, $event)"
                  (requestScreenshot)="onRequestScreenshot(restaurant, $event)"
                  (deleteRow)="onDeleteRow(restaurant.id, $event)"
                  (addScreen)="onAddScreen($event)"
                ></tr>
              </tbody>
            </table>
          </div>

          <!-- Empty state -->
          <div *ngIf="getVisibleRows(restaurant).length === 0" class="cs-empty-state">
            <lucide-icon name="monitor" [size]="32" class="cs-empty-icon"></lucide-icon>
            <span>Нет терминалов, соответствующих фильтру</span>
          </div>
        </div>
      </div>

      <!-- No restaurants -->
      <div *ngIf="filteredRestaurants.length === 0" class="cs-no-data">
        <lucide-icon name="monitor" [size]="48" class="cs-no-data-icon"></lucide-icon>
        <p class="cs-no-data-text">{{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет подключённых ресторанов' }}</p>
      </div>

      </ng-container>
      <!-- End Variant A -->

      <!-- ─── Variant B: Таблица + выезжающая панель ─── -->
      <ng-container *ngIf="activeVariant === 'B'">

      <!-- Search + System button -->
      <div class="cs-controls-row">
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по ресторану</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по ресторану" [(ngModel)]="searchRestaurant" (ngModelChange)="invalidateCache()" />
        </div>
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по терминалу</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по терминалу" [(ngModel)]="searchTerminal" (ngModelChange)="invalidateCache()" />
        </div>
        <button class="cs-btn cs-btn-system" (click)="openSystemSettings('number')">Настройки отображения</button>
      </div>

      <!-- Restaurants accordions (Variant B) -->
      <div class="cs-accordion" *ngFor="let restaurant of filteredRestaurants; trackBy: trackByRestaurantId">
        <div class="cs-accordion-header" (click)="toggleRestaurant(restaurant.id)">
          <span class="cs-accordion-name">{{ restaurant.name }}</span>
          <div class="cs-accordion-right">
            <span
              class="cs-accordion-badge"
              [class.cs-accordion-badge--own]="isOwnOrderSourceSetting(restaurant.id)"
              title="Общая настройка источника заказов"
            >{{ orderSourceBadge(restaurant.id) }}</span>
            <span class="cs-accordion-count">{{ getKioskCountB(restaurant) }} {{ getTerminalWord(getKioskCountB(restaurant)) }}</span>
            <lucide-icon
              [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'"
              [size]="20"
              class="cs-accordion-chevron"
            ></lucide-icon>
          </div>
        </div>

        <div class="cs-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
          <div class="cs-table-wrap">
            <table class="cs-table cs-table--variant-b">
              <thead>
                <tr class="cs-table-header-row">
                  <th class="cs-th cs-th--name-b">
                    <div class="cs-th-content">
                      <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                        <input
                          type="checkbox"
                          class="cs-checkbox"
                          [checked]="areAllKiosksSelectedB(restaurant)"
                          (change)="toggleAllKiosksB(restaurant)"
                        />
                      </label>
                      <span>Киоск</span>
                    </div>
                  </th>
                  <th class="cs-th cs-th--theme-b">Тема</th>
                  <th class="cs-th cs-th--actions-b"></th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let row of getVisibleRows(restaurant); trackBy: trackByRowId">
                <tr
                  *ngIf="row.kind === 'computer'"
                  class="cs-tr-b"
                  [class.cs-tr-b--active]="activePanelTerminalId === row.id"
                  (click)="openPanelB(row)"
                >
                  <!-- Terminal name + icon -->
                  <td class="cs-td cs-td--name-b">
                    <div class="cs-terminal-info">
                      <!-- Checkbox -->
                      <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                        <input
                          type="checkbox"
                          class="cs-checkbox"
                          [checked]="selectedRowIds.has(row.id)"
                          (change)="toggleRowSelect(row.id)"
                        />
                      </label>
                      <lucide-icon
                        name="monitor"
                        [size]="22"
                        class="cs-icon--kiosk"
                      ></lucide-icon>
                      <div class="cs-terminal-name-group">
                        <span class="cs-terminal-name">{{ row.name }}</span>
                        <span class="cs-terminal-kind-badge cs-kind-badge--kiosk">Киоск</span>
                      </div>
                      <!-- Online/offline dot -->
                      <span
                        class="cs-status-dot"
                        [class.cs-status-dot--online]="row.isOnline"
                        [class.cs-status-dot--offline]="!row.isOnline"
                        [title]="row.isOnline ? 'Онлайн' : 'Офлайн'"
                      ></span>
                    </div>
                  </td>
                  <!-- Theme (editable combobox) -->
                  <td class="cs-td cs-td--theme-b" (click)="$event.stopPropagation()">
                    <app-cs-combobox
                      placeholder="Выбрать"
                      [options]="dataService.themeOptions"
                      [value]="row.themeId"
                      displayKey="name"
                      valueKey="id"
                      (valueChange)="onThemeChange(restaurant.id, { rowId: row.id, themeId: $event })"
                    ></app-cs-combobox>
                  </td>
                  <!-- Actions -->
                  <td class="cs-td cs-td--actions-b">
                    <div class="cs-actions-group">
                      <!-- Add screen button -->
                      <button
                        class="cs-icon-btn"
                        (click)="onAddScreen(row.id); $event.stopPropagation()"
                        title="Добавить экран"
                      >
                        <lucide-icon name="plus-circle" [size]="20"></lucide-icon>
                      </button>
                      <!-- Settings button -->
                      <button class="cs-icon-btn" (click)="openPanelB(row); $event.stopPropagation()" title="Настройки">
                        <lucide-icon name="settings" [size]="18"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
                </ng-container>
              </tbody>
            </table>
          </div>

          <div *ngIf="getVisibleRows(restaurant).length === 0" class="cs-empty-state">
            <lucide-icon name="monitor" [size]="32" class="cs-empty-icon"></lucide-icon>
            <span>Нет терминалов, соответствующих фильтру</span>
          </div>
        </div>
      </div>

      <!-- No restaurants -->
      <div *ngIf="filteredRestaurants.length === 0" class="cs-no-data">
        <lucide-icon name="monitor" [size]="48" class="cs-no-data-icon"></lucide-icon>
        <p class="cs-no-data-text">{{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет подключённых ресторанов' }}</p>
      </div>

      <!-- Slide-out Panel Overlay -->
      <div
        class="cs-panel-overlay"
        *ngIf="activePanelTerminalId !== null"
        (click)="closePanelB()"
      ></div>

      <!-- Slide-out Panel -->
      <div class="cs-slide-panel" [class.cs-slide-panel--open]="activePanelTerminalId !== null">
        <ng-container *ngIf="panelStructure">
          <!-- Panel Header -->
          <div class="cs-panel-header">
            <div class="cs-panel-title-row">
              <lucide-icon
                [name]="panelStructure.terminalKind === 'kiosk' ? 'monitor' : 'monitor-smartphone'"
                [size]="22"
              ></lucide-icon>
              <h3 class="cs-panel-title">{{ panelStructure.terminalName }}</h3>
            </div>
            <button class="cs-icon-btn" (click)="closePanelB()" title="Закрыть">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>

          <!-- Theme selector (editable in panel per meeting Z3) -->
          <div class="cs-panel-theme">
            <span class="cs-panel-theme-label">Тема:</span>
            <app-cs-combobox
              class="cs-panel-theme-combo"
              placeholder="Выбрать тему"
              [options]="dataService.themeOptions"
              [value]="panelThemeId"
              displayKey="name"
              valueKey="id"
              (valueChange)="onPanelThemeChange($event)"
            ></app-cs-combobox>
          </div>

          <!-- Terminal Groups section (at kiosk level per meeting Z8) -->
          <div class="cs-panel-config">
            <div class="cs-panel-config-header">
              <lucide-icon name="layers" [size]="16" class="cs-config-icon"></lucide-icon>
              <span class="cs-panel-config-title">Терминальные группы</span>
            </div>
            <app-cs-combobox
              placeholder="Выбрать группы"
              [options]="dataService.terminalGroupOptions"
              [value]="panelTerminalGroupIds"
              [multi]="true"
              displayKey="name"
              valueKey="id"
              (valueChange)="onPanelTerminalGroupsChange($event)"
            ></app-cs-combobox>
          </div>

          <!-- Panel Body: Theme Pages Accordion -->
          <div class="cs-panel-body">
            <ng-container *ngIf="getPanelFilteredPages().length > 0; else noPagesB">
              <div class="cs-b-page" *ngFor="let page of getPanelFilteredPages(); let last = last">
                <!-- Page header (click to expand/collapse) -->
                <div
                  class="cs-b-page-header"
                  (click)="togglePanelPageB(page.id); $event.stopPropagation()"
                >
                  <lucide-icon
                    [name]="expandedPageIdsB.has(page.id) ? 'chevron-down' : 'chevron-right'"
                    [size]="16"
                    class="cs-b-page-chevron"
                  ></lucide-icon>
                  <lucide-icon name="file" [size]="16" class="cs-b-page-icon"></lucide-icon>
                  <span class="cs-b-page-name">{{ page.name }}</span>
                  <span class="cs-b-page-count">({{ page.elements.length }})</span>
                </div>

                <!-- Page elements (expanded) -->
                <div class="cs-b-page-elements" *ngIf="expandedPageIdsB.has(page.id)">
                  <div class="cs-b-el" *ngFor="let el of page.elements">
                    <div class="cs-b-el-header">
                      <lucide-icon
                        [name]="el.kind === 'advertise' ? 'megaphone' : 'lightbulb'"
                        [size]="15"
                        class="cs-b-el-type-icon"
                      ></lucide-icon>
                      <span class="cs-b-el-name">{{ el.name }}</span>
                    </div>
                    <div class="cs-b-el-row">
                      <label class="cs-b-el-label">Кампания</label>
                      <app-cs-combobox
                        placeholder="Выбрать кампанию"
                        [options]="dataService.campaignOptions"
                        [value]="el.campaignIds"
                        [multi]="true"
                        displayKey="name"
                        valueKey="id"
                        (valueChange)="onPanelCampaignChange(el, $event)"
                      ></app-cs-combobox>
                    </div>
                  </div>
                </div>

                <div class="cs-b-page-divider" *ngIf="!last"></div>
              </div>
            </ng-container>
            <ng-template #noPagesB>
              <div class="cs-panel-empty-page">
                <span>Нет страничек с динамическими элементами</span>
              </div>
            </ng-template>
          </div>
        </ng-container>
      </div>

      </ng-container>
      <!-- End Variant B -->

      <!-- ─── Variant C: Раскрывающиеся строки ─── -->
      <ng-container *ngIf="activeVariant === 'C'">

      <!-- Search + System button -->
      <div class="cs-controls-row">
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по ресторану</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по ресторану" [(ngModel)]="searchRestaurant" (ngModelChange)="invalidateCache()" />
        </div>
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по терминалу</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по терминалу" [(ngModel)]="searchTerminal" (ngModelChange)="invalidateCache()" />
        </div>
        <button class="cs-btn cs-btn-system" (click)="openSystemSettings('number')">Настройки отображения</button>
      </div>

      <!-- Restaurants accordions (Variant C) -->
      <div class="cs-accordion" *ngFor="let restaurant of filteredRestaurants; trackBy: trackByRestaurantId">
        <div class="cs-accordion-header" (click)="toggleRestaurant(restaurant.id)">
          <span class="cs-accordion-name">{{ restaurant.name }}</span>
          <div class="cs-accordion-right">
            <span
              class="cs-accordion-badge"
              [class.cs-accordion-badge--own]="isOwnOrderSourceSetting(restaurant.id)"
              title="Общая настройка источника заказов"
            >{{ orderSourceBadge(restaurant.id) }}</span>
            <span class="cs-accordion-count">{{ getRowCount(restaurant) }} {{ getTerminalWord(getRowCount(restaurant)) }}</span>
            <lucide-icon
              [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'"
              [size]="20"
              class="cs-accordion-chevron"
            ></lucide-icon>
          </div>
        </div>

        <div class="cs-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
          <!-- Expand/Collapse All buttons -->
          <div class="cs-c-toolbar">
            <button class="cs-c-toolbar-btn" (click)="expandAllC(restaurant)">
              <lucide-icon name="chevrons-down-up" [size]="14"></lucide-icon>
              Развернуть всё
            </button>
            <button class="cs-c-toolbar-btn" (click)="collapseAllC(restaurant)">
              <lucide-icon name="chevrons-up-down" [size]="14"></lucide-icon>
              Свернуть всё
            </button>
          </div>

          <div class="cs-table-wrap">
            <table class="cs-table cs-table--variant-c">
              <thead>
                <tr class="cs-table-header-row">
                  <th class="cs-th cs-th--chevron-c"></th>
                  <th class="cs-th cs-th--name-c">Терминал</th>
                  <th class="cs-th cs-th--theme-c">Тема</th>
                  <th class="cs-th cs-th--actions-c"></th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let row of getVisibleRows(restaurant); trackBy: trackByRowId">
                  <!-- Main row -->
                  <tr
                    class="cs-tr-c"
                    [class.cs-tr-c--expanded]="expandedRowIdsC.has(row.id)"
                    [class.cs-tr-c--computer]="row.kind === 'computer'"
                    [class.cs-tr-c--display]="row.kind === 'display'"
                    [class.cs-tr-c--advertise]="row.kind === 'advertise'"
                  >
                    <!-- Chevron column: tree-collapse for computer, detail-expand for display/advertise -->
                    <td class="cs-td cs-td--chevron-c">
                      <!-- Checkbox -->
                      <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                        <input
                          type="checkbox"
                          class="cs-checkbox"
                          [checked]="selectedRowIds.has(row.id)"
                          (change)="toggleRowSelect(row.id)"
                        />
                      </label>
                      <!-- Computer: tree expand/collapse -->
                      <ng-container *ngIf="row.kind === 'computer'; else detailChevron">
                        <lucide-icon
                          [name]="collapsedComputers.has(row.id) ? 'chevron-right' : 'chevron-down'"
                          [size]="18"
                          class="cs-c-chevron cs-c-chevron--tree"
                          (click)="toggleComputerExpand(row.id); $event.stopPropagation()"
                        ></lucide-icon>
                      </ng-container>
                      <!-- Display/Advertise: detail expand -->
                      <ng-template #detailChevron>
                        <lucide-icon
                          [name]="expandedRowIdsC.has(row.id) ? 'chevron-down' : 'chevron-right'"
                          [size]="18"
                          class="cs-c-chevron"
                          (click)="toggleRowC(row); $event.stopPropagation()"
                        ></lucide-icon>
                      </ng-template>
                    </td>
                    <td class="cs-td cs-td--name-c" (click)="row.kind === 'computer' ? toggleComputerExpand(row.id) : toggleRowC(row)">
                      <div class="cs-terminal-info">
                        <lucide-icon
                          [name]="getTerminalIconB(row)"
                          [size]="row.kind === 'computer' ? 22 : 18"
                          [class.cs-icon--kiosk]="row.kind === 'computer'"
                          [class.cs-icon--display]="row.kind === 'display'"
                          [class.cs-icon--advertise]="row.kind === 'advertise'"
                        ></lucide-icon>
                        <div class="cs-terminal-name-group">
                          <span class="cs-terminal-name">{{ row.name }}</span>
                          <span
                            class="cs-terminal-kind-badge"
                            [class.cs-kind-badge--kiosk]="row.kind === 'computer'"
                            [class.cs-kind-badge--display]="row.kind === 'display'"
                            [class.cs-kind-badge--advertise]="row.kind === 'advertise'"
                          >{{ row.kind === 'computer' ? 'Киоск' : row.kind === 'display' ? 'Экран' : row.kind === 'advertise' ? 'Рекламный баннер' : '' }}</span>
                        </div>
                        <!-- Online/offline dot (computer only) -->
                        <span
                          *ngIf="row.kind === 'computer'"
                          class="cs-status-dot"
                          [class.cs-status-dot--online]="row.isOnline"
                          [class.cs-status-dot--offline]="!row.isOnline"
                          [title]="row.isOnline ? 'Онлайн' : 'Офлайн'"
                        ></span>
                      </div>
                    </td>
                    <td class="cs-td cs-td--theme-c" (click)="$event.stopPropagation()">
                      <app-cs-combobox
                        *ngIf="row.kind !== 'advertise'"
                        placeholder="Выбрать"
                        [options]="dataService.themeOptions"
                        [value]="row.themeId"
                        displayKey="name"
                        valueKey="id"
                        (valueChange)="onThemeChange(restaurant.id, { rowId: row.id, themeId: $event })"
                      ></app-cs-combobox>
                      <span *ngIf="row.kind === 'advertise'" class="cs-theme-value">{{ row.campaignNames?.join(', ') || '—' }}</span>
                    </td>
                    <td class="cs-td cs-td--actions-c">
                      <div class="cs-actions-group">
                        <!-- Computer: add screen -->
                        <button
                          *ngIf="row.kind === 'computer'"
                          class="cs-icon-btn"
                          (click)="onAddScreen(row.id); $event.stopPropagation()"
                          title="Добавить экран"
                        >
                          <lucide-icon name="plus-circle" [size]="20"></lucide-icon>
                        </button>
                        <!-- Display: screenshot + delete -->
                        <ng-container *ngIf="row.kind === 'display'">
                          <button
                            *ngIf="row.supportsScreenshot"
                            class="cs-icon-btn"
                            (click)="onRequestScreenshot(restaurant, row.id); $event.stopPropagation()"
                            title="Скриншот"
                            [disabled]="screenshotLoadingId === row.parentComputerId"
                          >
                            <lucide-icon
                              [name]="screenshotLoadingId === row.parentComputerId ? 'loader-2' : 'camera'"
                              [size]="18"
                              [class.cs-spin]="screenshotLoadingId === row.parentComputerId"
                            ></lucide-icon>
                          </button>
                          <button
                            class="cs-icon-btn cs-icon-btn--danger"
                            (click)="onDeleteRow(restaurant.id, row.id); $event.stopPropagation()"
                            title="Удалить"
                          >
                            <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                          </button>
                        </ng-container>
                        <!-- Settings -->
                        <button class="cs-icon-btn" (click)="toggleRowC(row); $event.stopPropagation()" title="Настройки">
                          <lucide-icon name="settings" [size]="18"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Expanded detail row -->
                  <tr class="cs-c-detail-row" *ngIf="expandedRowIdsC.has(row.id)">
                    <td class="cs-c-detail-cell" [attr.colspan]="4">
                      <div class="cs-c-detail-wrap cs-c-detail-wrap--open">
                        <ng-container *ngIf="getRowThemeStructureC(row) as struct">
                          <div class="cs-c-detail-theme">
                            Содержимое темы «{{ struct.themeName }}»
                          </div>

                          <!-- Hints for this terminal -->
                          <div class="cs-c-hints-section">
                            <div class="cs-c-hints-header">
                              <lucide-icon name="lightbulb" [size]="14"></lucide-icon>
                              <span>Подсказки</span>
                              <span class="cs-c-hints-count">{{ struct.hints.length }}</span>
                            </div>
                            <div class="cs-c-hints-chips" *ngIf="struct.hints.length > 0; else noHintsC">
                              <span class="cs-c-hint-chip" *ngFor="let hint of struct.hints">
                                {{ hint.name }}
                                <span class="cs-c-hint-chip-dot" [class.cs-c-dot--active]="hint.status === 'active'" [class.cs-c-dot--scheduled]="hint.status === 'scheduled'"></span>
                              </span>
                            </div>
                            <ng-template #noHintsC>
                              <span class="cs-c-hints-none">Нет назначенных подсказок</span>
                            </ng-template>
                          </div>

                          <!-- Terminal Groups + Settings -->
                          <div class="cs-c-config-row">
                            <div class="cs-c-config-item">
                              <div class="cs-c-config-label">
                                <lucide-icon name="layers" [size]="13"></lucide-icon>
                                <span>Терминальные группы</span>
                              </div>
                              <app-cs-combobox
                                placeholder="Выбрать группы"
                                [options]="dataService.terminalGroupOptions"
                                [value]="row.terminalGroupIds"
                                [multi]="true"
                                displayKey="name"
                                valueKey="id"
                              ></app-cs-combobox>
                            </div>
                            <div class="cs-c-config-item">
                              <div class="cs-c-config-label">
                                <lucide-icon name="settings" [size]="13"></lucide-icon>
                                <span>Настройки</span>
                              </div>
                              <app-cs-combobox
                                placeholder="Выбрать"
                                [options]="settingsOptions"
                                [value]="displaySettingByRow.get(row.id) ?? null"
                                displayKey="name"
                                valueKey="id"
                                (valueChange)="onRowSettingsChange({ rowId: row.id, settingId: $event })"
                              ></app-cs-combobox>
                              <button type="button" class="cs-config-manage" (click)="openSystemSettings('displays'); $event.stopPropagation()">
                                <lucide-icon name="list" [size]="13"></lucide-icon>
                                Управлять настройками
                              </button>
                            </div>
                          </div>

                          <div class="cs-c-detail-section" *ngFor="let page of struct.pages; let last = last">
                            <div class="cs-c-page-header">
                              <lucide-icon name="file" [size]="16" class="cs-c-page-icon"></lucide-icon>
                              <span>{{ page.name }}</span>
                            </div>

                            <div class="cs-c-elements">
                              <div class="cs-c-element" *ngFor="let el of page.elements">
                                <div class="cs-c-el-header">
                                  <lucide-icon
                                    [name]="el.kind === 'advertise' ? 'megaphone' : 'lightbulb'"
                                    [size]="15"
                                  ></lucide-icon>
                                  <span>{{ el.name }}</span>
                                </div>
                                <div class="cs-c-el-fields">
                                  <div class="cs-c-el-field cs-c-el-field--full">
                                    <label>Кампания</label>
                                    <app-cs-combobox
                                      placeholder="Выбрать кампанию"
                                      [options]="dataService.campaignOptions"
                                      [value]="el.campaignIds"
                                      [multi]="true"
                                      displayKey="name"
                                      valueKey="id"
                                      (valueChange)="onPanelCampaignChange(el, $event)"
                                    ></app-cs-combobox>
                                  </div>
                                </div>
                              </div>
                              <div *ngIf="page.elements.length === 0" class="cs-c-empty">Нет динамических элементов</div>
                            </div>

                            <div class="cs-c-divider" *ngIf="!last"></div>
                          </div>
                        </ng-container>
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>

          <div *ngIf="getVisibleRows(restaurant).length === 0" class="cs-empty-state">
            <lucide-icon name="monitor" [size]="32" class="cs-empty-icon"></lucide-icon>
            <span>Нет терминалов, соответствующих фильтру</span>
          </div>
        </div>
      </div>

      <!-- No restaurants -->
      <div *ngIf="filteredRestaurants.length === 0" class="cs-no-data">
        <lucide-icon name="monitor" [size]="48" class="cs-no-data-icon"></lucide-icon>
        <p class="cs-no-data-text">{{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет подключённых ресторанов' }}</p>
      </div>

      </ng-container>
      <!-- End Variant C -->

      <!-- ─── Variant D: Постоянный Split View ─── -->
      <div class="cs-d-split" *ngIf="activeVariant === 'D'" (keydown)="onSplitKeydownD($event)" tabindex="0">

        <!-- Left Panel: Terminal List -->
        <div class="cs-d-left">
          <div class="cs-d-left-header">
            <span class="cs-d-left-title">Терминалы</span>
          </div>

          <!-- Search -->
          <div class="cs-d-search">
            <div class="cs-search-group">
              <input type="text" class="cs-search-input" placeholder="Поиск по ресторану" [(ngModel)]="searchRestaurant" (ngModelChange)="invalidateCache()" />
            </div>
            <div class="cs-search-group">
              <input type="text" class="cs-search-input" placeholder="Поиск по терминалу" [(ngModel)]="searchTerminal" (ngModelChange)="invalidateCache()" />
            </div>
          </div>

          <!-- Restaurant accordions with terminal cards -->
          <div class="cs-d-list">
            <div class="cs-d-accordion" *ngFor="let restaurant of filteredRestaurants; trackBy: trackByRestaurantId">
              <div class="cs-d-accordion-header" (click)="toggleRestaurant(restaurant.id)">
                <span class="cs-d-accordion-name">{{ restaurant.name }}</span>
                <div class="cs-d-accordion-right">
                  <span class="cs-d-accordion-count">{{ getRowCount(restaurant) }}</span>
                  <lucide-icon
                    [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'"
                    [size]="16"
                  ></lucide-icon>
                </div>
              </div>

              <div class="cs-d-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
                <div
                  class="cs-d-card"
                  *ngFor="let row of getVisibleRows(restaurant); trackBy: trackByRowId"
                  [class.cs-d-card--selected]="selectedTerminalIdD === row.id"
                  [class.cs-d-card--computer]="row.kind === 'computer'"
                  [class.cs-d-card--display]="row.kind === 'display'"
                  [class.cs-d-card--advertise]="row.kind === 'advertise'"
                  (click)="selectTerminalD(row)"
                >
                  <div class="cs-d-card-left">
                    <!-- Checkbox -->
                    <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                      <input
                        type="checkbox"
                        class="cs-checkbox"
                        [checked]="selectedRowIds.has(row.id)"
                        (change)="toggleRowSelect(row.id)"
                      />
                    </label>
                    <!-- Tree chevron for computer rows -->
                    <button
                      *ngIf="row.kind === 'computer'"
                      type="button"
                      class="cs-d-tree-chevron"
                      (click)="toggleComputerExpand(row.id); $event.stopPropagation()"
                      [attr.title]="collapsedComputers.has(row.id) ? 'Развернуть' : 'Свернуть'"
                    >
                      <lucide-icon
                        [name]="collapsedComputers.has(row.id) ? 'chevron-right' : 'chevron-down'"
                        [size]="16"
                      ></lucide-icon>
                    </button>
                    <!-- Spacer for non-computer rows -->
                    <span *ngIf="row.kind !== 'computer'" class="cs-d-tree-spacer"></span>
                    <lucide-icon
                      [name]="getTerminalIconB(row)"
                      [size]="row.kind === 'computer' ? 22 : 18"
                      [class.cs-icon--kiosk]="row.kind === 'computer'"
                      [class.cs-icon--display]="row.kind === 'display'"
                      [class.cs-icon--advertise]="row.kind === 'advertise'"
                    ></lucide-icon>
                    <div class="cs-d-card-info">
                      <div class="cs-d-card-name-row">
                        <span class="cs-d-card-name">{{ row.name }}</span>
                        <span
                          class="cs-terminal-kind-badge cs-kind-badge--sm"
                          [class.cs-kind-badge--kiosk]="row.kind === 'computer'"
                          [class.cs-kind-badge--display]="row.kind === 'display'"
                          [class.cs-kind-badge--advertise]="row.kind === 'advertise'"
                        >{{ row.kind === 'computer' ? 'Киоск' : row.kind === 'display' ? 'Экран' : row.kind === 'advertise' ? 'Рекламный баннер' : '' }}</span>
                        <!-- Online/offline dot (computer only) -->
                        <span
                          *ngIf="row.kind === 'computer'"
                          class="cs-status-dot"
                          [class.cs-status-dot--online]="row.isOnline"
                          [class.cs-status-dot--offline]="!row.isOnline"
                          [title]="row.isOnline ? 'Онлайн' : 'Офлайн'"
                        ></span>
                      </div>
                      <div class="cs-d-card-theme-row" (click)="$event.stopPropagation()">
                        <app-cs-combobox
                          *ngIf="row.kind !== 'advertise'"
                          placeholder="Тема"
                          [options]="dataService.themeOptions"
                          [value]="row.themeId"
                          displayKey="name"
                          valueKey="id"
                          (valueChange)="onThemeChange(restaurant.id, { rowId: row.id, themeId: $event })"
                        ></app-cs-combobox>
                        <span *ngIf="row.kind === 'advertise'" class="cs-d-card-theme">{{ row.campaignNames?.join(', ') || 'Без кампании' }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- Actions -->
                  <div class="cs-d-card-actions">
                    <button
                      *ngIf="row.kind === 'computer'"
                      class="cs-icon-btn"
                      (click)="onAddScreen(row.id); $event.stopPropagation()"
                      title="Добавить экран"
                    >
                      <lucide-icon name="plus-circle" [size]="18"></lucide-icon>
                    </button>
                    <ng-container *ngIf="row.kind === 'display'">
                      <button
                        *ngIf="row.supportsScreenshot"
                        class="cs-icon-btn"
                        (click)="onRequestScreenshot(restaurant, row.id); $event.stopPropagation()"
                        title="Скриншот"
                      >
                        <lucide-icon name="camera" [size]="18"></lucide-icon>
                      </button>
                      <button
                        class="cs-icon-btn cs-icon-btn--danger"
                        (click)="onDeleteRow(restaurant.id, row.id); $event.stopPropagation()"
                        title="Удалить"
                      >
                        <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                      </button>
                    </ng-container>
                  </div>
                  <lucide-icon name="chevron-right" [size]="16" class="cs-d-card-arrow"></lucide-icon>
                </div>

                <div *ngIf="getVisibleRows(restaurant).length === 0" class="cs-d-empty">
                  Нет терминалов
                </div>
              </div>
            </div>

            <div *ngIf="filteredRestaurants.length === 0" class="cs-d-empty cs-d-empty--big">
              {{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет ресторанов' }}
            </div>
          </div>
        </div>

        <!-- Right Panel: Terminal Details -->
        <div class="cs-d-right">
          <ng-container *ngIf="selectedStructureD; else emptyStateD">
            <!-- Header -->
            <div class="cs-d-right-header">
              <div class="cs-d-right-title-row">
                <lucide-icon
                  [name]="selectedStructureD.terminalKind === 'kiosk' ? 'monitor' : 'monitor-smartphone'"
                  [size]="22"
                ></lucide-icon>
                <h3 class="cs-d-right-title">{{ selectedStructureD.terminalName }}</h3>
              </div>
            </div>

            <!-- Theme -->
            <div class="cs-d-theme-row">
              <span class="cs-d-theme-label">Тема:</span>
              <span class="cs-d-theme-value">{{ selectedStructureD.themeName }}</span>
              <button class="cs-btn cs-btn-sm cs-btn-outline">Сменить</button>
            </div>

            <!-- Hints for this terminal -->
            <div class="cs-d-hints-row">
              <div class="cs-d-hints-header">
                <lucide-icon name="lightbulb" [size]="16" class="cs-d-hints-icon"></lucide-icon>
                <span class="cs-d-hints-title">Подсказки</span>
                <span class="cs-d-hints-badge">{{ selectedStructureD.hints.length }}</span>
              </div>
              <div class="cs-d-hints-chips" *ngIf="selectedStructureD.hints.length > 0; else noHintsD">
                <span class="cs-d-hint-chip" *ngFor="let hint of selectedStructureD.hints">
                  {{ hint.name }}
                  <span
                    class="cs-d-hint-chip-status"
                    [class.cs-d-hint--active]="hint.status === 'active'"
                    [class.cs-d-hint--scheduled]="hint.status === 'scheduled'"
                    [class.cs-d-hint--expired]="hint.status === 'expired'"
                  >{{ hint.status === 'active' ? 'Активна' : hint.status === 'scheduled' ? 'Запланирована' : 'Истекла' }}</span>
                </span>
              </div>
              <ng-template #noHintsD>
                <span class="cs-d-hints-none">Нет назначенных подсказок</span>
              </ng-template>
            </div>

            <!-- Terminal Groups + Settings -->
            <div class="cs-d-config-row">
              <div class="cs-d-config-item">
                <div class="cs-d-config-label">
                  <lucide-icon name="layers" [size]="14"></lucide-icon>
                  <span>Терминальные группы</span>
                </div>
                <app-cs-combobox
                  placeholder="Выбрать группы"
                  [options]="dataService.terminalGroupOptions"
                  [value]="selectedTerminalGroupIdsD"
                  [multi]="true"
                  displayKey="name"
                  valueKey="id"
                  (valueChange)="onDTerminalGroupsChange($event)"
                ></app-cs-combobox>
              </div>
              <div class="cs-d-config-item">
                <div class="cs-d-config-label">
                  <lucide-icon name="settings" [size]="14"></lucide-icon>
                  <span>Настройки</span>
                </div>
                <app-cs-combobox
                  placeholder="Выбрать"
                  [options]="settingsOptions"
                  [value]="selectedTerminalIdD !== null ? (displaySettingByRow.get(selectedTerminalIdD) ?? null) : null"
                  displayKey="name"
                  valueKey="id"
                  (valueChange)="onRowSettingsChange({ rowId: selectedTerminalIdD!, settingId: $event })"
                ></app-cs-combobox>
                <button type="button" class="cs-config-manage" (click)="openSystemSettings('displays')">
                  <lucide-icon name="list" [size]="13"></lucide-icon>
                  Управлять настройками
                </button>
              </div>
            </div>

            <!-- Pages -->
            <div class="cs-d-body">
              <div class="cs-d-section" *ngFor="let page of selectedStructureD.pages; let last = last">
                <div class="cs-d-page-header">
                  <lucide-icon name="file" [size]="16"></lucide-icon>
                  <span>{{ page.name }}</span>
                </div>

                <div class="cs-d-elements">
                  <div class="cs-d-element" *ngFor="let el of page.elements">
                    <div class="cs-d-el-header">
                      <lucide-icon
                        [name]="el.kind === 'advertise' ? 'megaphone' : 'lightbulb'"
                        [size]="15"
                      ></lucide-icon>
                      <span>{{ el.name }}</span>
                    </div>
                    <div class="cs-d-el-fields">
                      <div class="cs-d-el-field cs-d-el-field--full">
                        <label>Кампания</label>
                        <app-cs-combobox
                          placeholder="Выбрать кампанию"
                          [options]="dataService.campaignOptions"
                          [value]="el.campaignIds"
                          [multi]="true"
                          displayKey="name"
                          valueKey="id"
                          (valueChange)="onPanelCampaignChange(el, $event)"
                        ></app-cs-combobox>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="page.elements.length === 0" class="cs-d-el-empty">Нет динамических элементов</div>
                </div>

                <div class="cs-d-divider" *ngIf="!last"></div>
              </div>
            </div>
          </ng-container>

          <!-- Empty State -->
          <ng-template #emptyStateD>
            <div class="cs-d-empty-state">
              <lucide-icon name="monitor" [size]="48" class="cs-d-empty-icon"></lucide-icon>
              <h3 class="cs-d-empty-title">Выберите терминал</h3>
              <p class="cs-d-empty-desc">Выберите терминал слева, чтобы увидеть содержимое темы</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>

    <!-- Screenshot Modal (only Variant A) -->
    <div class="cs-modal-overlay" *ngIf="activeVariant === 'A' && screenshotModal" (click)="closeScreenshotModal()">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header">
          <h3 class="cs-modal-title">Скриншот экрана</h3>
          <button class="cs-icon-btn" (click)="closeScreenshotModal()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="cs-modal-body">
          <div class="cs-screenshot-image-wrap">
            <img
              [src]="getScreenshotUrl(screenshotModal)"
              [alt]="'Скриншот: ' + screenshotModal.terminalName"
              class="cs-screenshot-img"
            />
          </div>
          <div class="cs-screenshot-meta">
            <div class="cs-meta-row"><span class="cs-meta-label">Ресторан</span><span class="cs-meta-value">{{ screenshotModal.restaurantName }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Терминал</span><span class="cs-meta-value">{{ screenshotModal.terminalName }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Время снимка</span><span class="cs-meta-value">{{ formatScreenshotTime(screenshotModal) }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Разрешение</span><span class="cs-meta-value">{{ screenshotModal.resolution }}</span></div>
          </div>
        </div>
        <div class="cs-modal-footer">
          <button class="cs-btn cs-btn-outline" (click)="closeScreenshotModal()">Закрыть</button>
        </div>
      </div>
    </div>

    <!-- System Settings Modal: «Настройки отображения» (номер заказа + дисплеи + назначение) -->
    <app-system-settings-modal
      [open]="showSystemSettingsModal"
      [config]="networkConfig"
      [restaurants]="orderSourceRestaurants"
      [sources]="orderSources"
      [displaySettings]="displaySettings"
      [assignedDisplayCounts]="assignedDisplayCounts"
      [initialTab]="systemSettingsInitialTab"
      (close)="showSystemSettingsModal = false"
      (save)="onOrderSourceSettingsSave($event)"
      (displaySettingsSave)="onDisplaySettingsSave($event)"
    ></app-system-settings-modal>

  `,
  styles: [`
    :host { display: block; min-height: 100%; }

    .cs-page {
      padding: 0;
      background: transparent;
      min-height: 100%;
      font-family: 'Roboto', sans-serif;
    }

    /* ─── Toolbar ─── */
    .cs-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .cs-toolbar-title {
      font-size: 20px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
      margin: 0;
      line-height: 1.3;
    }
    .cs-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* ─── Variant Switcher ─── */
    .cs-variant-switcher {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .cs-variant-label {
      font-size: 12px;
      font-weight: 500;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .cs-variant-segments {
      display: inline-flex;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      background: #f5f5f5;
    }
    .cs-variant-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      color: #616161;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all .15s ease;
      white-space: nowrap;
      border-right: 1px solid #e0e0e0;
    }
    .cs-variant-btn:last-child { border-right: none; }
    .cs-variant-btn:hover { background: #e8e8e8; color: #333; }
    .cs-variant-btn--active {
      background: #1976d2;
      color: #fff;
    }
    .cs-variant-btn--active:hover {
      background: #1565c0;
      color: #fff;
    }

    /* ─── Variant Placeholder ─── */
    .cs-variant-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
      background: #fafafa;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      min-height: 320px;
    }
    .cs-placeholder-icon { color: #bdbdbd; margin-bottom: 16px; }
    .cs-placeholder-title {
      font-size: 18px;
      font-weight: 500;
      color: #424242;
      margin: 0 0 8px;
    }
    .cs-placeholder-desc {
      font-size: 14px;
      color: #757575;
      margin: 0 0 12px;
      max-width: 480px;
      line-height: 1.5;
    }
    .cs-placeholder-hint {
      font-size: 12px;
      color: #9e9e9e;
      margin: 0;
      font-style: italic;
    }

    /* ─── Buttons ─── */
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
    .cs-btn-primary {
      background: #1976d2;
      color: #fff;
      border-color: #1976d2;
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
    }
    .cs-btn-primary:hover { background: #1565c0; }
    .cs-btn-primary:disabled { background: #90caf9; border-color: #90caf9; cursor: not-allowed; box-shadow: none; }

    .cs-btn-outline {
      background: #fff;
      color: rgba(0, 0, 0, 0.6);
      border-color: rgba(0, 0, 0, 0.23);
    }
    .cs-btn-outline:hover { background: #f5f5f5; border-color: rgba(0, 0, 0, 0.4); }
    .cs-btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

    .cs-btn-system {
      background: #fff;
      color: rgba(0, 0, 0, 0.6);
      border-color: rgba(0, 0, 0, 0.23);
      margin-left: auto;
    }
    .cs-btn-system:hover { background: #f5f5f5; border-color: rgba(0, 0, 0, 0.4); }

    .cs-icon-btn-round {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #757575;
      transition: all .15s;
    }
    .cs-icon-btn-round:hover { background: #f5f5f5; }

    /* ─── Controls row ─── */
    .cs-controls-row {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .cs-search-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cs-search-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
      font-family: 'Roboto', sans-serif;
    }
    .cs-search-input {
      padding: 8px 12px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-radius: 4px;
      background: #fff;
      color: rgba(0, 0, 0, 0.87);
      width: 200px;
      transition: border-color .15s;
    }
    .cs-search-input::placeholder { color: #9e9e9e; }
    .cs-search-input:focus {
      border-color: #1976d2;
      outline: none;
      box-shadow: 0 0 0 1px #1976d2;
    }

    /* ─── Accordion ─── */
    .cs-accordion {
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      margin-bottom: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .cs-accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
      transition: background .15s;
    }
    .cs-accordion-header:hover { background: #fafafa; }
    .cs-accordion-name {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    .cs-accordion-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cs-accordion-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 8px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 500;
      white-space: nowrap;
      background: var(--dt-brand-accent-lighter);
      color: var(--dt-brand-accent-dark);
    }
    .cs-accordion-badge--own {
      background: var(--dt-brand-warning-lighter);
      color: var(--dt-brand-warning-darker);
    }
    .cs-accordion-count {
      font-size: 13px;
      color: #757575;
    }
    .cs-accordion-chevron { color: #9e9e9e; }
    .cs-accordion-body {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      overflow: visible;
      padding: 0;
    }

    /* ─── Table ─── */
    .cs-table-wrap {
      overflow: visible;
    }
    .cs-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Roboto', sans-serif;
    }
    .cs-table-header-row {
      background: #f5f5f5;
      height: 48px;
    }
    .cs-table-header-row th {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .cs-th {
      padding: 0 12px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      text-align: left;
      white-space: nowrap;
      font-family: 'Roboto', sans-serif;
      vertical-align: middle;
      height: 48px;
    }
    .cs-th--name { min-width: 240px; }
    .cs-th--theme { min-width: 160px; }
    .cs-th--groups { min-width: 140px; }
    .cs-th--campaigns { min-width: 180px; }
    .cs-th--settings { min-width: 140px; }
    .cs-th--actions { min-width: 80px; }

    .cs-th-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Checkbox in header */
    .cs-checkbox-wrap {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .cs-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.38);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      background: #fff;
      transition: all .15s;
      margin: 0;
    }
    .cs-checkbox:checked {
      background: #1976d2;
      border-color: #1976d2;
    }
    .cs-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* ─── Empty / No data ─── */
    .cs-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
      color: #9e9e9e;
      font-size: 14px;
    }
    .cs-empty-icon { color: #bdbdbd; }

    .cs-no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 24px;
      text-align: center;
    }
    .cs-no-data-icon { color: #bdbdbd; }
    .cs-no-data-text { color: #9e9e9e; margin-top: 8px; font-size: 14px; }

    /* ─── Modal ─── */
    .cs-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: cs-overlay-in .2s ease-out;
    }
    @keyframes cs-overlay-in { from { opacity: 0; } to { opacity: 1; } }
    .cs-modal {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      max-width: 720px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      animation: cs-modal-in .25s ease-out;
    }
    @keyframes cs-modal-in { from { opacity: 0; transform: scale(.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .cs-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .cs-modal-title { font-size: 18px; font-weight: 500; color: rgba(0, 0, 0, 0.87); margin: 0; }
    .cs-modal-body { padding: 20px; }
    .cs-modal-text { color: #757575; font-size: 14px; }
    .cs-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    .cs-screenshot-image-wrap { background: #263238; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
    .cs-screenshot-img { width: 100%; display: block; }
    .cs-screenshot-meta { background: #f5f5f5; border-radius: 6px; padding: 12px 16px; }
    .cs-meta-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
    .cs-meta-row:last-child { border-bottom: none; }
    .cs-meta-label { color: #757575; font-weight: 500; }
    .cs-meta-value { color: rgba(0, 0, 0, 0.87); }

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

    /* ─── Spinner ─── */
    @keyframes cs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .cs-spin { animation: cs-spin 1s linear infinite; }

    /* ─── Variant B: Table ─── */
    .cs-table--variant-b { table-layout: auto; }
    .cs-th--name-b { min-width: 240px; }
    .cs-th--theme-b { min-width: 200px; }
    .cs-th--actions-b { min-width: 60px; width: 120px; }

    .cs-actions-group {
      display: flex;
      align-items: center;
      gap: 2px;
      justify-content: flex-end;
    }

    .cs-icon-btn--danger:hover { color: #d32f2f; background: #ffebee; }

    .cs-tr-b {
      cursor: pointer;
      transition: background .15s;
      height: 48px;
    }
    .cs-tr-b:hover { background: #f5f5f5; }
    .cs-tr-b--active { background: #e3f2fd; }
    .cs-tr-b--active:hover { background: #bbdefb; }

    /* Tree indentation for display and advertise rows */
    .cs-tr-b--display .cs-td--name-b { padding-left: 44px; }
    .cs-tr-b--advertise .cs-td--name-b { padding-left: 68px; }

    /* Tree chevron button */
    .cs-tree-chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #757575;
      border-radius: 4px;
      transition: all .15s;
      flex-shrink: 0;
      padding: 0;
      margin: 0;
    }
    .cs-tree-chevron:hover { background: #e0e0e0; color: #424242; }
    .cs-tree-chevron-spacer {
      display: inline-block;
      width: 28px;
      flex-shrink: 0;
    }

    .cs-td { padding: 0 12px; font-size: 14px; color: rgba(0,0,0,.87); vertical-align: middle; }
    .cs-td--name-b { }
    .cs-td--theme-b { }
    .cs-td--actions-b { text-align: center; }

    .cs-terminal-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cs-terminal-name { font-weight: 500; }
    .cs-terminal-name-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .cs-icon--kiosk { color: #1976d2; }
    .cs-icon--display { color: #ff6d00; }
    .cs-icon--advertise { color: #9e9e9e; }
    .cs-theme-value { color: #616161; font-size: 13px; }

    /* Terminal kind badge */
    .cs-terminal-kind-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .5px;
      padding: 1px 6px;
      border-radius: 3px;
      line-height: 1.5;
      white-space: nowrap;
      width: fit-content;
    }
    .cs-kind-badge--kiosk {
      background: #e3f2fd;
      color: #1565c0;
    }
    .cs-kind-badge--display {
      background: #fff3e0;
      color: #e65100;
    }
    .cs-kind-badge--advertise {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    .cs-kind-badge--sm { font-size: 9px; padding: 0 5px; }

    /* ─── Variant B: Slide-out Panel ─── */
    .cs-panel-overlay {
      position: fixed;
      top: 0;
      left: 15rem;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,.35);
      z-index: 90;
      animation: cs-overlay-in .2s ease-out;
    }
    .cs-slide-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 440px;
      max-width: 90vw;
      height: 100vh;
      background: #fff;
      box-shadow: -4px 0 24px rgba(0,0,0,.15);
      z-index: 91;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform .2s ease-out;
    }
    .cs-slide-panel--open { transform: translateX(0); }

    .cs-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-panel-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cs-panel-title {
      font-size: 18px;
      font-weight: 500;
      color: rgba(0,0,0,.87);
      margin: 0;
    }

    .cs-panel-theme {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-panel-theme-label { font-size: 13px; color: #757575; font-weight: 500; }
    .cs-panel-theme-value { font-size: 14px; color: rgba(0,0,0,.87); flex: 1; }

    .cs-btn-sm {
      padding: 4px 12px;
      font-size: 12px;
    }

    .cs-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    }

    .cs-panel-section { }
    .cs-panel-page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .cs-page-icon { color: #757575; flex-shrink: 0; }
    .cs-panel-page-name {
      font-size: 14px;
      font-weight: 500;
      color: #424242;
    }

    .cs-panel-elements { padding-left: 24px; }
    .cs-panel-element {
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .cs-el-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .cs-el-type-icon { color: #9e9e9e; flex-shrink: 0; }
    .cs-el-name { font-size: 13px; font-weight: 500; color: #424242; }

    .cs-el-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .cs-el-row--compact { margin-bottom: 0; }
    .cs-el-label {
      font-size: 12px;
      color: #757575;
      width: 60px;
      flex-shrink: 0;
    }
    .cs-el-select {
      flex: 1;
      padding: 6px 8px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #fff;
      color: rgba(0,0,0,.87);
      outline: none;
    }
    .cs-el-select:focus { border-color: #1976d2; }
    .cs-el-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cs-el-field--grow { flex: 1; }
    .cs-el-input {
      padding: 6px 8px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      outline: none;
      color: rgba(0,0,0,.87);
      background: #fff;
      width: 100%;
      box-sizing: border-box;
    }
    .cs-el-input:focus { border-color: #1976d2; }
    .cs-el-input--id { width: 90px; }

    .cs-panel-empty-page {
      padding: 8px 0;
      font-size: 13px;
      color: #9e9e9e;
      font-style: italic;
    }
    .cs-panel-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 16px 0;
    }

    /* ─── Variant B: Panel Theme Combo ─── */
    .cs-panel-theme-combo {
      flex: 1;
      max-width: 280px;
    }

    /* ─── Variant B: Page Accordion ─── */
    .cs-b-page {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
      background: #fff;
    }
    .cs-b-page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      cursor: pointer;
      user-select: none;
      transition: background .15s;
    }
    .cs-b-page-header:hover { background: #f5f5f5; }
    .cs-b-page-chevron { color: #757575; flex-shrink: 0; transition: transform .15s; }
    .cs-b-page-icon { color: #9e9e9e; flex-shrink: 0; }
    .cs-b-page-name { font-size: 13px; font-weight: 500; color: #424242; flex: 1; }
    .cs-b-page-count { font-size: 12px; color: #9e9e9e; font-weight: 400; }

    .cs-b-page-elements {
      border-top: 1px solid #e0e0e0;
      padding: 12px;
      background: #fafafa;
    }
    .cs-b-el {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }
    .cs-b-el:last-child { margin-bottom: 0; }
    .cs-b-el-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .cs-b-el-type-icon { color: #9e9e9e; flex-shrink: 0; }
    .cs-b-el-name { font-size: 13px; font-weight: 500; color: #424242; }
    .cs-b-el-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .cs-b-el-row:last-child { margin-bottom: 0; }
    .cs-b-el-row--compact { }
    .cs-b-el-label {
      font-size: 12px;
      color: #757575;
      width: 60px;
      flex-shrink: 0;
    }
    .cs-b-el-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cs-b-el-field--grow { flex: 1; }
    .cs-b-page-divider {
      display: none;
    }

    /* ─── Variant B: Hints section ─── */
    .cs-panel-hints {
      padding: 12px 20px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-panel-hints-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .cs-hints-icon { color: #ffa726; flex-shrink: 0; }
    .cs-panel-hints-title {
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .cs-panel-hints-count {
      font-size: 11px;
      color: #fff;
      background: #757575;
      border-radius: 10px;
      padding: 1px 7px;
      min-width: 18px;
      text-align: center;
      line-height: 1.4;
    }
    .cs-panel-hints-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }
    .cs-hint-chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 13px;
    }
    .cs-hint-chip-name { color: rgba(0,0,0,.87); }
    .cs-hint-chip-status {
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 500;
    }
    .cs-hint-status--active { background: #e8f5e9; color: #2e7d32; }
    .cs-hint-status--scheduled { background: #fff3e0; color: #e65100; }
    .cs-hint-status--expired { background: #fce4ec; color: #c62828; }
    .cs-panel-hints-empty {
      font-size: 13px;
      color: #9e9e9e;
      font-style: italic;
      margin-bottom: 10px;
    }
    .cs-panel-hints-add {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .cs-panel-hints-add .cs-el-input {
      flex: 1;
      font-size: 12px;
      padding: 4px 8px;
      opacity: 0.6;
    }
    .cs-panel-hints-add .cs-btn-sm {
      flex-shrink: 0;
      opacity: 0.5;
    }

    /* ─── Variant B: Panel config (Terminal Groups, Settings) ─── */
    .cs-panel-config {
      padding: 10px 20px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-panel-config-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .cs-config-icon { color: #757575; flex-shrink: 0; }
    .cs-panel-config-title {
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }

    /* Status dot */
    .cs-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-left: 4px;
    }
    .cs-status-dot--online { background: #4caf50; }
    .cs-status-dot--offline { background: #bdbdbd; }

    /* ─── Variant C: Expandable Rows ─── */
    .cs-c-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }
    .cs-c-toolbar-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      color: #616161;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
      transition: all .15s;
    }
    .cs-c-toolbar-btn:hover { background: #f5f5f5; color: #333; }

    .cs-table--variant-c { table-layout: auto; }
    .cs-th--chevron-c { min-width: 40px; width: 40px; padding: 0 4px; text-align: center; }
    .cs-th--name-c { min-width: 220px; }
    .cs-th--theme-c { min-width: 180px; }
    .cs-th--actions-c { min-width: 60px; width: 60px; }

    .cs-tr-c {
      cursor: pointer;
      transition: background .15s;
      height: 48px;
    }
    .cs-tr-c:hover { background: #f5f5f5; }
    .cs-tr-c--expanded { background: #e3f2fd; }
    .cs-tr-c--expanded:hover { background: #bbdefb; }

    /* Tree indentation for display and advertise rows */
    .cs-tr-c--display .cs-td--name-c { padding-left: 44px; }
    .cs-tr-c--advertise .cs-td--name-c { padding-left: 68px; }

    /* Tree chevron (computer rows) */
    .cs-c-chevron--tree {
      cursor: pointer;
      color: #757575;
      transition: color .15s;
    }
    .cs-c-chevron--tree:hover { color: #424242; }

    .cs-td--chevron-c { text-align: center; vertical-align: middle; padding: 0 6px; }
    .cs-c-chevron { color: #757575; transition: transform .2s; }
    .cs-td--name-c { }
    .cs-td--theme-c { }
    .cs-td--actions-c { text-align: center; }

    .cs-c-detail-row { }
    .cs-c-detail-cell {
      padding: 0;
      border-bottom: 2px solid #1976d2;
    }
    .cs-c-detail-wrap {
      background: #fafafa;
      border-left: 4px solid #1976d2;
      padding: 16px 20px;
      overflow: hidden;
      animation: cs-c-slide-down .25s ease-out;
    }
    @keyframes cs-c-slide-down {
      from { max-height: 0; opacity: 0; }
      to { max-height: 600px; opacity: 1; }
    }

    .cs-c-detail-theme {
      font-size: 14px;
      font-weight: 500;
      color: #1976d2;
      margin-bottom: 14px;
    }

    .cs-c-detail-section { margin-bottom: 4px; }
    .cs-c-page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #424242;
    }
    .cs-c-page-icon { color: #757575; flex-shrink: 0; }

    .cs-c-elements { padding-left: 24px; }
    .cs-c-element {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }
    .cs-c-el-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .cs-c-el-fields {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }
    .cs-c-el-field {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .cs-c-el-field label {
      font-size: 11px;
      color: #757575;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .3px;
    }
    .cs-c-el-field--sm { width: 90px; }
    .cs-c-el-field--grow { flex: 1; min-width: 140px; }
    .cs-c-el-field--full { flex: 1; min-width: 200px; }

    .cs-c-empty {
      font-size: 13px;
      color: #9e9e9e;
      font-style: italic;
      padding: 6px 0;
    }
    .cs-c-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 12px 0;
    }

    /* ─── Variant C: Hints section ─── */
    .cs-c-hints-section {
      margin-bottom: 12px;
      padding: 10px 12px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }
    .cs-c-hints-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .cs-c-hints-count {
      font-size: 11px;
      color: #757575;
      background: #eeeeee;
      border-radius: 10px;
      padding: 1px 6px;
      min-width: 16px;
      text-align: center;
      line-height: 1.4;
    }
    .cs-c-hints-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cs-c-hint-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 12px;
      color: #424242;
    }
    .cs-c-hint-chip-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .cs-c-dot--active { background: #4caf50; }
    .cs-c-dot--scheduled { background: #ff9800; }
    .cs-c-hints-none {
      font-size: 12px;
      color: #9e9e9e;
      font-style: italic;
    }

    /* ─── Variant C: Config row (Terminal Groups + Settings) ─── */
    .cs-c-config-row {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .cs-c-config-item {
      flex: 1;
      min-width: 200px;
    }
    .cs-c-config-label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 500;
      color: #616161;
      margin-bottom: 4px;
    }
    .cs-config-manage {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      font-family: 'Roboto', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #448AFF;
    }
    .cs-config-manage:hover { color: #3969D5; }

    /* ─── Variant D: Persistent Split View ─── */
    .cs-d-split {
      display: flex;
      height: calc(100vh - 200px);
      min-height: 500px;
      outline: none;
    }

    /* Left Panel */
    .cs-d-left {
      width: 360px;
      min-width: 280px;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      background: #fff;
    }
    .cs-d-left-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-d-left-title {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0,0,0,.87);
    }

    .cs-d-search {
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-d-search .cs-search-input { width: 100%; box-sizing: border-box; }

    .cs-d-list {
      flex: 1;
      overflow-y: auto;
    }

    .cs-d-accordion { border-bottom: 1px solid #f0f0f0; }
    .cs-d-accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      cursor: pointer;
      user-select: none;
      transition: background .15s;
    }
    .cs-d-accordion-header:hover { background: #fafafa; }
    .cs-d-accordion-name {
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .cs-d-accordion-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #9e9e9e;
    }
    .cs-d-accordion-body { }

    .cs-d-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      cursor: pointer;
      transition: all .15s;
      border-left: 4px solid transparent;
    }
    .cs-d-card:hover { background: #f5f5f5; }
    .cs-d-card--selected {
      background: #e3f2fd;
      border-left-color: #1976d2;
    }
    /* Tree indentation for child cards */
    .cs-d-card--display { padding-left: 40px; }
    .cs-d-card--advertise { padding-left: 64px; }

    /* Tree chevron in left panel */
    .cs-d-tree-chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #757575;
      border-radius: 4px;
      transition: all .15s;
      flex-shrink: 0;
      padding: 0;
      margin: 0;
    }
    .cs-d-tree-chevron:hover { background: #e0e0e0; color: #424242; }
    .cs-d-tree-spacer {
      display: inline-block;
      width: 24px;
      flex-shrink: 0;
    }
    .cs-d-card-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .cs-d-card-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .cs-d-card-name {
      font-size: 13px;
      font-weight: 500;
      color: rgba(0,0,0,.87);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-d-card-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .cs-d-card-theme {
      font-size: 12px;
      color: #757575;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-d-card-theme-row {
      margin-top: 2px;
      max-width: 180px;
    }
    .cs-d-card-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .cs-d-card-arrow { color: #bdbdbd; flex-shrink: 0; }

    .cs-d-empty {
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: #9e9e9e;
    }
    .cs-d-empty--big { padding: 40px 16px; }

    /* Right Panel */
    .cs-d-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fff;
      overflow: hidden;
    }
    .cs-d-right-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-d-right-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cs-d-right-title {
      font-size: 18px;
      font-weight: 500;
      color: rgba(0,0,0,.87);
      margin: 0;
    }

    .cs-d-theme-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-d-theme-label { font-size: 13px; color: #757575; font-weight: 500; }
    .cs-d-theme-value { font-size: 14px; color: rgba(0,0,0,.87); flex: 1; }

    .cs-d-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }

    .cs-d-section { margin-bottom: 4px; }
    .cs-d-page-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #424242;
    }

    .cs-d-elements { padding-left: 24px; }
    .cs-d-element {
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .cs-d-el-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .cs-d-el-fields {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }
    .cs-d-el-field {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .cs-d-el-field label {
      font-size: 11px;
      color: #757575;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .3px;
    }
    .cs-d-el-field--sm { width: 90px; }
    .cs-d-el-field--grow { flex: 1; min-width: 140px; }
    .cs-d-el-field--full { flex: 1; min-width: 200px; }
    .cs-d-el-empty {
      font-size: 13px;
      color: #9e9e9e;
      font-style: italic;
      padding: 6px 0;
    }

    .cs-d-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 16px 0;
    }

    /* ─── Variant D: Hints row ─── */
    .cs-d-hints-row {
      padding: 12px 24px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .cs-d-hints-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .cs-d-hints-icon { color: #ffa726; flex-shrink: 0; }
    .cs-d-hints-title {
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .cs-d-hints-badge {
      font-size: 11px;
      color: #fff;
      background: #757575;
      border-radius: 10px;
      padding: 1px 7px;
      min-width: 18px;
      text-align: center;
      line-height: 1.4;
    }
    .cs-d-hints-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cs-d-hint-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 12px;
      color: #424242;
    }
    .cs-d-hint-chip-status {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 3px;
      font-weight: 500;
    }
    .cs-d-hint--active { background: #e8f5e9; color: #2e7d32; }
    .cs-d-hint--scheduled { background: #fff3e0; color: #e65100; }
    .cs-d-hint--expired { background: #fce4ec; color: #c62828; }
    .cs-d-hints-none {
      font-size: 13px;
      color: #9e9e9e;
      font-style: italic;
    }

    /* ─── Variant D: Config row (Terminal Groups + Settings) ─── */
    .cs-d-config-row {
      display: flex;
      gap: 16px;
      padding: 12px 24px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .cs-d-config-item {
      flex: 1;
      min-width: 200px;
    }
    .cs-d-config-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #616161;
      margin-bottom: 4px;
    }

    /* Empty State */
    .cs-d-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 40px;
    }
    .cs-d-empty-icon { color: #bdbdbd; margin-bottom: 16px; }
    .cs-d-empty-title {
      font-size: 18px;
      font-weight: 500;
      color: #616161;
      margin: 0 0 8px;
    }
    .cs-d-empty-desc {
      font-size: 14px;
      color: #9e9e9e;
      margin: 0;
      max-width: 320px;
    }

    /* ─── Responsive ─── */
    @media (max-width: 1100px) {
      .cs-d-split {
        flex-direction: column;
        height: auto;
        min-height: 400px;
      }
      .cs-d-left {
        width: 100%;
        min-width: 0;
        max-height: 280px;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
      }
      .cs-d-right {
        min-height: 300px;
      }
      .cs-d-left::after {
        content: '⚠️ Узкий экран — рекомендуется ширина от 1100px для Split View';
        display: block;
        padding: 8px 16px;
        font-size: 11px;
        color: #e65100;
        background: #fff3e0;
        text-align: center;
        border-bottom: 1px solid #ffe0b2;
      }
      .cs-slide-panel {
        width: 90vw;
        max-width: 440px;
      }
    }

    @media (min-width: 1600px) {
      .cs-d-left {
        width: 400px;
      }
      .cs-slide-panel {
        width: 480px;
      }
    }
  `],
})
export class CsTerminalsScreenComponent {
  dataService = inject(CsDataService);
  private storage = inject(StorageService);

  // ─── Настройки источников заказов (системные, «Настройки экрана Arrivals») ───
  networkConfig: NetworkOrderSourceConfig = this.loadNetworkConfig();
  orderSources: OrderSourceRef[] = this.storage.load(
    'web-screens',
    'order-sources-refs',
    JSON.parse(JSON.stringify(MOCK_ORDER_SOURCES))
  );

  private loadNetworkConfig(): NetworkOrderSourceConfig {
    const raw = this.storage.load<NetworkOrderSourceConfig | null>('web-screens', 'order-sources-network', null);
    if (!raw || !Array.isArray(raw.commonSettings) || !Array.isArray(raw.sourceSettings) || !Array.isArray(raw.restaurants)) {
      return JSON.parse(JSON.stringify(MOCK_NETWORK_ORDER_SOURCE_CONFIG));
    }
    // Миграция старой схемы v2 (отдельное поле global) → v3 (global — запись справочника)
    const legacy = raw as unknown as {
      global?: CommonOrderSourceSetting;
      commonSettings: CommonOrderSourceSetting[];
      sourceSettings: OrderSourceSetting[];
      restaurants: RestaurantOrderSourceConfig[];
    };
    if (legacy.global) {
      const migrated: NetworkOrderSourceConfig = {
        commonSettings: [{ ...legacy.global, id: 'global', isGlobal: true }, ...legacy.commonSettings],
        sourceSettings: legacy.sourceSettings,
        restaurants: legacy.restaurants,
      };
      this.storage.save('web-screens', 'order-sources-network', migrated);
      return migrated;
    }
    return raw;
  }

  /** Стабильный список ресторанов для модалки (пересобирается при сохранении) */
  orderSourceRestaurants: OrderSourceRestaurantInfo[] = [];

  private refreshOrderSourceRestaurants(): void {
    this.orderSourceRestaurants = this.dataService.restaurants.map(r => ({ id: r.id, name: r.name }));
  }

  orderSourceBadge(restaurantId: number): string {
    const cfg = this.networkConfig.restaurants.find(r => r.restaurantId === restaurantId);
    if (!cfg || cfg.commonSettingId === null) return 'Сетевая';
    const c = this.networkConfig.commonSettings.find(x => x.id === cfg.commonSettingId);
    return c ? 'Своя: ' + c.name : 'Своя';
  }

  isOwnOrderSourceSetting(restaurantId: number): boolean {
    const cfg = this.networkConfig.restaurants.find(r => r.restaurantId === restaurantId);
    return !!cfg && cfg.commonSettingId !== null;
  }

  onOrderSourceSettingsSave(config: NetworkOrderSourceConfig): void {
    this.networkConfig = config;
    this.storage.save('web-screens', 'order-sources-network', config);
    this.showToast = true;
    this.toastType = 'success';
    this.toastMessage = 'Настройки отображения сохранены';
    setTimeout(() => (this.showToast = false), 3200);
  }

  // ─── Справочник настроек отображения уровня дисплея ───
  displaySettings: DisplaySetting[] = this.loadDisplaySettings();
  displaySettingByRow = this.loadDisplayAssignments();
  systemSettingsInitialTab: 'number' | 'displays' | 'assignment' = 'number';

  private loadDisplaySettings(): DisplaySetting[] {
    const fallback = JSON.parse(JSON.stringify(MOCK_DISPLAY_SETTINGS)) as DisplaySetting[];
    return this.storage.load<DisplaySetting[]>('web-screens', 'display-settings', fallback);
  }

  private loadDisplayAssignments(): Map<number, string> {
    const raw = this.storage.load<Record<string, string>>('web-screens', 'display-assignments', {});
    const map = new Map<number, string>();
    Object.keys(raw || {}).forEach(k => {
      const id = parseInt(k, 10);
      if (!isNaN(id) && raw[k]) map.set(id, raw[k]);
    });
    return map;
  }

  get settingsOptions(): { id: string; name: string }[] {
    return this.displaySettings.map(d => ({ id: d.id, name: d.name }));
  }

  get assignedDisplayCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const settingId of this.displaySettingByRow.values()) {
      counts[settingId] = (counts[settingId] || 0) + 1;
    }
    return counts;
  }

  openSystemSettings(tab: 'number' | 'displays' | 'assignment' = 'number'): void {
    this.systemSettingsInitialTab = tab;
    this.showSystemSettingsModal = true;
  }

  onRowSettingsChange(ev: { rowId: number; settingId: string | null }): void {
    if (ev.settingId === null) {
      this.displaySettingByRow.delete(ev.rowId);
    } else {
      this.displaySettingByRow.set(ev.rowId, ev.settingId);
    }
    this.storage.save('web-screens', 'display-assignments', Object.fromEntries(this.displaySettingByRow));
  }

  onDisplaySettingsSave(list: DisplaySetting[]): void {
    this.displaySettings = list;
    this.storage.save('web-screens', 'display-settings', list);
    // Снять с дисплеев удалённые настройки
    const alive = new Set(list.map(d => d.id));
    let removed = false;
    for (const [rowId, settingId] of Array.from(this.displaySettingByRow.entries())) {
      if (!alive.has(settingId)) {
        this.displaySettingByRow.delete(rowId);
        removed = true;
      }
    }
    if (removed) {
      this.storage.save('web-screens', 'display-assignments', Object.fromEntries(this.displaySettingByRow));
    }
  }

  ngOnInit(): void {
    this.refreshOrderSourceRestaurants();
  }

  // ─── Variant switcher ───
  activeVariant: 'A' | 'B' | 'C' | 'D' = 'A';
  variants = [
    { id: 'A' as const, label: 'A: Было', icon: 'layout-list' },
    { id: 'B' as const, label: 'B: Панель', icon: 'panel-right' },
    { id: 'C' as const, label: 'C: Строки', icon: 'chevrons-down-up' },
    { id: 'D' as const, label: 'D: Split', icon: 'columns' },
  ];

  // ─── State ───
  expandedRestaurants = new Set<number>();
  collapsedComputers = new Set<number>();   // computer row IDs that are collapsed
  selectedRowIds = new Set<number>();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  isSending = false;
  screenshotLoadingId: number | null = null;
  screenshotModal: TerminalScreenshot | null = null;
  showSystemSettingsModal = false;
  searchRestaurant = '';
  searchTerminal = '';

  // ─── Variant B: Slide-out Panel State ───
  activePanelTerminalId: number | null = null;
  panelStructure: TerminalThemeStructure | null = null;
  panelThemeId: number | null = null;
  panelTerminalGroupIds: number[] = [];
  expandedPageIdsB = new Set<number>();

  // ─── Variant C: Expandable Rows State ───
  expandedRowIdsC = new Set<number>();
  private _rowStructureCacheC = new Map<number, TerminalThemeStructure | null>();

  // ─── Variant D: Split View State ───
  selectedTerminalIdD: number | null = null;
  selectedStructureD: TerminalThemeStructure | null = null;
  selectedTerminalGroupIdsD: number[] = [];

  onDTerminalGroupsChange(ids: number[]): void {
    this.selectedTerminalGroupIdsD = [...ids];
  }

  /** Кэш для предотвращения пересоздания DOM при Change Detection */
  private _cacheBuster = 0;
  private _cacheBuiltAt = -1;
  private _filteredRestaurantsCache: CSRestaurant[] = [];
  private _visibleRowsCache = new Map<number, TerminalTableRow[]>();
  private _rowCountCache = new Map<number, number>();

  constructor() {
    const restaurants = this.dataService.restaurants;
    if (restaurants.length > 0) this.expandedRestaurants.add(restaurants[0].id);
  }

  // ═══════════════════════════════════════════
  // Кэширование строк (критично: без кэша *ngFor пересоздаёт DOM)
  // ═══════════════════════════════════════════

  invalidateCache(): void { this._cacheBuster++; }
  private _invalidateCache(): void { this._cacheBuster++; }

  private _ensureCache(): void {
    if (this._cacheBuiltAt === this._cacheBuster) return;
    this._filteredRestaurantsCache = this._computeFiltered();
    this._visibleRowsCache.clear();
    this._rowCountCache.clear();
    for (const r of this._filteredRestaurantsCache) {
      const rows = this._computeVisible(r);
      this._visibleRowsCache.set(r.id, rows);
      this._rowCountCache.set(r.id, rows.length);
    }
    this._cacheBuiltAt = this._cacheBuster;
  }

  get filteredRestaurants(): CSRestaurant[] {
    this._ensureCache();
    return this._filteredRestaurantsCache;
  }

  getVisibleRows(restaurant: CSRestaurant): TerminalTableRow[] {
    this._ensureCache();
    return this._visibleRowsCache.get(restaurant.id) ?? [];
  }

  getRowCount(restaurant: CSRestaurant): number {
    this._ensureCache();
    return this._rowCountCache.get(restaurant.id) ?? 0;
  }

  trackByRestaurantId(_i: number, r: CSRestaurant): number { return r.id; }
  trackByRowId(_i: number, row: TerminalTableRow): number { return row.id; }

  private _computeFiltered(): CSRestaurant[] {
    let list = this.dataService.restaurants;
    if (this.searchRestaurant) {
      const q = this.searchRestaurant.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    if (this.searchTerminal) {
      const q = this.searchTerminal.toLowerCase();
      list = list.filter(r =>
        r.terminals.some(t =>
          t.name.toLowerCase().includes(q) ||
          (t.screens ?? []).some(s => s.name.toLowerCase().includes(q))
        )
      );
    }
    return list;
  }

  private _computeVisible(restaurant: CSRestaurant): TerminalTableRow[] {
    const allRows = this.dataService.getTableRows(restaurant.id);
    for (const row of allRows) {
      if (row.kind === 'computer') {
        row.expanded = !this.collapsedComputers.has(row.id);
      }
    }
    if (this.collapsedComputers.size === 0) return allRows;
    return allRows.filter(row => {
      if (row.kind === 'computer') return true;
      if (row.parentComputerId == null) return true;
      return !this.collapsedComputers.has(row.parentComputerId);
    });
  }

  // ═══════════════════════════════════════════
  // Действия с ресторанами
  // ═══════════════════════════════════════════

  toggleRestaurant(id: number): void {
    this.expandedRestaurants.has(id)
      ? this.expandedRestaurants.delete(id)
      : this.expandedRestaurants.add(id);
  }

  // ═══════════════════════════════════════════
  // Выбор строк (checkbox)
  // ═══════════════════════════════════════════

  toggleRowSelect(rowId: number): void {
    this.selectedRowIds.has(rowId)
      ? this.selectedRowIds.delete(rowId)
      : this.selectedRowIds.add(rowId);
  }

  areAllRowsSelected(restaurant: CSRestaurant): boolean {
    const visible = this.getVisibleRows(restaurant);
    if (visible.length === 0) return false;
    return visible.every(r => this.selectedRowIds.has(r.id));
  }

  toggleAllRows(restaurant: CSRestaurant): void {
    const visible = this.getVisibleRows(restaurant);
    if (this.areAllRowsSelected(restaurant)) {
      visible.forEach(r => this.selectedRowIds.delete(r.id));
    } else {
      visible.forEach(r => this.selectedRowIds.add(r.id));
    }
  }

  // ═══════════════════════════════════════════
  // Раскрытие computer-строк
  // ═══════════════════════════════════════════

  toggleComputerExpand(computerId: number): void {
    if (this.collapsedComputers.has(computerId)) {
      this.collapsedComputers.delete(computerId);
    } else {
      this.collapsedComputers.add(computerId);
    }
    this._invalidateCache();
  }

  // ═══════════════════════════════════════════
  // Изменение данных через combobox
  // ═══════════════════════════════════════════

  onThemeChange(restaurantId: number, event: { rowId: number; themeId: number | null }): void {
    const parsed = this.parseRowId(event.rowId);
    if (!parsed) return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal) return;

    if (parsed.kind === 'computer') {
      terminal.themeId = event.themeId;
    } else if (parsed.kind === 'display' && terminal.screens) {
      const screen = terminal.screens.find(s => s.id === parsed.screenId);
      if (screen) {
        screen.themeId = event.themeId;
        screen.themeName = event.themeId
          ? this.dataService.themeOptions.find(o => o.id === event.themeId)?.name
          : undefined;
      }
    }
    this._invalidateCache();
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  onGroupsChange(restaurantId: number, _event: { rowId: number; groupIds: number[] }): void {
    // Терминальные группы — пока без сохранения (заглушка)
  }

  onCampaignChange(restaurantId: number, event: { rowId: number; panelId: number; campaignIds: number[] }): void {
    const parsed = this.parseRowId(event.rowId);
    if (!parsed || parsed.kind !== 'advertise') return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal?.screens) return;
    const screen = terminal.screens.find(s => s.id === parsed.screenId);
    if (!screen) return;
    const panel = screen.advertisePanels.find(p => p.id === parsed.panelId);
    if (!panel) return;
    panel.campaignIds = [...event.campaignIds];
    panel.campaignNames = event.campaignIds
      .map(id => this.dataService.campaignOptions.find(c => c.id === id)?.name)
      .filter((n): n is string => !!n);
    this._invalidateCache();
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  // ═══════════════════════════════════════════
  // Действия со строками
  // ═══════════════════════════════════════════

  onRequestScreenshot(restaurant: CSRestaurant, rowId: number): void {
    const parsed = this.parseRowId(rowId);
    if (!parsed) return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal || !terminal.supportsScreenshot || !terminal.isOnline) return;
    if (this.screenshotLoadingId) return;

    this.screenshotLoadingId = terminal.id;
    this.showToastMessage('Получение скриншота с «' + terminal.name + '»...', 'success');
    this.dataService.requestScreenshot(terminal.id)
      .then(s => { if (s) { s.restaurantName = restaurant.name; this.screenshotModal = s; } })
      .catch((e: any) => this.showToastMessage(e?.message || 'Ошибка получения скриншота', 'error'))
      .finally(() => { this.screenshotLoadingId = null; });
  }

  onDeleteRow(restaurantId: number, rowId: number): void {
    const parsed = this.parseRowId(rowId);
    if (!parsed || parsed.kind !== 'display') return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal?.screens) return;
    terminal.screens = terminal.screens.filter(s => s.id !== parsed.screenId);
    this.selectedRowIds.delete(rowId);
    this._invalidateCache();
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
    this.showToastMessage('Экран удалён', 'success');
  }

  onAddScreen(computerId: number): void {
    const terminal = this.findTerminal(computerId);
    if (!terminal) return;
    if (!terminal.screens) terminal.screens = [];
    const maxId = terminal.screens.reduce((max, s) => Math.max(max, s.id), 0);
    const newScreen = {
      id: maxId + 1,
      name: 'Новый экран ' + (maxId + 1),
      themeId: terminal.themeId,
      themeName: this.dataService.getThemeName(terminal.themeId),
      advertisePanels: [{ id: 1, name: 'Advertise панель 1', campaignIds: [], campaignNames: [] }],
    };
    terminal.screens.push(newScreen);
    this._invalidateCache();
    this.showToastMessage('Экран добавлен к «' + terminal.name + '»', 'success');
  }

  // ═══════════════════════════════════════════
  // Сохранение и отправка
  // ═══════════════════════════════════════════

  save(): void {
    this.dataService.updateRestaurants(this.dataService.restaurants);
    this.showToastMessage('Настройки терминалов сохранены', 'success');
  }

  async sendSettings(): Promise<void> {
    if (this.selectedRowIds.size === 0 || this.isSending) return;
    // Собираем ID терминалов (computer + родительские для display)
    const terminalIds = new Set<number>();
    for (const rowId of this.selectedRowIds) {
      const parsed = this.parseRowId(rowId);
      if (parsed) terminalIds.add(parsed.terminalId);
    }
    const ids = Array.from(terminalIds);
    this.isSending = true;
    this.showToastMessage('Отправка настроек на ' + ids.length + ' ' + this.getTerminalWord(ids.length) + '...', 'success');
    try {
      await this.dataService.sendSettings(ids);
      this.showToastMessage('Настройки успешно отправлены на ' + ids.length + ' ' + this.getTerminalWord(ids.length), 'success');
      this.selectedRowIds.clear();
    } catch {
      this.showToastMessage('Ошибка при отправке настроек', 'error');
    } finally {
      this.isSending = false;
    }
  }

  // ═══════════════════════════════════════════
  // Скриншот — модальное окно
  // ═══════════════════════════════════════════

  closeScreenshotModal(): void { this.screenshotModal = null; }

  getScreenshotUrl(screenshot: TerminalScreenshot): string {
    if (screenshot.imageUrl) return screenshot.imageUrl;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23263238' width='1920' height='1080'/%3E%3Crect x='40' y='40' width='1840' height='200' rx='12' fill='%2337474f'/%3E%3Ctext x='960' y='160' font-family='sans-serif' font-size='64' fill='%23fff' text-anchor='middle'%3ECustomer Screen%3C/text%3E%3C/svg%3E";
  }

  formatScreenshotTime(screenshot: TerminalScreenshot): string {
    if (!screenshot.capturedAt) return '—';
    const d = new Date(screenshot.capturedAt);
    if (isNaN(d.getTime())) return screenshot.capturedAt;
    const p = (n: number) => String(n).padStart(2, '0');
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ', ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) +
      ' (' + screenshot.timezoneLabel + ')';
  }

  // ═══════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════

  /**
   * Разбирает составной ID строки обратно в terminalId, screenId и panelId.
   * computer:  rowId === terminalId
   * display:   rowId === terminalId * 1000 + screenId
   * advertise: rowId === terminalId * 10000 + screenId * 100 + panelId
   */
  private parseRowId(rowId: number): { kind: TerminalRowKind; terminalId: number; screenId?: number; panelId?: number } | null {
    for (const r of this.dataService.restaurants) {
      for (const t of r.terminals) {
        if (rowId === t.id) return { kind: 'computer', terminalId: t.id };
        for (const s of (t.screens ?? [])) {
          if (rowId === t.id * 1000 + s.id) return { kind: 'display', terminalId: t.id, screenId: s.id };
          for (const p of (s.advertisePanels ?? [])) {
            if (rowId === t.id * 10000 + s.id * 100 + p.id) return { kind: 'advertise', terminalId: t.id, screenId: s.id, panelId: p.id };
          }
        }
      }
    }
    return null;
  }

  private findTerminal(terminalId: number): CSTerminalV2 | undefined {
    for (const r of this.dataService.restaurants) {
      const t = r.terminals.find(t => t.id === terminalId);
      if (t) return t;
    }
    return undefined;
  }

  getTerminalWord(n: number): string {
    const m10 = n % 10, m100 = n % 100;
    if (m100 >= 11 && m100 <= 19) return 'терминалов';
    if (m10 === 1) return 'терминал';
    if (m10 >= 2 && m10 <= 4) return 'терминала';
    return 'терминалов';
  }

  private showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  // ═══════════════════════════════════════════
  // Variant B: Slide-out Panel
  // ═══════════════════════════════════════════

  @HostListener('window:keydown', ['$event'])
  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.activeVariant === 'B') {
      this.closePanelB();
    }
  }

  /** Возвращает иконку Lucide для строки в зависимости от типа терминала */
  getTerminalIconB(row: TerminalTableRow): string {
    if (row.kind === 'computer') return 'monitor';
    if (row.kind === 'display') return 'monitor-smartphone';
    return 'megaphone';
  }

  /** Открыть панель для выбранной строки (только киоски) */
  openPanelB(row: TerminalTableRow): void {
    const terminalId = row.id;
    this.activePanelTerminalId = row.id;
    this.panelStructure = this.dataService.getTerminalThemeStructure(terminalId);
    this.panelThemeId = row.themeId ?? null;
    this.panelTerminalGroupIds = row.terminalGroupIds ?? [];
    this.expandedPageIdsB.clear();
  }

  /** Закрыть панель */
  closePanelB(): void {
    this.activePanelTerminalId = null;
    this.panelStructure = null;
    this.panelThemeId = null;
    this.expandedPageIdsB.clear();
  }

  /** Смена темы в панели */
  onPanelThemeChange(themeId: number | null): void {
    if (this.panelStructure) {
      this.panelStructure.themeName = themeId
        ? this.dataService.themeOptions.find(o => o.id === themeId)?.name ?? '—'
        : '—';
    }
    this.panelThemeId = themeId;
  }

  /** Терминальные группы в панели */
  onPanelTerminalGroupsChange(groupIds: number[]): void {
    this.panelTerminalGroupIds = groupIds;
  }

  /** Отфильтрованные странички (только с динам. элементами) */
  getPanelFilteredPages(): TerminalThemeStructure['pages'] {
    if (!this.panelStructure) return [];
    return this.panelStructure.pages.filter(p => p.elements.length > 0);
  }

  /** Переключить раскрытие странички в панели B */
  togglePanelPageB(pageId: number): void {
    if (this.expandedPageIdsB.has(pageId)) {
      this.expandedPageIdsB.delete(pageId);
    } else {
      this.expandedPageIdsB.add(pageId);
    }
  }

  /** Количество видимых киосков для ресторана (Variant B) */
  getKioskCountB(restaurant: CSRestaurant): number {
    return this.getVisibleRows(restaurant).filter(r => r.kind === 'computer').length;
  }

  /** Все ли киоски ресторана выбраны */
  areAllKiosksSelectedB(restaurant: CSRestaurant): boolean {
    const kiosks = this.getVisibleRows(restaurant).filter(r => r.kind === 'computer');
    if (kiosks.length === 0) return false;
    return kiosks.every(r => this.selectedRowIds.has(r.id));
  }

  /** Выбрать/снять все киоски ресторана */
  toggleAllKiosksB(restaurant: CSRestaurant): void {
    const kiosks = this.getVisibleRows(restaurant).filter(r => r.kind === 'computer');
    if (this.areAllKiosksSelectedB(restaurant)) {
      kiosks.forEach(r => this.selectedRowIds.delete(r.id));
    } else {
      kiosks.forEach(r => this.selectedRowIds.add(r.id));
    }
  }

  /** Обработчик смены кампании в панели */
  onPanelCampaignChange(el: ThemeElementInfo, ids: number[]): void {
    el.campaignIds = [...ids];
    el.campaignId = ids.length > 0 ? ids[0] : null;
    el.campaignName = ids.length > 0
      ? ids.map(id => this.dataService.campaignOptions.find(c => c.id === id)?.name).filter(Boolean).join(', ')
      : '';

    // Синхронизируем обратно в исходные данные
    if (el.sourceTerminalId != null && el.sourceScreenId != null && el.sourcePanelId != null) {
      const terminal = this.findTerminal(el.sourceTerminalId);
      if (terminal?.screens) {
        const screen = terminal.screens.find(s => s.id === el.sourceScreenId);
        if (screen) {
          const panel = screen.advertisePanels.find(p => p.id === el.sourcePanelId);
          if (panel) {
            panel.campaignIds = [...ids];
            panel.campaignNames = ids
              .map(id => this.dataService.campaignOptions.find(c => c.id === id)?.name)
              .filter((n): n is string => !!n);
            this.invalidateCache();
          }
        }
      }
    }
  }

  /** Обработчик изменения ID элемента в панели */
  onPanelElementIdChange(el: ThemeElementInfo, event: Event): void {
    el.elementId = (event.target as HTMLInputElement).value;
  }

  /** Обработчик изменения тегов в панели */
  onPanelTagsChange(el: ThemeElementInfo, event: Event): void {
    el.tags = (event.target as HTMLInputElement).value;
  }

  // ═══════════════════════════════════════════
  // Variant C: Expandable Rows
  // ═══════════════════════════════════════════

  /** Получить структуру темы для строки (с кэшированием) */
  getRowThemeStructureC(row: TerminalTableRow): TerminalThemeStructure | null {
    if (this._rowStructureCacheC.has(row.id)) {
      return this._rowStructureCacheC.get(row.id)!;
    }
    const terminalId = row.kind === 'display' && row.parentComputerId
      ? row.parentComputerId
      : row.id;
    const struct = this.dataService.getTerminalThemeStructure(terminalId);
    this._rowStructureCacheC.set(row.id, struct);
    return struct;
  }

  /** Переключить раскрытие строки */
  toggleRowC(row: TerminalTableRow): void {
    if (this.expandedRowIdsC.has(row.id)) {
      this.expandedRowIdsC.delete(row.id);
    } else {
      this.expandedRowIdsC.add(row.id);
      // Предзагрузка структуры
      if (!this._rowStructureCacheC.has(row.id)) {
        this.getRowThemeStructureC(row);
      }
    }
  }

  /** Развернуть все строки ресторана */
  expandAllC(restaurant: CSRestaurant): void {
    const rows = this.getVisibleRows(restaurant);
    for (const row of rows) {
      this.expandedRowIdsC.add(row.id);
      if (!this._rowStructureCacheC.has(row.id)) {
        this.getRowThemeStructureC(row);
      }
    }
  }

  /** Свернуть все строки ресторана */
  collapseAllC(restaurant: CSRestaurant): void {
    const rows = this.getVisibleRows(restaurant);
    for (const row of rows) {
      this.expandedRowIdsC.delete(row.id);
    }
  }

  // ═══════════════════════════════════════════
  // Variant D: Persistent Split View
  // ═══════════════════════════════════════════

  /** Выбрать терминал в левой панели */
  selectTerminalD(row: TerminalTableRow): void {
    this.selectedTerminalIdD = row.id;
    const terminalId = row.kind === 'display' && row.parentComputerId
      ? row.parentComputerId
      : row.id;
    this.selectedStructureD = this.dataService.getTerminalThemeStructure(terminalId);
  }

  /** Навигация клавиатурой в Split View */
  onSplitKeydownD(event: KeyboardEvent): void {
    // Стрелки для навигации будут работать через DOM (tabindex на карточках)
    if (event.key === 'Escape') {
      this.selectedTerminalIdD = null;
      this.selectedStructureD = null;
    }
  }
}
