# Промт-патч v1.8: Подключение к Next Era (NE) — экран Б0

---
**Версия**: 1.8
**Дата**: 2026-02-17
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д3-патч (Промт-патч для обновления прототипа iikoWeb)
**Базовый документ**: Промт_прототипа_PUDU_Admin_панели_v1.5_патч.md (v1.5, 2026-02-17)
**Источники**: SPEC-002 v1.15 (разделы 2.5, 2.6.13, 2.9); стенограмма 11.02 (Олег, NE); Принцип Руслана: «все настройки — в iikoWeb»
**Scope**: Секция «Подключение к NE» на экране Б0 + модальное окно ввода учётных данных NE; закрытие открытого вопроса #13 (UI credentials), НВ-2.8.D (БД vs config)
---

## Назначение

Этот документ — **дельта-патч** к промту v1.5 (через цепочку v1.6, v1.7). Он добавляет **UI для первоначальной настройки подключения к NE API** — ввод `client_id` и `api_secret` на экране Б0 (Список ресторанов).

**Архитектурное решение** (закрытие #13 + НВ-2.8.D):
- Учётные данные (`client_id`, `api_secret`) **вводятся администратором** один раз в iikoWeb Admin Panel
- Хранятся в БД (таблица `pudu_ne_credential`) — **не в config-файле плагина**
- Backend управляет JWT-токеном (автообновление, 7 дней TTL)
- JWT-токен **доставляется плагину** через iikoTransport (новая секция `ne_auth`)
- Плагин **не хранит credentials** — получает готовый JWT через iikoTransport

> **Олег (NE), 11.02**: *«Я не думаю, что клиенту прям эти данные нужны.»*
> **Руслан, 06.02**: *«Все настройки, привязки начальные, соединения и настройки интеграции — должны делать в iikoWeb.»*

**Инструкция по применению**: сначала примени базовый промт v1.1, затем патчи v1.2 → v1.3 → v1.4 → v1.5 → v1.6 → v1.7 → затем этот патч v1.8 — последовательно.

**Ключевые изменения v1.8:**
- Карточка «Подключение к NE» на экране Э0 (Б0) — статус подключения (настроено / не настроено / ошибка)
- Модальное окно ввода `client_id` + `api_secret` с проверкой подключения
- Toast #14 «Подключение к NE настроено» (success)
- Toast #15 «Ошибка подключения. Проверьте учётные данные» (destructive)
- Toast #16 «Сервис NE временно недоступен» (warning)
- Mock-данные: state `neConnectionStatus` (connected / not_configured / error)

---

## Совместимость с предыдущими патчами

| Патч           | Совместимость | Примечание                             |
| -------------- | ------------- | -------------------------------------- |
| v1.1 (базовый) | Требуется     | Базовые экраны                         |
| v1.2 (C1–C10)  | Требуется     | —                                      |
| v1.3 (E1–E5)   | Требуется     | —                                      |
| v1.4 (F1–F13)  | Требуется     | Экран Б0 (Э0), двухуровневая навигация |
| v1.5 (G1–G11)  | Требуется     | —                                      |
| v1.6           | Требуется     | —                                      |
| v1.7           | Требуется     | —                                      |

---

## Перечень изменений v1.8

| #      | Изменение                                                | Область | Причина                                                                                         |
| ------ | -------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| **K1** | Карточка «Подключение к NE» на Э0                        | Э0 (Б0) | Закрытие #13: UI для credentials — карточка на корневом экране (per-account, не per-restaurant) |
| **K2** | Модальное окно ввода credentials                         | Э0 (Б0) | Ввод `client_id` + `api_secret` с валидацией через NE API                                       |
| **K3** | State `neConnectionStatus`                               | Э0 (Б0) | Mock-статус подключения к NE                                                                    |
| **K4** | Toast #14 «Подключение к NE настроено»                   | Э0 (Б0) | Успешное сохранение credentials (NE вернул JWT)                                                 |
| **K5** | Toast #15 «Ошибка подключения»                           | Э0 (Б0) | Невалидные credentials (NE вернул 401)                                                          |
| **K6** | Toast #16 «Сервис NE временно недоступен»                | Э0 (Б0) | NE API недоступен (502/503)                                                                     |
| **K7** | Alert-баннер при отсутствии подключения                  | Э0 (Б0) | Блокирующее предупреждение: без credentials невозможна работа с роботами                        |
| **K8** | Блокировка перехода к ресторану без подключения (мягкая) | Э0 (Б0) | Строки таблицы ресторанов disabled-state, если NE не подключён                                  |

---

## K1. Карточка «Подключение к NE» на Э0

### Экран Э0 (Б0), файл `app/page.tsx`

### ДОБАВИТЬ: Карточку подключения к NE **над** таблицей ресторанов

Карточка отображает текущий статус подключения к NE API и кнопку управления.

```tsx
// v1.8 K1: Карточка подключения к NE — 3 состояния
{neConnectionStatus === 'connected' && (
  <div className="flex items-center justify-between px-4 py-3 mb-6
                  border border-green-200 bg-green-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
      <div>
        <p className="text-sm font-medium text-green-800">Подключено к Next Era</p>
        <p className="text-xs text-green-600">
          Учётные данные настроены. JWT-токен активен
        </p>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowCredentialsModal(true)}
      className="text-green-700 hover:text-green-800"
    >
      Изменить
    </Button>
  </div>
)}

{neConnectionStatus === 'not_configured' && (
  <UiAlert variant="warning" className="mb-6">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between w-full">
      <div>
        <p className="text-sm font-medium">Подключение к Next Era не настроено</p>
        <p className="text-xs text-gray-600 mt-1">
          Для работы с роботами PUDU необходимо ввести учётные данные NE API.
          Данные предоставляются компанией Next Era при подключении ресторана.
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => setShowCredentialsModal(true)}
        className="ml-4 shrink-0"
      >
        Настроить подключение
      </Button>
    </AlertDescription>
  </UiAlert>
)}

{neConnectionStatus === 'error' && (
  <UiAlert variant="destructive" className="mb-6">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between w-full">
      <div>
        <p className="text-sm font-medium">Ошибка подключения к Next Era</p>
        <p className="text-xs mt-1">
          Не удалось авторизоваться в NE API. Проверьте учётные данные.
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowCredentialsModal(true)}
        className="ml-4 shrink-0"
      >
        Обновить данные
      </Button>
    </AlertDescription>
  </UiAlert>
)}
```

### Позиционирование на экране Э0

```
┌──────────────────────────────────────────────────┐
│  SUBHEADER: H1 "Настройки PUDU"                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  [КАРТОЧКА ПОДКЛЮЧЕНИЯ К NE]  ← K1 (новое)      │
│                                                  │
│  [Строка поиска ресторанов]                      │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  Таблица ресторанов                       │    │
│  │  ...                                      │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## K2. Модальное окно ввода credentials

### ДОБАВИТЬ: Модальное окно `NeCredentialsModal`

```tsx
// v1.8 K2: Модальное окно ввода учётных данных NE
const [showCredentialsModal, setShowCredentialsModal] = useState(false);
const [credClientId, setCredClientId] = useState('');
const [credApiSecret, setCredApiSecret] = useState('');
const [credSaving, setCredSaving] = useState(false);

const handleSaveCredentials = async () => {
  // Валидация
  if (!credClientId.trim() || !credApiSecret.trim()) {
    toast({
      variant: "destructive",
      description: "Заполните оба поля",
    });
    return;
  }

  setCredSaving(true);

  // Mock: имитация POST /api/pudu/credentials
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (mockNeAvailable) {
    // Сценарий 1: NE доступен, credentials валидны (200)
    setNeConnectionStatus('connected');
    setShowCredentialsModal(false);
    setCredClientId('');
    setCredApiSecret('');
    toast({ description: "Подключение к NE настроено" });
  } else {
    // Сценарий 2: NE недоступен (502)
    toast({
      variant: "warning",
      description: "Сервис NE временно недоступен. Попробуйте позже",
      duration: 4000,
    });
  }

  setCredSaving(false);
};
```

### Рендер модального окна:

```tsx
<Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Подключение к Next Era</DialogTitle>
      <DialogDescription>
        Введите учётные данные, предоставленные компанией Next Era.
        Данные используются для авторизации в API сервиса роботов.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="client-id">Идентификатор клиента (Client ID)</Label>
        <Input
          id="client-id"
          value={credClientId}
          onChange={(e) => setCredClientId(e.target.value)}
          placeholder="iiko_restaurant_001"
          disabled={credSaving}
          aria-label="Идентификатор клиента в системе NE"
        />
        <p className="text-xs text-gray-500">
          Выдаётся компанией Next Era при подключении ресторана
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-secret">API-секрет</Label>
        <Input
          id="api-secret"
          type="password"
          value={credApiSecret}
          onChange={(e) => setCredApiSecret(e.target.value)}
          placeholder="as_xxxxxxxxxxxx"
          disabled={credSaving}
          aria-label="Секретный ключ API NE"
        />
        <p className="text-xs text-gray-500">
          Секретный ключ API. Хранится в зашифрованном виде
        </p>
      </div>
    </div>

    <DialogFooter className="gap-2">
      <Button
        variant="ghost"
        onClick={() => setShowCredentialsModal(false)}
        disabled={credSaving}
      >
        Отмена
      </Button>
      <Button
        onClick={handleSaveCredentials}
        disabled={credSaving || !credClientId.trim() || !credApiSecret.trim()}
      >
        {credSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Проверка подключения...
          </>
        ) : (
          'Подключить'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Поведение модального окна (4 шага):

| Шаг | Действие                               | Реакция UI                                                                                                |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Открытие модалки                       | Поля пустые (при первой настройке) или заполнены (при редактировании — client_id видим, api_secret скрыт) |
| 2   | Ввод `client_id` + `api_secret`        | Кнопка «Подключить» активируется, когда оба поля непустые                                                 |
| 3   | Клик «Подключить»                      | Spinner «Проверка подключения...». Backend вызывает `POST /v1/auth/token` для валидации. Поля disabled    |
| 4a  | Успех (NE вернул JWT)                  | Модалка закрывается. Карточка → «Подключено к NE» (green). Toast #14                                      |
| 4b  | Невалидные credentials (NE вернул 401) | Модалка остаётся открытой. Toast #15 (destructive). Поля re-enabled                                       |
| 4c  | NE недоступен (502/503)                | Модалка остаётся открытой. Toast #16 (warning). Поля re-enabled                                           |

> **Примечание**: Поле `api_secret` имеет `type="password"` — значение скрыто при вводе. При повторном открытии модалки для редактирования — `api_secret` **не подставляется** (отображается пустое поле с placeholder), `client_id` — подставляется.

---

## K3. State `neConnectionStatus`

### ДОБАВИТЬ: state и mock-данные для статуса подключения

```tsx
// v1.8 K3: Статус подключения к NE
type NeConnectionStatus = 'connected' | 'not_configured' | 'error';

const [neConnectionStatus, setNeConnectionStatus] = useState<NeConnectionStatus>('not_configured');

// Mock-переключатель (из v1.5 G3, расширяем)
const [mockNeAvailable, setMockNeAvailable] = useState(true);
```

### Mock-переключатель (dev-toolbar, расширение v1.5):

```tsx
{/* Mock-переключатели (для демонстрации) */}
<div className="flex items-center gap-4 text-xs text-gray-400 px-6 pb-2">
  <div className="flex items-center gap-2">
    <Switch
      checked={mockNeAvailable}
      onCheckedChange={setMockNeAvailable}
      id="mock-ne"
      className="h-4 w-8"
    />
    <label htmlFor="mock-ne">NE API доступен (mock)</label>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setNeConnectionStatus('not_configured')}
      className="px-2 py-0.5 rounded border text-[10px] hover:bg-gray-100"
    >
      Сбросить подключение
    </button>
    <button
      onClick={() => setNeConnectionStatus('error')}
      className="px-2 py-0.5 rounded border text-[10px] hover:bg-gray-100 text-red-500"
    >
      Симуляция ошибки
    </button>
  </div>
</div>
```

---

## K4. Toast #14 «Подключение к NE настроено»

| #   | Текст                        | Стиль   | Триггер                                           |
| --- | ---------------------------- | ------- | ------------------------------------------------- |
| 14  | «Подключение к NE настроено» | default | Сохранение credentials, backend получил JWT от NE |

---

## K5. Toast #15 «Ошибка подключения»

| #   | Текст                                          | Стиль       | Триггер                                         |
| --- | ---------------------------------------------- | ----------- | ----------------------------------------------- |
| 15  | «Ошибка подключения. Проверьте учётные данные» | destructive | NE вернул 401 (невалидные client_id/api_secret) |

---

## K6. Toast #16 «Сервис NE временно недоступен»

| #   | Текст                                             | Стиль   | Триггер               |
| --- | ------------------------------------------------- | ------- | --------------------- |
| 16  | «Сервис NE временно недоступен. Попробуйте позже» | warning | NE API вернул 502/503 |

---

## K7. Alert-баннер при отсутствии подключения

Реализован в K1 (состояние `not_configured`). Alert с `variant="warning"` содержит текст:

> **Подключение к Next Era не настроено**
> Для работы с роботами PUDU необходимо ввести учётные данные NE API. Данные предоставляются компанией Next Era при подключении ресторана.

с кнопкой «Настроить подключение».

**Причина**: Без credentials невозможна авторизация в NE API → невозможна регистрация роботов, получение точек, отправка задач. Баннер дает администратору понять, что первый шаг — подключить NE.

---

## K8. Блокировка перехода к ресторану без подключения

### ОБНОВИТЬ: строки таблицы ресторанов (Э0)

**Было (v1.4):**
```tsx
<tr
  className="hover:bg-gray-50 cursor-pointer"
  onClick={() => navigateToRestaurant(restaurant.account_id)}
>
```

**Стало (v1.8):**
```tsx
<tr
  className={cn(
    "transition-colors",
    neConnectionStatus === 'connected'
      ? "hover:bg-gray-50 cursor-pointer"
      : "opacity-50 cursor-not-allowed"
  )}
  onClick={() => {
    if (neConnectionStatus === 'connected') {
      navigateToRestaurant(restaurant.account_id);
    } else {
      toast({
        variant: "warning",
        description: "Сначала настройте подключение к NE",
        duration: 3000,
      });
    }
  }}
>
```

**Поведение**: Если NE не подключён (статус `not_configured` или `error`), строки таблицы ресторанов визуально приглушены (`opacity-50`), клик по ресторану не переходит на экран Б5, а показывает предупреждающий Toast «Сначала настройте подключение к NE».

> **Примечание**: Это **мягкая** блокировка (soft block) — в прототипе администратор видит список ресторанов, но не может перейти к настройке робототехники без подключения к NE. В продакшене Backend может возвращать 403 для всех PUDU-операций при отсутствии credentials.

---

## Обновление итогового чеклиста

В дополнение к чеклисту v1.7, добавить:

- [ ] K1: Карточка «Подключено к NE» (green) отображается при status=connected
- [ ] K1: Alert «Подключение не настроено» (warning) отображается при status=not_configured
- [ ] K1: Alert «Ошибка подключения» (destructive) отображается при status=error
- [ ] K2: Модальное окно открывается по кнопке «Настроить подключение» / «Изменить» / «Обновить данные»
- [ ] K2: Поля client_id + api_secret валидируются (непустые)
- [ ] K2: Поле api_secret скрыто (type=password)
- [ ] K2: Spinner «Проверка подключения...» при сохранении
- [ ] K2: Модалка закрывается при успехе, остаётся при ошибке
- [ ] K3: Mock-state переключается корректно (connected / not_configured / error)
- [ ] K4: Toast #14 «Подключение к NE настроено» при успешном сохранении
- [ ] K5: Toast #15 «Ошибка подключения. Проверьте учётные данные» при 401
- [ ] K6: Toast #16 «Сервис NE временно недоступен» при 502/503
- [ ] K7: Alert-баннер отображается при отсутствии подключения
- [ ] K8: Строки ресторанов disabled (opacity-50) при отсутствии подключения
- [ ] K8: Клик по ресторану без подключения → Toast предупреждения

---

## История изменений

| Версия | Дата       | Автор        | Описание                                                                                                                                                                                                                                                                                                                                                                                    |
| ------ | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.8    | 2026-02-17 | Кирилл Тюрин | K1–K8: Секция «Подключение к NE» на экране Б0. Карточка статуса (3 состояния: connected/not_configured/error). Модальное окно ввода client_id + api_secret с проверкой подключения через NE API. Toast #14–16. Блокировка перехода к ресторану без подключения. Закрытие открытого вопроса #13 (UI credentials) и НВ-2.8.D (хранение в БД). Источник: SPEC-002 v1.15, встречи 06.02, 11.02. |
