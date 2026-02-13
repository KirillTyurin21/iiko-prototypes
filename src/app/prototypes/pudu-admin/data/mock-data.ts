import { Robot, RobotPoint, DiningTable, TableMapping, ScenarioSettings } from '../types';

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

// Единый набор точек для всего заведения (v1.2 — только столы)
export const MOCK_POINTS: RobotPoint[] = [
  { point_id: 'pt-001', point_name: 'Стол у окна' },
  { point_id: 'pt-002', point_name: 'Стол 2' },
  { point_id: 'pt-003', point_name: 'Стол 3 (VIP)' },
  { point_id: 'pt-004', point_name: 'Стол 4 (бар)' },
  { point_id: 'pt-005', point_name: 'Стол 5' },
  { point_id: 'pt-006', point_name: 'Стол 6 (терраса)' },
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
    { table_id: 'tbl-001', points: [{ ...MOCK_POINTS[0] }] },
    { table_id: 'tbl-002', points: [{ ...MOCK_POINTS[1] }] },
    { table_id: 'tbl-003', points: [{ ...MOCK_POINTS[2] }] },
    { table_id: 'tbl-004', points: [{ ...MOCK_POINTS[3] }] },
    { table_id: 'tbl-005', points: [] },
    { table_id: 'tbl-006', points: [{ ...MOCK_POINTS[4] }, { ...MOCK_POINTS[5] }] },
    { table_id: 'tbl-007', points: [] },
    { table_id: 'tbl-008', points: [] },
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
