/** Типы для прототипа «PUDU — Управление роботами (Front)» */

export interface PuduRobot {
  robot_id: string;
  robot_name: string;
  status: 'idle' | 'busy' | 'offline';
}

export interface OrderTable {
  table_id: string;
  table_name: string;
  is_mapped: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CurrentOrder {
  order_id: string;
  table: OrderTable;
  waiter_name: string;
  items: OrderItem[];
  total: number;
  payment_type: string | null;
}

export interface RobotTask {
  task_id: string;
  task_type: 'send_menu' | 'cleanup' | 'qr_payment' | 'send_dish' | 'marketing';
  status: 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
        | 'completed' | 'error' | 'cancelled' | 'cashier_timeout' | 'payment_timeout';
  table_id: string;
  robot_name: string;
  created_at: Date;
}

export interface PuduNotification {
  id: string;
  type: 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

export interface ScenarioSettings {
  send_menu: {
    phrase: string;
    wait_time: number;
    after_action: string;
  };
  cleanup: {
    phrase_arrival: string;
    wait_time: number;
    phrase_later: string;
  };
  qr_payment: {
    cashier_phrase: string;
    cashier_timeout: number;
    guest_wait_time: number;
    phrase_success: string;
    phrase_failure: string;
    after_action: string;
  };
  marketing: {
    robot_id: string;
    auto_cruise_on_idle: boolean;
  };
  general: {
    default_robot_id: string;
  };
}

export type PuduModalType =
  | 'send_menu_confirm'
  | 'cleanup_confirm'
  | 'qr_cashier_phase'
  | 'qr_guest_phase'
  | 'qr_success'
  | 'qr_timeout'
  | 'send_dish_blocked'
  | 'loading'
  | 'error'
  | 'success'
  | 'unmapped_table'
  | null;

/** Для регистрации в plugin-main-screen (каталог плагинов) */
export interface PuduDialogEntry {
  id: string;
  modalType: PuduModalType;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}
