/**
 * Типы для прототипа MGS Casino Guest Management
 */

export type ModalType =
  | 'guest-profile'
  | 'pin-entry'
  | 'guest-list'
  | 'payment-cashless'
  | 'payment-loyalty'
  | 'loading'
  | 'success'
  | 'error'
  | null;

/** Тип оплаты, инициированный из панели кнопок */
export type PaymentType = 'cashless' | 'loyalty' | 'comp';

/** Состояние панели кнопок */
export type PanelState = 'no-guest' | 'identified' | 'unavailable';

/** Баллы лояльности */
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
  comp_balance: number;
}

/** Элемент списка гостей */
export interface MockGuestListItem {
  customer_id: string;
  forename: string;
  middlename: string;
  surname: string;
  status: string;
  color: string;
}

/** Контекст заказа */
export interface MockOrder {
  order_total: number;
  table: string;
  items_count: number;
}

/** Карточка каталога диалогов */
export interface CatalogCard {
  id: ModalType;
  label: string;
  icon: string;
  description: string;
}
