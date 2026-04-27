import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiCardComponent,
  UiCardContentComponent,
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiAlertComponent,
} from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';
import { PaymentStepIndicatorComponent } from '../components/payment-step-indicator.component';

interface StepItem {
  label: string;
  status: 'done' | 'active' | 'pending';
}

type FiscalStep = 'idle' | 'payment' | 'fiscal-error' | 'emergency-cancel' | 'refund' | 'done';

@Component({
  selector: 'app-plugin-fiscal-error-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiAlertComponent,
    PaymentStepIndicatorComponent,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <lucide-icon name="alert-triangle" [size]="20" class="text-amber-500"></lucide-icon>
        Сценарий FISCAL_ERROR
      </h2>

      <ui-alert type="warning" class="mb-4">
        <strong>Нештатный сценарий:</strong> оплата прошла успешно (Pay → succeeded), но фискальный регистратор
        не смог напечатать фискальный чек. Плагин автоматически инициирует экстренный возврат (EmergencyCancelPayment)
        и предлагает кассиру повторить оплату.
      </ui-alert>

      <!-- Description -->
      <ui-card class="mb-4">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3">Описание сценария (ФЗ-54, п. 5.11)</h3>
          <div class="space-y-2 text-sm text-text-secondary">
            <p>1. Плагин вызывает <code class="px-1 py-0.5 bg-gray-100 rounded text-xs">Pay()</code> → WB Pay возвращает <strong>succeeded</strong></p>
            <p>2. Front пытается напечатать фискальный чек → <span class="text-red-600 font-medium">ОШИБКА ФР</span></p>
            <p>3. Плагин автоматически вызывает <code class="px-1 py-0.5 bg-gray-100 rounded text-xs">EmergencyCancelPayment()</code></p>
            <p>4. Выполняется полный возврат (refund) через WB Pay API</p>
            <p>5. Кассиру показывается сообщение: <em>«Повторите оплату»</em></p>
          </div>
        </ui-card-content>
      </ui-card>

      <!-- Simulation -->
      <ui-card class="mb-4">
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-3">Имитация</h3>

          <div *ngIf="currentFiscalStep === 'idle'">
            <ui-button
              variant="primary"
              iconName="play"
              [disabled]="!state.isPluginConfigured()"
              (click)="startSimulation()"
            >Запустить имитацию</ui-button>
            <p *ngIf="!state.isPluginConfigured()" class="text-xs text-red-500 mt-2">
              Плагин не настроен. Настройте credentials.
            </p>
          </div>

          <div *ngIf="currentFiscalStep !== 'idle'">
            <app-payment-step-indicator [steps]="steps"></app-payment-step-indicator>

            <div class="mt-4 p-4 rounded-lg border" [ngClass]="stepBgClass">
              <!-- Payment succeeded -->
              <div *ngIf="currentFiscalStep === 'payment'" class="text-center">
                <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  Pay() → succeeded...
                </div>
              </div>

              <!-- Fiscal error -->
              <div *ngIf="currentFiscalStep === 'fiscal-error'" class="text-center">
                <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <lucide-icon name="printer" [size]="32" class="text-red-500"></lucide-icon>
                </div>
                <p class="text-sm font-medium text-red-700 mb-1">Ошибка фискального регистратора!</p>
                <p class="text-xs text-red-600">Чек не напечатан. Запуск экстренного возврата...</p>
              </div>

              <!-- Emergency cancel -->
              <div *ngIf="currentFiscalStep === 'emergency-cancel'" class="text-center">
                <div class="flex items-center justify-center gap-2 text-sm text-amber-600">
                  <div class="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  EmergencyCancelPayment() → refund...
                </div>
              </div>

              <!-- Refund -->
              <div *ngIf="currentFiscalStep === 'refund'" class="text-center">
                <div class="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <div class="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                  Возврат средств...
                </div>
              </div>

              <!-- Done -->
              <div *ngIf="currentFiscalStep === 'done'" class="text-center">
                <div class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <lucide-icon name="alert-triangle" [size]="32" class="text-amber-500"></lucide-icon>
                </div>
                <p class="text-sm font-medium text-amber-700 mb-1">Возврат выполнен</p>
                <p class="text-xs text-text-secondary mb-3">
                  Оплата отменена. Средства возвращены в WB-кошелёк гостя.
                </p>
                <div class="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                  <p class="text-sm text-blue-800 font-medium">💬 Сообщение кассиру:</p>
                  <p class="text-sm text-blue-700 mt-1">«Повторите оплату»</p>
                </div>
                <ui-button variant="outline" (click)="resetSimulation()">Сбросить</ui-button>
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
          <div class="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1">
            <div *ngFor="let entry of apiLog" class="flex gap-2">
              <span class="text-gray-500">{{ entry.time }}</span>
              <span class="font-semibold"
                [class.text-green-400]="entry.method === 'GET'"
                [class.text-yellow-400]="entry.method === 'POST'"
                [class.text-red-400]="entry.method === 'ERROR'"
              >{{ entry.method }}</span>
              <span class="text-gray-300">{{ entry.url }}</span>
              <span *ngIf="entry.result" class="text-gray-500">→</span>
              <span *ngIf="entry.result" class="text-gray-400">{{ entry.result }}</span>
            </div>
          </div>
        </ui-card-content>
      </ui-card>
    </div>
  `,
})
export class PluginFiscalErrorScreenComponent {
  private router = inject(Router);
  state = inject(WbPayStateService);

  breadcrumbs = [
    { label: 'WB Pay', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Плагин', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'FISCAL_ERROR' },
  ];

  currentFiscalStep: FiscalStep = 'idle';
  apiLog: { time: string; method: string; url: string; result?: string }[] = [];

  get steps(): StepItem[] {
    const stepNames: { key: FiscalStep; label: string }[] = [
      { key: 'payment', label: 'Pay()' },
      { key: 'fiscal-error', label: 'ФР ошибка' },
      { key: 'emergency-cancel', label: 'Emergency' },
      { key: 'refund', label: 'Refund' },
      { key: 'done', label: 'Готово' },
    ];
    const currentIdx = stepNames.findIndex(s => s.key === this.currentFiscalStep);
    return stepNames.map((s, i) => ({
      label: s.label,
      status: i < currentIdx ? 'done' as const
        : i === currentIdx ? 'active' as const
        : 'pending' as const,
    }));
  }

  get stepBgClass(): string {
    switch (this.currentFiscalStep) {
      case 'fiscal-error': return 'bg-red-50 border-red-100';
      case 'emergency-cancel': return 'bg-amber-50 border-amber-100';
      case 'done': return 'bg-gray-50 border-gray-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  }

  startSimulation(): void {
    this.apiLog = [];
    this.currentFiscalStep = 'payment';
    this.addLog('POST', '/orders/offline/register', '200 → order_id: ord-fiscal');
    this.addLog('POST', '/orders/do', '200');
    this.addLog('GET', '/orders/ord-fiscal/status', 'succeeded');

    setTimeout(() => {
      this.currentFiscalStep = 'fiscal-error';
      this.addLog('ERROR', 'FiscalRegister.PrintCheck()', 'ОШИБКА ФР');

      setTimeout(() => {
        this.currentFiscalStep = 'emergency-cancel';
        this.addLog('POST', 'EmergencyCancelPayment()', 'initiated');

        setTimeout(() => {
          this.currentFiscalStep = 'refund';
          this.addLog('POST', '/refunds/register', '200');
          this.addLog('POST', '/refunds/do', '200');

          setTimeout(() => {
            this.currentFiscalStep = 'done';
            this.addLog('GET', '/refunds/ref-fiscal/status', 'succeeded');
          }, 1200);
        }, 1000);
      }, 1500);
    }, 1500);
  }

  resetSimulation(): void {
    this.currentFiscalStep = 'idle';
    this.apiLog = [];
  }

  private addLog(method: string, url: string, result?: string): void {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.apiLog.push({ time, method, url, result });
  }
}
