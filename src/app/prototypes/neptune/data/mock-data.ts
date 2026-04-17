import {
  MockGuest, MockGuestListItem, MockOrder, MockPointService,
  ErrorScenario, CatalogSection, CatalogCard,
} from '../types';

/** Основной гость (профиль после идентификации) */
export const MOCK_GUEST: MockGuest = {
  customer_id: 'CID-00847',
  forename: 'Иван',
  middlename: 'Иванович',
  surname: 'Иванов',
  status: 'GOLD',
  color: '#FFD700',
  image: 'https://i.pravatar.cc/128?img=14',
  birthday: '1985-03-15',
  balance_cash: 15250,
  points: [
    { point_id: 0, point_name: 'Complimentary', point_sum: 1200 },
    { point_id: 1, point_name: 'Игра', point_sum: 2500 },
    { point_id: 3, point_name: 'Балл Путешественника', point_sum: 800 },
    { point_id: 4, point_name: 'Ресторан', point_sum: 3100 },
  ],
};

/** Список гостей в казино — по одному гостю на каждый реальный статус */
export const MOCK_GUESTS: MockGuestListItem[] = [
  { customer_id: 'CID-00089', forename: 'Дмитрий', middlename: 'Андреевич',  surname: 'Волков',     status: 'STANDARD', color: '#4CAF50' },
  { customer_id: 'CID-00310', forename: 'Ольга',   middlename: 'Викторовна', surname: 'Кузнецова',  status: 'BRONZE',   color: '#CD7F32' },
  { customer_id: 'CID-00512', forename: 'Алексей', middlename: 'Николаевич', surname: 'Сидоров',    status: 'SILVER',   color: '#C0C0C0' },
  { customer_id: 'CID-00847', forename: 'Иван',    middlename: 'Иванович',   surname: 'Иванов',     status: 'GOLD',     color: '#FFD700' },
  { customer_id: 'CID-01234', forename: 'Елена',   middlename: 'Сергеевна',  surname: 'Петрова',    status: 'PLATINUM', color: '#E5E4E2' },
  { customer_id: 'CID-01587', forename: 'Андрей',  middlename: 'Павлович',   surname: 'Морозов',    status: 'DIAMOND',  color: '#4FC3F7' },
  { customer_id: 'CID-02001', forename: 'Мария',   middlename: 'Дмитриевна', surname: 'Козлова',    status: 'VIP',      color: '#9C27B0' },
  { customer_id: 'CID-02200', forename: 'Сергей',  middlename: 'Александрович', surname: 'Белов',   status: 'BLACK',    color: '#212121' },
];

/** Контекст заказа */
export const MOCK_ORDER: MockOrder = {
  order_id: 'ORD-2026-04-17-001',
  order_number: 1847,
  order_total: 4200,
  table: 'Стол 7',
  items: [
    { name: 'Стейк Рибай',  price: 2800, quantity: 1, category: 'Горячие блюда' },
    { name: 'Салат Цезарь',  price: 650,  quantity: 1, category: 'Салаты' },
    { name: 'Эспрессо',     price: 350,  quantity: 2, category: 'Напитки' },
  ],
};

/** Каталог сервисов (GET /v1/payment/point_services) */
export const MOCK_POINT_SERVICES: MockPointService[] = [
  { id: '1', name: 'Игра',     description: 'Обмен баллов на игру',   is_gaming_service: '1', points: 'Игра' },
  { id: '2', name: 'Такси',    description: 'Трансфер',               is_gaming_service: '0', points: 'Балл Путешественника' },
  { id: '3', name: 'Трансфер', description: 'Трансфер до отеля',      is_gaming_service: '0', points: 'Балл Путешественника' },
  { id: '4', name: 'Мерч',     description: 'Сувенирная продукция',   is_gaming_service: '0', points: 'Ресторан' },
  { id: '5', name: 'Билеты',   description: 'Входные билеты',         is_gaming_service: '0', points: 'Ресторан' },
  { id: '6', name: 'Другое',   description: 'Прочие услуги',          is_gaming_service: '0', points: 'Ресторан' },
];

/** Параметры конфигурации (значения по умолчанию из спецификации) */
export const PLUGIN_CONFIG = {
  RestaurantPointId: 4,
  ComplimentaryPointId: 0,
  point_service_id: 6,   // «Другое»
  service: 'restaurant',
};

