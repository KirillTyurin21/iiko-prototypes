# Промт-патч v1.5: Двойное отображение имени робота (системное NE + пользовательский alias)

---
**Версия**: 1.5
**Дата**: 2026-02-17
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч (Промт-патч для двойного отображения имени робота)
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront.md (v1.0, 2026-02-11)
**Зависимость**: Промт v1.1 → v1.2 → v1.3 → v1.4 → **v1.5** (этот файл). Применять строго после v1.4.
**Источники**: SPEC-003 v1.13 (2026-02-17) — раздел 2.4.6 (функция `display_robot_name`), разделы 10.1 (П1), 10.2 (П7), 9.4a (уведомления), 9.5 (каталог ошибок)
---

## Назначение

Этот документ — **дельта-патч v1.5** к промту v1.0 (с учётом ранее применённых v1.1–v1.4). Он добавляет:

1. **Двойное отображение имени робота** — во всех UI-элементах, где показывается имя робота, теперь отображаются оба имени: системное (от NE / PUDU Cloud) и пользовательский alias (из iiko Web), если alias задан и отличается от системного
2. **Обновлённые TypeScript-интерфейсы** — `PuduRobot`, `AvailableRobot`, `RobotTask` расширены полями `ne_name` и `alias`
3. **Обновлённые mock-данные** — роботы содержат оба имени (системное + alias)
4. **Утилита `displayRobotName()`** — единая функция форматирования имени для всех контекстов
5. **Обновлённые модалки М17 (П1), М18 (П7)** — двустрочное отображение в колонке «Имя робота»
6. **Обновлённые шаблоны ошибок и toast** — двойное имя в тексте уведомлений

**Порядок применения патчей**:
```
v1.0 (базовый) → v1.1 (контексты) → v1.2 (каталог) → v1.3 (send_dish) → v1.4 (П1, П7, fire-and-forget) → v1.5 (этот файл: двойное имя робота)
```

---

## Сводка изменений (v1.5)

| #   | Раздел / Компонент | Изменение | Тип | Визуальный импакт |
| --- | --- | --- | --- | --- |
| I1  | TypeScript types | Расширены `PuduRobot`, `AvailableRobot`, `RobotTask`: добавлены `ne_name`, `alias` | Данные | Нет (типы) |
| I2  | Утилита `displayRobotName()` | Новая функция: alias + ne_name → форматированный вывод | Логика | Нет (утилита) |
| I3  | М17 (robot_select, П1) | Колонка «Имя робота»: двустрочная ячейка (alias основной + ne_name мелким серым) | **Визуальное** | **Да**: двустрочные имена |
| I4  | М18 (robot_status, П7) | Колонка «Имя робота»: двустрочная ячейка аналогично М17 | **Визуальное** | **Да**: двустрочные имена |
| I5  | Шаблоны ошибок | `{name}` → `displayRobotName()` в 6 шаблонах error_code→текст | Логика | **Да**: «Робот Белла Зал 1 (BellaBot-1): ...» |
| I6  | Toast dispatched/completed | Добавлено имя робота (двойное), если `robot_id` известен | **Визуальное** | **Да**: «Доставка меню — Белла Зал 1 (BellaBot-1) — отправлено. Стол 3» |
| I7  | Mock-данные | `mockRobots`, `mockAvailableRobots` — добавлены `ne_name`, `alias` | Данные | Нет (входные данные) |
| I8  | М1, М2, М3, М14, М16 (confirm-модалки) | Строка «Робот» использует `displayRobotName()` | **Визуальное** | **Да**: двойное имя в подтверждениях |
| I9  | М15 (баннер раздачи) | Текст боннера: `displayRobotName()` | **Визуальное** | **Да** |
| I10 | Индикатор маркетинга | Текст: `displayRobotName()` | **Визуальное** | **Да** |
| I11 | Каталог ячеек (v1.2 update) | +4 ячейки: dual-name примеры | **Визуальное** | **Да** |

---

## I1. Обновление TypeScript-типов

> **Источник**: SPEC-003 v1.13, раздел 2.4.6

### ОБНОВИТЬ: `PuduRobot` (types.ts)

**БЫЛО:**
```typescript
interface PuduRobot {
  robot_id: string;
  robot_name: string;        // "BellaBot-01"
  status: 'idle' | 'busy' | 'offline' | 'error';
  active_map_name: string;
  connection_status: 'online' | 'offline' | 'error';
}
```

