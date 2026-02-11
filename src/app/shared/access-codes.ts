/**
 * Конфигурация кодов доступа к прототипам.
 *
 * Уровни доступа:
 * 1. Мастер-код — открывает ВСЁ (список + все прототипы). Для команды.
 * 2. Групповой код — открывает группу прототипов (для клиента с несколькими заказами).
 * 3. Код прототипа — открывает один конкретный прототип.
 *
 * Мастер-код также открывает список прототипов.
 */

export interface PrototypeAccessEntry {
  /** Индивидуальный код доступа к прототипу */
  code: string;
  /** Время жизни кода в днях */
  ttlDays: number;
}

export interface GroupAccessEntry {
  /** Код доступа к группе */
  code: string;
  /** Время жизни кода в днях */
  ttlDays: number;
  /** Slug-пути прототипов в группе (без /prototype/ префикса) */
  prototypeSlugs: string[];
  /** Название группы (для отображения) */
  label: string;
}

export interface AccessConfig {
  /** Мастер-код: открывает ВСЁ */
  masterCode: string;
  /** TTL мастер-кода в днях */
  masterTtlDays: number;
  /** Групповые коды доступа */
  groups: GroupAccessEntry[];
  /** Индивидуальные коды прототипов (ключ = slug, напр. 'front-pudu-plugin') */
  prototypes: Record<string, PrototypeAccessEntry>;
}

export const ACCESS_CONFIG: AccessConfig = {
  masterCode: 'TEAM_2026',
  masterTtlDays: 30,

  groups: [
    {
      code: 'PUDU_GROUP_2026',
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
      code: 'PUDU_FRONT_2026',
      ttlDays: 7,
    },
    'pudu-admin': {
      code: 'PUDU_ADMIN_2026',
      ttlDays: 7,
    },
    'front-plugins': {
      code: 'FRONT_PLUGINS_2026',
      ttlDays: 7,
    },
    'web-screens': {
      code: 'WEB_SCREENS_2026',
      ttlDays: 7,
    },
    'demo': {
      code: 'DEMO_2026',
      ttlDays: 7,
    },
  },
};
