/** Типы для прототипа «PUDU — Управление роботами (Front)» v1.1 */

/** Контекст вызова плагина: из заказа или с главного экрана */
export type PuduContextType = 'order' | 'main';

export interface PuduRobot {
  robot_id: string;
  robot_name: string;        // системное имя из NE / PUDU Cloud: "BellaBot-01"
  ne_name: string;           // v1.5: системное имя NE (= robot_name). Для единообразия с AvailableRobot
  alias: string | null;      // v1.5: пользовательский alias из iiko Web (ConfigManager). null если не задан
  status: 'idle' | 'busy' | 'offline';
  after_action: 'idle' | 'marketing';  // per-robot настройка (из Admin Panel)
}

/** v1.4 (H7): Робот из GET /v1/robots/available */
export interface AvailableRobot {
  robot_id: string;
  robot_name: string;        // системное имя от NE API (GET /v1/robots/available)
  ne_name: string;           // v1.5: = robot_name (из NE). Хранится отдельно для ясности
  alias: string | null;      // v1.5: пользовательский alias из ConfigManager.Robots[]. null если не задан
  status: 'free' | 'busy' | 'offline';
  current_task: {
    task_id: string;
    task_type: 'send_menu' | 'cleanup' | 'cleanup_auto' | 'send_dish' | 'qr_payment' | 'marketing';
    target_point: string;
  } | null;
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
  ne_name: string;           // v1.5: системное имя робота из NE
  alias: string | null;      // v1.5: пользовательский alias из iiko Web

  // === Polling endpoint (подтверждён NE): ===
  // GET /v1/scenarios/scenario-status/{task_id}
  //
  // === Маппинг NE-статусов → внутренние: ===
  // NE IN_PROCESS → 'in_progress'
  // NE FAILED     → 'error'
  // NE SUCCESS    → 'completed'
  // NE FINISHED   → 'completed'  (для маркетинга: остановка круиза, не успех;
  //                                Trigger Manager может перезапустить при наличии условий)
  // NE CANCELED   → 'cancelled'
  //
  // === [Critical] Неподтверждённые статусы (6 из 10): ===
  // 'queued', 'assigned', 'at_cashier', 'at_target',
  // 'cashier_timeout', 'payment_timeout'
  // НЕ подтверждены NE API. Используются как гипотетические для полноты UI.
  // Если NE не реализует — потребуется fallback-механизм (см. НВ-16 в SPEC-003).

  status: 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
        | 'completed' | 'error' | 'cancelled'
        | 'cashier_timeout' | 'payment_timeout';
  //       ↑ УДАЛЁН 'finished' — SPEC-003 v1.3: FINISHED маппится на 'completed'

  table_id: string;
  robot_name: string;        // deprecated v1.5 → используйте displayRobotName(ne_name, alias)
  created_at: Date;
}

export interface PuduNotification {
  id: string;
  type: 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  is_estop: boolean;              // true = повторяющееся уведомление E-STOP
  repeat_interval_sec?: number;   // интервал повторения (5 сек для E-STOP)
  isRepeating?: boolean;          // v1.4 (H5): persistent_repeating = true
}

export interface ScenarioSettings {
  send_menu: {
    phrase: string;
    phrase_url: string;
    pickup_phrase: string;         // v1.3: renamed from phrase_pickup (SPEC-003)
    pickup_phrase_url: string;     // v1.3: renamed from phrase_pickup_url
    wait_time: number;
    pickup_wait_time: number;      // v1.3: renamed from wait_time_pickup
  };
  cleanup: {
    mode: 'manual' | 'auto' | 'mixed';
    phrase: string;
    phrase_url: string;
    wait_time: number;
    // phrase_fail — УДАЛЕНО (v1.6 J1): нет ИК-датчиков, решается тайм-аутом
  };
  cleanup_auto: {                  // v1.3 (F5): авто-уборка
    timer_after_delivery: number;
    timer_after_checkout: number;
    enabled: boolean;
  };
  send_dish: {                     // v1.3 (G1): доставка блюд — разблокировано
    phrase: string;
    phrase_url: string;
    pickup_phrase: string;
    pickup_phrase_url: string;
    wait_time: number;
    pickup_wait_time: number;
    max_dishes_per_trip: number;
    phrase_repeat: string;
    phrase_repeat_url: string;
  };
  qr_payment: {
    phrase_cashier: string;        // v1.3: renamed from cashier_phrase (SPEC-003)
    phrase_cashier_url: string;    // v1.3: renamed from cashier_phrase_url
    cashier_timeout: number;
    payment_timeout: number;       // v1.3: renamed from guest_wait_time (SPEC-003)
    phrase_success: string;
    phrase_success_url: string;
    phrase_fail: string;           // v1.3: renamed from phrase_failure
    phrase_fail_url: string;       // v1.3: renamed from phrase_failure_url
  };
  marketing: {
    robot_id: string;
    auto_cruise_on_idle: boolean;
  };
}