**СТАЛО:**
```typescript
interface PuduRobot {
  robot_id: string;
  robot_name: string;        // системное имя из NE / PUDU Cloud: "BellaBot-01"
  ne_name: string;           // v1.5: системное имя NE (= robot_name). Для единообразия с AvailableRobot
  alias: string | null;      // v1.5: пользовательский alias из iiko Web (ConfigManager). null если не задан
  status: 'idle' | 'busy' | 'offline' | 'error';
  active_map_name: string;
  connection_status: 'online' | 'offline' | 'error';
}
```

### ОБНОВИТЬ: `AvailableRobot` (types.ts)

**БЫЛО:**
```typescript
interface AvailableRobot {
  robot_id: string;
  robot_name: string;
  status: 'free' | 'busy' | 'offline';
  current_task: { task_id: string; task_type: string; target_point: string } | null;
}
```

**СТАЛО:**
```typescript
interface AvailableRobot {
  robot_id: string;
  robot_name: string;        // системное имя от NE API (GET /v1/robots/available)
  ne_name: string;           // v1.5: = robot_name (из NE). Хранится отдельно для ясности
  alias: string | null;      // v1.5: пользовательский alias из ConfigManager.Robots[]. null если не задан
  status: 'free' | 'busy' | 'offline';
  current_task: { task_id: string; task_type: string; target_point: string } | null;
}
```

### ОБНОВИТЬ: `RobotTask` (types.ts)

**БУЛО (v1.3):**
```typescript
interface RobotTask {
  task_id: string;
  task_type: TaskType;
  table_id: string;
  robot_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error' | 'cancelled' | 'timeout';
  created_at: string;
  robot_name: string;
}
```

**СТАЛО:**
```typescript
interface RobotTask {
  task_id: string;
  task_type: TaskType;
  table_id: string;
  robot_id: string;
  ne_name: string;           // v1.5: системное имя робота из NE
  alias: string | null;      // v1.5: пользовательский alias из iiko Web
  status: 'pending' | 'in_progress' | 'completed' | 'error' | 'cancelled' | 'timeout';
  created_at: string;
  robot_name: string;        // deprecated v1.5 → используйте displayRobotName(ne_name, alias)
}
```

---

## I2. Утилита `displayRobotName()`

> **Источник**: SPEC-003 v1.13, раздел 2.4.6 — функция `display_robot_name`

### ДОБАВИТЬ: `utils/display-robot-name.ts`

```typescript
/**
 * Формирует отображаемое имя робота.
 * Показывает оба имени (системное NE + пользовательский alias), если alias задан и отличается.
 *
 * @param ne_name - Системное имя из NE / PUDU Cloud (например, "BellaBot-1")
 * @param alias - Пользовательский alias из iiko Web (ConfigManager). null если не задан
 * @param robot_id - Серийный номер робота (fallback)
 * @returns Форматированная строка для показа в UI
 *
 * Примеры:
 *   displayRobotName("BellaBot-1", "Белла Зал 1")       → "Белла Зал 1 (BellaBot-1)"
 *   displayRobotName("BellaBot-1", "BellaBot-1")         → "BellaBot-1"
 *   displayRobotName("BellaBot-1", null)                  → "BellaBot-1"
 *   displayRobotName(null, "Белла Зал 1", "PD20240600")  → "Белла Зал 1"
 *   displayRobotName(null, null, "PD2024060012")           → "PD2024060012"
 */
export function displayRobotName(
  ne_name: string | null,
  alias: string | null,
  robot_id?: string
): string {
  if (alias && ne_name && alias !== ne_name) {
    return `${alias} (${ne_name})`;
  }
  if (ne_name) return ne_name;
  if (alias) return alias;
  return robot_id ?? 'Неизвестный робот';
}

/**
 * Для двустрочного отображения в таблицах (П1, П7).
 * Возвращает объект {primary, secondary}:
 *   primary — основное имя (alias или ne_name)
 *   secondary — системное имя NE (если alias отличается), иначе null
 */
export function displayRobotNameDual(
  ne_name: string | null,
  alias: string | null,
  robot_id?: string
): { primary: string; secondary: string | null } {
  if (alias && ne_name && alias !== ne_name) {
    return { primary: alias, secondary: ne_name };
  }
  if (ne_name) return { primary: ne_name, secondary: null };
  if (alias) return { primary: alias, secondary: null };
  return { primary: robot_id ?? 'Неизвестный робот', secondary: null };
}
```

---

## I3. Обновление М17 (robot_select, П1) — двустрочное имя

