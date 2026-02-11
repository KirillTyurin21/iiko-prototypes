/** ========================
 *  Customer Screen — Типы
 *  ======================== */

// ─── Вспомогательные типы ────────────────────

export interface ProductNode {
  id: number;
  name: string;
  type: 'category' | 'product';
  children?: ProductNode[];
}

export interface TriggerItem {
  id: number;
  name: string;
  type: 'category' | 'product';
}

export interface RecommendationItem {
  id: number;
  name: string;
  type: 'product';
}

export interface Campaign {
  id: number;
  name: string;
}

export interface Discount {
  id: number;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
}

// ─── Контролы ────────────────────────────────

/** Настройки макета элемента контрола */
export interface ControlElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: [number, number, number, number];
  bgColor: string;       // Цвет фона
  bgOpacity: number;     // Прозрачность фона 0-100
  zIndex: number;        // Слой (Z-index)
  rotation: number;      // Угол поворота (°)
}

/** Настройки границы элемента контрола */
export interface ControlElementBorder {
  width: number;         // Ширина границы (px)
  color: string;         // Цвет границы
  type: 'none' | 'solid' | 'dashed' | 'dotted';  // Тип границы
  radius: number;        // Скругление углов (px)
}

/** Настройки шрифта элемента контрола */
export interface ControlElementFont {
  color: string;         // Цвет шрифта
  size: number;          // Размер шрифта (px)
  family: string;        // Семейство шрифта
  align: 'left' | 'center' | 'right'; // Выравнивание текста
  style: 'normal' | 'italic';   // Стиль шрифта
  weight: 'normal' | 'bold';    // Начертание шрифта
}

export interface ControlElement {
  id: number;
  type: string;
  name: string;
  isRequired?: boolean;  // Обязательный элемент (нельзя удалить) — напр. hintBanner
  settings: {
    layout: ControlElementLayout;
    border: ControlElementBorder;
    font?: ControlElementFont;
  };
}

export interface CSControl {
  id: number;
  name: string;
  type: 'animation' | 'hint';
  elementsCount: number;
  elements: ControlElement[];
}

// ─── Подсказки ───────────────────────────────

export interface Hint {
  id: number;
  name: string;
  status: 'active' | 'scheduled' | 'expired';
  period: { startDate: string; endDate: string };
  time: { startTime: string; endTime: string };
  slogan: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discount: string | null;
  triggers: TriggerItem[];
  recommendation: RecommendationItem | null;
  image: string | null;
  imageSource: 'menu' | 'gallery' | 'uploaded' | null;
  controlId: number | null;
}

// ─── Темы ────────────────────────────────────

export interface HintAreaSettings {
  hideByTimer: boolean;
  displayTime: number;
  animationDuration: number;
  animationType: 'fadeIn' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'none';
  areaMode: 'list';
  fillDirection: 'horizontal' | 'vertical';
  maxColumns: number;
  rowGap: number;
  columnGap: number;
  hintLifetime: number;
  maxHintsVisible: number;
  triggerRemovalBehavior: 'remove' | 'keepUntilOrderEnd';
  layout: { x: number; y: number; width: number; height: number; padding: [number, number, number, number] };
  border: {
    width: number; color: string; radius: number;
    shadow: { enabled: boolean; x: number; y: number; blur: number; color: string };
  };
}

export type ThemeElement =
  | { id: number; type: 'image'; name: string; layout: { x: number; y: number; width: number; height: number } }
  | { id: number; type: 'text'; name: string; content: string; layout: { x: number; y: number; width: number; height: number } }
  | { id: number; type: 'animation'; name: string; controlId: number; controlName: string; hideByTimer: boolean; displayTime: number; animationDuration: number; animationType: string; layout: { x: number; y: number; width: number; height: number } }
  | { id: number; type: 'hints'; name: string; controlId?: number | null; settings: HintAreaSettings; elements: { id: number; type: string; name: string }[] }
  | { id: number; type: 'advertise'; name: string; layout: { x: number; y: number; width: number; height: number } };

export interface CSTheme {
  id: number;
  name: string;
  description: string;
  updatedAt: string;
  elementsCount: number;
  elements: ThemeElement[];
}

// ─── Терминалы ───────────────────────────────

export interface CSTerminal {
  id: number;
  name: string;
  themeId: number;
  themeName: string;
  campaigns: number[];
  hints: number[];
}

export interface HintAssignment {
  id: number;
  name: string;
}

// ─── Элементы для dropdown ───────────────────

export interface ElementTypeOption {
  type: string;
  name: string;
  description: string;
  isTextual: boolean;
}

