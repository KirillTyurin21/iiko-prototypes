export interface WbPayCredentials {
  id: string;
  storeId: string;
  storeName: string;
  terminalId: string;
  jwtToken: string;
  privateKeyPem: string;
  revision: number;
  status: 'configured' | 'not-configured' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface TerminalInfo {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  lastSeen: string;
  credentialsApplied: boolean;
  configSource: 'transport' | 'qr' | 'manual' | 'none';
}

export interface Organization {
  id: string;
  name: string;
  stores: Store[];
}

export interface Store {
  id: string;
  name: string;
  organizationId: string;
  terminals: TerminalInfo[];
  credentialsStatus: 'configured' | 'not-configured' | 'error';
}

export type PluginState = 'not-configured' | 'configured' | 'active' | 'error';

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  timestamp: string;
  failReason?: string;
  qrCode?: string;
}

export type PaymentStep =
  | 'idle'
  | 'scan-qr'
  | 'register'
  | 'do'
  | 'wait-confirmation'
  | 'polling'
  | 'succeeded'
  | 'failed';

export interface PaymentSimulation {
  step: PaymentStep;
  orderId?: string;
  amount: number;
  qrCode?: string;
  errorMessage?: string;
  failReasonCode?: string;
}

export interface CredentialInput {
  terminalId: string;
  jwtToken: string;
  privateKeyPem: string;
}

export interface ErrorMessage {
  code: string;
  text: string;
}

export const ERROR_MESSAGES: ErrorMessage[] = [
  { code: 'EXPIRED_QR_CODE', text: 'QR-код просрочен. Попросите гостя обновить QR в приложении WB' },
  { code: 'INVALID_QR_CODE', text: 'Невалидный QR-код. Попросите гостя показать новый QR' },
  { code: 'DUPLICATE_QR_CODE', text: 'QR-код уже использован. Попросите гостя обновить QR в приложении WB' },
  { code: 'NOT_ENOUGH_MONEY', text: 'Недостаточно средств в WB-кошельке' },
  { code: 'LIMIT_EXCEEDED', text: 'Сумма превышает лимит WB-кошелька' },
  { code: 'NO_AVAILABLE_PAYMENT_METHODS', text: 'У гостя не привязан способ оплаты в приложении WB' },
  { code: 'ORDER_EXPIRED', text: 'Время операции истекло. Повторите оплату' },
  { code: 'CONFIRMATION_TIME_EXPIRED', text: 'Гость не подтвердил оплату вовремя. Повторите' },
  { code: 'UNABLE_TO_PROCESS', text: 'Оплата отклонена. Попробуйте позже или выберите другой способ оплаты' },
  { code: 'NOT_FOUND', text: 'Время операции истекло. Повторите оплату' },
  { code: 'HTTP_403', text: 'Ошибка авторизации WB Pay. Обратитесь к администратору для проверки настроек плагина' },
  { code: 'TIMEOUT', text: 'Время ожидания оплаты истекло. Повторите попытку или выберите другой способ оплаты' },
];
