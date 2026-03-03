# Прототип плагина MGS (Casino Guest Management)

> **Для:** Рабочая область "Прототипы" (веб-формат, Angular + Tailwind + Lucide)
> **Стилистика:** STYLE_GUIDE.md (materials/Плагины iikoFront/)
> **Источник:** Спецификация MGS-спецификация.md (проект Neon)

---

## 1. Общее описание

Создай прототип плагина **"MGS - Casino Guest Management"** для кассового терминала iikoFront.

Плагин интегрирует кассу ресторана при казино с системой управления гостями MGS. Кассир идентифицирует гостя казино, видит его профиль и балансы, а затем может списать средства со счёта гостя для оплаты заказа в ресторане. Предусмотрены три типа оплаты: кэш-поинты (Cashless), баллы лояльности (Loyalty) и комплиментарные баллы (Comp).

**Slug прототипа:** `mgs-casino`

---

## 2. Стилистика

- Опирайся на **STYLE_GUIDE.md** (materials/Плагины iikoFront/)
- Тёмная POS-тема: `bg-[#3a3a3a]`, кнопки `bg-[#1a1a1a]`, акцент `#b8c959`
- Все модалки через `PosDialogComponent` (тёмная обёртка)
- Крупные элементы для тач-экранов: кнопки `h-14`, инпуты `h-12`
- Типографика: заголовки `text-2xl text-[#b8c959]`, body `text-sm text-gray-300`

---

## 3. Перечень диалогов (9 штук)

| # | Тип диалога (ModalType) | Размер | Тема | Назначение |
|---|------------------------|--------|------|------------|
| 1 | `button-panel` | - | Тёмная | Панель кнопок на экране заказа (не модалка, а встроенная панель) |
| 2 | `guest-profile` | LG (600px) | Тёмная | Профиль гостя после идентификации |
| 3 | `pin-entry` | MD (500px) | Тёмная | Ввод PIN-кода гостя для авторизации операции |
| 4 | `guest-list` | LG (600px) | Тёмная | Список гостей, находящихся в казино |
| 5 | `payment-cashless` | MD (500px) | Тёмная | Подтверждение оплаты кэш-поинтами |
| 6 | `payment-loyalty` | MD (500px) | Тёмная | Подтверждение оплаты баллами лояльности |
| 7 | `loading` | SM (350px) | Светлая | Индикатор загрузки |
| 8 | `success` | MD (500px) | Тёмная | Успешное завершение операции |
| 9 | `error` | MD (500px) | Тёмная | Ошибка операции |

---

## 4. Навигация (State-машина)

```typescript
type ModalType =
  | 'guest-profile'
  | 'pin-entry'
  | 'guest-list'
  | 'payment-cashless'
  | 'payment-loyalty'
  | 'loading'
  | 'success'
  | 'error'
  | null;
```

### Потоки переходов

```
[Панель кнопок (button-panel)]
  |
  |-- "Идентификация" --> loading --> guest-profile
  |                                       |
  |                                       +--> кнопки оплаты активируются на Панели
  |
  |-- "Список гостей" --> loading --> guest-list
  |                                       |
  |                                       +--> выбор гостя --> loading --> guest-profile
  |
  |-- "Cashless" --> pin-entry --> loading --> payment-cashless --> loading --> success
  |-- "Loyalty"  --> pin-entry --> loading --> payment-loyalty  --> loading --> success
  |-- "Comp"     --> pin-entry --> loading --> payment-loyalty  --> loading --> success
  |
  |-- (любая ошибка на любом шаге) --> error
```

---

## 5. Детальное описание каждого диалога

### 5.1. Панель кнопок на экране заказа (button-panel)

Это **НЕ модалка**, а встроенная панель на экране-каталоге прототипа. Отображает набор кнопок, имитируя панель плагина на экране заказа iikoFront.

#### Layout

Горизонтальная полоса с кнопками. Фон `bg-[#2d2d2d]`, padding `p-4`, `rounded-lg`.

#### Элементы

