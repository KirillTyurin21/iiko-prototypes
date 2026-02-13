import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiSelectComponent,
  UiBadgeComponent,
  UiConfirmDialogComponent,
  SelectOption,
} from '@/components/ui';
import { Robot, RobotPoint, DiningTable, TableMapping } from '../types';
import { MOCK_ROBOTS, MOCK_TABLES, MOCK_POINTS, getInitialMapping } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';

interface PointTestState {
  loading: boolean;
  success: boolean;
}

interface Toast {
  id: number;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-mapping-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiSelectComponent,
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
      <!-- SUBHEADER -->
      <div class="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
        <h1 class="text-lg font-semibold text-gray-900">Маппинг столов</h1>
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
          <!-- Refresh button -->
          <ui-button
            variant="ghost"
            size="sm"
            [iconName]="isRefreshing ? '' : 'refresh-cw'"
            (click)="refreshPoints()"
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
        <!-- INFO HINT -->
        <div class="border border-blue-200 bg-blue-50/50 rounded-lg p-4 flex items-start gap-3 mb-4">
          <lucide-icon name="info" [size]="18" class="text-blue-500 shrink-0 mt-0.5"></lucide-icon>
          <p class="text-sm text-gray-700">Маппинг столов к точкам един для всего заведения и действует для всех зарегистрированных роботов. Названия точек загружены из карты зала робота (NE). Настройка выполняется инженером NE.</p>
        </div>

        <!-- WARNINGS -->
        <div class="space-y-3 mb-6" *ngIf="unmappedTablesCount > 0">
          <div
            class="border border-orange-200 bg-orange-50/50 rounded-lg p-5 flex items-start gap-3"
          >
            <lucide-icon name="alert-triangle" [size]="20" class="text-orange-500 shrink-0 mt-0.5"></lucide-icon>
            <p class="text-sm text-gray-700">
              <strong>{{ unmappedTablesCount }}</strong> {{ unmappedTablesLabel }} не {{ unmappedTablesVerb }} привязки к точкам робота. Робот не сможет доставить заказ к этим столам.
            </p>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- MODE: TABLES → POINTS                       -->
        <!-- ═══════════════════════════════════════════ -->
        <div *ngIf="mappingMode === 'tables-to-points'" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Стол iiko</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Привязанные точки</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Статус</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Действия</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let mapping of mappings; let i = index" class="hover:bg-gray-50/50">
                    <!-- Стол iiko -->
                    <td class="px-4 py-3 align-top">
                      <div class="font-medium text-sm text-gray-900">{{ getTableName(mapping.table_id) }}</div>
                      <div class="text-xs text-gray-500">{{ getTableSection(mapping.table_id) }}</div>
                    </td>

                    <!-- Привязанные точки -->
                    <td class="px-4 py-3 align-top">
                      <div class="space-y-2">
                        <div *ngFor="let point of mapping.points; let j = index" class="flex items-center gap-2">
                          <div class="flex-1 max-w-xs">
                            <ui-select
                              [options]="getAvailablePointOptions(i, j)"
                              [value]="point.point_id"
                              placeholder="Выберите точку..."
                              (valueChange)="onPointChange(i, j, $event)"
                              [fullWidth]="true"
                            ></ui-select>
                          </div>
                          <button
                            class="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            (click)="removePoint(i, j)"
                            title="Удалить привязку"
                          >
                            <lucide-icon name="x" [size]="16"></lucide-icon>
                          </button>
                        </div>
                        <ui-button
                          variant="ghost"
                          size="sm"
                          iconName="plus"
                          (click)="addPoint(i)"
                        >Точку</ui-button>
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
                        ></lucide-icon>
                        <lucide-icon
                          *ngIf="mapping.points.length === 0 || !hasAnyMappedPoint(mapping)"
                          name="circle"
                          [size]="18"
                          class="text-gray-300"
                        ></lucide-icon>
                      </div>
                    </td>

                    <!-- Действия -->
                    <td class="px-4 py-3 align-top">
                      <div class="space-y-2">
                        <div *ngFor="let point of mapping.points; let j = index">
                          <ng-container *ngIf="point.point_id">
                            <div class="h-9 flex items-center justify-center">
                              <ui-button
                                *ngIf="getPointTestState('t2p', i, j).loading"
                                variant="outline"
                                size="sm"
                                [loading]="true"
                                [disabled]="true"
                              ></ui-button>
                              <div *ngIf="!getPointTestState('t2p', i, j).loading && getPointTestState('t2p', i, j).success">
                                <lucide-icon name="check-circle-2" [size]="18" class="text-green-600"></lucide-icon>
                              </div>
                              <ui-button
                                *ngIf="!getPointTestState('t2p', i, j).loading && !getPointTestState('t2p', i, j).success"
                                variant="outline"
                                size="sm"
                                [disabled]="!hasOnlineRobot()"
                                (click)="testPoint('t2p', i, j)"
                              >Тест</ui-button>
                            </div>
                          </ng-container>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- MODE: POINTS → TABLES                       -->
        <!-- ═══════════════════════════════════════════ -->
        <div *ngIf="mappingMode === 'points-to-tables'" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Точка робота</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Привязанный стол</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Статус</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Действия</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let point of availablePoints; let pi = index" class="hover:bg-gray-50/50">
                    <!-- Точка робота -->
                    <td class="px-4 py-3">
                      <div class="font-medium text-sm text-gray-900">{{ point.point_name }}</div>
                    </td>

