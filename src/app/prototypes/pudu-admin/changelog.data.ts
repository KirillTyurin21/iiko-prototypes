import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.9',
    date: '2026-02-18',
    status: 'unreleased',
    changes: [
      {
        page: 'Маркетинг',
        pageRoute: '/prototype/pudu-admin/settings',
        items: [
          'Исправлен multi-select роботов: select сбрасывается на placeholder после выбора',
          'Добавлено состояние «Все роботы добавлены» при пустом списке доступных',
          'Добавлены tooltips на элементы формы, чекбоксы и warning-блок',
          'Warning-блок: добавлен role="alert", текст обновлён на «iikoSignage»',
          'Добавлен tooltip на вкладку «Маркетинг»',
        ],
      },
    ],
  },
  {
    version: '1.8',
    date: '2026-02-17',
    status: 'released',
    changes: [
      {
        page: 'Список ресторанов',
        pageRoute: '/prototype/pudu-admin',
        items: [
          'Добавлена секция «Подключение к NE»: карточка статуса подключения, модальное окно ввода client_id и api_secret с проверкой, блокировка перехода без активного подключения',
          'Mock-переключатель NE API с предупреждающим уведомлением',
        ],
      },
      {
        page: 'Список роботов',
        pageRoute: '/prototype/pudu-admin/robots',
        items: [
          'Inline-редактирование имени робота — клик по ячейке открывает поле ввода с возможностью сохранения и отмены',
        ],
      },
      {
        page: 'Настройки робота',
        pageRoute: '/prototype/pudu-admin/settings',
        items: [
          'Уведомление после сохранения обновлено на «Настройка сохранена»',
          'Удалены поля «Фраза позже» и «Ссылка на фразу позже» из настроек уборки посуды; добавлен информационный блок',
          'Обновлена подсказка «Время ожидания у стола» → «затем уезжает безусловно»',
          'Рефакторинг секции «Уборка посуды»: секции переименованы, обновлены описания, значения не сбрасываются при переключении',
        ],
      },
      {
        page: 'Маркетинг',
        pageRoute: '/prototype/pudu-admin/settings',
        items: [
          'Замена одиночного выбора робота на множественный выбор с чипами для назначения нескольких роботов',
          'Предупреждающее уведомление при попытке удалить последнего назначенного робота',
        ],
      },
    ],
  },
  {
    version: '1.6',
    date: '2026-02-17',
    status: 'released',
    changes: [
      {
        page: 'Настройки робота',
        pageRoute: '/prototype/pudu-admin/settings',
        items: [
          'Добавлены всплывающие подсказки на значения статуса настройки',
        ],
      },
      {
        page: 'Маппинг столов',
        pageRoute: '/prototype/pudu-admin/mapping',
        items: [
          'Исправлена привязка столов в режиме «Точки → Столы»',
          'Предупреждение о незамапленных столах отображается в обоих режимах маппинга',
          'Фильтр по залу теперь влияет на списки в режиме «Точки → Столы»',
        ],
      },
      {
        items: [
          'Breadcrumbs стали кликабельными на всех экранах',
        ],
      },
    ],
  },
  {
    version: '1.5',
    date: '2026-02-13',
    status: 'released',
    changes: [
      {
        page: 'Список ресторанов',
        pageRoute: '/prototype/pudu-admin',
        items: [
          'Экран списка ресторанов: таблица с поиском и бейджами статуса',
          'Sidebar с подпунктами при выборе ресторана',
        ],
      },
      {
        page: 'Маппинг столов',
        pageRoute: '/prototype/pudu-admin/mapping',
        items: [
          'Фильтр по залу на экране маппинга',
          'Роботы загружаются из StorageService',
        ],
      },
      {
        page: 'Настройки робота',
        pageRoute: '/prototype/pudu-admin/settings',
        items: [
          'Warning-блок на вкладке «Доставка блюд»',
          'Info-блок на вкладке «Уборка посуды»',
          'Confirm-диалог при изменении фразы',
          'Всплывающие подсказки на интерактивные элементы',
        ],
      },
      {
        items: [
          'Breadcrumbs на всех экранах',
          'Mock-данные: 3 ресторана, 3 зала',
        ],
      },
    ],
  },
  {
    version: '1.0',
    date: '2026-02-16',
    status: 'released',
    changes: [
      {
        items: [
          'Начальная версия прототипа',
          'Admin Panel с sidebar-навигацией',
        ],
      },
      {
        page: 'Список роботов',
        pageRoute: '/prototype/pudu-admin/robots',
        items: [
          'Экран списка роботов PUDU',
        ],
      },
      {
        page: 'Маппинг столов',
        pageRoute: '/prototype/pudu-admin/mapping',
        items: [
          'Экран маппинга столов',
        ],
      },
      {
        page: 'Настройки робота',
        pageRoute: '/prototype/pudu-admin/settings',
        items: [
          'Экран настроек роботов',
          'Toast-уведомления при сохранении',
        ],
      },
    ],
  },
];
