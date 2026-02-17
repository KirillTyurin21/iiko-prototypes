# Промт-патч v1.4: Модальное окно выбора робота (П1), экран статусов, обновлённые уведомления

---
**Версия**: 1.4
**Дата**: 2026-02-16
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч (Промт-патч для добавления П1, П7, обновления уведомлений, смешанной уборки)
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront.md (v1.0, 2026-02-11)
**Зависимость**: Промт v1.1 → v1.2 → v1.3 → **v1.4** (этот файл). Применять строго после v1.3.
**Источники**: SPEC-003 v1.10.1 (2026-02-16) — разделы 10.1 (П1), 10.2 (П7), 9.4a (повторные уведомления), 5.7 (смешанная уборка), 2.4.6 (robots/available); План дополнения спецификаций v3.1 (Этап Э8.2)
---

## Назначение

Этот документ — **дельта-патч v1.4** к промту v1.0 (с учётом ранее применённых v1.1, v1.2, v1.3). Он добавляет:

1. **Модальное окно выбора робота (П1)** — М17: таблица роботов со статусами, обязательно для маркетинга
2. **Экран быстрого просмотра статусов роботов (П7)** — М18: информационный виджет
3. **Обновлённую логику уведомлений** — расширение `persistent_repeating` на все неустранённые ошибки (не только E-STOP)
4. **Смешанный режим уборки** — видимость кнопки + дедупликация
5. **Кнопку «Статус роботов» в контексте главного экрана** — дополнение D1 из v1.1
6. **Fire-and-forget flow отправки задач** — замена цепочки M9→M10 на inline-спиннер + toast; deprecation модалок loading/success
7. **Уведомления жизненного цикла задач** — toast «Отправлено» (dispatched) + toast «Завершено» (completed, настраиваемый); mock `generalSettings`

**Порядок применения патчей**:
```
v1.0 (базовый промт) → v1.1 (контексты, М12, E-STOP) → v1.2 (каталог ячеек) → v1.3 (синхронизация данных, send_dish) → v1.4 (этот файл: П1, П7, уведомления, смешанная уборка, fire-and-forget, lifecycle-toast)
```

---

## Сводка изменений (v1.4)

| #   | Раздел / Компонент              | Изменение                                                                                                                                                                                                                                                                                | Тип               | Визуальный импакт                                                                |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| H1  | State-машина                    | Добавлены 2 типа модалок: `robot_select`, `robot_status`                                                                                                                                                                                                                                 | Навигация         | **Да**: 2 новых модальных окна                                                   |
| H2  | М17 (robot_select)              | Модальное окно выбора робота (П1): таблица, сортировка, предупреждение для занятых                                                                                                                                                                                                       | **Визуальное**    | **Да**: полноценная таблица со статусами                                         |
| H3  | М18 (robot_status)              | Экран быстрого просмотра статусов (П7): read-only таблица, кнопка «Обновить»                                                                                                                                                                                                             | **Визуальное**    | **Да**: информационный виджет                                                    |
| H4  | Контекст «Главный экран»        | Добавлена кнопка «Статус роботов» + изменена логика кнопки «Маркетинг» (через П1)                                                                                                                                                                                                        | **Визуальное**    | **Да**: 3 кнопки вместо 2 на главном экране                                      |
| H5  | Уведомления                     | Расширение `persistent_repeating` на 4 типа ошибок; алгоритм повторных уведомлений; `dismissed_errors` storage                                                                                                                                                                           | Данные/Логика     | **Да**: уведомления переоткрываются при неустранённых ошибках                    |
| H6  | Смешанная уборка                | `cleanup_mode: "mixed"` — кнопка + авто, дедупликация задач                                                                                                                                                                                                                              | Логика            | **Да**: условная видимость кнопки «Уборка» + toast дедупликации                  |
| H7  | Mock-данные                     | `mockRobots` расширен до 4 роботов с разными статусами; `dismissed_errors` Map                                                                                                                                                                                                           | Данные            | Нет (входные данные для логики)                                                  |
| H8  | Каталог ячеек (v1.2)            | Добавлены 8 ячеек: М17 ×4 состояния, М18, toast E-STOP repeating, toast OBSTACLE repeating, toast дедупликации                                                                                                                                                                           | **Визуальное**    | **Да**: новые ячейки в каталоге                                                  |
| H9  | Сценарные цепочки (v1.2)        | Добавлены 8 цепочек: marketing-with-select, marketing-select-busy, marketing-select-all-offline, marketing-select-error, robot-status-view, notification-repeating-estop, notification-repeating-obstacle, cleanup-dedup                                                                 | Навигация         | Да: демо-потоки П1, П7, уведомлений и дедупликации                               |
| H10 | Flow отправки (fire-and-forget) | `submitTask()`: кнопка disabled + inline-спиннер → toast → null. [DEPRECATED]: M9 (`loading`), M10 (`success`). Затронуты: М1, М2, М12, М14, М16, send_dish-quick                                                                                                                        | Навигация/Логика  | **Да**: убраны 2 промежуточных модалки, добавлен inline-спиннер                  |
| H11 | Уведомления жизненного цикла    | Toast `dispatched` (акцентный `#b8c959`, для ручных — всегда). Toast `completed` (зелёный `green-600`, настраиваемый `show_success_notifications`, дефолт `false`). Интеграция с `poll_cycle()` и `confirmRobotSelection()` (marketing)                                                  | Визуальное/Данные | **Да**: 2 новых toast-уведомления, mock `generalSettings`, fallback стекирования |
| H12 | Позиция уведомлений: top-left   | Все toast-уведомления перенесены из `bottom-6 right-6` → `top-6 left-6`. Flex-контейнер для стека (`flex flex-col space-y-2`), до 3 toast'ов сверху вниз. Обновлены: error (H5), info (H6), dispatched (H11), completed (H11). Исключение: М15 (`top-4 left-4 right-4` — баннер раздачи) | Визуальное        | **Да**: все toast'ы переехали в верхний левый угол, единый flex-стек             |
| H13 | Время жизни: до крестика        | Все toast и модалки-результаты — persistent до ручного закрытия. Убран авто-dismiss М5 (`qr_success`, 3 сек → persistent). М10 [DEPRECATED] — неактуально. Остальные уже persistent                                                                                                      | Логика            | **Нет** (поведенческое): М5 больше не закрывается автоматически                  |
| H14 | Каталог + цепочки (v1.2 update) | +6 ячеек каталога (dispatched ×4, completed ×1, button-submitting ×1). M9/M10 → `[DEPRECATED]` в каталоге. 6 цепочек обновлены (fire-and-forget). +2 новые цепочки (`task-completed-polling`, `fire-and-forget-full`). `ScenarioStep` расширен полями `toast`/`toastText`                | Навигация/Данные  | **Да**: новые ячейки каталога, обновлённые демо-цепочки                          |

---

## H1. Обновление State-машины

> **Источник**: SPEC-003 v1.10.1, разделы 10.1 (П1) и 10.2 (П7)

### ОБНОВИТЬ: `PuduModalType` (раздел 2.2 / types.ts)

Добавить новые типы модалок:

```typescript
type PuduModalType =
  // ... все существующие из v1.0–v1.3 (кроме помеченных ниже) ...
  | 'loading'                  // [DEPRECATED v1.4 H10] — заменён inline-спиннером на кнопке
  | 'success'                  // [DEPRECATED v1.4 H10] — заменён toast 'dispatched' (H11)
  | 'robot_select'             // NEW v1.4 (H1): П1 — Выбор робота (для маркетинга)
  | 'robot_status'             // NEW v1.4 (H1): П7 — Быстрый просмотр статусов роботов
  | null;
```

### ОБНОВИТЬ: Карту переходов (раздел 2.3)

**ДОБАВИТЬ** ветки для П1 и П7:

```
Главный экран (context === 'main', activeModal = null)
│
├── Клик «Маркетинг» ─►                          // ИЗМЕНЕНО v1.4 (H4): теперь через П1
│   └── activeModal = 'robot_select'
│       │
│       ├── Выбран робот (free/busy) → «Выбрать»
│       │   ├── Робот free ──► toggle isCruiseActive → null
│       │   └── Робот busy ──► toast «Робот занят. Задача будет поставлена в очередь»
│       │                       → toggle isCruiseActive → null
│       ├── Все offline ──► кнопка «Выбрать» disabled
│       ├── Нет роботов ──► empty state: «Нет зарегистрированных роботов»
│       ├── API ошибка ──► empty state: «Не удалось загрузить» + «Повторить»
│       └── «Отмена» ──► null
│
├── Клик «Уборка (выбор столов)» ─►
│   └── ... (без изменений, из v1.1)
│
└── Клик «Статус роботов» ─►                      // NEW v1.4 (H4)
    └── activeModal = 'robot_status'
        │
        ├── «Обновить» ──► повторный GET /v1/robots/available
        └── «✕» или тап вне окна ──► null
```

---

## H2. Модальное окно М17 — Выбор робота (robot_select) [П1]

> **Источник**: SPEC-003 v1.10.1, раздел 10.1

**Приоритет**: **Must** | **Размер**: LG (600px) | **Тема**: Тёмная

**Контекст использования**: Для `marketing` — **обязателен** (`robot_id` required). Для остальных — NE назначает робота автоматически.

### Макет

```
┌──────────────────────────────────────────────────────────────┐
│  bg-[#3a3a3a] rounded-lg p-8 max-w-[600px]                  │
│                                                               │
│  Выбор робота                                                │
│  text-2xl font-normal text-[#b8c959] text-center             │
│                                                               │
│  Выберите робота для маркетингового круиза                   │
│  text-base text-center text-gray-300 mb-6                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ bg-[#2d2d2d] rounded                                     ││
│  │ ┌──────────┬─────────────┬────────────┬────────────────┐ ││
│  │ │Имя робота│ ID          │ Статус     │ Задача         │ ││
│  │ │ text-xs  │ text-xs     │ text-xs    │ text-xs        │ ││
│  │ │ gray-400 │ gray-400    │ gray-400   │ gray-400       │ ││
│  │ ├──────────┼─────────────┼────────────┼────────────────┤ ││
│  │ │BellaBot-1│ PD202406..  │ [*]Свободен│ —              │ ││  ← кликабельная, hover:bg-[#252525]
│  │ │BellaBot-2│ PD202406..  │ [*]Свободен│ —              │ ││  ← кликабельная
│  │ │Ketty-01  │ PD202408..  │ [*]Занят   │ send_menu      │ ││  ← кликабельная, текст gray-400
│  │ │Ketty-02  │ PD202408..  │ [*]Оффлайн │ —              │ ││  ← disabled, opacity-40
│  │ └──────────┴─────────────┴────────────┴────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  [  Выбрано: BellaBot-1  ]  text-sm text-[#b8c959]          │
│                                                               │
│  ┌────────────────────────┐ ┌────────────────────────┐       │
│  │       Отмена           │ │       Выбрать          │       │
│  │  bg-[#1a1a1a] h-14     │ │  bg-[#1a1a1a] h-14     │       │
│  └────────────────────────┘ └────────────────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### HTML-разметка

```html
<!-- М17: Выбор робота (robot_select) -->
<pos-dialog [open]="activeModal === 'robot_select'" maxWidth="lg">
  <!-- Header -->
  <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">
    Выбор робота
  </h2>
  <p class="text-base text-center text-gray-300 mb-6">
    Выберите робота для маркетингового круиза
  </p>

  <!-- Таблица роботов -->
  <div class="bg-[#2d2d2d] rounded overflow-hidden mb-4">

    <!-- Заголовок таблицы -->
    <div class="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-600">
      <span class="text-xs text-gray-400 font-medium">Имя робота</span>
      <span class="text-xs text-gray-400 font-medium">ID</span>
      <span class="text-xs text-gray-400 font-medium">Статус</span>
      <span class="text-xs text-gray-400 font-medium">Задача</span>
    </div>

    <!-- Строки роботов -->
    <div *ngFor="let robot of sortedRobots"
         (click)="robot.status !== 'offline' && selectRobot(robot)"
         [ngClass]="{
           'hover:bg-[#252525] cursor-pointer': robot.status !== 'offline',
           'opacity-40 cursor-not-allowed': robot.status === 'offline',
           'bg-[#b8c959]/10 border-l-2 border-[#b8c959]': selectedRobot?.robot_id === robot.robot_id
         }"
         class="grid grid-cols-4 gap-2 px-4 py-3 border-b border-gray-600/30 transition-colors">

      <!-- Имя робота -->
      <span class="text-sm font-medium"
            [ngClass]="{
              'text-gray-500': robot.status === 'offline',
              'text-gray-400': robot.status === 'busy',
              'text-white': robot.status === 'free'
            }">
        {{ robot.robot_name }}
      </span>

      <!-- ID (обрезанный) -->
      <span class="text-sm text-gray-400 truncate" [title]="robot.robot_id">
        {{ robot.robot_id | slice:0:12 }}...
      </span>

      <!-- Статус с цветовым индикатором -->
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full"
              [ngClass]="{
                'bg-green-500': robot.status === 'free',
                'bg-orange-500': robot.status === 'busy',
                'bg-gray-500': robot.status === 'offline'
              }"></span>
        <span class="text-sm"
              [ngClass]="{
                'text-green-400': robot.status === 'free',
                'text-orange-400': robot.status === 'busy',
                'text-gray-500': robot.status === 'offline'
              }">
          {{ robot.status === 'free' ? 'Свободен' : robot.status === 'busy' ? 'Занят' : 'Оффлайн' }}
        </span>
      </div>

      <!-- Задача -->
      <span class="text-sm"
            [ngClass]="robot.current_task ? 'text-gray-300' : 'text-gray-500'">
        {{ robot.current_task?.task_type || '—' }}
        <span *ngIf="robot.current_task?.target_point" class="text-gray-500">
          → {{ formatPointName(robot.current_task.target_point) }}
        </span>
      </span>
    </div>
  </div>

  <!-- Индикатор выбранного робота -->
  <p *ngIf="selectedRobot" class="text-sm text-[#b8c959] text-center mb-4">
    Выбрано: <span class="font-medium">{{ selectedRobot.robot_name }}</span>
  </p>

  <!-- Предупреждение: робот занят -->
  <div *ngIf="selectedRobot?.status === 'busy'"
       class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4 mb-4">
    <lucide-icon name="alert-circle" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
    <div>
      <p class="text-sm text-white font-medium mb-1">Робот занят</p>
      <p class="text-sm text-gray-300">Задача будет поставлена в очередь и выполнена после завершения текущей.</p>
    </div>
  </div>

  <!-- Пустое состояние: нет роботов -->
  <div *ngIf="sortedRobots.length === 0 && !robotsLoading && !robotsError"
       class="flex flex-col items-center text-center space-y-3 py-8">
    <div class="rounded-full bg-gray-600/30 p-6">
      <lucide-icon name="bot" [size]="48" class="text-gray-400"></lucide-icon>
    </div>
    <p class="text-sm text-gray-300">Нет зарегистрированных роботов.</p>
    <p class="text-xs text-gray-400">Настройте роботов в <span class="text-[#b8c959]">iiko Web → Роботы PUDU</span>.</p>
  </div>

  <!-- Пустое состояние: все offline -->
  <div *ngIf="sortedRobots.length > 0 && allRobotsOffline && !robotsLoading"
       class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4 mb-4">
    <lucide-icon name="wifi-off" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
    <p class="text-sm text-gray-300">Нет доступных роботов. Все роботы offline.</p>
  </div>

  <!-- Ошибка загрузки -->
  <div *ngIf="robotsError"
       class="flex flex-col items-center text-center space-y-3 py-8">
    <div class="rounded-full bg-red-500/20 p-6">
      <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
    </div>
    <p class="text-sm text-gray-300">Не удалось загрузить список роботов.</p>
    <button (click)="loadRobots()"
            class="text-sm text-[#b8c959] hover:underline">
      Повторить
    </button>
  </div>

  <!-- Загрузка -->
  <div *ngIf="robotsLoading"
       class="flex flex-col items-center text-center space-y-3 py-8">
    <lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
    <p class="text-sm text-gray-400">Загрузка списка роботов...</p>
  </div>

  <!-- Footer -->
  <div class="grid grid-cols-2 gap-3 mt-6">
    <button (click)="activeModal = null; selectedRobot = null"
      class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
      aria-label="Отмена выбора робота">
      Отмена
    </button>
    <button (click)="confirmRobotSelection()"
      [disabled]="!selectedRobot || selectedRobot.status === 'offline'"
      [ngClass]="!selectedRobot || selectedRobot.status === 'offline'
        ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#252525]'"
      class="h-14 bg-[#1a1a1a] text-white border-none rounded font-medium transition-colors"
      aria-label="Подтвердить выбор робота">
      Выбрать
    </button>
  </div>
