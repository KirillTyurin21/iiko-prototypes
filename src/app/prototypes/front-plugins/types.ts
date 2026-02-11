/** Типы для прототипа «Плагины Front» */

export interface PluginEntry {
  id: string;
  name: string;
  description: string;
  icon: string;
  dialogCount: number;
  link?: string; // Внешняя ссылка на отдельный прототип
}

export interface DialogEntry {
  id: string;
  modalType: ModalType;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export type ModalType =
  | 'search'
  | 'found'
  | 'not-found'
  | 'blocked'
  | 'payment'
  | 'accumulate'
  | 'success'
  | 'loading'
  | 'error'
  | 'network-error'
  | 'registration'
  | null;

export interface CustomerData {
  full_name: string;
  phone: string;
  card_code: string;
  birth_date: string;
  program_name: string;
  status_name: string;
  discount_percent: number;
  bonus_percent: number;
  bonus_balance: number;
  max_bonus_out: number;
}
