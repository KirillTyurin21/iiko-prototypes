// Робот PUDU
export interface Robot {
  id: string;
  name: string;
  server_region: 'EU' | 'ASIA';
  secret_key: string;
  connection_status: 'online' | 'offline' | 'error';
  active_map_name: string;
}

// Точка на карте робота
export interface RobotPoint {
  point_id: string;
  point_name: string;
  point_type: 'table' | 'pickup' | 'sink' | 'parking' | 'charging';
}

// Стол системы
export interface DiningTable {
  table_id: string;
  table_name: string;
  section_name: string;
}

// Маппинг столов к точкам
export interface TableMapping {
  table_id: string;
  points: RobotPoint[];
}

// Настройки сценариев
export interface ScenarioSettings {
  send_menu: {
    phrase: string;
    wait_time: number;
    after_action: 'idle' | 'marketing';
  };
  send_dish: {
    max_dishes_per_trip: number;
    phrase_delivery: string;
    phrase_dishes_info: string;
    phrase_tray: string;
    wait_time: number;
    after_action: 'idle' | 'marketing';
  };
  cleanup: {
    mode: 'manual' | 'auto';
    phrase_arrival: string;
    wait_time: number;
    phrase_later: string;
    auto_timer_after_delivery: number;
    auto_timer_after_check: number;
  };
  qr_payment: {
    cashier_phrase: string;
    cashier_timeout: number;
    guest_wait_time: number;
    phrase_success: string;
    phrase_failure: string;
    after_action: 'idle' | 'marketing';
  };
  marketing: {
    robot_id: string;
    auto_cruise_on_idle: boolean;
    timer_enabled: boolean;
    timer_start: string;
    timer_end: string;
  };
  general: {
    default_robot_id: string;
  };
}