</pos-dialog>
```

### Логика компонента (TypeScript)

```typescript
// === Выбор робота (v1.4 H2) ===

// Данные из mock / API
selectedRobot: AvailableRobot | null = null;
robotsLoading = false;
robotsError = false;

get sortedRobots(): AvailableRobot[] {
  // Сортировка: free → busy → offline
  const order = { free: 0, busy: 1, offline: 2 };
  return [...this.availableRobots].sort((a, b) => order[a.status] - order[b.status]);
}

get allRobotsOffline(): boolean {
  return this.availableRobots.every(r => r.status === 'offline');
}

selectRobot(robot: AvailableRobot): void {
  if (robot.status === 'offline') return;
  this.selectedRobot = robot;
}

/**
 * Преобразует техническое название точки (TABLE_5, KITCHEN, CRUISE_1)
 * в человекочитаемый формат (С.5, Кухня, Круиз 1)
 */
formatPointName(raw: string): string {
  if (raw.startsWith('TABLE_')) return `С.${raw.replace('TABLE_', '')}`;
  if (raw === 'KITCHEN') return 'Кухня';
  if (raw === 'CHARGE') return 'Зарядка';
  if (raw === 'WASHING') return 'Мойка';
  if (raw === 'HOST') return 'Хостес';
  if (raw.startsWith('CRUISE_')) return `Круиз ${raw.replace('CRUISE_', '')}`;
  return raw; // fallback — вернуть как есть
}

async loadRobots(): Promise<void> {
  this.robotsLoading = true;
  this.robotsError = false;
  // Mock: имитация GET /v1/robots/available (1.5 сек)
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Mock-данные (см. H7)
  this.availableRobots = mockAvailableRobots;
  this.robotsLoading = false;
}

confirmRobotSelection(): void {
  if (!this.selectedRobot || this.selectedRobot.status === 'offline') return;

  // Для маркетинга: передать robot_id и запустить круиз
  if (this.selectedRobot.status === 'busy') {
    this.showToast('info', 'Робот занят. Задача будет поставлена в очередь.');
  }

  this.marketingRobotId = this.selectedRobot.robot_id;
  this.isCruiseActive = !this.isCruiseActive;
  this.activeModal = null;
  this.selectedRobot = null;
}
```

### Сортировка строк таблицы

| Приоритет | Группа    | Визуальный стиль                                 | Кликабельность                        |
| --------- | --------- | ------------------------------------------------ | ------------------------------------- |
| 1 (верх)  | `free`    | Текст `text-white`, индикатор `bg-green-500`     | **Да**                                |
| 2         | `busy`    | Текст `text-gray-400`, индикатор `bg-orange-500` | **Да** (с предупреждением при выборе) |
| 3 (низ)   | `offline` | Текст `text-gray-500`, `opacity-40`              | **Нет** (disabled)                    |

### Граничные случаи (демо-реализация)

| Ситуация                  | Поведение в прототипе                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Все роботы offline        | Показать orange-баннер «Нет доступных роботов. Все роботы offline.» Кнопка «Выбрать» неактивна                    |
| Нет зарегистрированных    | Показать empty state: иконка `bot`, «Нет зарегистрированных роботов. Настройте роботов в iiko Web → Роботы PUDU.» |
| API NE недоступен         | Показать error state: иконка `alert-circle`, «Не удалось загрузить список роботов.» + кнопка «Повторить»          |
| Единственный `free` робот | Окно отображается полноценно (авто-выбор — зарезервирован на будущее)                                             |

---

## H3. Модальное окно М18 — Быстрый просмотр статусов роботов (robot_status) [П7]

> **Источник**: SPEC-003 v1.10.1, раздел 10.2

**Приоритет**: **Should** | **Размер**: LG (600px) | **Тема**: Тёмная

**Точка входа**: Главный экран → кнопка «Статус роботов» (в панели кнопок PUDU)

**Отличие от П1**: **Только просмотр** — без возможности выбора робота. Нет footer-кнопок кроме закрытия.

### HTML-разметка

```html
<!-- М18: Быстрый просмотр статусов роботов (robot_status) -->
<pos-dialog [open]="activeModal === 'robot_status'" maxWidth="lg">
  <!-- Header -->
  <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">
    Статус роботов
  </h2>
  <p class="text-base text-center text-gray-300 mb-6">
    Текущее состояние всех роботов ресторана
  </p>

  <!-- Таблица роботов (read-only) -->
  <div class="bg-[#2d2d2d] rounded overflow-hidden mb-4">

    <!-- Заголовок таблицы -->
    <div class="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-600">
      <span class="text-xs text-gray-400 font-medium">Имя робота</span>
      <span class="text-xs text-gray-400 font-medium">ID</span>
      <span class="text-xs text-gray-400 font-medium">Статус</span>
      <span class="text-xs text-gray-400 font-medium">Текущая задача</span>
    </div>

    <!-- Строки роботов (read-only, без hover-курсора) -->
    <div *ngFor="let robot of sortedRobots"
         class="grid grid-cols-4 gap-2 px-4 py-3 border-b border-gray-600/30">

      <!-- Имя робота -->
      <span class="text-sm font-medium"
            [ngClass]="robot.status === 'offline' ? 'text-gray-500' : 'text-white'">
        {{ robot.robot_name }}
      </span>

      <!-- ID (обрезанный) -->
      <span class="text-sm text-gray-400 truncate" [title]="robot.robot_id">
        {{ robot.robot_id | slice:0:12 }}...
      </span>

      <!-- Статус с цветовым индикатором -->
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full"
              [ngClass]="{
                'bg-green-500': robot.status === 'free',
                'bg-orange-500': robot.status === 'busy',
                'bg-gray-500': robot.status === 'offline'
              }"></span>
        <span class="text-sm"
              [ngClass]="{
                'text-green-400': robot.status === 'free',
                'text-orange-400': robot.status === 'busy',
                'text-gray-500': robot.status === 'offline'
              }">
          {{ robot.status === 'free' ? 'Свободен' : robot.status === 'busy' ? 'Занят' : 'Оффлайн' }}
        </span>
      </div>

      <!-- Текущая задача -->
      <span class="text-sm"
            [ngClass]="robot.current_task ? 'text-gray-300' : 'text-gray-500'">
        {{ robot.current_task?.task_type || '—' }}
        <span *ngIf="robot.current_task?.target_point" class="text-gray-500">
          → {{ formatPointName(robot.current_task.target_point) }}
        </span>
      </span>
    </div>
  </div>

  <!-- Пустое состояние: нет роботов -->
  <div *ngIf="sortedRobots.length === 0 && !robotsLoading && !robotsError"
       class="flex flex-col items-center text-center space-y-3 py-8">
    <div class="rounded-full bg-gray-600/30 p-6">
      <lucide-icon name="bot" [size]="48" class="text-gray-400"></lucide-icon>
    </div>
    <p class="text-sm text-gray-300">Нет зарегистрированных роботов.</p>
    <p class="text-xs text-gray-400">Настройте роботов в <span class="text-[#b8c959]">iiko Web → Роботы PUDU</span>.</p>
  </div>

  <!-- Метка обновления + кнопка -->
  <div class="flex items-center justify-between mb-6">
    <span class="text-xs text-gray-400">
      Последнее обновление: {{ lastRobotRefresh | date:'HH:mm:ss' }}
    </span>
    <button (click)="loadRobots()" [disabled]="robotsLoading"
            class="flex items-center gap-1.5 text-sm text-[#b8c959] hover:underline disabled:opacity-40 transition-colors"
            aria-label="Обновить статусы роботов">
      <lucide-icon name="refresh-cw" [size]="14"
                   [ngClass]="robotsLoading ? 'animate-spin' : ''"></lucide-icon>
      Обновить
    </button>
  </div>

  <!-- Загрузка -->
  <div *ngIf="robotsLoading"
       class="flex items-center justify-center gap-2 py-4">
    <lucide-icon name="loader-2" [size]="20" class="text-gray-400 animate-spin"></lucide-icon>
    <span class="text-sm text-gray-400">Обновление...</span>
  </div>

  <!-- Ошибка загрузки -->
  <div *ngIf="robotsError"
       class="flex flex-col items-center text-center space-y-3 py-8">
    <div class="rounded-full bg-red-500/20 p-6">
      <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
    </div>
    <p class="text-sm text-gray-300">Не удалось загрузить статусы роботов.</p>
    <button (click)="loadRobots()"
            class="text-sm text-[#b8c959] hover:underline"
            aria-label="Повторить загрузку статусов роботов">
      Повторить
    </button>
  </div>

  <!-- Footer: одна кнопка закрытия -->
  <button (click)="activeModal = null"
    class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
    aria-label="Закрыть окно статусов роботов">
    Закрыть
  </button>
</pos-dialog>
```

### Логика компонента

```typescript
// === Просмотр статусов (v1.4 H3) ===

lastRobotRefresh: Date = new Date();

openRobotStatus(): void {
  this.activeModal = 'robot_status';
  this.loadRobots();         // refresh при каждом открытии
  this.lastRobotRefresh = new Date();
}
```

---

## H4. Обновление контекста «Главный экран»

> **Источник**: SPEC-003 v1.10.1, разделы 10.1–10.2; план Э8.2

### ИЗМЕНИТЬ: Кнопки контекста «Главный экран» (v1.1 D1)

**Было** (v1.1, D1 — 2 кнопки, `grid grid-cols-2 gap-3`):
```html
<div class="grid grid-cols-2 gap-3 p-4 border-t border-gray-600">
  <button>Маркетинг</button>
  <button>Уборка (выбор столов)</button>
</div>
```

**Стало** (v1.4 — 3 кнопки, `grid grid-cols-3 gap-3`):
```html
<div class="grid grid-cols-3 gap-3 p-4 border-t border-gray-600">
  <!-- Маркетинг: теперь через П1 (выбор робота) -->
  <button (click)="openRobotSelectForMarketing()"
    class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors"
    aria-label="Запуск маркетингового круиза">
    <lucide-icon name="radio" [size]="20"></lucide-icon>
    <span class="text-xs">Маркетинг</span>
  </button>

  <!-- Уборка: мультивыбор столов (без изменений, из v1.1) -->
  <button (click)="activeModal = 'cleanup_multi_select'"
    class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors"
    aria-label="Уборка посуды с выбором столов">
    <lucide-icon name="trash-2" [size]="20"></lucide-icon>
    <span class="text-xs">Уборка (столы)</span>
  </button>

  <!-- Статус роботов: NEW v1.4 (H4) -->
  <button (click)="openRobotStatus()"
    class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors"
    aria-label="Просмотр статусов роботов">
    <lucide-icon name="bot" [size]="20"></lucide-icon>
    <span class="text-xs">Статус роботов</span>
  </button>
</div>
```

### ИЗМЕНИТЬ: Кнопка «Маркетинг» — логика вызова

**Было** (v1.1): Кнопка «Маркетинг» → toggle `isCruiseActive` напрямую (без выбора робота).

**Стало** (v1.4): Кнопка «Маркетинг» → открывает **П1 (robot_select)** → выбор робота → toggle `isCruiseActive` с привязкой к выбранному `robot_id`.

```typescript
// v1.4: Маркетинг через окно выбора робота
openRobotSelectForMarketing(): void {
  this.robotSelectPurpose = 'marketing';    // Контекст открытия П1
  this.activeModal = 'robot_select';
  this.loadRobots();
}
```

### ОБНОВИТЬ: Данные кнопок главного экрана (v1.1)

```typescript
  // Контекст 2: Главный экран (v1.4 — 3 кнопки)
  mainContextButtons: [
    { id: 'marketing', label: 'Маркетинг', icon: 'radio', action: 'openRobotSelectForMarketing' },
    { id: 'cleanup_multi', label: 'Уборка (столы)', icon: 'trash-2', action: 'cleanup_multi_select' },
    { id: 'robot_status', label: 'Статус роботов', icon: 'bot', action: 'openRobotStatus' },  // NEW v1.4
  ],
```

### ОБНОВИТЬ: Индикатор маркетинга (раздел 3.8 базового промта)

Добавить имя робота в индикатор:

**Было** (v1.0):
```html
<span class="text-sm text-[#b8c959] font-medium">Маркетинг-круиз активен</span>
```

**Стало** (v1.4):
```html
<span class="text-sm text-[#b8c959] font-medium">
  Маркетинг-круиз активен · {{ marketingRobotName }}
