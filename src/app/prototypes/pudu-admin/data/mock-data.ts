import { Robot, RobotPoint, DiningTable, TableMapping, ScenarioSettings } from '../types';

export const MOCK_ROBOTS: Robot[] = [
  {
    id: 'PD2024060001',
    name: 'BellaBot-01',
    server_region: 'EU',
    secret_key: 'sk_ne_bella01_2024',
    connection_status: 'online',
    active_map_name: 'Зал 1 этаж',
  },
  {
    id: 'PD2024080042',
    name: 'Ketty-02',
    server_region: 'EU',
    secret_key: 'sk_ne_ketty02_2024',
    connection_status: 'offline',
    active_map_name: 'Зал 2 этаж',
  },
  {
    id: 'PD2025010007',
    name: 'BellaBot-03',
    server_region: 'ASIA',
    secret_key: 'sk_ne_bella03_2025',
    connection_status: 'online',
    active_map_name: 'Зал VIP',
  },
];

export const MOCK_POINTS_BELLA01: RobotPoint[] = [
  { point_id: 'pt-001', point_name: 'Стол у окна', point_type: 'table' },
  { point_id: 'pt-002', point_name: 'Стол 2', point_type: 'table' },
  { point_id: 'pt-003', point_name: 'Стол 3 (VIP)', point_type: 'table' },
  { point_id: 'pt-004', point_name: 'Стол 4 (бар)', point_type: 'table' },
  { point_id: 'pt-005', point_name: 'Стол 5', point_type: 'table' },
  { point_id: 'pt-006', point_name: 'Стол 6 (терраса)', point_type: 'table' },
  { point_id: 'pt-010', point_name: 'Раздача кухни', point_type: 'pickup' },
  { point_id: 'pt-011', point_name: 'Раздача бар', point_type: 'pickup' },
  { point_id: 'pt-020', point_name: 'Мойка основная', point_type: 'sink' },
  { point_id: 'pt-030', point_name: 'Зона ожидания (вход)', point_type: 'parking' },
  { point_id: 'pt-040', point_name: 'Зарядная станция', point_type: 'charging' },
];

export const MOCK_POINTS_KETTY02: RobotPoint[] = [
  { point_id: 'pt-101', point_name: 'Стол 2-1', point_type: 'table' },
  { point_id: 'pt-102', point_name: 'Стол 2-2', point_type: 'table' },
  { point_id: 'pt-103', point_name: 'Стол 2-3', point_type: 'table' },
  { point_id: 'pt-110', point_name: 'Раздача 2 этаж', point_type: 'pickup' },
  { point_id: 'pt-120', point_name: 'Мойка 2 этаж', point_type: 'sink' },
  { point_id: 'pt-140', point_name: 'Зарядка 2 этаж', point_type: 'charging' },
];

export const MOCK_POINTS_BELLA03: RobotPoint[] = [
  { point_id: 'pt-201', point_name: 'VIP стол 1', point_type: 'table' },
  { point_id: 'pt-202', point_name: 'VIP стол 2', point_type: 'table' },
  { point_id: 'pt-210', point_name: 'VIP раздача', point_type: 'pickup' },
  { point_id: 'pt-230', point_name: 'VIP парковка', point_type: 'parking' },
  { point_id: 'pt-240', point_name: 'VIP зарядка', point_type: 'charging' },
];

export const MOCK_TABLES: DiningTable[] = [
  { table_id: 'tbl-001', table_name: 'Стол №1', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-002', table_name: 'Стол №2', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-003', table_name: 'Стол №3 (VIP)', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-004', table_name: 'Стол №4 (бар)', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-005', table_name: 'Стол №5', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-006', table_name: 'Стол №6 (терраса)', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-007', table_name: 'Стол №7', section_name: 'Зал 1 этаж' },
  { table_id: 'tbl-008', table_name: 'Стол №8', section_name: 'Зал 1 этаж' },
];

export function getInitialMapping(): TableMapping[] {
  return [
    { table_id: 'tbl-001', points: [{ ...MOCK_POINTS_BELLA01[0] }] },
    { table_id: 'tbl-002', points: [{ ...MOCK_POINTS_BELLA01[1] }] },
    { table_id: 'tbl-003', points: [{ ...MOCK_POINTS_BELLA01[2] }, { ...MOCK_POINTS_BELLA01[6] }] },
    { table_id: 'tbl-004', points: [{ ...MOCK_POINTS_BELLA01[3] }] },
    { table_id: 'tbl-005', points: [] },
    { table_id: 'tbl-006', points: [{ ...MOCK_POINTS_BELLA01[5] }] },
    { table_id: 'tbl-007', points: [] },
    { table_id: 'tbl-008', points: [] },
  ];
}

export function getPointsForRobot(robotId: string): RobotPoint[] {
  switch (robotId) {
    case 'PD2024060001': return MOCK_POINTS_BELLA01.map(p => ({ ...p }));
    case 'PD2024080042': return MOCK_POINTS_KETTY02.map(p => ({ ...p }));
    case 'PD2025010007': return MOCK_POINTS_BELLA03.map(p => ({ ...p }));
    default: return [];
  }
}

export function getInitialSettings(): ScenarioSettings {
  return {
    send_menu: {
      phrase: 'Заберите, пожалуйста, меню',
      wait_time: 30,
      after_action: 'idle',
    },
    send_dish: {
      max_dishes_per_trip: 6,
      phrase_delivery: 'Ваш заказ прибыл! Приятного аппетита!',
      phrase_dishes_info: 'На подносе: блюда для стола',
      phrase_tray: 'Пожалуйста, заберите блюда с подноса',
      wait_time: 45,
      after_action: 'idle',
    },
    cleanup: {
      mode: 'manual',
      phrase_arrival: 'Пожалуйста, поставьте грязную посуду на поднос',
      wait_time: 60,
      phrase_later: 'Я приеду позже за посудой',
      auto_timer_after_delivery: 12,
      auto_timer_after_check: 3,
    },
    qr_payment: {
      cashier_phrase: 'Положите чек для стола N',
      cashier_timeout: 30,
      guest_wait_time: 120,
      phrase_success: 'Спасибо за оплату!',
      phrase_failure: 'К сожалению, оплата не прошла. Обратитесь к официанту',
      after_action: 'idle',
    },
    marketing: {
      robot_id: 'PD2024060001',
      auto_cruise_on_idle: false,
      timer_enabled: false,
      timer_start: '11:00',
      timer_end: '14:00',
    },
    general: {
      default_robot_id: 'PD2024060001',
    },
  };
}