| Кнопка | Иконка (Lucide) | Текст | Состояние по умолчанию | Действие |
|--------|----------------|-------|----------------------|----------|
| Идентификация | `scan-line` | Идентификация | Активна | Открывает loading, затем guest-profile |
| Cashless | `wallet` | Cashless | Неактивна (пока гость не идентифицирован) | Открывает pin-entry |
| Loyalty | `star` | Loyalty | Неактивна | Открывает pin-entry |
| Comp | `gift` | Comp | Неактивна | Открывает pin-entry |
| Список гостей | `users` | Список гостей | Активна | Открывает loading, затем guest-list |

#### Стили кнопок

- Активная кнопка: `bg-[#1a1a1a] text-white hover:bg-[#252525] h-14 rounded px-6`
- Неактивная кнопка: `bg-[#1a1a1a] text-gray-600 opacity-50 cursor-not-allowed h-14 rounded px-6`
- Кнопки Cashless / Loyalty / Comp имеют цветные акценты:
  - Cashless (активна): `bg-[#2e7d32] text-white hover:bg-[#388e3c]`
  - Loyalty (активна): `bg-[#1565c0] text-white hover:bg-[#1976d2]`
  - Comp (активна): `bg-[#6a1b9a] text-white hover:bg-[#7b1fa2]`

#### 3 состояния панели

| Состояние | Визуально |
|-----------|----------|
| Гость не идентифицирован | Кнопки Cashless, Loyalty, Comp неактивны (`opacity-50`). Над панелью текст: "Гость не идентифицирован" (`text-sm text-gray-400`) |
| Гость идентифицирован | Все кнопки активны. Над панелью: имя гостя + статус лояльности с цветной меткой. Например: "Иванов Иван Иванович" + badge "GOLD" с золотым фоном |
| MGS недоступен | Все кнопки заблокированы. Над панелью: предупреждение "MGS недоступен" (`text-sm text-red-400`) с иконкой `wifi-off` |

---

### 5.2. Окно профиля гостя (guest-profile)

**Размер модалки:** LG (600px)

#### Header

```
Заголовок: "Профиль гостя"  (text-2xl text-[#b8c959] text-center)
Подзаголовок: "Информация о госте казино"  (text-base text-gray-300 text-center)
```

#### Body

Состоит из 3 блоков:

**Блок 1: Основная информация (верхняя часть)**

Layout: `flex gap-6` - фото слева, данные справа.

Левая колонка:
- Фото гостя: `w-32 h-32 rounded-lg object-cover bg-[#2d2d2d]` (заглушка: иконка `user` размером 48 в круге)

Правая колонка (карточки `bg-white text-black p-3 rounded`):

| Поле | Значение в мок-данных | Формат |
|------|----------------------|--------|
| ФИО | Иванов Иван Иванович | `text-lg font-semibold text-black` |
| Статус | GOLD | Badge с цветным фоном. Цвет из данных гостя (`color: #FFD700`). `px-3 py-1 rounded-full text-sm font-bold` |
| Customer ID | CID-00847 | `text-sm text-gray-600` |
| Номер карты | 4590 1234 5678 | `text-sm text-gray-600` |
| Дата рождения | 15.03.1985 | `text-sm text-gray-600` |

**Блок 2: Балансы (акцентная секция)**

Секция `bg-[#b8c959]/20 border border-[#b8c959] rounded p-5`.

Layout: grid 3 колонки (`grid grid-cols-3 gap-4`), каждая колонка - блок баланса:

| Колонка | Label | Значение (мок) | Стиль значения |
|---------|-------|---------------|---------------|
| Кэш-поинты | Cashless | 15 250 | `text-2xl font-bold text-[#b8c959]` |
| Лояльность | Loyalty | 3 800 | `text-2xl font-bold text-[#b8c959]` |
| Комплимент | Comp | 1 200 | `text-2xl font-bold text-[#b8c959]` |

Под значением - `text-xs text-gray-400` с label.

**Блок 3: Детализация баллов лояльности**

Таблица в секции `bg-[#2d2d2d] rounded p-4`:

