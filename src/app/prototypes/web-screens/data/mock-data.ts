import {
  CustomerScreenDisplay,
  ScreenTheme,
  ScreenControl,
  ArrivalTerminal,
  SidebarSection,
  ArrivalsThemeListItem,
  ArrivalsTheme,
  ProductCatalogItem,
} from '../types';

/** Секции бокового меню Web */
export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Экран покупателя',
    icon: 'monitor',
    items: [
      { icon: '', label: 'Дисплеи', route: 'displays' },
      { icon: '', label: 'Подсказки', route: 'hints' },
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
    ],
  },
  {
    title: 'Звуки',
    icon: 'volume-2',
    route: 'sounds',
    items: [],
  },
  {
    title: 'Подсказки',
    icon: 'wand-2',
    route: 'global-hints',
    items: [],
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
