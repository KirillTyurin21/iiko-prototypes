import { Restaurant, Robot, RobotPoint, DiningTable, TableMapping, ScenarioSettings } from '../types';

// v1.4: Рестораны организации
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    account_id: '550e8400-e29b-41d4-a716-446655440000',
    restaurant_name: 'Ресторан «Белуга» Тверская',
    robots_total: 3,
    robots_online: 2,
    mapping_completed: true,
    scenarios_enabled: 2,
    setup_status: 'configured',
  },
  {
    account_id: '550e8400-e29b-41d4-a716-446655440001',
    restaurant_name: 'Кафе «Причал» Арбат',
    robots_total: 1,
    robots_online: 0,
    mapping_completed: false,
    scenarios_enabled: 0,
    setup_status: 'partial',
  },
  {
    account_id: '550e8400-e29b-41d4-a716-446655440002',
    restaurant_name: 'Бар «Маяк» Патрики',
    robots_total: 0,
    robots_online: 0,
    mapping_completed: false,
    scenarios_enabled: 0,
    setup_status: 'not_configured',
  },
];

export const MOCK_ROBOTS: Robot[] = [
  {
    id: 'PD2024060001',
    name: 'BellaBot-01',
    connection_status: 'online',
    active_map_name: 'Зал 1 этаж',
    after_action: 'idle',
  },
  {
    id: 'PD2024080042',
    name: 'Ketty-02',
    connection_status: 'offline',
    active_map_name: 'Зал 2 этаж',
    after_action: 'idle',
  },
  {
    id: 'PD2025010007',
    name: 'BellaBot-03',
    connection_status: 'online',
    active_map_name: 'Зал VIP',
    after_action: 'marketing',
  },
];

// v1.3: 10 точек с техническими названиями NE (серийные номера PUDU)
export const MOCK_POINTS: RobotPoint[] = [
  { point_id: 'pt-001', point_name: 'SF234201A' },
  { point_id: 'pt-002', point_name: 'SF234202B' },
  { point_id: 'pt-003', point_name: 'SF234203C' },
  { point_id: 'pt-004', point_name: 'SF234204D' },
  { point_id: 'pt-005', point_name: 'SF234205E' },
  { point_id: 'pt-006', point_name: 'SF234206F' },
  { point_id: 'pt-007', point_name: 'SF234207G' },
  { point_id: 'pt-008', point_name: 'SF234208H' },
  { point_id: 'pt-009', point_name: 'SF234209I' },
  { point_id: 'pt-010', point_name: 'SF234210J' },
];

export const MOCK_TABLES: DiningTable[] = [
  // Зал 1 этаж (5 столов)
  { table_id: 'tbl-001', table_name: 'Стол №1', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-002', table_name: 'Стол №2', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-003', table_name: 'Стол №3 (VIP)', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-004', table_name: 'Стол №4 (бар)', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-005', table_name: 'Стол №5', section_name: 'Зал 1 этаж' },
  // Терраса (2 стола)
  { table_id: 'tbl-006', table_name: 'Стол №6', section_name: 'Терраса' },
  { table_id: 'tbl-007', table_name: 'Стол №7', section_name: 'Терраса' },
  // VIP-зал (1 стол)
  { table_id: 'tbl-008', table_name: 'Стол №8 (VIP)', section_name: 'VIP-зал' },
];

// v1.4: 5 из 8 столов замаплены, 3 свободных; обновлены комментарии по залам
export function getInitialMapping(): TableMapping[] {
  return [
    { table_id: 'tbl-001', points: [{ ...MOCK_POINTS[0] }] },                           // Зал 1 этаж, Стол №1 → SF234201A
    { table_id: 'tbl-002', points: [{ ...MOCK_POINTS[1] }] },                           // Зал 1 этаж, Стол №2 → SF234202B
    { table_id: 'tbl-003', points: [{ ...MOCK_POINTS[2] }, { ...MOCK_POINTS[3] }] },    // Зал 1 этаж, Стол №3 (VIP) → SF234203C + SF234204D
    { table_id: 'tbl-004', points: [{ ...MOCK_POINTS[4] }] },                           // Зал 1 этаж, Стол №4 (бар) → SF234205E
    { table_id: 'tbl-005', points: [] },                                                  // Зал 1 этаж, Стол №5 → НЕ ЗАМАПЛЕН
    { table_id: 'tbl-006', points: [{ ...MOCK_POINTS[5] }] },                           // Терраса, Стол №6 → SF234206F
    { table_id: 'tbl-007', points: [] },                                                  // Терраса, Стол №7 → НЕ ЗАМАПЛЕН
    { table_id: 'tbl-008', points: [] },                                                  // VIP-зал, Стол №8 → НЕ ЗАМАПЛЕН
  ];
}

export function getInitialSettings(): ScenarioSettings {
  return {
    send_menu: {
      phrase: 'Заберите, пожалуйста, меню',
      phrase_url: '',
      phrase_pickup: 'Положите меню для стола №{N}',
      phrase_pickup_url: '',
      wait_time: 30,
      wait_time_pickup: 30,
    },
    send_dish: {
      max_dishes_per_trip: 6,
      wait_time: 45,
      phrases: [
        { text: 'Ваш заказ прибыл! Приятного аппетита!', url: '', delay_sec: 0 },
        { text: 'Пожалуйста, заберите блюда с подноса', url: '', delay_sec: 15 },
      ],
    },
    cleanup: {
      mode: 'manual',
      phrase_arrival: 'Пожалуйста, поставьте грязную посуду на поднос',
      phrase_arrival_url: '',
      wait_time: 90,
      phrase_later: 'Я приеду позже за посудой',
      phrase_later_url: '',
      auto_timer_after_delivery: 12,
      auto_timer_after_check: 3,
    },
    qr_payment: {
      cashier_phrase: 'Положите чек для стола N',
      cashier_phrase_url: '',
      cashier_timeout: 30,
      guest_wait_time: 120,
      phrase_success: 'Спасибо за оплату!',
      phrase_success_url: '',
      phrase_failure: 'К сожалению, оплата не прошла. Обратитесь к официанту',
      phrase_failure_url: '',
    },
    marketing: {
      robot_id: 'PD2024060001',
      auto_cruise_on_idle: false,
      timer_enabled: false,
      timer_start: '11:00',
      timer_end: '14:00',
    },
  };
}
