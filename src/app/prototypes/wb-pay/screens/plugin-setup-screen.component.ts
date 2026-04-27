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
  UiBadgeComponent,
  UiAlertComponent,
} from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';
import { PluginStatusBarComponent } from '../components/plugin-status-bar.component';
import { PosDialogFrameComponent } from '../components/pos-dialog-frame.component';

@Component({
  selector: 'app-plugin-setup-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiAlertComponent,
    PluginStatusBarComponent,
    PosDialogFrameComponent,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <lucide-icon name="settings" [size]="20" class="text-app-primary"></lucide-icon>
        Первичная настройка плагина
      </h2>

      <!-- Current state -->
      <app-plugin-status-bar class="mb-4 block"></app-plugin-status-bar>

      <ui-alert *ngIf="!state.isPluginConfigured()" type="warning" class="mb-4">
        WB Pay не настроен. Выберите один из каналов настройки ниже.
      </ui-alert>

      <ui-alert *ngIf="state.isPluginConfigured()" type="success" class="mb-4">
        Плагин настроен и готов к работе.
        <ui-button
          variant="ghost"
          size="sm"
          class="ml-2"
          (click)="goToPayment()"
        >Перейти к оплате →</ui-button>
      </ui-alert>

      <!-- Channels -->
      <div class="space-y-4">
        <!-- Channel A: Transport -->
        <ui-card>
          <ui-card-content>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <lucide-icon name="cloud-download" [size]="20" class="text-green-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-text-primary">Канал A: Transport Push</h3>
                  <ui-badge variant="success">Рекомендуемый</ui-badge>
                </div>
                <p class="text-sm text-text-secondary mb-3">
                  Credentials доставляются автоматически из Web-панели через Transport API.
                  Администратор сохраняет credentials в Web → плагин получает конфигурацию автоматически.
                </p>
                <ui-button
                  variant="outline"
                  iconName="download"
                  [disabled]="state.isPluginConfigured()"
                  (click)="applyTransport()"
                >Имитировать push</ui-button>
                <p *ngIf="transportError" class="text-xs text-red-500 mt-2">{{ transportError }}</p>
                <p *ngIf="transportSuccess" class="text-xs text-green-600 mt-2">{{ transportSuccess }}</p>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Channel B: QR -->
        <ui-card>
          <ui-card-content>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <lucide-icon name="qr-code" [size]="20" class="text-app-primary"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-text-primary">Канал B: QR-проливка</h3>
                  <ui-badge variant="default">Альтернативный</ui-badge>
                </div>
                <p class="text-sm text-text-secondary mb-3">
                  Администратор генерирует QR-код в Web-панели. Кассир сканирует QR на терминале → плагин настраивается автоматически.
                </p>
                <ui-button
                  variant="outline"
                  iconName="scan-line"
                  [disabled]="state.isPluginConfigured()"
                  (click)="showQrDialog = true"
                >Открыть диалог «Настройка WB Pay»</ui-button>
                <p *ngIf="qrError" class="text-xs text-red-500 mt-2">{{ qrError }}</p>
                <p *ngIf="qrSuccess" class="text-xs text-green-600 mt-2">{{ qrSuccess }}</p>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Channel C: Manual -->
        <ui-card>
          <ui-card-content>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <lucide-icon name="file-edit" [size]="20" class="text-gray-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-text-primary">Канал C: Ручная настройка</h3>
                  <ui-badge variant="warning">Аварийный</ui-badge>
                </div>
                <p class="text-sm text-text-secondary mb-3">
                  Редактирование config.xml вручную. Используется только если Transport и QR недоступны.
                </p>
                <ui-button
                  variant="outline"
                  iconName="edit"
                  [disabled]="state.isPluginConfigured()"
                  (click)="applyManual()"
                >Имитировать ручной ввод</ui-button>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Reset -->
        <div *ngIf="state.isPluginConfigured()" class="pt-2">
          <ui-button
            variant="ghost"
            iconName="rotate-ccw"
            (click)="resetPlugin()"
          >Сбросить настройки плагина</ui-button>
        </div>
      </div>
    </div>

    <!-- QR Scan Dialog -->
    <app-pos-dialog-frame
      *ngIf="showQrDialog"
      title="Настройка WB Pay"
      [okDisabled]="!qrInput.trim()"
      (ok)="onQrScan()"
      (cancel)="showQrDialog = false"
    >
      <p style="margin-bottom: 16px;">
        Отсканируйте QR-код настройки,<br>сгенерированный в Web-панели
      </p>
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">QR-данные:</label>
        <input
          type="text"
          [(ngModel)]="qrInput"
          [placeholder]="state.lastGeneratedQrData || 'base64-encoded-config...'"
          style="width: 100%; padding: 10px 12px; background: #3a3a3a; border: 1px solid #555; border-radius: 6px; color: #e0e0e0; font-family: monospace; font-size: 13px; outline: none;"
        />
      </div>
      <p style="font-size: 11px; color: #888;">
        Совет: сначала сгенерируйте QR в <strong style="color: #b8c959;">Панель Web</strong>
      </p>
    </app-pos-dialog-frame>
  `,
})
export class PluginSetupScreenComponent {
  private router = inject(Router);
  state = inject(WbPayStateService);

  breadcrumbs = [
    { label: 'WB Pay', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Плагин', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Настройка' },
  ];

  showQrDialog = false;
  qrInput = '';
  transportError = '';
  transportSuccess = '';
  qrError = '';
  qrSuccess = '';

  applyTransport(): void {
    this.clearMessages();
    const result = this.state.applyTransportPush();
    if (result) {
      this.transportSuccess = 'Credentials получены через Transport push. Плагин настроен!';
    } else {
      this.transportError = 'Нет сохранённых credentials. Сначала настройте в Web-панели.';
    }
  }

  onQrScan(): void {
    this.showQrDialog = false;
    this.clearMessages();
    const input = this.qrInput.trim() || this.state.lastGeneratedQrData;
    if (!input) {
      this.qrError = 'QR-код пуст. Сгенерируйте QR в Web-панели.';
      return;
    }
    const result = this.state.applyQrSetup();
    if (result) {
      this.qrSuccess = 'Настройка через QR выполнена успешно!';
    } else {
      this.qrError = 'Не удалось применить QR-данные.';
    }
  }

  applyManual(): void {
    this.clearMessages();
    this.state.applyManualSetup();
  }

  resetPlugin(): void {
    this.clearMessages();
    this.state.resetPluginState();
  }

  goToPayment(): void {
    this.router.navigate(['/prototype/wb-pay/plugin/payment']);
  }

  private clearMessages(): void {
    this.transportError = '';
    this.transportSuccess = '';
    this.qrError = '';
    this.qrSuccess = '';
  }
}
