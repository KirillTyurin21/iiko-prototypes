import { HintData, OrderDish } from './hint-types';

/** Мок-данные для демонстрации подсказок */

export const MOCK_ORDER_DISHES: OrderDish[] = [
  { id: '1', name: 'Бургер Классик', price: 389, qty: 1, category: 'Блюда' },
  { id: '2', name: 'Паста Карбонара', price: 420, qty: 1, category: 'Блюда' },
  { id: '3', name: 'Латте', price: 220, qty: 2, category: 'Напитки' },
  { id: '4', name: 'Шоколадный батончик', price: 50, qty: 1, category: 'Десерты' },
];

/** Меню для правой панели (кнопки-блюда) */
export const MOCK_MENU_ITEMS: OrderDish[] = [
  { id: '10', name: 'Блюда', price: 0, qty: 0, category: 'Блюда', isCategory: true },
  { id: '11', name: 'Погашение кредита', price: 0, qty: 0, category: 'Услуги', isCategory: true },
  { id: '12', name: 'Услуги', price: 0, qty: 0, category: 'Услуги', isCategory: true },
  { id: '13', name: 'Чай Nesty', price: 150, qty: 0, category: 'Напитки' },
  { id: '14', name: 'Изъятие', price: 0, qty: 0, category: 'Услуги', isCategory: true },
  { id: '15', name: 'Шоколадный батончик', price: 50, qty: 0, category: 'Десерты' },
  { id: '16', name: 'Кока Кола', price: 120, qty: 0, category: 'Напитки' },
];

/** Быстрые кнопки меню (правая полоса) */
export const MOCK_QUICK_MENU = ['Чай Nesty', 'Шоколадный батончик', 'Кока Кола'];

/** Вариант A — полный набор данных со скидкой */
export const HINT_VARIANT_A: HintData = {
  id: 'hint-1',
  title: 'Специальное предложение',
  slogan: 'Купи яблоко на 7 рублей дешевле!',
  description: 'Вы добавили Бургер Классик. Рекомендуем: Яблоко Голден — отличная пара!',
  imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=🍎',
  recommendation: {
    id: 'rec-1',
    name: 'Яблоко Голден',
    price: 56,
    oldPrice: 56,
    discountedPrice: 49,
    discountName: 'Скидка на яблоко',
    discountAmount: 7,
    attributes: ['150 г', '52 ккал'],
  },
};

/** Вариант B — без картинки и скидки */
export const HINT_VARIANT_B: HintData = {
  id: 'hint-2',
  title: 'Подсказка для кассира',
  slogan: 'Предложите клиенту дополнить заказ!',
  description: '',
  imageUrl: null,
  recommendation: {
    id: 'rec-2',
    name: 'Картошка Фри',
    price: 189,
    oldPrice: null,
    discountedPrice: null,
    discountName: null,
    discountAmount: null,
    attributes: [],
  },
};

/** Вариант C — комбо со скидкой */
export const HINT_VARIANT_C: HintData = {
  id: 'hint-3',
  title: 'Акция дня',
  slogan: 'Комбо-обед: Напиток + Десерт = –30%!',
  description: 'Клиент заказал Пасту Карбонара. При добавлении Латте и Тирамису действует скидка 30%.',
  imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=🍰+☕',
  recommendation: {
    id: 'rec-3',
    name: 'Комбо Латте + Тирамису',
    price: 457,
    oldPrice: 457,
    discountedPrice: 320,
    discountName: 'Комбо -30%',
    discountAmount: 137,
    attributes: ['Содержит молоко', 'Глютен'],
  },
};

/** Все варианты подсказок для сравнения */
export const ALL_HINTS: HintData[] = [HINT_VARIANT_A, HINT_VARIANT_B, HINT_VARIANT_C];

/**
 * Подсказки, привязанные к конкретным блюдам меню.
 * Ключ — название блюда из MOCK_MENU_ITEMS.
 * У каждого блюда своя уникальная рекомендация.
 */
export const HINTS_BY_DISH: Record<string, HintData> = {
  'Чай Nesty': {
    id: 'hint-tea',
    title: 'Идеальная пара к чаю',
    slogan: 'К чаю отлично подойдёт свежий круассан со скидкой!',
    description: 'Вы добавили Чай Nesty. Рекомендуем: Круассан с шоколадом — тёплый, хрустящий.',
    imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=🥐',
    recommendation: {
      id: 'rec-tea',
      name: 'Круассан с шоколадом',
      price: 179,
      oldPrice: 179,
      discountedPrice: 139,
      discountName: 'Скидка к чаю',
      discountAmount: 40,
      attributes: ['85 г', '320 ккал', 'Глютен'],
    },
  },
  'Шоколадный батончик': {
    id: 'hint-choco',
    title: 'Подсказка для кассира',
    slogan: 'Предложите клиенту горячий напиток к десерту!',
    description: 'Вы добавили Шоколадный батончик. Рекомендуем: Капучино — классика!',
    imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=☕',
    recommendation: {
      id: 'rec-choco',
      name: 'Капучино',
      price: 250,
      oldPrice: null,
      discountedPrice: null,
      discountName: null,
      discountAmount: null,
      attributes: ['200 мл', 'Содержит молоко'],
    },
  },
  'Кока Кола': {
    id: 'hint-cola',
    title: 'Акция дня',
    slogan: 'Комбо: Кола + Наггетсы = выгода 15%!',
    description: 'Вы добавили Кока Колу. При добавлении Наггетсов действует скидка 15%.',
    imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=🍗',
    recommendation: {
      id: 'rec-cola',
      name: 'Наггетсы 9 шт.',
      price: 289,
      oldPrice: 289,
      discountedPrice: 245,
      discountName: 'Комбо -15%',
      discountAmount: 44,
      attributes: ['180 г', '410 ккал'],
    },
  },
};

/** Подсказка по умолчанию для блюд, не имеющих индивидуальной привязки */
export const HINT_DEFAULT = HINT_VARIANT_A;
