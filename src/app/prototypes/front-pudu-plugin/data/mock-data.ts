import {
  PuduRobot,
  AvailableRobot,
  OrderTable,
  CurrentOrder,
  RobotTask,
  PuduNotification,
  ScenarioSettings,
  PuduDialogEntry,
} from '../types';

export const MOCK_CURRENT_ORDER: CurrentOrder = {
  order_id: '1042',
  table: {
    table_id: 'tbl-003',
    table_name: 'Стол №3 (VIP)',
    is_mapped: true,
  },
  waiter_name: 'Мария',
  items: [
    { name: 'Том Ям', quantity: 1, price: 450 },
    { name: 'Филадельфия Классик', quantity: 2, price: 490 },
    { name: 'Стейк Рибай', quantity: 1, price: 1850 },
    { name: 'Лимонад Манго-Маракуйя', quantity: 2, price: 240 },
  ],
  total: 3760,
  payment_type: null,
};

export const MOCK_TABLES: OrderTable[] = [
  { table_id: 'tbl-001', table_name: 'Стол №1', is_mapped: true },
  { table_id: 'tbl-002', table_name: 'Стол №2', is_mapped: true },
  { table_id: 'tbl-003', table_name: 'Стол №3 (VIP)', is_mapped: true },
  { table_id: 'tbl-004', table_name: 'Стол №4 (бар)', is_mapped: true },
  { table_id: 'tbl-005', table_name: 'Стол №5', is_mapped: false },
  { table_id: 'tbl-006', table_name: 'Стол №6 (терраса)', is_mapped: true },
  { table_id: 'tbl-007', table_name: 'Стол №7', is_mapped: false },
  { table_id: 'tbl-008', table_name: 'Стол №8', is_mapped: true },
  { table_id: 'tbl-009', table_name: 'Стол №9', is_mapped: true },
  { table_id: 'tbl-010', table_name: 'Стол №10', is_mapped: false },
  { table_id: 'tbl-011', table_name: 'Стол №11 (веранда)', is_mapped: true },
  { table_id: 'tbl-012', table_name: 'Стол №12', is_mapped: true },
  { table_id: 'tbl-013', table_name: 'Стол №13', is_mapped: false },
  { table_id: 'tbl-014', table_name: 'Стол №14', is_mapped: true },
  { table_id: 'tbl-015', table_name: 'Стол №15 (кабинет)', is_mapped: true },
];

// v1.5 I7: добавлены ne_name и alias
export const MOCK_ROBOTS: PuduRobot[] = [
  {
    robot_id: 'PD2024060001',
    robot_name: 'BellaBot-01',
    ne_name: 'BellaBot-01',
    alias: 'Белла Зал 1',        // Администратор задал alias в iiko Web
    status: 'idle',
    after_action: 'idle',
  },
  {
    robot_id: 'PD2024080042',
    robot_name: 'KettyBot-01',
    ne_name: 'KettyBot-01',
    alias: null,                   // Alias не задан — отображается только системное имя
    status: 'busy',
    after_action: 'marketing',
  },
];

/** v1.4 (H7) + v1.5 (I7): Расширенные mock-данные для П1 и П7 */
export const MOCK_AVAILABLE_ROBOTS: AvailableRobot[] = [
  {
    robot_id: 'PD2024060001',
    robot_name: 'BellaBot-1',
    ne_name: 'BellaBot-1',
    alias: 'Белла Зал 1',              // Alias задан → двустрочное отображение
    status: 'free',
    current_task: null,
  },
  {
    robot_id: 'PD2024060002',
    robot_name: 'BellaBot-2',
    ne_name: 'BellaBot-2',
    alias: null,                         // Alias не задан → одна строка
    status: 'free',
    current_task: null,
  },
  {
    robot_id: 'PD2024080042',
    robot_name: 'KettyBot-1',
    ne_name: 'KettyBot-1',
    alias: 'Терраса',                    // Alias задан → двустрочное отображение
    status: 'busy',
    current_task: {
      task_id: 'task-20260216-001',
      task_type: 'send_menu',
      target_point: 'TABLE_5',
    },
  },
  {
    robot_id: 'PD2024080043',
    robot_name: 'KettyBot-2',
    ne_name: 'KettyBot-2',
    alias: null,                         // Alias не задан
    status: 'offline',
    current_task: null,
  },
];

/** v1.4 (H11): Mock general_settings */
export const MOCK_GENERAL_SETTINGS = {
  notification_sound_enabled: true,
  show_success_notifications: false,   // по умолчанию ВЫКЛ (решение Руслана от 06.02)
};

/** v1.4 (H11): Маппинг task_type → человекочитаемое название */
export const TASK_HUMAN_NAMES: Record<string, string> = {
  send_menu: 'Доставка меню',
  cleanup: 'Уборка посуды',
  cleanup_auto: 'Авто-уборка',
  qr_payment: 'QR-оплата',
  send_dish: 'Доставка блюд',
  marketing: 'Маркетинг-круиз',
};

