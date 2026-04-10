import { Organization, Account, YpTerminal, Partner, MerchantInfo, MerchantStatus, UserTokenInfo, MccCode, OAuthState, AvailableTerminal, StoreTerminals } from '../types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    organizationId: '1',
    organizationName: 'ООО "Ресторанная группа Север"',
    stores: [
      { storeId: '101', storeName: 'Ресторан "Премьер"', hasYandexPayKey: true, terminalsConfigured: 'partial' },
      { storeId: '102', storeName: 'Кафе "Уют"', hasYandexPayKey: false, terminalsConfigured: 'none' },
      { storeId: '103', storeName: 'Бар "Огонёк"', hasYandexPayKey: false, terminalsConfigured: 'none' },
    ],
  },
  {
    organizationId: '2',
    organizationName: 'ИП Иванов А.В.',
    stores: [
      { storeId: '201', storeName: 'Пиццерия "Капричоза"', hasYandexPayKey: false, terminalsConfigured: 'none' },
      { storeId: '202', storeName: 'Суши-бар "Токио"', hasYandexPayKey: true, terminalsConfigured: 'full' },
    ],
  },
  {
    organizationId: '3',
    organizationName: 'ООО "Быстрое питание"',
    stores: [
      { storeId: '301', storeName: 'Кофе-поинт "ЦУМ"', hasYandexPayKey: true, terminalsConfigured: 'none' },
      { storeId: '302', storeName: 'Бургерная №2', hasYandexPayKey: false, terminalsConfigured: 'none' },
      { storeId: '303', storeName: 'Бургерная №3', hasYandexPayKey: true, terminalsConfigured: 'full' },
    ],
  },
];

export const MOCK_ACCOUNTS: Account[] = [
  { key: 'BS1F00733B8T64BE8O1BT9CA8VLKIH69', name: 'QR табличка - ID 00095', active: 1 },
  { key: 'AS1R000RK04U6NRV8F1O5SRIRTJAHAHR', name: 'QR табличка - ID 35126', active: 1 },
  { key: 'CS1T001AB02C3DE4FG5H6IJ7KL8MN9OP', name: 'QR табличка - ID 48302', active: 1 },
];

export function getMockTerminals(storeId: string): YpTerminal[] {
  const storeData = MOCK_STORE_TERMINALS.find(s => s.storeId === storeId);
  if (!storeData) {
    return [
      {
        terminalId: 't1',
        terminalName: 'Касса 1',
        accountKey: 'BS1F00733B8T64BE8O1BT9CA8VLKIH69',
        accountName: 'QR табличка - ID 00095',
      },
      { terminalId: 't2', terminalName: 'Касса 2', accountKey: null, accountName: null },
      {
        terminalId: 't3',
        terminalName: 'Касса 3',
        accountKey: 'AS1R000RK04U6NRV8F1O5SRIRTJAHAHR',
        accountName: 'QR табличка - ID 35126',
      },
    ];
  }
  return storeData.terminals.map(t => ({
    terminalId: t.terminalId,
    terminalName: t.terminalName,
    accountKey: null,
    accountName: null,
  }));
}

export function getMockDefaultAccountKey(storeId: string): string | null {
  return storeId === '301' ? 'BS1F00733B8T64BE8O1BT9CA8VLKIH69' : null;
}

// --- OAuth-онбординг: мок-данные ---

export const MOCK_OAUTH_STATE: OAuthState = {
  isAuthorized: false,
  accessToken: null,
  expiresAt: null,
  userName: null,
};

export const MOCK_PARTNERS: Partner[] = [
  {
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'ООО Ромашка',
    registration_data: {
      tax_ref_number: '7707083893',
      ogrn: '1027700132195',
      kpp: '770701001',
      legal_address: '119021, г. Москва, ул. Льва Толстого, д. 16',
      postal_address: '119021, г. Москва, ул. Льва Толстого, д. 16',
      postal_code: '119021',
      full_company_name: 'Общество с ограниченной ответственностью Ромашка',
      ceo_name: 'Иванов Иван Иванович',
      url: 'http://romashka.ru',
    },
    contact: {
      email: 'merchant@romashka.ru',
      phone: '+79001234567',
      first_name: 'Иван',
      last_name: 'Иванов',
      middle_name: 'Иванович',
    },
  },
];

export const MOCK_MERCHANTS: MerchantInfo[] = [
  {
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0001',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'Ресторан "Премьер"',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-18T10:30:00Z',
    updated: '2026-03-19T14:00:00Z',
    storeId: '101',
    terminalIds: ['st101-t1', 'st101-t2', 'st101-t3'],
  },
  {
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0002',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'Кафе "Уют"',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: '2026-03-19T09:00:00Z',
    updated: '2026-03-19T09:00:00Z',
    storeId: '102',
    terminalIds: ['st102-t3', 'st102-t4'],
  },
  {
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0003',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'Бар "Огонёк"',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-17T11:00:00Z',
    updated: '2026-03-18T08:30:00Z',
    storeId: '103',
    terminalIds: ['st103-t1'],
  },
];

export const MOCK_MERCHANT_STATUS: MerchantStatus = {
  merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0001',
  registration_status: 'active',
  poses: [
    {
      pos_id: '2697c7ff-1111-2222-3333-444455556666',
      title: 'Касса #1',
      activated: true,
      token: 'ut_a1b2c3d4e5f6g7h8',
      qrc_id: 'qrc_12345',
      bind_status: 'bound',
    },
  ],
};

