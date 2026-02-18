import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiButtonComponent, UiAlertComponent, UiModalComponent, UiInputComponent } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { Restaurant } from '../types';
import { MOCK_RESTAURANTS } from '../data/mock-data';
import { PuduPrototypeComponent } from '../pudu-prototype.component';

type NeConnectionStatus = 'connected' | 'not_configured' | 'error';

@Component({
  selector: 'app-restaurants-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiButtonComponent, UiAlertComponent, UiModalComponent, UiInputComponent],
  template: `
    <!-- SUBHEADER -->
    <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
      <h1 class="text-lg font-semibold text-gray-900">Настройки PUDU</h1>
    </div>

    <!-- CONTENT -->
    <div class="bg-gray-50 p-6 flex-1 overflow-y-auto">

      <!-- LOADING -->
      <div *ngIf="isLoading" class="flex items-center justify-center h-64" role="status">
        <lucide-icon name="loader-2" [size]="32" class="animate-spin text-gray-400"></lucide-icon>
      </div>

      <!-- ERROR STATE -->
      <div *ngIf="!isLoading && hasError" class="animate-fade-in">
        <ui-alert
          variant="error"
          title="Не удалось загрузить список ресторанов. Попробуйте обновить страницу"
          [dismissible]="false"
        >
          <ui-button variant="outline" size="sm" iconName="refresh-cw" (click)="loadData()">Обновить</ui-button>
        </ui-alert>
      </div>

      <!-- EMPTY STATE (0 restaurants) -->
      <div *ngIf="!isLoading && !hasError && restaurants.length === 0" class="flex items-center justify-center h-64" role="status">
        <p class="text-gray-400 text-sm">Нет ресторанов, доступных для настройки PUDU</p>
      </div>

      <!-- WITH DATA -->
      <ng-container *ngIf="!isLoading && !hasError && restaurants.length > 0">

        <!-- v1.8 K1: Карточка подключения к NE — 3 состояния -->

        <!-- CONNECTED -->
        <div *ngIf="neConnectionStatus === 'connected'"
             class="flex items-center justify-between px-4 py-3 mb-6 border border-green-200 bg-green-50 rounded-lg animate-fade-in">
          <div class="flex items-center gap-3">
            <div class="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            <div>
              <p class="text-sm font-medium text-green-800">Подключено к Next Era</p>
              <p class="text-xs text-green-600">Учётные данные настроены. JWT-токен активен</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <ui-button variant="ghost" size="sm" (click)="showCredentialsModal = true">
              <span class="text-green-700 hover:text-green-800">Изменить</span>
            </ui-button>
            <ui-button variant="ghost" size="sm" (click)="disconnectNeConnection()">
              <span class="text-red-600 hover:text-red-700">Отключить</span>
            </ui-button>
            <span class="text-[10px] uppercase tracking-wide text-red-600">Только в прототипе</span>
          </div>
        </div>

        <!-- NOT CONFIGURED (K7: Alert-баннер) -->
        <div *ngIf="neConnectionStatus === 'not_configured'" class="mb-6 animate-fade-in">
          <ui-alert variant="warning" [dismissible]="false">
            <div class="flex items-center justify-between w-full">
              <div>
                <p class="text-sm font-medium">Подключение к Next Era не настроено</p>
                <p class="text-xs text-gray-600 mt-1">
                  Для работы с роботами PUDU необходимо ввести учётные данные NE API.
                  Данные предоставляются компанией Next Era при подключении ресторана.
                </p>
              </div>
              <ui-button size="sm" (click)="showCredentialsModal = true" class="ml-4 shrink-0">
                Настроить подключение
              </ui-button>
            </div>
          </ui-alert>
        </div>

        <!-- ERROR -->
        <div *ngIf="neConnectionStatus === 'error'" class="mb-6 animate-fade-in">
          <ui-alert variant="error" [dismissible]="false">
            <div class="flex items-center justify-between w-full">
              <div>
                <p class="text-sm font-medium">Ошибка подключения к Next Era</p>
                <p class="text-xs mt-1">
                  Не удалось авторизоваться в NE API. Проверьте учётные данные.
                </p>
              </div>
              <ui-button variant="danger" size="sm" (click)="showCredentialsModal = true" class="ml-4 shrink-0">
                Обновить данные
              </ui-button>
            </div>
          </ui-alert>
        </div>

        <!-- SEARCH -->
        <div class="mb-4 relative" style="width: 320px;">
          <lucide-icon
            name="search"
            [size]="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
          ></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            class="w-80 h-9 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Поиск по названию ресторана..."
            aria-label="Поиск ресторана"
          />
        </div>

        <!-- EMPTY SEARCH -->
        <div *ngIf="filteredRestaurants.length === 0" class="flex items-center justify-center h-48" role="status">
          <p class="text-gray-400 text-sm">Ничего не найдено</p>
        </div>

        <!-- TABLE -->
        <div *ngIf="filteredRestaurants.length > 0" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Название ресторана (торгового предприятия)">
                    Название ресторана
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Общее количество зарегистрированных роботов PUDU в этом ресторане (не считая удалённых)">
                    Всего роботов
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Количество роботов, которые сейчас подключены к облаку PUDU и доступны для выполнения задач">
                    Активных роботов
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Агрегированный статус готовности интеграции PUDU: настроены ли роботы, маппинг столов и сценарии">
                    Статус настройки
                  </th>
                  <th class="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                <!-- v1.8 K8: Блокировка строк при отсутствии подключения -->
                <tr
                  *ngFor="let r of filteredRestaurants; let last = last"
                  class="transition-colors"
                  [ngClass]="neConnectionStatus === 'connected'
                    ? 'cursor-pointer hover:bg-gray-100'
                    : 'opacity-50 cursor-not-allowed'"
                  [class.border-b]="!last"
                  [class.border-gray-200]="!last"
                  role="link"
                  [attr.aria-label]="'Перейти к настройкам ' + r.restaurant_name"
                  (click)="selectRestaurant(r)"
                >
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {{ r.restaurant_name }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700 text-center">{{ r.robots_total }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700 text-center">{{ r.robots_online }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1.5 text-sm cursor-help"
                      [attr.aria-label]="'Статус настройки: ' + getStatusLabel(r.setup_status)"
                      [title]="getStatusTooltip(r.setup_status)"
                    >
                      <lucide-icon
                        *ngIf="r.setup_status === 'configured'"
                        name="check-circle-2"
                        [size]="16"
                        class="text-green-600"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="r.setup_status === 'partial'"
                        name="alert-circle"
                        [size]="16"
                        class="text-orange-500"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="r.setup_status === 'not_configured'"
                        name="circle"
                        [size]="16"
                        class="text-gray-300"
                      ></lucide-icon>
                      <span [ngClass]="{
                        'text-green-600': r.setup_status === 'configured',
                        'text-orange-500': r.setup_status === 'partial',
                        'text-gray-300': r.setup_status === 'not_configured'
                      }">{{ getStatusLabel(r.setup_status) }}</span>
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <lucide-icon name="chevron-right" [size]="16" class="text-gray-400" aria-hidden="true"></lucide-icon>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- v1.8 K3: Mock-переключатели (для демонстрации) -->
        <div class="flex items-center gap-4 text-xs text-gray-400 px-1 pt-4 flex-wrap">
          <span class="font-medium text-gray-500">Mock-панель:</span>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" [(ngModel)]="mockNeAvailable" class="h-3.5 w-3.5 rounded border-gray-300" />
            <span>NE API доступен</span>
          </label>
          <button
            (click)="setNeConnectionStatus('not_configured')"
            class="px-2 py-0.5 rounded border text-[10px] hover:bg-gray-100"
          >
            Сбросить подключение
          </button>
          <button
            (click)="setNeConnectionStatus('error')"
            class="px-2 py-0.5 rounded border text-[10px] hover:bg-gray-100 text-red-500"
          >
            Симуляция ошибки
          </button>
        </div>
      </ng-container>
    </div>

    <!-- v1.8 K2: Модальное окно ввода учётных данных NE -->
    <ui-modal
      [open]="showCredentialsModal"
      title="Подключение к Next Era"
      size="sm"
      (modalClose)="closeCredentialsModal()"
    >
      <p class="text-sm text-gray-500 mb-4">
        Введите учётные данные, предоставленные компанией Next Era.
        Данные используются для авторизации в API сервиса роботов.
      </p>

      <div class="space-y-4">
        <ui-input
          label="Идентификатор клиента (Client ID)"
          [(value)]="credClientId"
          placeholder="iiko_restaurant_001"
          [disabled]="credSaving"
          hint="Выдаётся компанией Next Era при подключении ресторана"
        ></ui-input>

        <ui-input
          label="API-секрет"
          type="password"
          [(value)]="credApiSecret"
          placeholder="as_xxxxxxxxxxxx"
          [disabled]="credSaving"
          hint="Секретный ключ API. Хранится в зашифрованном виде"
        ></ui-input>
      </div>

      <div modalFooter class="flex items-center justify-end gap-2">
        <ui-button variant="ghost" (click)="closeCredentialsModal()" [disabled]="credSaving">
          Отмена
        </ui-button>
        <ui-button
          variant="primary"
          (click)="handleSaveCredentials()"
          [loading]="credSaving"
          [disabled]="credSaving || !credClientId.trim() || !credApiSecret.trim()"
        >
          {{ credSaving ? 'Проверка подключения...' : 'Подключить' }}
        </ui-button>
      </div>
    </ui-modal>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
  `],
})
export class RestaurantsScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);
  parent = inject(PuduPrototypeComponent);
  private readonly storageSlug = 'pudu-admin';
  private readonly connectionStorageKey = 'neConnectionStatus';

  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  isLoading = true;
  hasError = false;
  searchQuery = '';
  private searchTimeout: any = null;

  // v1.8 K3: Статус подключения к NE
  neConnectionStatus: NeConnectionStatus = 'not_configured';
  mockNeAvailable = true;

  // v1.8 K2: Модальное окно credentials
  showCredentialsModal = false;
  credClientId = '';
  credApiSecret = '';
  credSaving = false;

  ngOnInit(): void {
    // Clear restaurant context when navigating back to Э0
    this.parent.clearRestaurantContext();
    this.neConnectionStatus = this.storage.load<NeConnectionStatus>(
      this.storageSlug,
      this.connectionStorageKey,
      'not_configured'
    );
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    setTimeout(() => {
      this.restaurants = [...MOCK_RESTAURANTS];
      this.filteredRestaurants = [...this.restaurants];
      this.isLoading = false;
    }, 1000);
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.filterRestaurants();
    }, 300);
  }

  filterRestaurants(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredRestaurants = [...this.restaurants];
    } else {
      this.filteredRestaurants = this.restaurants.filter(r =>
        r.restaurant_name.toLowerCase().includes(q)
      );
    }
  }

  getStatusLabel(status: Restaurant['setup_status']): string {
    switch (status) {
      case 'configured': return 'Настроено';
      case 'partial': return 'Частично';
      case 'not_configured': return 'Не настроено';
    }
  }

  getStatusTooltip(status: Restaurant['setup_status']): string {
    switch (status) {
      case 'configured': return 'Все настройки интеграции PUDU завершены: роботы зарегистрированы, маппинг столов выполнен, сценарии активированы';
      case 'partial': return 'Настройка интеграции PUDU выполнена частично: часть настроек ещё не завершена (проверьте роботов, маппинг столов и сценарии)';
      case 'not_configured': return 'Интеграция PUDU не настроена: роботы не зарегистрированы, маппинг столов и сценарии не настроены';
    }
  }

  // v1.8 K8: Блокировка перехода без подключения
  selectRestaurant(restaurant: Restaurant): void {
    if (this.neConnectionStatus === 'connected') {
      this.parent.setRestaurantContext(restaurant);
      this.router.navigate(['/prototype/pudu-admin/robots']);
    } else {
      this.parent.showToast(
        'Сначала настройте подключение к NE',
        undefined,
        3000,
        'warning'
      );
    }
  }

  // v1.8 K2: Сохранение credentials
  handleSaveCredentials(): void {
    if (!this.credClientId.trim() || !this.credApiSecret.trim()) {
      this.parent.showToast('Заполните оба поля', undefined, 3000, 'destructive');
      return;
    }

    this.credSaving = true;

    // Mock: имитация POST /api/pudu/credentials
    setTimeout(() => {
      if (this.mockNeAvailable) {
        // Сценарий 1: NE доступен, credentials валидны (200)
        this.setNeConnectionStatus('connected');
        this.showCredentialsModal = false;
        this.credClientId = '';
        this.credApiSecret = '';
        // K4: Toast #14
        this.parent.showToast('Подключение к NE настроено');
      } else {
        // Сценарий 2: NE недоступен (502)
        // K6: Toast #16
        this.parent.showToast(
          'Сервис NE временно недоступен. Попробуйте позже',
          undefined,
          4000,
          'warning'
        );
      }
      this.credSaving = false;
    }, 1500);
  }

  disconnectNeConnection(): void {
    this.setNeConnectionStatus('not_configured');
    this.parent.showToast('Подключение к NE отключено (только для прототипа)');
  }

  setNeConnectionStatus(status: NeConnectionStatus): void {
    this.neConnectionStatus = status;
    this.storage.save(this.storageSlug, this.connectionStorageKey, status);
  }

  // Закрытие модалки
  closeCredentialsModal(): void {
    if (!this.credSaving) {
      this.showCredentialsModal = false;
      this.credClientId = '';
      this.credApiSecret = '';
    }
  }
}
