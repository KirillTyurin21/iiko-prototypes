export interface SidebarMenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

export interface SidebarSection {
  title: string;
  icon?: string;
  route?: string;
  items: SidebarMenuItem[];
}

export interface CustomerScreenDisplay {
  id: number;
  name: string;
  description: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  status: 'active' | 'inactive';
  theme: string;
  terminal: string;
}

export interface ScreenTheme {
  id: number;
  name: string;
  type: 'customer-screen' | 'arrivals';
  previewUrl?: string;
  isDefault: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface ScreenControl {
  id: number;
  name: string;
  type: string;
  description: string;
}

export interface ArrivalTerminal {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline';
  ip: string;
  lastSync: string;
}

/* ── Arrivals Theme Editor ── */

export interface ArrivalsThemeListItem {
  id: number;
  name: string;
  itemType: 'folder' | 'theme';
  resolution?: string;
  createdBy?: string;
}

export type ArrivalsElementType =
  | 'text'
  | 'image'
  | 'order-number'
  | 'table-number'
  | 'order-status'
  | 'cooking-start-time'
  | 'cooking-end-time'
  | 'system-cooking-time'
  | 'cooking-wait-time'
  | 'expired-wait-flag'
  | 'client-name'
  | 'client-phone'
  | 'courier-name'
  | 'expected-delivery-time'
  | 'expected-delivery-duration'
  | 'dispatch-time'
  | 'travel-time'
  | 'delivery-time'
  | 'delivery-status'
  | 'client-comment'
  | 'client-delivery-time'
  | 'cancel-reason'
  | 'cancel-comment'
  | 'cancel-time'
  | 'external-data'
  | 'external-order-number'
  | 'order-items'
  | 'order-items-zones'
  | 'order-items-progress'
  | 'order-items-checklist'
  | 'order-items-cards'
  | 'area'
  | 'price'
  | 'counter'
  | 'advertise'
  | 'menulist';

/* ── Advertise-панели (мини-борды: компании в рекламных блоках) ── */

/** Компания — справочник (мок). В реальности приходит с бэкенда (маппинги тем). */
export interface AdvertiseCompany {
  id: number;
  name: string;
}

/** Advertise-панель внутри рекламного блока темы мини-борда */
export interface AdvertisePanelConfig {
  id: number;
  name: string;
  companyId: number | null;
  campaignIds: number[];
}

export interface ArrivalsThemeElement {
  id: string;
  type: ArrivalsElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  // Text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  // Counter (REST data source)
  dataSourceUrl?: string;
  httpMethod?: string;
  headers?: string;
  timeout?: number;
  authType?: string;
  pollInterval?: number;
  // Image
  imageUrl?: string;
  // Price (product binding)
  productId?: string;
  productName?: string;
  sizeId?: string | null;
  sizeName?: string;
  modifierId?: string;
  modifierName?: string;
  bindingType?: 'product' | 'size' | 'modifier';
  showCurrency?: boolean;
  currencySymbol?: string;
  currencyPosition?: 'after' | 'before';
  previewPrice?: number;
  // Counter (Количество блюд в заказе)
  counterStatuses?: string[];
  counterDisplayMode?: 'text' | 'fraction' | 'circle';
  counterCircleColor?: string;
  counterCircleTrackColor?: string;
  counterCircleSize?: number;
  counterShowPercent?: boolean;
  // Order items (Состав заказа)
  orderDynamicHeight?: boolean;
  orderDisplayMode?: 'ready-only' | 'all';
  orderTriggerStatus?: string;
  orderHideOnComplete?: boolean;
  orderHidePendingStatusText?: boolean;
  orderHideDeliveredItems?: boolean;
  orderGroupReadyFirst?: boolean;
  orderShowName?: boolean;
  orderShowQty?: boolean;
  orderShowStatus?: boolean;
  orderNameColWidth?: number;
  orderQtyColWidth?: number;
  orderStatusColWidth?: number;
  orderShowHeader?: boolean;
  orderHeaderBg?: string;
  orderHeaderHeight?: number;
  orderShowNameLabel?: boolean;
  orderShowQtyLabel?: boolean;
  orderShowStatusLabel?: boolean;
  orderNameLabel?: string;
  orderQtyLabel?: string;
  orderStatusLabel?: string;
  orderRowHeight?: number;
  orderReadyColor?: string;
  orderNotReadyColor?: string;
  orderHeaderFontSize?: number;
  orderHeaderFontFamily?: string;
  orderHeaderFontColor?: string;
  orderNameFontSize?: number;
  orderNameFontFamily?: string;
  orderNameFontColor?: string;
  orderQtyFontSize?: number;
  orderQtyFontFamily?: string;
  orderQtyFontColor?: string;
  orderStatusFontSize?: number;
  orderStatusFontFamily?: string;
  orderStatusFontColor?: string;
  orderReadyStatusFontColor?: string;
  orderPendingStatusFontColor?: string;
  // B: Two Zones
  zonesReadyBg?: string;
  zonesPendingBg?: string;
  zonesReadyHeaderText?: string;
  zonesPendingHeaderText?: string;
  zonesShowAllReadyMsg?: boolean;
  zonesItemFontSize?: number;
  zonesHeaderFontSize?: number;
  // C: Progress
  progressCircleColor?: string;
  progressTrackColor?: string;
  progressShowPercent?: boolean;
  progressShowCount?: boolean;
  progressCircleSize?: number;
  progressItemFontSize?: number;
  // D: Checklist
  checklistStrikethrough?: boolean;
  checklistShowCounter?: boolean;
  checklistReadyBg?: string;
  checklistDoneText?: string;
  checklistItemFontSize?: number;
  // E: Cards
  cardsPerRow?: number;
  cardsReadyBorderColor?: string;
  cardsReadyBg?: string;
  cardsPendingBg?: string;
  cardsGap?: number;
  cardsItemFontSize?: number;
  // ── Area (область для контролов в теме) ──
  areaMode?: 'list' | 'dynamic' | 'single';
  areaControlId?: number;
  areaListDirection?: 'top' | 'bottom';
  areaMaxColumns?: number;
  areaStatusType?: 'kitchen' | 'delivery' | 'balancer';
  areaStatuses?: string[];
  areaOrderTypes?: ('ordinary' | 'courier' | 'pickup')[];
  areaOrderSources?: string[];
  areaSortOrder?: 'newest-first' | 'oldest-first';
  areaInterlineSpacing?: number;
  areaBgColor?: string;
  // Advertise (MenuBoard dynamic region)
  campaignIds?: number[];
  /** Advertise-панели рекламного блока (каждой панели — своя компания и кампании) */
  panels?: AdvertisePanelConfig[];
  // MenuList
  productIds?: string[];
  rowHeight?: number;
  alternateRows?: boolean;
  rowPadding?: number;
  rowBgColor?: string;
  rowBgTransparent?: boolean;
  highlightColor?: string;
  highlightTransparent?: boolean;
  showIcons?: boolean;
  showDescription?: boolean;
  showAllergens?: boolean;
  showNutrition?: boolean;
  nutritionColor?: string;
  allergensColor?: string;
  fontName?: { size: number; family: string; color: string; bold: boolean; italic: boolean };
  fontModifiers?: { size: number; family: string; color: string; bold: boolean; italic: boolean };
  fontPrice?: { size: number; family: string; color: string; bold: boolean; italic: boolean };
  fontDescription?: { size: number; family: string; color: string; bold: boolean; italic: boolean };
  // ── External Order Number (Внешний номер заказа) ──
  externalSource?: string;
  externalPrefix?: string;
  externalSuffix?: string;
  externalMaxLength?: number;
  externalShowFallback?: boolean;
  externalDemoNumber?: string;
}

/* ── Product Catalog (for Price element navigator) ── */

export interface ProductSize {
  id: string;
  name: string;
  price?: number;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  isGroup: boolean;
  hasChildren?: boolean;
  sizes?: ProductSize[];
  // Tree rework
  itemType?: 'dish' | 'goods' | 'modifier' | 'service';
  price?: number;
  children?: ProductCatalogItem[];
}

export interface ArrivalsTheme {
  id: number;
  name: string;
  resolution: string;
  screenMode: string;
  elements: ArrivalsThemeElement[];
  /** Режимы темы (панель слева). При отсутствии — миграция из elements/screenMode. */
  modes?: ArrivalsThemeMode[];
  /** Активный режим (id). */
  activeModeId?: string;
}

export interface ArrivalsThemeMode {
  /** 'order-screen', 'idle-screen' или авто-ID кастомного (A1, A2, …) */
  id: string;
  name: string;
  /** Кастомные режимы можно удалять; стандартные — нет. */
  isCustom?: boolean;
  /** Свой набор элементов у режима. */
  elements: ArrivalsThemeElement[];
  /** Переключатель «Активировать» (у стандартных, кроме главного экрана). */
  activated?: boolean;
  /** Условия показа кастомного режима (строки «Операция» AND/OR — как на стенде). */
  conditions?: ModeCondition[];
}

/** Строка условия показа режима (как на стенде: «Операция» — AND/OR). */
export interface ModeCondition {
  operation: 'AND' | 'OR';
}

/* ── Arrivals Order Mock (для эмуляции в теме) ── */

export interface ArrivalsOrderMockItem {
  name: string;
  qty: number;
  status: string;
}

export interface ArrivalsOrderMock {
  id: number;
  orderNumber: string;
  clientName: string;
  tableNumber?: string;
  status: string;
  orderType: 'ordinary' | 'courier' | 'pickup';
  source: string;
  cookingStartTime?: string;
  expectedDeliveryTime?: string;
  items: ArrivalsOrderMockItem[];
  courierName?: string;
  clientPhone?: string;
}

/* ── Element Categories (grouping for add-element palette) ── */

export interface ElementCategoryItem {
  type: ArrivalsElementType;
  label: string;
  icon: string;
  /** Платный элемент — доступен только при платной лицензии */
  isPremium?: boolean;
}

export interface ElementCategory {
  id: string;
  label: string;
  icon: string;
  elements: ElementCategoryItem[];
  collapsed: boolean;
}

/* ── Arrivals Controls Editor ── */

export type ArrivalsControlStatusType = 'kitchen' | 'delivery' | 'balancer';

export interface ArrivalsControlListItem {
  id: number;
  name: string;
  itemType: 'folder' | 'control';
  resolution?: string;
  createdBy?: string;
}

export interface ArrivalsControl {
  id: number;
  name: string;
  statusType: ArrivalsControlStatusType;
  elements: ArrivalsThemeElement[];
}

/* ── Источники заказов (Arrivals): настройки + справочник ── */

/** Справочник источников заказов (ведётся в Web: Название* + Код*) */
export interface OrderSourceRef {
  id: string;          // 'kiosk' | 'delivery' | 'front' | ...
  name: string;        // «Киоск (Kiosk)»…
  code?: string;       // код из справочника Web
}

/** Настройка конкретного источника (перекрывает общую; единая на сеть) */
export interface OrderSourceSetting {
  id: string;          // локальный ключ записи
  sourceId: string;    // ссылка на OrderSourceRef
  prefix: string;      // «Префикс номера заказа»
  length: number;      // «Длина номера заказа» (общая, С УЧЁТОМ префикса)
  fillSymbols: string; // «Символы заполнения» (между префиксом и номером)
}

/** Настройка отображения заказов по источнику (пачка). Глобальная — неудаляемая запись (isGlobal). */
export interface CommonOrderSourceSetting {
  id: string;
  name: string;
  isGlobal?: boolean;   // true — системная сетевая настройка (неудаляемая)
  prefix: string;
  length: number;
  fillSymbols: string;
}

/** Ресторан: одна настройка отображения (null — сетевая/глобальная) */
export interface RestaurantOrderSourceConfig {
  restaurantId: number;
  commonSettingId: string | null;
}

/** Сеть: справочник настроек отображения (первая — глобальная) + единые настройки источников + назначения */
export interface NetworkOrderSourceConfig {
  commonSettings: CommonOrderSourceSetting[];
  sourceSettings: OrderSourceSetting[];
  restaurants: RestaurantOrderSourceConfig[];
}

/**
 * Настройка отображения уровня дисплея — справочник «Основные настройки» стенда
 * («Настройки экрана Arrivals» → «Добавить настройки»). Назначается на дисплеи.
 */
export interface DisplaySetting {
  id: string;
  name: string;                       // «Название настройки»
  serviceTypeFilter: string;          // «Фильтр по режиму обслуживания»
  orderSourceFilter: string;          // «Фильтр по источнику заказов»
  sorting: string;                    // «Сортировка заказов»
  popupIntervalSec: number;           // «Интервал всплывающих окон», сек
  popupDurationSec: number;           // «Время отображения всплывающего окна», сек
}

/* ── Sounds (Digital Voice) ── */

export interface SoundEventHandler {
  id: number;
  name: string;
  collectionId: number | null;
  voiceType: 'file' | 'generation';
  events: string[];
  fileName?: string;
  // Generation-specific fields
  voiceName?: string;          // 'Ксения' | 'Ирина' | 'Василий'
  phraseText?: string;         // e.g. "Заказ номер {номер} готов"
  generationStatus?: 'pending' | 'generating' | 'done';
  fileSize?: number;            // size in KB
}

export interface SoundCollection {
  id: number;
  name: string;
  expanded?: boolean;
}

export interface SoundTerminalGroup {
  id: number;
  name: string;
  terminalCount: number;
  expanded?: boolean;
  terminals: SoundTerminal[];
}

export interface SoundTerminal {
  id: number;
  name: string;
  lastActivity: string;
  handlerIds: number[];
  audioDevice: string;
  /** moduleId выбранного Arrivals (или undefined если выбрано физическое устройство) */
  arrivalsDeviceId?: number;
}

/* -- Arrivals как аудиоустройство (DigitalVoice + Arrivals) -- */

export interface ArrivalsDevice {
  moduleId: number;
  login: string;
  isOnline: boolean;
  displays: ArrivalsDisplay[];
  /** Временные состояния UI */
  displaysLoading?: boolean;
  displaysError?: boolean;
}

export interface ArrivalsDisplay {
  id: string;
  name: string;
  isOnline: boolean;
  handlerIds: number[];
  audioOutput: 'tv' | 'centralized';
}

/* ── Sounds v2: переделка «Настройка терминалов» (дерево + панель) ── */

/** Устройство вывода звука терминала: физическое аудиоустройство или дисплей Arrivals */
export interface SoundOutputDevice {
  id: string;
  kind: 'physical' | 'arrivals-display';
  /** для kind = physical — название аудиоустройства */
  audioDevice?: string;
  /** для kind = arrivals-display — конкретный дисплей RMS */
  displayId?: string;
  displayName?: string;
  displayOnline?: boolean;
  themeName?: string;
  handlerIds: number[];
}

/** Дисплей Arrivals, доступный для выбора (RMS ресторана) */
export interface DvArrivalsDisplay {
  id: string;
  name: string;
  isOnline: boolean;
  themeName: string;
}

/** Терминал в новой модели: несколько устройств вывода */
export interface SoundTerminalV2 {
  id: number;
  name: string;
  lastActivity: string;
  devices: SoundOutputDevice[];
}

/** Группа (ресторан) терминалов в новой модели */
export interface SoundTerminalGroupV2 {
  id: number;
  name: string;
  terminals: SoundTerminalV2[];
}

/* ── Sounds v2: «Обработчики событий» (дерево + панель) ── */

/** Коллекция обработчиков */
export interface DvCollection {
  id: number;
  name: string;
  isSystem?: boolean;
}

/** Обработчик события в новой модели (несколько коллекций, голоса Светлана/Дмитрий) */
export interface DvEventHandler {
  id: number;
  name: string;
  collectionIds: number[];      // пусто → «Без коллекции»
  events: string[];
  voiceType: 'file' | 'generation';
  fileName?: string;
  fileSizeKb?: number;
  voiceName?: string;
  phraseText?: string;
  generationStatus?: 'pending' | 'generating' | 'done';
  /** для совместимости с GenerationQueuePanel */
  fileSize?: number;
}

/** Аудиофайл из Галереи */
export interface DvAudioFile {
  id: number;
  name: string;
  sizeKb: number;
  date: string;
}

/** Пункт generic-пикера */
export interface CheckListPickerItem {
  id: string | number;
  label: string;
}

/* ── Generation Queue ── */

export interface GenerationQueueItem {
  id: number;
  handlerId: number;
  handlerName: string;
  phraseText: string;
  voiceName: string;
  status: 'waiting' | 'generating' | 'done';
  createdAt: number;      // timestamp
  progress?: number;      // 0-100
}

/* ── Sound Catalog ── */

export interface SoundFile {
  id: number;
  name: string;
  duration: string;       // e.g. "0:02"
  createdAt: string;
}

export interface SoundFolder {
  id: number;
  voiceName: string;      // 'Ксения' | 'Ирина' | 'Василий'
  category: 'numbers' | 'phrases';
  label: string;          // display label
  files: SoundFile[];
  totalCount: number;     // for numbers: 10000
  generatedCount: number; // how many generated so far
}
