# Copilot Instructions — Прототипы

## Контекст проекта

Это рабочая область для **системного аналитика**. Здесь создаются интерактивные веб-прототипы плагинов для **Front** и панелей администрирования **Web**.

Каждый прототип — это **отдельный мини-проект** внутри общей рабочей области. У прототипов разные заказчики, разные задачи, разная бизнес-логика.

---

## Git Branching Strategy

Репозиторий использует **две ветки**:

| Ветка | Роль | Деплой |
|-------|------|--------|
| `master` | **Продакшен** — стабильная версия, видна заказчикам | Автоматический → view21.ru |
| `dev` | **Рабочая** — все доработки сначала сюда | Нет (только локально) |

### Рабочий процесс

1. **Вся работа** ведётся в ветке `dev`
2. Коммитим → пушим в `origin/dev`
3. Проверяем локально (`npm run dev`)
4. Когда готово → мержим `dev → master` (через промт «Опубликовать DEV в MASTER»)
5. `git push origin master` → автоматический деплой на view21.ru

### Правила

- **Вся разработка** — только в ветке `dev`
- Мерж в `master` — через автоматический промт (checkout master → merge dev → push)
- Перед мержем — убедиться что `npm run build` проходит без ошибок
- Можно накопить несколько изменений в `dev` и замержить разом

---

## Changelogs (История изменений)

Каждый прототип имеет структурированный TypeScript-файл `changelog.data.ts` в своей папке. Changelog **отображается в UI** прототипа — в top-bar показана версия и дата, по клику открывается модальное окно с полной историей.

### Расположение

```
src/app/prototypes/<slug>/changelog.data.ts   ← для каждого прототипа
src/app/shared/changelog.types.ts              ← типы ChangelogRelease, ChangeGroup
src/app/components/layout/
├── changelog-button.component.ts              ← кнопка версии в top-bar
└── changelog-modal.component.ts               ← модалка с историей
```

### Формат данных (TypeScript)

```typescript
import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.2',          // MAJOR.MINOR
    date: '2026-02-17',      // YYYY-MM-DD
    status: 'released',      // 'released' | 'unreleased'
    changes: [
      {
        page: 'Список ресторанов',                          // группировка по странице
        pageRoute: '/prototype/pudu-admin',                  // кликабельная ссылка
        items: [
          'Добавлена колонка «Статус NE» в таблицу',
          'Кнопка подключения к NE с модальным окном',
        ],
      },
      {
        // Без page = «Общие изменения»
        items: ['Обновлены стили breadcrumbs'],
      },
    ],
  },
];
```

### Версионирование

| Что изменилось | Как версионировать |
|---|---|
| Создание прототипа | `1.0` |
| Небольшие правки (баги, тексты, стили) | `+0.1` |
| Новый экран или функциональность | `+0.1` |
| Крупная переработка | `+1.0` |

### ОБЯЗАТЕЛЬНЫЕ правила ведения changelog

1. **При КАЖДОМ изменении прототипа** — обновить `changelog.data.ts`:
   - Если есть секция `status: 'unreleased'` — добавить изменения туда
   - Если нет — создать новую секцию сверху с новой версией (+0.1) и `status: 'unreleased'`
2. **Группировать** изменения **по страницам** с `pageRoute` для кликабельности
3. Писать **понятным русским языком**: «Добавлена колонка "Статус" на странице Список ресторанов» — НЕ «G4-G7: update type»
4. Записи идут **от новых к старым** (первый элемент массива — самая свежая версия)
5. **При мерже `dev → master`** — сменить `status: 'unreleased'` → `'released'`
6. **После мержа** — ничего создавать не нужно (новая unreleased-секция появится при следующем изменении)
7. При создании **нового прототипа** — создать `changelog.data.ts` с версией `1.0`
8. Добавить новый slug в `switch` компонента `changelog-button.component.ts`

### Шаблон нового changelog

```typescript
import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: 'YYYY-MM-DD',
    status: 'unreleased',
    changes: [
      {
        items: ['Создан прототип: <краткое описание>'],
      },
    ],
  },
];
```