export type PuduModalType =
  // Сценарий: Отправить меню
  | 'send_menu_confirm'
  // Сценарий: Уборка посуды
  | 'cleanup_confirm'             // Из заказа — один стол
  | 'cleanup_multi_select'        // С главного экрана — мультивыбор
  // Сценарий: Оплата по QR
  | 'qr_cashier_phase'
  | 'qr_guest_phase'
  | 'qr_success'
  | 'qr_timeout'
  // Сценарий: Доставка блюд — v1.3: РАЗБЛОКИРОВАНО
  | 'send_dish_confirm'            // М14: подтверждение (фудкорт)
  | 'send_dish_pickup_notification' // М15: уведомление раздачи
  | 'send_dish_repeat'             // М16: повторить доставку
  | 'send_dish_blocked'            // М8: заглушка (legacy, для каталога)
  // Общие
  | 'loading'                        // [DEPRECATED v1.4 H10] — заменён inline-спиннером на кнопке
  | 'error'
  | 'success'                        // [DEPRECATED v1.4 H10] — заменён toast dispatched (H11)
  | 'unmapped_table'
  // v1.4: Выбор робота и статусы
  | 'robot_select'                   // v1.4 (H1): П1 — Выбор робота (для маркетинга)
  | 'robot_status'                   // v1.4 (H1): П7 — Быстрый просмотр статусов роботов
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

// === КАТАЛОГ ЯЧЕЕК (v1.2) ===

export type CellCategory =
  | 'context-order'     // Контекст: из заказа
  | 'context-main'      // Контекст: главный экран
  | 'scenario'          // Сценарий (цепочка переходов)
  | 'modal'             // Одиночное модальное окно
  | 'notification';     // Уведомление / спецсостояние

export interface CatalogCell {
  id: string;                         // Уникальный ID ячейки (slug)
  label: string;                      // Название на русском (H3 карточки)
  description: string;                // Описание 1-2 строки
  icon: string;                       // Имя иконки Lucide
  iconColor: string;                  // HEX цвет иконки и её фонового круга
  category: CellCategory;            // Категория для группировки
  modalType?: PuduModalType;         // Какую модалку открыть (одиночные)
  scenario?: string;                  // Какой сценарий запустить (цепочки)
  context?: 'order' | 'main';        // Контекст POS-экрана
  badge?: string;                     // Текст бейджа (напр. "BLOCKED")
  badgeColor?: string;                // HEX цвет бейджа
}

export interface CatalogSection {
  title: string;                      // Заголовок секции (H2)
  icon: string;                       // Иконка Lucide рядом с заголовком
  description: string;                // Подзаголовок — пояснение
  category: CellCategory;            // Категория для фильтрации
  cells: CatalogCell[];              // Ячейки секции
}

/** Шаг сценария (для автоматических цепочек) */
export interface ScenarioStep {
  modal: PuduModalType;              // Модалка для открытия
  delay: number;                      // Задержка перед открытием (мс)
  action?: string;                    // v1.4: действие для выполнения
  params?: Record<string, any>;       // v1.4: параметры действия
  toast?: 'dispatched' | 'completed' | 'error' | 'info';  // v1.4 (H14): тип toast для показа
  toastText?: string;                 // v1.4 (H14): текст toast
}
