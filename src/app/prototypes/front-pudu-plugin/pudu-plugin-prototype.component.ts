import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PuduModalType } from './types';
import {
  MOCK_CURRENT_ORDER,
  MOCK_TABLES,
  MOCK_ROBOTS,
  MOCK_SCENARIO_SETTINGS,
  MOCK_NOTIFICATIONS,
} from './data/mock-data';
import { CurrentOrder, PuduNotification, OrderTable } from './types';

// Dialogs
import { SendMenuConfirmComponent } from './components/dialogs/send-menu-confirm.component';
import { CleanupConfirmComponent } from './components/dialogs/cleanup-confirm.component';
import { QrCashierPhaseComponent } from './components/dialogs/qr-cashier-phase.component';
import { QrGuestPhaseComponent } from './components/dialogs/qr-guest-phase.component';
import { QrSuccessComponent } from './components/dialogs/qr-success.component';
import { QrTimeoutComponent } from './components/dialogs/qr-timeout.component';
import { UnmappedTableComponent } from './components/dialogs/unmapped-table.component';
import { SendDishBlockedComponent } from './components/dialogs/send-dish-blocked.component';
import { PuduLoadingDialogComponent } from './components/dialogs/loading-dialog.component';
import { PuduSuccessDialogComponent } from './components/dialogs/success-dialog.component';
import { PuduErrorDialogComponent } from './components/dialogs/error-dialog.component';