---

## Технологический стек

- **Angular 16** + **TypeScript** (standalone-компоненты)
- **Angular CLI** — dev-сервер, порт 3000
- **Tailwind CSS** — утилитарные стили, кастомная тема
- **Angular Router** — маршрутизация (lazy loading)
- **Lucide Angular** — иконки (`lucide-angular`)
- UI-компоненты: `@/components/ui` (UiButton, UiCard, UiInput, UiSelect, UiTextarea, UiCheckbox, UiToggle, UiModal, UiConfirmDialog, UiTable, UiTabs, UiBadge, UiAlert, UiBreadcrumbs, UiStatusDot, UiEmptyState, UiDivider, UiSkeleton)

## Angular 16 — ключевые паттерны

- **Standalone-компоненты**: каждый компонент `standalone: true`, импортирует зависимости напрямую
- **inject()** вместо constructor injection: `private router = inject(Router)`
- **Директивы**: `*ngIf`, `*ngFor` (Angular 16, НЕ @if/@for — это Angular 17+)
- **FormsModule** для двусторонней привязки: `[(value)]="model"` в UI-компонентах
- **Lazy loading**: маршруты через `loadComponent()` и `loadChildren()`

## Стилизация — Web Design System

- **Фреймворк-ориентир**: Angular 16 Material Design (Web)
- **Шрифт**: Roboto
- **Цвета**: определены в `tailwind.config.js` → `theme.extend.colors`
  - `app-primary` (#1976D2) — основной синий
  - `app-accent` (#FF6D00) — акцентный оранжевый
  - `sidebar-bg` (#263238) — тёмный sidebar
  - `surface`, `border`, `text` — семантические токены
- **Тени**: `elevation-1`, `elevation-2`, `elevation-3`, `elevation-modal`
- Когда пользователь присылает **скриншоты Web** — воспроизводить дизайн максимально близко

---

## Мультиагентная система работы

### Принцип: разделяй и властвуй

При создании или модификации прототипа **ВСЕГДА** используй мультиагентный подход:

1. **Основной агент** (ты) — координатор. Планирует, декомпозирует, контролирует
2. **Sub-агенты** (`runSubagent`) — исполнители отдельных задач:
   - Исследование (поиск кода, чтение файлов, анализ структуры)
   - Создание отдельных экранов / компонентов
   - Рефакторинг
   - Проверка ошибок

### Когда запускать sub-агентов

- Задача имеет **3+ независимых частей** (экраны, компоненты, логика)
- Нужно **исследовать** существующий код перед изменением
- Нужно **параллельно** проверить несколько файлов
- Сложная бизнес-логика требует отдельного анализа

### Формат промпта для sub-агента

Всегда передавай sub-агенту:
- Чёткое описание задачи (что сделать)
- Контекст (какие файлы читать, какие компоненты использовать)
- Ограничения (только исследование / только код / формат ответа)
- Что именно вернуть в финальном сообщении

---

## Управление задачами (Todo List)

### ОБЯЗАТЕЛЬНО используй `manage_todo_list` для:

- Любой задачи с **2+ шагами**
- Создания нового прототипа
- Модификации существующего прототипа
- Добавления новых экранов / компонентов

### Стандартный шаблон декомпозиции нового прототипа

```
1. Анализ требований и планирование экранов
2. Создание структуры папок прототипа
3. Создание маршрутов (slug.routes.ts)
4. Создание корневого компонента с router-outlet
5. Создание экрана 1: [название]
6. Создание экрана 2: [название]
   ... (по экрану на todo)
7. Регистрация маршрута в app.routes.ts
8. Регистрация в prototypes.registry.ts
9. Проверка и запуск
```

### Правила работы с todo

- **Один todo = одна атомарная задача** (не "создать 5 экранов", а по одному)
- Статус `in-progress` — **только 1 задача** одновременно
- Отмечай `completed` **сразу** после завершения, не пакетно
- Если задача оказалась сложнее — разбей на подзадачи

---

## Структура прототипа

Каждый прототип живёт в своей папке:

```
src/app/prototypes/<slug>/
├── <slug>.routes.ts               ← Маршруты прототипа (lazy loading)
├── <name>-prototype.component.ts  ← Корневой компонент (router-outlet)
├── changelog.data.ts              ← История изменений (отображается в UI)
├── screens/
│   ├── <name>-main-screen.component.ts   ← Главный экран
│   ├── <screen1>.component.ts             ← Экраны плагина
│   └── <screen2>.component.ts
├── components/                    ← (опционально) Локальные компоненты
│   └── some-widget.component.ts
├── data/                          ← (опционально) Мок-данные
│   └── mock-data.ts
└── types.ts                       ← (опционально) Типы прототипа
```

### Регистрация нового прототипа (3 файла)

**1. `src/app/shared/prototypes.registry.ts`** — добавить в массив `PROTOTYPES`:
```typescript
export const PROTOTYPES: PrototypeEntry[] = [
  {
    path: '/prototype/<slug>',
    label: 'Название проекта',
    icon: '<lucide-icon-name>',   // напр. 'puzzle', 'settings'
    description: 'Краткое описание',
  },
  // ...existing
]
```

**2. `src/app/app.routes.ts`** — добавить loadChildren:
```typescript
{
  path: 'prototype/<slug>',
  loadChildren: () =>
    import('./prototypes/<slug>/<slug>.routes').then(m => m.SLUG_ROUTES),
},
```

**3. `src/app/shared/icons.module.ts`** — зарегистрировать новые иконки (если нужны):
```typescript
import { NewIcon } from 'lucide-angular';
const icons = { ...existing, NewIcon };
```

**4. Файл маршрутов прототипа** (`<slug>.routes.ts`):
```typescript
import { Routes } from '@angular/router';

export const SLUG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./<name>-prototype.component').then(m => m.NamePrototypeComponent),
    children: [
      { path: '', loadComponent: () => import('./screens/...').then(m => m.ScreenComponent) },
      { path: 'screen1', loadComponent: () => import('./screens/...').then(m => m.Screen1Component) },
    ],
  },
];
```

---

## Паттерны создания экранов

### Каждый экран — standalone-компонент

```typescript
@Component({
  selector: 'app-<name>-screen',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiBreadcrumbsComponent, ...],
  template: `...`,
})
export class NameScreenComponent {
  private router = inject(Router);
  // ...
}
```

### Главный экран плагина (MainScreen)
- Сетка карточек 2×N (`grid grid-cols-1 sm:grid-cols-2 gap-4`)
- Каждая карточка = `<ui-card hoverable>` → переход к экрану
- Lucide-иконка + заголовок + описание

### Экран со списком (List)
- Поиск/фильтр сверху (`<ui-input iconName="search">`)
- Таблица (`<ui-table>`) с сортировкой
- Кастомные ячейки через `<ng-template tableCellDef="columnKey" let-item>`
- Кнопки действий: Добавить, Удалить, Редактировать
- Пустое состояние (`<ui-empty-state>`)

### Экран с формой (Form)
- `<ui-card>` → поля формы (`<ui-input>`, `<ui-select>`, `<ui-textarea>`)
- Двусторонняя привязка: `[(value)]="model"`
- Валидация через объект `errors: Record<string, string>`
- Кнопки: Назад (ghost) | Сохранить (primary)
- `<ui-modal>` с подтверждением успеха

### Экран с деталями (Detail)
- `<ui-breadcrumbs>` навигация
- `<ui-tabs>` для разделов
- Информационные карточки
- Кнопки действий

### Модальные окна
- `<ui-modal>` для сложных форм/просмотра
- `<ui-confirm-dialog>` для подтверждений удаления

---

## Мок-данные и персистентность (localStorage)

Прототипы работают на **фейковых данных** — без бэкенда:

- Данные хранить в свойствах компонента или в отдельном файле `data/mock-data.ts`
- Использовать реалистичные названия в контексте ресторанного бизнеса
- CRUD операции — манипуляция массивами/объектами в компоненте

### StorageService — сохранение данных между сессиями

Если в прототипе есть **действия сохранения** (кнопка «Сохранить», добавление/удаление/редактирование записей), данные **должны** сохраняться в `localStorage` через `StorageService`:

```typescript
import { StorageService } from '@/shared/storage.service';

private storage = inject(StorageService);

// Загрузка при инициализации (мок-данные как fallback)
this.items = this.storage.load('<slug>', 'items', MOCK_ITEMS);

// Сохранение после мутации
this.storage.save('<slug>', 'items', this.items);
```

**API StorageService:**
- `save<T>(slug, key, data)` — сохранить данные
- `load<T>(slug, key, fallback)` — загрузить (или fallback если нет)
- `hasData(slug)` — есть ли сохранённые данные
- `reset(slug)` — удалить ВСЕ данные прототипа

**Ключи** формируются как `prototype:<slug>:<key>`.

**Правила:**
- Если прототип **имеет save-действия** → подключай `StorageService`
- Если прототип **только витрина** (просмотр диалогов, модальных окон) → НЕ нужен
- При загрузке данных — ВСЕГДА используй мок-данные как fallback

### Кнопка Reset

В top-bar автоматически появляется красная кнопка **Reset** (слева от бейджа «Прототип»), если у текущего прототипа есть сохранённые данные в `localStorage`. При нажатии — `UiConfirmDialog` → очистка данных → перезагрузка страницы. Компонент: `ResetButtonComponent` (`src/app/components/layout/reset-button.component.ts`).

---

## Импорты

```typescript
// UI-компоненты — из barrel-export
import { UiButtonComponent, UiCardComponent, UiInputComponent, UiModalComponent, UiTableComponent, UiBadgeComponent } from '@/components/ui';

// Таблица с кастомными ячейками
import { UiTableComponent, TableCellDefDirective, TableColumn } from '@/components/ui';

// Иконки — через IconsModule
import { IconsModule } from '@/shared/icons.module';
// В шаблоне: <lucide-icon name="plus" [size]="18"></lucide-icon>

// Навигация
import { Router } from '@angular/router';
private router = inject(Router);

// Реестр прототипов
import { PROTOTYPES, PrototypeEntry } from '@/shared/prototypes.registry';
```

---

## Правила качества

1. **Каждый экран** должен быть **кликабельным** — кнопки работают, формы отправляются, модалки открываются
2. **Не используй заглушки** типа `// TODO` — прототип должен работать сразу
3. **Breadcrumbs** (`<ui-breadcrumbs>`) — на каждом экране кроме главного
4. **Кнопка "Назад"** — на каждом вложенном экране
5. **Валидация форм** — минимальная, но рабочая
6. **Responsive** — основная ширина `max-w-3xl` / `max-w-4xl`, таблицы в `overflow-auto`
7. **Анимации** — используй классы `animate-fade-in`, `animate-slide-up` для появления элементов
8. **standalone: true** — все новые компоненты ТОЛЬКО standalone
9. **inline templates** — шаблоны внутри `template: \`...\`` (не отдельные .html файлы)

---

## Работа со скриншотами Web

Когда пользователь присылает скриншот:
1. Проанализируй layout: sidebar, header, content area
2. Определи компоненты: таблицы, формы, карточки, модалки
3. Воспроизведи с помощью имеющихся UI-компонентов
4. Если нужен новый компонент — создай в `src/app/components/ui/`
5. Сохраняй цветовую палитру и spacing Web

---

## Команды запуска

```bash
# Разработка (Hot-reload)
npm run dev          → http://localhost:3000

# Сборка
npm run build

# Сборка watch-режим
npm run watch
```

**Важно**: на Windows PowerShell может потребоваться `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` перед npm-командами.

---

## Git-команды (шпаргалка)

```bash
# Переключиться на dev (рабочая ветка)
git checkout dev

# Закоммитить изменения
git add .
git commit -m "feat(<slug>): краткое описание"
git push origin dev

# Перед мержем — убедиться что всё собирается
npm run build

# Мерж dev → master (автоматический, через промт #3 из PROMPTS.md):
git checkout master
git pull origin master
git merge dev
git push origin master
git checkout dev
```
