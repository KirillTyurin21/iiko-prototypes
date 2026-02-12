import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UiButtonComponent,
  UiTabsComponent,
  UiInputComponent,
  UiSelectComponent,
  UiCheckboxComponent,
  UiConfirmDialogComponent,
} from '@/components/ui';
import type { TabItem, SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { ScenarioSettings, Robot } from '../types';
import { MOCK_ROBOTS, getInitialSettings } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';

@Component({
  selector: 'app-settings-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiTabsComponent,
    UiInputComponent,
    UiSelectComponent,
    UiCheckboxComponent,
    UiConfirmDialogComponent,
    IconsModule,
  ],
  host: {
    style: 'display: flex; flex-direction: column; flex: 1; overflow: hidden;',
  },
  template: `
    <!-- Loading state -->
    <div *ngIf="loading" class="flex-1 flex items-center justify-center">
      <lucide-icon name="loader-2" [size]="32" class="animate-spin text-app-primary"></lucide-icon>
    </div>

    <!-- No robots state -->
    <div *ngIf="!loading && robots.length === 0" class="flex-1 flex items-center justify-center">
      <p class="text-gray-500 text-sm">Зарегистрируйте робота для настройки параметров</p>
    </div>

    <!-- Content -->
    <ng-container *ngIf="!loading && robots.length > 0">
      <!-- Header -->
      <div class="px-6 pt-5 pb-4">
        <h1 class="text-xl font-semibold text-gray-900">Настройки роботов</h1>
      </div>

      <!-- Tabs -->
      <div class="px-6">
        <ui-tabs [tabs]="tabItems" [activeTab]="activeTab" (tabChange)="onTabChange($event)"></ui-tabs>
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="max-w-2xl space-y-6 animate-fade-in">

          <!-- TAB 1: Доставка меню -->
          <ng-container *ngIf="activeTab === 'send_menu'">
            <!-- Фраза робота при доставке -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза робота при доставке</label>
              <ui-input
                [(value)]="settings.send_menu.phrase"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.send_menu.phrase)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза, которую робот произнесёт у стола. Максимум 180 символов</span>
                <span class="text-xs" [ngClass]="settings.send_menu.phrase.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.send_menu.phrase.length }} / 180
                </span>
              </div>
            </div>

            <!-- Время ожидания у стола -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания у стола (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.send_menu.wait_time"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
                max="600"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает у стола</p>
            </div>

            <!-- Действие после выполнения -->
            <ui-select
              label="Действие после выполнения"
              [options]="afterActionOptions"
              [value]="settings.send_menu.after_action"
              (valueChange)="settings.send_menu.after_action = toAfterAction($event)"
            ></ui-select>
            <p class="text-xs text-gray-400 -mt-4">Что делает робот после завершения задачи</p>
          </ng-container>

          <!-- TAB 2: Доставка блюд -->
          <ng-container *ngIf="activeTab === 'send_dish'">
            <!-- Макс. блюд за рейс -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Макс. блюд за рейс <span class="text-red-500">*</span></label>
              <input
                type="number"
                [(ngModel)]="settings.send_dish.max_dishes_per_trip"
                class="w-full h-9 rounded border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                [ngClass]="getNumberError(settings.send_dish.max_dishes_per_trip, 1, 20) ? 'border-red-500' : 'border-border'"
                min="1"
                max="20"
              />
              <p class="text-xs mt-1" [ngClass]="getNumberError(settings.send_dish.max_dishes_per_trip, 1, 20) ? 'text-red-500' : 'text-gray-400'">
                {{ getNumberError(settings.send_dish.max_dishes_per_trip, 1, 20) || 'Максимальное количество блюд за один рейс (не более 20)' }}
              </p>
            </div>

            <!-- Фраза при доставке -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при доставке</label>
              <ui-input
                [(value)]="settings.send_dish.phrase_delivery"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.send_dish.phrase_delivery)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза робота при подъезде к столу с блюдами</span>
                <span class="text-xs" [ngClass]="settings.send_dish.phrase_delivery.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.send_dish.phrase_delivery.length }} / 180
                </span>
              </div>
            </div>

            <!-- Погружаемая фраза про блюда -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Погружаемая фраза про блюда</label>
              <ui-input
                [(value)]="settings.send_dish.phrase_dishes_info"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.send_dish.phrase_dishes_info)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Информационная фраза о доставляемых блюдах</span>
                <span class="text-xs" [ngClass]="settings.send_dish.phrase_dishes_info.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.send_dish.phrase_dishes_info.length }} / 180
                </span>
              </div>
            </div>

            <!-- Фраза про поднос для клиента -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза про поднос для клиента</label>
              <ui-input
                [(value)]="settings.send_dish.phrase_tray"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.send_dish.phrase_tray)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза-инструкция для клиента по использованию подноса</span>
                <span class="text-xs" [ngClass]="settings.send_dish.phrase_tray.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.send_dish.phrase_tray.length }} / 180
                </span>
              </div>
            </div>

            <!-- Время ожидания у стола -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания у стола (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.send_dish.wait_time"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает у стола</p>
            </div>

            <!-- Действие после задачи -->
            <ui-select
              label="Действие после задачи"
              [options]="afterActionOptions"
              [value]="settings.send_dish.after_action"
              (valueChange)="settings.send_dish.after_action = toAfterAction($event)"
            ></ui-select>
          </ng-container>

          <!-- TAB 3: Уборка посуды -->
          <ng-container *ngIf="activeTab === 'cleanup'">
            <!-- Mode toggle -->
            <div class="flex items-center gap-3">
              <button
                (click)="settings.cleanup.mode = 'manual'"
                class="text-sm transition-colors"
                [ngClass]="settings.cleanup.mode === 'manual' ? 'font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'"
              >Ручной</button>
              <div
                class="relative w-10 h-5 rounded-full cursor-pointer transition-colors"
                [ngClass]="settings.cleanup.mode === 'auto' ? 'bg-blue-600' : 'bg-gray-300'"
                (click)="toggleCleanupMode()"
              >
                <div
                  class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow"
                  [ngClass]="settings.cleanup.mode === 'auto' ? 'left-5' : 'left-0.5'"
                ></div>
              </div>
              <button
                (click)="settings.cleanup.mode = 'auto'"
                class="text-sm transition-colors"
                [ngClass]="settings.cleanup.mode === 'auto' ? 'font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'"
              >Авто</button>
            </div>

            <!-- Фраза при подъезде к столу -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при подъезде к столу</label>
              <ui-input
                [(value)]="settings.cleanup.phrase_arrival"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.cleanup.phrase_arrival)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза робота при прибытии к столу для уборки</span>
                <span class="text-xs" [ngClass]="settings.cleanup.phrase_arrival.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.cleanup.phrase_arrival.length }} / 180
                </span>
              </div>
            </div>

            <!-- Время ожидания у стола -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания у стола (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.cleanup.wait_time"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает, пока гость положит посуду</p>
            </div>

            <!-- Фраза «приеду позже» -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза «приеду позже»</label>
              <ui-input
                [(value)]="settings.cleanup.phrase_later"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.cleanup.phrase_later)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза, если гость не положил посуду по истечении времени ожидания</span>
                <span class="text-xs" [ngClass]="settings.cleanup.phrase_later.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.cleanup.phrase_later.length }} / 180
                </span>
              </div>
            </div>

            <!-- Auto mode fields -->
            <div *ngIf="settings.cleanup.mode === 'auto'" class="space-y-6 animate-fade-in">
              <h3 class="text-base font-semibold text-gray-900 pt-2">Автоматический режим</h3>

              <!-- Таймер после доставки блюда -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Таймер после доставки блюда (мин)</label>
                <input
                  type="number"
                  [(ngModel)]="settings.cleanup.auto_timer_after_delivery"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                  min="1"
                />
                <p class="text-xs text-gray-400 mt-1">Через сколько минут после доставки блюда робот приедет для уборки</p>
                <p class="text-xs text-gray-400 mt-0.5 italic">Рекомендуемое: 12–14 мин</p>
              </div>

              <!-- Таймер после закрытия чека -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Таймер после закрытия чека (мин)</label>
                <input
                  type="number"
                  [(ngModel)]="settings.cleanup.auto_timer_after_check"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                  min="0"
                />
                <p class="text-xs text-gray-400 mt-1">Через сколько минут после закрытия чека робот приедет для уборки. 0 — сразу</p>
              </div>
            </div>
          </ng-container>

          <!-- TAB 4: Оплата по QR -->
          <ng-container *ngIf="activeTab === 'qr_payment'">
            <!-- Section: Кассир -->
            <h3 class="text-base font-semibold text-gray-900">Фаза: Кассир</h3>

            <!-- Фраза у кассира -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза у кассира</label>
              <ui-input
                [(value)]="settings.qr_payment.cashier_phrase"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.qr_payment.cashier_phrase)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза робота у кассы</span>
                <span class="text-xs" [ngClass]="settings.qr_payment.cashier_phrase.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.qr_payment.cashier_phrase.length }} / 180
                </span>
              </div>
            </div>

            <!-- Тайм-аут ожидания у кассира -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Тайм-аут ожидания у кассира (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.qr_payment.cashier_timeout"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
              />
            </div>

            <!-- Divider -->
            <hr class="border-t border-gray-200" />

            <!-- Section: Гость -->
            <h3 class="text-base font-semibold text-gray-900">Фаза: Гость</h3>

            <!-- Время ожидания оплаты -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания оплаты (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.qr_payment.guest_wait_time"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
              />
            </div>

            <!-- Фраза при успешной оплате -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при успешной оплате</label>
              <ui-input
                [(value)]="settings.qr_payment.phrase_success"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.qr_payment.phrase_success)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза после успешной оплаты</span>
                <span class="text-xs" [ngClass]="settings.qr_payment.phrase_success.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.qr_payment.phrase_success.length }} / 180
                </span>
              </div>
            </div>

            <!-- Фраза при неуспешной оплате -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при неуспешной оплате</label>
              <ui-input
                [(value)]="settings.qr_payment.phrase_failure"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.qr_payment.phrase_failure)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза при отклонении оплаты</span>
                <span class="text-xs" [ngClass]="settings.qr_payment.phrase_failure.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.qr_payment.phrase_failure.length }} / 180
                </span>
              </div>
            </div>

            <!-- Действие после задачи -->
            <ui-select
              label="Действие после задачи"
              [options]="afterActionOptions"
              [value]="settings.qr_payment.after_action"
              (valueChange)="settings.qr_payment.after_action = toAfterAction($event)"
            ></ui-select>
          </ng-container>

          <!-- TAB 5: Маркетинг -->
          <ng-container *ngIf="activeTab === 'marketing'">
            <!-- Warning card -->
            <div class="border border-orange-200 bg-orange-50/50 rounded-lg p-5">
              <div class="flex gap-3">
                <lucide-icon name="alert-triangle" [size]="20" class="text-orange-500 shrink-0 mt-0.5"></lucide-icon>
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">Загрузка рекламных материалов</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    Загрузка рекламных материалов (видео, изображения, аудио) производится через приложение PuduLink.
                    Обратитесь к инженеру NE для настройки контента. В будущем функция будет доступна через Signage.
                  </p>
                </div>
              </div>
            </div>

            <!-- Робот для маркетинга -->
            <ui-select
              label="Робот для маркетинга"
              [options]="robotOptions"
              [value]="settings.marketing.robot_id"
              (valueChange)="settings.marketing.robot_id = $event"
              placeholder="Выберите робота"
            ></ui-select>

            <!-- Автозапуск круиза при простое -->
            <ui-checkbox
              label="Автозапуск круиза при простое"
              [(checked)]="settings.marketing.auto_cruise_on_idle"
            ></ui-checkbox>

            <!-- Запуск по таймеру -->
            <ui-checkbox
              label="Запуск по таймеру"
              [(checked)]="settings.marketing.timer_enabled"
            ></ui-checkbox>

            <!-- Timer fields -->
            <div *ngIf="settings.marketing.timer_enabled" class="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Время начала</label>
                <input
                  type="time"
                  [(ngModel)]="settings.marketing.timer_start"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Время окончания</label>
                <input
                  type="time"
                  [(ngModel)]="settings.marketing.timer_end"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                />
              </div>
            </div>
          </ng-container>

          <!-- TAB 6: Общие -->
          <ng-container *ngIf="activeTab === 'general'">
            <ui-select
              label="Робот по умолчанию"
              [options]="robotOptions"
              [value]="settings.general.default_robot_id"
              (valueChange)="settings.general.default_robot_id = $event"
              placeholder="Выберите робота"
            ></ui-select>
          </ng-container>

        </div>
      </div>

      <!-- Sticky footer -->
      <div class="border-t border-gray-200 bg-white px-6 py-3 flex items-center gap-3 shrink-0">
        <ui-button
          variant="primary"
          iconName="save"
          [disabled]="!hasChanges"
          (click)="save()"
        >Сохранить</ui-button>
        <ui-button
          variant="outline"
          [disabled]="!hasChanges"
          (click)="resetSettings()"
        >Сбросить</ui-button>
      </div>
    </ng-container>

    <!-- Toast -->
    <div
      *ngIf="toastVisible"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-slide-up"
    >
      <lucide-icon name="check-circle-2" [size]="18"></lucide-icon>
      {{ toastMessage }}
    </div>

    <!-- Confirm dialog for unsaved changes -->
    <ui-confirm-dialog
      [open]="confirmDialogOpen"
      title="Несохранённые изменения"
      message="Сохранить перед переходом?"
      confirmText="Сохранить"
      cancelText="Не сохранять"
      (confirmed)="onConfirmSave()"
      (cancelled)="onDiscardChanges()"
    ></ui-confirm-dialog>
  `,
})
export class SettingsScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);

  loading = true;
  robots: Robot[] = [];
  settings!: ScenarioSettings;
  originalSettings = '';

  activeTab = 'send_menu';
  pendingTab = '';

  toastVisible = false;
  toastMessage = '';
  confirmDialogOpen = false;

  tabItems: TabItem[] = [
    { key: 'send_menu', label: 'Доставка меню' },
    { key: 'send_dish', label: 'Доставка блюд' },
    { key: 'cleanup', label: 'Уборка посуды' },
    { key: 'qr_payment', label: 'Оплата по QR' },
    { key: 'marketing', label: 'Маркетинг' },
    { key: 'general', label: 'Общие' },
  ];

  afterActionOptions: SelectOption[] = [
    { value: 'idle', label: 'Режим ожидания' },
    { value: 'marketing', label: 'Маркетинг' },
  ];

  robotOptions: SelectOption[] = [];

  ngOnInit(): void {
    // Simulate loading
    setTimeout(() => {
      this.robots = [...MOCK_ROBOTS];
      this.settings = this.storage.load('pudu-admin', 'settings', getInitialSettings());
      this.originalSettings = JSON.stringify(this.settings);
      this.robotOptions = this.robots.map(r => ({
        value: r.id,
        label: `${r.name} (${r.id})`,
      }));
      this.loading = false;
    }, 1000);
  }

  get hasChanges(): boolean {
    if (!this.settings) return false;
    return JSON.stringify(this.settings) !== this.originalSettings;
  }

  onTabChange(key: string): void {
    if (this.hasChanges) {
      this.pendingTab = key;
      this.confirmDialogOpen = true;
      // Reset activeTab back since UiTabsComponent already changed it visually
      // We'll change it after dialog resolution
    } else {
      this.activeTab = key;
    }
  }

  onConfirmSave(): void {
    this.confirmDialogOpen = false;
    this.saveInternal();
    this.activeTab = this.pendingTab;
    this.pendingTab = '';
  }

  onDiscardChanges(): void {
    this.confirmDialogOpen = false;
    // Revert to original
    this.settings = JSON.parse(this.originalSettings);
    this.activeTab = this.pendingTab;
    this.pendingTab = '';
  }

  save(): void {
    this.saveInternal();
    this.showToast('Изменения сохранены');
  }

  resetSettings(): void {
    this.settings = JSON.parse(this.originalSettings);
  }

  toggleCleanupMode(): void {
    this.settings.cleanup.mode =
      this.settings.cleanup.mode === 'manual' ? 'auto' : 'manual';
  }

  toAfterAction(val: string): 'idle' | 'marketing' {
    return val === 'marketing' ? 'marketing' : 'idle';
  }

  // --- Phrase helpers ---

  getPhraseError(value: string): string {
    if (value.length > 180) {
      return 'Превышен лимит 180 символов';
    }
    return '';
  }

  getPhraseCounter(value: string): string {
    return `${value.length} / 180`;
  }

  // --- Number validation ---

  getNumberError(value: number, min: number, max?: number): string {
    if (value < min) return `Значение должно быть не менее ${min}`;
    if (max !== undefined && value > max) return `Значение должно быть не более ${max}`;
    return '';
  }

  // --- Internal ---

  private saveInternal(): void {
    this.originalSettings = JSON.stringify(this.settings);
    this.storage.save('pudu-admin', 'settings', this.settings);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}
