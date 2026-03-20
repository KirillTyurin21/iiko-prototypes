# Патч прототипа Comet: OAuth-онбординг Яндекс.Пэй

> **Версия:** 1.0
> **Дата:** 20.03.2026
> **Автор:** Кирилл (SA)
> **Назначение:** Инструкция для доработки прототипа Comet (Angular 16 standalone). Файл предназначен для передачи в другую рабочую область, где Copilot применит описанные изменения к коду прототипа.
> **Источник:** Анализ_доработки_OAuth_онбординг_Яндекс_Пэй.md, секция 15

---

## Содержание

- [Патч прототипа Comet: OAuth-онбординг Яндекс.Пэй](#патч-прототипа-comet-oauth-онбординг-яндекспэй)
  - [Содержание](#содержание)
  - [1. Общие правила](#1-общие-правила)
  - [2. Изменения в types.ts](#2-изменения-в-typests)
  - [3. Изменения в mock-data.ts](#3-изменения-в-mock-datats)
  - [4. Изменения в comet-main-screen.component.ts](#4-изменения-в-comet-main-screencomponentts)
    - [4.1 Новые свойства компонента](#41-новые-свойства-компонента)
    - [4.2 Новые методы компонента](#42-новые-методы-компонента)
    - [4.3 Новая секция шаблона](#43-новая-секция-шаблона)
  - [5. Новый пункт sidebar](#5-новый-пункт-sidebar)
  - [6. Регистрация иконок](#6-регистрация-иконок)
  - [7. Справочник UI-элементов](#7-справочник-ui-элементов)

---

## 1. Общие правила

- Angular 16 (standalone: true)
- Директивы шаблона: *ngIf, *ngFor, [(ngModel)] - НЕ использовать @if/@for (Angular 17+)
- Инъекция зависимостей: inject()
- Формы: FormsModule, [(ngModel)]
- Стили: Tailwind CSS, inline templates
- Палитра: gray (bg-gray-900 для primary buttons)
- Кнопки: кастомные inline (не Angular Material)
- Выпадающие списки/инпуты: нативные `<select>`, `<input>` + Tailwind
- Персистентность: StorageService -> localStorage
- Иконки: lucide-angular
- Диалоги: `<ui-confirm-dialog>`

---

## 2. Изменения в types.ts

Добавить следующие интерфейсы в файл `types.ts` после существующих интерфейсов (Organization, Store, KeyDetails, YpTerminal, Account):

```typescript
// --- OAuth-онбординг: новые интерфейсы ---

export interface OAuthState {
  isAuthorized: boolean;
  accessToken: string | null;
  expiresAt: string | null;
  userName: string | null;
}

export interface RegistrationData {
  tax_ref_number: string;  // ИНН
  ogrn: string;            // ОГРН
  kpp: string;             // КПП
  legal_address: string;   // Юридический адрес
  postal_address: string;  // Почтовый адрес
  postal_code: string;     // Индекс
  full_company_name: string; // Полное наименование
  ceo_name: string;        // ФИО генерального директора
  url: string;             // Сайт
}

export interface ContactInfo {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  middle_name: string;
}

export interface Partner {
  partner_id: string;
  name: string;
  registration_data: RegistrationData;
  contact: ContactInfo;
}

export interface BankDetails {
  settlement_account: string;  // Расчетный счет
  bik: string;                 // БИК
  correspondent_account: string; // Корреспондентский счет
}

export interface MerchantRegistrationRequest {
  merchant: { name: string; url: string };
  onboarding_data: { mcc: string };
  communication_contact: ContactInfo;
  bank_details: BankDetails;
  poses_count: number;
}

export interface MerchantInfo {
  merchant_id: string;
  partner_id: string;
  name: string;
  is_offline: boolean;
  enabled: boolean;
  registration_status: 'processing' | 'active' | 'failed';
  created: string;
  updated: string;
}

export interface PosInfo {
  pos_id: string;
  title: string;
  activated: boolean;
  token: string;
  qrc_id: string;
  bind_status: 'initial' | 'bound';
}

export interface MerchantStatus {
  merchant_id: string;
  registration_status: 'processing' | 'active' | 'failed';
  poses: PosInfo[];
}

export interface UserTokenInfo {
  id: string;
  merchant_id: string;
  partner_id: string;
  last_four: string;
  token_format: string;
  created_at: string;
  token_value?: string;  // доступно только при создании
}

export interface MccCode {
  mcc: string;
  name: string;
}
```

---

## 3. Изменения в mock-data.ts

Добавить мок-данные для новых сущностей в файл `mock-data.ts`:

```typescript
import { Partner, MerchantInfo, MerchantStatus, UserTokenInfo, MccCode, OAuthState } from '../types';

export const MOCK_OAUTH_STATE: OAuthState = {
  isAuthorized: false,
  accessToken: null,
  expiresAt: null,
  userName: null
};

export const MOCK_PARTNERS: Partner[] = [
  {
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'ООО Ромашка',
    registration_data: {
      tax_ref_number: '7707083893',
      ogrn: '1027700132195',
      kpp: '770701001',
      legal_address: '119021, г. Москва, ул. Льва Толстого, д. 16',
      postal_address: '119021, г. Москва, ул. Льва Толстого, д. 16',
      postal_code: '119021',
      full_company_name: 'Общество с ограниченной ответственностью Ромашка',
      ceo_name: 'Иванов Иван Иванович',
      url: 'http://romashka.ru'
    },
    contact: {
      email: 'merchant@romashka.ru',
      phone: '+79001234567',
      first_name: 'Иван',
      last_name: 'Иванов',
      middle_name: 'Иванович'
    }
  }
];

export const MOCK_MERCHANTS: MerchantInfo[] = [
  {
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0001',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'Ресторан Ромашка на Тверской',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-18T10:30:00Z',
    updated: '2026-03-19T14:00:00Z'
  },
  {
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0002',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'Ресторан Ромашка на Арбате',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: '2026-03-19T09:00:00Z',
    updated: '2026-03-19T09:00:00Z'
  }
];

export const MOCK_MERCHANT_STATUS: MerchantStatus = {
  merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0001',
  registration_status: 'active',
  poses: [
    {
      pos_id: '2697c7ff-1111-2222-3333-444455556666',
      title: 'Касса #1',
      activated: true,
      token: 'ut_a1b2c3d4e5f6g7h8',
      qrc_id: 'qrc_12345',
      bind_status: 'bound'
    }
  ]
};

export const MOCK_USER_TOKENS: UserTokenInfo[] = [
  {
    id: 'tok-1111-2222-3333-444455556666',
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0001',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    last_four: 'g7h8',
    token_format: 'YANDEX_PAY',
    created_at: '2026-03-19T12:00:00Z'
  }
];

export const MOCK_MCC_CODES: MccCode[] = [
  { mcc: '5812', name: 'Рестораны' },
  { mcc: '5813', name: 'Бары и ночные клубы' },
  { mcc: '5814', name: 'Фастфуд' },
  { mcc: '7230', name: 'Парикмахерские и косметические услуги' },
  { mcc: '7298', name: 'Оздоровительные и спа-услуги' }
];
```

---

## 4. Изменения в comet-main-screen.component.ts

### 4.1 Новые свойства компонента

Добавить в класс компонента следующие свойства для управления OAuth-онбордингом, списками партнеров и мерчантов, а также состоянием UI форм:

```typescript
// --- OAuth-онбординг ---
oauthState: OAuthState = { isAuthorized: false, accessToken: null, expiresAt: null, userName: null };
partners: Partner[] = [];
selectedPartner: Partner | null = null;
merchants: MerchantInfo[] = [];
merchantStatuses: Map<string, MerchantStatus> = new Map(); // Зарезервировано для поллинга статусов
userTokens: Map<string, UserTokenInfo[]> = new Map();
mccCodes: MccCode[] = [];
showPartnerForm = false;
showMerchantForm = false;
newPartner: Partial<Partner> = {};
newMerchant: Partial<MerchantRegistrationRequest> = {};
oauthSection: 'partners' | 'merchants' | 'tokens' = 'partners';
```

Все типы данных соответствуют интерфейсам из секции 2: OAuthState, Partner, MerchantInfo, MerchantStatus, UserTokenInfo, MccCode, MerchantRegistrationRequest.

### 4.2 Новые методы компонента

Добавить в класс компонента следующие методы для обработки OAuth-авторизации, управления партнерами и мерчантами, а также генерации пользовательских токенов:

```typescript
// --- OAuth ---
startOAuth(): void {
  // Имитация OAuth-авторизации через Яндекс ID
  this.oauthState = {
    isAuthorized: true,
    accessToken: 'mock_oauth_token_abc123',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    userName: 'Иванов Иван'
  };
  this.storageService.set('oauth_state', this.oauthState);
  this.loadPartners();
  this.loadMccCodes();
}

logoutOAuth(): void {
  this.oauthState = { isAuthorized: false, accessToken: null, expiresAt: null, userName: null };
  this.storageService.remove('oauth_state');
  this.partners = [];
  this.merchants = [];
  this.selectedPartner = null;
}

loadPartners(): void {
  this.partners = this.storageService.get<Partner[]>('partners') || MOCK_PARTNERS;
}

loadMccCodes(): void {
  this.mccCodes = MOCK_MCC_CODES;
}

selectPartner(partner: Partner): void {
  this.selectedPartner = partner;
  this.loadMerchants(partner.partner_id);
}

loadMerchants(partnerId: string): void {
  const all = this.storageService.get<MerchantInfo[]>('merchants') || MOCK_MERCHANTS;
  this.merchants = all.filter(m => m.partner_id === partnerId);
}

createPartner(): void {
  if (!this.newPartner.name) return;
  const partner: Partner = {
    partner_id: crypto.randomUUID(),
    name: this.newPartner.name || '',
    registration_data: this.newPartner.registration_data as RegistrationData,
    contact: this.newPartner.contact as ContactInfo
  };
  this.partners.push(partner);
  this.storageService.set('partners', this.partners);
  this.showPartnerForm = false;
  this.newPartner = {};
}

submitMerchantApplication(): void {
  if (!this.selectedPartner || !this.newMerchant.merchant?.name) return;
  const merchant: MerchantInfo = {
    merchant_id: crypto.randomUUID(),
    partner_id: this.selectedPartner.partner_id,
    name: this.newMerchant.merchant?.name || '',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  this.merchants.push(merchant);
  this.storageService.set('merchants', [...MOCK_MERCHANTS, ...this.merchants]);
  this.showMerchantForm = false;
  this.newMerchant = {};
}

generateMerchantToken(merchantId: string): void {
  const token: UserTokenInfo = {
    id: crypto.randomUUID(),
    merchant_id: merchantId,
    partner_id: this.selectedPartner?.partner_id || '',
    last_four: Math.random().toString(36).substring(2, 6),
    token_format: 'YANDEX_PAY',
    created_at: new Date().toISOString(),
    token_value: 'ut_' + Math.random().toString(36).substring(2, 18)
  };
  const existing = this.userTokens.get(merchantId) || [];
  existing.push(token);
  this.userTokens.set(merchantId, existing);
}

getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'processing': 'На рассмотрении',
    'active': 'Активен',
    'failed': 'Отклонен'
  };
  return labels[status] || status;
}

getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'processing': 'text-yellow-600 bg-yellow-50',
    'active': 'text-green-600 bg-green-50',
    'failed': 'text-red-600 bg-red-50'
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}
```

Все методы работают с мок-данными из MOCK_PARTNERS, MOCK_MERCHANTS, MOCK_MCC_CODES (секция 3) и используют StorageService для персистентности состояния.

### 4.3 Новая секция шаблона

Добавить в inline template после существующих секций (DetailPanel). Секция отображается, когда в sidebar выбран пункт "Онбординг Яндекс.Пэй":

```html
<!-- OAuth-онбординг секция -->
<div *ngIf="activeSection === 'onboarding'" class="flex-1 p-6 overflow-y-auto">
  <h2 class="text-xl font-semibold text-gray-900 mb-4">Онбординг Яндекс.Пэй</h2>

  <!-- Блок авторизации (не авторизован) -->
  <div *ngIf="!oauthState.isAuthorized" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
    <p class="text-gray-500 mb-6">Для управления организациями и заявками необходимо авторизоваться через Яндекс ID</p>
    <button (click)="startOAuth()"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
      Войти с Яндекс ID
    </button>
  </div>

  <!-- Основная панель (авторизован) -->
  <div *ngIf="oauthState.isAuthorized">
    <!-- Шапка авторизации -->
    <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
      <div class="flex items-center gap-2">
        <span class="text-green-700 text-sm font-medium">Авторизовано: {{ oauthState.userName }}</span>
      </div>
      <button (click)="logoutOAuth()" class="text-sm text-red-600 hover:text-red-800">Выйти</button>
    </div>

    <!-- Вкладки -->
    <div class="flex gap-1 mb-6 border-b border-gray-200">
      <button (click)="oauthSection = 'partners'"
              [class]="oauthSection === 'partners' ? 'px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700'">
        Организации
      </button>
      <button (click)="oauthSection = 'merchants'"
              [class]="oauthSection === 'merchants' ? 'px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700'">
        Заявки
      </button>
      <button (click)="oauthSection = 'tokens'"
              [class]="oauthSection === 'tokens' ? 'px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900' : 'px-4 py-2 text-sm text-gray-500 hover:text-gray-700'">
        Токены
      </button>
    </div>

    <!-- Вкладка: Организации -->
    <div *ngIf="oauthSection === 'partners'">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Организации-партнеры</h3>
        <button (click)="showPartnerForm = !showPartnerForm"
                class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
          + Добавить организацию
        </button>
      </div>

      <!-- Форма создания партнера -->
      <div *ngIf="showPartnerForm" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h4 class="font-medium text-gray-900 mb-3">Новая организация</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Название</label>
            <input [(ngModel)]="newPartner.name" type="text" placeholder="ООО Ромашка"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
          </div>
          <!-- [TODO] Добавить аналогичные поля для registration_data: tax_ref_number, ogrn, kpp, legal_address, postal_address, postal_code, full_company_name, ceo_name, url и contact: email, phone, first_name, last_name, middle_name -->
        </div>
        <div class="flex gap-2 mt-4">
          <button (click)="createPartner()" class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Создать</button>
          <button (click)="showPartnerForm = false" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Отмена</button>
        </div>
      </div>

      <!-- Список партнеров -->
      <div *ngFor="let p of partners" (click)="selectPartner(p)"
           class="flex items-center justify-between bg-white border rounded-lg px-4 py-3 mb-2 cursor-pointer hover:bg-gray-50"
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
        Выберите организацию на вкладке "Организации"
      </div>
      <div *ngIf="selectedPartner">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Заявки: {{ selectedPartner.name }}</h3>
          <button (click)="showMerchantForm = !showMerchantForm"
                  class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
            + Подать заявку
          </button>
        </div>

        <!-- Форма заявки -->
        <div *ngIf="showMerchantForm" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h4 class="font-medium text-gray-900 mb-3">Регистрация торговой точки</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Название точки</label>
              <input [(ngModel)]="newMerchant.merchant!.name" type="text"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">MCC-код</label>
              <select [(ngModel)]="newMerchant.onboarding_data!.mcc"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                <option value="">Выберите категорию</option>
                <option *ngFor="let mcc of mccCodes" [value]="mcc.mcc">{{ mcc.mcc }} - {{ mcc.name }}</option>
              </select>
            </div>
            <!-- [TODO] Добавить поля: url, bank_details (settlement_account, bik, correspondent_account), communication_contact (email, phone, first_name, last_name, middle_name), poses_count -->
          </div>
          <div class="flex gap-2 mt-4">
            <button (click)="submitMerchantApplication()" class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Подать заявку</button>
            <button (click)="showMerchantForm = false" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Отмена</button>
          </div>
        </div>

        <!-- Таблица заявок -->
        <table class="w-full text-sm">
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
          <div *ngFor="let t of (userTokens.get(m.merchant_id) || [])" class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 mb-1">
            <div>
              <span class="font-mono text-sm text-gray-900">****{{ t.last_four }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ t.token_format }}</span>
            </div>
            <span class="text-xs text-gray-400">{{ t.created_at | date:'dd.MM.yyyy HH:mm' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 5. Новый пункт sidebar

Добавить в массив пунктов sidebar элемент:

```typescript
{ id: 'onboarding', label: 'Онбординг', icon: 'log-in' }
```

Обработчик клика по sidebar должен устанавливать `activeSection = item.id`.

---

## 6. Регистрация иконок

Добавить новые иконки lucide-angular в массив регистрации:

```typescript
import { LogIn, UserPlus, Building2, FileCheck, Key } from 'lucide-angular';

// В массив icons добавить:
LogIn, UserPlus, Building2, FileCheck, Key
```

Назначение иконок:

| Иконка | Имя | Назначение |
|--------|------|-------------|
| LogIn | `log-in` | Кнопка OAuth ("Войти с Яндекс ID") |
| UserPlus | `user-plus` | Создание партнера |
| Building2 | `building-2` | Организации |
| FileCheck | `file-check` | Заявки |
| Key | `key` | Токены |

---

## 7. Справочник UI-элементов

Таблица стилей Tailwind CSS для всех UI-элементов секции онбординга:

| Элемент | Tailwind-классы | Описание |
|---------|----------------|----------|
| Primary button | `px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors` | Основная кнопка (создать, подать) |
| Secondary button | `px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50` | Кнопка отмены |
| Danger link | `text-sm text-red-600 hover:text-red-800` | Ссылка "Выйти" |
| Input field | `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400` | Текстовое поле |
| Select | `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400` | Выпадающий список |
| Card | `bg-white border border-gray-200 rounded-lg px-4 py-3` | Карточка элемента списка |
| Card selected | `bg-white border border-gray-900 rounded-lg px-4 py-3` | Выбранная карточка |
| Status badge (processing) | `px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-50` | Бейдж "На рассмотрении" |
| Status badge (active) | `px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50` | Бейдж "Активен" |
| Status badge (failed) | `px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50` | Бейдж "Отклонен" |
| Tab active | `px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900` | Активная вкладка |
| Tab inactive | `px-4 py-2 text-sm text-gray-500 hover:text-gray-700` | Неактивная вкладка |
| Auth banner | `flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3` | Баннер авторизации |
| Form section | `bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4` | Секция формы |
| Table header | `bg-gray-50 text-left` | Заголовок таблицы |
| Table row | `border-b border-gray-100` | Строка таблицы |
| Empty state | `text-center text-gray-400 py-12` | Пустое состояние (нет данных) |
