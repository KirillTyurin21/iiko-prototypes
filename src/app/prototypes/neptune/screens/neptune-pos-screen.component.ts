import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { ModalType, PaymentType, PanelState, MockGuest, IdentifyMethod, ErrorScenario, ExternalDataEntry, DemoRoles, ApiLogEntry, ServiceContext } from '../types';
import {
  MOCK_GUEST, MOCK_GUESTS, MOCK_ORDER, ERROR_SCENARIOS, PLUGIN_CONFIG, DEMO_ROLES,
} from '../data/mock-data';
import { NeptuneGuestProfileDialogComponent } from '../components/dialogs/guest-profile-dialog.component';
import { NeptunePinEntryDialogComponent } from '../components/dialogs/pin-entry-dialog.component';
import { NeptuneGuestListDialogComponent } from '../components/dialogs/guest-list-dialog.component';
import { NeptunePaymentCashlessDialogComponent } from '../components/dialogs/payment-cashless-dialog.component';
import { NeptunePaymentLoyaltyDialogComponent } from '../components/dialogs/payment-loyalty-dialog.component';
import { NeptuneLoadingDialogComponent } from '../components/dialogs/loading-dialog.component';
import { NeptuneSuccessDialogComponent } from '../components/dialogs/success-dialog.component';
import { NeptuneErrorDialogComponent } from '../components/dialogs/error-dialog.component';
import { NeptuneIdentifyMethodDialogComponent } from '../components/dialogs/identify-method-dialog.component';

