import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiCardComponent, UiCardContentComponent, UiBadgeComponent } from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';

@Component({
  selector: 'app-wb-pay-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBadgeComponent,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <lucide-icon name="wallet" [size]="24" class="text-purple-600"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-text-primary">WB Pay</h1>
            <p class="text-sm text-text-secondary">Оплата WB-кошельком — плагин Front + панель Web</p>
          </div>
        </div>
      </div>

      <!-- Two cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <!-- Plugin card -->
        <ui-card [hoverable]="true" (cardClick)="goTo('plugin/payment')">
          <ui-card-content>
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-xl bg-[#3a3a3a] flex items-center justify-center flex-shrink-0">
                <lucide-icon name="monitor" [size]="28" class="text-[#b8c959]"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-text-primary mb-1">Плагин Front</h2>
                <p class="text-sm text-text-secondary mb-3">
                  Плагин оплаты WB-кошельком для POS-терминала
                </p>
                <div class="flex items-center gap-3">
                  <ui-badge [variant]="state.isPluginConfigured() ? 'success' : 'warning'">
                    {{ state.isPluginConfigured() ? 'Настроен' : 'Не настроен' }}
                  </ui-badge>
                  <span class="text-xs text-text-secondary">
                    Операций: {{ state.paymentHistory.length }}
                  </span>
                </div>
              </div>
              <lucide-icon name="chevron-right" [size]="20" class="text-gray-300 mt-2"></lucide-icon>
            </div>
          </ui-card-content>
        </ui-card>

        <!-- Admin card -->
        <ui-card [hoverable]="true" (cardClick)="goTo('admin')">
          <ui-card-content>
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <lucide-icon name="settings" [size]="28" class="text-app-primary"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-text-primary mb-1">Панель Web</h2>
                <p class="text-sm text-text-secondary mb-3">
                  Управление credentials и терминалами
                </p>
                <div class="flex items-center gap-3">
                  <ui-badge variant="default">
                    Рестораны: {{ state.getTotalStoresCount() }}
                  </ui-badge>
                  <span class="text-xs text-text-secondary">
                    Настроено: {{ state.getConfiguredStoresCount() }}/{{ state.getTotalStoresCount() }}
                  </span>
                </div>
              </div>
              <lucide-icon name="chevron-right" [size]="20" class="text-gray-300 mt-2"></lucide-icon>
            </div>
          </ui-card-content>
        </ui-card>
      </div>

      <!-- Interaction schema -->
      <ui-card>
        <ui-card-content>
          <h3 class="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <lucide-icon name="arrow-left-right" [size]="16" class="text-app-primary"></lucide-icon>
            Схема взаимодействия
          </h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs font-bold text-app-primary">W</span>
              </div>
              <div>
                <p class="text-sm text-text-primary">Web: Сохранить credentials</p>
                <p class="text-xs text-text-secondary">→ Transport push → Плагин получает конфигурацию</p>
              </div>
            </div>
            <div class="border-l-2 border-dashed border-gray-200 ml-3 h-4"></div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs font-bold text-gray-600">F</span>
              </div>
              <div>
                <p class="text-sm text-text-primary">Front: Тип оплаты «WB-кошелек» доступен</p>
                <p class="text-xs text-text-secondary">Кассир выбирает WB-кошелек → сканирование QR</p>
              </div>
            </div>
            <div class="border-l-2 border-dashed border-gray-200 ml-3 h-4"></div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs font-bold text-green-600">✓</span>
              </div>
              <div>
                <p class="text-sm text-text-primary">Оплата: register → do → poll → succeeded</p>
                <p class="text-xs text-text-secondary">Гость подтверждает в приложении WB → заказ закрыт</p>
              </div>
            </div>
          </div>
        </ui-card-content>
      </ui-card>

      <!-- Plugin screens -->
      <div class="mt-6">
        <h3 class="text-sm font-semibold text-text-primary mb-3">Экраны плагина Front</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            *ngFor="let screen of pluginScreens"
            (click)="goTo(screen.route)"
            class="p-3 rounded-lg border border-border hover:border-app-primary/40 hover:shadow-sm
                   cursor-pointer transition-all bg-white"
          >
            <lucide-icon [name]="screen.icon" [size]="18" class="text-app-primary mb-2"></lucide-icon>
            <p class="text-sm font-medium text-text-primary">{{ screen.label }}</p>
            <p class="text-xs text-text-secondary mt-0.5">{{ screen.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WbPayMainScreenComponent {
  private router = inject(Router);
  state = inject(WbPayStateService);

  pluginScreens = [
    { route: 'plugin/payment', icon: 'credit-card', label: 'Оплата', desc: 'QR-код' },
    { route: 'plugin/refund', icon: 'refresh-cw', label: 'Возврат', desc: 'Полный возврат' },
    { route: 'plugin/fiscal-error', icon: 'alert-triangle', label: 'FISCAL_ERROR', desc: 'Экстренный' },
    { route: 'plugin/setup', icon: 'settings', label: 'Настройка', desc: '3 канала' },
  ];

  goTo(route: string): void {
    this.router.navigate(['/prototype/wb-pay', ...route.split('/')]);
  }
}