export const MOCK_ACTIVE_TASKS: RobotTask[] = [
  {
    task_id: 'task-078',
    task_type: 'cleanup',
    ne_name: 'BellaBot-01',
    alias: 'Белла Зал 1',
    status: 'in_progress',
    table_id: 'tbl-005',
    robot_name: 'BellaBot-01',
    created_at: new Date('2026-02-11T14:20:00'),
  },
];

export const MOCK_SCENARIO_SETTINGS: ScenarioSettings = {
  // --- Доставка меню (S1) ---
  send_menu: {
    phrase: 'Заберите, пожалуйста, меню',
    phrase_url: '',
    pickup_phrase: 'Положите меню для стола №{N}',   // v1.3: renamed from phrase_pickup
    pickup_phrase_url: '',                                   // v1.3: renamed from phrase_pickup_url
    wait_time: 60,                                           // v1.3: 30 → 60 сек (SPEC-003 v1.3)
    pickup_wait_time: 60,                                    // v1.3: 30 → 60 сек, renamed from wait_time_pickup
  },

  // --- Уборка посуды — ручная (S2) ---
  cleanup: {
    mode: 'mixed',                               // v1.4 (H6): изменено с "manual" на "mixed" для демо
    phrase: 'Пожалуйста, поставьте грязную посуду на поднос',  // v1.3: renamed from phrase_arrival
    phrase_url: '',                                          // v1.3: renamed from phrase_arrival_url
    wait_time: 90,
    phrase_fail: 'Я приеду позже за посудой',           // v1.3: renamed from phrase_later
    phrase_fail_url: '',                                     // v1.3: renamed from phrase_later_url
  },

  // --- Уборка посуды — авто (S4) --- // v1.3 (F5)
  cleanup_auto: {
    timer_after_delivery: 720,                               // 12 мин = 720 сек (рекомендация NE: 12–14 мин)
    timer_after_checkout: 0,                                 // 0 = немедленно после закрытия чека
    enabled: false,                                          // Авто-уборка: фоновый процесс, без модального окна
  },

  // --- Доставка блюд (S5) --- // v1.3 (G1) — сценарий разблокирован
  send_dish: {
    phrase: 'Ваш заказ для стола №{N} доставлен. Приятного аппетита!',
    phrase_url: '',
    pickup_phrase: 'Загрузите блюда для стола №{N}: {dishes}',
    pickup_phrase_url: '',
    wait_time: 60,                                           // Ожидание у стола, сек (SPEC-003: 60)
    pickup_wait_time: 60,                                    // Ожидание на раздаче, сек (SPEC-003: 60)
    max_dishes_per_trip: 4,                                  // Макс. блюд за один рейс (З-48)
    phrase_repeat: 'Заберите, пожалуйста, ваш заказ!',
    phrase_repeat_url: '',
  },

  // --- Оплата QR (S3) ---
  qr_payment: {
    phrase_cashier: 'Положите чек для стола {N}',       // v1.3: renamed from cashier_phrase
    phrase_cashier_url: '',                                  // v1.3: renamed from cashier_phrase_url
    cashier_timeout: 120,                                    // v1.3: 30 → 120 сек (SPEC-003 v1.3, раздел 6.6)
    payment_timeout: 120,                                    // v1.3: renamed from guest_wait_time (SPEC-003)
    phrase_success: 'Спасибо за оплату!',
    phrase_success_url: '',
    phrase_fail: 'К сожалению, оплата не прошла. Обратитесь к официанту',  // v1.3: renamed from phrase_failure
    phrase_fail_url: '',                                     // v1.3: renamed from phrase_failure_url
  },

  // --- Маркетинг (S6) ---
  marketing: {
    robot_id: 'PD2024080042',
    auto_cruise_on_idle: true,
  },
};

// v1.3 (G6): Mock-данные заказа для демо send_dish
export interface MockDish {
  id: string;
  name: string;
  quantity: number;
}

export const MOCK_ORDER_DISHES: MockDish[] = [
  { id: 'dish-001', name: 'Паста Болоньезе', quantity: 1 },
  { id: 'dish-002', name: 'Салат Цезарь', quantity: 2 },
  { id: 'dish-003', name: 'Стейк рибай', quantity: 1 },
  { id: 'dish-004', name: 'Крем-суп грибной', quantity: 1 },
  { id: 'dish-005', name: 'Тирамису', quantity: 2 },
  { id: 'dish-006', name: 'Латте', quantity: 3 },
];

/** Разбиение блюд на рейсы по max_dishes_per_trip */
export function splitDishesIntoTrips(dishes: MockDish[], maxPerTrip: number): MockDish[][] {
  const trips: MockDish[][] = [];
  for (let i = 0; i < dishes.length; i += maxPerTrip) {
    trips.push(dishes.slice(i, i + maxPerTrip));
  }
  return trips;
}

/** Автоназначение робота (вместо general.default_robot_id) */
export function getAssignedRobot(): PuduRobot {
  return MOCK_ROBOTS.find(r => r.status === 'idle') || MOCK_ROBOTS[0];
}

