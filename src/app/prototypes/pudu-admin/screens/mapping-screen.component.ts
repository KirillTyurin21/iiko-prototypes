import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiBadgeComponent,
  UiConfirmDialogComponent,
  SelectOption,
} from '@/components/ui';
import { Robot, RobotPoint, DiningTable, TableMapping } from '../types';
import { MOCK_ROBOTS, MOCK_TABLES, MOCK_POINTS, getInitialMapping } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';
import { PuduPrototypeComponent } from '../pudu-prototype.component';

interface DropdownPointOption {
  point_id: string;
  point_name: string;
  isFree: boolean;
  occupiedByTable?: string;
}

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: 'default' | 'warning';
}

@Component({
  selector: 'app-mapping-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiBadgeComponent,
    UiConfirmDialogComponent,
  ],
  template: `
    <!-- LOADING STATE -->
    <ng-container *ngIf="isLoading">
      <div class="flex-1 flex items-center justify-center">
        <svg class="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    </ng-container>

    <!-- NO ROBOTS STATE -->
    <ng-container *ngIf="!isLoading && robots.length === 0">
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <lucide-icon name="bot" [size]="48" class="text-gray-300 mx-auto mb-4"></lucide-icon>
          <p class="text-gray-500 mb-3">Зарегистрируйте робота для настройки маппинга</p>
          <a
            class="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer hover:underline"
            (click)="goToRobots()"
          >Перейти к роботам</a>
        </div>
      </div>
    </ng-container>

    <!-- MAIN CONTENT -->
    <ng-container *ngIf="!isLoading && robots.length > 0">
      <!-- SUBHEADER (v1.4: breadcrumb) -->
      <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Назад к списку ресторанов"
              (click)="goBack()"
            >
              <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
              <span>Назад к списку ресторанов</span>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <!-- Segmented Control -->
            <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
              <button
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
                [ngClass]="mappingMode === 'tables-to-points'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'"
                (click)="setMappingMode('tables-to-points')"
              >Столы → Точки</button>
              <button
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
                [ngClass]="mappingMode === 'points-to-tables'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'"
                (click)="setMappingMode('points-to-tables')"
              >Точки → Столы</button>
            </div>
          </div>
        </div>
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-sm mt-2" aria-label="Breadcrumb">
          <a class="text-gray-400 hover:text-blue-600 hover:underline cursor-pointer transition-colors" (click)="goBack()">Настройки PUDU</a>
          <lucide-icon name="chevron-right" [size]="14" class="text-gray-300"></lucide-icon>
          <span class="text-gray-400">{{ parent.selectedRestaurant?.restaurant_name || 'Ресторан' }}</span>
          <lucide-icon name="chevron-right" [size]="14" class="text-gray-300"></lucide-icon>
          <span class="text-gray-900 font-medium">Маппинг столов</span>
        </nav>
      </div>

      <!-- LOADING POINTS -->
      <ng-container *ngIf="isLoadingPoints">
        <div class="flex-1 flex items-center justify-center">
          <svg class="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      </ng-container>

      <!-- TABLE CONTENT -->
      <div *ngIf="!isLoadingPoints" class="overflow-y-auto flex-1 p-6 animate-fade-in">
        <!-- v1.4: TOOLBAR — Hall filter + Refresh points -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2" *ngIf="hallOptions.length > 1">
            <label class="text-sm font-medium text-gray-700">Зал</label>
            <select
              class="w-64 h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              [(ngModel)]="selectedHall"
              (ngModelChange)="onHallFilterChange()"
              aria-label="Фильтр столов по залу ресторана"
            >
              <option value="">Все залы</option>
              <option *ngFor="let h of hallOptions" [value]="h.value">{{ h.label }}</option>
            </select>
          </div>
          <div *ngIf="hallOptions.length <= 1"></div>
          <ui-button
            variant="ghost"
            size="sm"
            [iconName]="isRefreshing ? '' : 'refresh-cw'"
            (click)="refreshPoints()"
            aria-label="Обновить список точек с карты робота"
          >
            <lucide-icon
              *ngIf="isRefreshing"
              name="refresh-cw"
              [size]="14"
              class="animate-spin"
            ></lucide-icon>
            Обновить точки
          </ui-button>
        </div>

        <!-- INFO HINT -->
        <div class="border border-blue-200 bg-blue-50/50 rounded-lg p-4 flex items-start gap-3 mb-4">
          <lucide-icon name="info" [size]="18" class="text-blue-500 shrink-0 mt-0.5"></lucide-icon>
          <p class="text-sm text-gray-700">Маппинг столов к точкам един для всего заведения и действует для всех зарегистрированных роботов. Названия точек загружены из карты зала робота (NE). Настройка выполняется инженером NE.</p>
        </div>

        <!-- WARNINGS -->
        <div class="space-y-3 mb-6" *ngIf="currentUnmappedTablesCount > 0">
          <div
            class="border border-orange-200 bg-orange-50/50 rounded-lg p-5 flex items-start gap-3"
            role="alert"
          >
            <lucide-icon name="alert-triangle" [size]="20" class="text-orange-500 shrink-0 mt-0.5"></lucide-icon>
            <p class="text-sm text-gray-700">
              <strong>{{ currentUnmappedTablesCount }}</strong> {{ currentUnmappedTablesLabel }} не {{ currentUnmappedTablesVerb }} привязки к точкам робота. Робот не сможет доставить заказ к этим столам.
            </p>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- MODE: TABLES → POINTS (v1.3)                -->
        <!-- ═══════════════════════════════════════════ -->
        <div *ngIf="mappingMode === 'tables-to-points'" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48" title="Название стола из конфигурации залов iiko. Для ручных столов — введённый пользователем номер">Стол iiko</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Точки на карте робота, привязанные к этому столу. Один стол может иметь несколько точек подъезда (1:N)">Привязанные точки</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20" title="Индикатор наличия привязки точек к столу. Зелёный — стол замаплен, серый — нет привязки">Статус</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let mapping of filteredMappings" class="hover:bg-gray-50/50">
                    <!-- Стол iiko (v1.9: L4 бейдж, L5 удаление) -->
                    <td class="px-4 py-3 align-top">
                      <div class="flex items-center gap-2">
                        <div>
                          <span class="font-medium text-sm text-gray-900">{{ getTableName(mapping.table_id) }}</span>
                          <span *ngIf="getTableSection(mapping.table_id)" class="ml-2 text-xs text-gray-400">{{ getTableSection(mapping.table_id) }}</span>
                          <span *ngIf="isManualTable(mapping.table_id)" class="ml-2 text-xs text-gray-400 italic">(ручной)</span>
                        </div>
                        <button
                          *ngIf="isManualTable(mapping.table_id)"
                          class="ml-auto text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                          [attr.aria-label]="'Удалить ручной стол «' + getTableName(mapping.table_id) + '»'"
                          (click)="confirmDeleteManualTable(mapping.table_id); $event.stopPropagation()"
                        >
                          <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                        </button>
                      </div>
                    </td>

                    <!-- Привязанные точки -->
                    <td class="px-4 py-3 align-top">
                      <div class="space-y-2">
                        <div *ngFor="let point of mapping.points; let j = index" class="flex items-center gap-2">
                          <div class="relative flex-1 max-w-xs">
                            <!-- Триггер дропдауна -->
                            <button
                              type="button"
                              class="w-full h-9 px-3 text-left rounded-md border bg-white transition-colors text-sm truncate"
                              [ngClass]="{
                                'border-blue-500 ring-1 ring-blue-500': isDropdownOpen(getMappingIndex(mapping), j),
                                'border-gray-300 hover:border-gray-400': !isDropdownOpen(getMappingIndex(mapping), j),
                                'font-mono text-gray-900': point.point_id,
                                'text-gray-400 italic': !point.point_id
                              }"
                              (click)="toggleDropdown(getMappingIndex(mapping), j, $event)"
                            >{{ point.point_id ? point.point_name : 'Выберите точку...' }}</button>
                            <!-- Дропдаун список -->
                            <div
                              *ngIf="isDropdownOpen(getMappingIndex(mapping), j)"
                              class="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            >
                              <!-- Не назначена -->
                              <button
                                type="button"
                                class="w-full px-3 py-2 text-left text-sm italic text-gray-400 hover:bg-gray-50"
                                (click)="selectPointFromDropdown(getMappingIndex(mapping), j, '')"
                              >Не назначена</button>
                              <!-- Свободные точки -->
                              <ng-container *ngIf="getDropdownOptions(getMappingIndex(mapping), j).free.length > 0">
                                <div class="border-t border-gray-200"></div>
                                <button
                                  *ngFor="let opt of getDropdownOptions(getMappingIndex(mapping), j).free"
                                  type="button"
                                  class="w-full px-3 py-2 text-left font-mono text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  (click)="selectPointFromDropdown(getMappingIndex(mapping), j, opt.point_id)"
                                >{{ opt.point_name }}</button>
                              </ng-container>
                              <!-- Занятые точки -->
                              <ng-container *ngIf="getDropdownOptions(getMappingIndex(mapping), j).occupied.length > 0">
                                <div class="border-t border-gray-200"></div>
                                <button
                                  *ngFor="let opt of getDropdownOptions(getMappingIndex(mapping), j).occupied"
                                  type="button"
                                  class="w-full px-3 py-2 text-left font-mono text-sm text-gray-400 hover:bg-orange-50 hover:text-orange-600"
                                  (click)="selectPointFromDropdown(getMappingIndex(mapping), j, opt.point_id)"
                                >{{ opt.point_name }} <span class="italic font-sans text-xs">({{ opt.occupiedByTable }})</span></button>
                              </ng-container>
                            </div>
                          </div>
                          <button
                            class="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            (click)="removePoint(getMappingIndex(mapping), j)"
                            [attr.aria-label]="'Удалить привязку точки ' + point.point_name + ' от стола ' + getTableName(mapping.table_id)"
                            title="Удалить привязку"
                          >
                            <lucide-icon name="x" [size]="16"></lucide-icon>
                          </button>
                        </div>
                        <button
                          type="button"
                          class="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          (click)="addPoint(getMappingIndex(mapping))"
                          [attr.aria-label]="'Добавить привязку точки к столу ' + getTableName(mapping.table_id)"
                        >
                          <lucide-icon name="plus" [size]="14"></lucide-icon>
                          Точку
                        </button>
                      </div>
                    </td>

                    <!-- Статус -->
                    <td class="px-4 py-3 text-center align-top">
                      <div class="pt-1.5">
                        <lucide-icon
                          *ngIf="mapping.points.length > 0 && hasAnyMappedPoint(mapping)"
                          name="check-circle-2"
                          [size]="18"
                          class="text-green-600"
                          title="Стол привязан к точке робота"
                        ></lucide-icon>
                        <lucide-icon
                          *ngIf="mapping.points.length === 0 || !hasAnyMappedPoint(mapping)"
                          name="circle"
                          [size]="18"
                          class="text-gray-300"
                          title="Стол не привязан к точке — робот не сможет доставить заказ"
                        ></lucide-icon>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- v1.9 L3: Кнопка «+ Ручной стол» и inline-форма -->
        <div class="mt-4 mb-2" *ngIf="mappingMode === 'tables-to-points'">
          <button
            *ngIf="!showManualTableForm"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Добавить ручной стол для фудкорта"
            (click)="openManualTableForm()"
          >
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            Ручной стол
          </button>
          <div *ngIf="showManualTableForm" class="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg max-w-lg animate-fade-in">
            <div class="flex-1 space-y-1">
              <label for="manual-table-name" class="text-sm font-medium text-gray-700">Номер / название стола</label>
              <input
                id="manual-table-name"
                type="text"
                class="w-48 h-9 rounded-md border px-3 text-sm outline-none transition-colors"
                [ngClass]="{
                  'border-red-500 focus:ring-red-500 focus:border-red-500': manualTableError,
                  'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500': !manualTableError
                }"
                [(ngModel)]="manualTableName"
                (ngModelChange)="manualTableError = ''"
                (keydown.enter)="handleAddManualTable()"
                (keydown.escape)="closeManualTableForm()"
                placeholder="Номер / название стола"
                maxlength="50"
                aria-label="Номер или название ручного стола"
              />
              <p *ngIf="manualTableError" class="text-xs text-red-500">{{ manualTableError }}</p>
              <p class="text-xs text-gray-400">Максимум 50 символов. Для фудкортов без столов в системе</p>
            </div>
            <div class="flex items-end gap-1.5 pt-6">
              <ui-button size="sm" variant="primary" [disabled]="!manualTableName.trim() || !!manualTableError" (click)="handleAddManualTable()">Добавить</ui-button>
              <ui-button size="sm" variant="ghost" (click)="closeManualTableForm()">Отмена</ui-button>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- MODE: POINTS → TABLES (v1.3)                -->
        <!-- ═══════════════════════════════════════════ -->
        <div *ngIf="mappingMode === 'points-to-tables'" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48" title="Название точки на карте робота">Точка робота</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Стол iiko, привязанный к этой точке робота">Привязанный стол</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20" title="Индикатор наличия привязки стола к точке">Статус</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let point of availablePoints; let pi = index" class="hover:bg-gray-50/50">
                    <!-- Точка робота -->
                    <td class="px-4 py-3">
                      <div class="font-medium font-mono text-sm text-gray-600">{{ point.point_name }}</div>
                    </td>

                    <!-- Привязанный стол -->
                    <td class="px-4 py-3">
                      <div class="max-w-xs">
                        <select
                          class="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          (change)="onTableSelectChange(point.point_id, $event)"
                        >
                          <option value="" [selected]="!pointToTableMap[point.point_id]">Не назначена</option>
                          <option *ngFor="let opt of cachedTableOptions; trackBy: trackOptionValue" [value]="opt.value" [selected]="pointToTableMap[point.point_id] === opt.value">{{ opt.label }}</option>
                        </select>
                      </div>
                    </td>

                    <!-- Статус -->
                    <td class="px-4 py-3 text-center">
                      <lucide-icon
                        *ngIf="pointToTableMap[point.point_id]"
                        name="check-circle-2"
                        [size]="18"
                        class="text-green-600"
                        title="Стол привязан к точке робота"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="!pointToTableMap[point.point_id]"
                        name="circle"
                        [size]="18"
                        class="text-gray-300"
                        title="Стол не привязан к точке — робот не сможет доставить заказ"
                      ></lucide-icon>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- STICKY FOOTER -->
      <div *ngIf="!isLoadingPoints" class="border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-end gap-3 shrink-0">
        <ui-button
          variant="outline"
          size="sm"
          [disabled]="!hasChanges"
          (click)="resetMapping()"
          aria-label="Отменить несохранённые изменения маппинга"
        >Сбросить</ui-button>
        <ui-button
          variant="primary"
          size="sm"
          [disabled]="!hasChanges"
          (click)="saveMapping()"
          aria-label="Сохранить маппинг столов к точкам"
        >Сохранить</ui-button>
      </div>
    </ng-container>

    <!-- v1.9 L5: Диалог подтверждения удаления ручного стола -->
    <ui-confirm-dialog
      [open]="!!tableToDelete"
      title="Удалить ручной стол?"
      [message]="'Удалить ручной стол «' + (tableToDelete?.table_name || '') + '»? Привязанные точки будут освобождены.'"
      confirmText="Удалить"
      confirmVariant="danger"
      (confirmed)="deleteManualTable()"
      (cancelled)="tableToDelete = null"
    ></ui-confirm-dialog>

    <!-- DROPDOWN BACKDROP -->
    <div *ngIf="openDropdownKey" class="fixed inset-0 z-40" (click)="closeDropdown()"></div>

    <!-- TOAST CONTAINER -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let t of toasts; trackBy: trackToast"
        class="rounded-lg border px-4 py-3 shadow-lg min-w-[300px] animate-slide-up"
        [ngClass]="{
          'border-gray-200 bg-white': t.variant !== 'warning',
          'border-orange-300 bg-orange-50': t.variant === 'warning'
        }"
      >
        <p class="text-sm font-medium" [ngClass]="t.variant === 'warning' ? 'text-orange-800' : 'text-gray-900'">{{ t.title }}</p>
        <p *ngIf="t.description" class="text-xs mt-0.5" [ngClass]="t.variant === 'warning' ? 'text-orange-600' : 'text-gray-500'">{{ t.description }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }
    `,
  ],
})
export class MappingScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);
  parent = inject(PuduPrototypeComponent);

  // Data
  robots: Robot[] = [];
  tables: DiningTable[] = [];
  availablePoints: RobotPoint[] = [];
  mappings: TableMapping[] = [];
  originalMappings: TableMapping[] = [];

  // State
  isLoading = true;
  isLoadingPoints = false;
  isRefreshing = false;
  hasChanges = false;
  mappingMode: 'tables-to-points' | 'points-to-tables' = 'tables-to-points';

  // v1.4: Hall filter
  selectedHall = '';
  hallOptions: { value: string; label: string }[] = [];

  // Dropdown state (v1.3)
  openDropdownKey: string | null = null;

  // Points→Tables cached lookups (fix: avoid method calls in template)
  pointToTableMap: Record<string, string> = {};          // point_id → table_id
  cachedTableOptions: SelectOption[] = [];                // pre-computed table options for selects

  // Toast
  toasts: Toast[] = [];
  private toastCounter = 0;

  // v1.9 L3: Manual table form state
  showManualTableForm = false;
  manualTableName = '';
  manualTableError = '';
  manualIdCounter = 3; // next ID: manual-003

  // v1.9 L5: Table to delete (manual only)
  tableToDelete: DiningTable | null = null;

  ngOnInit(): void {
    setTimeout(() => {
      this.robots = this.storage.load('pudu-admin', 'robots', MOCK_ROBOTS);
      this.tables = this.storage.load('pudu-admin', 'tables', [...MOCK_TABLES]);
      this.availablePoints = [...MOCK_POINTS];
      this.loadMappings();
      this.isLoading = false;
      this.initHallOptions();
    }, 1000);
  }

  // ── Data loading ───────────────────────────────────────

  loadMappings(): void {
    this.isLoadingPoints = true;
    this.openDropdownKey = null;
    setTimeout(() => {
      const defaultMappings = getInitialMapping().map((m) => ({
        ...m,
        points: m.points.map((p) => ({ ...p })),
      }));
      this.mappings = this.storage.load('pudu-admin', 'mappings', defaultMappings);
      this.originalMappings = this.cloneMappings(this.mappings);
      this.hasChanges = false;
      this.rebuildPointToTableCache();
      this.isLoadingPoints = false;
    }, 1000);
  }

  // ── Mode switch ────────────────────────────────────────

  setMappingMode(mode: 'tables-to-points' | 'points-to-tables'): void {
    if (this.mappingMode === mode) return;
    this.mappingMode = mode;
    this.openDropdownKey = null;
    this.rebuildPointToTableCache();
  }

  // ── Refresh points ─────────────────────────────────────

  refreshPoints(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.openDropdownKey = null;
    setTimeout(() => {
      this.isRefreshing = false;
      this.showToast('Список точек обновлён');
    }, 1500);
  }

  // ── Table helpers ──────────────────────────────────────

  getTableName(tableId: string): string {
    return this.tables.find((t) => t.table_id === tableId)?.table_name || tableId;
  }

  getTableSection(tableId: string): string {
    return this.tables.find((t) => t.table_id === tableId)?.section_name || '';
  }

  // ── Custom dropdown (v1.3) ─────────────────────────────

  toggleDropdown(rowIndex: number, pointIndex: number, event: Event): void {
    event.stopPropagation();
    const key = `${rowIndex}-${pointIndex}`;
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
  }

  isDropdownOpen(rowIndex: number, pointIndex: number): boolean {
    return this.openDropdownKey === `${rowIndex}-${pointIndex}`;
  }

  closeDropdown(): void {
    this.openDropdownKey = null;
  }

  // ── Dropdown options — full pool (v1.3 E3) ────────────

  getDropdownOptions(rowIndex: number, pointIndex: number): { free: DropdownPointOption[]; occupied: DropdownPointOption[] } {
    // Points already assigned to THIS table in OTHER select slots
    const sameTablePointIds = new Set<string>();
    this.mappings[rowIndex].points.forEach((p, pi) => {
      if (pi !== pointIndex && p.point_id) {
        sameTablePointIds.add(p.point_id);
      }
    });

    const free: DropdownPointOption[] = [];
    const occupied: DropdownPointOption[] = [];

    for (const point of this.availablePoints) {
      // Skip points already in this same table at different slots
      if (sameTablePointIds.has(point.point_id)) continue;

      // Check if occupied by another table
      let occupiedByTableId = '';
      for (const m of this.mappings) {
        if (m.table_id === this.mappings[rowIndex].table_id) continue;
        if (m.points.some((p) => p.point_id === point.point_id)) {
          occupiedByTableId = m.table_id;
          break;
        }
      }

      if (occupiedByTableId) {
        occupied.push({
          point_id: point.point_id,
          point_name: point.point_name,
          isFree: false,
          occupiedByTable: this.getTableName(occupiedByTableId),
        });
      } else {
        free.push({
          point_id: point.point_id,
          point_name: point.point_name,
          isFree: true,
        });
      }
    }

    return { free, occupied };
  }

  // ── Exclusive point assignment (v1.3 E2) ──────────────

  selectPointFromDropdown(rowIndex: number, pointIndex: number, pointId: string): void {
    this.openDropdownKey = null;

    if (!pointId) {
      // "Не назначена" — clear this slot
      this.mappings[rowIndex].points[pointIndex] = { point_id: '', point_name: '' };
      this.recalcChanges();
      this.rebuildPointToTableMap();
      return;
    }

    const point = this.availablePoints.find((p) => p.point_id === pointId);
    if (!point) return;

    // Check if point is occupied by another table
    let oldTableId = '';
    for (const m of this.mappings) {
      if (m.table_id === this.mappings[rowIndex].table_id) continue;
      const idx = m.points.findIndex((p) => p.point_id === pointId);
      if (idx >= 0) {
        oldTableId = m.table_id;
        m.points.splice(idx, 1); // Remove from old table
        break;
      }
    }

    // Assign to current table
    this.mappings[rowIndex].points[pointIndex] = { ...point };

    // Show warning toast if transferred
    if (oldTableId) {
      const oldTableName = this.getTableName(oldTableId);
      const newTableName = this.getTableName(this.mappings[rowIndex].table_id);
      this.showToast(
        'Точка перенесена',
        `Точка ${point.point_name} перенесена со стола ${oldTableName} на стол ${newTableName}`,
        4000,
        'warning'
      );
    }

    this.recalcChanges();
    this.rebuildPointToTableMap();
  }

  // ── Add / Remove points ────────────────────────────────

  addPoint(rowIndex: number): void {
    const newIndex = this.mappings[rowIndex].points.length;
    this.mappings[rowIndex].points.push({
      point_id: '',
      point_name: '',
    });
    // Auto-open dropdown for new slot
    this.openDropdownKey = `${rowIndex}-${newIndex}`;
    this.recalcChanges();
    this.rebuildPointToTableMap();
  }

  removePoint(rowIndex: number, pointIndex: number): void {
    this.openDropdownKey = null;
    this.mappings[rowIndex].points.splice(pointIndex, 1);
    this.recalcChanges();
    this.rebuildPointToTableMap();
  }

  // ── Points→Tables mode helpers ─────────────────────────

  /** Rebuild only the point→table lookup map. Safe to call on every mapping mutation
   *  without disrupting select options DOM. */
  private rebuildPointToTableMap(): void {
    const map: Record<string, string> = {};
    for (const m of this.mappings) {
      for (const p of m.points) {
        if (p.point_id) {
          map[p.point_id] = m.table_id;
        }
      }
    }
    this.pointToTableMap = map;
  }

  /** Rebuild cached table options for selects. Only call when hall filter or tables change
   *  (NOT on every mapping mutation — that would recreate options and break <select> binding). */
  private rebuildCachedTableOptions(): void {
    const tablesToShow = this.selectedHall
      ? this.tables.filter(t => t.section_name === this.selectedHall || t.is_manual)
      : this.tables;
    this.cachedTableOptions = tablesToShow.map(t => ({
      value: t.table_id,
      label: t.is_manual ? `${t.table_name} (ручной)` : `${t.table_name} — ${t.section_name}`,
    }));
  }

  /** Rebuild both map and options. Use on init, load, mode switch, hall filter change. */
  rebuildPointToTableCache(): void {
    this.rebuildPointToTableMap();
    this.rebuildCachedTableOptions();
  }

  getTableIdForPoint(pointId: string): string {
    for (const m of this.mappings) {
      if (m.points.some((p) => p.point_id === pointId)) {
        return m.table_id;
      }
    }
    return '';
  }

  filteredTableOptionsForPoint(pointId: string): SelectOption[] {
    const tablesToShow = this.selectedHall
      ? this.tables.filter(t => t.section_name === this.selectedHall)
      : this.tables;
    return tablesToShow.map(t => ({
      value: t.table_id,
      label: `${t.table_name} — ${t.section_name}`,
    }));
  }

  trackOptionValue(_: number, opt: SelectOption): string {
    return opt.value;
  }

  /** Handle native (change) event from the <select> in Points→Tables mode */
  onTableSelectChange(pointId: string, event: Event): void {
    const newTableId = (event.target as HTMLSelectElement).value;
    this.onTableChangeForPoint(pointId, newTableId);
  }

  onTableChangeForPoint(pointId: string, newTableId: string): void {
    const point = this.availablePoints.find((p) => p.point_id === pointId);
    if (!point) return;

    // Remove point from old table
    for (const m of this.mappings) {
      m.points = m.points.filter((p) => p.point_id !== pointId);
    }

    // Add point to new table (if not empty)
    if (newTableId) {
      const targetMapping = this.mappings.find((m) => m.table_id === newTableId);
      if (targetMapping) {
        targetMapping.points.push({ ...point });
      }
    }

    // Only rebuild the map, NOT the options (to avoid select DOM disruption)
    this.rebuildPointToTableMap();
    this.recalcChanges();
  }

  // ── Status helpers ─────────────────────────────────────

  hasAnyMappedPoint(mapping: TableMapping): boolean {
    return mapping.points.some((p) => !!p.point_id);
  }

  // ── Warnings ───────────────────────────────────────────

  get unmappedTablesCount(): number {
    return this.mappings.filter(
      (m) => m.points.length === 0 || !m.points.some((p) => !!p.point_id)
    ).length;
  }

  /** Count of unmapped tables considering current mode and hall filter */
  get currentUnmappedTablesCount(): number {
    if (this.mappingMode === 'tables-to-points') {
      // In tables->points mode, count from filtered mappings
      const source = this.selectedHall ? this.filteredMappings : this.mappings;
      return source.filter(
        (m) => m.points.length === 0 || !m.points.some((p) => !!p.point_id)
      ).length;
    } else {
      // In points->tables mode, count tables (filtered by hall) that have NO point assigned
      // v1.9 L8: Include manual tables in count regardless of hall filter
      const tablesToCheck = this.selectedHall
        ? this.tables.filter(t => t.section_name === this.selectedHall || t.is_manual)
        : this.tables;
      return tablesToCheck.filter(t => {
        const mapping = this.mappings.find(m => m.table_id === t.table_id);
        return !mapping || mapping.points.length === 0 || !mapping.points.some(p => !!p.point_id);
      }).length;
    }
  }

  get currentUnmappedTablesLabel(): string {
    const n = this.currentUnmappedTablesCount;
    if (n % 10 === 1 && n % 100 !== 11) return 'стол';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'стола';
    return 'столов';
  }

  get currentUnmappedTablesVerb(): string {
    const n = this.currentUnmappedTablesCount;
    if (n % 10 === 1 && n % 100 !== 11) return 'имеет';
    return 'имеют';
  }

  // ── Save / Reset ───────────────────────────────────────

  saveMapping(): void {
    this.originalMappings = this.cloneMappings(this.mappings);
    this.storage.save('pudu-admin', 'mappings', this.mappings);
    this.storage.save('pudu-admin', 'tables', this.tables);
    this.hasChanges = false;
    this.showToast('Маппинг сохранён');
  }

  resetMapping(): void {
    this.mappings = this.cloneMappings(this.originalMappings);
    this.tables = this.storage.load('pudu-admin', 'tables', [...MOCK_TABLES]);
    this.hasChanges = false;
    this.openDropdownKey = null;
    this.rebuildPointToTableCache();
    this.initHallOptions();
  }

  // ── Change tracking ────────────────────────────────────

  private recalcChanges(): void {
    this.hasChanges = JSON.stringify(this.mappings) !== JSON.stringify(this.originalMappings);
  }

  private cloneMappings(src: TableMapping[]): TableMapping[] {
    return src.map((m) => ({
      ...m,
      points: m.points.map((p) => ({ ...p })),
    }));
  }

  // ── Navigation ─────────────────────────────────────────

  goToRobots(): void {
    this.router.navigate(['/prototype/pudu-admin']);
  }

  goBack(): void {
    this.parent.clearRestaurantContext();
    this.router.navigate(['/prototype/pudu-admin']);
  }

  // ── v1.9: Manual tables ────────────────────────────────

  isManualTable(tableId: string): boolean {
    return this.tables.find(t => t.table_id === tableId)?.is_manual === true;
  }

  openManualTableForm(): void {
    this.showManualTableForm = true;
    this.manualTableName = '';
    this.manualTableError = '';
  }

  closeManualTableForm(): void {
    this.showManualTableForm = false;
    this.manualTableName = '';
    this.manualTableError = '';
  }

  handleAddManualTable(): void {
    const name = this.manualTableName.trim();

    if (!name) {
      this.manualTableError = 'Введите номер или название стола';
      return;
    }
    if (name.length > 50) {
      this.manualTableError = 'Максимум 50 символов';
      return;
    }
    const isDuplicate = this.tables.some(
      t => t.table_name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      this.manualTableError = `Стол «${name}» уже существует`;
      return;
    }

    const newTable: DiningTable = {
      table_id: `manual-${String(this.manualIdCounter).padStart(3, '0')}`,
      table_name: name,
      section_name: '',
      is_manual: true,
    };
    this.manualIdCounter++;

    this.tables = [...this.tables, newTable];
    this.mappings = [...this.mappings, { table_id: newTable.table_id, points: [] }];
    this.hasChanges = true;

    this.closeManualTableForm();
    this.rebuildPointToTableCache();
    this.showToast(`Ручной стол «${name}» добавлен`);
  }

  confirmDeleteManualTable(tableId: string): void {
    const table = this.tables.find(t => t.table_id === tableId);
    if (table && table.is_manual) {
      this.tableToDelete = table;
    }
  }

  deleteManualTable(): void {
    if (!this.tableToDelete) return;
    const name = this.tableToDelete.table_name;
    const id = this.tableToDelete.table_id;

    this.tables = this.tables.filter(t => t.table_id !== id);
    this.mappings = this.mappings.filter(m => m.table_id !== id);
    this.hasChanges = true;
    this.tableToDelete = null;

    this.rebuildPointToTableCache();
    this.showToast(`Ручной стол «${name}» удалён`);
  }

  // ── v1.4: Hall filter ─────────────────────────────────

  initHallOptions(): void {
    const sections = new Set<string>();
    this.tables.forEach(t => {
      if (t.section_name) sections.add(t.section_name);
    });
    this.hallOptions = Array.from(sections).map(s => ({ value: s, label: s }));
  }

  onHallFilterChange(): void {
    // Filter is applied via get filteredMappings
    this.rebuildPointToTableCache();
  }

  get filteredMappings(): TableMapping[] {
    if (!this.selectedHall) return this.sortedMappings(this.mappings);
    const filtered = this.mappings.filter(m => {
      const table = this.tables.find(t => t.table_id === m.table_id);
      if (!table) return true;
      // v1.9 L8: Manual tables always visible regardless of hall filter
      if (table.is_manual) return true;
      if (!table.section_name) return true;
      return table.section_name === this.selectedHall;
    });
    return this.sortedMappings(filtered);
  }

  /** v1.9 L8: Sort mappings — iiko tables first, manual tables at the end */
  private sortedMappings(mappings: TableMapping[]): TableMapping[] {
    return [...mappings].sort((a, b) => {
      const tableA = this.tables.find(t => t.table_id === a.table_id);
      const tableB = this.tables.find(t => t.table_id === b.table_id);
      const aManual = tableA?.is_manual ?? false;
      const bManual = tableB?.is_manual ?? false;
      if (aManual && !bManual) return 1;
      if (!aManual && bManual) return -1;
      return (tableA?.table_name || '').localeCompare(tableB?.table_name || '', 'ru');
    });
  }

  getMappingIndex(mapping: TableMapping): number {
    return this.mappings.findIndex(m => m.table_id === mapping.table_id);
  }

  // ── Toast ──────────────────────────────────────────────

  showToast(title: string, description?: string, duration = 3000, variant: 'default' | 'warning' = 'default'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, title, description, variant });
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, duration);
  }

  trackToast(_: number, item: Toast): number {
    return item.id;
  }
}
