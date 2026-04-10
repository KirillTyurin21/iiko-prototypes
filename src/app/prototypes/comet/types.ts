export interface Store {
  storeId: string;
  storeName: string;
  hasYandexPayKey: boolean;
  yandexPayKeyLastUpdatedUtc?: string;
  terminalsConfigured: 'none' | 'partial' | 'full';
}

export interface Organization {
  organizationId: string;
  organizationName: string;
  stores: Store[];
}

export interface KeyDetails {
  yandexPayKey: string | null;
  lastUpdatedUtc: string | null;
  updatedByUserName: string | null;
}

export interface YpTerminal {
  terminalId: string;
  terminalName: string;
  accountKey: string | null;
  accountName: string | null;
}

export interface Account {
  key: string;
  name: string;
  active: number;
}

// --- OAuth-онбординг ---

export interface OAuthState {
  isAuthorized: boolean;
  accessToken: string | null;
  expiresAt: string | null;
  userName: string | null;
}

export interface RegistrationData {
  tax_ref_number: string;
  ogrn: string;
  kpp: string;
  legal_address: string;
  postal_address: string;
  postal_code: string;
  full_company_name: string;
  ceo_name: string;
  url: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  middle_name: string;
}

export interface Partner {
  partner_id: string;
  name: string;
  registration_data: RegistrationData;
  contact: ContactInfo;
}

export interface BankDetails {
  settlement_account: string;
  bik: string;
  correspondent_account: string;
}

export interface MerchantRegistrationRequest {
  merchant: { name: string; url: string };
  onboarding_data: { mcc: string };
  communication_contact: ContactInfo;
  bank_details: BankDetails;
  poses_count: number;
}

export interface MerchantInfo {
  merchant_id: string;
  partner_id: string;
  name: string;
  is_offline: boolean;
  enabled: boolean;
  registration_status: 'processing' | 'active' | 'failed';
  created: string;
  updated: string;
}

export interface PosInfo {
  pos_id: string;
  title: string;
  activated: boolean;
  token: string;
  qrc_id: string;
  bind_status: 'initial' | 'bound';
}

export interface MerchantStatus {
  merchant_id: string;
  registration_status: 'processing' | 'active' | 'failed';
  poses: PosInfo[];
}

export interface UserTokenInfo {
  id: string;
  merchant_id: string;
  partner_id: string;
  last_four: string;
  token_format: string;
  created_at: string;
  token_value?: string;
}

export interface MccCode {
  mcc: string;
  name: string;
}

export interface AvailableTerminal {
  terminalId: string;
  terminalName: string;
}

export interface StoreTerminals {
  storeId: string;
  storeName: string;
  terminals: AvailableTerminal[];
}

/** Запись одной торговой точки в мульти-заявке */
export interface MerchantEntry {
  storeId: string;
  name: string;
  mcc: string;
  address: string;
  selectedTerminalIds: Set<string>;
  // Банковские реквизиты
  settlementAccount: string;
  bik: string;
  corrAccount: string;
  // Контактные данные
  contactLastName: string;
  contactFirstName: string;
  contactMiddleName: string;
  contactPhone: string;
  contactEmail: string;
}

export type MerchantTokenStatus = 'none' | 'pending' | 'received' | 'error' | 'retrying';