/** Демо-роли (начальное состояние — все включены) */
export const DEMO_ROLES = {
  card_role: true,
  use_cashless_role: true,
  use_loyalty_role: true,
  use_comp_role: true,
  show_all_guests_role: true,
  show_id_role: true,
  show_card_role: true,
  show_fio_role: true,
  show_birthday_role: true,
  show_state_role: true,
  show_photo_role: true,
  show_cashless_role: true,
  show_loyalty_role: true,
  show_comp_role: true,
};

/** Шаблон пречека */
export const PRECHEQUE_TEMPLATE = 'Списание MGS: {result_sum} руб.';

/** Сценарии ошибок из спецификации MGS */
export const ERROR_SCENARIOS: ErrorScenario[] = [
  { id: 'network',      httpCode: null, title: 'Сетевая ошибка',        message: 'Нет связи с сервером. Проверьте подключение.',                   action: 'Retry (retryCount раз)',   retryable: true },
  { id: 'auth-invalid', httpCode: 406,  title: 'Невалидный API-ключ',   message: 'Ошибка аутентификации. Проверьте API-ключ в конфигурации.',      action: 'Кнопки заблокированы',     retryable: false },
  { id: 'session-expired', httpCode: 401, title: 'Истечение сессии',    message: 'Сессия истекла. Повторная аутентификация...',                     action: 'Повторная auth + retry',   retryable: true },
  { id: 'not-found',    httpCode: 404,  title: 'Гость не найден',       message: 'Гость не найден в системе. Проверьте данные.',                   action: 'Диалог повтора',           retryable: false },
  { id: 'pin-invalid',  httpCode: 406,  title: 'Неверный PIN-код',      message: 'Введён неверный PIN-код. Попробуйте ещё раз.',                  action: 'Повтор ввода PIN',         retryable: false },
  { id: 'token-expired', httpCode: null, title: 'Токен истёк',          message: 'Время авторизации истекло. Необходим повторный ввод PIN-кода.',  action: 'Повторный PIN',            retryable: false },
  { id: 'insufficient-cash', httpCode: 423, title: 'Недостаточно средств', message: 'Недостаточно кэш-поинтов на счёте гостя.',                  action: 'Другой способ оплаты',     retryable: false },
  { id: 'insufficient-points', httpCode: 423, title: 'Недостаточно баллов', message: 'Недостаточно баллов лояльности на счёте.',                  action: 'Другой способ оплаты',     retryable: false },
  { id: 'account-blocked', httpCode: 423, title: 'Счёт заблокирован',   message: 'Счёт гостя заблокирован. Обратитесь к менеджеру казино.',        action: 'Обратиться к менеджеру',    retryable: false },
  { id: 'mgs-unavailable', httpCode: null, title: 'Сервер недоступен',  message: 'Сервер недоступен. Кассир может продолжить работу без плагина.', action: 'Периодический retry',      retryable: true },
];

/** Тексты ошибок (legacy) */
export const ERROR_MESSAGES: string[] = ERROR_SCENARIOS.map(e => e.message);

