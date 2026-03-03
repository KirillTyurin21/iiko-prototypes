import { MockGuest, MockGuestListItem, MockOrder, CatalogCard } from '../types';

/** Основной гость (профиль после идентификации) */
export const MOCK_GUEST: MockGuest = {
  customer_id: 'CID-00847',
  forename: 'Иван',
  middlename: 'Иванович',
  surname: 'Иванов',
  status: 'GOLD',
  color: '#FFD700',
  image: '',
  birthday: '1985-03-15',
  balance_cash: 15250,
  points: [
    { point_id: 1, point_name: 'Gaming Points', point_sum: 2500 },
    { point_id: 2, point_name: 'Dining Points', point_sum: 800 },
    { point_id: 3, point_name: 'Event Points', point_sum: 500 },
  ],
  comp_balance: 1200,
};

/** Список гостей в казино */
export const MOCK_GUESTS_IN_CASINO: MockGuestListItem[] = [
  { customer_id: 'CID-00847', forename: 'Иван',    middlename: 'Иванович',   surname: 'Иванов',   status: 'GOLD',     color: '#FFD700' },
  { customer_id: 'CID-01234', forename: 'Елена',   middlename: 'Сергеевна',  surname: 'Петрова',  status: 'PLATINUM', color: '#E5E4E2' },
  { customer_id: 'CID-00512', forename: 'Алексей', middlename: 'Николаевич', surname: 'Сидоров',  status: 'SILVER',   color: '#C0C0C0' },
  { customer_id: 'CID-02001', forename: 'Мария',   middlename: 'Дмитриевна', surname: 'Козлова',  status: 'GOLD',     color: '#FFD700' },
  { customer_id: 'CID-00089', forename: 'Дмитрий', middlename: 'Андреевич',  surname: 'Волков',   status: 'STANDARD', color: '#4CAF50' },
];

/** Контекст заказа */
export const MOCK_ORDER: MockOrder = {
  order_total: 4200,
  table: 'Стол 7',
  items_count: 3,
};

/** Тексты ошибок для демонстрации */
export const ERROR_MESSAGES: string[] = [
  'Не удалось выполнить операцию. Проверьте подключение к MGS и повторите попытку.',
  'Недостаточно средств на счёте гостя.',
  'Счёт гостя заблокирован. Обратитесь к менеджеру казино.',
  'Сервер MGS недоступен. Повторите позже.',
];

/** Карточки каталога диалогов */
export const CATALOG_CARDS: CatalogCard[] = [
  { id: 'guest-profile',     label: 'Профиль гостя',   icon: 'user',           description: 'Карточка гостя с балансами после идентификации' },
  { id: 'pin-entry',         label: 'Ввод PIN-кода',   icon: 'key-round',      description: 'Авторизация гостя перед платёжной операцией' },
  { id: 'guest-list',        label: 'Список гостей',   icon: 'users',          description: 'Список всех гостей, находящихся в казино' },
  { id: 'payment-cashless',  label: 'Оплата Cashless', icon: 'wallet',         description: 'Списание кэш-поинтов со счёта гостя' },
  { id: 'payment-loyalty',   label: 'Оплата Loyalty',  icon: 'star',           description: 'Списание баллов лояльности' },
  { id: 'success',           label: 'Успех',           icon: 'check-circle-2', description: 'Диалог успешного завершения операции' },
  { id: 'error',             label: 'Ошибка',          icon: 'alert-circle',   description: 'Диалог ошибки' },
  { id: 'loading',           label: 'Загрузка',        icon: 'loader-2',       description: 'Индикатор загрузки' },
];
