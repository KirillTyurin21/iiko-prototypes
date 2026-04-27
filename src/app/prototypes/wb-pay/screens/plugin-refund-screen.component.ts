import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiCardComponent,
  UiCardContentComponent,
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiAlertComponent,
  UiEmptyStateComponent,
} from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';
import { PaymentStepIndicatorComponent } from '../components/payment-step-indicator.component';
import { PosDialogFrameComponent } from '../components/pos-dialog-frame.component';
import { PaymentRecord } from '../types';

interface StepItem {
  label: string;
  status: 'done' | 'active' | 'pending';
}

type RefundStep = 'idle' | 'get-rollback' | 'register' | 'do' | 'polling' | 'succeeded' | 'failed';

interface ApiLogEntry {
  time: string;
  method: string;
  url: string;
  statusCode: number;
  result?: string;
}

@Component({
  selector: 'app-plugin-refund-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiAlertComponent,
    UiEmptyStateComponent,
    PaymentStepIndicatorComponent,
    PosDialogFrameComponent,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <lucide-icon name="refresh-cw" [size]="20" class="text-app-primary"></lucide-icon>
        Сценарий возврата (refund)
      </h2>

      <!-- Succeeded payments list -->
      <ui-card class="mb-4">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3">Оплаченные заказы</h3>

          <ui-empty-state
            *ngIf="succeededPayments.length === 0"
            icon="inbox"
            title="Нет оплаченных заказов"
            description="Сначала проведите успешную оплату на экране «Оплата»"
          ></ui-empty-state>

          <div *ngIf="succeededPayments.length > 0" class="space-y-2">
            <div
              *ngFor="let payment of succeededPayments"
              class="flex items-center justify-between p-3 rounded-lg border transition-all"
              [class.border-app-primary]="selectedPayment?.id === payment.id"
              [class.bg-blue-50]="selectedPayment?.id === payment.id"
              [class.border-border]="selectedPayment?.id !== payment.id"
              [class.cursor-pointer]="currentRefundStep === 'idle'"
              (click)="selectPayment(payment)"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded bg-green-50 flex items-center justify-center">
                  <lucide-icon name="check-circle-2" [size]="16" class="text-green-500"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-text-primary">{{ payment.orderId }}</p>
                  <p class="text-xs text-text-secondary">{{ formatDate(payment.timestamp) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-text-primary">{{ payment.amount }} ₽</span>
                <ui-badge variant="success">Оплачен</ui-badge>
              </div>
            </div>
          </div>

          <div *ngIf="selectedPayment && currentRefundStep === 'idle'" class="mt-4">
            <ui-button
              variant="primary"
              iconName="refresh-cw"
              (click)="startRefund()"
            >Инициировать возврат</ui-button>
          </div>
        </ui-card-content>
      </ui-card>

      <!-- Refund steps -->
      <ui-card *ngIf="currentRefundStep !== 'idle'" class="mb-4">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3">Шаги возврата</h3>
          <app-payment-step-indicator [steps]="steps"></app-payment-step-indicator>

          <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <!-- get-rollback -->
            <div *ngIf="currentRefundStep === 'get-rollback'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                GetRollbackData → получение order_id для возврата...
              </div>
            </div>

            <!-- register -->
            <div *ngIf="currentRefundStep === 'register'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                POST /api/v1/refunds/register...
              </div>
            </div>

            <!-- do -->
            <div *ngIf="currentRefundStep === 'do'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                POST /api/v1/refunds/do...
              </div>
            </div>

            <!-- polling -->
            <div *ngIf="currentRefundStep === 'polling'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                GET /api/v1/refunds/{{ refundId }}/status → polling...
              </div>
            </div>

            <!-- succeeded -->
            <div *ngIf="currentRefundStep === 'succeeded'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-green-600">
                <lucide-icon name="check-circle-2" [size]="18" class="text-green-500"></lucide-icon>
                Возврат выполнен (refund_id: {{ refundId }}, сумма: {{ selectedPayment?.amount }} ₽)
              </div>
            </div>

            <!-- failed -->
            <div *ngIf="currentRefundStep === 'failed'" class="text-center">
              <div class="flex items-center justify-center gap-2 text-sm text-red-600">
                <lucide-icon name="x-circle" [size]="18" class="text-red-500"></lucide-icon>
                Ошибка возврата
              </div>
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
                [class.text-cyan-400]="entry.method === 'SDK'"
              >{{ entry.method }}</span>
              <span class="text-gray-300">{{ entry.url }}</span>
              <span class="text-gray-500">→</span>
              <span
                *ngIf="entry.statusCode > 0"
                [class.text-green-400]="entry.statusCode === 200"
                [class.text-red-400]="entry.statusCode !== 200"
              >{{ entry.statusCode }}</span>
              <span *ngIf="entry.result" class="text-gray-400">{{ entry.result }}</span>
            </div>
          </div>
        </ui-card-content>
      </ui-card>
    </div>

    <!-- POS Dialog: Refund Succeeded -->
    <app-pos-dialog-frame
      *ngIf="currentRefundStep === 'succeeded'"
      title="WB Pay"
      [showButtons]="false"
      [showSingleOk]="true"
      okText="Готово"
      size="sm"
      (ok)="resetRefund()"
    >
      <div class="flex flex-col items-center text-center py-4">
        <div class="rounded-full bg-[#b8c959]/20 p-4 mb-4">
          <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
        </div>
        <p class="text-white text-base font-medium mb-2">Возврат выполнен</p>
        <div class="text-gray-400 text-sm space-y-1">
          <p>Сумма: <span class="text-white">{{ selectedPayment?.amount }} ₽</span></p>
          <p class="text-xs text-gray-500 font-mono">refund_id: {{ refundId }}</p>
        </div>
      </div>
    </app-pos-dialog-frame>

    <!-- POS Dialog: Refund Failed -->
    <app-pos-dialog-frame
      *ngIf="currentRefundStep === 'failed'"
      title="WB Pay"
      [showButtons]="false"
      [showSingleOk]="true"
      okText="ОК"
      size="sm"
      (ok)="resetRefund()"
    >
      <div class="flex flex-col items-center text-center py-4">
        <div class="rounded-full bg-red-500/20 p-4 mb-4">
          <lucide-icon name="x-circle" [size]="48" class="text-red-400"></lucide-icon>
        </div>
        <p class="text-white text-base font-medium mb-2">Ошибка возврата</p>
        <p class="text-gray-400 text-sm">Не удалось выполнить возврат.<br>Попробуйте позже.</p>
      </div>
    </app-pos-dialog-frame>
  `,
})
export class PluginRefundScreenComponent {
  private router = inject(Router);
  state = inject(WbPayStateService);

  breadcrumbs = [
    { label: 'WB Pay', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Плагин', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Возврат' },
  ];

  selectedPayment: PaymentRecord | null = null;
  currentRefundStep: RefundStep = 'idle';
  refundId = '';
  apiLog: ApiLogEntry[] = [];

  get succeededPayments(): PaymentRecord[] {
    return this.state.getSucceededPayments();
  }

  get steps(): StepItem[] {
    const stepNames: { key: RefundStep; label: string }[] = [
      { key: 'get-rollback', label: 'Rollback' },
      { key: 'register', label: 'register' },
      { key: 'do', label: 'do' },
      { key: 'polling', label: 'polling' },
      { key: 'succeeded', label: 'Результат' },
    ];
    const currentIdx = stepNames.findIndex(s =>
      s.key === this.currentRefundStep || (this.currentRefundStep === 'failed' && s.key === 'succeeded')
    );
    return stepNames.map((s, i) => ({
      label: s.label,
      status: i < currentIdx ? 'done' as const
        : i === currentIdx ? 'active' as const
        : 'pending' as const,
    }));
  }

  selectPayment(payment: PaymentRecord): void {
    if (this.currentRefundStep !== 'idle') return;
    this.selectedPayment = payment;
  }

  startRefund(): void {
    if (!this.selectedPayment) return;
    this.apiLog = [];
    this.refundId = 'ref-' + Date.now().toString(36);
    this.currentRefundStep = 'get-rollback';
    this.addLog('SDK', 'GetRollbackData()', 0, 'order_id: ' + this.selectedPayment.orderId);

    setTimeout(() => {
      this.currentRefundStep = 'register';
      this.addLog('POST', '/api/v1/refunds/register', 200, `refund_id: ${this.refundId}`);

      setTimeout(() => {
        this.currentRefundStep = 'do';
        this.addLog('POST', '/api/v1/refunds/do', 200);

        setTimeout(() => {
          this.currentRefundStep = 'polling';
          this.addLog('GET', `/api/v1/refunds/${this.refundId}/status`, 200, 'pending');

          setTimeout(() => {
            this.currentRefundStep = 'succeeded';
            this.addLog('GET', `/api/v1/refunds/${this.refundId}/status`, 200, 'succeeded');
            if (this.selectedPayment) {
              this.state.updatePaymentStatus(this.selectedPayment.id, 'refunded');
            }
          }, 1500);
        }, 1000);
      }, 800);
    }, 1000);
  }

  resetRefund(): void {
    this.currentRefundStep = 'idle';
    this.selectedPayment = null;
    this.refundId = '';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  private addLog(method: string, url: string, statusCode: number, result?: string): void {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.apiLog.push({ time, method, url, statusCode, result });
  }
}