| Тип баллов (point_name) | Баланс (point_sum) |
|--------------------------|--------------------|
| Gaming Points | 2 500 |
| Dining Points | 800 |
| Event Points | 500 |

Строки: `flex justify-between py-2 border-b border-gray-600 last:border-0`.
Названия - `text-sm text-gray-300`, суммы - `text-sm font-semibold text-white`.

#### Footer

```html
<div class="grid grid-cols-2 gap-3">
  <button>Закрыть</button>       <!-- bg-[#1a1a1a] -->
  <button>К оплате</button>      <!-- bg-[#b8c959] text-black font-bold -->
</div>
```

Кнопка "К оплате" ведёт на pin-entry (если нет токена) или payment-cashless.

#### 4 состояния

| Состояние | Содержимое Body |
|-----------|----------------|
| Загрузка | Спиннер по центру (`loader-2 animate-spin text-gray-400 size-48`) + "Загрузка профиля..." |
| Данные получены | Полный профиль (описан выше) |
| Гость не найден | Иконка-статус `alert-circle` оранжевая + "Гость не найден" + кнопка "Закрыть" |
| Ошибка | Иконка-статус `wifi-off` красная + "Не удалось загрузить данные" + кнопка "Повторить" + "Закрыть" |

---

### 5.3. Диалог ввода PIN-кода (pin-entry)

**Размер модалки:** MD (500px)

#### Header

```
Заголовок: "Авторизация гостя"  (text-2xl text-[#b8c959] text-center)
Подзаголовок: "Введите PIN-код для подтверждения операции"  (text-base text-gray-300 text-center)
```

#### Body

**Имя гостя** - `text-center text-white font-semibold mb-4`: "Иванов Иван Иванович"

**Поле ввода PIN-кода** (акцентный инпут):
```html
<input type="password"
  class="w-full h-14 text-2xl text-center tracking-[0.5em]
         bg-[#b8c959]/20 border border-[#b8c959] text-white
         rounded px-4 outline-none"
  placeholder="----"
  maxlength="8" />
```

**Цифровая клавиатура (numpad):**

Стандартный numpad из STYLE_GUIDE: `grid grid-cols-3 gap-2`, кнопки `h-16`, порядок `['1','2','3','4','5','6','7','8','9','<-','0','X']`.

#### Footer

```html
<div class="grid grid-cols-2 gap-3">
  <button>Отмена</button>           <!-- bg-[#1a1a1a] -->
  <button>Подтвердить</button>      <!-- bg-[#b8c959] text-black font-bold, disabled пока PIN пуст -->
</div>
```

#### 4 состояния

| Состояние | Содержимое |
|-----------|-----------|
| Ожидание ввода | Numpad активен, поле пустое, кнопка "Подтвердить" disabled (`opacity-50`) |
| PIN введён | Кнопка "Подтвердить" активна (`bg-[#b8c959]`) |
| Проверка | Numpad заблокирован, спиннер на кнопке "Подтвердить", текст "Проверка..." |
| Ошибка PIN | Info-баннер красный: "Неверный PIN-код. Попробуйте ещё раз." Поле очищается, numpad снова активен |

---

### 5.4. Окно списка гостей в казино (guest-list)

**Размер модалки:** LG (600px)

#### Header

```
Заголовок: "Гости в казино"  (text-2xl text-[#b8c959] text-center)
Подзаголовок: "Выберите гостя для идентификации"  (text-base text-gray-300 text-center)
```

#### Body

Список/таблица гостей. Каждая строка - кликабельная карточка:

```html
<div class="space-y-2 max-h-[400px] overflow-y-auto">
  <!-- Строка гостя -->
  <button class="w-full flex items-center gap-4 p-4 bg-[#2d2d2d] rounded
                  hover:bg-[#353535] transition-colors text-left">
    <!-- Цветной индикатор статуса -->
    <div class="w-3 h-3 rounded-full" [style.background]="guest.color"></div>
    <!-- ФИО -->
    <div class="flex-1">
      <p class="text-base font-medium text-white">Иванов Иван Иванович</p>
      <p class="text-sm text-gray-400">CID-00847</p>
    </div>
    <!-- Badge статуса -->
    <span class="px-3 py-1 rounded-full text-xs font-bold"
          [style.background]="guest.color + '33'"
          [style.color]="guest.color">
      GOLD
    </span>
  </button>
</div>
```

