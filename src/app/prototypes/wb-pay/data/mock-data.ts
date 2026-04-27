import { Organization, WbPayCredentials, PaymentRecord } from '../types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Ресторанная группа «Восток»',
    stores: [
      {
        id: 'store-1',
        name: 'Пицца Маргарита',
        organizationId: 'org-1',
        credentialsStatus: 'configured',
        terminals: [
          {
            id: 'term-1',
            name: 'Касса 1',
            storeId: 'store-1',
            storeName: 'Пицца Маргарита',
            lastSeen: '2026-04-27T11:30:00Z',
            credentialsApplied: true,
            configSource: 'transport',
          },
          {
            id: 'term-2',
            name: 'Касса 2',
            storeId: 'store-1',
            storeName: 'Пицца Маргарита',
            lastSeen: '2026-04-27T10:15:00Z',
            credentialsApplied: true,
            configSource: 'transport',
          },
        ],
      },
      {
        id: 'store-2',
        name: 'Суши Сакура',
        organizationId: 'org-1',
        credentialsStatus: 'not-configured',
        terminals: [
          {
            id: 'term-3',
            name: 'Касса 1',
            storeId: 'store-2',
            storeName: 'Суши Сакура',
            lastSeen: '2026-04-27T09:00:00Z',
            credentialsApplied: false,
            configSource: 'none',
          },
        ],
      },
      {
        id: 'store-3',
        name: 'Бургер Хаус',
        organizationId: 'org-1',
        credentialsStatus: 'not-configured',
        terminals: [
          {
            id: 'term-4',
            name: 'Касса 1',
            storeId: 'store-3',
            storeName: 'Бургер Хаус',
            lastSeen: '2026-04-26T18:00:00Z',
            credentialsApplied: false,
            configSource: 'none',
          },
        ],
      },
    ],
  },
];

export const MOCK_CREDENTIALS: WbPayCredentials[] = [
  {
    id: 'cred-1',
    storeId: 'store-1',
    storeName: 'Пицца Маргарита',
    terminalId: 'abc-123-def-456-ghi-789',
    jwtToken: 'eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dGVzdC1zaWduYXR1cmU',
    privateKeyPem: '-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJlr0WqPJBp3AMzrNd6Oo1PF\nbc9a1x2y3z4w5v6u7t8s9r0q\n-----END PRIVATE KEY-----',
    revision: 1714200000000,
    status: 'configured',
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
  },
];

export const MOCK_PAYMENT_HISTORY: PaymentRecord[] = [
  {
    id: 'pay-1',
    orderId: 'wb-order-a1b2c3',
    amount: 1500,
    status: 'succeeded',
    timestamp: '2026-04-27T12:01:11Z',
    qrCode: 'wb_pay_qr_a1b2c3d4e5f6',
  },
  {
    id: 'pay-2',
    orderId: 'wb-order-d4e5f6',
    amount: 850,
    status: 'succeeded',
    timestamp: '2026-04-27T11:45:00Z',
    qrCode: 'wb_pay_qr_g7h8i9j0k1l2',
  },
  {
    id: 'pay-3',
    orderId: 'wb-order-m3n4o5',
    amount: 2200,
    status: 'refunded',
    timestamp: '2026-04-27T10:30:00Z',
    qrCode: 'wb_pay_qr_m3n4o5p6q7r8',
  },
];
