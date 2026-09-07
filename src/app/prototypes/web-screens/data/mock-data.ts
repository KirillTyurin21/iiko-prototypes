import {
  CustomerScreenDisplay,
  ScreenTheme,
  ScreenControl,
  ArrivalTerminal,
  SidebarSection,
  ArrivalsThemeListItem,
  ArrivalsTheme,
  ArrivalsControlListItem,
  ArrivalsControl,
  ArrivalsOrderMock,
  ProductCatalogItem,
  SoundCollection,
  SoundEventHandler,
  SoundTerminalGroup,
  SoundFolder,
  SoundFile,
  GenerationQueueItem,
  ArrivalsDevice,
  SoundTerminalGroupV2,
  DvArrivalsDisplay,
  DvCollection,
  DvEventHandler,
  DvAudioFile,
  CheckListPickerItem,
  OrderSourceRef,
  AdvertiseCompany,
  NetworkOrderSourceConfig,
  DisplaySetting,
} from '../types';

/** Секции бокового меню Web */
export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Экран покупателя',
    icon: 'monitor',
    items: [
      { icon: '', label: 'Дисплеи', route: 'displays' },
      { icon: '', label: 'Контролы', route: 'controls' },
      { icon: '', label: 'Темы', route: 'themes-cs' },
    ],
  },
  {
    title: 'Электронная очередь',
    icon: 'layout-list',
    items: [
      { icon: '', label: 'Контролы', route: 'arrivals-controls' },
      { icon: '', label: 'Темы', route: 'themes-arrivals' },
      { icon: '', label: 'Настройка терминалов', route: 'cs-terminals' },
      { icon: '', label: 'Мультиэкранность', route: 'arrivals-multiscreen' },
    ],
  },
  {
    title: 'Доска меню',
    icon: 'monitor',
    items: [
      { icon: '', label: 'Контролы', route: 'menuboard-controls' },
      { icon: '', label: 'Темы', route: 'menuboard-themes' },
      { icon: '', label: 'Настройка экранов', route: 'menuboard-terminals' },
      { icon: '', label: 'Мультиэкранность', route: 'menuboard-multiscreen' },
    ],
  },
  {
    title: 'Звуки',
    icon: 'volume-2',
    items: [
      { icon: '', label: 'Обработчики событий', route: 'sounds-event-handlers' },
      { icon: '', label: 'Настройка терминалов', route: 'sounds-terminals' },
    ],
  },
  {
    title: 'Подсказки',
    icon: 'wand-2',
    route: 'hints',
    items: [],
  },
  {
    title: 'Киоск',
    icon: 'monitor',
    items: [
      { icon: '', label: 'Темы', route: 'kiosk-themes' },
    ],
  },
  {
    title: 'Галерея',
    icon: 'image',
    route: 'gallery',
    items: [],
  },
  {
    title: 'Кампании',
    icon: 'megaphone',
    route: 'campaigns',
    items: [],
  },
  {
    title: 'Звуки (новая концепция)',
    icon: 'sliders',
    items: [
      { icon: '', label: 'Обработчики событий (новая)', route: 'sounds-event-handlers-v2' },
      { icon: '', label: 'Настройка терминалов (новая)', route: 'sounds-terminals-v2' },
    ],
  },
];

export const MOCK_DISPLAYS: CustomerScreenDisplay[] = [
  {
    id: 1,
    name: 'Экран бара',
    description: 'Дисплей покупателя на барной стойке',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'active',
    theme: 'Стандартная тема',
    terminal: 'Касса бар 1',
  },
  {
    id: 2,
    name: 'Экран касса 1',
    description: 'Основная касса у входа',
    resolution: '1024x768',
    orientation: 'landscape',
    status: 'active',
    theme: 'Стандартная тема',
    terminal: 'Касса 1',
  },
  {
    id: 3,
    name: 'Экран касса 2',
    description: 'Вторая касса зала',
    resolution: '1024x768',
    orientation: 'landscape',
    status: 'active',
    theme: 'Летний дизайн',
    terminal: 'Касса 2',
  },
  {
    id: 4,
    name: 'Витрина',
    description: 'Экран на витрине у входа',
    resolution: '1080x1920',
    orientation: 'portrait',
    status: 'active',
    theme: 'Новогодняя тема',
    terminal: 'Терминал витрина',
  },
  {
    id: 5,
    name: 'Зал — столик у окна',
    description: 'Информационный дисплей в зале',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'inactive',
    theme: 'Минимализм',
    terminal: 'Касса 1',
  },
  {
    id: 6,
    name: 'Экран самообслуживания',
    description: 'Киоск самообслуживания у входа',
    resolution: '1080x1920',
    orientation: 'portrait',
    status: 'active',
    theme: 'Стандартная тема',
    terminal: 'Киоск 1',
  },
  {
    id: 7,
    name: 'Экран кухни (выдача)',
    description: 'Дисплей покупателя на выдаче заказов',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'active',
    theme: 'Летний дизайн',
    terminal: 'Терминал кухня',
  },
  {
    id: 8,
    name: 'Доставка — зона ожидания',
    description: 'Экран для курьеров и ожидающих заказ',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'inactive',
    theme: 'Стандартная тема',
    terminal: 'Касса доставка',
  },
];

export const MOCK_THEMES_CS: ScreenTheme[] = [
  {
    id: 1,
    name: 'Стандартная тема',
    type: 'customer-screen',
    isDefault: true,
    createdAt: '2025-03-10T10:00:00',
    modifiedAt: '2025-12-01T14:30:00',
  },
  {
    id: 2,
    name: 'Летний дизайн',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-05-20T09:15:00',
    modifiedAt: '2025-06-15T11:00:00',
  },
  {
    id: 3,
    name: 'Новогодняя тема',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-11-01T08:00:00',
    modifiedAt: '2025-12-20T16:45:00',
  },
  {
    id: 4,
    name: 'Минимализм',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-04-05T12:30:00',
    modifiedAt: '2025-09-10T10:20:00',
  },
  {
    id: 5,
    name: 'Тёмная тема',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-07-18T14:00:00',
    modifiedAt: '2025-11-22T09:10:00',
  },
];

export const MOCK_THEMES_ARRIVALS: ScreenTheme[] = [
  {
    id: 101,
    name: 'Стандартная (поступления)',
    type: 'arrivals',
    isDefault: true,
    createdAt: '2025-02-15T10:00:00',
    modifiedAt: '2025-10-05T13:00:00',
  },
  {
    id: 102,
    name: 'Компактный список',
    type: 'arrivals',
    isDefault: false,
    createdAt: '2025-04-22T11:30:00',
    modifiedAt: '2025-08-18T15:40:00',
  },
  {
    id: 103,
    name: 'Крупный шрифт',
    type: 'arrivals',
    isDefault: false,
    createdAt: '2025-06-10T09:00:00',
    modifiedAt: '2025-09-30T12:15:00',
  },
  {
    id: 104,
    name: 'Тёмный режим (поступления)',
    type: 'arrivals',
    isDefault: false,
    createdAt: '2025-08-01T14:20:00',
    modifiedAt: '2025-12-12T17:00:00',
  },
];

export const MOCK_CONTROLS: ScreenControl[] = [
  {
    id: 1,
    name: 'Текстовый блок',
    type: 'text',
    description: 'Произвольный текст с настраиваемым шрифтом и цветом',
  },
  {
    id: 2,
    name: 'Логотип',
    type: 'image',
    description: 'Изображение логотипа заведения или бренда',
  },
  {
    id: 3,
    name: 'QR-код оплаты',
    type: 'qr-code',
    description: 'Динамический QR-код для оплаты по СБП или ссылке',
  },
  {
    id: 4,
    name: 'Слайд-шоу меню',
    type: 'menu',
    description: 'Автоматическая прокрутка позиций меню с ценами',
  },
  {
    id: 5,
    name: 'Видео',
    type: 'video',
    description: 'Воспроизведение рекламного или информационного видеоролика',
  },
  {
    id: 6,
    name: 'Часы',
    type: 'clock',
    description: 'Текущее время и дата в настраиваемом формате',
  },
];

/* ── Arrivals theme list (folders + themes) ── */