/** Общие элементы (для анимаций и подсказок) */
export const SHARED_ELEMENTS: ElementTypeOption[] = [
  { type: 'area', name: 'Область', description: 'Контейнер для вложенных элементов', isTextual: false },
  { type: 'text', name: 'Текст', description: 'Произвольный статичный текст', isTextual: true },
  { type: 'image', name: 'Изображение', description: 'Статичное изображение', isTextual: false },
  { type: 'product-image', name: 'Изображение товара', description: 'Фото блюда', isTextual: false },
  { type: 'product-name', name: 'Название продукта', description: 'Название блюда', isTextual: true },
  { type: 'full-product-name', name: 'Полное название продукта', description: 'Полное наименование', isTextual: true },
  { type: 'foreign-product-name', name: 'Иностранное название', description: 'Название на другом языке', isTextual: true },
  { type: 'price', name: 'Цена', description: 'Текущая цена блюда', isTextual: true },
  { type: 'product-description', name: 'Описание продукта', description: 'Описание блюда', isTextual: true },
  { type: 'foreign-product-description', name: 'Описание (иностр.)', description: 'Описание на другом языке', isTextual: true },
];

/** Уникальные элементы анимации */
export const ANIMATION_ONLY_ELEMENTS: ElementTypeOption[] = [
  { type: 'last-added-dish', name: 'Последнее блюдо', description: 'Последнее добавленное в заказ', isTextual: true },
  { type: 'quantity', name: 'Количество', description: 'Количество позиции в заказе', isTextual: true },
  { type: 'measurement-unit', name: 'Единица измерения', description: 'шт, кг, л', isTextual: true },
  { type: 'nutritional-value', name: 'Пищевая ценность', description: 'БЖУ, калории', isTextual: true },
  { type: 'product-scale', name: 'Масштаб продукции', description: 'Размер блюда', isTextual: true },
];

/** Уникальные элементы подсказок */
export const HINT_ONLY_ELEMENTS: ElementTypeOption[] = [
  { type: 'hint-slogan', name: 'Слоган подсказки', description: 'Промо-текст из карточки', isTextual: true },
  { type: 'hint-banner', name: 'Баннер подсказки', description: 'Промо-картинка подсказки', isTextual: false },
  { type: 'discount-name', name: 'Название скидки', description: 'Скидка из справочника', isTextual: true },
  { type: 'discount-size', name: 'Размер скидки', description: '% или сумма', isTextual: true },
  { type: 'discounted-price', name: 'Цена со скидкой', description: 'Цена - Скидка', isTextual: true },
  { type: 'old-price', name: 'Старая цена', description: 'Цена до скидки (зачёркнутая)', isTextual: true },
];

/** Все элементы для контрола анимации */
export function getAnimationElements(): ElementTypeOption[] {
  return [...SHARED_ELEMENTS, ...ANIMATION_ONLY_ELEMENTS];
}

/** Все элементы для контрола подсказки */
export function getHintElements(): ElementTypeOption[] {
  return [...SHARED_ELEMENTS, ...HINT_ONLY_ELEMENTS];
}

/** Дефолтные настройки Layout */
export function defaultLayout(overrides?: Partial<ControlElementLayout>): ControlElementLayout {
  return {
    x: 0, y: 0, width: 200, height: 40, padding: [0, 0, 0, 0],
    bgColor: '#ffffff', bgOpacity: 100, zIndex: 0, rotation: 0,
    ...overrides,
  };
}

/** Дефолтные настройки Border */
export function defaultBorder(overrides?: Partial<ControlElementBorder>): ControlElementBorder {
  return {
    width: 0, color: '#ffffff', type: 'none', radius: 0,
    ...overrides,
  };
}

/** Дефолтные настройки Font (для текстовых элементов) */
export function defaultFont(overrides?: Partial<ControlElementFont>): ControlElementFont {
  return {
    color: '#000000', size: 14, family: 'Roboto', align: 'left',
    style: 'normal', weight: 'normal',
    ...overrides,
  };
}

/** Элементы темы (верхний уровень) */
export interface ThemeElementTypeOption {
  type: string;
  name: string;
  icon: string;
  singular: boolean; // не более 1 в теме
}

export const THEME_ELEMENT_TYPES: ThemeElementTypeOption[] = [
  { type: 'image', name: 'Изображение', icon: 'image', singular: false },
  { type: 'text', name: 'Текст', icon: 'type', singular: false },
  { type: 'advertise', name: 'Рекламный блок', icon: 'megaphone', singular: false },
  { type: 'animation', name: 'Анимации', icon: 'film', singular: true },
  { type: 'hints', name: 'Подсказки', icon: 'lightbulb', singular: true },
];

/** Дефолтные настройки области подсказок */
export const DEFAULT_HINT_AREA: HintAreaSettings = {
  hideByTimer: false,
  displayTime: 10,
  animationDuration: 0.5,
  animationType: 'fadeIn',
  areaMode: 'list',
  fillDirection: 'horizontal',
  maxColumns: 3,
  rowGap: 8,
  columnGap: 8,
  hintLifetime: 30,
  maxHintsVisible: 3,
  triggerRemovalBehavior: 'remove',
  layout: { x: 50, y: 400, width: 700, height: 200, padding: [8, 8, 8, 8] },
  border: {
    width: 0, color: '#CCCCCC', radius: 8,
    shadow: { enabled: false, x: 0, y: 2, blur: 4, color: 'rgba(0,0,0,0.1)' }
  },
};
