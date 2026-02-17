import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PuduModalType, PuduContextType, ScenarioStep, AvailableRobot } from '../types';
import {
  MOCK_CURRENT_ORDER,
  MOCK_TABLES,
  MOCK_SCENARIO_SETTINGS,
  MOCK_NOTIFICATIONS,
  MOCK_NE_ERROR_NOTIFICATIONS,
  MOCK_ORDER_DISHES,
  MOCK_AVAILABLE_ROBOTS,
  MOCK_GENERAL_SETTINGS,
  MOCK_ACTIVE_TASKS,
  TASK_HUMAN_NAMES,
  MockDish,
  getAssignedRobot,
  splitDishesIntoTrips,
} from '../data/mock-data';
import { CurrentOrder, PuduNotification, OrderTable } from '../types';
import { displayRobotName } from '../utils/display-robot-name';

// Dialogs
import { SendMenuConfirmComponent } from '../components/dialogs/send-menu-confirm.component';
import { CleanupConfirmComponent } from '../components/dialogs/cleanup-confirm.component';
import { CleanupMultiSelectComponent } from '../components/dialogs/cleanup-multi-select.component';
import { QrCashierPhaseComponent } from '../components/dialogs/qr-cashier-phase.component';
import { QrGuestPhaseComponent } from '../components/dialogs/qr-guest-phase.component';
import { QrSuccessComponent } from '../components/dialogs/qr-success.component';
import { QrTimeoutComponent } from '../components/dialogs/qr-timeout.component';
import { UnmappedTableComponent } from '../components/dialogs/unmapped-table.component';
import { SendDishBlockedComponent } from '../components/dialogs/send-dish-blocked.component';
import { PuduLoadingDialogComponent } from '../components/dialogs/loading-dialog.component';
import { PuduSuccessDialogComponent } from '../components/dialogs/success-dialog.component';
import { PuduErrorDialogComponent } from '../components/dialogs/error-dialog.component';
import { SendDishConfirmComponent } from '../components/dialogs/send-dish-confirm.component';
import { SendDishPickupNotifyComponent } from '../components/dialogs/send-dish-pickup-notify.component';
import { SendDishRepeatComponent } from '../components/dialogs/send-dish-repeat.component';
import { RobotSelectComponent } from '../components/dialogs/robot-select.component';
import { RobotStatusComponent } from '../components/dialogs/robot-status.component';

