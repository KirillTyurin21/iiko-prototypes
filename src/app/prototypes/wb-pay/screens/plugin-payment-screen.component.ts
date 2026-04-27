import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import {
  UiCardComponent,
  UiCardContentComponent,
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiInputComponent,
  UiSelectComponent,
  UiBadgeComponent,
  UiAlertComponent,
} from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';
import { PluginStatusBarComponent } from '../components/plugin-status-bar.component';
import { PaymentStepIndicatorComponent } from '../components/payment-step-indicator.component';
import { PosDialogFrameComponent } from '../components/pos-dialog-frame.component';
import { PaymentStep, ERROR_MESSAGES, PaymentRecord } from '../types';

interface StepItem {
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface ApiLogEntry {
  time: string;
  method: string;
  url: string;
  statusCode: number;
  result?: string;
}

@Component({
  selector: 'app-plugin-payment-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiBadgeComponent,
    UiAlertComponent,
    PluginStatusBarComponent,
    PaymentStepIndicatorComponent,
    PosDialogFrameComponent,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <!-- Plugin status -->
      <app-plugin-status-bar class="mb-4 block"></app-plugin-status-bar>

      <!-- Not configured warning -->
      <ui-alert *ngIf="!state.isPluginConfigured()" type="warning" class="mb-4">
        Плагин не настроен. Перейдите в <strong>Настройка</strong> или настройте credentials в <strong>Панель Web</strong>.
      </ui-alert>

      <!-- Simulation params -->
      <ui-card class="mb-4">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <lucide-icon name="settings" [size]="16" class="text-app-primary"></lucide-icon>
            Параметры имитации
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ui-input
              label="Сумма заказа (₽)"
              type="number"
              [(value)]="amount"
              placeholder="1500"
            ></ui-input>
            <ui-select
              label="Режим"
              [(value)]="mode"
              [options]="modeOptions"
            ></ui-select>
            <ui-select
              label="Результат"
              [(value)]="resultMode"
              [options]="resultOptions"
            ></ui-select>
          </div>
          <div *ngIf="resultMode === 'error'" class="mt-3">
            <ui-select
              label="Тип ошибки"
              [(value)]="selectedErrorCode"
              [options]="errorOptions"
            ></ui-select>
          </div>
          <div class="mt-4">
            <ui-button
              variant="primary"
              iconName="play"
              [disabled]="!state.isPluginConfigured() || isRunning"
              (click)="startPayment()"
            >Начать оплату</ui-button>
            <ui-button
              *ngIf="isRunning"
              variant="ghost"
              iconName="square"
              class="ml-2"
              (click)="reset()"
            >Сброс</ui-button>
          </div>
        </ui-card-content>
      </ui-card>

      <!-- Steps -->
      <ui-card *ngIf="currentStep !== 'idle'" class="mb-4">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3">Шаги оплаты</h3>
          <app-payment-step-indicator [steps]="steps"></app-payment-step-indicator>

          <!-- Current step display -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <!-- Step: scan-qr -->
            <div *ngIf="currentStep === 'scan-qr'" class="text-center">
              <p class="text-sm text-text-secondary mb-3">
                Ожидание сканирования QR-кода из приложения Wildberries
              </p>
              <ui-button
                variant="primary"
                iconName="scan-line"
                (click)="showQrDialog = true"
              >Открыть диалог сканирования</ui-button>
            </div>

            <!-- Step: register -->
            <div *ngIf="currentStep === 'register'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                POST /orders/offline/register...
              </div>
            </div>

            <!-- Step: do -->
            <div *ngIf="currentStep === 'do'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                POST /orders/do...
              </div>
            </div>

            <!-- Step: wait-confirmation -->
            <div *ngIf="currentStep === 'wait-confirmation'" class="text-center">
              <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <lucide-icon name="smartphone" [size]="32" class="text-app-primary"></lucide-icon>
              </div>
              <p class="text-sm font-medium text-text-primary mb-1">
                Гость подтверждает оплату в приложении WB
              </p>
              <p class="text-xs text-text-secondary mb-3">
                Сумма: {{ amount }} ₽
              </p>
              <ui-button
                variant="primary"
                (click)="confirmPayment()"
              >Гость подтвердил</ui-button>
            </div>

            <!-- Step: polling -->
            <div *ngIf="currentStep === 'polling'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                GET /orders/{{ currentOrderId }}/status → polling...
              </div>
            </div>

            <!-- Step: succeeded -->
            <div *ngIf="currentStep === 'succeeded'" class="text-center">
              <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <lucide-icon name="check-circle" [size]="32" class="text-green-500"></lucide-icon>
              </div>
              <p class="text-sm font-medium text-green-700 mb-1">Оплата прошла успешно</p>
              <p class="text-xs text-text-secondary">order_id: {{ currentOrderId }}</p>
              <p class="text-xs text-text-secondary">Сумма: {{ amount }} ₽</p>
              <ui-button variant="outline" class="mt-3" (click)="reset()">Новая оплата</ui-button>
            </div>

            <!-- Step: failed -->
            <div *ngIf="currentStep === 'failed'" class="text-center">
              <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <lucide-icon name="x-circle" [size]="32" class="text-red-500"></lucide-icon>
              </div>
              <p class="text-sm font-medium text-red-700 mb-1">Оплата отклонена</p>
              <p class="text-xs text-red-600 mb-1">{{ failReasonText }}</p>
              <p class="text-xs text-text-secondary">Код: {{ selectedErrorCode }}</p>
              <ui-button variant="outline" class="mt-3" (click)="reset()">Повторить</ui-button>
            </div>
          </div>
        </ui-card-content>
      </ui-card>

      <!-- API Log -->
      <ui-card *ngIf="apiLog.length > 0">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <lucide-icon name="terminal" [size]="16" class="text-gray-500"></lucide-icon>
            API-вызовы
          </h3>
          <div class="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
            <div *ngFor="let entry of apiLog" class="flex gap-2">
              <span class="text-gray-500">{{ entry.time }}</span>
              <span
                class="font-semibold"
                [class.text-green-400]="entry.method === 'GET'"
                [class.text-yellow-400]="entry.method === 'POST'"
              >{{ entry.method }}</span>
              <span class="text-gray-300">{{ entry.url }}</span>
              <span class="text-gray-500">→</span>
              <span
                [class.text-green-400]="entry.statusCode === 200"
                [class.text-red-400]="entry.statusCode !== 200"
              >{{ entry.statusCode }}</span>
              <span *ngIf="entry.result" class="text-gray-400">{{ entry.result }}</span>
            </div>
          </div>
        </ui-card-content>
      </ui-card>
    </div>

    <!-- QR Scan Dialog (POS style) -->
    <app-pos-dialog-frame
      *ngIf="showQrDialog"
      title="Оплата WB-кошельком"
      [okDisabled]="!qrInput.trim()"
      (ok)="onQrScanned()"
      (cancel)="onQrCancel()"
    >
      <p style="margin-bottom: 16px;">
        Отсканируйте QR-код из приложения<br>Wildberries
      </p>
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">QR-код:</label>
        <input
          type="text"
          [(ngModel)]="qrInput"
          placeholder="wb_pay_qr_12345678"
          style="width: 100%; padding: 10px 12px; background: #3a3a3a; border: 1px solid #555; border-radius: 6px; color: #e0e0e0; font-family: monospace; font-size: 14px; outline: none;"
        />
      </div>
      <p style="font-size: 11px; color: #888;">
        Сумма к оплате: <strong style="color: #b8c959;">{{ amount }} ₽</strong>
      </p>
    </app-pos-dialog-frame>
  `,
})
export class PluginPaymentScreenComponent {
  private router = inject(Router);
  state = inject(WbPayStateService);

  breadcrumbs = [
    { label: 'WB Pay', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Плагин', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Оплата' },
  ];

  amount = '1500';
  mode = 'restaurant';
  resultMode = 'success';
  selectedErrorCode = 'EXPIRED_QR_CODE';
  currentStep: PaymentStep = 'idle';
  currentOrderId = '';
  failReasonText = '';
  isRunning = false;
  showQrDialog = false;
  qrInput = 'wb_pay_qr_12345678';
  apiLog: ApiLogEntry[] = [];

  modeOptions = [
    { value: 'restaurant', label: 'Ресторан' },
    { value: 'fast-food', label: 'Фаст-фуд' },
  ];

  resultOptions = [
    { value: 'success', label: 'Успех' },
    { value: 'error', label: 'Ошибка' },
  ];

  get errorOptions() {
    return ERROR_MESSAGES.map(e => ({
      value: e.code,
      label: e.code,
    }));
  }

  get steps(): StepItem[] {
    const stepNames: { key: PaymentStep; label: string }[] = [
      { key: 'idle', label: 'Выбор' },
      { key: 'scan-qr', label: 'QR' },
      { key: 'register', label: 'register' },
      { key: 'do', label: 'do' },
      { key: 'wait-confirmation', label: 'Гость' },
      { key: 'polling', label: 'polling' },
      { key: 'succeeded', label: 'Результат' },
    ];
    const currentIdx = stepNames.findIndex(s =>
      s.key === this.currentStep || (this.currentStep === 'failed' && s.key === 'succeeded')
    );
    return stepNames.map((s, i) => ({
      label: s.label,
      status: i < currentIdx ? 'done' as const
        : i === currentIdx ? 'active' as const
        : 'pending' as const,
    }));
  }

  startPayment(): void {
    this.isRunning = true;
    this.apiLog = [];
    this.currentOrderId = 'ord-' + Date.now().toString(36);
    this.currentStep = 'scan-qr';
    this.showQrDialog = true;
  }

  onQrScanned(): void {
    this.showQrDialog = false;
    this.addLog('POST', '/orders/offline/register', 200, `order_id: ${this.currentOrderId}`);

    this.currentStep = 'register';
    setTimeout(() => {
      this.currentStep = 'do';
      this.addLog('POST', '/orders/do', 200);

      setTimeout(() => {
        this.currentStep = 'wait-confirmation';
      }, 800);
    }, 1000);
  }

  onQrCancel(): void {
    this.showQrDialog = false;
    this.reset();
  }

  confirmPayment(): void {
    this.currentStep = 'polling';
    this.addLog('GET', `/orders/${this.currentOrderId}/status`, 200, 'pending');

    setTimeout(() => {
      this.addLog('GET', `/orders/${this.currentOrderId}/status`, 200, 'pending');

      setTimeout(() => {
        if (this.resultMode === 'success') {
          this.currentStep = 'succeeded';
          this.addLog('GET', `/orders/${this.currentOrderId}/status`, 200, 'succeeded');
          this.state.addPaymentRecord({
            id: 'pay-' + Date.now(),
            orderId: this.currentOrderId,
            amount: Number(this.amount) || 0,
            status: 'succeeded',
            timestamp: new Date().toISOString(),
            qrCode: this.qrInput,
          });
        } else {
          this.currentStep = 'failed';
          const errMsg = ERROR_MESSAGES.find(e => e.code === this.selectedErrorCode);
          this.failReasonText = errMsg?.text ?? 'Неизвестная ошибка';
          this.addLog('GET', `/orders/${this.currentOrderId}/status`, 200, `failed: ${this.selectedErrorCode}`);
          this.state.addPaymentRecord({
            id: 'pay-' + Date.now(),
            orderId: this.currentOrderId,
            amount: Number(this.amount) || 0,
            status: 'failed',
            timestamp: new Date().toISOString(),
            failReason: this.selectedErrorCode,
            qrCode: this.qrInput,
          });
        }
        this.isRunning = false;
      }, 1200);
    }, 1000);
  }

  reset(): void {
    this.currentStep = 'idle';
    this.isRunning = false;
    this.showQrDialog = false;
    this.currentOrderId = '';
    this.failReasonText = '';
  }

  private addLog(method: string, url: string, statusCode: number, result?: string): void {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.apiLog.push({ time, method, url, statusCode, result });
  }
}