@Component({
  selector: 'app-neptune-pos-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    NeptuneGuestProfileDialogComponent,
    NeptunePinEntryDialogComponent,
    NeptuneGuestListDialogComponent,
    NeptunePaymentCashlessDialogComponent,
    NeptunePaymentLoyaltyDialogComponent,
    NeptuneLoadingDialogComponent,
    NeptuneSuccessDialogComponent,
    NeptuneErrorDialogComponent,
    NeptuneIdentifyMethodDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50" style="font-family: Roboto, sans-serif;">

      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-6 py-4">
          <nav class="text-sm text-gray-400 mb-2">
            <a (click)="goBack()" class="text-blue-500 hover:underline cursor-pointer">← Каталог</a>
            <span class="mx-1">/</span>
            <span class="text-gray-600">POS-панель</span>
          </nav>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <lucide-icon name="terminal" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                Интерактивная POS-панель
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Имитация панели плагина на экране заказа Front
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-6xl mx-auto px-6 py-6">

        <!-- Переключатель состояния панели -->
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon name="toggle-left" [size]="18" class="text-gray-400"></lucide-icon>
          <span class="text-sm text-gray-500">Состояние панели:</span>
          <div class="flex gap-2">
            <button *ngFor="let ps of panelStates"
                    (click)="panelState = ps.value"
                    class="px-3 py-1.5 rounded text-sm transition-colors"
                    [ngClass]="panelState === ps.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">
              {{ ps.label }}
            </button>
          </div>
        </div>

        <!-- Переключатель контекста (3.13) -->
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon name="utensils" [size]="18" class="text-gray-400"></lucide-icon>
          <span class="text-sm text-gray-500">Контекст:</span>
          <div class="flex gap-2">
            <button (click)="serviceContext = 'restaurant'"
                    class="px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5"
                    [ngClass]="serviceContext === 'restaurant'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">
              <lucide-icon name="utensils" [size]="14"></lucide-icon>
              Ресторан
            </button>
            <button (click)="serviceContext = 'fastfood'"
                    class="px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5"
                    [ngClass]="serviceContext === 'fastfood'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">
              <lucide-icon name="coffee" [size]="14"></lucide-icon>
              Фаст-фуд
            </button>
          </div>
          <span class="text-xs text-gray-400 ml-2">
            {{ serviceContext === 'restaurant' ? 'TTL 5 мин, пречек, несколько оплат' : 'TTL 5 мин, быстрое закрытие, одна оплата' }}
          </span>
        </div>

        <!-- Ролевая модель (демо) -->
        <div class="mb-4">
          <button (click)="showRolesPanel = !showRolesPanel"
                  class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <lucide-icon name="key-round" [size]="14"></lucide-icon>
            <span>Настройки ролей</span>
            <lucide-icon [name]="showRolesPanel ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-icon>
          </button>

          <div *ngIf="showRolesPanel"
               class="mt-2 bg-white rounded-lg border border-gray-200 p-4 animate-fade-in">
            <div class="grid grid-cols-2 gap-x-8 gap-y-1">
              <div>
                <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">Доступ к функциям</div>
                <label *ngFor="let r of accessRoles" class="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="demoRoles[r.key]"
                         class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">{{ r.label }}</span>
                  <code class="text-[10px] text-gray-400 ml-auto">{{ r.key }}</code>
                </label>
              </div>
              <div>
                <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">Видимость данных</div>
                <label *ngFor="let r of visibilityRoles" class="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="demoRoles[r.key]"
                         class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700">{{ r.label }}</span>
                  <code class="text-[10px] text-gray-400 ml-auto">{{ r.key }}</code>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Статус гостя -->
        <div class="mb-2">
          <div *ngIf="panelState === 'no-guest'" class="text-sm text-gray-400 flex items-center gap-1">
            Гость не идентифицирован
          </div>
          <div *ngIf="panelState === 'identified'" class="text-sm text-gray-700 flex items-center gap-2">
            <span class="font-semibold">{{ currentGuest.surname }} {{ currentGuest.forename }} {{ currentGuest.middlename }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                  [style.background]="currentGuest.color + '33'"
                  [style.color]="currentGuest.color">
              {{ currentGuest.status }}
            </span>
          </div>
          <div *ngIf="panelState === 'unavailable'" class="text-sm text-red-500 flex items-center gap-1">
            <lucide-icon name="wifi-off" [size]="14"></lucide-icon>
            Neptune недоступен
          </div>
        </div>

        <!-- TTL Token Indicator (3.11) -->
        <div *ngIf="tokenActive" class="mb-3 flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
               [ngClass]="tokenSecondsLeft > 60
                 ? 'bg-green-50 border border-green-200 text-green-700'
                 : tokenSecondsLeft > 0
                   ? 'bg-amber-50 border border-amber-200 text-amber-700'
                   : 'bg-red-50 border border-red-200 text-red-700'">
            <lucide-icon name="timer" [size]="14"></lucide-icon>
            <span *ngIf="tokenSecondsLeft > 0" class="font-mono font-medium">
              Токен активен: {{ tokenMinutes }}:{{ tokenSecondsPad }}
            </span>
            <span *ngIf="tokenSecondsLeft <= 0" class="font-medium">
              Токен истёк — требуется повторный PIN
            </span>
          </div>
          <button *ngIf="tokenSecondsLeft <= 0"
                  (click)="onTokenExpiredRepin()"
                  class="text-xs text-blue-600 hover:text-blue-800 underline">
            Ввести PIN
          </button>
        </div>

        <!-- Button Panel -->
        <div class="bg-[#2d2d2d] rounded-lg p-4">
          <div class="flex gap-3 flex-wrap">

            <!-- Идентификация -->
            <button (click)="onIdentify()"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors relative"
                    [ngClass]="panelState === 'unavailable' || !demoRoles.card_role
                      ? 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
                    [disabled]="panelState === 'unavailable' || !demoRoles.card_role"
                    [title]="!demoRoles.card_role ? 'Требуется роль: card_role' : ''">
              <lucide-icon name="scan-line" [size]="18"></lucide-icon>
              Идентификация
            </button>

            <!-- Cashless -->
            <button (click)="onPaymentClick('cashless')"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'identified' && demoRoles.use_cashless_role
                      ? 'bg-[#2e7d32] text-white hover:bg-[#388e3c]'
                      : 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'"
                    [disabled]="panelState !== 'identified' || !demoRoles.use_cashless_role"
                    [title]="!demoRoles.use_cashless_role ? 'Требуется роль: use_cashless_role' : ''">
              <lucide-icon name="wallet" [size]="18"></lucide-icon>
              Cashless
            </button>

            <!-- Loyalty -->
            <button (click)="onPaymentClick('loyalty')"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'identified' && demoRoles.use_loyalty_role
                      ? 'bg-[#1565c0] text-white hover:bg-[#1976d2]'
                      : 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'"
                    [disabled]="panelState !== 'identified' || !demoRoles.use_loyalty_role"
                    [title]="!demoRoles.use_loyalty_role ? 'Требуется роль: use_loyalty_role' : ''">
              <lucide-icon name="star" [size]="18"></lucide-icon>
              Loyalty
            </button>

            <!-- Comp -->
            <button (click)="onPaymentClick('comp')"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'identified' && demoRoles.use_comp_role
                      ? 'bg-[#6a1b9a] text-white hover:bg-[#7b1fa2]'
                      : 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'"
                    [disabled]="panelState !== 'identified' || !demoRoles.use_comp_role"
                    [title]="!demoRoles.use_comp_role ? 'Требуется роль: use_comp_role' : ''">
              <lucide-icon name="gift" [size]="18"></lucide-icon>
              Comp
            </button>

            <!-- Список гостей -->
            <button (click)="onGuestList()"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'unavailable' || !demoRoles.show_all_guests_role
                      ? 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
                    [disabled]="panelState === 'unavailable' || !demoRoles.show_all_guests_role"
                    [title]="!demoRoles.show_all_guests_role ? 'Требуется роль: show_all_guests_role' : ''">
              <lucide-icon name="users" [size]="18"></lucide-icon>
              Список гостей
            </button>
          </div>
        </div>

        <!-- Контекст заказа -->
        <div class="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center gap-2 mb-3">
            <lucide-icon name="receipt" [size]="16" class="text-gray-400"></lucide-icon>
            <span class="text-sm font-medium text-gray-600">Контекст заказа</span>
            <span class="text-xs text-gray-400">#{{ mockOrder.order_number }}</span>
          </div>

          <div class="space-y-1">
            <div *ngFor="let item of mockOrder.items"
                 class="flex justify-between text-sm">
              <span class="text-gray-700">
                {{ item.name }}
                <span *ngIf="item.quantity > 1" class="text-gray-400">× {{ item.quantity }}</span>
              </span>
              <span class="text-gray-900 font-medium">{{ item.price * item.quantity | number:'1.0-0' }} ₽</span>
            </div>
          </div>

          <div class="border-t border-gray-100 mt-2 pt-2 flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ mockOrder.table }}</span>
            <span class="font-semibold text-gray-900">Итого: {{ mockOrder.order_total | number:'1.0-0' }} ₽</span>
          </div>
        </div>

        <!-- External Data (демо) -->
        <div *ngIf="panelState === 'identified'" class="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center gap-2 mb-3">
            <lucide-icon name="database" [size]="16" class="text-gray-400"></lucide-icon>
            <span class="text-sm font-medium text-gray-600">External Data</span>
            <span class="text-xs text-gray-400">данные, записываемые в заказ</span>
          </div>

          <div class="space-y-1 text-sm">
            <div *ngFor="let entry of externalDataEntries" class="flex gap-2 items-center">
              <span class="text-gray-400 w-44 shrink-0 font-mono">{{ entry.key }}</span>
              <span class="text-gray-700 font-mono flex-1">{{ entry.value }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded"
                    [ngClass]="entry.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                {{ entry.isPublic ? 'public' : 'private' }}
              </span>
            </div>
          </div>
        </div>

        <!-- API Console (3.12) -->
        <div class="mt-4">
          <button (click)="showApiConsole = !showApiConsole"
                  class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <lucide-icon name="code-2" [size]="14"></lucide-icon>
            <span>API-консоль</span>
            <span *ngIf="apiLog.length" class="text-xs bg-gray-200 text-gray-600 rounded-full px-1.5">{{ apiLog.length }}</span>
            <lucide-icon [name]="showApiConsole ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-icon>
          </button>

          <div *ngIf="showApiConsole"
               class="mt-2 bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden animate-fade-in">
            <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span class="text-xs text-gray-400 font-mono">MGS API Requests</span>
              <button (click)="apiLog = []"
                      class="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Очистить
              </button>
            </div>

            <div *ngIf="!apiLog.length" class="px-4 py-6 text-center text-gray-500 text-sm">
              Выполните действие (идентификация, оплата) — запросы появятся здесь
            </div>

            <div class="max-h-72 overflow-y-auto">
              <div *ngFor="let entry of apiLog; let last = last"
                   class="px-4 py-3 text-xs font-mono"
                   [ngClass]="!last ? 'border-b border-gray-800' : ''">

                <!-- Header line -->
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold"
                        [ngClass]="entry.isError ? 'text-red-400' : 'text-green-400'">
                    {{ entry.method }}
                  </span>
                  <span class="text-blue-300">{{ entry.endpoint }}</span>
                  <span *ngIf="entry.httpCode"
                        class="ml-auto px-1.5 py-0.5 rounded text-[10px]"
                        [ngClass]="entry.isError
                          ? 'bg-red-900/40 text-red-300'
                          : 'bg-green-900/40 text-green-300'">
                    {{ entry.httpCode }}
                  </span>
                  <span class="text-gray-600 text-[10px]">{{ entry.timestamp }}</span>
                </div>

                <!-- Label -->
                <div class="text-gray-400 mb-1">// {{ entry.label }}</div>

                <!-- Request -->
                <div *ngIf="entry.requestBody" class="mb-1">
                  <span class="text-gray-500">→ </span>
                  <span class="text-yellow-200/80">{{ formatJson(entry.requestBody) }}</span>
                </div>

                <!-- Response -->
                <div *ngIf="entry.responseBody">
                  <span class="text-gray-500">← </span>
                  <span [ngClass]="entry.isError ? 'text-red-300/80' : 'text-green-200/80'">{{ formatJson(entry.responseBody) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== DIALOGS ===== -->

      <!-- Identify Method -->
      <neptune-identify-method-dialog
        [open]="activeModal === 'identify-method'"
        (dialogClose)="closeDialog()"
        (methodSelected)="onIdentifyMethodSelected($event)">
      </neptune-identify-method-dialog>

      <!-- Guest Profile -->
      <neptune-guest-profile-dialog
        [open]="activeModal === 'guest-profile'"
        [guest]="currentGuest"
        [identifyMethod]="currentIdentifyMethod"
        [roles]="demoRoles"
        (dialogClose)="closeDialog()"
        (payAction)="onPayFromProfile()">
      </neptune-guest-profile-dialog>

      <!-- PIN Entry -->
      <neptune-pin-entry-dialog
        [open]="activeModal === 'pin-entry'"
        [guestName]="guestFullName"
        (dialogClose)="closeDialog()"
        (pinConfirmed)="onPinConfirmed($event)">
      </neptune-pin-entry-dialog>

      <!-- Guest List -->
      <neptune-guest-list-dialog
        [open]="activeModal === 'guest-list'"
        [guests]="guests"
        (dialogClose)="closeDialog()"
        (guestSelected)="onGuestSelected($event)">
      </neptune-guest-list-dialog>

      <!-- Payment Cashless -->
      <neptune-payment-cashless-dialog
        [open]="activeModal === 'payment-cashless'"
        [guest]="currentGuest"
        [orderTotal]="mockOrder.order_total"
        (dialogClose)="closeDialog()"
        (paymentConfirmed)="onPaymentConfirmed($event)">
      </neptune-payment-cashless-dialog>

      <!-- Payment Loyalty / Comp -->
      <neptune-payment-loyalty-dialog
        [open]="activeModal === 'payment-loyalty'"
        [guest]="currentGuest"
        [orderTotal]="mockOrder.order_total"
        [paymentType]="currentPaymentType"
        (dialogClose)="closeDialog()"
        (paymentConfirmed)="onPaymentConfirmed($event)">
      </neptune-payment-loyalty-dialog>

      <!-- Loading -->
      <neptune-loading-dialog
        [open]="activeModal === 'loading'"
        [message]="loadingMessage"
        (loadingComplete)="onLoadingComplete()">
      </neptune-loading-dialog>

      <!-- Success -->
      <neptune-success-dialog
        [open]="activeModal === 'success'"
        [paymentTypeLabel]="successPaymentLabel"
        [amountDeducted]="successAmount"
        [guestName]="guestShortName"
        [remainingBalance]="successRemaining"
        [orderItems]="mockOrder.items"
        [orderTotal]="mockOrder.order_total"
        (dialogClose)="onSuccessClose()">
      </neptune-success-dialog>

      <!-- Error -->
      <neptune-error-dialog
        [open]="activeModal === 'error'"
        [message]="errorMessage"
        [scenario]="currentErrorScenario"
        (dialogClose)="closeDialog()"
        (retryAction)="closeDialog()">
      </neptune-error-dialog>
    </div>
  `,
})
export class NeptunePosScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── State ──
  activeModal: ModalType = null;
  panelState: PanelState = 'no-guest';
  currentPaymentType: PaymentType = 'cashless';
  currentGuest: MockGuest = MOCK_GUEST;
  currentErrorScenario: ErrorScenario | null = null;
  currentIdentifyMethod: IdentifyMethod | null = null;

  // ── Roles (3.7) ──
  demoRoles: DemoRoles = { ...DEMO_ROLES };
  showRolesPanel = false;

  accessRoles = [
    { key: 'card_role' as keyof DemoRoles, label: 'Идентификация' },
    { key: 'use_cashless_role' as keyof DemoRoles, label: 'Cashless' },
    { key: 'use_loyalty_role' as keyof DemoRoles, label: 'Loyalty' },
    { key: 'use_comp_role' as keyof DemoRoles, label: 'Comp' },
    { key: 'show_all_guests_role' as keyof DemoRoles, label: 'Список гостей' },
  ];

  visibilityRoles = [
    { key: 'show_id_role' as keyof DemoRoles, label: 'Customer ID' },
    { key: 'show_card_role' as keyof DemoRoles, label: 'Номер карты' },
    { key: 'show_fio_role' as keyof DemoRoles, label: 'ФИО' },
    { key: 'show_birthday_role' as keyof DemoRoles, label: 'Дата рождения' },
    { key: 'show_state_role' as keyof DemoRoles, label: 'Статус' },
    { key: 'show_photo_role' as keyof DemoRoles, label: 'Фото' },
    { key: 'show_cashless_role' as keyof DemoRoles, label: 'Баланс Cashless' },
    { key: 'show_loyalty_role' as keyof DemoRoles, label: 'Баланс Loyalty' },
    { key: 'show_comp_role' as keyof DemoRoles, label: 'Баланс Comp' },
  ];

  // ── External Data (3.10) ──
  externalDataEntries: ExternalDataEntry[] = [];

  // ── TTL Token (3.11) ──
  tokenActive = false;
  tokenSecondsLeft = 0;
  private tokenInterval: any = null;
  private readonly TOKEN_TTL = 300; // 5 мин

  get tokenMinutes(): string {
    return String(Math.floor(this.tokenSecondsLeft / 60));
  }

  get tokenSecondsPad(): string {
    return String(this.tokenSecondsLeft % 60).padStart(2, '0');
  }

  // ── API Console (3.12) ──
  apiLog: ApiLogEntry[] = [];
  showApiConsole = false;

  // ── Service Context (3.13) ──
  serviceContext: ServiceContext = 'restaurant';

  // ── Mock data ──
  guests = MOCK_GUESTS;
  mockOrder = MOCK_ORDER;

  // ── Loading flow target ──
  private loadingTarget: ModalType = null;
  loadingMessage = 'Загрузка...';

  // ── Success data ──
  successPaymentLabel = 'Cashless';
  successAmount = 0;
  successRemaining = 0;

  // ── Error ──
  errorMessage = '';

  // ── Panel states list ──
  panelStates = [
    { value: 'no-guest' as PanelState, label: 'Без гостя' },
    { value: 'identified' as PanelState, label: 'Гость идентифицирован' },
    { value: 'unavailable' as PanelState, label: 'Neptune недоступен' },
  ];

  // ── Computed ──
  get guestFullName(): string {
    return `${this.currentGuest.surname} ${this.currentGuest.forename} ${this.currentGuest.middlename}`;
  }

  get guestShortName(): string {
    const g = this.currentGuest;
    return `${g.surname} ${g.forename.charAt(0)}.${g.middlename.charAt(0)}.`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const modal = params['modal'] as ModalType;
      const payment = params['payment'] as PaymentType;
      const errorId = params['error'] as string;

      if (errorId) {
        this.currentErrorScenario = ERROR_SCENARIOS.find(e => e.id === errorId) || null;
        this.errorMessage = this.currentErrorScenario?.message || 'Неизвестная ошибка';
        this.activeModal = 'error';
      } else if (payment) {
        this.currentPaymentType = payment;
        this.panelState = 'identified';
        if (modal === 'payment-cashless' || modal === 'payment-loyalty') {
          this.activeModal = modal;
        } else {
          this.activeModal = 'pin-entry';
        }
      } else if (modal) {
        if (modal === 'guest-profile' || modal === 'guest-list') {
          this.panelState = 'identified';
        }
        this.activeModal = modal;
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTokenTimer();
  }

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  closeDialog(): void {
    this.activeModal = null;
  }

  // ── Identify flow ──
  onIdentify(): void {
    if (this.panelState === 'unavailable') return;
    this.activeModal = 'identify-method';
  }

  onIdentifyMethodSelected(method: IdentifyMethod): void {
    this.currentIdentifyMethod = method;
    this.loadingMessage = method === 'card'
      ? 'Поиск гостя по карте...'
      : 'Поиск гостя по ID...';
    this.loadingTarget = 'guest-profile';
    this.activeModal = 'loading';

    // API log (3.12)
    const endpoint = method === 'card' ? '/v1/search/card' : '/v1/search/id';
    const reqBody = method === 'card'
      ? { card_track: '*4590123456789012*' }
      : { customer_id: this.currentGuest.customer_id };
    this.addApiLog('POST', endpoint, reqBody, {
      customer_id: this.currentGuest.customer_id,
      forename: this.currentGuest.forename,
      middlename: this.currentGuest.middlename,
      surname: this.currentGuest.surname,
      status: this.currentGuest.status,
      color: this.currentGuest.color,
      balance_cash: this.currentGuest.balance_cash,
      points: this.currentGuest.points,
    }, 200, false, `Идентификация (${method === 'card' ? 'карта' : 'ID'})`);
  }

  // ── Guest list flow ──
  onGuestList(): void {
    if (this.panelState === 'unavailable') return;
    this.loadingMessage = 'Загрузка списка гостей...';
    this.loadingTarget = 'guest-list';
    this.activeModal = 'loading';

    // API log
    this.addApiLog('GET', '/v1/search/guests_in_casino', null,
      this.guests.map(g => ({ customer_id: g.customer_id, forename: g.forename, surname: g.surname, status: g.status })),
      200, false, 'Список гостей в казино');
  }

  // ── Guest selected from list ──
  onGuestSelected(guest: any): void {
    this.loadingMessage = 'Загрузка профиля...';
    this.loadingTarget = 'guest-profile';
    this.activeModal = 'loading';
  }

  // ── Payment from profile ──
  onPayFromProfile(): void {
    this.currentPaymentType = 'cashless';
    this.activeModal = 'pin-entry';
  }

  // ── Payment button on panel ──
  onPaymentClick(type: PaymentType): void {
    if (this.panelState !== 'identified') return;
    this.currentPaymentType = type;

    // (3.11) If token is still active, skip PIN
    if (this.tokenActive && this.tokenSecondsLeft > 0) {
      this.loadingMessage = 'Загрузка...';
      this.loadingTarget = type === 'cashless' ? 'payment-cashless' : 'payment-loyalty';
      this.activeModal = 'loading';
      return;
    }

    this.activeModal = 'pin-entry';
  }

  // ── PIN confirmed ──
  onPinConfirmed(pin: string): void {
    this.loadingMessage = 'Проверка PIN-кода...';
    if (this.currentPaymentType === 'cashless') {
      this.loadingTarget = 'payment-cashless';
    } else {
      this.loadingTarget = 'payment-loyalty';
    }
    this.activeModal = 'loading';

    // API log: get_token
    this.addApiLog('POST', '/v1/payment/get_token',
      { pin: '****', customer_id: this.currentGuest.customer_id },
      { token: 'eyJ***...masked', ttl: this.TOKEN_TTL },
      200, false, 'Получение платёжного токена');

    // (3.11) Start token TTL timer
    this.startTokenTimer();
  }

  // ── Payment confirmed ──
  onPaymentConfirmed(amount: number): void {
    this.successAmount = amount;
    this.successPaymentLabel = this.getPaymentLabel();
    this.successRemaining = this.getSuccessRemaining(amount);
    this.loadingMessage = 'Обработка платежа...';
    this.loadingTarget = 'success';
    this.activeModal = 'loading';

    // API log: payment
    if (this.currentPaymentType === 'cashless') {
      this.addApiLog('POST', '/v1/payment/cash',
        { amount: Number(amount.toFixed(2)), token: 'eyJ***', service: PLUGIN_CONFIG.service, items: this.mockOrder.items.map(i => i.name) },
        { status: 'OK', balance: this.successRemaining },
        200, false, 'Оплата Cashless');
    } else {
      const pointId = this.currentPaymentType === 'comp' ? PLUGIN_CONFIG.ComplimentaryPointId : PLUGIN_CONFIG.RestaurantPointId;
      this.addApiLog('POST', '/v1/payment/promo',
        { point_id: pointId, point_service_id: PLUGIN_CONFIG.point_service_id, amount: Math.round(amount), token: 'eyJ***', description: `Оплата заказа #${this.mockOrder.order_number}` },
        { status: 'OK', remaining: this.successRemaining },
        200, false, `Оплата ${this.getPaymentLabel()}`);
    }
  }

  // ── Loading complete → go to target ──
  onLoadingComplete(): void {
    if (this.loadingTarget) {
      this.activeModal = this.loadingTarget;
      if (this.loadingTarget === 'guest-profile') {
        this.panelState = 'identified';
        this.populateIdentifyExternalData();
      }
      if (this.loadingTarget === 'success') {
        this.populatePaymentExternalData();
      }
      this.loadingTarget = null;
    } else {
      this.activeModal = null;
    }
  }

  // ── Success close ──
  onSuccessClose(): void {
    this.activeModal = null;
  }

  // ── Helpers ──
  private getPaymentLabel(): string {
    switch (this.currentPaymentType) {
      case 'cashless': return 'Cashless';
      case 'loyalty': return 'Loyalty';
      case 'comp': return 'Comp';
    }
  }

  private getSuccessRemaining(amount: number): number {
    switch (this.currentPaymentType) {
      case 'cashless':
        return Math.max(0, this.currentGuest.balance_cash - amount);
      case 'loyalty': {
        const restaurantPoints = this.currentGuest.points.find(
          p => p.point_id === PLUGIN_CONFIG.RestaurantPointId
        );
        return Math.max(0, (restaurantPoints?.point_sum ?? 0) - amount);
      }
      case 'comp': {
        const compPoints = this.currentGuest.points.find(
          p => p.point_id === PLUGIN_CONFIG.ComplimentaryPointId
        );
        return Math.max(0, (compPoints?.point_sum ?? 0) - amount);
      }
    }
  }

  // ── External Data helpers (3.10) ──
  private populateIdentifyExternalData(): void {
    this.externalDataEntries = [
      { key: 'MGS_customer_id', value: this.currentGuest.customer_id, isPublic: true },
      { key: 'MGS_forename', value: this.currentGuest.forename, isPublic: true },
      { key: 'MGS_middlename', value: this.currentGuest.middlename, isPublic: true },
      { key: 'MGS_surname', value: this.currentGuest.surname, isPublic: true },
      { key: 'MGS_status', value: this.currentGuest.status, isPublic: true },
      { key: 'MGS_balance_cash', value: String(this.currentGuest.balance_cash), isPublic: false },
    ];
  }

  private populatePaymentExternalData(): void {
    const paymentEntries: ExternalDataEntry[] = [
      { key: 'MGS_payment_type', value: this.currentPaymentType, isPublic: true },
      { key: 'MGS_payment_amount', value: String(this.successAmount), isPublic: true },
      { key: 'MGS_payment_remaining', value: String(this.successRemaining), isPublic: false },
    ];
    this.externalDataEntries = [
      ...this.externalDataEntries.filter(e => !e.key.startsWith('MGS_payment_')),
      ...paymentEntries,
    ];
  }

  // ── Token TTL (3.11) ──
  private startTokenTimer(): void {
    this.clearTokenTimer();
    this.tokenActive = true;
    this.tokenSecondsLeft = this.TOKEN_TTL;
    this.tokenInterval = setInterval(() => {
      this.tokenSecondsLeft--;
      if (this.tokenSecondsLeft <= 0) {
        this.clearTokenTimer();
        this.tokenSecondsLeft = 0;
        // Token expired but keep indicator visible
      }
    }, 1000);
  }

  private clearTokenTimer(): void {
    if (this.tokenInterval) {
      clearInterval(this.tokenInterval);
      this.tokenInterval = null;
    }
  }

  onTokenExpiredRepin(): void {
    this.tokenActive = false;
    this.activeModal = 'pin-entry';
  }

  // ── API Log (3.12) ──
  private addApiLog(
    method: 'GET' | 'POST',
    endpoint: string,
    requestBody: Record<string, any> | null,
    responseBody: Record<string, any> | null,
    httpCode: number | null,
    isError: boolean,
    label: string,
  ): void {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    this.apiLog.unshift({ timestamp, method, endpoint, requestBody, responseBody, httpCode, isError, label });
  }

  formatJson(obj: any): string {
    try {
      return JSON.stringify(obj, null, 0);
    } catch {
      return String(obj);
    }
  }
}