</span>
```

Где `marketingRobotName` — имя робота, выбранного в П1.

---

## H5. Обновлённая логика уведомлений (persistent_repeating)

> **Источник**: SPEC-003 v1.10.1, раздел 9.4a

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

В v1.1 (D7) описан `persistent_repeating` **только** для E-STOP. В SPEC-003 v1.10.1 механизм расширен на **все неустранённые ошибки состояния робота**.

### Классификация уведомлений (обновлённая)

| error_code    | Текст уведомления                                            | Тип                      | Условие снятия                               |
| ------------- | ------------------------------------------------------------ | ------------------------ | -------------------------------------------- |
| `E_STOP`      | «Робот {name}: АВАРИЙНАЯ ОСТАНОВКА. Красная кнопка нажата»   | **persistent_repeating** | Кнопка отпущена, робот перезапущен           |
| `MANUAL_MODE` | «Робот {name}: переведён в ручной режим (открыты настройки)» | **persistent_repeating** | Настройки закрыты, робот в автономном режиме |
| `OBSTACLE`    | «Робот {name}: обнаружено препятствие на маршруте»           | **persistent_repeating** | Препятствие убрано, робот продолжил движение |
| `LOW_BATTERY` | «Робот {name}: низкий заряд батареи»                         | **persistent_repeating** | Робот на зарядке, уровень >= порога          |
| `TASK_FAILED` | «Робот {name}: ошибка выполнения задачи {task_type}»         | persistent               | Одноразовое                                  |
| `UNKNOWN`     | «Робот {name}: неизвестная ошибка. Код: {error_code}»        | persistent               | Одноразовое                                  |

### ДОБАВИТЬ: Структура данных для повторных уведомлений

```typescript
// === Повторные уведомления (v1.4 H5) ===

// Типы ошибок, которые повторяются при неустранении
const REPEATING_ERROR_CODES: string[] = ['E_STOP', 'MANUAL_MODE', 'OBSTACLE', 'LOW_BATTERY'];

// Глобальный реестр закрытых ошибок (для проверки при следующем polling)
interface DismissedError {
  robot_id: string;
  error_code: string;
  dismissed_at: Date;
}

// Map: composite_key('robot_id:error_code') → DismissedError
dismissedErrors: Map<string, DismissedError> = new Map();

// Функция ключа
function errorKey(robot_id: string, error_code: string): string {
  return `${robot_id}:${error_code}`;
}
```

### ДОБАВИТЬ: Алгоритм повторных уведомлений

```typescript
// === Алгоритм повторных уведомлений (v1.4 H5) ===

/**
 * Вызывается при получении ошибки от NE API (polling)
 */
handleErrorNotification(robot_id: string, robot_name: string, error_code: string, task_type?: string): void {
  const key = errorKey(robot_id, error_code);
  const isRepeating = REPEATING_ERROR_CODES.includes(error_code);

  // Для repeating: проверить, была ли ошибка ранее закрыта
  if (isRepeating && this.dismissedErrors.has(key)) {
    // Ошибка была закрыта, но всё ещё активна → показать снова
    this.dismissedErrors.delete(key);
  }

  // Показать уведомление (если ещё не показано)
  if (!this.activeNotifications.some(n => n.id === key)) {
    const notification: PuduNotification = {
      id: key,
      type: 'error',
      title: this.formatErrorTitle(robot_name, error_code),
      message: this.formatErrorMessage(error_code, task_type),
      timestamp: new Date(),
      dismissed: false,
      isRepeating: isRepeating
    };
    this.activeNotifications.push(notification);
  }
}

/**
 * Вызывается при закрытии уведомления пользователем
 */
dismissNotificationWithTracking(notification: PuduNotification): void {
  notification.dismissed = true;
  this.activeNotifications = this.activeNotifications.filter(n => n.id !== notification.id);

  // Для repeating: зарегистрировать в dismissedErrors
  if (notification.isRepeating) {
    const [robot_id, error_code] = notification.id.split(':');
    this.dismissedErrors.set(notification.id, {
      robot_id,
      error_code,
      dismissed_at: new Date()
    });
  }
}

/**
 * Вызывается в начале каждого poll_cycle()
 * Проверяет: если ошибка была закрыта, но всё ещё активна — показать снова
 */
checkDismissedErrors(activeErrors: Array<{ robot_id: string; error_code: string }>): void {
  for (const [key, dismissed] of this.dismissedErrors.entries()) {
    const stillActive = activeErrors.some(
      e => errorKey(e.robot_id, e.error_code) === key
    );
    if (stillActive) {
      // Ошибка не устранена — повторно показать уведомление
      const [robot_id, error_code] = key.split(':');
      const robot = this.availableRobots.find(r => r.robot_id === robot_id);
      this.handleErrorNotification(robot_id, robot?.robot_name || robot_id, error_code);
    } else {
      // Ошибка устранена — удалить из реестра
      this.dismissedErrors.delete(key);
    }
  }
}
```

### ОБНОВИТЬ: Toast-уведомление об ошибке (раздел 3.7 базового промта)

Добавить визуальную метку для повторяющихся уведомлений:

```html
<!-- Фиксированное уведомление об ошибке — дополнение v1.4 [ОБНОВЛЕНО H12: позиция top-left] -->
<div *ngIf="hasError" class="fixed top-6 left-6 z-[60] animate-slide-up">
  <div class="bg-red-500/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
    <lucide-icon name="alert-circle" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium">{{ errorTitle }}</p>
        <!-- Метка повторяющейся ошибки v1.4 -->
        <span *ngIf="notification.isRepeating"
              class="text-[10px] bg-red-700 px-1.5 py-0.5 rounded font-medium">
          ПОВТОРНО
        </span>
      </div>
      <p class="text-xs text-red-100 mt-1">{{ errorMessage }}</p>
      <!-- Подсказка для repeating ошибок v1.4 -->
      <p *ngIf="notification.isRepeating" class="text-xs text-red-200 mt-2 italic">
        Уведомление будет повторяться, пока ошибка не устранена
      </p>
    </div>
    <button (click)="dismissNotificationWithTracking(notification)"
            class="text-red-200 hover:text-white transition-colors"
            aria-label="Закрыть уведомление об ошибке">
      <lucide-icon name="x" [size]="16"></lucide-icon>
    </button>
  </div>
</div>
```

### ОБНОВИТЬ: `PuduNotification` интерфейс (types.ts)

```typescript
// v1.4: Обновлённый интерфейс уведомлений
interface PuduNotification {
  id: string;                  // composite key 'robot_id:error_code'
  type: 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  isRepeating: boolean;        // NEW v1.4: persistent_repeating = true
}
```

### ДОБАВИТЬ: Демо-управление повторными уведомлениями

В демо-панель (раздел 9.1 базового промта) добавить кнопку:

| #   | Кнопка демо                    | Действие                                                                                                                      | Стиль                                    |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 5   | «Имитация: E-STOP (повторная)» | Push mock E-STOP → пользователь закрывает → через 3 сек (имитация polling) → уведомление появляется снова с меткой «ПОВТОРНО» | `text-xs text-gray-400 hover:text-white` |
| 6   | «Имитация: OBSTACLE»           | Push mock OBSTACLE → аналогичный цикл repeating                                                                               | `text-xs text-gray-400 hover:text-white` |

---

## H6. Смешанный режим уборки (cleanup_mode: "mixed")

> **Источник**: SPEC-003 v1.10.1, раздел 5.7

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

В v1.1 прототип поддерживает 2 режима: ручной (кнопка) и авто (в v1.3 — `cleanup_auto` mock-данные). Теперь добавлен **смешанный режим**, который сочетает оба.

### ДОБАВИТЬ: Переменная `cleanup_mode` в mock-настройки

В `mockScenarioSettings.cleanup` (из v1.3 F6) уже есть поле `mode: "manual"`. Обновить:

```typescript
  // --- Уборка посуды — ручная (S2) ---
  cleanup: {
    mode: "mixed",                               // v1.4 (H6): изменено с "manual" на "mixed" для демо
    phrase: "Пожалуйста, поставьте грязную посуду на поднос",
    phrase_url: "",
    wait_time: 90,
    phrase_fail: "Я приеду позже за посудой",
    phrase_fail_url: ""
  },
```

### ДОБАВИТЬ: Логика видимости кнопки «Уборка» (в контексте заказа)

```typescript
// === Логика видимости кнопки «Уборка» по режиму (v1.4 H6) ===

get isCleanupButtonVisible(): boolean {
  // manual → кнопка видима
  // auto → кнопка скрыта (только авто-триггеры)
  // mixed → кнопка видима (ручная + авто одновременно)
  const mode = this.mockScenarioSettings.cleanup.mode;
  return mode === 'manual' || mode === 'mixed';
}
```

### ОБНОВИТЬ: Панель кнопок PUDU (контекст заказа)

В контексте заказа кнопка «Уборка» видна **только при** `mode !== 'auto'`:

```html
<!-- Контекст: Из заказа (v1.4 — условная видимость уборки) -->
<div [ngClass]="isCleanupButtonVisible ? 'grid-cols-3' : 'grid-cols-2'"
     class="grid gap-3 p-4 border-t border-gray-600">
  <button (click)="openSendMenu()">Отправить меню</button>
  <button *ngIf="isCleanupButtonVisible" (click)="openCleanup()">Уборка посуды</button>
  <button (click)="openSendDish()">Доставка блюд</button>
</div>
```

### ДОБАВИТЬ: Дедупликация ручная ↔ авто

При смешанном режиме, когда авто-задача уже создана для стола и пользователь нажимает ручную уборку:

```typescript
// v1.4 (H6): Дедупликация при смешанной уборке
handleCleanup(tableId: string): void {
  // Проверить: есть ли уже активная задача cleanup для этого стола
  const hasActiveCleanup = this.mockActiveTasks.some(
    t => t.task_type === 'cleanup' && t.table_id === tableId &&
         ['queued', 'assigned', 'in_progress'].includes(t.status)
  );

  if (hasActiveCleanup) {
    // Дедупликация: уборка уже запланирована (авто)
    this.showToast('info',
      `Стол ${this.getTableName(tableId)}: уборка уже запланирована (авто)`
    );
    return;
  }

  // Нет конфликта → обычный flow
  this.activeModal = 'cleanup_confirm';
}
```

### ДОБАВИТЬ: Toast-стиль для информационных уведомлений

Для дедупликации нужен toast типа `info` (не `error`):

```html
<!-- Toast информационный (v1.4 H6) — для дедупликации и очереди [ОБНОВЛЕНО H12: позиция top-left] -->
<div *ngIf="infoToast" class="fixed top-6 left-6 z-[60] animate-slide-up">
  <div class="bg-[#b8c959]/90 text-black rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
    <lucide-icon name="info" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
    <div class="flex-1">
      <p class="text-sm font-medium">{{ infoToast.title }}</p>
    </div>
    <button (click)="infoToast = null" class="text-black/60 hover:text-black transition-colors"
            aria-label="Закрыть информационное уведомление">
      <lucide-icon name="x" [size]="16"></lucide-icon>
    </button>
  </div>
</div>
```

### ДОБАВИТЬ: Демо-управление режимом уборки

В демо-панель добавить переключатель:

| #   | Кнопка демо                           | Действие                                                                            | Стиль                                    |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| 7   | «Режим уборки: Ручной/Авто/Смешанный» | Циклический переключатель `cleanup.mode`: `manual` → `auto` → `mixed` → `manual`... | `text-xs text-gray-400 hover:text-white` |

---

## H7. Обновление mock-данных

> **Источник**: SPEC-003 v1.10.1, раздел 2.4.6 — Response GET /v1/robots/available

### ДОБАВИТЬ: Тип `AvailableRobot`

```typescript
// v1.4: Робот из GET /v1/robots/available
interface AvailableRobot {
  robot_id: string;
  robot_name: string;
  status: 'free' | 'busy' | 'offline';
  current_task: {
    task_id: string;
    task_type: 'send_menu' | 'cleanup' | 'cleanup_auto' | 'send_dish' | 'qr_payment' | 'marketing';
    target_point: string;     // например 'TABLE_5', 'KITCHEN', 'CRUISE_1'
  } | null;
}
```

### ОБНОВИТЬ: `mockRobots` → `mockAvailableRobots`

**Было** (v1.0):
```typescript
const mockRobots: PuduRobot[] = [
  { robot_id: "PD2024060001", robot_name: "BellaBot-01", status: "idle" },
  { robot_id: "PD2024080042", robot_name: "Ketty-02",    status: "busy" }
];
```

**Стало** (v1.4):
```typescript
// v1.4 (H7): Расширенные mock-данные для П1 и П7
const mockAvailableRobots: AvailableRobot[] = [
  {
    robot_id: "PD2024060001",
    robot_name: "BellaBot-1",
    status: "free",
    current_task: null
  },
  {
    robot_id: "PD2024060002",
    robot_name: "BellaBot-2",
    status: "free",
    current_task: null
  },
  {
    robot_id: "PD2024080042",
    robot_name: "KettyBot-1",
    status: "busy",
    current_task: {
      task_id: "task-20260216-001",
      task_type: "send_menu",
      target_point: "TABLE_5"
    }
  },
  {
    robot_id: "PD2024080043",
    robot_name: "KettyBot-2",
    status: "offline",
    current_task: null
  }
];
```

> **Примечание**: Старый `mockRobots` (v1.0) остаётся для обратной совместимости (используется в `getAssignedRobot()` из v1.1). В прототипе можно использовать`mockAvailableRobots` для П1/П7, а `mockRobots` — для назначения в задачах.

### ДОБАВИТЬ: Переменные состояния для П1 и П7

```typescript
// v1.4: Состояние для модалок П1 и П7
availableRobots: AvailableRobot[] = [];
selectedRobot: AvailableRobot | null = null;
robotsLoading = false;
robotsError = false;
lastRobotRefresh: Date = new Date();
marketingRobotId: string | null = null;        // robot_id, выбранный для маркетинга
robotSelectPurpose: 'marketing' | null = null;  // Зачем открыт П1
infoToast: { title: string } | null = null;     // Toast информационный (H6)
```

---

## H8. Новые ячейки каталога (v1.2)

> **Источник**: Раздел E8 промта v1.2

### ДОБАВИТЬ: Ячейки в массив `catalogCells`

В секцию «Модальные окна» каталога добавить:

```typescript
    // === Выбор робота и статусы (v1.4 H8) ===
    {
      id: 'robot_select',
      title: 'М17: Выбор робота (П1)',
      description: 'Таблица роботов: имя, ID, статус (свободен/занят/оффлайн), текущая задача. Для маркетинга обязателен',
      category: 'modal',
      modal: 'robot_select',
      icon: 'bot',
      badge: 'NEW'
    },
    {
      id: 'robot_select_empty',
      title: 'М17: Нет роботов',
      description: 'Пустое состояние П1: нет зарегистрированных роботов',
      category: 'modal',
      modal: 'robot_select',
      icon: 'bot',
      badge: 'EMPTY',
      params: { emptyState: 'no_robots' }
    },
    {
      id: 'robot_select_all_offline',
      title: 'М17: Все offline',
      description: 'Состояние П1: все роботы offline, кнопка «Выбрать» неактивна',
      category: 'modal',
      modal: 'robot_select',
      icon: 'wifi-off',
      badge: 'EDGE'
    },
    {
      id: 'robot_select_error',
      title: 'М17: Ошибка загрузки',
      description: 'Состояние П1: API NE недоступен, кнопка «Повторить»',
      category: 'modal',
      modal: 'robot_select',
      icon: 'alert-circle',
      badge: 'ERROR'
    },
    {
      id: 'robot_status',
      title: 'М18: Статус роботов (П7)',
      description: 'Read-only таблица всех роботов: имя, статус, текущая задача → стол. Кнопка «Обновить»',
      category: 'modal',
      modal: 'robot_status',
      icon: 'activity',
      badge: 'NEW'
    },