// v1.5 I7: двойные имена в уведомлениях
export const MOCK_NOTIFICATIONS: PuduNotification[] = [
  {
    id: 'notif-001',
    type: 'error',
    title: 'Робот Белла Зал 1 (BellaBot-01): ошибка при уборке',
    message: 'Код ошибки: ROBOT_STUCK. Проверьте препятствия на маршруте',
    timestamp: new Date('2026-02-11T14:22:30'),
    dismissed: false,
    is_estop: false,
  },
  {
    id: 'notif-002',
    type: 'error',
    title: 'Сервер роботов недоступен',
    message: 'NE API не отвечает. Повтор через 5 сек...',
    timestamp: new Date('2026-02-11T14:23:00'),
    dismissed: false,
    is_estop: false,
  },
];

/** Кастомные ошибки NE (D5, З-39) */
export const MOCK_NE_ERROR_NOTIFICATIONS: PuduNotification[] = [
  {
    id: 'notif-003',
    type: 'error',
    title: 'Робот Белла Зал 1 (BellaBot-01): ручной режим',
    message: 'Кто-то зашёл в настройки робота через физическое меню. Робот переведён в ручной режим и недоступен для задач',
    timestamp: new Date('2026-02-11T14:25:00'),
    dismissed: false,
    is_estop: false,
  },
  {
    id: 'notif-004',
    type: 'error',
    title: 'Робот KettyBot-01: препятствие на маршруте',
    message: 'Робот не может продолжить движение — обнаружено препятствие. Код: OBSTACLE_DETECTED',
    timestamp: new Date('2026-02-11T14:26:00'),
    dismissed: false,
    is_estop: false,
  },
  {
    id: 'notif-005',
    type: 'error',
    title: 'Робот Белла Зал 1 (BellaBot-01): низкий заряд батареи',
    message: 'Уровень заряда < 10%. Робот возвращается на станцию зарядки. Код: LOW_BATTERY',
    timestamp: new Date('2026-02-11T14:27:00'),
    dismissed: false,
    is_estop: false,
  },
];

export const MOCK_PUDU_DIALOGS: PuduDialogEntry[] = [
  {
    id: 'send_menu_confirm',
    modalType: 'send_menu_confirm',
    name: 'Отправить меню',
    description: 'Подтверждение отправки меню к столу',
    icon: 'utensils',
    iconColor: 'text-[#b8c959]',
    iconBg: 'bg-[#b8c959]/20',
  },
  {
    id: 'cleanup_confirm',
    modalType: 'cleanup_confirm',
    name: 'Уборка посуды',
    description: 'Подтверждение уборки посуды со стола',
    icon: 'trash-2',
    iconColor: 'text-[#b8c959]',
    iconBg: 'bg-[#b8c959]/20',
  },
  {
    id: 'cleanup_multi_select',
    modalType: 'cleanup_multi_select',
    name: 'Уборка (мультивыбор)',
    description: 'Выбор нескольких столов для уборки',
    icon: 'trash-2',
    iconColor: 'text-[#b8c959]',
    iconBg: 'bg-[#b8c959]/20',
  },
  {
    id: 'qr_cashier_phase',
    modalType: 'qr_cashier_phase',
    name: 'QR-оплата: фаза «Кассир»',
    description: 'Робот у кассы — ожидание чека',
    icon: 'printer',
    iconColor: 'text-[#b8c959]',
    iconBg: 'bg-[#b8c959]/20',
  },
  {
    id: 'qr_guest_phase',
    modalType: 'qr_guest_phase',
    name: 'QR-оплата: фаза «Гость»',
    description: 'Робот у стола — гость сканирует QR',
    icon: 'qr-code',
    iconColor: 'text-[#b8c959]',
    iconBg: 'bg-[#b8c959]/20',
  },
  {
    id: 'qr_success',
    modalType: 'qr_success',
    name: 'QR-оплата: Успех',
    description: 'Подтверждение успешной оплаты',
    icon: 'check-circle-2',
    iconColor: 'text-[#b8c959]',
    iconBg: 'bg-[#b8c959]/20',
  },
  {
    id: 'qr_timeout',
    modalType: 'qr_timeout',
    name: 'QR-оплата: Тайм-аут',
    description: 'Время ожидания оплаты истекло',
    icon: 'alert-circle',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
  },
  {
    id: 'unmapped_table',
    modalType: 'unmapped_table',
    name: 'Стол не замаплен',
    description: 'Предупреждение: стол не привязан к точке робота',
    icon: 'alert-circle',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20',
  },
  {
    id: 'send_dish_blocked',
    modalType: 'send_dish_blocked',
    name: 'Доставка блюд [BLOCKED]',
    description: 'Сценарий находится в разработке',
    icon: 'package',
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-600/30',
  },
  {
    id: 'loading',
    modalType: 'loading',
    name: 'Загрузка',
    description: 'Отправка команды роботу',
    icon: 'loader-2',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  {
    id: 'success',
    modalType: 'success',
    name: 'Задача создана',
    description: 'Успешное создание задачи',
    icon: 'check-circle-2',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20',
  },
  {
    id: 'error',
    modalType: 'error',
    name: 'Ошибка',
    description: 'Не удалось отправить команду',
    icon: 'alert-circle',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
  },
];