export const MOCK_ARRIVALS_LIST: ArrivalsThemeListItem[] = [
  { id: 201, name: 'Системные темы', itemType: 'folder' },
  { id: 202, name: 'Архив', itemType: 'folder' },
  { id: 101, name: 'Стандартная (поступления)', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 102, name: 'Компактный список', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 103, name: 'Крупный шрифт', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 104, name: 'Тёмный режим', itemType: 'theme', resolution: '1366x768', createdBy: 'Моя' },
  { id: 105, name: 'Доставка (от 25-10-09)', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
];

export const MOCK_ARRIVALS_THEMES: ArrivalsTheme[] = [
  { id: 101, name: 'Стандартная (поступления)', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
  { id: 102, name: 'Компактный список', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
  { id: 103, name: 'Крупный шрифт', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
  { id: 104, name: 'Тёмный режим', resolution: '1366x768', screenMode: 'order-screen', elements: [] },
  { id: 105, name: 'Доставка (от 25-10-09)', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
];

/* ── Компании (мини-борды: назначение в рекламные блоки) ── */

export const MOCK_COMPANIES: AdvertiseCompany[] = [
  { id: 1, name: 'Кофейня «Арома»' },
  { id: 2, name: 'Пекарня «Колосок»' },
  { id: 3, name: 'Мороженое «Снежок»' },
  { id: 4, name: 'Соки «Фруктовый сад»' },
  { id: 5, name: 'Снеки «Хруст»' },
];

/* ── Kiosk theme list ── */

export const MOCK_KIOSK_LIST: ArrivalsThemeListItem[] = [
  { id: 1, name: 'Стандартная (киоск)', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 2, name: 'Расширенный QR', itemType: 'theme', resolution: '1366x768', createdBy: 'Моя' },
  { id: 3, name: 'Киоск — тёмная', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
];

/* ── Product catalog for Price element navigator ── */

export const MOCK_PRODUCT_CATALOG: Record<string, ProductCatalogItem[]> = {
  root: [
    { id: 'g1', name: 'Горячие напитки', isGroup: true, hasChildren: true },
    { id: 'g2', name: 'Холодные напитки', isGroup: true, hasChildren: true },
    { id: 'g3', name: 'Салаты', isGroup: true, hasChildren: true },
    { id: 'g4', name: 'Супы', isGroup: true, hasChildren: true },
    { id: 'g5', name: 'Горячие блюда', isGroup: true, hasChildren: true },
    { id: 'g6', name: 'Десерты', isGroup: true, hasChildren: true },
    { id: 'g7', name: 'Пустая группа', isGroup: true, hasChildren: false },
  ],
  g1: [
    { id: 'p1', name: 'Капучино', isGroup: false, sizes: [
      { id: 's1', name: 'Маленький' }, { id: 's2', name: 'Средний' }, { id: 's3', name: 'Большой' },
    ] },
    { id: 'p2', name: 'Латте', isGroup: false, sizes: [
      { id: 's4', name: 'Маленький' }, { id: 's5', name: 'Средний' }, { id: 's6', name: 'Большой' },
    ] },
    { id: 'p3', name: 'Американо', isGroup: false, sizes: [] },
    { id: 'p4', name: 'Чай чёрный', isGroup: false, sizes: [] },
  ],
  g2: [
    { id: 'p5', name: 'Лимонад', isGroup: false, sizes: [
      { id: 's7', name: '0.3л' }, { id: 's8', name: '0.5л' },
    ] },
    { id: 'p6', name: 'Морс клюквенный', isGroup: false, sizes: [] },
    { id: 'p7', name: 'Вода', isGroup: false, sizes: [
      { id: 's9', name: '0.3л' }, { id: 's10', name: '0.5л' }, { id: 's11', name: '1л' },
    ] },
  ],
  g3: [
    { id: 'p8', name: 'Цезарь с курицей', isGroup: false, sizes: [] },
    { id: 'p9', name: 'Греческий', isGroup: false, sizes: [] },
    { id: 'p10', name: 'Оливье', isGroup: false, sizes: [] },
  ],
  g4: [
    { id: 'p11', name: 'Борщ', isGroup: false, sizes: [] },
    { id: 'p12', name: 'Том Ям', isGroup: false, sizes: [
      { id: 's12', name: 'Маленький' }, { id: 's13', name: 'Большой' },
    ] },
    { id: 'p13', name: 'Солянка', isGroup: false, sizes: [] },
  ],
  g5: [
    { id: 'p14', name: 'Стейк рибай', isGroup: false, sizes: [
      { id: 's14', name: '200г' }, { id: 's15', name: '300г' }, { id: 's16', name: '400г' },
    ] },
    { id: 'p15', name: 'Паста карбонара', isGroup: false, sizes: [] },
    { id: 'p16', name: 'Бургер классический', isGroup: false, sizes: [] },
    { id: 'p17', name: 'Пицца Маргарита', isGroup: false, sizes: [
      { id: 's17', name: '25 см' }, { id: 's18', name: '30 см' }, { id: 's19', name: '35 см' },
    ] },
  ],
  g6: [
    { id: 'p18', name: 'Тирамису', isGroup: false, sizes: [] },
    { id: 'p19', name: 'Чизкейк', isGroup: false, sizes: [] },
    { id: 'p20', name: 'Мороженое', isGroup: false, sizes: [
      { id: 's20', name: '1 шарик' }, { id: 's21', name: '2 шарика' }, { id: 's22', name: '3 шарика' },
    ] },
  ],
  g7: [],
};

/* ── Product catalog TREE (two root branches: Блюда + Модификаторы) ── */

export const MOCK_PRODUCT_CATALOG_TREE: ProductCatalogItem[] = [
  // ═══════════════ ВЕТКА «БЛЮДА» ═══════════════
  {
    id: 'root-dishes', name: 'Блюда', isGroup: true, hasChildren: true,
    children: [
      {
        id: 'g1', name: 'Горячие напитки', isGroup: true, hasChildren: true,
        children: [
          {
            id: 'p1', name: 'Капучино', isGroup: false, itemType: 'dish', price: 280,
            sizes: [
              { id: 's1', name: 'Маленький (0.2л)', price: 220 },
              { id: 's2', name: 'Средний (0.3л)', price: 280 },
              { id: 's3', name: 'Большой (0.5л)', price: 360 },
            ],
          },
          {
            id: 'p2', name: 'Латте', isGroup: false, itemType: 'dish', price: 320,
            sizes: [
              { id: 's4', name: 'Маленький', price: 260 },
              { id: 's5', name: 'Средний', price: 320 },
              { id: 's6', name: 'Большой', price: 400 },
            ],
          },
          { id: 'p3', name: 'Американо', isGroup: false, itemType: 'dish', price: 200 },
          {
            id: 'p4', name: 'Чай чёрный', isGroup: false, itemType: 'dish', price: 150,
            sizes: [
              { id: 's7', name: '0.2', price: 120 },
              { id: 's8', name: '0.3', price: 150 },
            ],
          },
        ],
      },
      {
        id: 'g5', name: 'Горячие блюда', isGroup: true, hasChildren: true,
        children: [
          {
            id: 'p17', name: 'Пицца Маргарита', isGroup: false, itemType: 'dish', price: 650,
            sizes: [
              { id: 's17', name: '25 см', price: 490 },
              { id: 's18', name: '30 см', price: 650 },
              { id: 's19', name: '35 см', price: 850 },
            ],
          },
          { id: 'p18', name: 'Бургер Классический', isGroup: false, itemType: 'dish', price: 450 },
          { id: 'p19', name: 'Блинчики', isGroup: false, itemType: 'dish', price: 350 },
        ],
      },
      {
        id: 'g6', name: 'Холодные напитки', isGroup: true, hasChildren: true,
        children: [
          {
            id: 'p20', name: 'Сок апельсиновый', isGroup: false, itemType: 'goods', price: 180,
            sizes: [
              { id: 's20', name: '0.3', price: 180 },
              { id: 's21', name: '0.5', price: 250 },
            ],
          },
          { id: 'p21', name: 'Кола', isGroup: false, itemType: 'goods', price: 150 },
        ],
      },
      {
        id: 'g7', name: 'Десерты', isGroup: true, hasChildren: true,
        children: [
          { id: 'p22', name: 'Тирамису', isGroup: false, itemType: 'dish', price: 420 },
          { id: 'p23', name: 'Чизкейк', isGroup: false, itemType: 'dish', price: 380 },
        ],
      },
    ],
  },
  // ═══════════════ ВЕТКА «МОДИФИКАТОРЫ» ═══════════════
  {
    id: 'root-modifiers', name: 'Модификаторы', isGroup: true, hasChildren: true,
    children: [
      {
        id: 'mg1', name: 'Дополнительные модификаторы', isGroup: true, hasChildren: true,
        children: [
          {
            id: 'mg1-1', name: 'Сиропы', isGroup: true, hasChildren: true,
            children: [
              { id: 'm1', name: 'Кленовый сироп', isGroup: false, itemType: 'modifier', price: 50 },
              { id: 'm2', name: 'Ореховый сироп', isGroup: false, itemType: 'modifier', price: 50 },
              { id: 'm3', name: 'Ванильный сироп', isGroup: false, itemType: 'modifier', price: 50 },
              { id: 'm5', name: 'Карамельный сироп', isGroup: false, itemType: 'modifier', price: 50 },
            ],
          },
          {
            id: 'mg1-2', name: 'Молоко', isGroup: true, hasChildren: true,
            children: [
              { id: 'm4_1', name: 'Коровье', isGroup: false, itemType: 'modifier', price: 0 },
              { id: 'm4_2', name: 'Овсяное', isGroup: false, itemType: 'modifier', price: 60 },
              { id: 'm4_3', name: 'Кокосовое', isGroup: false, itemType: 'modifier', price: 80 },
            ],
          },
          {
            id: 'mg1-3', name: 'Добавки к пицце', isGroup: true, hasChildren: true,
            children: [
              { id: 'm11', name: 'Доп. сыр', isGroup: false, itemType: 'modifier', price: 80 },
              { id: 'm12', name: 'Доп. грибы', isGroup: false, itemType: 'modifier', price: 70 },
            ],
          },
          {
            id: 'mg1-4', name: 'Топпинги', isGroup: true, hasChildren: true,
            children: [
              { id: 'm13', name: 'Сметана', isGroup: false, itemType: 'modifier', price: 30 },
              { id: 'm14', name: 'Мёд', isGroup: false, itemType: 'modifier', price: 40 },
              { id: 'm15', name: 'Варенье', isGroup: false, itemType: 'modifier', price: 40 },
            ],
          },
        ],
      },
      {
        id: 'mg2', name: 'Основные модификаторы', isGroup: true, hasChildren: true,
        children: [
          {
            id: 'mg2-1', name: 'Тип теста', isGroup: true, hasChildren: true,
            children: [
              { id: 'm10_1', name: 'Тонкое', isGroup: false, itemType: 'modifier' },
              { id: 'm10_2', name: 'Толстое', isGroup: false, itemType: 'modifier' },
              { id: 'm10_3', name: 'С сырным бортом', isGroup: false, itemType: 'modifier', price: 120 },
            ],
          },
          {
            id: 'mg2-2', name: 'Тип мяса', isGroup: true, hasChildren: true,
            children: [
              { id: 'm16', name: 'Говядина', isGroup: false, itemType: 'modifier' },
              { id: 'm17', name: 'Курица', isGroup: false, itemType: 'modifier' },
              { id: 'm18', name: 'Рыба', isGroup: false, itemType: 'modifier' },
            ],
          },
        ],
      },
    ],
  },
];

export const MOCK_TERMINALS: ArrivalTerminal[] = [
  {
    id: 1,
    name: 'Терминал зал 1',
    location: 'Основной зал, у входа',
    status: 'online',
    ip: '192.168.1.101',
    lastSync: '2026-02-10T09:45:00',
  },
  {
    id: 2,
    name: 'Терминал зал 2',
    location: 'Основной зал, у бара',
    status: 'online',
    ip: '192.168.1.102',
    lastSync: '2026-02-10T09:44:30',
  },
  {
    id: 3,
    name: 'Терминал веранда',
    location: 'Летняя веранда',
    status: 'offline',
    ip: '192.168.1.103',
    lastSync: '2026-01-15T18:20:00',
  },
  {
    id: 4,
    name: 'Терминал кухня',
    location: 'Кухня, зона выдачи',
    status: 'online',
    ip: '192.168.1.104',
    lastSync: '2026-02-10T09:43:00',
  },
  {
    id: 5,
    name: 'Терминал доставка',
    location: 'Зона сборки доставки',
    status: 'online',
    ip: '192.168.1.105',
    lastSync: '2026-02-10T09:42:15',
  },
];

/* ── Arrivals Controls list (folders + controls) ── */

export const MOCK_ARRIVALS_CONTROLS_LIST: ArrivalsControlListItem[] = [
  { id: 301, name: 'Контролы', itemType: 'folder' },
  { id: 307, name: 'Меню-борд (карточки блюд)', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 302, name: 'Доставка (для Курьеров) (от 25-10-09)', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 303, name: 'Аня тест1', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 304, name: 'ВИТ', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 305, name: 'Контрол с анимацией', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 306, name: 'Стандартный контрол', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
];

export const MOCK_ARRIVALS_CONTROLS: ArrivalsControl[] = [
  { id: 302, name: 'Доставка (для Курьеров) (от 25-10-09)', statusType: 'delivery', elements: [] },
  { id: 303, name: 'Аня тест1', statusType: 'kitchen', elements: [] },
  { id: 304, name: 'ВИТ', statusType: 'kitchen', elements: [] },
  { id: 305, name: 'Контрол с анимацией', statusType: 'kitchen', elements: [] },
  { id: 306, name: 'Стандартный контрол', statusType: 'balancer', elements: [] },
  { id: 307, name: 'Меню-борд (карточки блюд)', statusType: 'kitchen', elements: [
    { id: 'mb1', type: 'image', name: 'Изображение', x: 4, y: 4, width: 90, height: 70, borderWidth: 0, borderColor: '#e0e0e0', borderRadius: 6, imageUrl: '' },
    { id: 'mb2', type: 'text', name: 'Название', x: 4, y: 78, width: 90, height: 22, borderWidth: 0, borderColor: 'transparent', borderRadius: 0, text: 'Капучино', fontFamily: 'Segoe UI', fontSize: 11, fontBold: true, textAlign: 'center' },
    { id: 'mb3', type: 'text', name: 'Цена', x: 4, y: 100, width: 90, height: 20, borderWidth: 0, borderColor: 'transparent', borderRadius: 0, text: '280 ₽', fontFamily: 'Segoe UI', fontSize: 12, fontBold: true, textAlign: 'center' },
  ]},
];

/* ── Arrivals mock orders (для эмуляции тем) ── */

export const MOCK_ARRIVALS_ORDERS: ArrivalsOrderMock[] = [
  {
    id: 1, orderNumber: '001', clientName: 'Иван Петров', tableNumber: '3',
    status: 'Готовится', orderType: 'ordinary', source: 'Front',
    cookingStartTime: '14:20',
    items: [
      { name: 'Стейк рибай', qty: 1, status: 'Готовится' },
      { name: 'Салат Цезарь', qty: 1, status: 'Готово' },
      { name: 'Лимонад', qty: 2, status: 'Ожидает' },
    ],
  },
  {
    id: 2, orderNumber: '002', clientName: 'Мария Сидорова', tableNumber: '7',
    status: 'Готово', orderType: 'ordinary', source: 'Front',
    cookingStartTime: '14:15',
    items: [
      { name: 'Борщ', qty: 1, status: 'Готово' },
      { name: 'Хлеб', qty: 1, status: 'Готово' },
    ],
  },
  {
    id: 3, orderNumber: '003', clientName: 'Анна Козлова',
    status: 'Ожидает', orderType: 'pickup', source: 'Внешний сервис',
    cookingStartTime: '14:25',
    items: [
      { name: 'Пицца Маргарита', qty: 1, status: 'Ожидает' },
      { name: 'Кола', qty: 1, status: 'Ожидает' },
    ],
    clientPhone: '+7 (999) 123-45-67',
  },
  {
    id: 4, orderNumber: '004', clientName: 'Пётр Волков', tableNumber: '12',
    status: 'Готовится', orderType: 'ordinary', source: 'Front',
    cookingStartTime: '14:28',
    items: [
      { name: 'Паста карбонара', qty: 2, status: 'Готовится' },
      { name: 'Тирамису', qty: 1, status: 'Ожидает' },
    ],
  },
  {
    id: 5, orderNumber: '005', clientName: 'Олег Смирнов',
    status: 'Готово', orderType: 'courier', source: 'Delivery Club',
    cookingStartTime: '14:10',
    expectedDeliveryTime: '15:00',
    courierName: 'Алексей К.',
    items: [
      { name: 'Бургер классический', qty: 2, status: 'Готово' },
      { name: 'Картофель фри', qty: 2, status: 'Готово' },
      { name: 'Морс клюквенный', qty: 2, status: 'Готово' },
    ],
    clientPhone: '+7 (916) 555-12-34',
  },
  {
    id: 6, orderNumber: '006', clientName: 'Елена Новикова', tableNumber: '1',
    status: 'Подан', orderType: 'ordinary', source: 'Front',
    cookingStartTime: '13:55',
    items: [
      { name: 'Солянка', qty: 1, status: 'Подан' },
      { name: 'Чай чёрный', qty: 1, status: 'Подан' },
    ],
  },
  {
    id: 7, orderNumber: '007', clientName: 'Дмитрий Орлов',
    status: 'Готовится', orderType: 'pickup', source: 'Front',
    cookingStartTime: '14:30',
    items: [
      { name: 'Том Ям', qty: 1, status: 'Готовится' },
      { name: 'Рис', qty: 1, status: 'Готово' },
    ],
    clientPhone: '+7 (903) 777-88-99',
  },
  {
    id: 8, orderNumber: '008', clientName: 'Светлана Жукова', tableNumber: '5',
    status: 'Выдача', orderType: 'ordinary', source: 'Front',
    cookingStartTime: '14:05',
    items: [
      { name: 'Чизкейк', qty: 2, status: 'Готово' },
      { name: 'Капучино', qty: 2, status: 'Готово' },
    ],
  },
  {
    id: 9, orderNumber: '009', clientName: 'Артём Белов',
    status: 'Ожидает', orderType: 'courier', source: 'Внешний сервис',
    expectedDeliveryTime: '15:30',
    items: [
      { name: 'Пицца Маргарита', qty: 1, status: 'Ожидает' },
      { name: 'Греческий салат', qty: 1, status: 'Ожидает' },
      { name: 'Вода', qty: 2, status: 'Ожидает' },
    ],
    clientPhone: '+7 (926) 111-22-33',
  },
  {
    id: 10, orderNumber: '010', clientName: 'Наталья Морозова', tableNumber: '9',
    status: 'Готовится', orderType: 'ordinary', source: 'Front',
    cookingStartTime: '14:32',
    items: [
      { name: 'Оливье', qty: 1, status: 'Готовится' },
      { name: 'Стейк рибай', qty: 1, status: 'Ожидает' },
      { name: 'Мороженое', qty: 3, status: 'Ожидает' },
    ],
  },
];

/* ── External Menu (MenuBoard dish selector) ── */

export interface ExternalMenuCategory {
  id: string;
  name: string;
  items: ExternalMenuItem[];
}

export interface ExternalMenuItem {
  externalId: string;
  name: string;
  price: number;
  imageUrl?: string;
  modifiers?: string[];
  sizes?: { name: string; price: number }[];
  description?: string;
  weight?: number;
  measure?: string;
  allergens?: string[];
  energy?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
}

export const MOCK_EXTERNAL_MENU: ExternalMenuCategory[] = [
  {
    id: 'cat-coffee', name: 'Кофе',
    items: [
      { externalId: 'em-001', name: 'Капучино', price: 280, modifiers: ['Корица', 'Сливки'], sizes: [{ name: 'S 0.2л', price: 220 }, { name: 'M 0.3л', price: 280 }, { name: 'L 0.5л', price: 360 }], description: 'Классический итальянский кофе с молочной пенкой', weight: 200, measure: 'мл', allergens: ['Молоко', 'Кофеин'], energy: 120, proteins: 8, fats: 5, carbs: 10 },
      { externalId: 'em-002', name: 'Латте', price: 320, modifiers: ['Сироп'], sizes: [{ name: 'S', price: 260 }, { name: 'M', price: 320 }, { name: 'L', price: 400 }], weight: 250, measure: 'мл', allergens: ['Молоко', 'Кофеин'], energy: 140, proteins: 9, fats: 6, carbs: 12 },
      { externalId: 'em-003', name: 'Американо', price: 200, sizes: [], weight: 150, measure: 'мл', allergens: ['Кофеин'], energy: 5, proteins: 0, fats: 0, carbs: 1 },
      { externalId: 'em-004', name: 'Эспрессо', price: 180, sizes: [{ name: 'S', price: 180 }, { name: 'M', price: 220 }], weight: 60, measure: 'мл', allergens: ['Кофеин'], energy: 3, proteins: 0, fats: 0, carbs: 0 },
      { externalId: 'em-005', name: 'Мокачино', price: 350, modifiers: ['Шоколад', 'Сливки'], sizes: [{ name: 'S 0.2л', price: 300 }, { name: 'M 0.3л', price: 350 }], description: 'Кофе с шоколадом и молочной пенкой', weight: 220, measure: 'мл', allergens: ['Молоко', 'Кофеин'], energy: 180, proteins: 7, fats: 10, carbs: 15 },
      { externalId: 'em-006', name: 'Флэт Уайт', price: 310, sizes: [], weight: 180, measure: 'мл', allergens: ['Молоко', 'Кофеин'], energy: 100, proteins: 6, fats: 4, carbs: 8 },
    ],
  },
  {
    id: 'cat-tea', name: 'Чай',
    items: [
      { externalId: 'em-011', name: 'Чай чёрный', price: 150, sizes: [{ name: '0.2л', price: 120 }, { name: '0.3л', price: 150 }], weight: 200, measure: 'мл', energy: 2, proteins: 0, fats: 0, carbs: 0 },
      { externalId: 'em-012', name: 'Чай зелёный', price: 150, weight: 200, measure: 'мл', energy: 2, proteins: 0, fats: 0, carbs: 0 },
      { externalId: 'em-013', name: 'Чай облепиховый', price: 220, modifiers: ['Мёд'], description: 'Согревающий чай с облепихой и имбирём', weight: 250, measure: 'мл', energy: 45, proteins: 0, fats: 1, carbs: 9 },
      { externalId: 'em-014', name: 'Матча латте', price: 380, sizes: [{ name: 'S', price: 350 }, { name: 'M', price: 380 }], description: 'Японский зелёный чай матча с молоком', weight: 220, measure: 'мл', allergens: ['Молоко'], energy: 160, proteins: 8, fats: 7, carbs: 14 },
      { externalId: 'em-015', name: 'Чай травяной', price: 130, description: 'Сбор из мяты, ромашки и мелиссы', weight: 300, measure: 'мл', energy: 1, proteins: 0, fats: 0, carbs: 0 },
    ],
  },
  {
    id: 'cat-desserts', name: 'Десерты',
    items: [
      { externalId: 'em-021', name: 'Тирамису', price: 420, description: 'Классический итальянский десерт с маскарпоне и кофе', weight: 150, measure: 'г', allergens: ['Молоко', 'Яйца', 'Кофеин'], energy: 350, proteins: 6, fats: 18, carbs: 40 },
      { externalId: 'em-022', name: 'Чизкейк', price: 380, description: 'Нежный сливочный чизкейк на песочной основе', weight: 140, measure: 'г', allergens: ['Молоко', 'Яйца'], energy: 320, proteins: 7, fats: 20, carbs: 28 },
      { externalId: 'em-023', name: 'Мороженое', price: 250, sizes: [{ name: '1 шарик', price: 180 }, { name: '2 шарика', price: 250 }, { name: '3 шарика', price: 340 }], weight: 100, measure: 'г', allergens: ['Молоко'], energy: 200, proteins: 4, fats: 12, carbs: 20 },
      { externalId: 'em-024', name: 'Брауни', price: 320, description: 'Шоколадный брауни с грецким орехом', weight: 120, measure: 'г', allergens: ['Орехи', 'Яйца', 'Молоко'], energy: 420, proteins: 6, fats: 24, carbs: 45 },
      { externalId: 'em-025', name: 'Панна-котта', price: 290, description: 'Итальянский десерт из сливок с ягодным соусом', weight: 130, measure: 'г', allergens: ['Молоко'], energy: 270, proteins: 3, fats: 18, carbs: 22 },
    ],
  },
  {
    id: 'cat-breakfast', name: 'Завтраки',
    items: [
      { externalId: 'em-031', name: 'Омлет с сыром', price: 250, description: 'Воздушный омлет из трёх яиц с сыром Чеддер', weight: 200, measure: 'г', allergens: ['Яйца', 'Молоко'], energy: 280, proteins: 18, fats: 20, carbs: 4 },
      { externalId: 'em-032', name: 'Блинчики', price: 350, modifiers: ['Сметана', 'Мёд', 'Варенье'], description: 'Тонкие блинчики на молоке', weight: 180, measure: 'г', allergens: ['Молоко', 'Яйца'], energy: 310, proteins: 8, fats: 12, carbs: 42 },
      { externalId: 'em-033', name: 'Гранола с йогуртом', price: 280, description: 'Домашняя гранола с греческим йогуртом и свежими ягодами', weight: 220, measure: 'г', allergens: ['Молоко', 'Орехи'], energy: 340, proteins: 12, fats: 14, carbs: 38 },
      { externalId: 'em-034', name: 'Круассан с ветчиной', price: 320, description: 'Свежий круассан с ветчиной и сыром', weight: 130, measure: 'г', allergens: ['Молоко', 'Яйца'], energy: 380, proteins: 14, fats: 22, carbs: 30 },
      { externalId: 'em-035', name: 'Сырники', price: 290, modifiers: ['Сметана'], description: 'Нежные творожные сырники с ванилью', weight: 160, measure: 'г', allergens: ['Молоко', 'Яйца'], energy: 260, proteins: 14, fats: 12, carbs: 24 },
    ],
  },
];

/* ── Sounds (Digital Voice) ── */

export const SYSTEM_EVENTS: string[] = [
  'Бронь: банкет завершен',
  'Бронь: банкет начат',
  'Бронь: банкет начат (универсально)',
  'Бронь: банкет отменен (no-show)',
  'Бронь: включено напоминание о подготовке',
  'Бронь: гость пришел (резерв закрыт)',
  'Бронь: создан банкет',
  'Бронь: создан резерв',
  'Доставка: доставлено',
  'Доставка: закрыто',
  'Доставка: назначен курьер',
  'Доставка: новый заказ',
  'Доставка: отменено',
  'Кухня: заказ приготовлен (Processed)',
];

export const MOCK_SOUND_COLLECTIONS: SoundCollection[] = [
  { id: 1, name: 'Системные обработчики событий' },
  { id: 2, name: 'Звуки' },
  { id: 3, name: '11' },
];

export const MOCK_SOUND_EVENT_HANDLERS: SoundEventHandler[] = [
  // Системные обработчики событий (collection 1)
  { id: 1, collectionId: 1, name: 'Бронь: банкет завершен', voiceType: 'file', events: ['Бронь: банкет завершен'], fileName: 'banket_end.mp3' },
  { id: 2, collectionId: 1, name: 'Бронь: банкет начат', voiceType: 'file', events: ['Бронь: банкет начат'], fileName: 'banket_start.mp3' },
  { id: 3, collectionId: 1, name: 'Бронь: банкет начат (универсально)', voiceType: 'file', events: ['Бронь: банкет начат (универсально)'], fileName: 'banket_start_uni.mp3' },
  { id: 4, collectionId: 1, name: 'Бронь: банкет отменен (no-show)', voiceType: 'file', events: ['Бронь: банкет отменен (no-show)'], fileName: 'banket_cancel.mp3' },
  { id: 5, collectionId: 1, name: 'Бронь: включено напоминание', voiceType: 'file', events: ['Бронь: включено напоминание о подготовке'], fileName: 'reminder.mp3' },
  { id: 6, collectionId: 1, name: 'Бронь: гость пришел', voiceType: 'file', events: ['Бронь: гость пришел (резерв закрыт)'], fileName: 'guest_arrived.mp3' },
  { id: 7, collectionId: 1, name: 'Бронь: создан банкет', voiceType: 'file', events: ['Бронь: создан банкет'], fileName: 'banket_created.mp3' },
  { id: 8, collectionId: 1, name: 'Бронь: создан резерв', voiceType: 'file', events: ['Бронь: создан резерв'], fileName: 'reserve_created.mp3' },
  { id: 9, collectionId: 1, name: 'Доставка: доставлено', voiceType: 'file', events: ['Доставка: доставлено'], fileName: 'delivered.mp3' },
  { id: 10, collectionId: 1, name: 'Доставка: закрыто', voiceType: 'file', events: ['Доставка: закрыто'], fileName: 'closed.mp3' },
  { id: 11, collectionId: 1, name: 'Доставка: назначен курьер', voiceType: 'file', events: ['Доставка: назначен курьер'], fileName: 'courier.mp3' },
  { id: 12, collectionId: 1, name: 'Доставка: новый заказ', voiceType: 'file', events: ['Доставка: новый заказ'], fileName: 'new_order.mp3' },
  // Звуки (collection 2)
  { id: 13, collectionId: 2, name: 'Звук уведомления', voiceType: 'file', events: ['Доставка: новый заказ'], fileName: 'notification.mp3' },
  // 11 (collection 3)
  { id: 14, collectionId: 3, name: 'Тестовый обработчик', voiceType: 'file', events: ['Кухня: заказ приготовлен (Processed)'], fileName: 'test.mp3' },
  // Без коллекции
  { id: 15, collectionId: null, name: 'Доставка: отменено', voiceType: 'file', events: ['Доставка: отменено'], fileName: 'cancelled.mp3' },
  { id: 16, collectionId: null, name: 'Кухня: заказ приготовлен', voiceType: 'file', events: ['Кухня: заказ приготовлен (Processed)'], fileName: 'cooked.mp3' },
  { id: 17, collectionId: null, name: 'Уведомление бронь', voiceType: 'file', events: ['Бронь: создан резерв'], fileName: 'reserve_notify.mp3' },
  { id: 18, collectionId: null, name: 'Общий звук', voiceType: 'file', events: ['Доставка: новый заказ', 'Доставка: доставлено'], fileName: 'general.mp3' },
  // Генерация голоса (примеры)
  { id: 19, collectionId: 1, name: 'Голос: новый заказ доставки', voiceType: 'generation', events: ['Доставка: новый заказ'], voiceName: 'Ксения', phraseText: 'Внимание, поступил новый заказ на доставку номер [order_number]', generationStatus: 'done', fileSize: 48 },
  { id: 20, collectionId: 2, name: 'Голос: заказ приготовлен', voiceType: 'generation', events: ['Кухня: заказ приготовлен (Processed)'], voiceName: 'Василий', phraseText: 'Заказ [order_number] готов к выдаче', generationStatus: 'done', fileSize: 36 },
];

export const AUDIO_DEVICES: string[] = [
  'Не выбрано',
  'Динамики (High Definition Audio Device)',
  'Device 1',
  'Device 2',
];

/** Все доступные аудиоустройства, включая виртуальные (Arrivals) */
export interface AudioDeviceOption {
  label: string;
  value: string;
  type: 'physical' | 'arrivals';
  moduleId?: number;
  isOnline?: boolean;
}

export function getAudioDeviceOptions(arrivalsDevices: ArrivalsDevice[]): AudioDeviceOption[] {
  const physical: AudioDeviceOption[] = AUDIO_DEVICES.map(d => ({
    label: d,
    value: d,
    type: 'physical' as const,
  }));

  const arrivals: AudioDeviceOption[] = arrivalsDevices.map(a => ({
    label: `Arrivals ${a.login}${a.isOnline ? '' : ' (офлайн)'}`,
    value: `arrivals:${a.moduleId}`,
    type: 'arrivals' as const,
    moduleId: a.moduleId,
    isOnline: a.isOnline,
  }));

  return [...physical, ...arrivals];
}

export const MOCK_ARRIVALS_DEVICES: ArrivalsDevice[] = [
  {
    moduleId: 21016318,
    login: 'Касса-1',
    isOnline: true,
    displays: [
      { id: 'disp-001', name: 'Кухня — Основной', isOnline: true, handlerIds: [1, 2], audioOutput: 'tv' },
      { id: 'disp-002', name: 'Кухня — Гриль', isOnline: true, handlerIds: [1], audioOutput: 'tv' },
      { id: 'disp-003', name: 'Выдача', isOnline: true, handlerIds: [3, 4, 5], audioOutput: 'centralized' },
    ],
  },
  {
    moduleId: 21016319,
    login: 'Касса-2',
    isOnline: true,
    displays: [
      { id: 'disp-004', name: 'Доставка — Экран 1', isOnline: true, handlerIds: [9, 10], audioOutput: 'tv' },
      { id: 'disp-005', name: 'Доставка — Экран 2', isOnline: false, handlerIds: [11], audioOutput: 'tv' },
    ],
  },
  {
    moduleId: 21016320,
    login: 'Касса-3',
    isOnline: false,
    displays: [
      { id: 'disp-006', name: 'Зал — Основной', isOnline: false, handlerIds: [], audioOutput: 'tv' },
    ],
  },
];

export const MOCK_SOUND_TERMINAL_GROUPS: SoundTerminalGroup[] = [
  {
    id: 1,
    name: 'Торг. предприятие',
    terminalCount: 2,
    terminals: [
      { id: 101, name: '127.0.0.1', lastActivity: '2026-05-06 07:12:06', handlerIds: [1, 2, 3], audioDevice: 'arrivals:21016318', arrivalsDeviceId: 21016318 },
      { id: 102, name: '192.168.1.10', lastActivity: '2026-05-05 18:30:22', handlerIds: [1], audioDevice: 'Не выбрано' },
    ],
  },
  {
    id: 2,
    name: 'Ресторан «Центральный»',
    terminalCount: 3,
    terminals: [
      { id: 201, name: '10.0.0.5', lastActivity: '2026-05-06 09:45:11', handlerIds: [1, 9, 10, 11, 12], audioDevice: 'arrivals:21016319', arrivalsDeviceId: 21016319 },
      { id: 202, name: '10.0.0.6', lastActivity: '2026-05-04 14:20:00', handlerIds: [], audioDevice: 'Не выбрано' },
      { id: 203, name: '10.0.0.7', lastActivity: '2026-05-06 10:00:00', handlerIds: [13], audioDevice: 'Device 2' },
    ],
  },
  {
    id: 3,
    name: 'Кафе «Утренняя звезда»',
    terminalCount: 1,
    terminals: [
      { id: 301, name: '172.16.0.1', lastActivity: '2026-05-03 22:10:55', handlerIds: [15, 16], audioDevice: 'Динамики (High Definition Audio Device)' },
    ],
  },
];

/* ── Sounds v2: переделка «Настройка терминалов» ── */

/** Физические аудиоустройства (новая модель) */
export const MOCK_PHYSICAL_AUDIO_DEVICES: string[] = [
  'Динамики (Realtek(R) Audio)',
  'Динамики (High Definition Audio Device)',
  'Наушники (USB)',
];

/** Аудиоустройства варианта «Было» — как на стенде */
export const MOCK_LEGACY_AUDIO_DEVICES: string[] = [
  'Не выбрано',
  'Динамики (Realtek(R) Audio)',
  'Удаленное аудио',
];

/** Дисплеи Arrivals, доступные терминалам ресторана (по группам = RMS) */
export const MOCK_RMS_DISPLAYS: Record<number, DvArrivalsDisplay[]> = {
  1: [
    { id: 'zal', name: 'Дисплей «Зал»', isOnline: true, themeName: 'Тема «Зал днём»' },
    { id: 'kuhnya', name: 'Дисплей «Кухня»', isOnline: true, themeName: 'Тема «Кухня»' },
    { id: 'dostavka', name: 'Дисплей «Доставка»', isOnline: false, themeName: 'Тема «Доставка»' },
  ],
  2: [
    { id: 'zal2', name: 'Дисплей «Зал»', isOnline: true, themeName: 'Тема «Вечерний зал»' },
    { id: 'bar', name: 'Дисплей «Бар»', isOnline: true, themeName: 'Тема «Бар»' },
  ],
  // Группа 3: RMS офлайн — список дисплеев не загружается (демо Error-состояния)
  3: [],
};

/* ── Источники заказов (Arrivals): справочник и назначение ── */

/** Справочник источников заказов (как заведён в Web: Название + Код) */
export const MOCK_ORDER_SOURCES: OrderSourceRef[] = [
  { id: 'front', name: 'Front', code: 'FRONT' },
  { id: 'kiosk', name: 'Киоск (Kiosk)', code: 'KIOSK' },
  { id: 'delivery', name: 'Доставка (Delivery Club)', code: 'DELIVERY' },
  { id: 'website', name: 'Сайт (Website)', code: 'WEB' },
  { id: 'app', name: 'Мобильное приложение (App)', code: 'APP' },
  { id: 'external', name: 'Внешний сервис', code: 'EXTERNAL' },
  { id: 'pickup', name: 'Самовывоз (Pickup)', code: 'PICKUP' },
];

/**
 * Настройки источников заказов сети (модель v3).
 * Глобальная настройка — неудаляемая первая запись справочника (isGlobal).
 * Дочерние («Своя 7» — кейс Вита, «Доставка 6») — назначаются на рестораны.
 * Настройки конкретных источников — единые на сеть (не копируются в ресторан).
 */
export const MOCK_NETWORK_ORDER_SOURCE_CONFIG: NetworkOrderSourceConfig = {
  commonSettings: [
    { id: 'global', name: 'Общая настройка (сеть)', isGlobal: true, prefix: '', length: 5, fillSymbols: '' },
    { id: 'c1', name: 'Своя 7 (Вит)', prefix: '', length: 7, fillSymbols: '' },
    { id: 'c2', name: 'Доставка 6', prefix: 'D-', length: 6, fillSymbols: '0' },
  ],
  sourceSettings: [
    { id: 's1', sourceId: 'kiosk', prefix: 'K', length: 4, fillSymbols: '' },
    { id: 's2', sourceId: 'delivery', prefix: 'DEL-', length: 6, fillSymbols: '0' },
  ],
  restaurants: [
    { restaurantId: 1, commonSettingId: null },
    { restaurantId: 2, commonSettingId: 'c1' },
    { restaurantId: 3, commonSettingId: 'c2' },
  ],
};

/** Опции селектов формы настройки отображения (как на стенде) */
export const DISPLAY_FILTER_OPTIONS = ['Не использовать', 'Ресторан', 'Доставка', 'Самовывоз'];
export const DISPLAY_SORTING_OPTIONS = ['Не использовать', 'По времени создания', 'По времени готовности'];

/**
 * Справочник настроек отображения уровня дисплея («Основные настройки» стенда).
 * Назначаются на дисплеи в строках «Настройка терминалов».
 */
export const MOCK_DISPLAY_SETTINGS: DisplaySetting[] = [
  {
    id: 'd1',
    name: 'Моя настройка',
    serviceTypeFilter: 'Не использовать',
    orderSourceFilter: 'Не использовать',
    sorting: 'Не использовать',
    popupIntervalSec: 30,
    popupDurationSec: 5,
  },
  {
    id: 'd2',
    name: 'Настройка для Вани',
    serviceTypeFilter: 'Ресторан',
    orderSourceFilter: 'Киоск (Kiosk)',
    sorting: 'По времени готовности',
    popupIntervalSec: 60,
    popupDurationSec: 8,
  },
  {
    id: 'd3',
    name: 'тест',
    serviceTypeFilter: 'Доставка',
    orderSourceFilter: 'Доставка (Delivery Club)',
    sorting: 'По времени создания',
    popupIntervalSec: 45,
    popupDurationSec: 6,
  },
];

/** Терминалы в новой модели: у каждого — несколько устройств вывода */
export const MOCK_SOUND_TERMINAL_GROUPS_V2: SoundTerminalGroupV2[] = [
  {
    id: 1,
    name: 'Мой ресторан',
    terminals: [
      {
        id: 101,
        name: '127.0.0.1',
        lastActivity: '30.07.2026, 23:11:22',
        devices: [
          { id: 'd1', kind: 'physical', audioDevice: 'Динамики (Realtek(R) Audio)', handlerIds: [12, 16] },
          { id: 'd2', kind: 'arrivals-display', displayId: 'zal', displayName: 'Дисплей «Зал»', displayOnline: true, themeName: 'Тема «Зал днём»', handlerIds: [7] },
          { id: 'd3', kind: 'arrivals-display', displayId: 'dostavka', displayName: 'Дисплей «Доставка»', displayOnline: false, themeName: 'Тема «Доставка»', handlerIds: [9] },
        ],
      },
      {
        id: 102,
        name: '192.168.99.116',
        lastActivity: '20.01.2026, 14:04:06',
        devices: [
          { id: 'd1', kind: 'physical', audioDevice: 'Динамики (Realtek(R) Audio)', handlerIds: [] },
        ],
      },
      {
        id: 103,
        name: 'MSK-IIKO-285.resto.lan (192.168.0.187)',
        lastActivity: '22.07.2026, 17:47:29',
        devices: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Ресторан «Центральный»',
    terminals: [
      {
        id: 201,
        name: '10.0.0.5',
        lastActivity: '18.08.2026, 09:45:11',
        devices: [
          { id: 'd1', kind: 'physical', audioDevice: 'Динамики (High Definition Audio Device)', handlerIds: [1, 2] },
          { id: 'd2', kind: 'arrivals-display', displayId: 'bar', displayName: 'Дисплей «Бар»', displayOnline: true, themeName: 'Тема «Бар»', handlerIds: [13] },
        ],
      },
      {
        id: 202,
        name: '10.0.0.6',
        lastActivity: '17.08.2026, 14:20:00',
        devices: [
          { id: 'd1', kind: 'physical', audioDevice: 'Наушники (USB)', handlerIds: [12] },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Кафе «Утренняя звезда»',
    terminals: [
      { id: 301, name: '172.16.0.1', lastActivity: '03.08.2026, 22:10:55', devices: [] },
    ],
  },
];

/** Мок-данные варианта «Было» — реплика стенда (легаси-модель) */
export const MOCK_SOUND_TERMINAL_GROUPS_LEGACY: SoundTerminalGroup[] = [
  {
    id: 1,
    name: 'Мой ресторан',
    terminalCount: 3,
    terminals: [
      { id: 101, name: '127.0.0.1', lastActivity: '30.07.2026, 23:11:22 +4', handlerIds: [7, 12, 16], audioDevice: 'Динамики (Realtek(R) Audio)' },
      { id: 102, name: '192.168.99.116', lastActivity: '20.01.2026, 14:04:06 +4', handlerIds: [7], audioDevice: 'Динамики (Realtek(R) Audio)' },
      { id: 103, name: 'MSK-IIKO-285.resto.lan (192.168.0.187)', lastActivity: '22.07.2026, 17:47:29 +4', handlerIds: [9], audioDevice: 'Удаленное аудио' },
    ],
  },
  {
    id: 2,
    name: 'Ресторан «Центральный»',
    terminalCount: 2,
    terminals: [
      { id: 201, name: '10.0.0.5', lastActivity: '18.08.2026, 09:45:11 +4', handlerIds: [1, 2, 3], audioDevice: 'Удаленное аудио' },
      { id: 202, name: '10.0.0.6', lastActivity: '17.08.2026, 14:20:00 +4', handlerIds: [], audioDevice: 'Не выбрано' },
    ],
  },
  {
    id: 3,
    name: 'Кафе «Утренняя звезда»',
    terminalCount: 1,
    terminals: [
      { id: 301, name: '172.16.0.1', lastActivity: '03.08.2026, 22:10:55 +4', handlerIds: [15, 16], audioDevice: 'Динамики (Realtek(R) Audio)' },
    ],
  },
];

/** Системный префикс обработчика — как на стенде: Доставка *, Кухня **, Бронь *** */
export function getSystemHandlerPrefix(name: string): string {
  if (name.startsWith('Бронь:')) return '***';
  if (name.startsWith('Кухня:')) return '**';
  if (name.startsWith('Доставка:')) return '*';
  return '';
}

/** Отображаемое имя обработчика с системным префиксом */
export function getHandlerDisplayName(name: string): string {
  return getSystemHandlerPrefix(name) + name;
}

/* ── Sounds v2: «Обработчики событий» ── */

export const MOCK_DV_COLLECTIONS: DvCollection[] = [
  { id: 1, name: 'Системные обработчики событий', isSystem: true },
  { id: 2, name: 'Доставка', isSystem: true },
  { id: 3, name: 'Кухня', isSystem: true },
  { id: 4, name: 'Бронь', isSystem: true },
  { id: 5, name: '1145' },
];

/** Полный список событий стенда (34) */
export const MOCK_DV_EVENTS: string[] = [
  'Бронь: банкет завершен',
  'Бронь: банкет начат',
  'Бронь: банкет начат (универсально)',
  'Бронь: банкет отменен (no-show)',
  'Бронь: включено напоминание о подготовке',
  'Бронь: гость пришел (резерв закрыт)',
  'Бронь: отмена (гость не пришел)',
  'Бронь: отмена (гость отказался)',
  'Бронь: отмена (другая причина)',
  'Бронь: резерв закрыт (любой исход)',
  'Бронь: создан банкет',
  'Бронь: создан резерв',
  'Доставка: готовится',
  'Доставка: доставлено',
  'Доставка: закрыто',
  'Доставка: курьер в пути',
  'Доставка: назначен курьер',
  'Доставка: новый заказ',
  'Доставка: ожидает отправки',
  'Доставка: отменено',
  'Доставка: подтвержден',
  'Доставка: приготовлен',
  'Доставка: тайм-аут',
  'Доставка: упакован',
  'Кухня: заказ в ожидании (Idle)',
  'Кухня: заказ в приготовлении (Processing1)',
  'Кухня: заказ в приготовлении (Processing2)',
  'Кухня: заказ в приготовлении (Processing3)',
  'Кухня: заказ в приготовлении (Processing4)',
  'Кухня: заказ выдан (Served)',
  'Кухня: заказ приготовлен (Processed)',
  'Кухня: заказ удален',
  'Кухня: заказ упакован',
  'Кухня: новый кухонный заказ',
];

export const MOCK_DV_VOICES: string[] = ['Светлана', 'Дмитрий'];

export const MOCK_DV_VARIABLES: { label: string; token: string }[] = [
  { label: 'Имя гостя', token: '[guest_name]' },
  { label: 'Номер заказа', token: '[order_number]' },
  { label: 'Номер стола', token: '[table_number]' },
];

export const MOCK_DV_AUDIO_FILES: DvAudioFile[] = [
  { id: 1, name: 'Банкет завершен', sizeKb: 22, date: '21.01.1970' },
  { id: 2, name: 'Банкет начался', sizeKb: 21, date: '21.01.1970' },
  { id: 3, name: 'Гость пришел', sizeKb: 16, date: '21.01.1970' },
  { id: 4, name: 'kitten_crying.mp3', sizeKb: 293, date: '21.01.1970' },
  { id: 5, name: 'new_cooking_stage.mp3', sizeKb: 28, date: '21.01.1970' },
  { id: 6, name: 'samsung-notification-sound-bass-boosted.mp3', sizeKb: 20, date: '21.01.1970' },
  { id: 7, name: 'sound.mp3', sizeKb: 16, date: '21.01.1970' },
  { id: 8, name: 'time_is_over.mp3', sizeKb: 52, date: '21.01.1970' },
];

export const MOCK_DV_HANDLERS: DvEventHandler[] = [
  // ── Системные обработчики событий (collection 1) — файлы ──
  { id: 1, name: 'Кухня: заказ приготовлен (Processed)', collectionIds: [1], events: ['Кухня: заказ приготовлен (Processed)'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 2, name: 'Доставка: новый заказ', collectionIds: [1], events: ['Доставка: новый заказ'], voiceType: 'file', fileName: 'kitten_crying.mp3', fileSizeKb: 293 },
  { id: 3, name: 'Доставка: доставлено', collectionIds: [1], events: ['Доставка: доставлено'], voiceType: 'file', fileName: 'time_is_over.mp3', fileSizeKb: 52 },
  { id: 4, name: 'Доставка: закрыто', collectionIds: [1], events: ['Доставка: закрыто'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 5, name: 'Доставка: отменено', collectionIds: [1], events: ['Доставка: отменено'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 6, name: 'Доставка: назначен курьер', collectionIds: [1], events: ['Доставка: назначен курьер'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 7, name: 'Бронь: создан резерв', collectionIds: [1], events: ['Бронь: создан резерв'], voiceType: 'file', fileName: 'Банкет завершен', fileSizeKb: 22 },
  { id: 8, name: 'Бронь: создан банкет', collectionIds: [1], events: ['Бронь: создан банкет'], voiceType: 'file', fileName: 'Банкет начался', fileSizeKb: 21 },
  { id: 9, name: 'Бронь: включено напоминание о подготовке', collectionIds: [1], events: ['Бронь: включено напоминание о подготовке'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 10, name: 'Бронь: гость пришел (резерв закрыт)', collectionIds: [1], events: ['Бронь: гость пришел (резерв закрыт)'], voiceType: 'file', fileName: 'Гость пришел', fileSizeKb: 16 },
  { id: 11, name: 'Бронь: отмена (гость отказался)', collectionIds: [1], events: ['Бронь: отмена (гость отказался)'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 12, name: 'Бронь: отмена (другая причина)', collectionIds: [1], events: ['Бронь: отмена (другая причина)'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },

  // ── Доставка (collection 2, 13) — генерация, все Готово ──
  { id: 13, name: 'Доставка: новый заказ', collectionIds: [2], events: ['Доставка: новый заказ'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Внимание, поступил новый заказ на доставку номер [order_number]', generationStatus: 'done' },
  { id: 14, name: 'Доставка: подтвержден', collectionIds: [2], events: ['Доставка: подтвержден'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] подтвержден', generationStatus: 'done' },
  { id: 15, name: 'Доставка: готовится', collectionIds: [2], events: ['Доставка: готовится'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] готовится', generationStatus: 'done' },
  { id: 16, name: 'Доставка: приготовлен', collectionIds: [2], events: ['Доставка: приготовлен'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] приготовлен', generationStatus: 'done' },
  { id: 17, name: 'Доставка: упакован', collectionIds: [2], events: ['Доставка: упакован'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] упакован', generationStatus: 'done' },
  { id: 18, name: 'Доставка: ожидает отправки', collectionIds: [2], events: ['Доставка: ожидает отправки'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] ожидает отправки', generationStatus: 'done' },
  { id: 19, name: 'Доставка: назначен курьер', collectionIds: [2], events: ['Доставка: назначен курьер'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'На заказ [order_number] назначен курьер', generationStatus: 'done' },
  { id: 20, name: 'Доставка: курьер в пути', collectionIds: [2], events: ['Доставка: курьер в пути'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Курьер с заказом [order_number] уже в пути', generationStatus: 'done' },
  { id: 21, name: 'Доставка: доставлено', collectionIds: [2], events: ['Доставка: доставлено'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] доставлен', generationStatus: 'done' },
  { id: 22, name: 'Доставка: закрыто', collectionIds: [2], events: ['Доставка: закрыто'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] закрыт', generationStatus: 'done' },
  { id: 23, name: 'Доставка: отменен', collectionIds: [2], events: ['Доставка: отменено'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] отменен', generationStatus: 'done' },
  { id: 24, name: 'Доставка: тайм-аут', collectionIds: [2], events: ['Доставка: тайм-аут'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Время обработки заказа [order_number] истекло', generationStatus: 'done' },

  // ── Кухня (collection 3, 11) — генерация, все Готово ──
  { id: 25, name: 'Кухня: новый кухонный заказ', collectionIds: [3], events: ['Кухня: новый кухонный заказ'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Новый заказ на кухне: [order_number]', generationStatus: 'done' },
  { id: 26, name: 'Кухня: заказ в ожидании', collectionIds: [3], events: ['Кухня: заказ в ожидании (Idle)'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] в ожидании', generationStatus: 'done' },
  { id: 27, name: 'Кухня: заказ в приготовлении (готовится 1)', collectionIds: [3], events: ['Кухня: заказ в приготовлении (Processing1)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] готовится', generationStatus: 'done' },
  { id: 28, name: 'Кухня: заказ в приготовлении (готовится 2)', collectionIds: [3], events: ['Кухня: заказ в приготовлении (Processing2)'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] готовится', generationStatus: 'done' },
  { id: 29, name: 'Кухня: заказ в приготовлении (готовится 3)', collectionIds: [3], events: ['Кухня: заказ в приготовлении (Processing3)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] готовится', generationStatus: 'done' },
  { id: 30, name: 'Кухня: заказ в приготовлении (готовится 4)', collectionIds: [3], events: ['Кухня: заказ в приготовлении (Processing4)'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] готовится', generationStatus: 'done' },
  { id: 31, name: 'Кухня: заказ приготовлен', collectionIds: [3], events: ['Кухня: заказ приготовлен (Processed)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] приготовлен', generationStatus: 'done' },
  { id: 32, name: 'Кухня: заказ выдан', collectionIds: [3], events: ['Кухня: заказ выдан (Served)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] выдан', generationStatus: 'done' },
  { id: 33, name: 'Кухня: удален', collectionIds: [3], events: ['Кухня: заказ удален'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Заказ [order_number] удален', generationStatus: 'done' },
  { id: 34, name: 'Кухня: заказ упакован', collectionIds: [3], events: ['Кухня: заказ упакован'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ [order_number] упакован', generationStatus: 'done' },

  // ── Бронь (collection 4, 14) — генерация, все Готово + 1185 ──
  { id: 35, name: 'Бронь: создан резерв', collectionIds: [4], events: ['Бронь: создан резерв'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Создан резерв на [order_number]', generationStatus: 'done' },
  { id: 36, name: 'Бронь: создан банкет', collectionIds: [4], events: ['Бронь: создан банкет'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Создан банкет', generationStatus: 'done' },
  { id: 37, name: 'Бронь: банкет начат', collectionIds: [4], events: ['Бронь: банкет начат'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Банкет начат', generationStatus: 'done' },
  { id: 38, name: 'Бронь: банкет начат (универсально)', collectionIds: [4], events: ['Бронь: банкет начат (универсально)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Банкет начат', generationStatus: 'done' },
  { id: 39, name: 'Бронь: гость пришел', collectionIds: [4], events: ['Бронь: гость пришел (резерв закрыт)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Гость [guest_name] пришел', generationStatus: 'done' },
  { id: 40, name: 'Бронь: включено напоминание о подготовке', collectionIds: [4], events: ['Бронь: включено напоминание о подготовке'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Напоминание: банкет скоро начнется', generationStatus: 'done' },
  { id: 41, name: 'Бронь: банкет отменен', collectionIds: [4], events: ['Бронь: банкет отменен (no-show)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Банкет отменен', generationStatus: 'done' },
  { id: 42, name: 'Бронь: отмена (гость не пришел)', collectionIds: [4], events: ['Бронь: отмена (гость не пришел)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Бронь отменена: гость не пришел', generationStatus: 'done' },
  { id: 43, name: 'Бронь: отмена (гость отказался)', collectionIds: [4], events: ['Бронь: отмена (гость отказался)'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Бронь отменена: гость отказался', generationStatus: 'done' },
  { id: 44, name: 'Бронь: отмена (другая причина)', collectionIds: [4], events: ['Бронь: отмена (другая причина)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Бронь отменена', generationStatus: 'done' },
  { id: 45, name: 'Бронь: резерв закрыт (любой исход)', collectionIds: [4], events: ['Бронь: резерв закрыт (любой исход)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Резерв закрыт', generationStatus: 'done' },
  { id: 46, name: 'Бронь: банкет завершен', collectionIds: [4], events: ['Бронь: банкет завершен'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Банкет завершен', generationStatus: 'done' },
  { id: 47, name: '1185', collectionIds: [4], events: ['Доставка: новый заказ'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Озвучка 1185', generationStatus: 'done' },

  // ── «тест» — обработчик в нескольких коллекциях (Доставка, Кухня, Бронь, 1145) ──
  { id: 48, name: 'тест', collectionIds: [2, 3, 4, 5], events: ['Доставка: новый заказ'], voiceType: 'generation', voiceName: 'Дмитрий', phraseText: 'Тестовая фраза', generationStatus: 'pending' },

  // ── 1145 (collection 5, 5) ──
  { id: 49, name: 'Тест 1145 (файл)', collectionIds: [5], events: ['Доставка: доставлено'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 50, name: '1145 (генерация)', collectionIds: [5], events: ['Доставка: новый заказ'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Тест 1145', generationStatus: 'done' },
  { id: 51, name: 'Тест 1145 (файл) (Copy)', collectionIds: [5], events: ['Доставка: доставлено'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 52, name: '1145 (генерация) (Copy)', collectionIds: [5], events: ['Доставка: новый заказ'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Тест 1145', generationStatus: 'done' },

  // ── Без коллекции (2) ──
  { id: 53, name: '111', collectionIds: [], events: ['Доставка: закрыто'], voiceType: 'file', fileName: 'sound.mp3', fileSizeKb: 16 },
  { id: 54, name: 'KD', collectionIds: [], events: ['Кухня: заказ выдан (Served)'], voiceType: 'generation', voiceName: 'Светлана', phraseText: 'Заказ выдан', generationStatus: 'done' },
];

/* ── Available Voices ── */

export const AVAILABLE_VOICES: string[] = ['Ксения', 'Ирина', 'Василий'];

/* ── Sound Catalog (Справочник звуков) ── */

/**
 * Числа генерируются как компоненты: цифры (1–9), десятки (10–90), сотни (100–900).
 * Итого 27 файлов на голос — достаточно для озвучки любого числа до 9999
 * (четырёхзначные озвучиваются как "1" + "999").
 */
export const MOCK_SOUND_FOLDERS: SoundFolder[] = [
  {
    id: 1, voiceName: 'Ксения', category: 'numbers', label: 'Числа',
    totalCount: 27, generatedCount: 27,
    files: [
      // Цифры 1–9
      { id: 101, name: '1.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 102, name: '2.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 103, name: '3.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 104, name: '4.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 105, name: '5.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 106, name: '6.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 107, name: '7.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 108, name: '8.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 109, name: '9.wav', duration: '0:01', createdAt: '2026-04-10' },
      // Десятки 10–90
      { id: 110, name: '10.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 111, name: '20.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 112, name: '30.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 113, name: '40.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 114, name: '50.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 115, name: '60.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 116, name: '70.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 117, name: '80.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 118, name: '90.wav', duration: '0:01', createdAt: '2026-04-10' },
      // Сотни 100–900
      { id: 119, name: '100.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 120, name: '200.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 121, name: '300.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 122, name: '400.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 123, name: '500.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 124, name: '600.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 125, name: '700.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 126, name: '800.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 127, name: '900.wav', duration: '0:02', createdAt: '2026-04-10' },
    ],
  },
  {
    id: 2, voiceName: 'Ксения', category: 'phrases', label: 'Фразы',
    totalCount: 2, generatedCount: 2,
    files: [
      { id: 201, name: 'novyj_zakaz_dostavki_{nomer}.wav', duration: '0:04', createdAt: '2026-05-01' },
      { id: 202, name: 'zakaz_{nomer}_gotov.wav', duration: '0:03', createdAt: '2026-05-02' },
    ],
  },
  {
    id: 3, voiceName: 'Ирина', category: 'numbers', label: 'Числа',
    totalCount: 27, generatedCount: 18,
    files: [
      // Цифры 1–9
      { id: 301, name: '1.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 302, name: '2.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 303, name: '3.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 304, name: '4.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 305, name: '5.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 306, name: '6.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 307, name: '7.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 308, name: '8.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 309, name: '9.wav', duration: '0:01', createdAt: '2026-04-12' },
      // Десятки 10–90
      { id: 310, name: '10.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 311, name: '20.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 312, name: '30.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 313, name: '40.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 314, name: '50.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 315, name: '60.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 316, name: '70.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 317, name: '80.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 318, name: '90.wav', duration: '0:01', createdAt: '2026-04-12' },
      // Сотни — ещё не сгенерированы
    ],
  },
  {
    id: 4, voiceName: 'Ирина', category: 'phrases', label: 'Фразы',
    totalCount: 0, generatedCount: 0,
    files: [],
  },
  {
    id: 5, voiceName: 'Василий', category: 'numbers', label: 'Числа',
    totalCount: 27, generatedCount: 27,
    files: [
      // Цифры 1–9
      { id: 501, name: '1.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 502, name: '2.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 503, name: '3.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 504, name: '4.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 505, name: '5.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 506, name: '6.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 507, name: '7.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 508, name: '8.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 509, name: '9.wav', duration: '0:01', createdAt: '2026-04-15' },
      // Десятки 10–90
      { id: 510, name: '10.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 511, name: '20.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 512, name: '30.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 513, name: '40.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 514, name: '50.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 515, name: '60.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 516, name: '70.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 517, name: '80.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 518, name: '90.wav', duration: '0:01', createdAt: '2026-04-15' },
      // Сотни 100–900
      { id: 519, name: '100.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 520, name: '200.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 521, name: '300.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 522, name: '400.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 523, name: '500.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 524, name: '600.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 525, name: '700.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 526, name: '800.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 527, name: '900.wav', duration: '0:02', createdAt: '2026-04-15' },
    ],
  },
  {
    id: 6, voiceName: 'Василий', category: 'phrases', label: 'Фразы',
    totalCount: 1, generatedCount: 1,
    files: [
      { id: 601, name: 'zakaz_{nomer}_gotov_k_vydache.wav', duration: '0:04', createdAt: '2026-05-03' },
    ],
  },
];