> **Источник**: SPEC-003 v1.13, раздел 10.1

### ОБНОВИТЬ: HTML шаблон М17 — ячейка имени робота

**БЫЛО (v1.4, строка ~L188):**
```html
<!-- Ячейка имени -->
<div class="text-sm font-medium text-gray-100">
  {{ robot.robot_name }}
</div>
```

**СТАЛО:**
```html
<!-- v1.5 I3: Двойное имя робота (alias + системное) -->
<div class="flex flex-col">
  <span class="text-sm font-medium text-gray-100">
    {{ displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id).primary }}
  </span>
  @if (displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id).secondary) {
    <span class="text-xs text-gray-400">
      {{ displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id).secondary }}
    </span>
  }
</div>
```

### ОБНОВИТЬ: Индикатор выбранного робота (М17, строка ~L227)

**БЫЛО:**
```html
Выбрано: <span class="font-medium">{{ selectedRobot.robot_name }}</span>
```

**СТАЛО:**
```html
<!-- v1.5 I3: двойное имя в индикаторе -->
Выбрано: <span class="font-medium">{{ displayRobotName(selectedRobot.ne_name, selectedRobot.alias, selectedRobot.robot_id) }}</span>
```

### ОБНОВИТЬ: ASCII-макет М17

**БЫЛО (v1.4, строки ~L126–L137):**
```
│Имя робота│  ID               │Статус  │Задача    │
│BellaBot-1│  PD2024060012...  │Свободен│ —        │
│BellaBot-2│  PD2024060034...  │Занят   │ send_menu│
│Ketty-01  │  PD2024060056...  │Занят   │ cleanup  │
│Ketty-02  │  PD2024060078...  │Оффлайн │ —        │
```

**СТАЛО:**
```
│Имя робота       │  ID               │Статус  │Задача    │
│Белла Зал 1      │  PD2024060012...  │Свободен│ —        │
│ BellaBot-1      │                   │        │          │
│BellaBot-2       │  PD2024060034...  │Занят   │ send_menu│
│ (без alias)     │                   │        │          │
│Терраса          │  PD2024060056...  │Занят   │ cleanup  │
│ KettyBot-1      │                   │        │          │
│KettyBot-2       │  PD2024060078...  │Оффлайн │ —        │
│ (без alias)     │                   │        │          │
                              Выбрано: Белла Зал 1 (BellaBot-1)
```

---

## I4. Обновление М18 (robot_status, П7) — двустрочное имя

> **Источник**: SPEC-003 v1.13, раздел 10.2

### ОБНОВИТЬ: HTML шаблон М18 — ячейка имени робота

**БУЛО (v1.4, строка ~L420):**
```html
<div class="text-sm font-medium text-gray-100">
  {{ robot.robot_name }}
</div>
```

**СТАЛО:**
```html
<!-- v1.5 I4: Двойное имя робота (аналогично М17) -->
<div class="flex flex-col">
  <span class="text-sm font-medium text-gray-100">
    {{ displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id).primary }}
  </span>
  @if (displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id).secondary) {
    <span class="text-xs text-gray-400">
      {{ displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id).secondary }}
    </span>
  }
</div>
```

---

## I5. Обновление шаблонов ошибок

> **Источник**: SPEC-003 v1.13, раздел 9.5

### ОБНОВИТЬ: Объект `ERROR_TEMPLATES` (v1.4 H5, строки ~L628–L633)

**БЫЛО:**
```typescript
const ERROR_TEMPLATES: Record<string, string> = {
  'E_STOP':      'Робот {name}: АВАРИЙНАЯ ОСТАНОВКА. Красная кнопка нажата',
  'MANUAL_MODE': 'Робот {name}: переведён в ручной режим (открыты настройки)',
  'OBSTACLE':    'Робот {name}: обнаружено препятствие на маршруте',
  'LOW_BATTERY': 'Робот {name}: низкий заряд батареи',
  'TASK_FAILED': 'Робот {name}: ошибка выполнения задачи {task_type}',
  'UNKNOWN':     'Робот {name}: неизвестная ошибка. Код: {error_code}'
};
```