@Component({
  selector: 'app-pudu-pos-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    SendMenuConfirmComponent,
    CleanupConfirmComponent,
    CleanupMultiSelectComponent,
    QrCashierPhaseComponent,
    QrGuestPhaseComponent,
    QrSuccessComponent,
    QrTimeoutComponent,
    UnmappedTableComponent,
    SendDishBlockedComponent,
    PuduLoadingDialogComponent,
    PuduSuccessDialogComponent,
    PuduErrorDialogComponent,
    SendDishConfirmComponent,
    SendDishPickupNotifyComponent,
    SendDishRepeatComponent,
    RobotSelectComponent,
    RobotStatusComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#2d2d2d] flex flex-col relative" style="font-family: Roboto, sans-serif;">

      <!-- Переключатель контекста (демо-навигация) — D2 -->
      <div class="flex items-center gap-2 p-3 bg-[#1a1a1a] border-b border-gray-600">
        <!-- Кнопка «Назад в каталог» -->
        <button (click)="backToCatalog()"
                class="flex items-center gap-1.5 text-gray-400 hover:text-white
                       text-sm mr-4 transition-colors"
                aria-label="Вернуться в каталог состояний">
          <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
          <span>Каталог</span>
        </button>

        <div class="flex-1 flex justify-center gap-2">
          <button (click)="currentContext = 'order'"
            [ngClass]="currentContext === 'order' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-300'"
            class="px-4 py-2 rounded text-sm font-medium transition-colors">
            Из заказа ({{ currentOrder.table.table_name }})
          </button>
          <button (click)="currentContext = 'main'"
            [ngClass]="currentContext === 'main' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-300'"
            class="px-4 py-2 rounded text-sm font-medium transition-colors">
            Главный экран
          </button>
        </div>
      </div>

      <!-- ===== КОНТЕКСТ: Из заказа ===== -->
      <ng-container *ngIf="currentContext === 'order'">
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
            <span class="text-sm text-[#b8c959] font-medium">
              Маркетинг-круиз активен<span *ngIf="marketingRobotName"> · {{ marketingRobotName }}</span>
            </span>
            <button (click)="stopCruise()" class="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
              Остановить
            </button>
          </div>
        </div>

        <!-- Панель кнопок PUDU — контекст «Из заказа»: 4 кнопки -->
        <div class="grid gap-3 p-4 border-t border-gray-600 mt-3"
             [ngClass]="isCleanupButtonVisible ? 'grid-cols-4' : 'grid-cols-3'">
          <button (click)="onSendMenu()" aria-label="Отправить меню"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="utensils" [size]="20"></lucide-icon>
            <span class="text-xs">Отправить меню</span>
          </button>
          <button (click)="onCleanup()" aria-label="Уборка посуды"
            *ngIf="isCleanupButtonVisible"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="trash-2" [size]="20"></lucide-icon>
            <span class="text-xs">Уборка посуды</span>
          </button>
          <button (click)="onSendDish()" aria-label="Доставка блюд"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="utensils" [size]="20"></lucide-icon>
            <span class="text-xs">Доставка блюд</span>
          </button>
          <button (click)="onSendDishRepeat()" aria-label="Повторить"
            class="h-14 rounded flex flex-col items-center justify-center gap-1 transition-colors"
            [ngClass]="sendDishCompleted ? 'bg-[#1a1a1a] text-white hover:bg-[#252525]' : 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed'"
            [disabled]="!sendDishCompleted">
            <lucide-icon name="repeat" [size]="20"></lucide-icon>
            <span class="text-xs">Повторить</span>
          </button>
        </div>
      </ng-container>

      <!-- ===== КОНТЕКСТ: Главный экран ===== -->
      <ng-container *ngIf="currentContext === 'main'">
        <!-- Заглушка главного экрана -->
        <div class="flex-1 flex flex-col items-center justify-center bg-[#2d2d2d]">
          <p class="text-gray-400 text-lg mb-2">Главный экран iikoFront</p>
          <p class="text-gray-500 text-sm">(заглушка для демонстрации контекста)</p>
        </div>

        <!-- Индикатор маркетинга -->
        <div *ngIf="isCruiseActive" class="mx-4 mb-3">
          <div class="flex items-center gap-2 bg-[#b8c959]/20 border border-[#b8c959] rounded px-4 py-2">
            <lucide-icon name="radio" [size]="18" class="text-[#b8c959] animate-pulse"></lucide-icon>
            <span class="text-sm text-[#b8c959] font-medium">
              Маркетинг-круиз активен<span *ngIf="marketingRobotName"> · {{ marketingRobotName }}</span>
            </span>
            <button (click)="stopCruise()" class="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
              Остановить
            </button>
          </div>
        </div>

        <!-- Панель кнопок PUDU — контекст «Главный экран»: 3 кнопки v1.4 (H4) -->
        <div class="grid grid-cols-3 gap-3 p-4 border-t border-gray-600">
          <!-- Маркетинг: теперь через П1 (выбор робота) -->
          <button (click)="openRobotSelectForMarketing()" aria-label="Запуск маркетингового круиза"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="radio" [size]="20"></lucide-icon>
            <span class="text-xs">Маркетинг</span>
          </button>
          <!-- Уборка: мультивыбор столов -->
          <button (click)="onCleanupMulti()" aria-label="Уборка посуды с выбором столов"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="trash-2" [size]="20"></lucide-icon>
            <span class="text-xs">Уборка (столы)</span>
          </button>
          <!-- Статус роботов: NEW v1.4 (H4) -->
          <button (click)="openRobotStatus()" aria-label="Просмотр статусов роботов"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="bot" [size]="20"></lucide-icon>
            <span class="text-xs">Статус роботов</span>
          </button>
        </div>
      </ng-container>

      <!-- Демо-панель (v1.1 + v1.4) -->
      <div class="bg-[#1a1a1a] border-t border-gray-600 px-4 py-2 shrink-0">
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-xs text-gray-500 font-medium">Демо:</span>
          <button (click)="activeModal = 'qr_cashier_phase'" class="text-xs text-gray-400 hover:text-white transition-colors">
            QR-оплата (СБП)
          </button>
          <button (click)="showDemoError()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Ошибка
          </button>
          <button (click)="toggleMapped()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Стол: {{ currentOrder.table.is_mapped ? 'Замаплен' : 'Нет' }}
          </button>
          <button (click)="cycleTable()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Стол ({{ currentOrder.table.table_name }})
          </button>
          <button (click)="toggleEstop()" class="text-xs transition-colors"
            [ngClass]="isEstopActive ? 'text-red-300 font-bold' : 'text-red-400 hover:text-red-300'">
            E-STOP {{ isEstopActive ? 'ON' : 'OFF' }}
          </button>
          <button (click)="showNeError()" class="text-xs text-orange-400 hover:text-orange-300 transition-colors">
            Ошибки NE
          </button>
          <!-- v1.4 (H11): Демо lifecycle toast -->
          <button (click)="toggleSuccessNotifications()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Completed: {{ generalSettings.show_success_notifications ? 'ВКЛ' : 'ВЫКЛ' }}
          </button>
          <button (click)="simulateTaskCompleted()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Задача завершена
          </button>
          <!-- v1.4 (H6): Демо режим уборки -->
          <button (click)="cycleCleanupMode()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Уборка: {{ settings.cleanup.mode }}
          </button>
          <!-- v1.4 (H5): Демо repeating notifications -->
          <button (click)="handleErrorNotification('PD2024060001', 'BellaBot-1', 'E_STOP', 'BellaBot-1', 'Белла Зал 1')"
                  class="text-xs text-red-400 hover:text-red-300 transition-colors">
            E-STOP (повтор)
          </button>
          <button (click)="handleErrorNotification('PD2024060001', 'BellaBot-1', 'OBSTACLE', 'BellaBot-1', 'Белла Зал 1')"
                  class="text-xs text-red-400 hover:text-red-300 transition-colors">
            OBSTACLE (повтор)
          </button>
        </div>
      </div>

      <!-- Зона уведомлений: верхний левый угол (v1.4 H12) -->
      <div class="fixed top-6 left-6 z-[60] flex flex-col space-y-2"
           role="status" aria-live="polite" aria-label="Зона уведомлений">

        <!-- Toast: Ошибки (persistent) -->
        <div *ngFor="let notif of activeNotifications; trackBy: trackNotif"
             class="animate-slide-up">
          <div class="bg-red-500/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
            <lucide-icon name="alert-circle" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium">{{ notif.title }}</p>
                <!-- v1.4 H5: Метка повторяющейся ошибки -->
                <span *ngIf="notif.isRepeating"
                      class="text-[10px] bg-red-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                  ПОВТОРНО
                </span>
              </div>
              <p class="text-xs text-red-100 mt-1">{{ notif.message }}</p>
              <!-- v1.4 H5: Подсказка для repeating -->
              <p *ngIf="notif.isRepeating" class="text-xs text-red-200 mt-2 italic">
                Уведомление будет повторяться, пока ошибка не устранена
              </p>
            </div>
            <button (click)="dismissNotificationWithTracking(notif)" class="text-red-200 hover:text-white transition-colors"
                    aria-label="Закрыть уведомление об ошибке">
              <lucide-icon name="x" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Toast: Информационный (v1.4 H6) -->
        <div *ngIf="infoToast" class="animate-slide-up">
          <div class="bg-[#b8c959]/90 text-black rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
            <lucide-icon name="info" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ infoToast.title }}</p>
            </div>
            <button (click)="infoToast = null" class="text-black/60 hover:text-black transition-colors"
                    aria-label="Закрыть информационное уведомление">
              <lucide-icon name="x" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Toast: Отправлено / dispatched (v1.4 H11) -->
        <div *ngIf="dispatchedToast" class="animate-slide-up">
          <div class="bg-[#b8c959]/90 text-black rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
            <lucide-icon name="send" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ dispatchedToast.title }}</p>
              <p *ngIf="dispatchedToast.subtitle" class="text-xs text-black/70 mt-1">{{ dispatchedToast.subtitle }}</p>
            </div>
            <button (click)="dispatchedToast = null" class="text-black/60 hover:text-black transition-colors"
                    aria-label="Закрыть уведомление об отправке">
              <lucide-icon name="x" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Toast: Завершено / completed (v1.4 H11) -->
        <div *ngIf="completedToast" class="animate-slide-up">
          <div class="bg-green-600/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
            <lucide-icon name="check-circle-2" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ completedToast.title }}</p>
              <p *ngIf="completedToast.subtitle" class="text-xs text-green-100 mt-1">{{ completedToast.subtitle }}</p>
            </div>
            <button (click)="completedToast = null" class="text-green-200 hover:text-white transition-colors"
                    aria-label="Закрыть уведомление о завершении">
              <lucide-icon name="x" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- E-STOP уведомление (D4, З-40) — повторяющееся [H12: top-left] -->
      <div *ngIf="isEstopActive && !estopDismissed" class="fixed top-6 left-6 z-[70] animate-slide-up" style="margin-top: 200px;">
        <div class="bg-red-600 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3 border-2 border-red-400">
          <lucide-icon name="octagon" [size]="24" class="shrink-0 text-white mt-0.5"></lucide-icon>
          <div class="flex-1">
            <p class="text-sm font-bold">E-STOP: Робот {{ assignedRobotName }} остановлен</p>
            <p class="text-xs text-red-100 mt-1">Красная кнопка нажата. Робот прекратил выполнение всех задач. Обратитесь к инженеру.</p>
            <p class="text-xs text-red-200 mt-2 italic">Уведомление будет повторяться до устранения проблемы</p>
          </div>
          <button (click)="dismissEstop()" class="text-red-200 hover:text-white transition-colors">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- ===== МОДАЛЬНЫЕ ОКНА ===== -->

      <!-- М1: Отправить меню -->
      <pudu-send-menu-confirm
        [open]="activeModal === 'send_menu_confirm'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="assignedRobotName"
        [phrase]="settings.send_menu.phrase"
        [phrasePickup]="pickupPhrase"
        [isSubmitting]="isSubmitting"
        (onCancel)="closeDialog()"
        (onConfirm)="onConfirmAction('send_menu')"
      ></pudu-send-menu-confirm>

      <!-- М2: Уборка посуды (из заказа, 1 стол) -->
      <pudu-cleanup-confirm
        [open]="activeModal === 'cleanup_confirm'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="assignedRobotName"
        [phrase]="settings.cleanup.phrase"
        [waitTime]="settings.cleanup.wait_time"
        [isSubmitting]="isSubmitting"
        (onCancel)="closeDialog()"
        (onConfirm)="onConfirmAction('cleanup')"
      ></pudu-cleanup-confirm>

      <!-- М12: Мультивыбор столов для уборки (с главного экрана) -->
      <pudu-cleanup-multi-select
        [open]="activeModal === 'cleanup_multi_select'"
        [tables]="allTables"
        [isSubmitting]="isSubmitting"
        (onCancel)="closeDialog()"
        (onConfirm)="onMultiCleanupConfirm($event)"
      ></pudu-cleanup-multi-select>

      <!-- М3: QR Кассир -->
      <pudu-qr-cashier-phase
        [open]="activeModal === 'qr_cashier_phase'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="assignedRobotName"
        [total]="currentOrder.total"
        [cashierTimeout]="settings.qr_payment.cashier_timeout"
        (onCancel)="closeDialog()"
        (onSendToGuest)="onSendToGuest()"
        (onTimeout)="activeModal = 'qr_timeout'"
      ></pudu-qr-cashier-phase>

      <!-- М4: QR Гость -->
      <pudu-qr-guest-phase
        [open]="activeModal === 'qr_guest_phase'"
        [tableName]="currentOrder.table.table_name"
        [total]="currentOrder.total"
        [guestWaitTime]="settings.qr_payment.payment_timeout"
        (onCancel)="closeDialog()"
        (onPaymentConfirmed)="activeModal = 'qr_success'"
        (onTimeout)="activeModal = 'qr_timeout'"
      ></pudu-qr-guest-phase>

      <!-- М5: QR Успех -->
      <pudu-qr-success
        [open]="activeModal === 'qr_success'"
        [tableName]="currentOrder.table.table_name"
        [total]="currentOrder.total"
        [phraseSuccess]="settings.qr_payment.phrase_success"
        (onClose)="closeDialog()"
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
        (onClose)="closeDialog()"
      ></pudu-unmapped-table>

      <!-- М8: Доставка блюд [BLOCKED] (legacy) -->
      <pudu-send-dish-blocked
        [open]="activeModal === 'send_dish_blocked'"
        (onClose)="closeDialog()"
      ></pudu-send-dish-blocked>

      <!-- М14: Подтверждение доставки блюд (фудкорт) -->
      <pudu-send-dish-confirm
        [open]="activeModal === 'send_dish_confirm'"
        [tableName]="currentOrder.table.table_name"
        [dishes]="orderDishes"
        [maxDishesPerTrip]="settings.send_dish.max_dishes_per_trip"
        [isSubmitting]="isSubmitting"
        (onCancel)="closeDialog()"
        (onConfirm)="executeSendDish()"
      ></pudu-send-dish-confirm>

      <!-- М15: Уведомление раздачи -->
      <pudu-send-dish-pickup-notify
        [open]="activeModal === 'send_dish_pickup_notification'"
        [robotName]="assignedRobotName"
        [tableName]="currentOrder.table.table_name"
        [dishes]="currentTripDishes"
        [tripNumber]="currentTripNumber"
        [totalTrips]="totalTrips"
        [pickupWaitTime]="settings.send_dish.pickup_wait_time"
        (onDismiss)="closeDialog()"
        (onTimeout)="onPickupTimeout()"
      ></pudu-send-dish-pickup-notify>

      <!-- М16: Повторить доставку -->
      <pudu-send-dish-repeat
        [open]="activeModal === 'send_dish_repeat'"
        [tableName]="currentOrder.table.table_name"
        [phraseRepeat]="settings.send_dish.phrase_repeat"
        [isSubmitting]="isSubmitting"
        (onCancel)="closeDialog()"
        (onConfirm)="executeRepeatSendDish()"
      ></pudu-send-dish-repeat>

      <!-- М9: Loading -->
      <pudu-loading-dialog
        [open]="activeModal === 'loading'"
        [message]="loadingMessage"
      ></pudu-loading-dialog>

      <!-- М10: Успех -->
      <pudu-success-dialog
        [open]="activeModal === 'success'"
        [robotName]="assignedRobotName"
        (onClose)="closeDialog()"
      ></pudu-success-dialog>

      <!-- М11: Ошибка -->
      <pudu-error-dialog
        [open]="activeModal === 'error'"
        (onClose)="closeDialog()"
        (onRetry)="onRetry()"
      ></pudu-error-dialog>

      <!-- М17: Выбор робота (v1.4 H2) -->
      <pudu-robot-select
        [open]="activeModal === 'robot_select'"
        [robots]="availableRobots"
        [loading]="robotsLoading"
        [error]="robotsError"
        (onCancel)="closeDialog(); selectedRobot = null"
        (onSelect)="confirmRobotSelection($event)"
        (onRetry)="loadRobots()"
      ></pudu-robot-select>

      <!-- М18: Статус роботов (v1.4 H3) -->
      <pudu-robot-status
        [open]="activeModal === 'robot_status'"
        [robots]="availableRobots"
        [loading]="robotsLoading"
        [error]="robotsError"
        [lastRefresh]="lastRobotRefresh"
        (onClose)="closeDialog()"
        (onRefresh)="loadRobots()"
      ></pudu-robot-status>
    </div>
  `,
})
export class PuduPosScreenComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- State из v1.0 + v1.1 (перенос) ---
  activeModal: PuduModalType = null;
  currentContext: PuduContextType = 'order';
  currentOrder: CurrentOrder = JSON.parse(JSON.stringify(MOCK_CURRENT_ORDER));
  settings = MOCK_SCENARIO_SETTINGS;
  allTables: OrderTable[] = [...MOCK_TABLES];
  isCruiseActive = false;
  loadingMessage = 'Отправка команды роботу';

  // E-STOP (D4, З-40)
  isEstopActive = false;
  estopDismissed = false;
  private estopRepeatId: any = null;

  // NE errors (D5, З-39)
  private neErrorIndex = 0;

  notifications: PuduNotification[] = [];
  private tableIndex = 2; // tbl-003 initially
  private pendingAction: 'send_menu' | 'cleanup' | 'qr_payment' | null = null;
  private loadingTimeoutId: any = null;

  // Сценарии (v1.2)
  private scenarioTimeouts: ReturnType<typeof setTimeout>[] = [];

  // send_dish state (v1.3)
  orderDishes: MockDish[] = [...MOCK_ORDER_DISHES];
  sendDishCompleted = false;
  currentTripNumber = 1;
  currentTripDishes: MockDish[] = [];

  // === v1.4: Новые переменные состояния ===

  // П1 / П7: Выбор робота и статусы (H2/H3/H4)
  availableRobots: AvailableRobot[] = [];
  selectedRobot: AvailableRobot | null = null;
  robotsLoading = false;
  robotsError = false;
  lastRobotRefresh: Date = new Date();
  marketingRobotId: string | null = null;
  marketingRobotName: string | null = null;
  robotSelectPurpose: 'marketing' | null = null;

  // H6: Смешанная уборка
  infoToast: { title: string } | null = null;

  // H10: Fire-and-forget
  isSubmitting = false;
  currentTaskType = 'send_menu';
  currentTableName = 'Стол 5';
  mockTaskId = 'task-mock-001';

  // H11: Lifecycle toast'ы
  dispatchedToast: { title: string; subtitle?: string } | null = null;
  completedToast: { title: string; subtitle?: string } | null = null;
  generalSettings = { ...MOCK_GENERAL_SETTINGS };

  // H5: Repeating notifications
  private readonly REPEATING_ERROR_CODES = ['E_STOP', 'MANUAL_MODE', 'OBSTACLE', 'LOW_BATTERY'];
  dismissedErrors: Map<string, { robot_id: string; error_code: string; dismissed_at: Date }> = new Map();

  get totalTrips(): number {
    return Math.ceil(this.orderDishes.length / this.settings.send_dish.max_dishes_per_trip) || 1;
  }

  // v1.4 (H6): Видимость кнопки «Уборка»
  get isCleanupButtonVisible(): boolean {
    const mode = this.settings.cleanup.mode;
    return mode === 'manual' || mode === 'mixed';
  }

  private scenarioChains: Record<string, ScenarioStep[]> = {
    // QR-оплата: полный успешный цикл
    'qr-full': [
      { modal: 'qr_cashier_phase', delay: 0 },
      { modal: 'loading', delay: 5000 },
      { modal: 'qr_guest_phase', delay: 3000 },
      { modal: 'qr_success', delay: 5000 },
    ],
    // QR-оплата: тайм-аут гостя
    'qr-timeout': [
      { modal: 'qr_cashier_phase', delay: 0 },
      { modal: 'loading', delay: 5000 },
      { modal: 'qr_guest_phase', delay: 3000 },
      { modal: 'qr_timeout', delay: 5000 },
    ],
    // Отправка меню → успех (v1.4 H14: fire-and-forget)
    'send-menu-ok': [
      { modal: 'send_menu_confirm', delay: 3000 },
      { modal: null, toast: 'dispatched', toastText: 'Доставка меню — Белла Зал 1 (BellaBot-01) — отправлено. Стол 5', delay: 2000 },
    ],
    // Отправка меню → ошибка
    'send-menu-err': [
      { modal: 'send_menu_confirm', delay: 0 },
      { modal: 'loading', delay: 2000 },
      { modal: 'error', delay: 3000 },
    ],
    // Уборка (один стол) → успех (v1.4 H14: fire-and-forget)
    'cleanup-ok': [
      { modal: 'cleanup_confirm', delay: 3000 },
      { modal: null, toast: 'dispatched', toastText: 'Уборка посуды — отправлено. Стол 3', delay: 2000 },
    ],
    // Уборка (мультивыбор) → успех (v1.4 H14: fire-and-forget)
    'cleanup-multi-ok': [
      { modal: 'cleanup_multi_select', delay: 3000 },
      { modal: null, toast: 'dispatched', toastText: 'Уборка посуды — отправлено. Столы 3, 5, 8', delay: 2000 },
    ],
    // Стол не замаплен (одиночная модалка)
    'unmapped': [
      { modal: 'unmapped_table', delay: 0 },
    ],

    // === Доставка блюд — v1.3 (G4) ===

    // Полный цикл: подтверждение → fire-and-forget (v1.4 H14)
    'send-dish-full': [
      { modal: 'send_dish_confirm', delay: 3000 },
      { modal: null, toast: 'dispatched', toastText: 'Доставка блюд — Белла Зал 1 (BellaBot-01) — отправлено. Стол 7', delay: 2000 },
    ],
    // Быстрый путь: fire-and-forget (v1.4 H14)
    'send-dish-quick': [
      { modal: null, toast: 'dispatched', toastText: 'Доставка блюд — Белла Зал 1 (BellaBot-01) — отправлено. Стол 7', delay: 2000 },
    ],
    // Повторная отправка: fire-and-forget (v1.4 H14)
    'send-dish-repeat': [
      { modal: 'send_dish_repeat', delay: 3000 },
      { modal: null, toast: 'dispatched', toastText: 'Доставка блюд — Белла Зал 1 (BellaBot-01) — отправлено. Стол 7', delay: 2000 },
    ],
    // Ошибка: стол не замаплен
    'send-dish-error-mapping': [
      { modal: 'error', delay: 0 },
    ],
    // Ошибка: нет свободных роботов
    'send-dish-error-busy': [
      { modal: 'loading', delay: 0 },
      { modal: 'error', delay: 2000 },
    ],
    // Ошибка: NE недоступен
    'send-dish-error-ne': [
      { modal: 'loading', delay: 0 },
      { modal: 'error', delay: 3000 },
    ],

    // === Маркетинг через выбор робота — v1.4 (H9) ===
    'marketing-with-select': [
      { modal: 'robot_select', delay: 0 },
      { modal: null, delay: 3000, action: 'activateCruise' },
    ],
    'marketing-select-busy': [
      { modal: 'robot_select', delay: 0 },
      { modal: null, delay: 3000, action: 'activateCruiseQueued' },
    ],
    'marketing-select-all-offline': [
      { modal: 'robot_select', delay: 0 },
    ],
    'marketing-select-error': [
      { modal: 'robot_select', delay: 0, action: 'forceRobotError' },
    ],

    // === Просмотр статусов — v1.4 (H9) ===
    'robot-status-view': [
      { modal: 'robot_status', delay: 0 },
    ],

    // === Повторные уведомления — v1.4 (H9) ===
    'notification-repeating-estop': [
      { modal: null, delay: 0, action: 'showEstopRepeating' },
    ],
    'notification-repeating-obstacle': [
      { modal: null, delay: 0, action: 'showObstacleRepeating' },
    ],

    // === Дедупликация уборки — v1.4 (H9) ===
    'cleanup-dedup': [
      { modal: null, delay: 0, action: 'showCleanupDedupToast' },
    ],

    // === Lifecycle — v1.4 (H14) ===
    'task-completed-polling': [
      { modal: null, toast: 'completed', toastText: 'Доставка меню — Белла Зал 1 (BellaBot-01) — выполнено. Стол 5', delay: 0 },
    ],
    'fire-and-forget-full': [
      { modal: 'send_menu_confirm', delay: 3000 },
      { modal: null, toast: 'dispatched', toastText: 'Доставка меню — Белла Зал 1 (BellaBot-01) — отправлено. Стол 5', delay: 5000 },
      { modal: null, toast: 'completed', toastText: 'Доставка меню — Белла Зал 1 (BellaBot-01) — выполнено. Стол 5', delay: 3000 },
    ],
  };

  /** Автоназначение робота */
  get assignedRobotName(): string {
    const robot = getAssignedRobot();
    return displayRobotName(robot.ne_name, robot.alias, robot.robot_id);
  }

  /** Подстановка номера стола в фразу при заборе */
  get pickupPhrase(): string {
    const tableNum = this.currentOrder.table.table_name.replace(/[^0-9]/g, '') || '?';
    return this.settings.send_menu.pickup_phrase.replace('{N}', tableNum);
  }

  get activeNotifications(): PuduNotification[] {
    return this.notifications.filter(n => !n.dismissed && !n.is_estop).slice(0, 3);
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // 1. Контекст POS-экрана
      if (params['context'] === 'order' || params['context'] === 'main') {
        this.currentContext = params['context'];
      }

      // 2. Открыть конкретную модалку
      if (params['modal']) {
        this.activeModal = params['modal'] as PuduModalType;
      }

      // 3. Запустить сценарий (автоцепочку)
      if (params['scenario']) {
        this.runScenario(params['scenario']);
      }

      // 4. Показать уведомление
      if (params['notification']) {
        this.showNotification(params['notification']);
      }
    });
  }

  ngOnDestroy(): void {
    // Очистить все pending-таймеры сценариев
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    if (this.loadingTimeoutId) {
      clearTimeout(this.loadingTimeoutId);
    }
    if (this.estopRepeatId) {
      clearTimeout(this.estopRepeatId);
    }
  }

  // ===== Навигация =====

  backToCatalog(): void {
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    this.activeModal = null;
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // ===== Сценарии (v1.2) =====

  runScenario(scenarioId: string): void {
    const chain = this.scenarioChains[scenarioId];
    if (!chain) return;

    // Прервать предыдущий сценарий
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];

    let totalDelay = 0;
    chain.forEach(step => {
      totalDelay += step.delay;
      const timeout = setTimeout(() => {
        this.executeStep(step);
      }, totalDelay);
      this.scenarioTimeouts.push(timeout);
    });
  }

  /** v1.4 (H14): Выполнение шага сценария (modal + toast + action) */
  private executeStep(step: ScenarioStep): void {
    // Установить/закрыть модалку
    if (step.modal) {
      this.activeModal = step.modal;
    } else {
      this.activeModal = null;
    }

    // Показать toast если указан
    if (step.toast === 'dispatched' && step.toastText) {
      this.dispatchedToast = { title: step.toastText };
    } else if (step.toast === 'completed' && step.toastText) {
      this.completedToast = { title: step.toastText };
    } else if (step.toast === 'error' && step.toastText) {
      this.pushNotification(step.toastText, '');
    } else if (step.toast === 'info' && step.toastText) {
      this.infoToast = { title: step.toastText };
    }

    // Выполнить action
    if (step.action) {
      this.executeAction(step.action);
    }
  }

  /** v1.4 (H9/H14): Выполнение именованного действия */
  private executeAction(action: string): void {
    switch (action) {
      case 'activateCruise':
        this.isCruiseActive = true;
        this.marketingRobotName = 'BellaBot-1';
        this.showDispatchedToast('marketing');
        break;
      case 'activateCruiseQueued':
        this.isCruiseActive = true;
        this.marketingRobotName = 'KettyBot-1';
        this.infoToast = { title: 'Робот занят. Задача будет поставлена в очередь' };
        this.showDispatchedToast('marketing');
        break;
      case 'forceRobotError':
        this.robotsError = true;
        this.robotsLoading = false;
        this.availableRobots = [];
        break;
      case 'showEstopRepeating':
        this.isEstopActive = true;
        this.estopDismissed = false;
        break;
      case 'showObstacleRepeating':
        this.handleErrorNotification('PD2024060001', 'BellaBot-1', 'OBSTACLE');
        break;
      case 'showCleanupDedupToast':
        this.infoToast = { title: 'Стол 5: уборка уже запланирована (авто)' };
        break;
    }
  }

  // ===== Уведомления из каталога (v1.2) =====

  showNotification(notificationId: string): void {
    switch (notificationId) {
      case 'notify-estop':
        this.isEstopActive = true;
        this.estopDismissed = false;
        break;
      case 'notify-ne-error':
        this.showNeError();
        break;
      // v1.4 (H5/H9): Повторные уведомления
      case 'notification-repeating-estop':
        this.runScenario('notification-repeating-estop');
        break;
      case 'notification-repeating-obstacle':
        this.runScenario('notification-repeating-obstacle');
        break;
      case 'notification-cleanup-dedup':
        this.runScenario('cleanup-dedup');
        break;
      // v1.4 (H14): Toast-ячейки
      case 'toast-dispatched-send_menu':
        this.showDispatchedToast('send_menu', 'Стол 5');
        break;
      case 'toast-dispatched-cleanup':
        this.showDispatchedToast('cleanup', 'Стол 3');
        break;
      case 'toast-dispatched-send_dish':
        this.showDispatchedToast('send_dish', 'Стол 7');
        break;
      case 'toast-dispatched-marketing':
        this.showDispatchedToast('marketing');
        break;
      case 'toast-completed-generic':
        this.showCompletedToast('send_menu', 'Стол 5');
        break;
      case 'toast-button-submitting':
        this.isSubmitting = true;
        setTimeout(() => { this.isSubmitting = false; }, 3000);
        break;
    }
  }

  // ===== Закрытие диалога (прерывает автосценарий) =====

  closeDialog(): void {
    // Прервать автосценарий при ручном закрытии
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    this.activeModal = null;
  }

  // ===== Button handlers (контекст «Из заказа») =====

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
    // v1.4 (H6): Дедупликация при смешанном режиме
    if (this.settings.cleanup.mode === 'mixed') {
      const hasAutoCleanup = MOCK_ACTIVE_TASKS.some(
        t => t.task_type === 'cleanup' && t.table_id === this.currentOrder.table.table_id &&
             ['queued', 'assigned', 'in_progress'].includes(t.status)
      );
      if (hasAutoCleanup) {
        this.infoToast = {
          title: `${this.currentOrder.table.table_name}: уборка уже запланирована (авто)`
        };
        return;
      }
    }
    this.activeModal = 'cleanup_confirm';
  }

  onSendDish(): void {
    if (!this.currentOrder.table.is_mapped) {
      this.activeModal = 'unmapped_table';
      return;
    }
    // v1.3 (G5): РАЗБЛОКИРОВАНО
    this.currentTripDishes = this.orderDishes.slice(0, this.settings.send_dish.max_dishes_per_trip);
    this.currentTripNumber = 1;
    this.activeModal = 'send_dish_confirm';
  }

  onSendDishRepeat(): void {
    if (!this.sendDishCompleted) return;
    this.activeModal = 'send_dish_repeat';
  }

  executeSendDish(): void {
    this.currentTaskType = 'send_dish';
    this.currentTableName = this.currentOrder.table.table_name;
    this.mockTaskId = `task-${Date.now()}`;
    this.submitTask();
  }

  executeRepeatSendDish(): void {
    this.currentTaskType = 'send_dish';
    this.currentTableName = this.currentOrder.table.table_name;
    this.mockTaskId = `task-${Date.now()}`;
    this.submitTask();
  }

  onPickupTimeout(): void {
    this.sendDishCompleted = true;
    this.activeModal = 'success';
  }

  // ===== Button handlers (контекст «Главный экран») =====

  // v1.4 (H4): Маркетинг через окно выбора робота
  openRobotSelectForMarketing(): void {
    this.robotSelectPurpose = 'marketing';
    this.activeModal = 'robot_select';
    this.loadRobots();
  }

  // v1.4 (H3): Просмотр статусов роботов
  openRobotStatus(): void {
    this.activeModal = 'robot_status';
    this.loadRobots();
    this.lastRobotRefresh = new Date();
  }

  // v1.4 (H2): Загрузка роботов
  async loadRobots(): Promise<void> {
    this.robotsLoading = true;
    this.robotsError = false;
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.availableRobots = [...MOCK_AVAILABLE_ROBOTS];
      this.lastRobotRefresh = new Date();
    } catch {
      this.robotsError = true;
    } finally {
      this.robotsLoading = false;
    }
  }

  // v1.4 (H2 + H11): Подтверждение выбора робота
  confirmRobotSelection(robot: AvailableRobot): void {
    if (robot.status === 'offline') return;

    if (robot.status === 'busy') {
      this.infoToast = { title: `Робот ${displayRobotName(robot.ne_name, robot.alias, robot.robot_id)} занят. Задача будет в очереди` };
    }

    this.marketingRobotId = robot.robot_id;
    this.marketingRobotName = displayRobotName(robot.ne_name, robot.alias, robot.robot_id);
    this.isCruiseActive = !this.isCruiseActive;
    this.activeModal = null;
    this.selectedRobot = null;

    // H11: Toast «Отправлено» для маркетинга
    this.showDispatchedToast('marketing', undefined, displayRobotName(robot.ne_name, robot.alias, robot.robot_id));
  }

  onToggleMarketing(): void {
    this.openRobotSelectForMarketing();
  }

  stopCruise(): void {
    this.isCruiseActive = false;
    this.marketingRobotName = null;
    this.marketingRobotId = null;
  }

  onCleanupMulti(): void {
    this.activeModal = 'cleanup_multi_select';
  }

  onMultiCleanupConfirm(tables: OrderTable[]): void {
    this.currentTaskType = 'cleanup';
    this.currentTableName = tables.map(t => t.table_name).join(', ');
    this.mockTaskId = `task-${Date.now()}`;
    this.submitTask();
  }

  // ===== Action handlers (v1.4 H10: fire-and-forget) =====

  onConfirmAction(action: 'send_menu' | 'cleanup'): void {
    this.currentTaskType = action;
    this.currentTableName = this.currentOrder.table.table_name;
    this.mockTaskId = `task-${Date.now()}`;
    this.submitTask();
  }

  /** v1.4 (H10): Универсальная fire-and-forget отправка */
  async submitTask(): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      await this.simulateHttpRequest();
      // Успех: закрыть модалку + toast
      this.activeModal = null;
      const robot = getAssignedRobot();
      this.showDispatchedToast(this.currentTaskType, this.currentTableName, displayRobotName(robot.ne_name, robot.alias, robot.robot_id));
    } catch {
      this.activeModal = 'error';
    } finally {
      this.isSubmitting = false;
    }
  }

  private simulateHttpRequest(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.2 ? resolve() : reject(new Error('NE API Error'));
      }, 1500);
    });
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
    this.closeDialog();
    this.pushNotification(
      'Гость не оплатил заказ по QR',
      `${this.currentOrder.table.table_name}. Робот возвращается на базу.`
    );
  }

  // ===== E-STOP (D4, З-40) =====

  toggleEstop(): void {
    this.isEstopActive = !this.isEstopActive;
    if (this.isEstopActive) {
      this.estopDismissed = false;
    } else {
      this.estopDismissed = true;
      if (this.estopRepeatId) {
        clearTimeout(this.estopRepeatId);
        this.estopRepeatId = null;
      }
    }
  }

  dismissEstop(): void {
    this.estopDismissed = true;
    // Повторное появление через 5 сек, если E-STOP всё ещё активен
    this.estopRepeatId = setTimeout(() => {
      if (this.isEstopActive) {
        this.estopDismissed = false;
      }
    }, 5000);
  }

  // ===== NE Errors (D5, З-39) =====

  showNeError(): void {
    const neErrors = MOCK_NE_ERROR_NOTIFICATIONS;
    const error = neErrors[this.neErrorIndex % neErrors.length];
    this.pushNotification(error.title, error.message);
    this.neErrorIndex++;
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
      is_estop: false,
    };
    this.notifications = [notif, ...this.notifications];
  }

  dismissNotification(id: string): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.dismissed = true;
  }

  /** v1.4 (H5): Закрытие с трекингом повторных */
  dismissNotificationWithTracking(notification: PuduNotification): void {
    notification.dismissed = true;
    this.notifications = this.notifications.filter(n => n.id !== notification.id);

    // Для repeating: зарегистрировать в dismissedErrors
    if (notification.isRepeating) {
      const [robot_id, error_code] = notification.id.split(':');
      this.dismissedErrors.set(notification.id, {
        robot_id,
        error_code,
        dismissed_at: new Date(),
      });

      // Демо: имитация polling — перепоказать через 3 сек
      setTimeout(() => {
        if (this.dismissedErrors.has(notification.id)) {
          this.dismissedErrors.delete(notification.id);
          this.handleErrorNotification(
            robot_id,
            robot_id === 'PD2024060001' ? 'BellaBot-1' : robot_id,
            error_code
          );
        }
      }, 3000);
    }
  }

  /** v1.4 (H5): Обработка ошибки робота */
  handleErrorNotification(robot_id: string, robot_name: string, error_code: string, ne_name?: string, alias?: string | null): void {
    const key = `${robot_id}:${error_code}`;
    const isRepeating = this.REPEATING_ERROR_CODES.includes(error_code);

    // Не показывать дубль
    if (this.notifications.some(n => n.id === key && !n.dismissed)) return;

    const ERROR_MESSAGES: Record<string, string> = {
      'E_STOP': 'Красная кнопка нажата. Робот прекратил выполнение всех задач',
      'MANUAL_MODE': 'Настройки открыты. Робот в ручном режиме',
      'OBSTACLE': 'Препятствие на маршруте. Уберите препятствие',
      'LOW_BATTERY': 'Низкий заряд батареи. Отправьте робота на зарядку',
    };

    const notif: PuduNotification = {
      id: key,
      type: 'error',
      title: `Робот ${displayRobotName(ne_name ?? robot_name, alias ?? null, robot_id)}: ${error_code}`,
      message: ERROR_MESSAGES[error_code] || `Неизвестная ошибка. Код: ${error_code}`,
      timestamp: new Date(),
      dismissed: false,
      is_estop: false,
      isRepeating: isRepeating,
    };
    this.notifications = [notif, ...this.notifications];
  }

  trackNotif(_: number, notif: PuduNotification): string {
    return notif.id;
  }

  // ===== v1.4 (H11): Lifecycle toast'ы =====

  showDispatchedToast(taskType: string, tableName?: string, robotDisplayName?: string): void {
    const name = TASK_HUMAN_NAMES[taskType] || taskType;
    this.dispatchedToast = {
      title: robotDisplayName
        ? `${name} — ${robotDisplayName} — отправлено`
        : `${name} — отправлено`,
      subtitle: tableName || undefined,
    };
  }

  showCompletedToast(taskType: string, tableName?: string, robotDisplayName?: string): void {
    const name = TASK_HUMAN_NAMES[taskType] || taskType;
    this.dispatchedToast = null;
    this.completedToast = {
      title: robotDisplayName
        ? `${name} — ${robotDisplayName} — выполнено`
        : `${name} — выполнено`,
      subtitle: tableName || undefined,
    };
  }

  // v1.4 (H11): Демо-переключатель
  toggleSuccessNotifications(): void {
    this.generalSettings.show_success_notifications = !this.generalSettings.show_success_notifications;
    this.infoToast = {
      title: this.generalSettings.show_success_notifications
        ? 'Уведомления о завершении: ВКЛ'
        : 'Уведомления о завершении: ВЫКЛ'
    };
  }

  simulateTaskCompleted(): void {
    if (this.generalSettings.show_success_notifications) {
      this.showCompletedToast('send_menu', 'Стол 5');
    } else {
      this.infoToast = { title: 'Уведомление не показано (show_success_notifications = false)' };
    }
  }

  // v1.4 (H6): Демо-переключатель режима уборки
  cycleCleanupMode(): void {
    const modes: Array<'manual' | 'auto' | 'mixed'> = ['manual', 'auto', 'mixed'];
    const idx = modes.indexOf(this.settings.cleanup.mode);
    this.settings.cleanup.mode = modes[(idx + 1) % modes.length];
    this.infoToast = { title: `Режим уборки: ${this.settings.cleanup.mode}` };
  }
}
