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
  MOCK_STORE_MERCHANT_MAP,
  MOCK_ORG_PARTNER_MAP,
  MOCK_USER_TOKENS,
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
          <div
            class="w-full text-left rounded px-3 py-2 text-sm font-medium bg-gray-200 text-gray-800"
          >
            Яндекс.Пэй
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
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

                <!-- OAuth: Автоматическое подключение -->
                <div class="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-3">
                  <h3 class="text-sm font-semibold text-gray-900">Автоматическое подключение</h3>

                  <!-- Not authorized -->
                  <ng-container *ngIf="!oauthState.isAuthorized">
                    <p class="text-sm text-gray-500">
                      Авторизуйтесь через Яндекс ID для автоматического получения ключа Яндекс.Пэй
                    </p>
                    <button
                      (click)="startOAuth()"
                      class="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                      <lucide-icon name="log-in" [size]="16"></lucide-icon>
                      Войти с Яндекс ID
                    </button>
                  </ng-container>

                  <!-- Authorized -->
                  <ng-container *ngIf="oauthState.isAuthorized">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <lucide-icon name="check-circle-2" [size]="16" class="text-green-600"></lucide-icon>
                        <span class="text-sm text-green-700 font-medium">Авторизован: {{ oauthState.userEmail || oauthState.userName }}</span>
                      </div>
                      <button (click)="logoutOAuth()" class="text-xs text-red-600 hover:text-red-800 transition-colors">Выйти</button>
                    </div>
                    <p class="text-xs text-gray-400">
                      Если вы авторизованы не тем аккаунтом — нажмите «Выйти» и войдите снова.
                    </p>

                    <!-- Merchant status for current store -->
                    <ng-container *ngIf="currentMerchant">
                      <!-- Processing -->
                      <div *ngIf="currentMerchant.registration_status === 'processing'"
                           class="flex items-center justify-between gap-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2.5">
                        <div class="flex items-center gap-3">
                          <lucide-icon name="loader-2" [size]="16" class="text-yellow-600 animate-spin shrink-0"></lucide-icon>
                          <div>
                            <span class="text-sm font-medium text-yellow-700">На рассмотрении</span>
                            <p class="text-xs text-yellow-600">Ожидание решения Яндекс</p>
                          </div>
                        </div>
                        <button (click)="approveMerchant()"
                                class="shrink-0 px-2.5 py-1 text-xs font-medium rounded border border-dashed border-green-400 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                                title="Служебная кнопка: имитация одобрения заявки">
                          ✓ Одобрить
                        </button>
                      </div>
                      <!-- Active -->
                      <div *ngIf="currentMerchant.registration_status === 'active'"
                           class="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2.5">
                        <div class="flex items-center gap-2">
                          <lucide-icon name="check-circle-2" [size]="16" class="text-green-600"></lucide-icon>
                          <span class="text-sm font-medium text-green-700">Подключен</span>
                        </div>
                        <button *ngIf="selectedStore.hasYandexPayKey" (click)="scrollToQrSection()"
                                class="text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors">
                          Настроить QR-таблички
                        </button>
                      </div>
                      <!-- Failed -->
                      <div *ngIf="currentMerchant.registration_status === 'failed'"
                           class="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
                        <div class="flex items-center gap-2">
                          <lucide-icon name="x-circle" [size]="16" class="text-red-500"></lucide-icon>
                          <span class="text-sm font-medium text-red-700">Отклонен</span>
                        </div>
                        <button (click)="resubmitMerchant()"
                                class="text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors">
                          Подать повторно
                        </button>
                      </div>
                    </ng-container>

                    <!-- No merchant for this store yet -->
                    <ng-container *ngIf="!currentMerchant">
                      <!-- Has partner → submit merchant -->
                      <ng-container *ngIf="currentPartner">
                        <p class="text-sm text-gray-500">
                          Организация «{{ currentPartner.name }}» зарегистрирована. Подайте заявку на подключение торговой точки.
                        </p>
                        <button *ngIf="!showMerchantForm"
                                (click)="showMerchantForm = true; prefillMerchantName()"
                                class="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                          <lucide-icon name="file-check" [size]="16"></lucide-icon>
                          Подать заявку
                        </button>
                      </ng-container>
                      <!-- No partner → create partner first -->
                      <ng-container *ngIf="!currentPartner">
                        <p class="text-sm text-gray-500">Для подключения зарегистрируйте организацию в Яндекс.Пэй.</p>
                        <button *ngIf="!showPartnerForm"
                                (click)="showPartnerForm = true"
                                class="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                          <lucide-icon name="building-2" [size]="16"></lucide-icon>
                          Зарегистрировать организацию
                        </button>
                      </ng-container>

                      <!-- Partner creation form -->
                      <div *ngIf="showPartnerForm && !currentPartner" class="border border-gray-200 rounded-lg bg-white p-4 space-y-3 animate-fade-in">
                        <h4 class="font-medium text-sm text-gray-900">Регистрация организации</h4>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Название *</label>
                            <input [(ngModel)]="newPartnerName" type="text" placeholder="ООО Ромашка"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">ИНН *</label>
                            <input [(ngModel)]="newPartnerInn" type="text" placeholder="7707083893"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">ОГРН</label>
                            <input [(ngModel)]="newPartnerOgrn" type="text" placeholder="1027700132195"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">КПП</label>
                            <input [(ngModel)]="newPartnerKpp" type="text" placeholder="770701001"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div class="col-span-2">
                            <label class="block text-xs text-gray-600 mb-1">Полное наименование</label>
                            <input [(ngModel)]="newPartnerFullName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div class="col-span-2">
                            <label class="block text-xs text-gray-600 mb-1">Юридический адрес</label>
                            <input [(ngModel)]="newPartnerLegalAddress" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">ФИО Ген. директора</label>
                            <input [(ngModel)]="newPartnerCeo" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Сайт</label>
                            <input [(ngModel)]="newPartnerUrl" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Фамилия (контакт)</label>
                            <input [(ngModel)]="newPartnerLastName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Имя (контакт)</label>
                            <input [(ngModel)]="newPartnerFirstName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Отчество (контакт)</label>
                            <input [(ngModel)]="newPartnerMiddleName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Email</label>
                            <input [(ngModel)]="newPartnerEmail" type="email"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Телефон</label>
                            <input [(ngModel)]="newPartnerPhone" type="tel"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button (click)="createPartnerForCurrentOrg()" class="px-4 py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors">Создать</button>
                          <button (click)="showPartnerForm = false" class="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">Отмена</button>
                        </div>
                      </div>

                      <!-- Merchant application form -->
                      <div *ngIf="showMerchantForm && currentPartner" class="border border-gray-200 rounded-lg bg-white p-4 space-y-3 animate-fade-in">
                        <h4 class="font-medium text-sm text-gray-900">Заявка на подключение торговой точки</h4>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Название точки *</label>
                            <input [(ngModel)]="newMerchantName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">MCC-код</label>
                            <select [(ngModel)]="newMerchantMcc"
                                    class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                              <option value="">Выберите категорию</option>
                              <option *ngFor="let mcc of mccCodes" [value]="mcc.mcc">{{ mcc.mcc }} — {{ mcc.name }}</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Сайт</label>
                            <input [(ngModel)]="newMerchantUrl" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Кол-во точек продаж</label>
                            <input [(ngModel)]="newMerchantPosesCount" type="number" min="1"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Расчётный счёт</label>
                            <input [(ngModel)]="newMerchantSettlementAccount" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">БИК</label>
                            <input [(ngModel)]="newMerchantBik" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div class="col-span-2">
                            <label class="block text-xs text-gray-600 mb-1">Корреспондентский счёт</label>
                            <input [(ngModel)]="newMerchantCorrAccount" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div class="col-span-2 border-t border-gray-100 pt-3 mt-1">
                            <h5 class="text-xs font-medium text-gray-500 mb-2">Контактные данные</h5>
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Фамилия</label>
                            <input [(ngModel)]="newMerchantContactLastName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Имя</label>
                            <input [(ngModel)]="newMerchantContactFirstName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Отчество</label>
                            <input [(ngModel)]="newMerchantContactMiddleName" type="text"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Email</label>
                            <input [(ngModel)]="newMerchantContactEmail" type="email"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                          <div>
                            <label class="block text-xs text-gray-600 mb-1">Телефон</label>
                            <input [(ngModel)]="newMerchantContactPhone" type="tel"
                                   class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <button (click)="submitMerchantForCurrentStore()" class="px-4 py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors">Подать заявку</button>
                          <button (click)="showMerchantForm = false" class="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">Отмена</button>
                        </div>
                      </div>
                    </ng-container>
                  </ng-container>
                </div>

                <!-- "или" divider -->
                <div class="flex items-center gap-3">
                  <div class="flex-1 border-t border-gray-200"></div>
                  <span class="text-xs text-gray-400 uppercase tracking-wide">или</span>
                  <div class="flex-1 border-t border-gray-200"></div>
                </div>

                <!-- Manual Key Section -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Ключ Яндекс.Пэй (ручной ввод)</label>
                  <!-- Auto-filled key (readonly) -->
                  <ng-container *ngIf="isKeyAutoFilled">
                    <input
                      type="text"
                      [value]="keyValue"
                      readonly
                      class="w-full h-9 px-3 text-sm font-mono border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p class="text-xs text-green-600 flex items-center gap-1">
                      <lucide-icon name="check-circle-2" [size]="12"></lucide-icon>
                      Получен автоматически через Яндекс ID
                    </p>
                  </ng-container>
                  <!-- Manual key entry -->
                  <ng-container *ngIf="!isKeyAutoFilled">
                    <input
                      type="text"
                      [(ngModel)]="keyValue"
                      placeholder="Введите ключ Яндекс.Пэй (например: yk_test_...)"
                      class="w-full h-9 px-3 text-sm font-mono border border-gray-300 rounded-md bg-white
                             placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
                             transition-all"
                    />
                  </ng-container>
                  <p *ngIf="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
                  <p *ngIf="keyDetails && !isKeyAutoFilled" class="text-xs text-gray-400">
                    {{ keyDetails.lastUpdatedUtc
                      ? 'Обновлён: ' + formatDate(keyDetails.lastUpdatedUtc) + ', ' + keyDetails.updatedByUserName
                      : 'Ключ ещё не настроен'
                    }}
                  </p>
                </div>

                <!-- Action Buttons (hidden when auto-filled) -->
                <div *ngIf="!isKeyAutoFilled" class="flex gap-3">
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
                  <div data-qr-section class="border-t border-gray-200 my-6"></div>

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
  oauthState: OAuthState = { isAuthorized: false, accessToken: null, expiresAt: null, userName: null, userEmail: null };
  partners: Partner[] = [];
  allMerchants: MerchantInfo[] = [];
  merchants: MerchantInfo[] = [];
  storeMerchantMap: Record<string, string> = {};
  orgPartnerMap: Record<string, string> = {};
  userTokens: Map<string, UserTokenInfo[]> = new Map();
  mccCodes: MccCode[] = [];
  showPartnerForm = false;
  showMerchantForm = false;

  // Поля формы партнера
  newPartnerName = '';
  newPartnerInn = '';
  newPartnerOgrn = '';
  newPartnerKpp = '';
  newPartnerFullName = '';
  newPartnerLegalAddress = '';
  newPartnerCeo = '';
  newPartnerUrl = '';
  newPartnerFirstName = '';
  newPartnerLastName = '';
  newPartnerMiddleName = '';
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
  newMerchantContactFirstName = '';
  newMerchantContactLastName = '';
  newMerchantContactMiddleName = '';
  newMerchantContactEmail = '';
  newMerchantContactPhone = '';

  // --- Computed: OAuth/store context ---

  get currentStoreOrg(): Organization | null {
    if (!this.selectedStore) return null;
    return this.organizations.find(org =>
      org.stores.some(s => s.storeId === this.selectedStore!.storeId)
    ) || null;
  }

  get currentPartner(): Partner | null {
    const org = this.currentStoreOrg;
    if (!org) return null;
    const partnerId = this.orgPartnerMap[org.organizationId];
    if (!partnerId) return null;
    return this.partners.find(p => p.partner_id === partnerId) || null;
  }

  get currentMerchant(): MerchantInfo | null {
    if (!this.selectedStore) return null;
    const merchantId = this.storeMerchantMap[this.selectedStore.storeId];
    if (!merchantId) return null;
    return this.allMerchants.find(m => m.merchant_id === merchantId) || null;
  }

  get isKeyAutoFilled(): boolean {
    return this.oauthState.isAuthorized && !!this.currentMerchant && this.currentMerchant.registration_status === 'active';
  }

  ngOnInit(): void {
    this.organizations = this.storage.load('comet', 'organizations', MOCK_ORGANIZATIONS);
    this.storeMerchantMap = this.storage.load('comet', 'store_merchant_map', MOCK_STORE_MERCHANT_MAP);
    this.orgPartnerMap = this.storage.load('comet', 'org_partner_map', MOCK_ORG_PARTNER_MAP);

    // Восстановить OAuth-состояние
    const savedOAuth = this.storage.load<OAuthState | null>('comet', 'oauth_state', null);
    if (savedOAuth?.isAuthorized) {
      this.oauthState = savedOAuth;
      this.loadPartners();
      this.loadAllMerchants();
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
    this.showPartnerForm = false;
    this.showMerchantForm = false;

    await this.delay(300);

    // Check if merchant is active via OAuth → auto-fill key
    const merchantId = this.storeMerchantMap[store.storeId];
    const merchant = merchantId ? this.allMerchants.find(m => m.merchant_id === merchantId) : null;
    const autoFill = this.oauthState.isAuthorized && merchant?.registration_status === 'active';

    if (autoFill) {
      // Token-based key from OAuth
      const token = MOCK_USER_TOKENS.find(t => t.merchant_id === merchantId);
      const autoKey = token ? `ut_${token.last_four}_auto` : 'yk_test_auto_oauth';
      this.keyDetails = {
        yandexPayKey: autoKey,
        lastUpdatedUtc: new Date().toISOString(),
        updatedByUserName: 'Яндекс ID (автоматически)',
      };
      this.keyValue = autoKey;
      this.originalKeyValue = autoKey;

      if (!store.hasYandexPayKey) {
        this.updateStoreInOrgs(store.storeId, { hasYandexPayKey: true, terminalsConfigured: 'partial' });
        this.selectedStore = { ...store, hasYandexPayKey: true, terminalsConfigured: 'partial' };
        this.persistOrganizations();
      }
      this.loadTerminalsAndAccounts(store.storeId);
    } else {
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
      userEmail: 'restaurant-admin@yandex.ru',
    };
    this.storage.save('comet', 'oauth_state', this.oauthState);
    this.loadPartners();
    this.loadAllMerchants();
    this.loadMccCodes();

    // Re-select current store to trigger auto-fill if merchant is active
    if (this.selectedStore) {
      this.selectStore(this.selectedStore);
    }
    this.showToast('Авторизация успешна', 'Вы вошли через Яндекс ID');
  }

  logoutOAuth(): void {
    this.oauthState = { isAuthorized: false, accessToken: null, expiresAt: null, userName: null, userEmail: null };
    this.storage.save('comet', 'oauth_state', this.oauthState);
    this.partners = [];
    this.merchants = [];
    this.allMerchants = [];
    this.userTokens = new Map();

    // Re-select store to clear auto-fill
    if (this.selectedStore) {
      this.selectStore(this.selectedStore);
    }
  }

  loadPartners(): void {
    this.partners = this.storage.load<Partner[]>('comet', 'partners', MOCK_PARTNERS);
  }

  loadAllMerchants(): void {
    this.allMerchants = this.storage.load<MerchantInfo[]>('comet', 'merchants', MOCK_MERCHANTS);
  }

  loadMccCodes(): void {
    this.mccCodes = MOCK_MCC_CODES;
  }

  prefillMerchantName(): void {
    if (this.selectedStore) {
      this.newMerchantName = this.selectedStore.storeName;
    }
  }

  scrollToQrSection(): void {
    const el = document.querySelector('[data-qr-section]');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  resubmitMerchant(): void {
    if (!this.currentMerchant) return;
    this.allMerchants = this.allMerchants.map(m =>
      m.merchant_id === this.currentMerchant!.merchant_id
        ? { ...m, registration_status: 'processing' as const, updated: new Date().toISOString() }
        : m
    );
    this.storage.save('comet', 'merchants', this.allMerchants);
    this.showToast('Заявка подана повторно', this.currentMerchant.name);
  }

  approveMerchant(): void {
    if (!this.currentMerchant) return;
    const name = this.currentMerchant.name;
    this.allMerchants = this.allMerchants.map(m =>
      m.merchant_id === this.currentMerchant!.merchant_id
        ? { ...m, registration_status: 'active' as const, updated: new Date().toISOString() }
        : m
    );
    this.storage.save('comet', 'merchants', this.allMerchants);
    // Re-select store to trigger auto-fill key
    if (this.selectedStore) {
      this.selectStore(this.selectedStore);
    }
    this.showToast('Заявка одобрена', name);
  }

  createPartnerForCurrentOrg(): void {
    if (!this.newPartnerName.trim()) return;
    const org = this.currentStoreOrg;
    if (!org) return;

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
        first_name: this.newPartnerFirstName,
        last_name: this.newPartnerLastName,
        middle_name: this.newPartnerMiddleName,
      },
    };
    this.partners.push(partner);
    this.orgPartnerMap[org.organizationId] = partner.partner_id;
    this.storage.save('comet', 'partners', this.partners);
    this.storage.save('comet', 'org_partner_map', this.orgPartnerMap);
    this.showPartnerForm = false;
    this.resetPartnerForm();
    this.showToast('Организация зарегистрирована', partner.name);
  }

  submitMerchantForCurrentStore(): void {
    const partner = this.currentPartner;
    if (!partner || !this.selectedStore || !this.newMerchantName.trim()) return;

    const merchant: MerchantInfo = {
      merchant_id: this.generateId(),
      partner_id: partner.partner_id,
      name: this.newMerchantName,
      is_offline: true,
      enabled: true,
      registration_status: 'processing',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    this.allMerchants.push(merchant);
    this.storeMerchantMap[this.selectedStore.storeId] = merchant.merchant_id;
    this.storage.save('comet', 'merchants', this.allMerchants);
    this.storage.save('comet', 'store_merchant_map', this.storeMerchantMap);
    this.showMerchantForm = false;
    this.resetMerchantForm();
    this.showToast('Заявка подана', merchant.name);
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
    this.newPartnerFirstName = '';
    this.newPartnerLastName = '';
    this.newPartnerMiddleName = '';
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
    this.newMerchantContactFirstName = '';
    this.newMerchantContactLastName = '';
    this.newMerchantContactMiddleName = '';
    this.newMerchantContactEmail = '';
    this.newMerchantContactPhone = '';
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