**СТАЛО:**
```typescript
// v1.5 I5: {name} заменён на {display_name} — формируется displayRobotName(ne_name, alias, robot_id)
const ERROR_TEMPLATES: Record<string, string> = {
  'E_STOP':      'Робот {display_name}: АВАРИЙНАЯ ОСТАНОВКА. Красная кнопка нажата',
  'MANUAL_MODE': 'Робот {display_name}: переведён в ручной режим (открыты настройки)',
  'OBSTACLE':    'Робот {display_name}: обнаружено препятствие на маршруте',
  'LOW_BATTERY': 'Робот {display_name}: низкий заряд батареи',
  'TASK_FAILED': 'Робот {display_name}: ошибка выполнения задачи {task_type}',
  'UNKNOWN':     'Робот {display_name}: неизвестная ошибка. Код: {error_code}'
};

// Использование:
function formatErrorMessage(template: string, robot: AvailableRobot | PuduRobot, error_code: string, task_type?: string): string {
  const display_name = displayRobotName(robot.ne_name, robot.alias, robot.robot_id);
  return template
    .replace('{display_name}', display_name)
    .replace('{task_type}', task_type ?? '')
    .replace('{error_code}', error_code);
}
```

---

## I6. Обновление toast dispatched/completed

> **Источник**: SPEC-003 v1.13, раздел 2.4.6 — формат по типу UI-элемента

### ОБНОВИТЬ: Toast dispatched (v1.4 H11)

**БУЛО:**
```typescript
// Текст dispatched: «{human_name} — отправлено. Стол {N}»
const toastText = `${humanName} — отправлено. Стол ${tableId}`;
```

**СТАЛО:**
```typescript
// v1.5 I6: Добавлено двойное имя робота в dispatched toast
// Формат: «{human_name} — {display_name} — отправлено. Стол {N}»
// Для маркетинга (без стола): «{human_name} — {display_name} — отправлено»
const robotDisplayName = robot
  ? displayRobotName(robot.ne_name, robot.alias, robot.robot_id)
  : null;
const toastText = robotDisplayName
  ? (tableId
    ? `${humanName} — ${robotDisplayName} — отправлено. Стол ${tableId}`
    : `${humanName} — ${robotDisplayName} — отправлено`)
  : `${humanName} — отправлено. Стол ${tableId}`;
```

### ОБНОВИТЬ: Toast completed (v1.4 H11)

**БЫЛО:**
```typescript
// Текст completed: «{human_name} — выполнено. Стол {N}»
const toastText = `${humanName} — выполнено. Стол ${tableId}`;
```

**СТАЛО:**
```typescript
// v1.5 I6: Добавлено двойное имя робота в completed toast
const robotDisplayName = task.robot_id
  ? displayRobotName(task.ne_name, lookupAlias(task.robot_id), task.robot_id)
  : null;
const toastText = robotDisplayName
  ? `${humanName} — ${robotDisplayName} — выполнено. Стол ${tableId}`
  : `${humanName} — выполнено. Стол ${tableId}`;
```

---

## I7. Обновление mock-данных

> **Источник**: SPEC-003 v1.13, раздел 2.4.6 — обогащение данных NE

### ОБНОВИТЬ: `mockRobots` (v1.1, data/mock.ts)

**БЫЛО (v1.1 D8.5):**
```typescript
const mockRobots: PuduRobot[] = [
  { robot_id: 'PD2024060012', robot_name: 'BellaBot-01', status: 'idle', active_map_name: 'Зал основной', connection_status: 'online' },
  { robot_id: 'PD2024060034', robot_name: 'Ketty-02', status: 'idle', active_map_name: 'Зал основной', connection_status: 'online' }
];
```

**СТАЛО:**
```typescript
// v1.5 I7: добавлены ne_name и alias
const mockRobots: PuduRobot[] = [
  {
    robot_id: 'PD2024060012',
    robot_name: 'BellaBot-01',
    ne_name: 'BellaBot-01',
    alias: 'Белла Зал 1',        // Администратор задал alias в iiko Web
    status: 'idle',
    active_map_name: 'Зал основной',
    connection_status: 'online'
  },
  {
    robot_id: 'PD2024060034',
    robot_name: 'KettyBot-01',
    ne_name: 'KettyBot-01',
    alias: null,                   // Alias не задан — отображается только системное имя
    status: 'idle',
    active_map_name: 'Зал основной',
    connection_status: 'online'
  }
];
```

### ОБНОВИТЬ: `mockAvailableRobots` (v1.4 H7, data/mock.ts)

