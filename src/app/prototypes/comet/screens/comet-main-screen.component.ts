import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import {
  UiButtonComponent,
  UiCardComponent,
  UiCardHeaderComponent,
  UiCardTitleComponent,
  UiCardContentComponent,
  UiInputComponent,
  UiSelectComponent,
  UiConfirmDialogComponent,
  UiAlertComponent,
  UiBadgeComponent,
  UiDividerComponent,
  SelectOption,
} from '@/components/ui';
import {
  Organization,
  Store,
  KeyDetails,
  YpTerminal,
  Account,
  OAuthState,
  Partner,
  MerchantInfo,
  MerchantStatus,
  UserTokenInfo,
  MccCode,
  MerchantRegistrationRequest,
  RegistrationData,
  ContactInfo,
} from '../types';
import {
  MOCK_ORGANIZATIONS,
  MOCK_ACCOUNTS,
  getMockTerminals,
  getMockDefaultAccountKey,
  MOCK_PARTNERS,
  MOCK_MERCHANTS,
  MOCK_MCC_CODES,
} from '../data/mock-data';

@Component({
  selector: 'app-comet-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiCardComponent,
    UiCardHeaderComponent,
    UiCardTitleComponent,
    UiCardContentComponent,
    UiInputComponent,
    UiSelectComponent,
    UiConfirmDialogComponent,
    UiAlertComponent,
    UiBadgeComponent,
    UiDividerComponent,
  ],
  template: `
    <!-- Header -->
    <header class="border-b border-border bg-white">
      <div class="flex h-14 items-center gap-4 px-4">
        <div class="flex items-center gap-2">
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none" class="text-[#E94B35]">
            <path d="M0 0H8V24H0V0Z" fill="currentColor" />
            <path d="M12 0H20V24H12V0Z" fill="currentColor" />
            <path d="M28 7L32 0H40L36 7H44V17H36L40 24H32L28 17V7Z" fill="currentColor" />
            <path
              d="M52 0C56.4183 0 60 3.58172 60 8V16C60 20.4183 56.4183 24 52 24C47.5817 24 44 20.4183 44 16V8C44 3.58172 47.5817 0 52 0Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button class="p-2 rounded hover:bg-gray-100 transition-colors">
            <lucide-icon name="search" [size]="20" class="text-gray-500"></lucide-icon>
          </button>
          <button class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm text-gray-700">
            <lucide-icon name="user" [size]="16"></lucide-icon>
            <span>user</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex" style="height: calc(100vh - 3.5rem)">
      <!-- Sidebar Navigation -->
      <aside class="w-52 border-r border-gray-200 bg-gray-50/70 shrink-0">
        <nav class="p-2 space-y-0.5">
          <button
            (click)="activeSection = 'integrations'"
            class="w-full text-left rounded px-3 py-2 text-sm font-medium transition-colors"
            [ngClass]="activeSection === 'integrations' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'"
          >
            Интеграции
          </button>
          <button
            (click)="activeSection = 'onboarding'"
            class="w-full flex items-center gap-2 text-left rounded px-3 py-2 text-sm font-medium transition-colors"
            [ngClass]="activeSection === 'onboarding' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'"
          >
            <lucide-icon name="log-in" [size]="16"></lucide-icon>
            Онбординг
          </button>
        </nav>
      </aside>

      <!-- Main Content: Интеграции -->
      <div *ngIf="activeSection === 'integrations'" class="flex-1 flex flex-col min-w-0">
        <!-- Page Header -->
        <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
          <div class="flex items-center justify-between gap-4">
            <h1 class="text-2xl font-semibold text-gray-900">Яндекс.Пэй</h1>
            <div class="relative w-80">
              <lucide-icon
                name="search"
                [size]="16"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
              ></lucide-icon>
              <input
                type="text"
                placeholder="Поиск по ресторанам..."
                [ngModel]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                class="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
                       transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Split Panel: Tree + Detail -->
        <div class="flex flex-1 min-h-0">
          <!-- Organization Tree -->
          <div class="w-96 border-r border-gray-200 overflow-y-auto shrink-0">
            <div class="p-4">
              <h2 class="mb-4 text-sm font-semibold text-gray-500">Структура торговых предприятий</h2>

              <div *ngIf="filteredOrganizations.length === 0" class="py-8 text-center text-sm text-gray-400">
                Ничего не найдено
              </div>

              <div class="space-y-1">
                <div *ngFor="let org of filteredOrganizations">
                  <!-- Organization Row -->
                  <button
                    (click)="toggleOrganization(org.organizationId)"
                    class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <lucide-icon
                      [name]="isExpanded(org.organizationId) ? 'chevron-down' : 'chevron-right'"
                      [size]="16"
                      class="shrink-0 text-gray-400"
                    ></lucide-icon>
                    <span class="flex-1 text-left font-medium">{{ org.organizationName }}</span>
                  </button>

                  <!-- Stores -->
                  <div *ngIf="isExpanded(org.organizationId)" class="ml-4 space-y-0.5 border-l border-gray-200 pl-2">
                    <button
                      *ngFor="let store of org.stores"
                      (click)="selectStore(store)"
                      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors"
                      [class.bg-gray-200]="selectedStore?.storeId === store.storeId"
                      [class.hover:bg-gray-100]="selectedStore?.storeId !== store.storeId"
                    >
                      <span class="flex-1 text-left text-gray-700">{{ store.storeName }}</span>
                      <!-- Status Icon -->
                      <lucide-icon
                        *ngIf="store.terminalsConfigured === 'full' && store.hasYandexPayKey"
                        name="check-circle-2"
                        [size]="16"
                        class="shrink-0 text-green-600"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="store.terminalsConfigured === 'partial' && store.hasYandexPayKey"
                        name="alert-circle"
                        [size]="16"
                        class="shrink-0 text-orange-500"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="!store.hasYandexPayKey || store.terminalsConfigured === 'none'"
                        name="circle"
                        [size]="16"
                        class="shrink-0 text-gray-300"
                      ></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail Panel -->
          <div class="flex-1 overflow-y-auto bg-white">
            <!-- No store selected -->
            <div
              *ngIf="!selectedStore && !isLoadingStore"
              class="flex h-full items-center justify-center text-gray-400 text-sm"
            >
              Выберите ресторан в дереве слева, чтобы настроить ключ Яндекс.Пэй.
            </div>

            <!-- Loading -->
            <div *ngIf="isLoadingStore" class="flex h-full items-center justify-center">
              <lucide-icon name="loader-2" [size]="32" class="animate-spin text-gray-400"></lucide-icon>
            </div>

            <!-- Store Detail -->
            <div *ngIf="selectedStore && !isLoadingStore" class="p-6 animate-fade-in">
              <div class="max-w-2xl space-y-6">
                <!-- Title -->
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">Настройки Яндекс.Пэй</h2>
                  <p class="text-sm text-gray-500 mt-1">Ресторан: {{ selectedStore.storeName }}</p>
                </div>

                <!-- API Key Section -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Ключ Яндекс.Пэй</label>
                  <input
                    type="text"
                    [(ngModel)]="keyValue"
                    placeholder="Введите ключ Яндекс.Пэй (например: yk_test_...)"
                    class="w-full h-9 px-3 text-sm font-mono border border-gray-300 rounded-md bg-white
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
                           transition-all"
                  />
                  <p *ngIf="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
                  <p *ngIf="keyDetails" class="text-xs text-gray-400">
                    {{ keyDetails.lastUpdatedUtc
                      ? 'Обновлён: ' + formatDate(keyDetails.lastUpdatedUtc) + ', ' + keyDetails.updatedByUserName
                      : 'Ключ ещё не настроен'
                    }}
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <button
                    (click)="handleSave()"
                    [disabled]="isSaveDisabled"
                    class="h-9 px-4 text-sm font-medium rounded-md transition-colors
                           bg-gray-900 text-white hover:bg-gray-800
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Сохранить
                  </button>
                  <button
                    (click)="showDeleteDialog = true"
                    [disabled]="!keyDetails?.yandexPayKey"
                    class="h-9 px-4 text-sm font-medium rounded-md transition-colors
                           border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Очистить ключ
                  </button>
                </div>

                <!-- Toast / Success Message -->
                <div
                  *ngIf="toastMessage"
                  class="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-slide-up"
                >
                  <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
                  <p *ngIf="toastDescription" class="text-sm text-gray-500 mt-0.5">{{ toastDescription }}</p>
                </div>

                <!-- Terminals & QR Tables Section (only when key exists) -->
                <ng-container *ngIf="selectedStore.hasYandexPayKey">
                  <div class="border-t border-gray-200 my-6"></div>

                  <!-- No terminals yet -->
                  <div *ngIf="terminals.length === 0" class="space-y-6">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">QR-таблички и терминалы</h3>
                      <button
                        (click)="handleRefreshAccounts()"
                        [disabled]="isLoadingAccounts"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors
                               disabled:opacity-50"
                      >
                        <lucide-icon
                          name="refresh-cw"
                          [size]="16"
                          [class.animate-spin]="isLoadingAccounts"
                        ></lucide-icon>
                        Обновить таблички
                      </button>
                    </div>

                    <!-- Default Account selector (no terminals) -->
                    <div *ngIf="accounts.length > 0" class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Табличка по умолчанию для ресторана</label>
                      <select
                        [ngModel]="defaultAccountKey || 'none'"
                        (ngModelChange)="onDefaultAccountChange($event)"
                        class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                               focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                      >
                        <option value="none" class="italic text-gray-400">Не назначена</option>
                        <option *ngFor="let acc of accounts" [value]="acc.key">{{ acc.name }}</option>
                      </select>
                      <p class="text-xs text-gray-400">
                        При регистрации новых терминалов им автоматически будет назначена эта табличка
                      </p>
                    </div>

                    <!-- Warning Card -->
                    <div class="rounded-xl border border-orange-200 bg-orange-50/50 p-6">
                      <div class="flex gap-3">
                        <lucide-icon name="alert-triangle" [size]="20" class="text-orange-500 shrink-0 mt-0.5"></lucide-icon>
                        <div class="space-y-3 flex-1">
                          <div>
                            <h4 class="font-semibold text-base text-gray-900 mb-1">Терминалы ещё не зарегистрированы</h4>
                            <p class="text-sm text-gray-500">
                              Они появятся автоматически после установки и запуска плагина на кассах.
                            </p>
                          </div>
                          <div *ngIf="accounts.length > 0" class="space-y-2">
                            <p class="text-sm font-medium text-gray-700">Доступные QR-таблички:</p>
                            <ul class="space-y-1 text-sm text-gray-500 ml-4">
                              <li *ngFor="let acc of accounts" class="list-disc">{{ acc.name }}</li>
                            </ul>
                          </div>
                          <p *ngIf="accounts.length === 0" class="text-sm text-gray-500">
                            Список QR-табличек пуст.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Terminals exist -->
                  <div *ngIf="terminals.length > 0" class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">QR-таблички и терминалы</h3>
                      <button
                        (click)="handleRefreshAccounts()"
                        [disabled]="isLoadingAccounts"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors
                               disabled:opacity-50"
                      >
                        <lucide-icon
                          name="refresh-cw"
                          [size]="16"
                          [class.animate-spin]="isLoadingAccounts"
                        ></lucide-icon>
                        Обновить таблички
                      </button>
                    </div>

                    <!-- Default Account selector (with terminals) -->
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Табличка по умолчанию для ресторана</label>
                      <select
                        [ngModel]="defaultAccountKey || 'none'"
                        (ngModelChange)="onDefaultAccountChange($event)"
                        class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                               focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                      >
                        <option value="none" class="italic text-gray-400">Не назначена</option>
                        <option *ngFor="let acc of accounts" [value]="acc.key">{{ acc.name }}</option>
                      </select>
                      <p class="text-xs text-gray-400">
                        При регистрации новых терминалов им автоматически будет назначена эта табличка
                      </p>
                    </div>

                    <div class="border-t border-gray-200 my-4"></div>

                    <h4 class="text-base font-medium text-gray-900">Назначение на терминалы</h4>

                    <!-- Terminal Cards -->
                    <div class="space-y-3">
                      <div
                        *ngFor="let terminal of terminals"
                        class="rounded-xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div class="px-6 py-4">
                          <h5 class="text-base font-medium text-gray-900 mb-3">{{ terminal.terminalName }}</h5>
                          <select
                            [ngModel]="terminal.accountKey || 'none'"
                            (ngModelChange)="handleAccountAssignment(terminal.terminalId, $event)"
                            class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                                   focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                          >
                            <option value="none" class="italic text-gray-400">Не назначена</option>
                            <option *ngFor="let acc of accounts" [value]="acc.key">
                              {{ acc.name }}{{ getAccountUsageLabel(acc.key, terminal.terminalId) }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <p class="text-sm text-gray-500">
                      Назначено табличек: {{ assignedTerminalsCount }} из {{ terminals.length }}
                    </p>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OAuth-онбординг секция -->
      <div *ngIf="activeSection === 'onboarding'" class="flex-1 p-6 overflow-y-auto">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Онбординг Яндекс.Пэй</h2>

        <!-- Блок авторизации (не авторизован) -->
        <div *ngIf="!oauthState.isAuthorized" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <lucide-icon name="log-in" [size]="48" class="text-gray-300 mx-auto mb-4"></lucide-icon>
          <p class="text-gray-500 mb-6">Для управления организациями и заявками необходимо авторизоваться через Яндекс ID</p>
          <button (click)="startOAuth()"
                  class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <lucide-icon name="log-in" [size]="18"></lucide-icon>
            Войти с Яндекс ID
          </button>
        </div>

        <!-- Основная панель (авторизован) -->
        <div *ngIf="oauthState.isAuthorized">
          <!-- Шапка авторизации -->
          <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
            <div class="flex items-center gap-2">
              <lucide-icon name="check-circle-2" [size]="16" class="text-green-600"></lucide-icon>
              <span class="text-green-700 text-sm font-medium">Авторизовано: {{ oauthState.userName }}</span>
            </div>
            <button (click)="logoutOAuth()" class="text-sm text-red-600 hover:text-red-800">Выйти</button>
          </div>

          <!-- Вкладки -->
          <div class="flex gap-1 mb-6 border-b border-gray-200">
            <button (click)="oauthSection = 'partners'"
                    [class]="oauthSection === 'partners' ? 'px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700'">
              <span class="flex items-center gap-1.5"><lucide-icon name="building-2" [size]="14"></lucide-icon> Организации</span>
            </button>
            <button (click)="oauthSection = 'merchants'"
                    [class]="oauthSection === 'merchants' ? 'px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700'">
              <span class="flex items-center gap-1.5"><lucide-icon name="file-check" [size]="14"></lucide-icon> Заявки</span>
            </button>
            <button (click)="oauthSection = 'tokens'"
                    [class]="oauthSection === 'tokens' ? 'px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700'">
              <span class="flex items-center gap-1.5"><lucide-icon name="key" [size]="14"></lucide-icon> Токены</span>
            </button>
          </div>

          <!-- Вкладка: Организации -->
          <div *ngIf="oauthSection === 'partners'">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Организации-партнеры</h3>
              <button (click)="showPartnerForm = !showPartnerForm"
                      class="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                <lucide-icon name="plus" [size]="16"></lucide-icon>
                Добавить организацию
              </button>
            </div>

            <!-- Форма создания партнера -->
            <div *ngIf="showPartnerForm" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 animate-fade-in">
              <h4 class="font-medium text-gray-900 mb-3">Новая организация</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Название *</label>
                  <input [(ngModel)]="newPartnerName" type="text" placeholder="ООО Ромашка"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">ИНН</label>
                  <input [(ngModel)]="newPartnerInn" type="text" placeholder="7707083893"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">ОГРН</label>
                  <input [(ngModel)]="newPartnerOgrn" type="text" placeholder="1027700132195"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">КПП</label>
                  <input [(ngModel)]="newPartnerKpp" type="text" placeholder="770701001"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div class="col-span-2">
                  <label class="block text-sm text-gray-600 mb-1">Полное наименование</label>
                  <input [(ngModel)]="newPartnerFullName" type="text" placeholder="Общество с ограниченной ответственностью Ромашка"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div class="col-span-2">
                  <label class="block text-sm text-gray-600 mb-1">Юридический адрес</label>
                  <input [(ngModel)]="newPartnerLegalAddress" type="text" placeholder="119021, г. Москва, ул. Льва Толстого, д. 16"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">ФИО генерального директора</label>
                  <input [(ngModel)]="newPartnerCeo" type="text" placeholder="Иванов Иван Иванович"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Сайт</label>
                  <input [(ngModel)]="newPartnerUrl" type="text" placeholder="http://romashka.ru"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Email</label>
                  <input [(ngModel)]="newPartnerEmail" type="email" placeholder="merchant@romashka.ru"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Телефон</label>
                  <input [(ngModel)]="newPartnerPhone" type="tel" placeholder="+79001234567"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button (click)="createPartner()" class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">Создать</button>
                <button (click)="showPartnerForm = false" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Отмена</button>
              </div>
            </div>

            <!-- Список партнеров -->
            <div *ngIf="partners.length === 0" class="text-center text-gray-400 py-12">
              Нет организаций. Нажмите «Добавить организацию» для начала.
            </div>
            <div *ngFor="let p of partners" (click)="selectPartner(p)"
                 class="flex items-center justify-between bg-white border rounded-lg px-4 py-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                 [class.border-gray-900]="selectedPartner?.partner_id === p.partner_id"
                 [class.border-gray-200]="selectedPartner?.partner_id !== p.partner_id">
              <div>
                <div class="font-medium text-gray-900">{{ p.name }}</div>
                <div class="text-sm text-gray-500">ИНН: {{ p.registration_data.tax_ref_number }}</div>
              </div>
              <span class="text-xs text-gray-400">{{ p.partner_id | slice:0:8 }}...</span>
            </div>
          </div>

          <!-- Вкладка: Заявки (мерчанты) -->
          <div *ngIf="oauthSection === 'merchants'">
            <div *ngIf="!selectedPartner" class="text-center text-gray-400 py-12">
              Выберите организацию на вкладке «Организации»
            </div>
            <div *ngIf="selectedPartner">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Заявки: {{ selectedPartner.name }}</h3>
                <button (click)="showMerchantForm = !showMerchantForm"
                        class="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                  <lucide-icon name="plus" [size]="16"></lucide-icon>
                  Подать заявку
                </button>
              </div>

              <!-- Форма заявки -->
              <div *ngIf="showMerchantForm" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 animate-fade-in">
                <h4 class="font-medium text-gray-900 mb-3">Регистрация торговой точки</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Название точки *</label>
                    <input [(ngModel)]="newMerchantName" type="text" placeholder="Ресторан на Тверской"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">MCC-код</label>
                    <select [(ngModel)]="newMerchantMcc"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                      <option value="">Выберите категорию</option>
                      <option *ngFor="let mcc of mccCodes" [value]="mcc.mcc">{{ mcc.mcc }} - {{ mcc.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Сайт</label>
                    <input [(ngModel)]="newMerchantUrl" type="text" placeholder="http://restaurant.ru"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Кол-во точек продаж</label>
                    <input [(ngModel)]="newMerchantPosesCount" type="number" placeholder="1" min="1"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Расчётный счёт</label>
                    <input [(ngModel)]="newMerchantSettlementAccount" type="text" placeholder="40702810000000000001"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">БИК</label>
                    <input [(ngModel)]="newMerchantBik" type="text" placeholder="044525225"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </div>
                  <div class="col-span-2">
                    <label class="block text-sm text-gray-600 mb-1">Корреспондентский счёт</label>
                    <input [(ngModel)]="newMerchantCorrAccount" type="text" placeholder="30101810400000000225"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </div>
                </div>
                <div class="flex gap-2 mt-4">
                  <button (click)="submitMerchantApplication()" class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">Подать заявку</button>
                  <button (click)="showMerchantForm = false" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Отмена</button>
                </div>
              </div>

              <!-- Таблица заявок -->
              <div *ngIf="merchants.length === 0" class="text-center text-gray-400 py-12">
                Нет заявок. Нажмите «Подать заявку» для регистрации торговой точки.
              </div>
              <table *ngIf="merchants.length > 0" class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-left">
                    <th class="px-4 py-2 font-medium text-gray-600">Название</th>
                    <th class="px-4 py-2 font-medium text-gray-600">Статус</th>
                    <th class="px-4 py-2 font-medium text-gray-600">Дата подачи</th>
                    <th class="px-4 py-2 font-medium text-gray-600">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of merchants" class="border-b border-gray-100">
                    <td class="px-4 py-3 text-gray-900">{{ m.name }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="getStatusColor(m.registration_status)">
                        {{ getStatusLabel(m.registration_status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-500">{{ m.created | date:'dd.MM.yyyy' }}</td>
                    <td class="px-4 py-3">
                      <button *ngIf="m.registration_status === 'active'" (click)="generateMerchantToken(m.merchant_id)"
                              class="text-sm text-gray-900 hover:underline">Создать токен</button>
                      <span *ngIf="m.registration_status !== 'active'" class="text-gray-400 text-xs">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Вкладка: Токены -->
          <div *ngIf="oauthSection === 'tokens'">
            <h3 class="text-lg font-medium text-gray-900 mb-4">User Token</h3>
            <div *ngIf="merchants.length === 0" class="text-center text-gray-400 py-12">
              Нет активных мерчантов
            </div>
            <div *ngFor="let m of merchants">
              <div *ngIf="m.registration_status === 'active'" class="mb-4">
                <h4 class="font-medium text-gray-700 mb-2">{{ m.name }}</h4>
                <div *ngIf="getMerchantTokens(m.merchant_id).length === 0" class="text-sm text-gray-400 mb-2 ml-2">
                  Нет токенов. Перейдите на вкладку «Заявки» → «Создать токен».
                </div>
                <div *ngFor="let t of getMerchantTokens(m.merchant_id)" class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 mb-1">
                  <div>
                    <span class="font-mono text-sm text-gray-900">****{{ t.last_four }}</span>
                    <span class="text-xs text-gray-400 ml-2">{{ t.token_format }}</span>
                    <span *ngIf="t.token_value" class="ml-3 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded font-mono">{{ t.token_value }}</span>
                  </div>
                  <span class="text-xs text-gray-400">{{ t.created_at | date:'dd.MM.yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteDialog"
      title="Очистить ключ Яндекс.Пэй?"
      [message]="'Очистить ключ Яндекс.Пэй для ресторана «' + (selectedStore?.storeName || '') + '»? Все привязки терминалов и табличка по умолчанию будут удалены.'"
      confirmText="Очистить"
      cancelText="Отмена"
      (confirmed)="handleClearKey()"
      (cancelled)="showDeleteDialog = false"
    ></ui-confirm-dialog>
  `,
})
export class CometMainScreenComponent implements OnInit {
  private storage = inject(StorageService);