                    <!-- Привязанный стол -->
                    <td class="px-4 py-3">
                      <div class="max-w-xs">
                        <ui-select
                          [options]="tableOptionsForPoint(point.point_id)"
                          [value]="getTableIdForPoint(point.point_id)"
                          placeholder="Не назначена"
                          (valueChange)="onTableChangeForPoint(point.point_id, $event)"
                          [fullWidth]="true"
                        ></ui-select>
                      </div>
                    </td>

                    <!-- Статус -->
                    <td class="px-4 py-3 text-center">
                      <lucide-icon
                        *ngIf="getTableIdForPoint(point.point_id)"
                        name="check-circle-2"
                        [size]="18"
                        class="text-green-600"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="!getTableIdForPoint(point.point_id)"
                        name="circle"
                        [size]="18"
                        class="text-gray-300"
                      ></lucide-icon>
                    </td>

                    <!-- Действия -->
                    <td class="px-4 py-3 text-center">
                      <div class="h-9 flex items-center justify-center">
                        <ui-button
                          *ngIf="getPointTestState('p2t', pi, 0).loading"
                          variant="outline"
                          size="sm"
                          [loading]="true"
                          [disabled]="true"
                        ></ui-button>
                        <div *ngIf="!getPointTestState('p2t', pi, 0).loading && getPointTestState('p2t', pi, 0).success">
                          <lucide-icon name="check-circle-2" [size]="18" class="text-green-600"></lucide-icon>
                        </div>
                        <ui-button
                          *ngIf="!getPointTestState('p2t', pi, 0).loading && !getPointTestState('p2t', pi, 0).success"
                          variant="outline"
                          size="sm"
                          [disabled]="!hasOnlineRobot() || !getTableIdForPoint(point.point_id)"
                          (click)="testPoint('p2t', pi, 0)"
                        >Тест</ui-button>
                      </div>
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
        >Сбросить</ui-button>
        <ui-button
          variant="primary"
          size="sm"
          [disabled]="!hasChanges"
          (click)="saveMapping()"
        >Сохранить</ui-button>
      </div>
    </ng-container>

    <!-- TOAST CONTAINER -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let t of toasts; trackBy: trackToast"
        class="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg min-w-[300px] animate-slide-up"
      >
        <p class="text-sm font-medium text-gray-900">{{ t.title }}</p>
        <p *ngIf="t.description" class="text-xs text-gray-500 mt-0.5">{{ t.description }}</p>
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

  // Point test states: key = "prefix-rowIndex-pointIndex"
  pointTestStates: Record<string, PointTestState> = {};

  // Toast
  toasts: Toast[] = [];
  private toastCounter = 0;

  ngOnInit(): void {
    setTimeout(() => {
      this.robots = [...MOCK_ROBOTS];
      this.tables = [...MOCK_TABLES];
      this.availablePoints = [...MOCK_POINTS];
      this.loadMappings();
      this.isLoading = false;
    }, 1000);
  }

  // ── Data loading ───────────────────────────────────────

  loadMappings(): void {
    this.isLoadingPoints = true;
    this.pointTestStates = {};
    setTimeout(() => {
      const defaultMappings = getInitialMapping().map((m) => ({
        ...m,
        points: m.points.map((p) => ({ ...p })),
      }));
      this.mappings = this.storage.load('pudu-admin', 'mappings', defaultMappings);
      this.originalMappings = this.cloneMappings(this.mappings);
      this.hasChanges = false;
      this.isLoadingPoints = false;
    }, 1000);
  }

  // ── Mode switch ────────────────────────────────────────

  setMappingMode(mode: 'tables-to-points' | 'points-to-tables'): void {
    if (this.mappingMode === mode) return;
    this.mappingMode = mode;
    this.pointTestStates = {};
  }

  // ── Refresh points ─────────────────────────────────────