/** Секции каталога состояний (по аналогии с falcon) */
export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    title: 'Идентификация',
    icon: 'scan-line',
    description: 'поиск и профиль гостя',
    cells: [
      { id: 'identify-card',  label: 'Поиск по карте',  icon: 'credit-card', iconColor: '#1565c0', description: 'POST /v1/search/card — сканирование карты гостя', modalType: 'identify-method' },
      { id: 'identify-id',    label: 'Поиск по ID',     icon: 'hash',        iconColor: '#1565c0', description: 'POST /v1/search/id — ввод customer_id',          modalType: 'identify-method' },
      { id: 'profile-data',   label: 'Профиль гостя',   icon: 'user',        iconColor: '#2e7d32', description: 'Карточка гостя с балансами (состояние: данные)',   modalType: 'guest-profile', badge: '4 состояния', badgeColor: '#2e7d32' },
      { id: 'guest-list',     label: 'Список гостей',   icon: 'users',       iconColor: '#6a1b9a', description: 'GET /v1/search/guests_in_casino',                 modalType: 'guest-list', badge: '8 статусов', badgeColor: '#6a1b9a' },
    ],
  },
  {
    title: 'Платежи',
    icon: 'wallet',
    description: 'оплата заказа через MGS',
    cells: [
      { id: 'pin-entry',     label: 'Ввод PIN-кода',     icon: 'key-round',  iconColor: '#ff6d00', description: 'PIN → POST /v1/payment/get_token → токен (TTL 5 мин)',  modalType: 'pin-entry', badge: '4 состояния', badgeColor: '#ff6d00' },
      { id: 'pay-cashless',  label: 'Оплата Cashless',   icon: 'wallet',     iconColor: '#2e7d32', description: 'POST /v1/payment/cash — списание кэш-поинтов',         modalType: 'payment-cashless', paymentType: 'cashless' },
      { id: 'pay-loyalty',   label: 'Оплата Loyalty',    icon: 'star',       iconColor: '#1565c0', description: 'POST /v1/payment/promo — списание баллов (point_id=4)', modalType: 'payment-loyalty', paymentType: 'loyalty' },
      { id: 'pay-comp',      label: 'Оплата Comp',       icon: 'gift',       iconColor: '#6a1b9a', description: 'POST /v1/payment/promo — комплиментарные (point_id=0)', modalType: 'payment-loyalty', paymentType: 'comp' },
    ],
  },
  {
    title: 'Служебные диалоги',
    icon: 'monitor',
    description: 'loading, success',
    cells: [
      { id: 'loading',  label: 'Загрузка',         icon: 'loader-2',      iconColor: '#78909c', description: 'Индикатор загрузки (автозакрытие 3 сек)',            modalType: 'loading' },
      { id: 'success',  label: 'Успех',            icon: 'check-circle-2', iconColor: '#b8c959', description: 'Диалог успешного завершения операции',               modalType: 'success' },
    ],
  },
  {
    title: 'Обработка ошибок',
    icon: 'alert-triangle',
    description: 'сценарии ошибок MGS по спецификации',
    cells: [
      { id: 'err-network',    label: 'Сетевая ошибка',     icon: 'wifi-off',      iconColor: '#d32f2f', description: 'Таймаут / нет связи (retry)',         modalType: 'error', errorScenarioId: 'network' },
      { id: 'err-auth',       label: 'Ошибка auth (406)',  icon: 'shield-off',    iconColor: '#d32f2f', description: 'Невалидный API-ключ',                 modalType: 'error', errorScenarioId: 'auth-invalid' },
      { id: 'err-session',    label: 'Сессия истекла',     icon: 'clock',         iconColor: '#ff6d00', description: '401/403 — повторная аутентификация',   modalType: 'error', errorScenarioId: 'session-expired' },
      { id: 'err-not-found',  label: 'Гость не найден',   icon: 'user-x',        iconColor: '#ff6d00', description: '404 — гость не найден в MGS',          modalType: 'error', errorScenarioId: 'not-found' },
      { id: 'err-pin',        label: 'Неверный PIN',       icon: 'key-round',     iconColor: '#d32f2f', description: '406 — неверный PIN-код',               modalType: 'error', errorScenarioId: 'pin-invalid' },
      { id: 'err-token',      label: 'Токен истёк',        icon: 'timer-off',     iconColor: '#ff6d00', description: 'TTL 5 мин — повторный PIN',            modalType: 'error', errorScenarioId: 'token-expired' },
      { id: 'err-cash',       label: 'Недостаточно cash',  icon: 'wallet',        iconColor: '#d32f2f', description: '423 — баланс кэш-поинтов недостаточен', modalType: 'error', errorScenarioId: 'insufficient-cash' },
      { id: 'err-points',     label: 'Недостаточно баллов', icon: 'star',         iconColor: '#d32f2f', description: '423 — баллов лояльности не хватает',    modalType: 'error', errorScenarioId: 'insufficient-points' },
      { id: 'err-blocked',    label: 'Счёт заблокирован',  icon: 'lock',          iconColor: '#d32f2f', description: '423 — счёт гостя заблокирован',         modalType: 'error', errorScenarioId: 'account-blocked' },
      { id: 'err-unavailable', label: 'MGS недоступен',    icon: 'server-off',    iconColor: '#78909c', description: 'Сервер не отвечает при старте',         modalType: 'error', errorScenarioId: 'mgs-unavailable' },
    ],
  },
];

/** Карточки каталога диалогов (legacy, для обратной совместимости) */
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