**БЫЛО (v1.4 H7):**
```typescript
const mockAvailableRobots: AvailableRobot[] = [
  { robot_id: 'PD2024060012', robot_name: 'BellaBot-1', status: 'free', current_task: null },
  { robot_id: 'PD2024060034', robot_name: 'BellaBot-2', status: 'busy', current_task: { task_id: 'task-201', task_type: 'send_menu', target_point: 'SF234205E' } },
  { robot_id: 'PD2024060056', robot_name: 'KettyBot-1', status: 'busy', current_task: { task_id: 'task-202', task_type: 'cleanup', target_point: 'SF234207G' } },
  { robot_id: 'PD2024060078', robot_name: 'KettyBot-2', status: 'offline', current_task: null }
];
```

**СТАЛО:**
```typescript
// v1.5 I7: добавлены ne_name и alias (имитация обогащения из ConfigManager)
const mockAvailableRobots: AvailableRobot[] = [
  {
    robot_id: 'PD2024060012',
    robot_name: 'BellaBot-1',
    ne_name: 'BellaBot-1',
    alias: 'Белла Зал 1',              // Alias задан → двустрочное отображение
    status: 'free',
    current_task: null
  },
  {
    robot_id: 'PD2024060034',
    robot_name: 'BellaBot-2',
    ne_name: 'BellaBot-2',
    alias: null,                         // Alias не задан → одна строка
    status: 'busy',
    current_task: { task_id: 'task-201', task_type: 'send_menu', target_point: 'SF234205E' }
  },
  {
    robot_id: 'PD2024060056',
    robot_name: 'KettyBot-1',
    ne_name: 'KettyBot-1',
    alias: 'Терраса',                    // Alias задан → двустрочное отображение
    status: 'busy',
    current_task: { task_id: 'task-202', task_type: 'cleanup', target_point: 'SF234207G' }
  },
  {
    robot_id: 'PD2024060078',
    robot_name: 'KettyBot-2',
    ne_name: 'KettyBot-2',
    alias: null,                         // Alias не задан
    status: 'offline',
    current_task: null
  }
];
```

### ОБНОВИТЬ: `mockNotifications` — тексты ошибок с двойным именем

**БЫЛО (v1.1 D7.2):**
```typescript
{ title: 'Робот BellaBot-01: ошибка при уборке', ... }
{ title: 'Робот BellaBot-01: ручной режим', ... }
{ title: 'Робот Ketty-02: препятствие на маршруте', ... }
{ title: 'Робот BellaBot-01: низкий заряд батареи', ... }
```

**СТАЛО:**
```typescript
// v1.5 I7: двойные имена в уведомлениях
{ title: 'Робот Белла Зал 1 (BellaBot-01): ошибка при уборке', ... }
{ title: 'Робот Белла Зал 1 (BellaBot-01): ручной режим', ... }
{ title: 'Робот KettyBot-01: препятствие на маршруте', ... }  // alias не задан — только системное
{ title: 'Робот Белла Зал 1 (BellaBot-01): низкий заряд батареи', ... }
```

---

## I8. Обновление confirm-модалок (М1, М2, М3, М14, М16)

> **Источник**: SPEC-003 v1.13, раздел 2.4.6 — формат «строка подтверждения»

### ОБНОВИТЬ: Строка «Робот» в модалках подтверждения

Все модалки с карточкой-деталями содержат строку «Робот: BellaBot-01». Заменить на двойное имя.

**БЫЛО (базовый / v1.1, общий паттерн):**
```html
<div class="flex justify-between items-center">
  <span class="text-sm text-gray-400">Робот</span>
  <span class="text-sm font-medium">BellaBot-01</span>
</div>
```

**СТАЛО:**
```html
<!-- v1.5 I8: двойное имя робота в confirm-модалке -->
<div class="flex justify-between items-center">
  <span class="text-sm text-gray-400">Робот</span>
  <span class="text-sm font-medium">
    {{ displayRobotName(assignedRobot.ne_name, assignedRobot.alias, assignedRobot.robot_id) }}
  </span>
</div>
```

> **Затронуты**: М1 (`send_menu_confirm`), М2 (`cleanup_confirm`), М3 (`qr_cashier_phase`), М14 (`send_dish_confirm`), М16 (`send_dish_repeat`).

> **Источник данных для `assignedRobot`**: Функция `getAssignedRobot()` (v1.1 D8.7) — возвращает `PuduRobot` из `mockRobots`. В v1.5 `PuduRobot` содержит `ne_name` и `alias`.

---

## I9. Обновление М15 (баннер раздачи)

> **Источник**: SPEC-003 v1.13, раздел 2.4.6

### ОБНОВИТЬ: Текст баннера (v1.3, строка ~L578)

