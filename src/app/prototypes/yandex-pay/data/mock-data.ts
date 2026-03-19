import { Organization, Account, YpTerminal } from '../types';

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