```

В секцию «Уведомления / спецсостояния» каталога добавить:

```typescript
    // === Повторные уведомления (v1.4 H8) ===
    {
      id: 'notification_repeating_estop',
      title: 'Toast: E-STOP (повторный)',
      description: 'Уведомление persistent_repeating: закрытие → 3 сек → повторное появление с меткой «ПОВТОРНО»',
      category: 'notification',
      icon: 'alert-circle',
      badge: 'NEW',
      scenario: 'notification-repeating-estop'
    },
    {
      id: 'notification_repeating_obstacle',
      title: 'Toast: OBSTACLE (повторный)',
      description: 'Уведомление persistent_repeating: препятствие, повторяется до устранения',
      category: 'notification',
      icon: 'alert-circle',
      badge: 'NEW',
      scenario: 'notification-repeating-obstacle'
    },
    {
      id: 'cleanup_dedup_toast',
      title: 'Toast: Уборка уже запланирована',
      description: 'Дедупликация смешанного режима: info-toast «Стол [N]: уборка уже запланирована (авто)»',
      category: 'notification',
      icon: 'info',
      badge: 'NEW',
      scenario: 'cleanup-dedup'
    },
```

---

## H9. Новые сценарные цепочки (v1.2)

### ДОБАВИТЬ: Цепочки в `scenarioChains`

```typescript
  // === Маркетинг через выбор робота — v1.4 (H9) ===

  'marketing-with-select': [
    { modal: 'robot_select', delay: 0 },                   // М17: выбор робота
    // Пользователь выбирает робота и нажимает «Выбрать»
    // → toggle isCruiseActive + индикатор маркетинга
    { modal: null, delay: 3000, action: 'activateCruise' }, // Индикатор круиза
  ],

  'marketing-select-busy': [
    { modal: 'robot_select', delay: 0, params: { preselect: 'busy' } },
    // Toast: «Робот занят. Задача будет поставлена в очередь»
    { modal: null, delay: 3000, action: 'activateCruiseQueued' },
  ],

  'marketing-select-all-offline': [
    { modal: 'robot_select', delay: 0, params: { forceState: 'all_offline' } },
    // Кнопка «Выбрать» disabled
  ],

  'marketing-select-error': [
    { modal: 'robot_select', delay: 0, params: { forceState: 'error' } },
    // Ошибка загрузки, кнопка «Повторить»
  ],

  // === Просмотр статусов — v1.4 (H9) ===

  'robot-status-view': [
    { modal: 'robot_status', delay: 0 },                    // М18: просмотр статусов
    // Пользователь нажимает «Обновить» → refresh
  ],

  // === Повторные уведомления — v1.4 (H9) ===

  'notification-repeating-estop': [
    { modal: null, delay: 0, action: 'showEstopNotification' },           // Toast E-STOP
    { modal: null, delay: 3000, action: 'dismissAndReshow' },             // Закрытие → 3 сек → повторно
  ],

  'notification-repeating-obstacle': [
    { modal: null, delay: 0, action: 'showObstacleNotification' },
    { modal: null, delay: 3000, action: 'dismissAndReshow' },
  ],

  // === Дедупликация уборки — v1.4 (H9) ===

  'cleanup-dedup': [
    { modal: null, delay: 0, action: 'showCleanupDedupToast' },           // Info-toast дедупликации
  ],
```

---

## H10. Новый flow отправки: fire-and-forget

> **Источник**: SPEC-003 v1.10.1, разделы 2.6, 3.2 (шаг 9); План fire-and-forget v1.1 (2026-02-16), раздел 4.2

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

M9 (`loading`) и M10 (`success`) **убираются из пользовательского flow**. Вместо двух промежуточных модалок — inline-спиннер на кнопке «Отправить» + toast после HTTP 200.

**БЫЛО** (v1.0):
```
«Отправить» → activeModal = 'loading' (М9, спиннер 3с) →
  → activeModal = 'success' (М10, галочка 2с) → activeModal = null
```

**СТАЛО** (v1.4, H10):
```
«Отправить» → кнопка disabled + inline-спиннер (HTTP in-flight ~1–3с) →
  HTTP 200 (task_id получен):
    1. activeModal = null  (закрыть confirm-модалку)
    2. showDispatchedToast(taskType, tableName)  (см. H11)
    3. addTaskToPolling(task_id)  (фоновый)
  HTTP Error:
    4. activeModal = 'error' (М11) — без изменений