  organizations: Organization[] = [];
  expandedOrgs = new Set<string>();
  selectedStore: Store | null = null;
  keyDetails: KeyDetails | null = null;
  keyValue = '';
  originalKeyValue = '';
  errorMessage = '';
  searchQuery = '';
  terminals: YpTerminal[] = [];
  accounts: Account[] = [];
  isLoadingAccounts = false;
  isLoadingStore = false;
  defaultAccountKey: string | null = null;
  originalDefaultAccountKey: string | null = null;
  showDeleteDialog = false;

  toastMessage = '';
  toastDescription = '';
  private toastTimeout: any = null;

  private searchTimeout: any = null;
  private debouncedSearchQuery = '';

  // --- OAuth-онбординг ---
  activeSection: 'integrations' | 'onboarding' = 'integrations';
  oauthState: OAuthState = { isAuthorized: false, accessToken: null, expiresAt: null, userName: null };
  partners: Partner[] = [];
  selectedPartner: Partner | null = null;
  merchants: MerchantInfo[] = [];
  merchantStatuses: Map<string, MerchantStatus> = new Map();
  userTokens: Map<string, UserTokenInfo[]> = new Map();
  mccCodes: MccCode[] = [];
  showPartnerForm = false;
  showMerchantForm = false;
  oauthSection: 'partners' | 'merchants' | 'tokens' = 'partners';

