# Промт-патч v1.10: Бизнес-правила маркетинга — `idle_timeout_sec` и UX-подсказка — экран Б3

---
**Версия**: 1.10
**Дата**: 2026-02-18
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д3-патч (Промт-патч для обновления прототипа iikoWeb)
**Базовый документ**: Промт_прототипа_PUDU_Admin_панели_v1.9_патч.md (v1.9, 2026-02-18)
**Источники**: SPEC-002 v1.17 (разделы 7.6, 7.6a); анализ `2026-02-18-анализ-конфликта-маркетинг-after-action.md`
**Scope**: Вкладка «Маркетинг» (Э4 / Б3): новое поле `idle_timeout_sec`, информационный блок о взаимодействии с `after_action`, обновление mock-данных
---

## Назначение

Этот документ — **дельта-патч** к промту v1.9 (через цепочку v1.1 → v1.9). Он реализует **Вариант A (разделение ответственности)** для взаимодействия настроек `after_action` (per-robot, вкладка «Роботы» Б5) и маркетинговых настроек (вкладка «Маркетинг» Б3).

**Бизнес-контекст**:
- В Admin Panel маркетинг настраивается в **двух местах**: per-robot `after_action` на Б5 и общие маркетинговые настройки на Б3
- Принят **Вариант A**: `after_action` = реактивный триггер (после задачи), `marketing` tab = проактивный (при простое / расписание)
- Необходимо добавить параметр `idle_timeout_sec` — время паузы между парковкой и запуском маркетинга при простое
- Необходимо добавить UX-подсказку, объясняющую взаимодействие двух настроек

> **Источник**: Вопрос тестировщика: *«Получается, выбор робота для маркетинга можно сделать и через команду "действие после задачи" и через страницу Маркетинг? Какое время считается простоем?»*

**Инструкция по применению**: сначала примени базовый промт v1.1, затем патчи v1.2 → v1.3 → v1.4 → v1.5 → v1.6 → v1.7 → v1.8 → v1.9 → затем этот патч v1.10 — последовательно.

**Ключевые изменения v1.10:**
- Новое поле #6 `idle_timeout_sec` (UiInput number, 0–300, default 30) на вкладке «Маркетинг»
- Информационный блок (UiAlert info) — объяснение взаимодействия `after_action` и маркетинга
- Mock-данные: добавлен `idle_timeout_sec: 30` в `mockScenarioSettings.marketing`

---

## Совместимость с предыдущими патчами

| Патч           | Совместимость | Примечание                                        |
| -------------- | ------------- | ------------------------------------------------- |
| v1.1 (базовый) | Требуется     | Базовые экраны, в т.ч. Э4                         |
| v1.2 (C1–C10)  | Требуется     | C5: вкладка «Общие» убрана, 5 вкладок             |
| v1.7 (J1–J5)   | Требуется     | J1–J5: UiMultiSelect роботов на вкладке Marketing |
| v1.8 (K1–K8)   | Совместим     | Не затрагивает вкладку Marketing                  |
| v1.9 (L1–L8)   | Совместим     | Не затрагивает вкладку Marketing                  |

Остальные патчи: совместимы, не затрагивают вкладку Marketing.

---

## Блоки изменений

### M1. Добавить поле `idle_timeout_sec` на вкладку «Маркетинг»

**Файл**: `app/settings/page.tsx` (секция вкладки Marketing)

**Расположение**: После чекбокса «Автозапуск круиза при простое» (`auto_start_on_idle`), перед чекбоксом «Запуск по таймеру» (`start_by_timer`).

**Условная видимость**: Поле отображается **только** при включённом чекбоксе «Автозапуск круиза при простое» (`auto_start_on_idle === true`).

### ДОБАВИТЬ

```tsx
{/* Поле idle_timeout_sec — видно только при auto_start_on_idle */}
{settings.marketing.auto_start_on_idle && (
  <div className="space-y-2">
    <Label htmlFor="idle_timeout_sec" className="text-sm font-medium text-gray-700">
      Таймаут простоя (сек)
    </Label>
    <div className="flex items-center gap-3">
      <Input
        id="idle_timeout_sec"
        type="number"
        min={0}
        max={300}
        value={settings.marketing.idle_timeout_sec}
        onChange={(e) => updateSettings('marketing', 'idle_timeout_sec', parseInt(e.target.value) || 0)}
        className="w-24"
        aria-label="Таймаут простоя в секундах"
      />
      <span className="text-sm text-gray-500">секунд</span>
    </div>
    <p className="text-xs text-gray-400 italic">
      Через сколько секунд после парковки робота он считается «в простое» и запускается маркетинг.
      Рекомендуемое значение: 30 сек. При after_action = «Маркетинг» круиз запускается немедленно (без этого таймаута).
    </p>
    {(settings.marketing.idle_timeout_sec < 0 || settings.marketing.idle_timeout_sec > 300) && (
      <p className="text-xs text-red-500">Значение должно быть от 0 до 300</p>
    )}
  </div>
)}
```