#### Мок-данные (5 гостей)

| ФИО | Customer ID | Статус | Цвет |
|-----|-------------|--------|------|
| Иванов Иван Иванович | CID-00847 | GOLD | #FFD700 |
| Петрова Елена Сергеевна | CID-01234 | PLATINUM | #E5E4E2 |
| Сидоров Алексей Николаевич | CID-00512 | SILVER | #C0C0C0 |
| Козлова Мария Дмитриевна | CID-02001 | GOLD | #FFD700 |
| Волков Дмитрий Андреевич | CID-00089 | STANDARD | #4CAF50 |

#### Footer

```html
<button class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">
  Закрыть
</button>
```

Одна кнопка на всю ширину.

#### 4 состояния

| Состояние | Содержимое |
|-----------|-----------|
| Загрузка | Спиннер по центру |
| Список загружен | Список карточек (описан выше) |
| Пустой список | Иконка `users` серая + "Нет гостей в казино" |
| Ошибка | Иконка `wifi-off` + "Не удалось загрузить список" + "Повторить" |

---

### 5.5. Подтверждение оплаты кэш-поинтами (payment-cashless)

**Размер модалки:** MD (500px)

#### Header

```
Заголовок: "Оплата Cashless"  (text-2xl text-[#b8c959] text-center)
Подзаголовок: "Списание кэш-поинтов со счёта гостя"  (text-base text-gray-300 text-center)
```

#### Body

**Блок информации о госте:**

Карточка `bg-[#2d2d2d] rounded p-4 mb-4`:
```
Иванов Иван Иванович        GOLD (badge)
Баланс: 15 250               (text-[#b8c959] font-bold)
```
Layout: `flex justify-between items-center`.

**Блок ввода суммы списания:**

Секция с label "Сумма списания" (`text-sm text-gray-300`):
```html
<input type="text" readonly
  class="w-full h-14 text-2xl text-center
         bg-[#b8c959]/20 border border-[#b8c959] text-white
         rounded px-4 outline-none"
  value="2 500" />
```

Под полем - `text-xs text-gray-400`: "Доступно для списания: 15 250"

**Numpad** для ввода суммы (стандартный из STYLE_GUIDE).

**Блок итого:**

```html
<div class="bg-[#2d2d2d] rounded p-4 space-y-2">
  <div class="flex justify-between text-base">
    <span class="text-gray-300">Сумма заказа:</span>
    <span class="font-semibold text-white">4 200</span>
  </div>
  <div class="flex justify-between text-base text-[#b8c959]">
    <span>Списание Cashless:</span>
    <span class="font-semibold">-2 500</span>
  </div>
  <div class="h-px bg-gray-600 my-2"></div>
  <div class="flex justify-between text-xl font-bold">
    <span class="text-white">Остаток к оплате:</span>
    <span class="text-[#b8c959]">1 700</span>
  </div>
</div>
```

#### Footer

```html
<div class="grid grid-cols-2 gap-3">
  <button>Отмена</button>                              <!-- bg-[#1a1a1a] -->
  <button>Списать 2 500</button>                       <!-- bg-[#b8c959] text-black font-bold -->
</div>
```

Кнопка "Списать" disabled, если сумма = 0 или превышает баланс.

---

### 5.6. Подтверждение оплаты баллами лояльности (payment-loyalty)

**Размер модалки:** MD (500px)

#### Header

```
Заголовок: "Оплата Loyalty"  (text-2xl text-[#b8c959] text-center)
Подзаголовок: "Списание баллов лояльности"  (text-base text-gray-300 text-center)
```

> При оплате Comp - заголовок: "Оплата Comp", подзаголовок: "Списание комплиментарных баллов"

