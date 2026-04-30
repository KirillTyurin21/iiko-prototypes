/**
 * Типы для прототипа Neptune Guest Management
 */

export type ModalType =
  | 'guest-profile'
  | 'pin-entry'
  | 'guest-list'
  | 'payment-cashless'
  | 'payment-loyalty'
  | 'identify-method'
  | 'loading'
  | 'success'
  | 'error'
  | null;

/** Тип оплаты, инициированный из панели кнопок */
export type PaymentType = 'cashless' | 'loyalty';

/** Состояние панели кнопок */
export type PanelState = 'no-guest' | 'identified' | 'unavailable';

/** Способ идентификации гостя */
export type IdentifyMethod = 'card' | 'id';

/** Баллы лояльности (соответствие MGS: 0=Complimentary, 1=Gaming, 3=Travel, 4=Restaurant) */
export interface MockPoint {
  point_id: number;
  point_name: string;
  point_sum: number;
}

/** Полный профиль гостя */
export interface MockGuest {
  customer_id: string;
  forename: string;
  middlename: string;
  surname: string;
  status: string;
  color: string;
  image: string;
  birthday: string;
  balance_cash: number;
  points: MockPoint[];
}

/** Элемент списка гостей */
export interface MockGuestListItem {
  customer_id: string;
  forename: string;
  middlename: string;
  surname: string;
  status: string;
  color: string;
  image?: string;
}

/** Позиция заказа */
export interface MockOrderItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

/** Контекст заказа */
export interface MockOrder {
  order_id: string;
  order_number: number;
  order_total: number;
  table: string;
  items: MockOrderItem[];
}

/** Запись External Data заказа */
export interface ExternalDataEntry {
  key: string;
  value: string;
  isPublic: boolean;
}

/** Сервис из каталога point_services */
export interface MockPointService {
  id: string;
  name: string;
  description: string;
  is_gaming_service: string;
  points: string;
}

/** Тип ошибки по спецификации MGS */
export interface ErrorScenario {
  id: string;
  httpCode: number | null;
  title: string;
  message: string;
  action: string;
  retryable: boolean;
}

/** Секция каталога состояний */
export interface CatalogSection {
  title: string;
  icon: string;
  description: string;
  cells: CatalogCell[];
}

/** Ячейка каталога */
export interface CatalogCell {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  /** Модальное окно для открытия на POS */
  modalType?: ModalType;
  /** Тип ошибки для демонстрации */
  errorScenarioId?: string;
  /** Тип оплаты */
  paymentType?: PaymentType;
}

/** Карточка каталога диалогов (legacy) */
export interface CatalogCard {
  id: ModalType;
  label: string;
  icon: string;
  description: string;
}

/** Запись API-консоли */
export interface ApiLogEntry {
  timestamp: string;
  method: 'GET' | 'POST';
  endpoint: string;
  requestBody: Record<string, any> | null;
  responseBody: Record<string, any> | null;
  httpCode: number | null;
  isError: boolean;
  label: string;
}

/** Контекст работы (ресторан / фаст-фуд) */
export type ServiceContext = 'restaurant' | 'fastfood';

/** Демо-роли для визуализации ролевой модели */
export interface DemoRoles {
  card_role: boolean;
  use_cashless_role: boolean;
  use_loyalty_role: boolean;
  show_all_guests_role: boolean;
  show_id_role: boolean;
  show_card_role: boolean;
  show_fio_role: boolean;
  show_birthday_role: boolean;
  show_state_role: boolean;
  show_photo_role: boolean;
  show_cashless_role: boolean;
  show_loyalty_role: boolean;
}