  // Поля формы партнера
  newPartnerName = '';
  newPartnerInn = '';
  newPartnerOgrn = '';
  newPartnerKpp = '';
  newPartnerFullName = '';
  newPartnerLegalAddress = '';
  newPartnerCeo = '';
  newPartnerUrl = '';
  newPartnerEmail = '';
  newPartnerPhone = '';

  // Поля формы мерчанта
  newMerchantName = '';
  newMerchantMcc = '';
  newMerchantUrl = '';
  newMerchantPosesCount = 1;
  newMerchantSettlementAccount = '';
  newMerchantBik = '';
  newMerchantCorrAccount = '';

  ngOnInit(): void {
    this.organizations = this.storage.load('comet', 'organizations', MOCK_ORGANIZATIONS);

    // Восстановить OAuth-состояние
    const savedOAuth = this.storage.load<OAuthState | null>('comet', 'oauth_state', null);
    if (savedOAuth?.isAuthorized) {
      this.oauthState = savedOAuth;
      this.loadPartners();
      this.loadMccCodes();
    }
  }

  // --- Search ---

  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.debouncedSearchQuery = value;
      if (value.trim()) {
        this.filteredOrganizations.forEach(org => this.expandedOrgs.add(org.organizationId));
      }
    }, 300);
  }

  get filteredOrganizations(): Organization[] {
    const query = (this.debouncedSearchQuery || this.searchQuery).toLowerCase().trim();
    if (!query) return this.organizations;

    return this.organizations
      .map(org => {
        const matchingStores = org.stores.filter(s => s.storeName.toLowerCase().includes(query));
        return matchingStores.length > 0 ? { ...org, stores: matchingStores } : null;
      })
      .filter((org): org is Organization => org !== null);
  }

  // --- Tree ---

  toggleOrganization(orgId: string): void {
    if (this.expandedOrgs.has(orgId)) {
      this.expandedOrgs.delete(orgId);
    } else {
      this.expandedOrgs.add(orgId);
    }
  }

  isExpanded(orgId: string): boolean {
    return this.expandedOrgs.has(orgId);
  }

  // --- Store Selection ---

  async selectStore(store: Store): Promise<void> {
    this.isLoadingStore = true;
    this.selectedStore = store;
    this.errorMessage = '';

    await this.delay(300);

    const mockKeyDetails: KeyDetails = store.hasYandexPayKey
      ? {
          yandexPayKey: 'yk_test_1234567890abcdef',
          lastUpdatedUtc: '2025-11-18T10:32:00Z',
          updatedByUserName: 'Администратор Иванов',
        }
      : {
          yandexPayKey: null,
          lastUpdatedUtc: null,
          updatedByUserName: null,
        };

    this.keyDetails = mockKeyDetails;
    this.keyValue = mockKeyDetails.yandexPayKey || '';
    this.originalKeyValue = mockKeyDetails.yandexPayKey || '';

    if (store.hasYandexPayKey) {
      this.loadTerminalsAndAccounts(store.storeId);
    } else {
      this.terminals = [];
      this.accounts = [];
      this.defaultAccountKey = null;
      this.originalDefaultAccountKey = null;
    }

    this.isLoadingStore = false;
  }

  private loadTerminalsAndAccounts(storeId: string): void {
    this.terminals = getMockTerminals(storeId);
    this.accounts = [...MOCK_ACCOUNTS];
    this.defaultAccountKey = getMockDefaultAccountKey(storeId);
    this.originalDefaultAccountKey = this.defaultAccountKey;
  }

  // --- Key Management ---

  get isSaveDisabled(): boolean {
    return (
      (this.keyValue === this.originalKeyValue && this.defaultAccountKey === this.originalDefaultAccountKey) ||
      this.keyValue.trim() === ''
    );
  }

  async handleSave(): Promise<void> {
    if (!this.selectedStore) return;
    this.errorMessage = '';

    const keyChanged = this.keyValue !== this.originalKeyValue;

    if (keyChanged && this.originalKeyValue) {
      this.terminals = this.terminals.map(t => ({ ...t, accountKey: null, accountName: null }));
      this.defaultAccountKey = null;
      this.originalDefaultAccountKey = null;
      this.showToast('Ключ изменён', 'Все привязки терминалов сброшены. Список табличек обновлён.');
    }

    const now = new Date().toISOString();
    this.keyDetails = {
      yandexPayKey: this.keyValue,
      lastUpdatedUtc: now,
      updatedByUserName: 'Администратор Петров',
    };
    this.originalKeyValue = this.keyValue;
    this.originalDefaultAccountKey = this.defaultAccountKey;

    this.loadTerminalsAndAccounts(this.selectedStore.storeId);

    this.updateStoreInOrgs(this.selectedStore.storeId, { hasYandexPayKey: true, terminalsConfigured: 'partial' });
    this.selectedStore = { ...this.selectedStore, hasYandexPayKey: true, terminalsConfigured: 'partial' };

    if (!keyChanged) {
      this.showToast('Изменения сохранены');
    }

    this.persistOrganizations();
  }

  async handleClearKey(): Promise<void> {
    if (!this.selectedStore) return;
    this.errorMessage = '';

    this.keyValue = '';
    this.originalKeyValue = '';
    this.keyDetails = { yandexPayKey: null, lastUpdatedUtc: null, updatedByUserName: null };
    this.terminals = [];
    this.accounts = [];
    this.defaultAccountKey = null;
    this.originalDefaultAccountKey = null;

    this.updateStoreInOrgs(this.selectedStore.storeId, { hasYandexPayKey: false, terminalsConfigured: 'none' });
    this.selectedStore = { ...this.selectedStore, hasYandexPayKey: false, terminalsConfigured: 'none' };

    this.showToast('Ключ Яндекс.Пэй очищен', 'Все привязки терминалов удалены');
    this.showDeleteDialog = false;
    this.persistOrganizations();
  }

  // --- Terminal Assignment ---

  handleAccountAssignment(terminalId: string, value: string): void {
    if (!this.selectedStore) return;
    const accountKey = value === 'none' ? null : value;

    const terminal = this.terminals.find(t => t.terminalId === terminalId);
    if (!terminal) return;

    let toastMsg: string;
    if (accountKey === null) {
      toastMsg = `Привязка снята с ${terminal.terminalName}`;
    } else {
      const account = this.accounts.find(a => a.key === accountKey);
      toastMsg = `${account?.name || 'Табличка'} назначена на ${terminal.terminalName}`;
    }

    this.terminals = this.terminals.map(t => {
      if (t.terminalId === terminalId) {
        const account = this.accounts.find(a => a.key === accountKey);
        return { ...t, accountKey, accountName: account?.name || null };
      }
      return t;
    });

    const newStatus = this.calculateTerminalsConfigured(this.terminals, this.selectedStore.hasYandexPayKey);
    this.updateStoreInOrgs(this.selectedStore.storeId, { terminalsConfigured: newStatus });
    this.selectedStore = { ...this.selectedStore, terminalsConfigured: newStatus };

    this.showToast(toastMsg);
    this.persistOrganizations();
  }

  onDefaultAccountChange(value: string): void {
    this.defaultAccountKey = value === 'none' ? null : value;
  }

  get assignedTerminalsCount(): number {
    return this.terminals.filter(t => t.accountKey !== null).length;
  }

  getAccountUsageLabel(accountKey: string, excludeTerminalId: string): string {
    const count = this.terminals.filter(t => t.accountKey === accountKey && t.terminalId !== excludeTerminalId).length;
    if (count === 0) return '';
    return ` (на ${count} ${count === 1 ? 'терминале' : 'терминалах'})`;
  }

  // --- Refresh ---

  async handleRefreshAccounts(): Promise<void> {
    this.isLoadingAccounts = true;
    await this.delay(1000);
    this.isLoadingAccounts = false;
    this.showToast('Список табличек обновлён');
  }

  // --- Helpers ---

  formatDate(utcString: string | null): string {
    if (!utcString) return '';
    const date = new Date(utcString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private calculateTerminalsConfigured(
    terminals: YpTerminal[],
    hasKey: boolean,
  ): 'none' | 'partial' | 'full' {
    if (terminals.length === 0) return hasKey ? 'partial' : 'none';
    const assignedCount = terminals.filter(t => t.accountKey !== null).length;
    if (assignedCount === 0) return hasKey ? 'partial' : 'none';
    if (assignedCount === terminals.length) return 'full';
    return 'partial';
  }

  private updateStoreInOrgs(storeId: string, patch: Partial<Store>): void {
    this.organizations = this.organizations.map(org => ({
      ...org,
      stores: org.stores.map(s => (s.storeId === storeId ? { ...s, ...patch } : s)),
    }));
  }

  private persistOrganizations(): void {
    this.storage.save('comet', 'organizations', this.organizations);
  }

  private showToast(message: string, description?: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.toastDescription = description || '';
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
      this.toastDescription = '';
    }, 3000);
  }

  // --- OAuth ---

  startOAuth(): void {
    this.oauthState = {
      isAuthorized: true,
      accessToken: 'mock_oauth_token_abc123',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      userName: 'Иванов Иван',
    };
    this.storage.save('comet', 'oauth_state', this.oauthState);
    this.loadPartners();
    this.loadMccCodes();
    this.showToast('Авторизация успешна', 'Вы вошли через Яндекс ID');
  }

  logoutOAuth(): void {
    this.oauthState = { isAuthorized: false, accessToken: null, expiresAt: null, userName: null };
    this.storage.save('comet', 'oauth_state', this.oauthState);
    this.partners = [];
    this.merchants = [];
    this.selectedPartner = null;
    this.userTokens = new Map();
  }

  loadPartners(): void {
    this.partners = this.storage.load<Partner[]>('comet', 'partners', MOCK_PARTNERS);
  }

  loadMccCodes(): void {
    this.mccCodes = MOCK_MCC_CODES;
  }

  selectPartner(partner: Partner): void {
    this.selectedPartner = partner;
    this.loadMerchants(partner.partner_id);
  }

  loadMerchants(partnerId: string): void {
    const all = this.storage.load<MerchantInfo[]>('comet', 'merchants', MOCK_MERCHANTS);
    this.merchants = all.filter(m => m.partner_id === partnerId);
  }

  createPartner(): void {
    if (!this.newPartnerName.trim()) return;
    const partner: Partner = {
      partner_id: this.generateId(),
      name: this.newPartnerName,
      registration_data: {
        tax_ref_number: this.newPartnerInn,
        ogrn: this.newPartnerOgrn,
        kpp: this.newPartnerKpp,
        legal_address: this.newPartnerLegalAddress,
        postal_address: this.newPartnerLegalAddress,
        postal_code: '',
        full_company_name: this.newPartnerFullName || this.newPartnerName,
        ceo_name: this.newPartnerCeo,
        url: this.newPartnerUrl,
      },
      contact: {
        email: this.newPartnerEmail,
        phone: this.newPartnerPhone,
        first_name: '',
        last_name: '',
        middle_name: '',
      },
    };
    this.partners.push(partner);
    this.storage.save('comet', 'partners', this.partners);
    this.showPartnerForm = false;
    this.resetPartnerForm();
    this.showToast('Организация создана', partner.name);
  }

  submitMerchantApplication(): void {
    if (!this.selectedPartner || !this.newMerchantName.trim()) return;
    const merchant: MerchantInfo = {
      merchant_id: this.generateId(),
      partner_id: this.selectedPartner.partner_id,
      name: this.newMerchantName,
      is_offline: true,
      enabled: true,
      registration_status: 'processing',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const allMerchants = this.storage.load<MerchantInfo[]>('comet', 'merchants', MOCK_MERCHANTS);
    allMerchants.push(merchant);
    this.storage.save('comet', 'merchants', allMerchants);
    this.merchants = allMerchants.filter(m => m.partner_id === this.selectedPartner!.partner_id);
    this.showMerchantForm = false;
    this.resetMerchantForm();
    this.showToast('Заявка подана', merchant.name);
  }

  generateMerchantToken(merchantId: string): void {
    const lastFour = Math.random().toString(36).substring(2, 6);
    const token: UserTokenInfo = {
      id: this.generateId(),
      merchant_id: merchantId,
      partner_id: this.selectedPartner?.partner_id || '',
      last_four: lastFour,
      token_format: 'YANDEX_PAY',
      created_at: new Date().toISOString(),
      token_value: 'ut_' + Math.random().toString(36).substring(2, 18),
    };
    const existing = this.userTokens.get(merchantId) || [];
    existing.push(token);
    this.userTokens.set(merchantId, [...existing]);
    this.showToast('Токен создан', `****${lastFour}`);
  }

  getMerchantTokens(merchantId: string): UserTokenInfo[] {
    return this.userTokens.get(merchantId) || [];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      processing: 'На рассмотрении',
      active: 'Активен',
      failed: 'Отклонен',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      processing: 'text-yellow-600 bg-yellow-50',
      active: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  }

  private resetPartnerForm(): void {
    this.newPartnerName = '';
    this.newPartnerInn = '';
    this.newPartnerOgrn = '';
    this.newPartnerKpp = '';
    this.newPartnerFullName = '';
    this.newPartnerLegalAddress = '';
    this.newPartnerCeo = '';
    this.newPartnerUrl = '';
    this.newPartnerEmail = '';
    this.newPartnerPhone = '';
  }

  private resetMerchantForm(): void {
    this.newMerchantName = '';
    this.newMerchantMcc = '';
    this.newMerchantUrl = '';
    this.newMerchantPosesCount = 1;
    this.newMerchantSettlementAccount = '';
    this.newMerchantBik = '';
    this.newMerchantCorrAccount = '';
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
