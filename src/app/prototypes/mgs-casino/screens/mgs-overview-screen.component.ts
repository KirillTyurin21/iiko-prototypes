import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { ModalType, PaymentType, PanelState, MockGuest } from '../types';
import { MOCK_GUEST, MOCK_GUESTS_IN_CASINO, MOCK_ORDER, CATALOG_CARDS, ERROR_MESSAGES } from '../data/mock-data';
import { MgsGuestProfileDialogComponent } from '../components/dialogs/guest-profile-dialog.component';
import { MgsPinEntryDialogComponent } from '../components/dialogs/pin-entry-dialog.component';
import { MgsGuestListDialogComponent } from '../components/dialogs/guest-list-dialog.component';
import { MgsPaymentCashlessDialogComponent } from '../components/dialogs/payment-cashless-dialog.component';
import { MgsPaymentLoyaltyDialogComponent } from '../components/dialogs/payment-loyalty-dialog.component';
import { MgsLoadingDialogComponent } from '../components/dialogs/loading-dialog.component';
import { MgsSuccessDialogComponent } from '../components/dialogs/success-dialog.component';
import { MgsErrorDialogComponent } from '../components/dialogs/error-dialog.component';

@Component({
  selector: 'app-mgs-overview-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    MgsGuestProfileDialogComponent,
    MgsPinEntryDialogComponent,
    MgsGuestListDialogComponent,
    MgsPaymentCashlessDialogComponent,
    MgsPaymentLoyaltyDialogComponent,
    MgsLoadingDialogComponent,
    MgsSuccessDialogComponent,
    MgsErrorDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50" style="font-family: Roboto, sans-serif;">

      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-6 py-4">
          <nav class="text-sm text-gray-400 mb-2">
            <span>Прототипы</span>
            <span class="mx-1">/</span>
            <span>Плагины Front</span>
            <span class="mx-1">/</span>
            <span class="text-gray-600">MGS Casino</span>
          </nav>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <lucide-icon name="scan-line" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                MGS — Casino Guest Management
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Плагин интеграции Front с системой управления казино MGS. Идентификация гостей, просмотр профиля и балансов, оплата заказа.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Сетка карточек диалогов -->
      <div class="max-w-6xl mx-auto px-6 py-6">

        <div class="flex items-center gap-2 mb-4">
          <lucide-icon name="layout-dashboard" [size]="20" class="text-gray-400"></lucide-icon>
          <h2 class="text-lg font-medium text-gray-700">Диалоги плагина</h2>
          <span class="text-sm text-gray-400 ml-1">— нажмите на карточку для просмотра</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div *ngFor="let card of catalogCards"
               (click)="openDialog(card.id)"
               class="relative bg-white rounded-xl border border-gray-200 p-5
                      hover:shadow-md cursor-pointer hover:border-blue-300
                      transition-all duration-200 group">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gray-100">
              <lucide-icon [name]="card.icon" [size]="24" class="text-gray-600"></lucide-icon>
            </div>
            <h3 class="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {{ card.label }}
            </h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ card.description }}</p>
          </div>
        </div>

        <hr class="border-gray-200 mb-8" />

        <!-- Демо-панель -->
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon name="terminal" [size]="20" class="text-gray-400"></lucide-icon>
          <h2 class="text-lg font-medium text-gray-700">Интерактивная панель</h2>
          <span class="text-sm text-gray-400 ml-1">— имитация панели плагина на экране заказа</span>
        </div>

        <!-- Переключатель состояния панели -->
        <div class="flex gap-2 mb-3">
          <button *ngFor="let ps of panelStates"
                  (click)="panelState = ps.value"
                  class="px-3 py-1.5 rounded text-sm transition-colors"
                  [ngClass]="panelState === ps.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'">
            {{ ps.label }}
          </button>
        </div>

        <!-- Статус над панелью -->
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
            MGS недоступен
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
        <div class="mt-4 bg-gray-100 rounded-lg p-3 flex items-center gap-4 text-sm text-gray-500">
          <span>{{ mockOrder.table }}</span>
          <span>•</span>
          <span>Позиций: {{ mockOrder.items_count }}</span>
          <span>•</span>
          <span class="font-semibold text-gray-700">Сумма: {{ mockOrder.order_total | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- ===== DIALOGS ===== -->

      <!-- Guest Profile -->
      <mgs-guest-profile-dialog
        [open]="activeModal === 'guest-profile'"
        [guest]="currentGuest"
        (dialogClose)="closeDialog()"
        (payAction)="onPayFromProfile()">
      </mgs-guest-profile-dialog>

      <!-- PIN Entry -->
      <mgs-pin-entry-dialog
        [open]="activeModal === 'pin-entry'"
        [guestName]="guestFullName"
        (dialogClose)="closeDialog()"
        (pinConfirmed)="onPinConfirmed($event)">
      </mgs-pin-entry-dialog>

      <!-- Guest List -->
      <mgs-guest-list-dialog
        [open]="activeModal === 'guest-list'"
        [guests]="guestsInCasino"
        (dialogClose)="closeDialog()"
        (guestSelected)="onGuestSelected($event)">
      </mgs-guest-list-dialog>

      <!-- Payment Cashless -->
      <mgs-payment-cashless-dialog
        [open]="activeModal === 'payment-cashless'"
        [guest]="currentGuest"
        [orderTotal]="mockOrder.order_total"
        (dialogClose)="closeDialog()"
        (paymentConfirmed)="onPaymentConfirmed($event)">
      </mgs-payment-cashless-dialog>

      <!-- Payment Loyalty / Comp -->
      <mgs-payment-loyalty-dialog
        [open]="activeModal === 'payment-loyalty'"
        [guest]="currentGuest"
        [orderTotal]="mockOrder.order_total"
        [paymentType]="currentPaymentType"
        (dialogClose)="closeDialog()"
        (paymentConfirmed)="onPaymentConfirmed($event)">
      </mgs-payment-loyalty-dialog>

      <!-- Loading -->
      <mgs-loading-dialog
        [open]="activeModal === 'loading'"
        [message]="loadingMessage"
        (loadingComplete)="onLoadingComplete()">
      </mgs-loading-dialog>

      <!-- Success -->
      <mgs-success-dialog
        [open]="activeModal === 'success'"
        [paymentTypeLabel]="successPaymentLabel"
        [amountDeducted]="successAmount"
        [guestName]="guestShortName"
        [remainingBalance]="successRemaining"
        (dialogClose)="onSuccessClose()">
      </mgs-success-dialog>

      <!-- Error -->
      <mgs-error-dialog
        [open]="activeModal === 'error'"
        [message]="errorMessage"
        (dialogClose)="closeDialog()"
        (retryAction)="closeDialog()">
      </mgs-error-dialog>
    </div>
  `,
})
export class MgsOverviewScreenComponent {
  // ── State ──
  activeModal: ModalType = null;
  panelState: PanelState = 'no-guest';
  currentPaymentType: PaymentType = 'cashless';
  currentGuest: MockGuest = MOCK_GUEST;

  // ── Mock data ──
  catalogCards = CATALOG_CARDS;
  guestsInCasino = MOCK_GUESTS_IN_CASINO;
  mockOrder = MOCK_ORDER;

  // ── Loading flow target ──
  private loadingTarget: ModalType = null;
  loadingMessage = 'Загрузка...';

  // ── Success data ──
  successPaymentLabel = 'Cashless';
  successAmount = 0;
  successRemaining = 0;

  // ── Error ──
  errorMessage = ERROR_MESSAGES[0];

  // ── Panel states list for buttons ──
  panelStates = [
    { value: 'no-guest' as PanelState, label: 'Без гостя' },
    { value: 'identified' as PanelState, label: 'Гость идентифицирован' },
    { value: 'unavailable' as PanelState, label: 'MGS недоступен' },
  ];

  // ── Computed ──
  get guestFullName(): string {
    return `${this.currentGuest.surname} ${this.currentGuest.forename} ${this.currentGuest.middlename}`;
  }

  get guestShortName(): string {
    const g = this.currentGuest;
    return `${g.surname} ${g.forename.charAt(0)}.${g.middlename.charAt(0)}.`;
  }

  // ── Catalog card click ──
  openDialog(type: ModalType): void {
    if (type === 'loading') {
      this.loadingTarget = null;
      this.loadingMessage = 'Загрузка...';
    }
    this.activeModal = type;
  }

  closeDialog(): void {
    this.activeModal = null;
  }

  // ── Identify flow ──
  onIdentify(): void {
    if (this.panelState === 'unavailable') return;
    this.loadingMessage = 'Идентификация гостя...';
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
    // In real app, would load full profile. For prototype, use MOCK_GUEST.
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
      // If we just loaded guest-profile, mark guest as identified
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
      case 'cashless': return Math.max(0, this.currentGuest.balance_cash - amount);
      case 'loyalty': {
        const total = this.currentGuest.points.reduce((s, p) => s + p.point_sum, 0);
        return Math.max(0, total - amount);
      }
      case 'comp': return Math.max(0, this.currentGuest.comp_balance - amount);
    }
  }
}
