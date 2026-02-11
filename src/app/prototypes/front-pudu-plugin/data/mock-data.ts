import {
  PuduRobot,
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

export const MOCK_ROBOTS: PuduRobot[] = [
  { robot_id: 'PD2024060001', robot_name: 'BellaBot-01', status: 'idle' },
  { robot_id: 'PD2024080042', robot_name: 'Ketty-02', status: 'busy' },
];

export const MOCK_ACTIVE_TASKS: RobotTask[] = [
  {
    task_id: 'task-078',
    task_type: 'cleanup',
    status: 'in_progress',
    table_id: 'tbl-005',
    robot_name: 'BellaBot-01',
    created_at: new Date('2026-02-11T14:20:00'),
  },
];

export const MOCK_SCENARIO_SETTINGS: ScenarioSettings = {
  send_menu: {
    phrase: 'Заберите, пожалуйста, меню',
    wait_time: 30,
    after_action: 'idle',
  },
  cleanup: {
    phrase_arrival: 'Пожалуйста, поставьте грязную посуду на поднос',
    wait_time: 90,
    phrase_later: 'Я приеду позже за посудой',
  },
  qr_payment: {
    cashier_phrase: 'Положите чек для стола {N}',
    cashier_timeout: 30,
    guest_wait_time: 120,
    phrase_success: 'Спасибо за оплату!',
    phrase_failure: 'К сожалению, оплата не прошла. Обратитесь к официанту',
    after_action: 'idle',
  },
  marketing: {
    robot_id: 'PD2024080042',
    auto_cruise_on_idle: true,
  },
  general: {
    default_robot_id: 'PD2024060001',
  },
};

export const MOCK_NOTIFICATIONS: PuduNotification[] = [
  {
    id: 'notif-001',
    type: 'error',
    title: 'Робот BellaBot-01: ошибка при уборке',
    message: 'Код ошибки: ROBOT_STUCK. Проверьте препятствия на маршруте',
    timestamp: new Date('2026-02-11T14:22:30'),
    dismissed: false,
  },
  {
    id: 'notif-002',
    type: 'error',
    title: 'Сервер роботов недоступен',
    message: 'NE API не отвечает. Повтор через 5 сек...',
    timestamp: new Date('2026-02-11T14:23:00'),
    dismissed: false,
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