**БЫЛО:**
```html
<span class="text-sm font-semibold text-amber-100">Робот {{ robotName }} прибыл</span>
```

**СТАЛО:**
```html
<!-- v1.5 I9: двойное имя в баннере раздачи -->
<span class="text-sm font-semibold text-amber-100">
  Робот {{ displayRobotName(robot.ne_name, robot.alias, robot.robot_id) }} прибыл
</span>
```

---

## I10. Обновление индикатора маркетинга

> **Источник**: SPEC-003 v1.13, раздел 2.4.6

### ОБНОВИТЬ: Текст индикатора (v1.4, строка ~L608)

**БЫЛО:**
```html
Маркетинг-круиз активен · {{ marketingRobotName }}
```

**СТАЛО:**
```html
<!-- v1.5 I10: двойное имя в индикаторе маркетинга -->
Маркетинг-круиз активен · {{ displayRobotName(marketingRobot.ne_name, marketingRobot.alias, marketingRobot.robot_id) }}
```

---

## I11. Обновление каталога ячеек

> **Источник**: SPEC-003 v1.13

### ДОБАВИТЬ: Новые ячейки каталога

| Секция | Ячейка | Описание |
| --- | --- | --- |
| Модальные окна | `modal-robot-select-dual-name` | М17: двустрочное имя (alias + NE name) для BellaBot-1 (с alias «Белла Зал 1») |
| Модальные окна | `modal-robot-status-dual-name` | М18: двустрочное имя, аналогично |
| Уведомления | `notification-error-dual-name` | Toast ошибки: «Робот Белла Зал 1 (BellaBot-1): АВАРИЙНАЯ ОСТАНОВКА...» |
| Toast/State | `toast-dispatched-dual-name` | Toast dispatched: «Доставка меню — Белла Зал 1 (BellaBot-1) — отправлено. Стол 3» |

### ОБНОВИТЬ: Сценарные цепочки

| Цепочка | Flow (обновление) |
| --- | --- |
| `marketing-with-select` | M17 → двустрочное имя → выбор → индикатор с двойным именем |
| `robot-status-view` | M18 → двустрочные имена роботов |
| `notification-repeating-estop` | Toast c двойным именем: «Робот Белла Зал 1 (BellaBot-1): АВАРИЙНАЯ ОСТАНОВКА...» |
| `fire-and-forget-full` | М1 → двойное имя в «Робот:» → dispatched toast с двойным именем |

---

## Резюме визуальных изменений

| UI-элемент | Было | Стало (v1.5) |
| --- | --- | --- |
| **М17 (П1)**: ячейка таблицы | `BellaBot-1` (одна строка) | `Белла Зал 1` + `BellaBot-1` (две строки, вторая мелким серым) |
| **М18 (П7)**: ячейка таблицы | `BellaBot-1` (одна строка) | Аналогично М17 |
| **М1/М2/М3/М14/М16**: «Робот» | `Робот: BellaBot-01` | `Робот: Белла Зал 1 (BellaBot-01)` |
| **М15**: баннер раздачи | `Робот BellaBot-01 прибыл` | `Робот Белла Зал 1 (BellaBot-01) прибыл` |
| **Toast error** | `Робот BellaBot-01: АВАРИЯ...` | `Робот Белла Зал 1 (BellaBot-01): АВАРИЯ...` |
| **Toast dispatched** | `Доставка меню — отправлено. Стол 3` | `Доставка меню — Белла Зал 1 (BellaBot-01) — отправлено. Стол 3` |
| **Индикатор маркетинга** | `...активен · BellaBot-1` | `...активен · Белла Зал 1 (BellaBot-1)` |
| **Без alias** | `KettyBot-01` | `KettyBot-01` (без изменений — одна строка / одно имя) |

---

## Перекрёстные ссылки

| Элемент | SPEC-003 v1.13 |
| --- | --- |
| Функция `display_robot_name()` | Раздел 2.4.6 |
| Формат по типу UI-элемента | Раздел 2.4.6, таблица «Формат» |
| Двустрочная колонка П1 | Раздел 10.1 |
| Двустрочная колонка П7 | Раздел 10.2 |
| Каталог ошибок `[display_name]` | Раздел 9.5 |
| Обогащение данных NE | Раздел 2.4.6, блок «Обогащение» |
| Открытый вопрос НВ-16 | Раздел 13 |

---

*Патч написан на основании SPEC-003 v1.13 (2026-02-17). При применении учитывать зависимость от v1.4.*
