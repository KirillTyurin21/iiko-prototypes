// Ресторан организации (v1.4)
export interface Restaurant {
  account_id: string;
  restaurant_name: string;
  robots_total: number;
  robots_online: number;
  mapping_completed: boolean;
  scenarios_enabled: number;
  setup_status: 'configured' | 'partial' | 'not_configured';
}

// Робот PUDU (v1.2)
export interface Robot {
  id: string;
  name: string;
  connection_status: 'online' | 'offline' | 'error';
  active_map_name: string;
  after_action: 'idle' | 'marketing';
}

// Точка на карте робота (v1.2) — все точки являются точками столов
export interface RobotPoint {
  point_id: string;
  point_name: string;
}

// Стол системы (v1.9: добавлено is_manual)
export interface DiningTable {
  table_id: string;         // "tbl-001" (iiko) или "manual-001" (ручной)
  table_name: string;       // "Стол №1" или "42" (ручной ввод)
  section_name: string;     // "Зал 1 этаж" или "" (пустая строка для ручных)
  is_manual: boolean;       // true — ручной стол (фудкорт), false — стол из iiko
}

// Маппинг столов к точкам
export interface TableMapping {
  table_id: string;
  points: RobotPoint[];
}

// Фраза с таймером (для send_dish)
export interface PhraseWithTimer {
  text: string;
  url: string;
  delay_sec: number;
}

// Настройки сценариев (v1.2)
export interface ScenarioSettings {
  send_menu: {
    phrase: string;
    phrase_url?: string;
    phrase_pickup: string;
    phrase_pickup_url?: string;
    wait_time: number;
    wait_time_pickup: number;
  };
  send_dish: {
    max_dishes_per_trip: number;
    wait_time: number;
    phrases: PhraseWithTimer[];
  };
  cleanup: {
    mode: 'manual' | 'auto' | 'mixed';
    phrase_arrival: string;
    phrase_arrival_url?: string;
    wait_time: number;
    // phrase_later — УДАЛЕНО (v1.5 G4): нет доступа к ИК-датчикам робота,
    // робот не может определить, положил ли гость посуду.
    // Решается тайм-аутом (wait_time): робот стоит N секунд и уезжает.
    auto_timer_after_delivery: number;
    auto_timer_after_check: number;
  };
  qr_payment: {
    cashier_phrase: string;
    cashier_phrase_url?: string;
    cashier_timeout: number;
    guest_wait_time: number;
    phrase_success: string;
    phrase_success_url?: string;
    phrase_failure: string;
    phrase_failure_url?: string;
  };
  marketing: {
    robot_ids: string[];           // массив ID роботов для маркетинга (пустой = не выбраны)
    auto_cruise_on_idle: boolean;
    idle_timeout_sec: number;      // v1.10: таймаут простоя перед запуском маркетинга (сек)
    timer_enabled: boolean;
    timer_start: string;
    timer_end: string;
  };
}
