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