#### Body

**Блок информации о госте** (аналогичен payment-cashless, но с балансом лояльности).

**Выбор типа баллов** (только для Loyalty, у Comp - фиксированный тип):

Горизонтальные кнопки-табы:
```html
<div class="flex gap-2 mb-4">
  <button class="flex-1 h-10 rounded text-sm
                 bg-[#b8c959] text-black font-bold">
    Gaming Points (2 500)
  </button>
  <button class="flex-1 h-10 rounded text-sm
                 bg-[#1a1a1a] text-white hover:bg-[#252525]">
    Dining Points (800)
  </button>
  <button class="flex-1 h-10 rounded text-sm
                 bg-[#1a1a1a] text-white hover:bg-[#252525]">
    Event Points (500)
  </button>
</div>
```

Активный таб - акцентный (`bg-[#b8c959] text-black`), остальные - стандартные.

**Поле ввода суммы + Numpad + Блок итого** - аналогично payment-cashless (раздел 5.5).

В блоке итого строка списания: "Списание Loyalty:" (или "Списание Comp:").

#### Footer

Аналогично payment-cashless.

---

### 5.7. Загрузка (loading)

**Размер модалки:** SM (350px)
**Тема:** Светлая

Стандартный Loading-диалог из STYLE_GUIDE:
- Спиннер `loader-2 animate-spin text-gray-400 size-48`
- Текст: "Загрузка..." (`text-gray-900 text-base`)
- Закрытие: `closable="false"` (нельзя закрыть)
- Автозакрытие: через 3 секунды (для имитации в прототипе)

---

### 5.8. Успех (success)

**Размер модалки:** MD (500px)

#### Header

Иконка-статус: `check-circle-2` в круге `bg-[#b8c959]/20`, иконка `text-[#b8c959]` size 48, с `animate-pulse`.

```
Заголовок: "Операция выполнена"  (text-2xl font-semibold text-[#b8c959] text-center)
```

#### Body

Блок итого (результат операции):

```html
<div class="bg-[#2d2d2d] rounded p-4 space-y-2">
  <div class="flex justify-between text-sm">
    <span class="text-gray-300">Тип оплаты:</span>
    <span class="text-white">Cashless</span>
  </div>
  <div class="flex justify-between text-sm">
    <span class="text-gray-300">Списано:</span>
    <span class="text-white font-semibold">2 500</span>
  </div>
  <div class="flex justify-between text-sm">
    <span class="text-gray-300">Гость:</span>
    <span class="text-white">Иванов И.И.</span>
  </div>
  <div class="h-px bg-gray-600 my-2"></div>
  <div class="flex justify-between text-base font-bold">
    <span class="text-white">Остаток на счёте:</span>
    <span class="text-[#b8c959]">12 750</span>
  </div>
</div>
```

#### Footer

```html
<button class="w-full h-14 bg-[#b8c959] text-black rounded font-bold hover:bg-[#c5d466]">
  Готово
</button>
```

Одна кнопка на всю ширину. Закрывает диалог и возвращает к панели кнопок.

---

### 5.9. Ошибка (error)

**Размер модалки:** MD (500px)

#### Header

Иконка-статус: `alert-circle` в круге `bg-red-500/20`, иконка `text-red-400` size 48.

```
Заголовок: "Ошибка"  (text-2xl font-semibold text-red-400 text-center)
```

#### Body

Описание ошибки - по центру, `text-sm text-gray-300`:

Варианты текстов (переключаемые, для демонстрации):
- "Не удалось выполнить операцию. Проверьте подключение к MGS и повторите попытку."
- "Недостаточно средств на счёте гостя."
- "Счёт гостя заблокирован. Обратитесь к менеджеру казино."
- "Сервер MGS недоступен. Повторите позже."

#### Footer

```html
<div class="grid grid-cols-2 gap-3">
  <button>Закрыть</button>        <!-- bg-[#1a1a1a] -->
  <button>Повторить</button>      <!-- bg-[#1a1a1a] -->
</div>
```