**Поведение:**
- По умолчанию: `30`
- Валидация: целое число 0–300
- При `0` — маркетинг стартует немедленно после парковки (аналогично `after_action = marketing`, но через проактивный триггер)
- При скрытии чекбокса `auto_start_on_idle` — поле скрывается, значение **сохраняется** в state (не сбрасывается)

---

### M2. Добавить информационный блок (UiAlert) на вкладку «Маркетинг»

**Файл**: `app/settings/page.tsx` (секция вкладки Marketing)

**Расположение**: В верхней части вкладки «Маркетинг», **перед** полем «Роботы для маркетинга» (UiMultiSelect) и **после** существующего Warning-блока о PuduLink.

### ДОБАВИТЬ

```tsx
{/* Info-блок: взаимодействие after_action и маркетинга */}
<Alert className="border-blue-200 bg-blue-50/50">
  <Info className="h-4 w-4 text-blue-500" />
  <AlertTitle className="text-sm font-medium text-blue-800">
    Взаимодействие с настройкой «Действие после задачи»
  </AlertTitle>
  <AlertDescription className="text-xs text-blue-700 mt-1">
    Роботы с настройкой «Действие после задачи = Маркетинг» (вкладка Роботы)
    автоматически включаются в список маркетинга и запускают круиз
    сразу после каждой рабочей задачи. Здесь настраивается дополнительный
    запуск при простое и по расписанию.
  </AlertDescription>
</Alert>
```

**Импорт** (если не добавлен): `import { Info } from "lucide-react"` (иконка `info`).

---

### M3. Обновить mock-данные

**Файл**: Файл с mock-данными (constants / mock section)

### БЫЛО

```typescript
marketing: {
  robot_ids: [],
  auto_start_on_idle: false,
  start_by_timer: false,
  time_start: null,
  time_end: null,
},
```

### СТАЛО

```typescript
marketing: {
  robot_ids: [],
  auto_start_on_idle: false,
  idle_timeout_sec: 30,
  start_by_timer: false,
  time_start: null,
  time_end: null,
},
```

---

### M4. Обновить TypeScript интерфейс

**Файл**: Файл с типами (types section)

### БЫЛО

```typescript
interface MarketingSettings {
  robot_ids: string[];
  auto_start_on_idle: boolean;
  start_by_timer: boolean;
  time_start: string | null;
  time_end: string | null;
}
```

### СТАЛО

```typescript
interface MarketingSettings {
  robot_ids: string[];
  auto_start_on_idle: boolean;
  idle_timeout_sec: number;
  start_by_timer: boolean;
  time_start: string | null;
  time_end: string | null;
}
```

---

## Порядок элементов на вкладке «Маркетинг» (после патча)

```
1. Warning-блок «Загрузка рекламных материалов» (PuduLink)       [существующий]
2. Info-блок «Взаимодействие с after_action»                      [НОВЫЙ — M2]
3. Поле «Роботы для маркетинга» (UiMultiSelect)                  [существующий]
4. Чекбокс «Автозапуск круиза при простое»                        [существующий]
5. Поле «Таймаут простоя (сек)» (UiInput number, 0–300)          [НОВЫЙ — M1, условно при #4 = ON]
6. Чекбокс «Запуск по таймеру»                                   [существующий]
7. Поле «Время начала» (UiInput time)                             [существующий, условно при #6 = ON]
8. Поле «Время окончания» (UiInput time)                          [существующий, условно при #6 = ON]
```

---

## Чек-лист применения патча

- [ ] M1: Поле `idle_timeout_sec` добавлено на вкладку Marketing
- [ ] M1: Поле видно только при `auto_start_on_idle === true`
- [ ] M1: Валидация 0–300 работает, ошибка при выходе за диапазон
- [ ] M1: Подсказка под полем отображается корректно
- [ ] M2: Info-блок (blue) отображается в верхней части вкладки
- [ ] M2: Info-блок расположен после Warning-блока PuduLink
- [ ] M3: Mock-данные содержат `idle_timeout_sec: 30`
- [ ] M4: TypeScript интерфейс обновлён
- [ ] Сохранение настроек: `idle_timeout_sec` отправляется в PUT /api/pudu/settings
- [ ] При переключении `auto_start_on_idle` OFF → ON → поле `idle_timeout_sec` появляется с сохранённым значением

---

## Перекрёстные ссылки

| Документ       | Раздел                                                  | Что связано                                  |
| -------------- | ------------------------------------------------------- | -------------------------------------------- |
| SPEC-002 v1.17 | 7.6, поле #6                                            | Спецификация поля `idle_timeout_sec`         |
| SPEC-002 v1.17 | 7.6a                                                    | Бизнес-правила R1–R6                         |
| SPEC-002 v1.17 | 2.8.5                                                   | JSON-модель БД: `marketing.idle_timeout_sec` |
| SPEC-003 v1.15 | 8.2                                                     | 4-й триггер, PlantUML                        |
| SPEC-003 v1.15 | 8.3                                                     | Логика перезапуска с `idle_timeout_sec`      |
| SPEC-003 v1.15 | 9.7                                                     | `check_marketing_after_task()`               |
| Анализ         | `2026-02-18-анализ-конфликта-маркетинг-after-action.md` | Вариант A                                    |