@Component({
  selector: 'app-pudu-plugin-prototype',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    SendMenuConfirmComponent,
    CleanupConfirmComponent,
    QrCashierPhaseComponent,
    QrGuestPhaseComponent,
    QrSuccessComponent,
    QrTimeoutComponent,
    UnmappedTableComponent,
    SendDishBlockedComponent,
    PuduLoadingDialogComponent,
    PuduSuccessDialogComponent,
    PuduErrorDialogComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#2d2d2d] flex flex-col relative" style="font-family: Roboto, sans-serif;">
      <!-- Header заказа -->
      <div class="bg-[#1a1a1a] h-14 flex items-center px-4 shrink-0">
        <span class="text-lg font-semibold text-white">{{ currentOrder.table.table_name }}</span>
        <span class="text-sm text-gray-400 mx-auto">Заказ #{{ currentOrder.order_id }}</span>
        <div class="flex items-center gap-2">
          <lucide-icon name="user" [size]="16" class="text-gray-300"></lucide-icon>
          <span class="text-sm text-gray-300">{{ currentOrder.waiter_name }}</span>
        </div>
      </div>

      <!-- Список блюд -->
      <div class="flex-1 overflow-auto p-4 space-y-2 pb-0">
        <div *ngFor="let item of currentOrder.items"
             class="flex justify-between items-center py-2 border-b border-gray-600/30">
          <span class="text-sm text-white">
            <span class="text-sm text-gray-400">{{ item.quantity }}×</span>
            {{ item.name }}
          </span>
          <span class="text-sm text-white font-medium">{{ item.price * item.quantity | number }} ₽</span>
        </div>
      </div>

      <!-- Блок Итого -->
      <div class="bg-[#2d2d2d] rounded p-4 mx-4 mt-2">
        <div class="flex justify-between text-xl font-bold">
          <span class="text-white">Итого:</span>
          <span class="text-[#b8c959]">{{ currentOrder.total | number }} ₽</span>
        </div>
      </div>

      <!-- Индикатор маркетинга -->
      <div *ngIf="isCruiseActive" class="mx-4 mt-3">
        <div class="flex items-center gap-2 bg-[#b8c959]/20 border border-[#b8c959] rounded px-4 py-2">
          <lucide-icon name="radio" [size]="18" class="text-[#b8c959] animate-pulse"></lucide-icon>
          <span class="text-sm text-[#b8c959] font-medium">Маркетинг-круиз активен</span>
          <button (click)="stopCruise()" class="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
            Остановить
          </button>
        </div>
      </div>

      <!-- Панель кнопок PUDU -->
      <div class="grid grid-cols-4 gap-3 p-4 border-t border-gray-600 mt-3">
        <button (click)="onSendMenu()" aria-label="Отправить меню"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
          <lucide-icon name="utensils" [size]="20"></lucide-icon>
          <span class="text-xs">Отправить меню</span>
        </button>
        <button (click)="onCleanup()" aria-label="Уборка посуды"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
          <lucide-icon name="trash-2" [size]="20"></lucide-icon>
          <span class="text-xs">Уборка посуды</span>
        </button>
        <button (click)="onSendDish()" aria-label="Доставка блюд"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors opacity-60">
          <lucide-icon name="package" [size]="20"></lucide-icon>
          <span class="text-xs">Доставка блюд</span>
        </button>
        <button (click)="onToggleMarketing()" aria-label="Маркетинг"
          class="h-14 rounded flex flex-col items-center justify-center gap-1 transition-colors"
          [ngClass]="isCruiseActive ? 'bg-[#b8c959] text-black hover:bg-[#c5d466]' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'">
          <lucide-icon name="radio" [size]="20"></lucide-icon>
          <span class="text-xs">Маркетинг</span>
        </button>
      </div>

      <!-- Демо-панель -->
      <div class="bg-[#1a1a1a] border-t border-gray-600 px-4 py-2 shrink-0">
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-xs text-gray-500 font-medium">Демо-управление:</span>
          <button (click)="activeModal = 'qr_cashier_phase'" class="text-xs text-gray-400 hover:text-white transition-colors">
            Имитация: QR-оплата (СБП)
          </button>
          <button (click)="showDemoError()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Имитация: Ошибка
          </button>
          <button (click)="toggleMapped()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Стол замаплен: {{ currentOrder.table.is_mapped ? 'Да' : 'Нет' }}
          </button>
          <button (click)="cycleTable()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Сменить стол ({{ currentOrder.table.table_name }})
          </button>
        </div>
      </div>

      <!-- Toast-уведомления -->
      <div class="fixed bottom-16 right-6 z-[60] space-y-2">
        <div *ngFor="let notif of activeNotifications; trackBy: trackNotif"
             class="animate-slide-up bg-red-500/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
          <lucide-icon name="alert-circle" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
          <div class="flex-1">
            <p class="text-sm font-medium">{{ notif.title }}</p>
            <p class="text-xs text-red-100 mt-1">{{ notif.message }}</p>
          </div>
          <button (click)="dismissNotification(notif.id)" class="text-red-200 hover:text-white transition-colors">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- ===== МОДАЛЬНЫЕ ОКНА ===== -->

      <!-- М1: Отправить меню -->
      <pudu-send-menu-confirm
        [open]="activeModal === 'send_menu_confirm'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="defaultRobotName"
        [phrase]="settings.send_menu.phrase"
        (onCancel)="activeModal = null"
        (onConfirm)="onConfirmAction('send_menu')"
      ></pudu-send-menu-confirm>

      <!-- М2: Уборка посуды -->
      <pudu-cleanup-confirm
        [open]="activeModal === 'cleanup_confirm'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="defaultRobotName"
        [phrase]="settings.cleanup.phrase_arrival"
        [waitTime]="settings.cleanup.wait_time"
        (onCancel)="activeModal = null"
        (onConfirm)="onConfirmAction('cleanup')"
      ></pudu-cleanup-confirm>

      <!-- М3: QR Кассир -->
      <pudu-qr-cashier-phase
        [open]="activeModal === 'qr_cashier_phase'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="defaultRobotName"
        [total]="currentOrder.total"
        [cashierTimeout]="settings.qr_payment.cashier_timeout"
        (onCancel)="activeModal = null"
        (onSendToGuest)="onSendToGuest()"
        (onTimeout)="activeModal = 'qr_timeout'"
      ></pudu-qr-cashier-phase>

      <!-- М4: QR Гость -->
      <pudu-qr-guest-phase
        [open]="activeModal === 'qr_guest_phase'"
        [tableName]="currentOrder.table.table_name"
        [total]="currentOrder.total"
        [guestWaitTime]="settings.qr_payment.guest_wait_time"
        (onCancel)="activeModal = null"
        (onPaymentConfirmed)="activeModal = 'qr_success'"
        (onTimeout)="activeModal = 'qr_timeout'"
      ></pudu-qr-guest-phase>

      <!-- М5: QR Успех -->
      <pudu-qr-success
        [open]="activeModal === 'qr_success'"
        [tableName]="currentOrder.table.table_name"
        [total]="currentOrder.total"
        [phraseSuccess]="settings.qr_payment.phrase_success"
        (onClose)="activeModal = null"
      ></pudu-qr-success>

      <!-- М6: QR Тайм-аут -->
      <pudu-qr-timeout
        [open]="activeModal === 'qr_timeout'"
        (onClose)="onQrTimeoutClose()"
      ></pudu-qr-timeout>

      <!-- М7: Стол не замаплен -->
      <pudu-unmapped-table
        [open]="activeModal === 'unmapped_table'"
        [tableName]="currentOrder.table.table_name"
        (onClose)="activeModal = null"
      ></pudu-unmapped-table>

      <!-- М8: Доставка блюд [BLOCKED] -->
      <pudu-send-dish-blocked
        [open]="activeModal === 'send_dish_blocked'"
        (onClose)="activeModal = null"
      ></pudu-send-dish-blocked>

      <!-- М9: Loading -->
      <pudu-loading-dialog
        [open]="activeModal === 'loading'"
        [message]="loadingMessage"
      ></pudu-loading-dialog>

      <!-- М10: Успех -->
      <pudu-success-dialog
        [open]="activeModal === 'success'"
        [robotName]="defaultRobotName"
        (onClose)="activeModal = null"
      ></pudu-success-dialog>

      <!-- М11: Ошибка -->
      <pudu-error-dialog
        [open]="activeModal === 'error'"
        (onClose)="activeModal = null"
        (onRetry)="onRetry()"
      ></pudu-error-dialog>
    </div>
  `,
})
export class PuduPluginPrototypeComponent implements OnDestroy {
  activeModal: PuduModalType = null;
  currentOrder: CurrentOrder = JSON.parse(JSON.stringify(MOCK_CURRENT_ORDER));
  settings = MOCK_SCENARIO_SETTINGS;
  isCruiseActive = false;
  loadingMessage = 'Отправка команды роботу';

  notifications: PuduNotification[] = [];
  private tableIndex = 2; // tbl-003 initially
  private pendingAction: 'send_menu' | 'cleanup' | 'qr_payment' | null = null;
  private loadingTimeoutId: any = null;

  get defaultRobotName(): string {
    return MOCK_ROBOTS.find(r => r.robot_id === this.settings.general.default_robot_id)?.robot_name || 'BellaBot-01';
  }

  get activeNotifications(): PuduNotification[] {
    return this.notifications.filter(n => !n.dismissed).slice(0, 3);
  }

  // ===== Button handlers =====

  onSendMenu(): void {
    if (!this.currentOrder.table.is_mapped) {
      this.activeModal = 'unmapped_table';
      return;
    }
    this.activeModal = 'send_menu_confirm';
  }

  onCleanup(): void {
    if (!this.currentOrder.table.is_mapped) {
      this.activeModal = 'unmapped_table';
      return;
    }
    this.activeModal = 'cleanup_confirm';
  }

  onSendDish(): void {
    this.activeModal = 'send_dish_blocked';
  }

  onToggleMarketing(): void {
    this.isCruiseActive = !this.isCruiseActive;
  }

  stopCruise(): void {
    this.isCruiseActive = false;
  }

  // ===== Action handlers =====

  onConfirmAction(action: 'send_menu' | 'cleanup'): void {
    this.pendingAction = action;
    this.loadingMessage = action === 'send_menu'
      ? 'Отправка меню к столу...'
      : 'Отправка робота для уборки...';
    this.activeModal = 'loading';

    this.loadingTimeoutId = setTimeout(() => {
      // 80% success, 20% error
      if (Math.random() > 0.2) {
        this.activeModal = 'success';
      } else {
        this.activeModal = 'error';
      }
    }, 3000);
  }

  onSendToGuest(): void {
    this.pendingAction = 'qr_payment';
    this.loadingMessage = 'Отправка робота к столу...';
    this.activeModal = 'loading';

    this.loadingTimeoutId = setTimeout(() => {
      this.activeModal = 'qr_guest_phase';
    }, 2000);
  }

  onRetry(): void {
    this.activeModal = 'loading';
    this.loadingTimeoutId = setTimeout(() => {
      if (Math.random() > 0.2) {
        if (this.pendingAction === 'qr_payment') {
          this.activeModal = 'qr_guest_phase';
        } else {
          this.activeModal = 'success';
        }
      } else {
        this.activeModal = 'error';
      }
    }, 3000);
  }

  onQrTimeoutClose(): void {
    this.activeModal = null;
    this.pushNotification(
      'Гость не оплатил заказ по QR',
      `${this.currentOrder.table.table_name}. Робот возвращается на базу.`
    );
  }

  // ===== Demo helpers =====

  showDemoError(): void {
    const mock = MOCK_NOTIFICATIONS[Math.floor(Math.random() * MOCK_NOTIFICATIONS.length)];
    this.pushNotification(mock.title, mock.message);
  }

  toggleMapped(): void {
    this.currentOrder.table.is_mapped = !this.currentOrder.table.is_mapped;
  }

  cycleTable(): void {
    this.tableIndex = (this.tableIndex + 1) % MOCK_TABLES.length;
    const newTable = MOCK_TABLES[this.tableIndex];
    this.currentOrder.table = { ...newTable };
  }

  // ===== Notifications =====

  pushNotification(title: string, message: string): void {
    const notif: PuduNotification = {
      id: 'notif-' + Date.now(),
      type: 'error',
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
    };
    this.notifications = [notif, ...this.notifications];
  }

  dismissNotification(id: string): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.dismissed = true;
  }

  trackNotif(_: number, notif: PuduNotification): string {
    return notif.id;
  }

  ngOnDestroy(): void {
    if (this.loadingTimeoutId) {
      clearTimeout(this.loadingTimeoutId);
    }
  }
}