---

## 6. Мок-данные

### 6.1. Основной гость (после идентификации)

```typescript
interface MockGuest {
  customer_id: string;
  forename: string;
  middlename: string;
  surname: string;
  status: string;
  color: string;         // HEX цвет статуса
  image: string;         // URL фото (placeholder)
  birthday: string;
  balance_cash: number;  // Кэш-поинты
  points: MockPoint[];   // Баллы лояльности
  comp_balance: number;  // Комплиментарные баллы
}

interface MockPoint {
  point_id: number;
  point_name: string;
  point_sum: number;
}

const MOCK_GUEST: MockGuest = {
  customer_id: 'CID-00847',
  forename: 'Иван',
  middlename: 'Иванович',
  surname: 'Иванов',
  status: 'GOLD',
  color: '#FFD700',
  image: '',
  birthday: '1985-03-15',
  balance_cash: 15250,
  points: [
    { point_id: 1, point_name: 'Gaming Points', point_sum: 2500 },
    { point_id: 2, point_name: 'Dining Points', point_sum: 800 },
    { point_id: 3, point_name: 'Event Points', point_sum: 500 },
  ],
  comp_balance: 1200,
};
```

### 6.2. Список гостей в казино

```typescript
const MOCK_GUESTS_IN_CASINO: MockGuestListItem[] = [
  { customer_id: 'CID-00847', forename: 'Иван',    middlename: 'Иванович',    surname: 'Иванов',   status: 'GOLD',     color: '#FFD700' },
  { customer_id: 'CID-01234', forename: 'Елена',   middlename: 'Сергеевна',   surname: 'Петрова',  status: 'PLATINUM', color: '#E5E4E2' },
  { customer_id: 'CID-00512', forename: 'Алексей', middlename: 'Николаевич',  surname: 'Сидоров', status: 'SILVER',   color: '#C0C0C0' },
  { customer_id: 'CID-02001', forename: 'Мария',   middlename: 'Дмитриевна',  surname: 'Козлова', status: 'GOLD',     color: '#FFD700' },
  { customer_id: 'CID-00089', forename: 'Дмитрий', middlename: 'Андреевич',   surname: 'Волков',  status: 'STANDARD', color: '#4CAF50' },
];
```

### 6.3. Контекст заказа

```typescript
const MOCK_ORDER = {
  order_total: 4200,    // Сумма заказа
  table: 'Стол 7',
  items_count: 3,
};
```

### 6.4. Форматирование

- Валюта: без символа (кэш-поинты и баллы - это не рубли, а условные единицы казино)
- Разделитель тысяч: пробел (15 250)
- Формат: `{{ value | number:'1.0-0' }}`
- Дата рождения: `DD.MM.YYYY`

---

## 7. Экран-каталог прототипа (overview)

Страница прототипа в шаблоне overview (`PluginOverviewComponent`).

### Breadcrumbs

`Прототипы / Плагины iikoFront / MGS Casino`

### Описание плагина

> Плагин интеграции iikoFront с системой управления казино MGS. Идентификация гостей, просмотр профиля и балансов, оплата заказа кэш-поинтами, баллами лояльности и комплиментарными баллами.

### Сетка диалогов (карточки для открытия)

| Карточка | Иконка | Описание |
|----------|--------|----------|
| Профиль гостя | `user` | Карточка гостя с балансами после идентификации |
| Ввод PIN-кода | `key-round` | Авторизация гостя перед платёжной операцией |
| Список гостей | `users` | Список всех гостей, находящихся в казино |
| Оплата Cashless | `wallet` | Списание кэш-поинтов со счёта гостя |
| Оплата Loyalty | `star` | Списание баллов лояльности |
| Успех | `check-circle-2` | Диалог успешного завершения операции |
| Ошибка | `alert-circle` | Диалог ошибки |
| Загрузка | `loader-2` | Индикатор загрузки |

### Демо-панель

