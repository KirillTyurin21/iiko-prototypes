import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { ModalType, PaymentType, PanelState, MockGuest, IdentifyMethod, ErrorScenario } from '../types';
import {
  MOCK_GUEST, MOCK_GUESTS, MOCK_ORDER, ERROR_SCENARIOS, PLUGIN_CONFIG,
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

        <!-- Button Panel -->
        <div class="bg-[#2d2d2d] rounded-lg p-4">
          <div class="flex gap-3 flex-wrap">

            <!-- Идентификация -->
            <button (click)="onIdentify()"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'unavailable'
                      ? 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
                    [disabled]="panelState === 'unavailable'">
              <lucide-icon name="scan-line" [size]="18"></lucide-icon>
              Идентификация
            </button>

            <!-- Cashless -->
            <button (click)="onPaymentClick('cashless')"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'identified'
                      ? 'bg-[#2e7d32] text-white hover:bg-[#388e3c]'
                      : 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'"
                    [disabled]="panelState !== 'identified'">
              <lucide-icon name="wallet" [size]="18"></lucide-icon>
              Cashless
            </button>

            <!-- Loyalty -->
            <button (click)="onPaymentClick('loyalty')"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'identified'
                      ? 'bg-[#1565c0] text-white hover:bg-[#1976d2]'
                      : 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'"
                    [disabled]="panelState !== 'identified'">
              <lucide-icon name="star" [size]="18"></lucide-icon>
              Loyalty
            </button>

            <!-- Comp -->
            <button (click)="onPaymentClick('comp')"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'identified'
                      ? 'bg-[#6a1b9a] text-white hover:bg-[#7b1fa2]'
                      : 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'"
                    [disabled]="panelState !== 'identified'">
              <lucide-icon name="gift" [size]="18"></lucide-icon>
              Comp
            </button>

            <!-- Список гостей -->
            <button (click)="onGuestList()"
                    class="h-14 rounded px-6 flex items-center gap-2 font-semibold transition-colors"
                    [ngClass]="panelState === 'unavailable'
                      ? 'bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
                    [disabled]="panelState === 'unavailable'">
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
            <div class="flex gap-2">
              <span class="text-gray-400 w-40 shrink-0">customer_id</span>
              <span class="text-gray-700 font-mono">{{ currentGuest.customer_id }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-gray-400 w-40 shrink-0">customer_name</span>
              <span class="text-gray-700 font-mono">{{ guestFullName }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-gray-400 w-40 shrink-0">customer_status</span>
              <span class="text-gray-700 font-mono">{{ currentGuest.status }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-gray-400 w-40 shrink-0">balance_cash</span>
              <span class="text-gray-700 font-mono">{{ currentGuest.balance_cash }}</span>
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
export class NeptunePosScreenComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── State ──
  activeModal: ModalType = null;
  panelState: PanelState = 'no-guest';
  currentPaymentType: PaymentType = 'cashless';
  currentGuest: MockGuest = MOCK_GUEST;
  currentErrorScenario: ErrorScenario | null = null;

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
    this.loadingMessage = method === 'card'
      ? 'Поиск гостя по карте...'
      : 'Поиск гостя по ID...';
    this.loadingTarget = 'guest-profile';
    this.activeModal = 'loading';
  }

  // ── Guest list flow ──
  onGuestList(): void {
    if (this.panelState === 'unavailable') return;
    this.loadingMessage = 'Загрузка списка гостей...';
    this.loadingTarget = 'guest-list';
    this.activeModal = 'loading';
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
  }

  // ── Payment confirmed ──
  onPaymentConfirmed(amount: number): void {
    this.successAmount = amount;
    this.successPaymentLabel = this.getPaymentLabel();
    this.successRemaining = this.getSuccessRemaining(amount);
    this.loadingMessage = 'Обработка платежа...';
    this.loadingTarget = 'success';
    this.activeModal = 'loading';
  }

  // ── Loading complete → go to target ──
  onLoadingComplete(): void {
    if (this.loadingTarget) {
      this.activeModal = this.loadingTarget;
      if (this.loadingTarget === 'guest-profile') {
        this.panelState = 'identified';
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
}
