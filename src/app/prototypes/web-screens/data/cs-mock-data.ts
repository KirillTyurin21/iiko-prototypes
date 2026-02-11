import {
  CSControl, ControlElement, CSTheme, ThemeElement, HintAreaSettings,
  Hint, CSTerminal, Campaign, HintAssignment, Discount, ProductNode,
} from '../cs-types';

// ═══════════════════════════════════════════════
// Контролы (полные с элементами)
// ═══════════════════════════════════════════════

export const CS_CONTROLS: CSControl[] = [
  {
    id: 1, name: 'Анимация заказа', type: 'animation', elementsCount: 5,
    elements: [
      { id: 1, type: 'area', name: 'Область', settings: { layout: { x: 0, y: 0, width: 400, height: 300, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 12 } } },
      { id: 2, type: 'product-image', name: 'Изображение товара', settings: { layout: { x: 20, y: 20, width: 150, height: 150, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 8 } } },
      { id: 3, type: 'product-name', name: 'Название продукта', settings: { layout: { x: 190, y: 20, width: 190, height: 40, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 18, family: 'Roboto', align: 'left', style: 'normal', weight: 'bold' } } },
      { id: 4, type: 'price', name: 'Цена', settings: { layout: { x: 190, y: 70, width: 100, height: 30, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'left', style: 'normal', weight: 'normal' } } },
      { id: 5, type: 'last-added-dish', name: 'Последнее добавленное блюдо', settings: { layout: { x: 190, y: 110, width: 190, height: 30, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 14, family: 'Roboto', align: 'left', style: 'italic', weight: 'normal' } } },
    ],
  },
  {
    id: 2, name: 'Анимация добавления', type: 'animation', elementsCount: 3,
    elements: [
      { id: 1, type: 'product-image', name: 'Изображение товара', settings: { layout: { x: 0, y: 0, width: 200, height: 200, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 1, color: '#ffffff', type: 'solid', radius: 12 } } },
      { id: 2, type: 'full-product-name', name: 'Полное название продукта', settings: { layout: { x: 0, y: 210, width: 200, height: 40, padding: [4,0,4,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'center', style: 'normal', weight: 'bold' } } },
      { id: 3, type: 'quantity', name: 'Количество продукции', settings: { layout: { x: 0, y: 260, width: 200, height: 30, padding: [2,0,2,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 14, family: 'Roboto', align: 'center', style: 'normal', weight: 'normal' } } },
    ],
  },
  {
    id: 3, name: 'Промо-анимация', type: 'animation', elementsCount: 4,
    elements: [
      { id: 1, type: 'image', name: 'Изображение', settings: { layout: { x: 0, y: 0, width: 300, height: 180, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 8 } } },
      { id: 2, type: 'text', name: 'Текст', settings: { layout: { x: 0, y: 190, width: 300, height: 30, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 14, family: 'Roboto', align: 'center', style: 'normal', weight: 'normal' } } },
      { id: 3, type: 'product-name', name: 'Название продукта', settings: { layout: { x: 0, y: 230, width: 300, height: 30, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 18, family: 'Roboto', align: 'center', style: 'normal', weight: 'bold' } } },
      { id: 4, type: 'price', name: 'Цена', settings: { layout: { x: 0, y: 270, width: 300, height: 30, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'center', style: 'normal', weight: 'bold' } } },
    ],
  },
  {
    id: 4, name: 'Подсказка кофе', type: 'hint', elementsCount: 6,
    elements: [
      { id: 1, type: 'product-image', name: 'Изображение товара', settings: { layout: { x: 10, y: 10, width: 120, height: 120, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 8 } } },
      { id: 2, type: 'product-name', name: 'Название продукта', settings: { layout: { x: 140, y: 10, width: 200, height: 30, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'left', style: 'normal', weight: 'bold' } } },
      { id: 3, type: 'hint-slogan', name: 'Слоган подсказки', settings: { layout: { x: 140, y: 45, width: 200, height: 40, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 13, family: 'Roboto', align: 'left', style: 'italic', weight: 'normal' } } },
      { id: 4, type: 'discount-name', name: 'Название скидки', settings: { layout: { x: 140, y: 90, width: 200, height: 20, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 12, family: 'Roboto', align: 'left', style: 'normal', weight: 'normal' } } },
      { id: 5, type: 'discounted-price', name: 'Цена со скидкой', settings: { layout: { x: 140, y: 115, width: 100, height: 25, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 18, family: 'Roboto', align: 'left', style: 'normal', weight: 'bold' } } },
      { id: 6, type: 'old-price', name: 'Старая цена', settings: { layout: { x: 250, y: 115, width: 90, height: 25, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 14, family: 'Roboto', align: 'left', style: 'normal', weight: 'normal' } } },
    ],
  },
  {
    id: 5, name: 'Подсказка десерт', type: 'hint', elementsCount: 4,
    elements: [
      { id: 1, type: 'hint-banner', name: 'Баннер подсказки', isRequired: true, settings: { layout: { x: 0, y: 0, width: 350, height: 160, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 12 } } },
      { id: 2, type: 'hint-slogan', name: 'Слоган подсказки', settings: { layout: { x: 10, y: 170, width: 330, height: 40, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'center', style: 'normal', weight: 'bold' } } },
      { id: 3, type: 'price', name: 'Цена', settings: { layout: { x: 10, y: 220, width: 160, height: 25, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 18, family: 'Roboto', align: 'right', style: 'normal', weight: 'bold' } } },
      { id: 4, type: 'discount-size', name: 'Размер скидки', settings: { layout: { x: 180, y: 220, width: 160, height: 25, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'left', style: 'normal', weight: 'bold' } } },
    ],
  },
  {
    id: 6, name: 'Подсказка скидка', type: 'hint', elementsCount: 7,
    elements: [
      { id: 1, type: 'area', name: 'Область', settings: { layout: { x: 0, y: 0, width: 380, height: 260, padding: [8,8,8,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 1, color: '#ffffff', type: 'solid', radius: 12 } } },
      { id: 2, type: 'product-image', name: 'Изображение товара', settings: { layout: { x: 10, y: 10, width: 140, height: 140, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 8 } } },
      { id: 3, type: 'full-product-name', name: 'Полное название продукта', settings: { layout: { x: 160, y: 10, width: 210, height: 35, padding: [4,8,4,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 16, family: 'Roboto', align: 'left', style: 'normal', weight: 'bold' } } },
      { id: 4, type: 'hint-slogan', name: 'Слоган подсказки', settings: { layout: { x: 160, y: 50, width: 210, height: 50, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 13, family: 'Roboto', align: 'left', style: 'italic', weight: 'normal' } } },
      { id: 5, type: 'hint-banner', name: 'Баннер подсказки', isRequired: true, settings: { layout: { x: 10, y: 160, width: 360, height: 90, padding: [0,0,0,0], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 8 } } },
      { id: 6, type: 'discount-name', name: 'Название скидки', settings: { layout: { x: 160, y: 105, width: 210, height: 20, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 12, family: 'Roboto', align: 'left', style: 'normal', weight: 'normal' } } },
      { id: 7, type: 'discounted-price', name: 'Цена со скидкой', settings: { layout: { x: 160, y: 130, width: 120, height: 25, padding: [2,8,2,8], bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0 }, border: { width: 0, color: '#ffffff', type: 'none', radius: 0 }, font: { color: '#000000', size: 18, family: 'Roboto', align: 'left', style: 'normal', weight: 'bold' } } },
    ],
  },
];

// ═══════════════════════════════════════════════
// Подсказки
// ═══════════════════════════════════════════════

export const CS_HINTS: Hint[] = [
  {
    id: 1, name: 'Пирожок к кофе', status: 'active',
    period: { startDate: '2026-01-01', endDate: '2026-06-30' },
    time: { startTime: '08:00', endTime: '12:00' },
    slogan: 'Не забудьте купить пирожок! При покупке с кофе — скидка 15%',
    discountType: 'percent', discountValue: 15,
    discount: 'Скидка на выпечку к кофе',
    triggers: [{ id: 1, name: 'Кофейные напитки', type: 'category' }, { id: 15, name: 'Латте большой', type: 'product' }],
    recommendation: { id: 32, name: 'Пирожок вишнёвый', type: 'product' },
    image: null, imageSource: 'gallery', controlId: 4,
  },
  {
    id: 2, name: 'Десерт к обеду', status: 'scheduled',
    period: { startDate: '2026-03-01', endDate: '2026-05-31' },
    time: { startTime: '12:00', endTime: '15:00' },
    slogan: 'Побалуйте себя десертом! Чизкейк со скидкой к обеду',
    discountType: 'fixed', discountValue: 50,
    discount: 'Скидка на десерт к обеду',
    triggers: [{ id: 5, name: 'Обеденное меню', type: 'category' }, { id: 51, name: 'Бизнес-ланч', type: 'product' }],
    recommendation: { id: 42, name: 'Чизкейк', type: 'product' },
    image: null, imageSource: 'gallery', controlId: 5,
  },
  {
    id: 3, name: 'Сок к завтраку', status: 'active',
    period: { startDate: '2026-01-15', endDate: '2026-12-31' },
    time: { startTime: '07:00', endTime: '11:00' },
    slogan: 'Свежевыжатый сок — идеальное начало утра! Скидка 20% к завтраку',
    discountType: 'percent', discountValue: 20,
    discount: 'Утренняя скидка на напитки',
    triggers: [{ id: 6, name: 'Завтраки', type: 'category' }, { id: 31, name: 'Круассан', type: 'product' }],
    recommendation: { id: 61, name: 'Апельсиновый фреш', type: 'product' },
    image: null, imageSource: 'menu', controlId: 6,
  },
  {
    id: 4, name: 'Суп дня', status: 'active',
    period: { startDate: '2026-02-01', endDate: '2026-04-30' },
    time: { startTime: '11:30', endTime: '16:00' },
    slogan: 'Согрейтесь супом дня! Томатный крем-суп всего за 199 ₽',
    discountType: 'fixed', discountValue: 100,
    discount: 'Скидка на суп к основному блюду',
    triggers: [{ id: 7, name: 'Салаты и супы', type: 'category' }, { id: 52, name: 'Паста Карбонара', type: 'product' }, { id: 53, name: 'Стейк из курицы', type: 'product' }],
    recommendation: { id: 71, name: 'Томатный крем-суп', type: 'product' },
    image: null, imageSource: null, controlId: 4,
  },
  {
    id: 5, name: 'Комбо-обед', status: 'active',
    period: { startDate: '2026-01-10', endDate: '2026-12-31' },
    time: { startTime: '12:00', endTime: '16:00' },
    slogan: 'Собери комбо-обед! Суп + горячее + напиток = скидка 25%',
    discountType: 'percent', discountValue: 25,
    discount: 'Комбо-обед 25%',
    triggers: [{ id: 5, name: 'Обеденное меню', type: 'category' }],
    recommendation: null,
    image: null, imageSource: 'uploaded', controlId: 5,
  },
];

// ═══════════════════════════════════════════════
// Темы (полные с элементами)
// ═══════════════════════════════════════════════

export const CS_THEMES: CSTheme[] = [
  {
    id: 1, name: 'Основная тема кофейни', description: 'Стандартная тема с анимациями и подсказками',
    updatedAt: '10.02.2026 14:30', elementsCount: 4,
    elements: [
      { id: 1, type: 'image', name: 'Фон', layout: { x: 0, y: 0, width: 1920, height: 1080 } },
      { id: 2, type: 'animation', name: 'Анимации', controlId: 1, controlName: 'Анимация заказа', hideByTimer: true, displayTime: 5, animationDuration: 0.3, animationType: 'fadeIn', layout: { x: 600, y: 100, width: 400, height: 300 } },
      {
        id: 3, type: 'hints', name: 'Подсказки', controlId: 4,
        settings: {
          hideByTimer: false, displayTime: 10, animationDuration: 0.5, animationType: 'fadeIn',
          areaMode: 'list', fillDirection: 'horizontal', maxColumns: 3, rowGap: 8, columnGap: 8,
          hintLifetime: 30, maxHintsVisible: 3, triggerRemovalBehavior: 'remove',
          layout: { x: 50, y: 750, width: 1820, height: 280, padding: [8,8,8,8] },
          border: { width: 0, color: '#CCCCCC', radius: 8, shadow: { enabled: false, x: 0, y: 0, blur: 0, color: 'rgba(0,0,0,0)' } },
        },
        elements: [
          { id: 1, type: 'hint-banner', name: 'Баннер подсказки' },
          { id: 2, type: 'hint-slogan', name: 'Слоган подсказки' },
          { id: 3, type: 'product-name', name: 'Название продукта' },
          { id: 4, type: 'discounted-price', name: 'Цена со скидкой' },
          { id: 5, type: 'old-price', name: 'Старая цена' },
          { id: 6, type: 'discount-name', name: 'Название скидки' },
        ],
      },
      { id: 4, type: 'advertise', name: 'Рекламный блок', layout: { x: 50, y: 400, width: 1820, height: 300 } },
    ],
  },
  {
    id: 2, name: 'Акционная тема', description: 'Тема для проведения промо-акций',
    updatedAt: '09.02.2026 10:15', elementsCount: 3,
    elements: [
      { id: 1, type: 'image', name: 'Фон промо', layout: { x: 0, y: 0, width: 1920, height: 1080 } },
      {
        id: 2, type: 'hints', name: 'Подсказки', controlId: 5,
        settings: {
          hideByTimer: false, displayTime: 10, animationDuration: 0.3, animationType: 'slideUp',
          areaMode: 'list', fillDirection: 'vertical', maxColumns: 1, rowGap: 12, columnGap: 0,
          hintLifetime: 20, maxHintsVisible: 4, triggerRemovalBehavior: 'keepUntilOrderEnd',
          layout: { x: 1400, y: 100, width: 480, height: 880, padding: [12,12,12,12] },
          border: { width: 1, color: '#E5E7EB', radius: 12, shadow: { enabled: true, x: 0, y: 4, blur: 12, color: 'rgba(0,0,0,0.15)' } },
        },
        elements: [
          { id: 1, type: 'hint-banner', name: 'Баннер подсказки' },
          { id: 2, type: 'hint-slogan', name: 'Слоган подсказки' },
          { id: 3, type: 'discount-size', name: 'Размер скидки' },
          { id: 4, type: 'discounted-price', name: 'Цена со скидкой' },
        ],
      },
      { id: 3, type: 'advertise', name: 'Рекламный блок', layout: { x: 50, y: 100, width: 1300, height: 880 } },
    ],
  },
  {
    id: 3, name: 'Минимальная тема', description: 'Только заказ, без рекомендаций',
    updatedAt: '08.02.2026 09:00', elementsCount: 1,
    elements: [
      { id: 1, type: 'image', name: 'Фон минимальный', layout: { x: 0, y: 0, width: 1920, height: 1080 } },
    ],
  },
];

// ═══════════════════════════════════════════════
// Терминалы
// ═══════════════════════════════════════════════

export const CS_CAMPAIGNS: Campaign[] = [
  { id: 1, name: 'Кампания «Завтраки»' },
  { id: 2, name: 'Кампания «Обеды»' },
  { id: 3, name: 'Кампания «Вечер»' },
];

export const CS_TERMINALS: CSTerminal[] = [
  { id: 1, name: 'Касса 1 (Зал)', themeId: 1, themeName: 'Основная тема кофейни', campaigns: [1, 2], hints: [1, 2, 4] },
  { id: 2, name: 'Касса 2 (Зал)', themeId: 1, themeName: 'Основная тема кофейни', campaigns: [1], hints: [1, 3, 5] },
  { id: 3, name: 'Касса 3 (Терраса)', themeId: 2, themeName: 'Акционная тема', campaigns: [2, 3], hints: [1, 2, 3, 4, 5] },
  { id: 4, name: 'Касса 4 (Самообслуживание)', themeId: 3, themeName: 'Минимальная тема', campaigns: [], hints: [] },
];

// ═══════════════════════════════════════════════
// Скидки
// ═══════════════════════════════════════════════

export const DISCOUNTS: Discount[] = [
  { id: 101, name: 'Скидка на выпечку к кофе', type: 'percent', value: 15 },
  { id: 102, name: 'Скидка на десерт к обеду', type: 'fixed', value: 50 },
  { id: 103, name: 'Утренняя скидка на напитки', type: 'percent', value: 20 },
  { id: 104, name: 'Скидка на суп к основному блюду', type: 'fixed', value: 100 },
  { id: 105, name: 'Комбо-обед 25%', type: 'percent', value: 25 },
];

// ═══════════════════════════════════════════════
// Дерево продуктов
// ═══════════════════════════════════════════════

export const PRODUCT_TREE: ProductNode[] = [
  { id: 1, name: 'Кофейные напитки', type: 'category', children: [
    { id: 11, name: 'Эспрессо', type: 'product' },
    { id: 12, name: 'Американо', type: 'product' },
    { id: 13, name: 'Латте', type: 'product' },
    { id: 14, name: 'Капучино', type: 'product' },
    { id: 15, name: 'Латте большой', type: 'product' },
  ] },
  { id: 2, name: 'Чай', type: 'category', children: [
    { id: 21, name: 'Чёрный чай', type: 'product' },
    { id: 22, name: 'Зелёный чай', type: 'product' },
    { id: 23, name: 'Травяной чай', type: 'product' },
  ] },
  { id: 3, name: 'Выпечка', type: 'category', children: [
    { id: 31, name: 'Круассан', type: 'product' },
    { id: 32, name: 'Пирожок вишнёвый', type: 'product' },
    { id: 33, name: 'Пирожок с мясом', type: 'product' },
    { id: 34, name: 'Булочка с корицей', type: 'product' },
  ] },
  { id: 4, name: 'Десерты', type: 'category', children: [
    { id: 41, name: 'Тирамису', type: 'product' },
    { id: 42, name: 'Чизкейк', type: 'product' },
    { id: 43, name: 'Мороженое', type: 'product' },
  ] },
  { id: 5, name: 'Обеденное меню', type: 'category', children: [
    { id: 51, name: 'Бизнес-ланч', type: 'product' },
    { id: 52, name: 'Паста Карбонара', type: 'product' },
    { id: 53, name: 'Стейк из курицы', type: 'product' },
    { id: 54, name: 'Ризотто с грибами', type: 'product' },
  ] },
  { id: 6, name: 'Завтраки', type: 'category', children: [
    { id: 61, name: 'Апельсиновый фреш', type: 'product' },
    { id: 62, name: 'Яичница с беконом', type: 'product' },
    { id: 63, name: 'Овсянка с ягодами', type: 'product' },
    { id: 64, name: 'Тост с авокадо', type: 'product' },
  ] },
  { id: 7, name: 'Салаты и супы', type: 'category', children: [
    { id: 71, name: 'Томатный крем-суп', type: 'product' },
    { id: 72, name: 'Цезарь с курицей', type: 'product' },
    { id: 73, name: 'Греческий салат', type: 'product' },
  ] },
];