```

### Затронутые модалки (6 штук)

| #   | Модалка                        | Сценарий                      | Текущий flow                           | Новый flow (H10)                                       |
| --- | ------------------------------ | ----------------------------- | -------------------------------------- | ------------------------------------------------------ |
| 1   | **М1** (send_menu_confirm)     | send_menu                     | «Отправить» → M9 → M10 → null          | «Отправить» → disabled+спиннер → toast → null          |
| 2   | **М2** (cleanup_confirm)       | cleanup (1 стол)              | «Отправить» → M9 → M10 → null          | «Отправить» → disabled+спиннер → toast → null          |
| 3   | **М12** (cleanup_multi_select) | cleanup (мультивыбор)         | «Отправить робота» → M9 → M10 → null   | «Отправить робота» → disabled+спиннер → toast → null   |
| 4   | **М14** (send_dish_confirm)    | send_dish (фудкорт)           | «Отправить» → M9 → M10 → null          | «Отправить» → disabled+спиннер → toast → null          |
| 5   | **М16** (send_dish_repeat)     | send_dish (повтор)            | «Повторить отправку» → M9 → M10 → null | «Повторить отправку» → disabled+спиннер → toast → null |
| 6   | **send_dish-quick** (стандарт) | send_dish (стол из контекста) | Кнопка → M9 → M10 → null               | Кнопка → disabled+спиннер → toast → кнопка active      |

> **Примечание**: М15 (`send_dish_pickup_notification`) — push-уведомление на пункте выдачи — **остаётся без изменений**. Это отдельный паттерн (баннер `fixed top-4 left-4 right-4` на экране раздачи), не связанный с flow кассира.

### Модалки, НЕ затронутые H10

| Модалка                   | Причина исключения                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **М17** (robot_select)    | Flow уже fire-and-forget: `confirmRobotSelection()` → `activeModal = null` + toast. Не использует M9/M10 |
| **М3** (qr_cashier_phase) | QR-фаза: M3 → loading → M4. Loading здесь = промежуточное ожидание кнопки `Next`, **не** создание задачи |
| **М18** (robot_status)    | Read-only, без отправки задач                                                                            |

### Inline-спиннер на кнопке «Отправить»

```html
<!-- Кнопка «Отправить» — состояние отправки (H10) -->
<button
  [disabled]="isSubmitting"
  (click)="submitTask()"
  class="w-full h-14 rounded border-none font-medium transition-colors"
  [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
  aria-label="Отправить задачу роботу">

  <span *ngIf="!isSubmitting">Отправить</span>
  <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
    <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
    Отправка...
  </span>
</button>
```

> **Стиль**: `hover:bg-[#252525]`, `rounded`, `border-none` — консистентно с footer-кнопками М17/М18 (H2/H3). Кнопка «Отмена» в grid footer **не изменяется**.

### TypeScript: Универсальная функция отправки

```typescript
// === Fire-and-forget отправка задачи (v1.4 H10) ===

isSubmitting = false;

// Контекст текущей задачи (устанавливается при открытии confirm-модалки)
currentTaskType: string = 'send_menu';      // task_type для toast и polling
currentTableName: string = 'Стол 5';        // Название стола для toast
mockTaskId: string = 'task-mock-001';       // Mock task_id для polling

async submitTask(): Promise<void> {
  if (this.isSubmitting) return;
  this.isSubmitting = true;

  try {
    // Демо: имитация HTTP-запроса (1–2 сек)
    await this.simulateHttpRequest();

    // 1. Закрыть confirm-модалку
    this.activeModal = null;

    // 2. Показать toast «Отправлено» (см. H11: showDispatchedToast)
    this.showDispatchedToast(this.currentTaskType, this.currentTableName);

    // 3. Добавить task_id в пул polling (фоновый)
    this.addTaskToPolling(this.mockTaskId);

  } catch (error) {
    // При ошибке — показать М11
    this.activeModal = 'error';
  } finally {
    this.isSubmitting = false;
  }
}

private simulateHttpRequest(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.2 ? resolve() : reject(new Error('NE API Error'));
    }, 1500); // 1.5 сек демо-задержка
  });
}
```

> **Зависимость**: `showDispatchedToast()` определяется в **H11**. `addTaskToPolling()` — существующий метод из v1.0 (polling infrastructure).

### Классификация сценариев: ручные vs. автоматические

| Классификация                                 | Сценарии                            | Toast «Отправлено»      | Обоснование                                                                                             |
| --------------------------------------------- | ----------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| **Ручные** (кассир нажимает кнопку)           | `send_menu`, `cleanup`, `send_dish` | **Да** — показывать     | Кассир инициирует действие и ожидает обратную связь                                                     |
| **Ручные с выбором** (кассир выбирает робота) | `marketing`                         | **Да** — показывать     | Кассир явно запрашивает запуск                                                                          |
| **Автоматические** (без участия кассира)      | `cleanup_auto`, `qr_payment`        | **Нет** — НЕ показывать | Автоматические триггеры не должны беспокоить официанта (принцип Руслана для авто-сценариев сохраняется) |

### Deprecation М9 и М10

М9 (`loading`) и М10 (`success`) **сохраняются** в `PuduModalType` для обратной совместимости каталога ячеек, но помечаются `[DEPRECATED]`. В каталоге ячеек (v1.2) description обновляется:

| ID              | Текущий Label       | Новый Label                      | Изменение description                                        |
| --------------- | ------------------- | -------------------------------- | ------------------------------------------------------------ |
| `modal-loading` | М9: Loading         | М9: Loading [DEPRECATED]         | `'[DEPRECATED v1.4 H10] Заменён inline-спиннером на кнопке'` |
| `modal-success` | М10: Задача создана | М10: Задача создана [DEPRECATED] | `'[DEPRECATED v1.4 H10] Заменён toast dispatched (H10/H11)'` |

### ОБНОВИТЬ: Карту переходов (раздел 2.3 базового промта v1.0)

В карте переходов базового промта v1.0 (раздел 2.3) ветка `«Отправить» → M9 → M10 → null` заменяется на fire-and-forget flow. Ниже — обновлённые ветки для **всех 6 затронутых модалок**:

```
Контекст заказа (context === 'order', activeModal = null)
│
├── Клик «Отправить меню» ─►
│   └── activeModal = 'send_menu_confirm' (М1)
│       ├── «Отправить» ──► [ОБНОВЛЕНО H10] кнопка disabled + спиннер → HTTP
│       │   ├── HTTP 200 ──► activeModal = null + toast dispatched
│       │   └── HTTP Error ──► activeModal = 'error' (М11)
│       └── «Отмена» ──► null
│
├── Клик «Уборка посуды» ─►
│   └── activeModal = 'cleanup_confirm' (М2) или 'cleanup_multi_select' (М12)
│       ├── «Отправить» / «Отправить робота» ──► [ОБНОВЛЕНО H10] disabled + спиннер → HTTP
│       │   ├── HTTP 200 ──► null + toast dispatched
│       │   └── HTTP Error ──► 'error' (М11)
│       └── «Отмена» ──► null
│
├── Клик «Доставка блюд» ─►
│   ├── Фудкорт ──► activeModal = 'send_dish_confirm' (М14)
│   │   ├── «Отправить» ──► [ОБНОВЛЕНО H10] disabled + спиннер → HTTP
│   │   │   ├── HTTP 200 ──► null + toast dispatched
│   │   │   └── HTTP Error ──► 'error' (М11)
│   │   └── «Отмена» ──► null
│   ├── Повтор ──► activeModal = 'send_dish_repeat' (М16) — аналогично
│   └── Стандарт (send_dish-quick) ──► [ОБНОВЛЕНО H10] кнопка disabled + спиннер → HTTP
│       ├── HTTP 200 ──► кнопка active + toast dispatched
│       └── HTTP Error ──► toast error
│
│  [DEPRECATED v1.4 H10] — Старая ветка M9 → M10:
│  «Отправить» → activeModal = 'loading' (M9, 3с) → 'success' (M10, 2с) → null
│  Заменена inline-спиннером на кнопке + toast dispatched (см. выше)
```

### ОБНОВИТЬ: Кнопки «Отправить» во всех затронутых модалках

Во всех 5 confirm-модалках (М1, М2, М12, М14, М16) заменить текущую кнопку «Отправить» / «Отправить робота» / «Повторить отправку» на кнопку с inline-спиннером из раздела выше. Шаблон замены для каждой:

**М1 (send_menu_confirm)** — кнопка «Отправить»:
```html
<!-- БЫЛО (v1.0): -->
<!-- <button (click)="activeModal = 'loading'" ...>Отправить</button> -->

<!-- СТАЛО (v1.4 H10): -->
<button [disabled]="isSubmitting" (click)="submitTask()"
  class="h-14 rounded border-none font-medium transition-colors"
  [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
  aria-label="Отправить меню к столу">
  <span *ngIf="!isSubmitting">Отправить</span>
  <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
    <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
    Отправка...
  </span>
</button>
```

**М2 (cleanup_confirm)** — кнопка «Отправить»:
```html
<button [disabled]="isSubmitting" (click)="submitTask()"
  class="h-14 rounded border-none font-medium transition-colors"
  [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
  aria-label="Отправить робота на уборку стола">
  <span *ngIf="!isSubmitting">Отправить</span>
  <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
    <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
    Отправка...
  </span>
</button>
```

**М12 (cleanup_multi_select)** — кнопка «Отправить робота»:
```html
<button [disabled]="isSubmitting || selectedTables.length === 0" (click)="submitTask()"
  class="h-14 rounded border-none font-medium transition-colors"
  [ngClass]="isSubmitting || selectedTables.length === 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
  aria-label="Отправить робота на уборку выбранных столов">
  <span *ngIf="!isSubmitting">Отправить робота</span>
  <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
    <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
    Отправка...
  </span>
</button>
```

**М14 (send_dish_confirm)** — кнопка «Отправить»:
```html
<button [disabled]="isSubmitting" (click)="submitTask()"
  class="h-14 rounded border-none font-medium transition-colors"
  [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
  aria-label="Отправить блюда к столу">
  <span *ngIf="!isSubmitting">Отправить</span>
  <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
    <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
    Отправка...
  </span>
</button>
```

**М16 (send_dish_repeat)** — кнопка «Повторить отправку»:
```html
<button [disabled]="isSubmitting" (click)="submitTask()"
  class="h-14 rounded border-none font-medium transition-colors"
  [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'"
  aria-label="Повторить отправку блюд">
  <span *ngIf="!isSubmitting">Повторить отправку</span>
  <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
    <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
    Отправка...
  </span>
</button>
```

> **send_dish-quick** (стандартный режим без модалки) — кнопка быстрой отправки на панели заказа:
> В отличие от confirm-модалок, здесь нет `activeModal`. Recovery-состояние после HTTP 200 = кнопка возвращается в active (`isSubmitting = false`), toast показывается.

### ДОБАВИТЬ: Переменные состояния для H10

В блок mock-данных (H7 или `pudu-pos-screen.component.ts`) добавить:

```typescript
// v1.4 (H10): Состояние отправки задачи
isSubmitting = false;
currentTaskType: string = 'send_menu';
currentTableName: string = 'Стол 5';
mockTaskId: string = 'task-mock-001';
```

### ДОБАВИТЬ: Установка контекста при открытии модалки

```typescript
// v1.4 (H10): Установка контекста перед открытием confirm-модалки

openSendMenu(tableName: string): void {
  this.currentTaskType = 'send_menu';
  this.currentTableName = tableName;
  this.mockTaskId = `task-${Date.now()}`;
  this.activeModal = 'send_menu_confirm';
}

openCleanup(tableName: string): void {
  this.currentTaskType = 'cleanup';
  this.currentTableName = tableName;
  this.mockTaskId = `task-${Date.now()}`;
  this.activeModal = 'cleanup_confirm';
}

openSendDish(tableName: string): void {
  this.currentTaskType = 'send_dish';
  this.currentTableName = tableName;
  this.mockTaskId = `task-${Date.now()}`;
  this.activeModal = 'send_dish_confirm';
}
```

---

## H11. Уведомления о жизненном цикле задач

> **Источник**: SPEC-003 v1.10.1, разделы 2.6, 9.1, 9.3; План fire-and-forget v1.1 (2026-02-16), раздел 4.3

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

Добавлены **два новых типа toast-уведомлений**, отражающих жизненный цикл задачи робота:

1. **Toast «Отправлено»** (`dispatched`) — акцентный, показывается сразу после получения `task_id` (HTTP 200). **Только для ручных сценариев**, всегда включён.
2. **Toast «Завершено»** (`completed`) — зелёный, показывается при статусе `completed` в polling. **Настраиваемый** через `general_settings.show_success_notifications` (по умолчанию: **выключено** — сохраняет решение Руслана от 06.02).

> **Совместимость с решением Руслана** (06.02): *«Если всё хорошо, то я не вижу смысла задолбливать официантов какими-то сообщениями.»*
> Toast «Отправлено» — обратная связь на действие кассира (аналог визуального отклика), **не** notification об успехе выполнения.
> Toast «Завершено» — **по умолчанию выключен**. Включается через настройку в iikoWeb.
> Автоматические сценарии (`cleanup_auto`, `qr_payment`) — при создании задачи **без уведомления**.

### Два типа toast-уведомлений

| Тип            | Ключ         | Фон                           | Иконка                          | Title                       | Subtitle (опцион.)  | Когда показывается                                                                                                      |
| -------------- | ------------ | ----------------------------- | ------------------------------- | --------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Отправлено** | `dispatched` | `bg-[#b8c959]/90` (акцентный) | `send` (Lucide, 20px)           | «{human_name} — отправлено» | «{tableName}» / нет | После получения `task_id` (HTTP 200) — **только ручные сценарии**. Всегда включено                                      |
| **Завершено**  | `completed`  | `bg-green-600/90` (зелёный)   | `check-circle-2` (Lucide, 20px) | «{human_name} — выполнено»  | «{tableName}» / нет | При статусе `completed` в polling — **все сценарии**. **Настраиваемое**: `show_success_notifications` (дефолт: `false`) |

> **Примечание к subtitle**: `tableName` передаётся как полная строка (например, «Стол 5»). Для `marketing` стол отсутствует — subtitle не выводится.

### Маппинг human_name по task_type

| task_type      | human_name      | Стол в subtitle          |
| -------------- | --------------- | ------------------------ |
| `send_menu`    | Доставка меню   | Да (`tableName`)         |
| `cleanup`      | Уборка посуды   | Да (`tableName`)         |
| `cleanup_auto` | Авто-уборка     | Да (`tableName`)         |
| `qr_payment`   | QR-оплата       | Да (`tableName`)         |
| `send_dish`    | Доставка блюд   | Да (`tableName`)         |
| `marketing`    | Маркетинг-круиз | Нет (нет целевого стола) |

### ДОБАВИТЬ: HTML — Toast «Отправлено» (dispatched)

<!-- Позиция `top-6 left-6` — целевая (SPEC-003). H12 обновил H5/H6 toast до этой же позиции и добавил flex-контейнер стека. -->
<!-- Примечание к стилю: Акцентный фон bg-[#b8c959]/90 намеренно совпадает с info-toast (H6) — оба относятся к категории информационно-позитивных уведомлений; различаются иконкой (send для dispatched vs info для дедупликации). -->

```html
<!-- Toast: Сценарий отправлен (v1.4 H11) -->
<div *ngIf="dispatchedToast" class="fixed top-6 left-6 z-[60] animate-slide-up">
  <div class="bg-[#b8c959]/90 text-black rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
    <lucide-icon name="send" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
    <div class="flex-1">
      <p class="text-sm font-medium">{{ dispatchedToast.title }}</p>
      <p *ngIf="dispatchedToast.subtitle" class="text-xs text-black/70 mt-1">{{ dispatchedToast.subtitle }}</p>
    </div>
    <button (click)="dispatchedToast = null"
            class="text-black/60 hover:text-black transition-colors"
            aria-label="Закрыть уведомление об отправке">
      <lucide-icon name="x" [size]="16"></lucide-icon>
    </button>
  </div>
</div>
```

### ДОБАВИТЬ: HTML — Toast «Завершено» (completed)

```html
<!-- Toast: Сценарий завершён (v1.4 H11) -->
<!-- Стекирование управляется flex-контейнером из H12 -->
<div *ngIf="completedToast" class="fixed top-6 left-6 z-[60] animate-slide-up">
  <div class="bg-green-600/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
    <lucide-icon name="check-circle-2" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
    <div class="flex-1">
      <p class="text-sm font-medium">{{ completedToast.title }}</p>
      <p *ngIf="completedToast.subtitle" class="text-xs text-green-100 mt-1">{{ completedToast.subtitle }}</p>
    </div>
    <button (click)="completedToast = null"
            class="text-green-200 hover:text-white transition-colors"
            aria-label="Закрыть уведомление о завершении">
      <lucide-icon name="x" [size]="16"></lucide-icon>
    </button>
  </div>
</div>
```

> **Стек toast'ов**: H12 оборачивает все toast'ы в единый flex-контейнер (`flex flex-col space-y-2`) в зоне `top-6 left-6`. Каждый toast — элемент flex-стека. Fallback (`showCompletedToast()` закрывает dispatched) сохранён как доп. защита.

### ДОБАВИТЬ: TypeScript — функции showDispatchedToast и showCompletedToast

```typescript
// === Уведомления жизненного цикла задач (v1.4 H11) ===

// Маппинг task_type → человекочитаемое название
const TASK_HUMAN_NAMES: Record<string, string> = {
  send_menu: 'Доставка меню',
  cleanup: 'Уборка посуды',
  cleanup_auto: 'Авто-уборка',
  qr_payment: 'QR-оплата',
  send_dish: 'Доставка блюд',
  marketing: 'Маркетинг-круиз',
};

// Состояние toast-уведомлений
dispatchedToast: { title: string; subtitle?: string } | null = null;
completedToast: { title: string; subtitle?: string } | null = null;

/**
 * Toast «Отправлено» — вызывается из submitTask() (H10)
 * при получении task_id (HTTP 200).
 * Только для ручных сценариев.
 *
 * @param taskType — task_type сценария (send_menu, cleanup, send_dish, marketing)
 * @param tableName — полное название стола ("Стол 5") или undefined для marketing
 */
showDispatchedToast(taskType: string, tableName?: string): void {
  const name = TASK_HUMAN_NAMES[taskType] || taskType;
  this.dispatchedToast = {
    title: `${name} — отправлено`,
    subtitle: tableName || undefined,
  };
}

/**
 * Toast «Завершено» — вызывается из poll_cycle()
 * при status === 'completed'.
 * Показывается ТОЛЬКО если general_settings.show_success_notifications === true.
 *
 * Fallback: если dispatched toast ещё открыт — закрываем его (H12 решает наложение через flex-стек, закрытие — доп. защита).
 *
 * @param taskType — task_type завершённой задачи
 * @param tableName — полное название стола ("Стол 5") или undefined
 */
showCompletedToast(taskType: string, tableName?: string): void {
  const name = TASK_HUMAN_NAMES[taskType] || taskType;
  // Fallback: закрыть dispatched, если ещё виден (H12 решает наложение через flex-стек, закрытие — доп. защита)
  this.dispatchedToast = null;
  this.completedToast = {
    title: `${name} — выполнено`,
    subtitle: tableName || undefined,
  };
}
```

> **Зависимость**: `showDispatchedToast()` вызывается из `submitTask()` (H10). `showCompletedToast()` вызывается из `poll_cycle()` — см. ниже «Интеграция с poll_cycle()».

### ОБНОВИТЬ: Интеграция с poll_cycle()

В существующем коде poll_cycle() (v1.0, раздел 5.2) обновить обработку `completed`:

```typescript
// === Обновление poll_cycle() (v1.4 H11) ===

// БЫЛО (v1.0–v1.3):
//   if (status === 'completed') { active_tasks.remove(task_id); /* Без уведомления */ }

// СТАЛО (v1.4 H11):
if (status === 'completed') {
  // Зелёное уведомление — только если включено в настройках
  if (this.generalSettings.show_success_notifications) {
    this.showCompletedToast(task.task_type, task.table_name);
  }
  this.activeTaskPool.delete(task.task_id);
}
```

### ОБНОВИТЬ: Интеграция с confirmRobotSelection() (М17, marketing)

Marketing проходит через М17 (`robot_select`), а не через `submitTask()` (H10). При успешном выборе свободного робота добавить вызов dispatched toast:

```typescript
// === Интеграция marketing с H11 (обновление confirmRobotSelection из H2) ===

confirmRobotSelection(): void {
  if (!this.selectedRobot) return;

  if (this.selectedRobot.status === 'busy') {
    // Существующая логика: предупреждение
    this.showToast('info', `Робот ${this.selectedRobot.robot_name} занят. Задача будет в очереди`);
  }

  // Активировать маркетинг (существующая логика)
  this.isCruising = true;
  this.cruisingRobotName = this.selectedRobot.robot_name;

  // Закрыть модалку выбора робота
  this.activeModal = null;

  // NEW (v1.4 H11): Toast «Отправлено» для маркетинга
  // marketing не имеет стола → tableName = undefined → subtitle не выводится
  this.showDispatchedToast('marketing');
}
```

> **Примечание**: Для marketing `tableName` не передаётся — toast отобразит только title: «Маркетинг-круиз — отправлено» (без subtitle).

### ДОБАВИТЬ: Mock-данные — настройка show_success_notifications

```typescript
// === Mock general_settings (v1.4 H11) ===

generalSettings = {
  notification_sound_enabled: true,
  show_success_notifications: false,   // по умолчанию ВЫКЛ (решение Руслана от 06.02)
};
```

> Блок `general_settings` добавляется в объект mock-настроек (`mockScenarioSettings` из v1.3 H7) или выносится в отдельную переменную. Ключ `notification_sound_enabled` уже фигурирует в SPEC-002 / SPEC-003. Новый ключ `show_success_notifications` (тип `boolean`, дефолт `false`) — из плана fire-and-forget v1.1.

### ДОБАВИТЬ: Демо-управление уведомлениями о завершении

В демо-панель (раздел 9.1 базового промта) добавить переключатель:

| #   | Кнопка демо                                 | Действие                                                                    | Стиль                                    |
| --- | ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| 8   | «Уведомления о завершении: ВКЛ/ВЫКЛ»        | Toggle `generalSettings.show_success_notifications`; info-toast о состоянии | `text-xs text-gray-400 hover:text-white` |
| 9   | «Имитация: задача завершена (polling demo)» | `showCompletedToast('send_menu', 'Стол 5')` — зелёный toast                 | `text-xs text-gray-400 hover:text-white` |

```typescript
// v1.4 (H11): Демо-переключатель уведомлений о завершении
toggleSuccessNotifications(): void {
  this.generalSettings.show_success_notifications = !this.generalSettings.show_success_notifications;
  this.showToast('info',
    this.generalSettings.show_success_notifications
      ? 'Уведомления о завершении: ВКЛ'
      : 'Уведомления о завершении: ВЫКЛ'
  );
}

// v1.4 (H11): Демо — имитация завершения задачи через polling
simulateTaskCompleted(): void {
  if (this.generalSettings.show_success_notifications) {
    this.showCompletedToast('send_menu', 'Стол 5');
  } else {
    this.showToast('info', 'Уведомление не показано (show_success_notifications = false)');
  }
}
```

### Иконки (новые в H11)

| Иконка           | Контекст                        | Размер |
| ---------------- | ------------------------------- | ------ |
| `send`           | Toast «Отправлено» (dispatched) | 20     |
| `check-circle-2` | Toast «Завершено» (completed)   | 20     |

---

## H12. Позиция уведомлений: верхний левый угол

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

Все toast-уведомления плагина перенесены из **правого нижнего** (`fixed bottom-6 right-6`) в **левый верхний** (`fixed top-6 left-6`) угол экрана. Это соответствует стандартному расположению системных уведомлений iikoFront (SPEC-003 раздел 9.2). Уведомления стекируются **сверху вниз** через единый flex-контейнер.

### Общее правило

**БЫЛО**: `fixed bottom-6 right-6 z-[60]`
**СТАЛО**: `fixed top-6 left-6 z-[60]`

Стек: `flex flex-col space-y-2` — уведомления идут **сверху вниз**.

### Точки замены (5 существующих + 2 новых)

| #   | Компонент                     | Версия | Ориент. строка | Текущий класс                   | Новый класс                 |
| --- | ----------------------------- | ------ | -------------- | ------------------------------- | --------------------------- |
| 1   | Error toast (стандартный)     | v1.0   | L342           | `fixed bottom-6 right-6 z-[60]` | `fixed top-6 left-6 z-[60]` |
| 2   | Описание зоны уведомлений     | v1.0   | L633           | `fixed bottom-6 right-6`        | `fixed top-6 left-6`        |
| 3   | E-STOP toast                  | v1.1   | L240           | `fixed bottom-6 right-6 z-[60]` | `fixed top-6 left-6 z-[60]` |
| 4   | Error toast (repeating, H5)   | v1.4   | H5             | `fixed bottom-6 right-6 z-[60]` | `fixed top-6 left-6 z-[60]` |
| 5   | Info toast (дедупликация, H6) | v1.4   | H6             | `fixed bottom-6 right-6 z-[60]` | `fixed top-6 left-6 z-[60]` |
| 6   | Toast «Отправлено» (H11)      | v1.4   | H11            | —                               | `fixed top-6 left-6 z-[60]` |
| 7   | Toast «Завершено» (H11)       | v1.4   | H11            | —                               | `fixed top-6 left-6 z-[60]` |

> **Исключение**: М15 (`send_dish_pickup_notification`, v1.3) — push-уведомление на раздаче. Использует `fixed top-4 left-4 right-4` (растянутый баннер на весь экран). **Не изменяется** — это другой паттерн UI.

> **Важно**: Toast'ы из **базовых промтов** v1.0 и v1.1 (строки L342, L633, L240) должны быть обновлены **в базовых файлах** при следующей синхронизации. В данном патче обновлены **только** точки #4 и #5 (H5 и H6), т.к. они уже описаны в v1.4 патче. Точки #6 и #7 уже созданы с правильной позицией в H11.

### Обновлённые компоненты в данном патче

**Error toast (H5)**: `class="fixed bottom-6 right-6 z-[60]"` → `class="fixed top-6 left-6 z-[60]"`

**Info toast (H6)**: `class="fixed bottom-6 right-6 z-[60]"` → `class="fixed top-6 left-6 z-[60]"`

**Dispatched toast (H11)** и **Completed toast (H11)** — уже используют `fixed top-6 left-6 z-[60]` (без изменений).

### ДОБАВИТЬ: Flex-контейнер для стека уведомлений

Все toast'ы оборачиваются в **единый flex-контейнер** в зоне `top-6 left-6`. Это решает проблему визуального наложения при одновременном показе нескольких toast'ов.

```html
<!-- Зона уведомлений: верхний левый угол (v1.4 H12) -->
<!-- Все toast'ы стекируются сверху вниз, макс. 3 одновременно -->
<div class="fixed top-6 left-6 z-[60] flex flex-col space-y-2"
     role="status" aria-live="polite" aria-label="Зона уведомлений">
  
  <!-- Toast: Ошибка (persistent, из H5) -->
  <div *ngIf="hasError" class="animate-slide-up">
    <div class="bg-red-500/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
      <lucide-icon name="alert-circle" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium">{{ errorTitle }}</p>
          <span *ngIf="notification.isRepeating"
                class="text-[10px] bg-red-700 px-1.5 py-0.5 rounded font-medium">
            ПОВТОРНО
          </span>
        </div>
        <p class="text-xs text-red-100 mt-1">{{ errorMessage }}</p>
        <p *ngIf="notification.isRepeating" class="text-xs text-red-200 mt-2 italic">
          Уведомление будет повторяться, пока ошибка не устранена
        </p>
      </div>
      <button (click)="dismissNotificationWithTracking(notification)"
              class="text-red-200 hover:text-white transition-colors"
              aria-label="Закрыть уведомление об ошибке">
        <lucide-icon name="x" [size]="16"></lucide-icon>
      </button>
    </div>
  </div>

  <!-- Toast: Информационный (из H6) -->
  <div *ngIf="infoToast" class="animate-slide-up">
    <div class="bg-[#b8c959]/90 text-black rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
      <lucide-icon name="info" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
      <div class="flex-1">
        <p class="text-sm font-medium">{{ infoToast.title }}</p>
      </div>
      <button (click)="infoToast = null" class="text-black/60 hover:text-black transition-colors"
              aria-label="Закрыть информационное уведомление">
        <lucide-icon name="x" [size]="16"></lucide-icon>
      </button>
    </div>
  </div>

  <!-- Toast: Отправлено / dispatched (из H11) -->
  <div *ngIf="dispatchedToast" class="animate-slide-up">
    <div class="bg-[#b8c959]/90 text-black rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
      <lucide-icon name="send" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
      <div class="flex-1">
        <p class="text-sm font-medium">{{ dispatchedToast.title }}</p>
        <p *ngIf="dispatchedToast.subtitle" class="text-xs text-black/70 mt-1">{{ dispatchedToast.subtitle }}</p>
      </div>
      <button (click)="dispatchedToast = null" class="text-black/60 hover:text-black transition-colors"
              aria-label="Закрыть уведомление об отправке">
        <lucide-icon name="x" [size]="16"></lucide-icon>
      </button>
    </div>
  </div>

  <!-- Toast: Завершено / completed (из H11) -->
  <div *ngIf="completedToast" class="animate-slide-up">
    <div class="bg-green-600/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
      <lucide-icon name="check-circle-2" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
      <div class="flex-1">
        <p class="text-sm font-medium">{{ completedToast.title }}</p>
        <p *ngIf="completedToast.subtitle" class="text-xs text-green-100 mt-1">{{ completedToast.subtitle }}</p>
      </div>
      <button (click)="completedToast = null" class="text-green-200 hover:text-white transition-colors"
              aria-label="Закрыть уведомление о завершении">
        <lucide-icon name="x" [size]="16"></lucide-icon>
      </button>
    </div>
  </div>

</div>
```

> **Стек toast'ов**: Единый flex-контейнер (`flex flex-col space-y-2`) в зоне `top-6 left-6` решает проблему визуального наложения. Каждый toast — элемент flex-стека. Максимум 3 одновременно видимых toast'а. Порядок: ошибки → информационные → отправка → завершение (сверху вниз).

### ОБНОВИТЬ: Описание зоны уведомлений (раздел 6.1 базового промта v1.0)

Обновить описание (при следующей синхронизации базового промта):

> **Зона уведомлений**: Левый верхний угол (`fixed top-6 left-6`). Toast-плашки в flex-контейнере (`flex flex-col space-y-2`), стек до 3 уведомлений, порядок сверху вниз.

### ОБНОВИТЬ: Fallback в H11 — заменить «до H12» на «H12 реализован»

В H11 (`showCompletedToast`) fallback по закрытию `dispatchedToast` **сохраняется** как дополнительная защита, но комментарий обновлён:

```typescript
// Fallback: закрыть dispatched, если ещё виден
// (H12 решает наложение через flex-стек, но закрытие — доп. защита)
this.dispatchedToast = null;
```

### Ограничения стека

| Параметр                  | Значение                                            |
| ------------------------- | --------------------------------------------------- |
| Макс. одновременных toast | 3 (error + dispatched/info + completed)             |
| Порядок стекирования      | Ошибки → Информационные → Отправка → Завершение     |
| Направление стека         | Сверху вниз (`flex-col`)                            |
| Отступ между toast'ами    | `space-y-2` (0.5rem / 8px)                          |
| Z-index                   | `z-[60]` — поверх всех модалок                      |
| Accessibility             | `role="status"`, `aria-live="polite"`               |
| Время жизни каждого toast | До нажатия на крестик (persistent, реализовано H13) |

---

## H13. Время жизни уведомлений: до нажатия крестика

> **Источник**: План `04-Технические-требования/2026-02-16-план-fire-and-forget-уведомления.md`, раздел 4.5

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

Все уведомления и модалки-результаты — **persistent** до ручного закрытия (нажатие крестика или кнопки «Готово» / «Закрыть»). Авто-dismiss убирается.

### Затронутые компоненты

| #   | Компонент                    | Текущий авто-dismiss                            | Новое поведение                                                 |
| --- | ---------------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| 1   | **М5** (qr_success)          | 3 сек (v1.0 L853) / 5 сек (цепочки v1.2)        | **Persistent** — кнопка «Готово» закрывает                      |
| 2   | **М10** (success)            | 2 сек (v1.0 L994) / 3–4 сек (цепочки v1.2–v1.3) | **[DEPRECATED]** — H10 убирает из flow; авто-dismiss неактуален |
| 3   | **Error toast**              | Persistent (уже корректно)                      | Без изменений                                                   |
| 4   | **E-STOP toast**             | Persistent_repeating (уже корректно)            | Без изменений                                                   |
| 5   | **Info toast** (v1.4 H6)     | Нет явного таймера (уже persistent)             | Подтверждено — без изменений                                    |
| 6   | **Toast «Отправлено»** (H11) | Новый                                           | Persistent (до крестика)                                        |
| 7   | **Toast «Завершено»** (H11)  | Новый                                           | Persistent (до крестика)                                        |

> **Единственная реальная правка**: М5 (`qr_success`) — убрать автозакрытие. Остальные либо уже persistent, либо deprecated.

### ОБНОВИТЬ: М5 (qr_success) — убрать авто-dismiss (раздел 6.6 базового промта v1.0)

**БЫЛО** (v1.0 L853):

> Автозакрытие через 3 сек → activeModal = null.

**СТАЛО** (v1.4 H13):

> Без автозакрытия. М5 закрывается **ТОЛЬКО** кнопкой «Готово» → `activeModal = null`.

В HTML-разметке М5 кнопка «Готово» уже существует (v1.0 L846–L851) и вызывает `activeModal = null`. Дополнительных визуальных изменений не требуется — убирается только поведенческая логика автозакрытия.

### ОБНОВИТЬ: TypeScript — убрать setTimeout для М5

```typescript
// === М5 (qr_success): убрать авто-dismiss (v1.4 H13) ===

// БЫЛО (v1.0):
// При переходе на qr_success:
// setTimeout(() => { this.activeModal = null; }, 3000);  // М5 автозакрытие 3 сек

// СТАЛО (v1.4 H13):
// Убрать setTimeout. М5 закрывается ТОЛЬКО кнопкой «Готово»:
closeQrSuccess(): void {
  this.activeModal = null;
}

// Метод вызывается из кнопки «Готово» в HTML М5:
// <button (click)="closeQrSuccess()" ...>Готово</button>
```

### Сценарная цепочка `qr-full` (v1.2)

Цепочка `qr-full` (v1.2) заканчивается шагом `{ modal: 'qr_success', delay: 5000 }`. Поскольку М5 теперь persistent, **delay в цепочке** используется **только для демо-навигации** (сколько секунд показывать в автоматическом прогоне каталога). В реальной логике М5 закрывается вручную. Цепочка **не изменяется**.

> **Примечание**: Если в будущем потребуется демо-цепочка с ручным закрытием М5, можно добавить `{ modal: 'qr_success', delay: 0, waitForClose: true }` (расширение формата). Пока не реализовано.

---

## H14. Обновление каталога ячеек и сценарных цепочек (v1.2)

> **Источник**: План `04-Технические-требования/2026-02-16-план-fire-and-forget-уведомления.md`, раздел 4.6

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

Каталог ячеек (v1.2) расширяется на **6 новых ячеек** (toast dispatched ×4, toast completed ×1, button-submitting ×1). Два существующих элемента (M9 `loading`, M10 `success`) помечаются `[DEPRECATED]`. Сценарные цепочки (v1.2/v1.3) обновляются под fire-and-forget flow (H10) и дополняются 2 новыми.

### ДОБАВИТЬ: Ячейки в массив `catalogCells`

В секцию «Уведомления / спецсостояния» каталога добавить:

```typescript
    // === Fire-and-forget toast'ы и состояния (v1.4 H14) ===
    {
      id: 'toast-dispatched-send_menu',
      title: 'Toast: Меню отправлено',
      description: 'Акцентный toast «Доставка меню — отправлено. Стол 5» (bg-[#b8c959]/90)',
      category: 'notification',
      icon: 'send',
      badge: 'NEW',
      scenario: 'send-menu-ok'
    },
    {
      id: 'toast-dispatched-cleanup',
      title: 'Toast: Уборка отправлена',
      description: 'Акцентный toast «Уборка посуды — отправлено. Стол 3» (bg-[#b8c959]/90)',
      category: 'notification',
      icon: 'send',
      badge: 'NEW',
      scenario: 'cleanup-ok'
    },
    {
      id: 'toast-dispatched-send_dish',
      title: 'Toast: Блюда отправлены',
      description: 'Акцентный toast «Доставка блюд — отправлено. Стол 7» (bg-[#b8c959]/90)',
      category: 'notification',
      icon: 'send',
      badge: 'NEW',
      scenario: 'send_dish-full'
    },
    {
      id: 'toast-dispatched-marketing',
      title: 'Toast: Маркетинг запущен',
      description: 'Акцентный toast «Маркетинг-круиз — отправлено» (без subtitle — нет целевого стола)',
      category: 'notification',
      icon: 'send',
      badge: 'NEW',
      scenario: 'marketing-with-select'
    },
    {
      id: 'toast-completed-generic',
      title: 'Toast: Сценарий выполнен',
      description: 'Зелёный toast «Доставка меню — выполнено. Стол 5» (bg-green-600/90). Только при show_success_notifications = true',
      category: 'notification',
      icon: 'check-circle-2',
      badge: 'NEW',
      scenario: 'task-completed-polling'
    },
    {
      id: 'button-submitting',
      title: 'Кнопка: Отправка...',
      description: 'Кнопка в состоянии disabled + inline-спиннер (loader-2 animate-spin) + текст «Отправка...»',
      category: 'state',
      icon: 'loader-2',
      badge: 'NEW'
    },
```

### ОБНОВИТЬ: Ячейки [DEPRECATED] в `catalogCells`

В секцию «Модальные окна» каталога найти существующие ячейки M9 (`modal-loading`) и M10 (`modal-success`) и обновить:

```typescript
    // === [DEPRECATED v1.4 H14] ===
    {
      id: 'modal-loading',
      title: 'М9: Loading [DEPRECATED]',
      description: '[DEPRECATED v1.4] Заменён inline-спиннером на кнопке «Отправить» (H10). Сохранён для обратной совместимости каталога',
      category: 'modal',
      modal: 'loading',
      icon: 'loader-2',
      badge: 'DEPRECATED'
    },
    {
      id: 'modal-success',
      title: 'М10: Задача создана [DEPRECATED]',
      description: '[DEPRECATED v1.4] Заменён toast dispatched (H10/H11). Сохранён для обратной совместимости каталога',
      category: 'modal',
      modal: 'success',
      icon: 'check-circle-2',
      badge: 'DEPRECATED'
    },
```

### ОБНОВИТЬ: Сценарные цепочки в `scenarioChains`

**Обновлённые цепочки** (fire-and-forget вместо loading → success):

```typescript
  // === Обновлённые цепочки fire-and-forget (v1.4 H14) ===

  // БЫЛО (v1.2): send_menu_confirm → loading → success
  'send-menu-ok': [
    { modal: 'send_menu_confirm', delay: 3000 },
    // Кнопка «Отправить» → disabled+спиннер 1.5 сек → закрытие
    { modal: null, toast: 'dispatched', toastText: 'Доставка меню — отправлено. Стол 5', delay: 2000 },
  ],

  // БЫЛО (v1.2): send-menu-err — БЕЗ ИЗМЕНЕНИЙ (ошибка не затронута fire-and-forget)
  // 'send-menu-err' остаётся: send_menu_confirm → loading → error

  // БЫЛО (v1.2): cleanup_confirm → loading → success
  'cleanup-ok': [
    { modal: 'cleanup_confirm', delay: 3000 },
    { modal: null, toast: 'dispatched', toastText: 'Уборка посуды — отправлено. Стол 3', delay: 2000 },
  ],

  // БЫЛО (v1.2): cleanup_multi_select → loading → success
  'cleanup-multi-ok': [
    { modal: 'cleanup_multi_select', delay: 3000 },
    { modal: null, toast: 'dispatched', toastText: 'Уборка посуды — отправлено. Столы 3, 5, 8', delay: 2000 },
  ],

  // БЫЛО (v1.3): send_dish_confirm → loading → send_dish_pickup_notification → success
  'send_dish-full': [
    { modal: 'send_dish_confirm', delay: 3000 },
    // fire-and-forget: confirm → спиннер → toast
    { modal: null, toast: 'dispatched', toastText: 'Доставка блюд — отправлено. Стол 7', delay: 2000 },
    // М15 (pickup_notification) приходит позже по polling — отдельный поток
  ],

  // БЫЛО (v1.3): loading → send_dish_pickup_notification → success
  'send_dish-quick': [
    // Кнопка «Доставка блюд» → спиннер на кнопке → toast
    { modal: null, toast: 'dispatched', toastText: 'Доставка блюд — отправлено. Стол 7', delay: 2000 },
  ],

  // БЫЛО (v1.3): send_dish_repeat → loading → send_dish_pickup_notification → success
  'send_dish-repeat': [
    { modal: 'send_dish_repeat', delay: 3000 },
    { modal: null, toast: 'dispatched', toastText: 'Доставка блюд — отправлено. Стол 7', delay: 2000 },
  ],
```

> **Примечание**: Цепочки ошибок (`send-menu-err`, `send_dish-error-*`) **не изменяются** — при ошибке HTTP-запроса flow переходит на М11 (`error`), а не на toast. Цепочки QR (`qr-full`, `qr-timeout`) и `unmapped` также **не изменяются**.

### ДОБАВИТЬ: Новые сценарные цепочки

```typescript
  // === Новые цепочки lifecycle (v1.4 H14) ===

  // Демо: polling вернул completed → зелёное уведомление
  'task-completed-polling': [
    { modal: null, toast: 'completed', toastText: 'Доставка меню — выполнено. Стол 5', delay: 0 },
  ],

  // Полный цикл fire-and-forget: отправка → dispatched → polling → completed
  'fire-and-forget-full': [
    { modal: 'send_menu_confirm', delay: 3000 },
    // Кнопка «Отправить» → disabled+спиннер 1.5 сек → закрытие
    { modal: null, toast: 'dispatched', toastText: 'Доставка меню — отправлено. Стол 5', delay: 5000 },
    // 5 сек — имитация polling (фоновый процесс)
    { modal: null, toast: 'completed', toastText: 'Доставка меню — выполнено. Стол 5', delay: 3000 },
  ],
```

### Расширение интерфейса `ScenarioStep` (v1.2)

В тип `ScenarioStep` (определён в v1.2) добавить опциональные поля для поддержки toast-шагов:

```typescript
interface ScenarioStep {
  modal: PuduModalType | null;
  delay: number;
  action?: string;
  params?: Record<string, any>;
  toast?: 'dispatched' | 'completed' | 'error' | 'info';  // NEW (H14): тип toast для показа
  toastText?: string;                                       // NEW (H14): текст toast
}
```

### ОБНОВИТЬ: Логика `runScenario()` — поддержка toast в цепочках

```typescript
// === Обновление runScenario() для toast-шагов (v1.4 H14) ===

private executeStep(step: ScenarioStep): void {
  // Установить модалку (или закрыть, если null)
  if (step.modal) {
    this.activeModal = step.modal;
  } else {
    this.activeModal = null;
  }

  // NEW (H14): показать toast, если указан в шаге
  if (step.toast === 'dispatched' && step.toastText) {
    this.dispatchedToast = { title: step.toastText };
  } else if (step.toast === 'completed' && step.toastText) {
    // Показать completed toast только если настройка включена (или в демо — всегда)
    this.completedToast = { title: step.toastText };
  } else if (step.toast === 'error' && step.toastText) {
    this.showErrorToast(step.toastText);
  } else if (step.toast === 'info' && step.toastText) {
    this.infoToast = { title: step.toastText };
  }

  // Выполнить action, если указан
  if (step.action) {
    this.executeAction(step.action);
  }
}
```

### Сводка изменений каталога (H14)

| Категория                | Количество | Детали                                                                                         |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| Новые ячейки             | **+6**     | dispatched ×4 (send_menu, cleanup, send_dish, marketing) + completed ×1 + button-submitting ×1 |
| Обновлённые (deprecated) | **2**      | modal-loading (M9), modal-success (M10) → `[DEPRECATED]`                                       |
| Обновлённые цепочки      | **6**      | send-menu-ok, cleanup-ok, cleanup-multi-ok, send_dish-full, send_dish-quick, send_dish-repeat  |
| Новые цепочки            | **+2**     | task-completed-polling, fire-and-forget-full                                                   |
| Расширение интерфейса    | **1**      | `ScenarioStep` + поля `toast`, `toastText`                                                     |

> **Итого ячеек в каталоге**: ~26 (v1.2) + 8 (H8) + 6 (H14) = **~40 ячеек**.

---

## Обновлённая структура файлов (дельта к v1.3)

**Новые файлы**:

```
src/app/prototypes/front-pudu-plugin/
├── components/
│   └── dialogs/
│       ├── robot-select.component.ts            # NEW (H2): М17 — Выбор робота (П1)
│       └── robot-status.component.ts            # NEW (H3): М18 — Статус роботов (П7)
```

**Изменённые файлы**:

```
src/app/prototypes/front-pudu-plugin/
├── types.ts                                      # CHANGED: PuduModalType (loading/success [DEPRECATED H10]) + AvailableRobot + PuduNotification.isRepeating + isSubmitting + dispatchedToast/completedToast (H11)
├── data/
│   ├── mock-data.ts                              # CHANGED: mockAvailableRobots (4 робота), dismissedErrors Map, currentTaskType/currentTableName/mockTaskId (H10), generalSettings (H11)
│   └── catalog-entries.ts                        # CHANGED: +7 ячеек (robot_select ×4, robot_status, notifications ×2); modal-loading/modal-success → [DEPRECATED] (H10)
├── components/
│   ├── error-toast.component.ts                  # CHANGED: метка «ПОВТОРНО», подсказка для repeating
│   ├── pudu-buttons-panel.component.ts           # CHANGED: 3 кнопки главного экрана (+ «Статус роботов»)
│   ├── cruise-indicator.component.ts             # CHANGED: + имя выбранного робота
│   ├── info-toast.component.ts                   # NEW: Toast информационный (для дедупликации)
│   ├── dispatched-toast.component.ts             # NEW (H11): Toast «Отправлено» (dispatched)
│   ├── completed-toast.component.ts              # NEW (H11): Toast «Завершено» (completed)
│   ├── dialogs/
│   │   ├── send-menu-confirm.component.ts        # CHANGED (H10): кнопка «Отправить» → inline-спиннер + submitTask()
│   │   ├── cleanup-confirm.component.ts          # CHANGED (H10): кнопка «Отправить» → inline-спиннер + submitTask()
│   │   ├── cleanup-multi-select.component.ts     # CHANGED (H10): кнопка «Отправить робота» → inline-спиннер + submitTask()
│   │   ├── send-dish-confirm.component.ts        # CHANGED (H10): кнопка «Отправить» → inline-спиннер + submitTask()
│   │   ├── send-dish-repeat.component.ts         # CHANGED (H10): кнопка «Повторить» → inline-спиннер + submitTask()
│   │   └── qr-success.component.ts               # CHANGED (H13): убран авто-dismiss 3 сек, persistent до «Готово»
│   └── shared/
│       └── submit-button.component.ts            # NEW (H10): переиспользуемая кнопка с inline-спиннером
├── screens/
│   ├── pudu-catalog-screen.component.ts          # CHANGED: +8 ячеек H8 + 6 ячеек H14 (dispatched ×4, completed, button-submitting); 2 ячейки → [DEPRECATED] (H14)
│   └── pudu-pos-screen.component.ts              # CHANGED: логика П1, П7, cleanup mode, dismissedErrors, submitTask() (H10), showDispatchedToast/showCompletedToast/poll_cycle/generalSettings (H11), closeQrSuccess() (H13)
├── services/
│   └── scenario-chains.ts                        # CHANGED: +8 цепочек H9 (marketing-*, robot-status-*, notification-*, cleanup-dedup); 6 обновлённых + 2 новых цепочки H14 (fire-and-forget, lifecycle); ScenarioStep + toast/toastText (H14)
```

---

## Обновлённый чеклист прототипа (дельта к v1.3)

### Модальное окно выбора робота — М17 (П1)
- [ ] Диалог `robot_select` создан (LG, тёмная тема)
- [ ] Заголовок: «Выбор робота», подзаголовок контекстный
- [ ] Таблица с 4 колонками: Имя робота, ID (truncated), Статус (с цветным кружком), Задача
- [ ] Сортировка: free → busy → offline
- [ ] Free — кликабельный, белый текст, зелёный индикатор
- [ ] Busy — кликабельный, серый текст (`text-gray-400`), оранжевый индикатор, warning при выборе
- [ ] Offline — некликабельный, `opacity-40`, серый индикатор
- [ ] Выделение выбранной строки: `bg-[#b8c959]/10 border-l-2 border-[#b8c959]`
- [ ] Индикатор «Выбрано: {имя}» под таблицей
- [ ] Кнопка «Выбрать» disabled при `!selectedRobot || offline`
- [ ] `aria-label` на кнопках footer
- [ ] Empty state: нет роботов → иконка `bot` + текст
- [ ] Empty state: все offline → orange-баннер
- [ ] Error state: ошибка загрузки → иконка ошибки + «Повторить»
- [ ] Loading state: спиннер + текст

### Экран статусов — М18 (П7)
- [ ] Диалог `robot_status` создан (LG, тёмная тема)
- [ ] Таблица read-only (без hover-курсора, без клика по строкам)
- [ ] Колонки: Имя робота, ID, Статус, Текущая задача
- [ ] Метка «Последнее обновление: HH:mm:ss»
- [ ] Кнопка «Обновить» с иконкой `refresh-cw` и `aria-label`
- [ ] Кнопка «Закрыть» (одна, на всю ширину, `border-none`, `aria-label`)
- [ ] Пустое состояние: «Нет зарегистрированных роботов»
- [ ] Ошибка загрузки: «Не удалось загрузить статусы роботов» + кнопка «Повторить»
- [ ] `target_point` отображается в человекочитаемом формате (С.5, Кухня)

### Контекст «Главный экран»
- [ ] 3 кнопки: Маркетинг, Уборка (столы), Статус роботов
- [ ] `grid-cols-3 gap-3`
- [ ] Кнопка «Маркетинг» → открывает П1 (а не toggle напрямую)
- [ ] Кнопка «Статус роботов» → открывает П7
- [ ] Индикатор маркетинга показывает имя выбранного робота

### Уведомления (persistent_repeating)
- [ ] 4 error_code с типом persistent_repeating: E_STOP, MANUAL_MODE, OBSTACLE, LOW_BATTERY
- [ ] Toast — метка «ПОВТОРНО» для повторных уведомлений
- [ ] Подсказка «Уведомление будет повторяться, пока ошибка не устранена»
- [ ] `dismissedErrors` Map хранит закрытые repeating-ошибки
- [ ] При следующем polling: если ошибка всё ещё активна → toast появляется снова
- [ ] Демо-кнопка: «Имитация E-STOP (повторная)»
- [ ] `aria-label` на кнопках закрытия toast

### Смешанная уборка
- [ ] `cleanup.mode` = `"mixed"` в mock-настройках
- [ ] Кнопка «Уборка» видна при `manual` и `mixed`, скрыта при `auto`
- [ ] Дедупликация: если авто-задача уже есть → info-toast
- [ ] Info-toast стиль: `bg-[#b8c959]/90 text-black`
- [ ] `aria-label` на кнопке закрытия info-toast
- [ ] Демо-переключатель: «Режим уборки: Ручной/Авто/Смешанный»

### Каталог (v1.2)
- [ ] М17: 4 ячейки (основная, empty, all_offline, error)
- [ ] М18: 1 ячейка
- [ ] Уведомления: 2 ячейки (E-STOP repeating, OBSTACLE repeating)
- [ ] Дедупликация: 1 ячейка
- [ ] Итого H8: **+8 ячеек**

### Время жизни уведомлений (H13)
- [ ] М5 (`qr_success`): убран авто-dismiss 3 сек
- [ ] М5 закрывается **ТОЛЬКО** кнопкой «Готово» → `closeQrSuccess()` → `activeModal = null`
- [ ] Нет `setTimeout` для М5 (декларативное описание в v1.0 L853 → удалено)
- [ ] М10 (`success`): [DEPRECATED] — авто-dismiss неактуален (H10)
- [ ] Error toast: уже persistent — без изменений
- [ ] E-STOP toast: уже persistent_repeating — без изменений
- [ ] Info toast (H6): уже persistent — без изменений
- [ ] Toast «Отправлено» (H11): persistent (до крестика)
- [ ] Toast «Завершено» (H11): persistent (до крестика)
- [ ] Цепочка `qr-full` (v1.2): delay на последнем шаге — только для демо-навигации, не авто-dismiss

### Каталог и цепочки — обновление (H14)
- [ ] +6 ячеек каталога: dispatched ×4 (send_menu, cleanup, send_dish, marketing), completed ×1, button-submitting ×1
- [ ] `toast-dispatched-send_menu`: иконка `send`, badge `NEW`, scenario `send-menu-ok`
- [ ] `toast-dispatched-cleanup`: иконка `send`, badge `NEW`, scenario `cleanup-ok`
- [ ] `toast-dispatched-send_dish`: иконка `send`, badge `NEW`, scenario `send_dish-full`
- [ ] `toast-dispatched-marketing`: иконка `send`, badge `NEW`, scenario `marketing-with-select`
- [ ] `toast-completed-generic`: иконка `check-circle-2`, badge `NEW`, scenario `task-completed-polling`
- [ ] `button-submitting`: иконка `loader-2`, badge `NEW`, category `state`
- [ ] M9 (`modal-loading`) → title `'М9: Loading [DEPRECATED]'`, badge `DEPRECATED`
- [ ] M10 (`modal-success`) → title `'М10: Задача создана [DEPRECATED]'`, badge `DEPRECATED`
- [ ] Цепочка `send-menu-ok` обновлена: confirm → toast dispatched (вместо loading → success)
- [ ] Цепочка `cleanup-ok` обновлена
- [ ] Цепочка `cleanup-multi-ok` обновлена
- [ ] Цепочка `send_dish-full` обновлена
- [ ] Цепочка `send_dish-quick` обновлена
- [ ] Цепочка `send_dish-repeat` обновлена
- [ ] Цепочки ошибок (`send-menu-err`, `send_dish-error-*`) — **без изменений**
- [ ] Цепочки QR (`qr-full`, `qr-timeout`) — **без изменений**
- [ ] Новая цепочка `task-completed-polling`: toast completed
- [ ] Новая цепочка `fire-and-forget-full`: confirm → dispatched → (5 сек polling) → completed
- [ ] `ScenarioStep` расширен: `toast?: 'dispatched' | 'completed' | 'error' | 'info'`, `toastText?: string`
- [ ] `executeStep()` обновлён: показ toast по типу из шага цепочки
- [ ] Итого ячеек в каталоге: ~26 (v1.2) + 8 (H8) + 6 (H14) = **~40 ячеек**

### Иконки (новые)
| Иконка           | Контекст                                   | Размер |
| ---------------- | ------------------------------------------ | ------ |
| `bot`            | Кнопка «Статус роботов», empty state       | 20–48  |
| `refresh-cw`     | Кнопка «Обновить» в П7                     | 14     |
| `wifi-off`       | Все роботы offline                         | 20     |
| `activity`       | Ячейка каталога «Статус роботов»           | —      |
| `loader-2`       | Inline-спиннер на кнопке «Отправить» (H10) | 20     |
| `send`           | Toast «Отправлено» — dispatched (H11)      | 20     |
| `check-circle-2` | Toast «Завершено» — completed (H11)        | 20     |

### Fire-and-forget flow (H10)
- [ ] `isSubmitting` переменная: default `false`
- [ ] Кнопка «Отправить» — состояние active: `bg-[#1a1a1a] text-white hover:bg-[#252525]`
- [ ] Кнопка «Отправить» — состояние disabled: `bg-gray-600 text-gray-400 cursor-not-allowed`
- [ ] Inline-спиннер: `lucide-icon name="loader-2"` + `animate-spin` + текст «Отправка...»
- [ ] `aria-label` на кнопке «Отправить»
- [ ] `submitTask()` → успех → `activeModal = null` + toast dispatched (H11) + `addTaskToPolling()`
- [ ] `submitTask()` → ошибка → `activeModal = 'error'` (М11)
- [ ] Кнопка «Отмена» остаётся без изменений в grid footer
- [ ] 6 модалок обновлены: М1, М2, М12, М14, М16, send_dish-quick
- [ ] М17 НЕ затронута (уже fire-and-forget)
- [ ] М3 НЕ затронута (QR — промежуточный loading, не создание задачи)
- [ ] M9 (`loading`) помечен [DEPRECATED] в PuduModalType и каталоге ячеек (v1.2)
- [ ] M10 (`success`) помечен [DEPRECATED] в PuduModalType и каталоге ячеек (v1.2)
- [ ] `simulateHttpRequest()` — демо-задержка 1.5 сек, 80/20 успех/ошибка
- [ ] Ручные сценарии (send_menu, cleanup, send_dish, marketing) → toast отправки **ДА**
- [ ] Авто-сценарии (cleanup_auto, qr_payment) → toast отправки **НЕТ**
- [ ] `currentTaskType`, `currentTableName`, `mockTaskId` устанавливаются при открытии каждой confirm-модалки
- [ ] send_dish-quick: recovery → кнопка active (не `activeModal = null`)

### Уведомления жизненного цикла (H11)
- [ ] `TASK_HUMAN_NAMES` Record: 6 сценариев (send_menu, cleanup, cleanup_auto, qr_payment, send_dish, marketing)
- [ ] `dispatchedToast`: состояние `{ title, subtitle? } | null`
- [ ] `completedToast`: состояние `{ title, subtitle? } | null`
- [ ] Toast «Отправлено»: `bg-[#b8c959]/90 text-black`, иконка `send` (20px)
- [ ] Toast «Завершено»: `bg-green-600/90 text-white`, иконка `check-circle-2` (20px)
- [ ] Оба toast: `fixed top-6 left-6 z-[60]`, `animate-slide-up`, persistent (до крестика)
- [ ] `aria-label` на кнопках закрытия toast
- [ ] `showDispatchedToast(taskType, tableName?)` — title: `{human_name} — отправлено`, subtitle: `tableName` (полная строка, напр. «Стол 5») или `undefined`
- [ ] `showCompletedToast(taskType, tableName?)` — title: `{human_name} — выполнено`, subtitle: `tableName` или `undefined`
- [ ] Fallback: `showCompletedToast()` закрывает `dispatchedToast = null` перед показом completed (H12 решает наложение через flex-стек, закрытие — доп. защита)
- [ ] `poll_cycle()`: `if completed && show_success_notifications` → `showCompletedToast()`
- [ ] `confirmRobotSelection()` (M17): добавлен `showDispatchedToast('marketing')` при успехе
- [ ] `generalSettings.show_success_notifications` = `false` по умолчанию (решение Руслана)
- [ ] Демо-переключатель: «Уведомления о завершении: ВКЛ/ВЫКЛ» (`toggleSuccessNotifications()`)
- [ ] Демо-кнопка: «Имитация: задача завершена» (`simulateTaskCompleted()`)
- [ ] Ручные сценарии (send_menu, cleanup, send_dish, marketing) → dispatched toast **ДА**
- [ ] Авто-сценарии (cleanup_auto, qr_payment) → dispatched toast **НЕТ**
- [ ] Marketing: subtitle = `undefined` (нет целевого стола)
- [ ] Иконки: `send` (20px), `check-circle-2` (20px)

### Позиция уведомлений (H12)
- [ ] Error toast (H5): `class="fixed top-6 left-6 z-[60]"` (было `bottom-6 right-6`)
- [ ] Info toast (H6): `class="fixed top-6 left-6 z-[60]"` (было `bottom-6 right-6`)
- [ ] Dispatched toast (H11): `fixed top-6 left-6 z-[60]` (без изменений, уже верно)
- [ ] Completed toast (H11): `fixed top-6 left-6 z-[60]` (без изменений, уже верно)
- [ ] Flex-контейнер стека: `fixed top-6 left-6 z-[60] flex flex-col space-y-2`
- [ ] Порядок стека: ошибки → инфо → отправка → завершение (сверху вниз)
- [ ] Макс. 3 одновременных toast'а
- [ ] `role="status"`, `aria-live="polite"`, `aria-label="Зона уведомлений"` на flex-контейнере
- [ ] М15 (`top-4 left-4 right-4`) **НЕ** затронута (другой паттерн — баннер раздачи)
- [ ] Fallback в H11 обновлён: комментарии «до H12» → «H12 решает наложение, закрытие — доп. защита»
- [ ] Описание зоны уведомлений (v1.0 L633) — отмечено для обновления при синхронизации базового промта
- [ ] E-STOP toast (v1.1 L240) — отмечен для обновления при синхронизации базового промта

---

## Открытые вопросы (новые)

| #     | Вопрос                                                                                                                                                                               | Критичность | Адресат     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------- |
| НВ-22 | **П1 для остальных сценариев**: Сейчас П1 только для маркетинга. В будущем — опционально для всех сценариев (выбор конкретного робота). Нужна ли в прототипе демо-кнопка?            | Низкая      | Кирилл      |
| НВ-23 | **Авто-выбор единственного свободного робота**: SPEC-003 упоминает «в будущем — авто-выбор». Реализовать ли в прототипе логику «если 1 free → автоматически предвыбрать + зеленить»? | Низкая      | Кирилл      |
| НВ-24 | **П7 auto-refresh**: Сейчас snapshot + кнопка «Обновить». Если П7 открыт долго — нужен ли auto-refresh каждые 10 сек? В реальном плагине — да, но в прототипе это эмуляция           | Информ.     | Кирилл      |
| НВ-25 | **Повторные уведомления: задержка**: Текущий алгоритм показывает повторно на следующем polling-цикле (3 сек). Нужна ли минимальная задержка (напр. 10 сек) чтобы не «мигало»?        | Средняя     | NE / Руслан |
| НВ-26 | **Дедупликация cleanup mixed**: При обратной ситуации (ручная уже есть → авто пытается создать) — в прототипе это фоновый процесс без визуального проявления. Достаточно ли?         | Низкая      | Кирилл      |

---

## Сценарий демонстрации (дополнение к разделу 9.2 базового промта)

К существующему порядку демонстрации добавить:

| #   | Шаг                                              | Описание                                                                                                              |
| --- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 10  | **Переключиться на главный экран**               | Показать 3 кнопки: Маркетинг, Уборка (столы), Статус роботов                                                          |
| 11  | **Статус роботов** → модалка П7                  | Показать read-only таблицу: 2 free, 1 busy, 1 offline. Нажать «Обновить»                                              |
| 12  | **Маркетинг** → модалка П1 → выбор BellaBot-1    | Показать таблицу выбора. Выбрать свободного → «Выбрать» → индикатор круиза с именем                                   |
| 13  | **Маркетинг (busy)** → П1 → выбрать KettyBot-1   | Показать предупреждение «Робот занят»                                                                                 |
| 14  | **E-STOP повторная**                             | Нажать демо-кнопку → toast → закрыть → через 3 сек → toast снова с меткой «ПОВТОРНО»                                  |
| 15  | **Смешанная уборка: дедупликация**               | Переключить режим на «Смешанный» → нажать «Уборка» → info-toast «уже запланирована (авто)»                            |
| 16  | **Fire-and-forget: отправка меню (H10)**         | Открыть «Отправить меню» → кнопка disabled + спиннер → toast «Отправлено» → модалка закрыта                           |
| 17  | **Fire-and-forget: ошибка (H10)**                | Отправить меню → кнопка disabled + спиннер → модалка М11 (ошибка NE API)                                              |
| 18  | **Lifecycle toast: отправка + завершение (H11)** | Отправить меню → акцентный toast «Доставка меню — отправлено. Стол 5»                                                 |
| 19  | **Lifecycle toast: завершение (H11, демо)**      | Включить `show_success_notifications` → нажать «Задача завершена» → зелёный toast «Доставка меню — выполнено. Стол 5» |
| 20  | **Marketing: dispatched toast (H11)**            | Маркетинг → П1 → выбор робота → акцентный toast «Маркетинг-круиз — отправлено» (без subtitle)                         |
| 21  | **QR-оплата: persistent М5 (H13)**               | Открыть QR → пройти до М5 (qr_success) → убедиться, что модалка **не закрывается** автоматически → нажать «Готово»    |
| 22  | **Каталог: dispatched toast (H14)**              | Открыть каталог → ячейка «Toast: Меню отправлено» → акцентный toast с текстом «Доставка меню — отправлено. Стол 5»    |
| 23  | **Каталог: completed toast (H14)**               | Ячейка «Toast: Сценарий выполнен» → зелёный toast «Доставка меню — выполнено. Стол 5»                                 |
| 24  | **Цепочка: fire-and-forget-full (H14)**          | Выбрать цепочку «fire-and-forget-full» → confirm → спиннер → dispatched toast → (5 сек) → completed toast             |

---

## История изменений

| Версия | Дата       | Автор        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0    | 2026-02-11 | Кирилл Тюрин | Первая версия: 12 модальных окон, state-машина, mock-данные, POS-стилистика                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1.1    | 2026-02-13 | Кирилл Тюрин | Промт-патч: два контекста (З-33), М12 мультивыбор (З-35), E-STOP (З-40), ошибки NE (З-39), маппинг NE-статусов (З-42)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 1.2    | 2026-02-13 | Кирилл Тюрин | Промт-патч: рефакторинг навигации — каталог ячеек (Storybook-подход), 26 ячеек, двухуровневая навигация                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.3    | 2026-02-14 | Кирилл Тюрин | Промт-патч: синхронизация со SPEC-003 v1.4. F-серия: таймеры, именование полей, cleanup_auto. G-серия: send_dish разблокирован, М14–М16, сценарные цепочки                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.4    | 2026-02-16 | Кирилл Тюрин | **Промт-патч: П1, П7, уведомления, смешанная уборка, fire-and-forget, lifecycle-toast, позиция toast, persistent, каталог (Э8.2).** H-серия: М17 выбор робота (П1) с 4 состояниями (H2). М18 статус роботов (П7) read-only (H3). Кнопка «Маркетинг» → через П1 (H4). `persistent_repeating` расширен на E_STOP/MANUAL_MODE/OBSTACLE/LOW_BATTERY (H5). Смешанная уборка: cleanup_mode, дедупликация, info-toast (H6). mockAvailableRobots 4 робота (H7). Каталог +8 ячеек (H8). Сценарные цепочки +8 (H9). **Fire-and-forget flow (H10)**: inline-спиннер на кнопке, [DEPRECATED] M9/M10, классификация ручных/авто сценариев. **Lifecycle toast (H11)**: toast dispatched (акцентный, ручные сценарии); toast completed (зелёный, настраиваемый `show_success_notifications`); интеграция с `poll_cycle()` и `confirmRobotSelection()` (marketing); mock `generalSettings`. **Позиция уведомлений (H12)**: все toast перенесены `bottom-6 right-6` → `top-6 left-6`; flex-контейнер стека; исключение М15. **Persistent уведомления (H13)**: убран авто-dismiss М5 (qr_success); все toast/модалки persistent до ручного закрытия. **Каталог + цепочки update (H14)**: +6 ячеек (dispatched ×4, completed, button-submitting); M9/M10 → [DEPRECATED]; 6 цепочек обновлены (fire-and-forget); +2 новые (task-completed-polling, fire-and-forget-full); ScenarioStep + toast/toastText. |
