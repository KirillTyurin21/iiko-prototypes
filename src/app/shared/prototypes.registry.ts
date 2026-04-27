/**
 * Реестр всех прототипов — добавляй сюда новые прототипы.
 * Они автоматически появятся в sidebar и на главной странице.
 */
export interface PrototypeEntry {
  path: string;
  label: string;
  icon: string;        // имя иконки lucide (kebab-case), напр. 'puzzle'
  description?: string;
}

export const PROTOTYPES: PrototypeEntry[] = [
  {
    path: '/prototype/front-plugins',
    label: 'Плагины Front — Макеты окон',
    icon: 'credit-card',
    description: 'Макеты модальных окон (попапов) плагинов кассового терминала Front',
  },
  {
    path: '/prototype/demo',
    label: 'Демо-прототип',
    icon: 'puzzle',
    description: 'Пример прототипа плагина',
  },
  {
    path: '/prototype/web-screens',
    label: 'Web — Advertise Screens',
    icon: 'monitor-play',
    description: 'Прототип модуля управления гостевыми экранами и табло прибытия',
  },
  {
    path: '/prototype/eagle',
    label: 'Eagle — Панель управления',
    icon: 'bot',
    description: 'Панель администрирования: регистрация, маппинг столов, настройки сценариев',
  },
  {
    path: '/prototype/falcon',
    label: 'Falcon — Плагин Front',
    icon: 'bot',
    description: 'Плагин POS-терминала: управление роботами, отправка меню, уборка, QR-оплата',
  },
  {
    path: '/prototype/neptune',
    label: 'Neptune — Guest Management',
    icon: 'scan-line',
    description: 'Плагин интеграции Front с системой управления гостями',
  },
  {
    path: '/prototype/demo-wizard',
    label: 'Демонстрация Wizard',
    icon: 'wand-2',
    description: 'Сравнение 4 подходов к автоматической демонстрации User Stories',
  },
  {
    path: '/prototype/comet',
    label: 'Comet — Панель интеграций',
    icon: 'qr-code',
    description: 'Панель управления QR-табличками и ключами платёжной системы',
  },
  {
    path: '/prototype/wb-pay',
    label: 'WB Pay — Оплата кошельком',
    icon: 'wallet',
    description: 'Плагин оплаты WB-кошельком (Front) + панель управления credentials (Web)',
  },
  // === Добавляй новые прототипы ВЫШЕ этой строки ===
];