  refreshPoints(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
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

  // ── Point options (filtered) — Tables→Points mode ─────

  getAvailablePointOptions(rowIndex: number, pointIndex: number): SelectOption[] {
    const usedPointIds = new Set<string>();
    this.mappings.forEach((m, ri) => {
      m.points.forEach((p, pi) => {
        if (p.point_id && !(ri === rowIndex && pi === pointIndex)) {
          usedPointIds.add(p.point_id);
        }
      });
    });

    return this.availablePoints
      .filter((p) => !usedPointIds.has(p.point_id))
      .map((p) => ({
        value: p.point_id,
        label: p.point_name,
      }));
  }

  // ── Point change — Tables→Points mode ─────────────────

  onPointChange(rowIndex: number, pointIndex: number, pointId: string): void {
    const point = this.availablePoints.find((p) => p.point_id === pointId);
    if (point) {
      this.mappings[rowIndex].points[pointIndex] = { ...point };
    }
    this.recalcChanges();
  }

  // ── Add / Remove points ────────────────────────────────

  addPoint(rowIndex: number): void {
    this.mappings[rowIndex].points.push({
      point_id: '',
      point_name: '',
    });
    this.recalcChanges();
  }

  removePoint(rowIndex: number, pointIndex: number): void {
    this.mappings[rowIndex].points.splice(pointIndex, 1);
    this.cleanTestStatesForRow('t2p', rowIndex);
    this.recalcChanges();
  }

  // ── Points→Tables mode helpers ─────────────────────────

  getTableIdForPoint(pointId: string): string {
    for (const m of this.mappings) {
      if (m.points.some((p) => p.point_id === pointId)) {
        return m.table_id;
      }
    }
    return '';
  }

  tableOptionsForPoint(pointId: string): SelectOption[] {
    const opts: SelectOption[] = [
      { value: '', label: 'Не назначена' },
    ];
    this.tables.forEach((t) => {
      opts.push({
        value: t.table_id,
        label: `${t.table_name} — ${t.section_name}`,
      });
    });
    return opts;
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

    this.recalcChanges();
  }

  // ── Status helpers ─────────────────────────────────────

  hasAnyMappedPoint(mapping: TableMapping): boolean {
    return mapping.points.some((p) => !!p.point_id);
  }

  hasOnlineRobot(): boolean {
    return this.robots.some((r) => r.connection_status === 'online');
  }

  // ── Test point ─────────────────────────────────────────

  getPointTestState(prefix: string, rowIndex: number, pointIndex: number): PointTestState {
    const key = `${prefix}-${rowIndex}-${pointIndex}`;
    return this.pointTestStates[key] || { loading: false, success: false };
  }

  testPoint(prefix: string, rowIndex: number, pointIndex: number): void {
    const key = `${prefix}-${rowIndex}-${pointIndex}`;

    if (!this.hasOnlineRobot()) {
      this.showToast('Нет роботов в сети', 'Проверьте подключение роботов', 4000);
      return;
    }

    this.pointTestStates[key] = { loading: true, success: false };

    setTimeout(() => {
      this.pointTestStates[key] = { loading: false, success: true };
      this.showToast('Тест точки выполнен', 'Робот успешно достиг точки');
      setTimeout(() => {
        this.pointTestStates[key] = { loading: false, success: false };
      }, 3000);
    }, 2000);
  }

  private cleanTestStatesForRow(prefix: string, rowIndex: number): void {
    const keysToDelete = Object.keys(this.pointTestStates).filter((k) =>
      k.startsWith(`${prefix}-${rowIndex}-`)
    );
    keysToDelete.forEach((k) => delete this.pointTestStates[k]);
  }

  // ── Warnings ───────────────────────────────────────────

  get unmappedTablesCount(): number {
    return this.mappings.filter(
      (m) => m.points.length === 0 || !m.points.some((p) => !!p.point_id)
    ).length;
  }

  get unmappedTablesLabel(): string {
    const n = this.unmappedTablesCount;
    if (n % 10 === 1 && n % 100 !== 11) return 'стол';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'стола';
    return 'столов';
  }

  get unmappedTablesVerb(): string {
    const n = this.unmappedTablesCount;
    if (n % 10 === 1 && n % 100 !== 11) return 'имеет';
    return 'имеют';
  }

  // ── Save / Reset ───────────────────────────────────────

  saveMapping(): void {
    this.originalMappings = this.cloneMappings(this.mappings);
    this.storage.save('pudu-admin', 'mappings', this.mappings);
    this.hasChanges = false;
    this.showToast('Маппинг сохранён');
  }

  resetMapping(): void {
    this.mappings = this.cloneMappings(this.originalMappings);
    this.hasChanges = false;
    this.pointTestStates = {};
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

  // ── Toast ──────────────────────────────────────────────

  showToast(title: string, description?: string, duration = 3000): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, title, description });
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, duration);
  }

  trackToast(_: number, item: Toast): number {
    return item.id;
  }
}
