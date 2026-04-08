import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.2',
    date: '2026-04-08',
    status: 'unreleased',
    changes: [
      {
        page: 'Подсказки — Демо',
        pageRoute: '/prototype/front-plugins/hints/demo',
        items: [
          'Каждое блюдо в меню теперь показывает свою уникальную подсказку с индивидуальной рекомендацией',
          'При нажатии на блюдо оно сразу добавляется в чек заказа',
        ],
      },
    ],
  },
  {
    version: '1.1',
    date: '2026-04-08',
    status: 'released',
    changes: [
      {
        page: 'Подсказки — Демо',
        pageRoute: '/prototype/front-plugins/hints/demo',
        items: [
          'Добавлен экран-имитация заказа Front с модальным окном подсказки',
          'При нажатии на блюдо в меню появляется окно допродажи с кнопками «Добавить» и «Отказаться»',
        ],
      },
      {
        page: 'Подсказки — Сравнение вариантов',
        pageRoute: '/prototype/front-plugins/hints/variants',
        items: [
          'Добавлен экран сравнения 3 дизайнов окна: «Карточка», «Баннер», «POS»',
          'Переключение между 3 наборами демо-данных (со скидкой, без картинки, комбо)',
          'Таблица сравнения критериев',
        ],
      },
      {
        items: [
          'Добавлена карточка «Digital Signage — Подсказки» на главный экран',
        ],
      },
    ],
  },
  {
    version: '1.0',
    date: '2026-02-16',
    status: 'released',
    changes: [
      {
        items: [
          'Начальная версия прототипа',
          'Макеты модальных окон плагинов Front',
        ],
      },
    ],
  },
];
