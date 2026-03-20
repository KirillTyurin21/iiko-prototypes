import { Organization, Account, YpTerminal, Partner, MerchantInfo, MerchantStatus, UserTokenInfo, MccCode, OAuthState } from '../types';

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
      { storeId: '301', storeName: 'Бургерная №1', hasYandexPayKey: true, terminalsConfigured: 'none' },
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
  if (storeId === '301') {
    return [];
  }
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
    name: 'Ресторан Ромашка на Тверской',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-18T10:30:00Z',
    updated: '2026-03-19T14:00:00Z',
  },
  {
    merchant_id: '500924a8-aaaa-bbbb-cccc-ddddeeee0002',
    partner_id: '6a3a39f6-1111-2222-3333-444455556666',
    name: 'Ресторан Ромашка на Арбате',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: '2026-03-19T09:00:00Z',
    updated: '2026-03-19T09:00:00Z',
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
  { mcc: '5812', name: 'Рестораны' },
  { mcc: '5813', name: 'Бары и ночные клубы' },
  { mcc: '5814', name: 'Фастфуд' },
  { mcc: '7230', name: 'Парикмахерские и косметические услуги' },
  { mcc: '7298', name: 'Оздоровительные и спа-услуги' },
];