Под сеткой карточек разместить **Панель кнопок** (button-panel) из раздела 5.1 как интерактивный элемент. Она имитирует панель на экране заказа и позволяет запускать потоки (идентификация -> профиль -> оплата).

---

## 8. Интерактивность

### 8.1. Потоки с имитацией

| Действие | Поток |
|----------|-------|
| Клик "Идентификация" на панели | loading (3 сек) --> guest-profile (с данными MOCK_GUEST) |
| Клик "К оплате" в guest-profile | pin-entry |
| Ввод PIN + "Подтвердить" | loading (3 сек) --> payment-cashless |
| Клик "Списать" в payment-cashless | loading (3 сек) --> success |
| Клик "Список гостей" | loading (3 сек) --> guest-list |
| Выбор гостя в guest-list | loading (3 сек) --> guest-profile |
| Клик "Готово" в success | диалог закрывается, возврат к overview + панели |

### 8.2. Numpad в диалогах

Numpad в pin-entry и payment-cashless/loyalty ДОЛЖЕН работать:
- Клик на цифру - добавляет символ в поле
- `<-` - удаляет последний символ
- `X` - очищает поле

### 8.3. Переключение состояний

В каждом диалоге добавить **скрытый переключатель состояний** (маленькие кнопки в правом верхнем углу модалки, `text-xs text-gray-600`):

```html
<div class="absolute top-2 right-2 flex gap-1">
  <button class="text-xs text-gray-600 hover:text-gray-400 px-1"
          (click)="state = 'loading'">L</button>
  <button class="text-xs text-gray-600 hover:text-gray-400 px-1"
          (click)="state = 'data'">D</button>
  <button class="text-xs text-gray-600 hover:text-gray-400 px-1"
          (click)="state = 'error'">E</button>
  <button class="text-xs text-gray-600 hover:text-gray-400 px-1"
          (click)="state = 'empty'">0</button>
</div>
```

Это позволяет демонстрировать все состояния диалога без перезагрузки.

---

## 9. Регистрация в реестре прототипов

```typescript
// prototypes.registry.ts
{
  slug: 'mgs-casino',
  name: 'MGS Casino',
  description: 'Интеграция iikoFront с системой управления казино MGS',
  category: 'Плагины iikoFront',
  icon: 'scan-line',
  tags: ['POS', 'казино', 'лояльность', 'оплата'],
}
```

---

## 10. Чеклист

### Структура

- [ ] Папка `src/app/prototypes/mgs-casino/` создана
- [ ] Файл маршрутов `mgs-casino.routes.ts`
- [ ] Корневой компонент `mgs-casino-prototype.component.ts`
- [ ] Типы `types.ts`
- [ ] Мок-данные `data/mock-data.ts`
- [ ] `PosDialogComponent` импортирован
- [ ] Зарегистрирован в `app.routes.ts`
- [ ] Зарегистрирован в `prototypes.registry.ts`

### Диалоги (9 штук)

- [ ] `button-panel` - панель кнопок (встроенная, не модалка)
- [ ] `guest-profile` - профиль гостя (LG, 4 состояния)
- [ ] `pin-entry` - ввод PIN-кода (MD, 4 состояния, numpad)
- [ ] `guest-list` - список гостей (LG, 4 состояния)
- [ ] `payment-cashless` - оплата кэш-поинтами (MD, numpad, блок итого)
- [ ] `payment-loyalty` - оплата баллами (MD, табы типов, numpad, блок итого)
- [ ] `loading` - загрузка (SM, светлая тема, автозакрытие 3 сек)
- [ ] `success` - успех (MD, иконка + итоги)
- [ ] `error` - ошибка (MD, варианты текстов)

### Интерактивность

- [ ] Панель кнопок переключает 3 состояния (без гостя / с гостем / MGS недоступен)
- [ ] Numpad работает в pin-entry и payment-*
- [ ] Потоки навигации между диалогами работают
- [ ] Loading автозакрытие 3 сек
- [ ] Переключатели состояний в каждом диалоге
- [ ] Escape закрывает модалки
- [ ] Overlay-клик закрывает модалки (кроме loading)