export const MOCK_USER_TOKENS: UserTokenInfo[] = [
  {
    id: 'tok-1111-2222-3333-444455556666',
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0001',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    last_four: 'g7h8',
    token_format: 'YANDEX_PAY',
    created_at: '2026-03-19T12:00:00Z',
  },
];

export const MOCK_MCC_CODES: MccCode[] = [
  { slug: 'eat_restaurant', name: 'Рестораны' },
  { slug: 'eat_bar', name: 'Бары и ночные клубы' },
  { slug: 'eat_fastfood', name: 'Фастфуд' },
  { slug: 'beauty_salon', name: 'Парикмахерские и косметические услуги' },
  { slug: 'health_spa', name: 'Оздоровительные и спа-услуги' },
];

export const MOCK_AVAILABLE_TERMINALS: AvailableTerminal[] = [
  { terminalId: 'avail-t1', terminalName: 'Касса 1 (бар)' },
  { terminalId: 'avail-t2', terminalName: 'Касса 2 (зал)' },
  { terminalId: 'avail-t3', terminalName: 'Касса 3 (терраса)' },
  { terminalId: 'avail-t4', terminalName: 'Касса 4 (самовывоз)' },
];

/** Терминалы по торговым точкам (для формы заявки) */
export const MOCK_STORE_TERMINALS: StoreTerminals[] = [
  {
    storeId: '101', storeName: 'Ресторан "Премьер"', address: 'г. Москва, ул. Тверская, д. 12',
    terminals: [
      { terminalId: 'st101-t1', terminalName: 'Касса 1 (бар)' },
      { terminalId: 'st101-t2', terminalName: 'Касса 2 (зал)' },
      { terminalId: 'st101-t3', terminalName: 'Касса 3 (терраса)' },
      { terminalId: 'st101-t4', terminalName: 'Касса 4 (банкетный)' },
      { terminalId: 'st101-t5', terminalName: 'Касса 5 (VIP-зал)' },
    ],
  },
  {
    storeId: '102', storeName: 'Кафе "Уют"', address: 'г. Москва, ул. Арбат, д. 28',
    terminals: [
      { terminalId: 'st102-t1', terminalName: 'Касса 1 (зал)', isConnected: true, connectedDate: '15.03.2026' },
      { terminalId: 'st102-t2', terminalName: 'Касса 2 (веранда)', isConnected: true, connectedDate: '15.03.2026' },
      { terminalId: 'st102-t3', terminalName: 'Касса 3 (бар)' },
      { terminalId: 'st102-t4', terminalName: 'Касса 4 (доставка)' },
      { terminalId: 'st102-t5', terminalName: 'Касса 5 (самовывоз)' },
      { terminalId: 'st102-t6', terminalName: 'Касса 6 (резерв)' },
    ],
  },
  {
    storeId: '103', storeName: 'Бар "Огонёк"', address: 'г. Москва, ул. Пятницкая, д. 3',
    terminals: [
      { terminalId: 'st103-t1', terminalName: 'Касса 1 (барная)' },
    ],
  },
  {
    storeId: '201', storeName: 'Пиццерия "Капричоза"', address: 'г. Санкт-Петербург, Невский пр., д. 44',
    terminals: [
      { terminalId: 'st201-t1', terminalName: 'Касса 1' },
      { terminalId: 'st201-t2', terminalName: 'Касса 2 (доставка)' },
    ],
  },
  {
    storeId: '202', storeName: 'Суши-бар "Токио"', address: 'г. Санкт-Петербург, ул. Рубинштейна, д. 15',
    terminals: [
      { terminalId: 'st202-t1', terminalName: 'Касса 1 (зал)' },
      { terminalId: 'st202-t2', terminalName: 'Касса 2 (самовывоз)' },
    ],
  },
  {
    storeId: '301', storeName: 'Кофе-поинт "ЦУМ"', address: 'г. Москва, ул. Петровка, д. 2',
    terminals: [
      { terminalId: 'st301-t1', terminalName: 'Касса 1 (1 этаж)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t2', terminalName: 'Касса 2 (1 этаж)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t3', terminalName: 'Касса 3 (2 этаж)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t4', terminalName: 'Касса 4 (2 этаж)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t5', terminalName: 'Касса 5 (3 этаж)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t6', terminalName: 'Касса 6 (3 этаж)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t7', terminalName: 'Касса 7 (фудкорт)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t8', terminalName: 'Касса 8 (фудкорт)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t9', terminalName: 'Касса 9 (летняя)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t10', terminalName: 'Касса 10 (доставка)', isConnected: true, connectedDate: '01.03.2026' },
      { terminalId: 'st301-t11', terminalName: 'Касса 11 (подвал)' },
      { terminalId: 'st301-t12', terminalName: 'Касса 12 (мероприятия)' },
      { terminalId: 'st301-t13', terminalName: 'Касса 13 (VIP)' },
      { terminalId: 'st301-t14', terminalName: 'Касса 14 (резерв)' },
    ],
  },
  {
    storeId: '302', storeName: 'Бургерная №2', address: 'г. Москва, Цветной бул., д. 19',
    terminals: [
      { terminalId: 'st302-t1', terminalName: 'Касса 1' },
      { terminalId: 'st302-t2', terminalName: 'Касса 2' },
    ],
  },
  {
    storeId: '303', storeName: 'Бургерная №3', address: 'г. Москва, ул. Маросейка, д. 7',
    terminals: [
      { terminalId: 'st303-t1', terminalName: 'Касса 1' },
      { terminalId: 'st303-t2', terminalName: 'Касса 2 (летняя)' },
      { terminalId: 'st303-t3', terminalName: 'Касса 3 (фудкорт)' },
    ],
  },
];
