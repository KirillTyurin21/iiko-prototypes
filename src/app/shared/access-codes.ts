/**
 * Конфигурация кодов доступа к прототипам.
 *
 * ВАЖНО: все коды хранятся как SHA-256 хеши (lowercase hex).
 * Открытый текст кодов НЕ присутствует в JS-бандле.
 *
 * Уровни доступа:
 * 1. Мастер-код — открывает ВСЁ (список + все прототипы). Для команды.
 * 2. Групповой код — открывает группу прототипов (для клиента с несколькими заказами).
 * 3. Код прототипа — открывает один конкретный прототип.
 *
 * Мастер-код также открывает список прототипов.
 */

export interface PrototypeAccessEntry {
  /** SHA-256 hex hash кода доступа (lowercase) */
  codeHash: string;
  /** Время жизни кода в днях */
  ttlDays: number;
}

export interface GroupAccessEntry {
  /** SHA-256 hex hash кода доступа (lowercase) */
  codeHash: string;
  /** Время жизни кода в днях */
  ttlDays: number;
  /** Slug-пути прототипов в группе (без /prototype/ префикса) */
  prototypeSlugs: string[];
  /** Название группы (для отображения) */
  label: string;
}

export interface AccessConfig {
  /** SHA-256 hex hash мастер-кода */
  masterCodeHash: string;
  /** TTL мастер-кода в днях */
  masterTtlDays: number;
  /** Групповые коды доступа */
  groups: GroupAccessEntry[];
  /** Индивидуальные коды прототипов (ключ = slug, напр. 'front-pudu-plugin') */
  prototypes: Record<string, PrototypeAccessEntry>;
}

/**
 * Версия конфигурации кодов. При смене кодов увеличивайте версию —
 * это автоматически инвалидирует все ранее сохранённые сессии.
 */
export const ACCESS_CONFIG_VERSION = 5;

export const ACCESS_CONFIG: AccessConfig = {
  masterCodeHash: '956c0708918739a70f1950b71877726b5d3ab8a92d475ecd61dd51e6bd527beb',
  masterTtlDays: 30,

  groups: [
    {
      codeHash: '5282dec2b362ca3f1d9e0808ee2124fbbcf1ccd1e13235d0c1ff17418f191ee9',
      ttlDays: 7,
      label: 'Pudu — Все прототипы',
      prototypeSlugs: [
        'front-pudu-plugin',
        'pudu-admin',
      ],
    },
  ],

  prototypes: {
    'front-pudu-plugin': {
      codeHash: '089de25a9aaa8dedf94f2093372b580ec87dfa146337bcea8df36e718bcabd35',
      ttlDays: 7,
    },
    'pudu-admin': {
      codeHash: '246bed3dc54bf9691138b55df5200109357e6a0c88876aa124148324d62dfc41',
      ttlDays: 7,
    },
    'front-plugins': {
      codeHash: '9e5e6859b45d71cefa8ed5d5fc02dc44714de9d30aacef18009c3e2c4ab4de8c',
      ttlDays: 7,
    },
    'web-screens': {
      codeHash: 'a4448aecceadabda967a5edc8f184fd5d3c7f3298273808ec2190954348ff3b7',
      ttlDays: 7,
    },
    'demo': {
      codeHash: '5561baf88a1aa7b12e64dc103ff2e1274d51998331ea3dc892a21b36f326017f',
      ttlDays: 7,
    },
    'mgs-casino': {
      codeHash: 'e9a41f981cb92678b62ac7aeb2287677ee2241d2b19e0f98d932beb8f44a4a88',
      ttlDays: 7,
    },
  },
};
