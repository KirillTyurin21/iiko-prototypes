import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.3',
    date: '2026-06-05',
    status: 'unreleased',
    changes: [
      {
        page: 'Плагин Front — Оплата',
        pageRoute: '/prototype/wb-pay/plugin/payment',
        items: [
          'API-вызовы приведены к спецификации: добавлен префикс /api/v1/',
          'Добавлен шаг SetRollbackData после регистрации оплаты (шаг 7 по спецификации)',
          'SDK-вызовы (SetRollbackData) выделены отдельным цветом в API-логе',
          'Исправлена иконка статуса успешной оплаты',
        ],
      },
      {
        page: 'Плагин Front — Возврат',
        pageRoute: '/prototype/wb-pay/plugin/refund',
        items: [
          'GetRollbackData отображается как SDK-вызов (не HTTP-запрос) согласно спецификации',
          'API-вызовы возврата приведены к спецификации: /api/v1/refunds/*',
        ],
      },
      {
        page: 'Плагин Front — Фискальная ошибка',
        pageRoute: '/prototype/wb-pay/plugin/fiscal-error',
        items: [
          'EmergencyCancelPayment() отображается как SDK-вызов согласно спецификации',
          'Добавлены шаги SetRollbackData и GetRollbackData в API-лог',
          'API-вызовы приведены к спецификации: /api/v1/* префикс',
        ],
      },
      {
        items: [
          'Добавлены недостающие коды ошибок: NO_AVAILABLE_PAYMENT_METHODS, ORDER_EXPIRED, UNABLE_TO_PROCESS, NOT_FOUND',
          'Тексты ошибок HTTP_403 и TIMEOUT приведены в соответствие со спецификацией',
        ],
      },
    ],
  },
  {
    version: '1.2',
    date: '2026-06-05',
    status: 'unreleased',
    changes: [
      {
        page: 'Плагин Front — Оплата',
        pageRoute: '/prototype/wb-pay/plugin/payment',
        items: [
          'Все диалоговые окна плагина адаптированы под стилистику окон Front',
          'Добавлен POS-диалог ожидания оплаты с прогресс-баром и спиннером',
          'Добавлен POS-диалог успешной оплаты с иконкой подтверждения',
          'Добавлен POS-диалог ошибки оплаты с возможностью повторной попытки',
          'QR-диалог переоформлен в стиле Front-плагина',
        ],
      },
      {
        page: 'Плагин Front — Фискальная ошибка',
        pageRoute: '/prototype/wb-pay/plugin/fiscal-error',
        items: [
          'Добавлен POS-диалог ошибки фискального регистратора с индикатором прогресса',
          'Добавлен POS-диалог «Повторите оплату» — сообщение кассиру при завершении возврата',
        ],
      },
      {
        page: 'Плагин Front — Возврат',
        pageRoute: '/prototype/wb-pay/plugin/refund',
        items: [
          'Добавлен POS-диалог успешного возврата с информацией о сумме',
          'Добавлен POS-диалог ошибки возврата',
        ],
      },
      {
        page: 'Плагин Front — Настройка',
        pageRoute: '/prototype/wb-pay/plugin/setup',
        items: [
          'QR-диалог сканирования переоформлен в стиле Front-плагина',
        ],
      },
    ],
  },
  {
    version: '1.1',
    date: '2026-04-27',
    status: 'unreleased',
    changes: [
      {
        page: 'Панель Web',
        pageRoute: '/prototype/wb-pay/admin',
        items: [
          'Стилистика панели администрирования приведена к единому стилю с другими админ-панелями',
          'Заменены UI-карточки на нативный split-panel layout (дерево + детали)',
          'Обновлена цветовая схема: кнопки, фокусы и выделения в нейтральном стиле',
          'Дерево организаций: улучшен стиль выделения активного ресторана',
          'Форма credentials встроена напрямую (без отдельного компонента)',
        ],
      },
    ],
  },
  {
    version: '1.0',
    date: '2026-06-05',
    status: 'unreleased',
    changes: [
      {
        items: [
          'Создан прототип WB Pay: плагин оплаты WB-кошельком (Front) + панель управления credentials (Web)',
        ],
      },
      {
        page: 'Обзор',
        pageRoute: '/prototype/wb-pay',
        items: [
          'Дашборд с обзором обеих систем и схемой взаимодействия',
          'Переключатель режимов: Обзор / Плагин Front / Панель Web',
        ],
      },
      {
        page: 'Плагин — Оплата',
        pageRoute: '/prototype/wb-pay/plugin/payment',
        items: [
          'Пошаговая имитация процесса оплаты (7 шагов)',
          'Диалог сканирования QR-кода в стиле POS-терминала',
          'Выбор результата: успех или ошибка (8 кодов ошибок из спецификации)',
          'Лог API-вызовов в реальном времени',
        ],
      },
      {
        page: 'Плагин — Возврат',
        pageRoute: '/prototype/wb-pay/plugin/refund',
        items: [
          'Список оплаченных заказов для возврата',
          'Пошаговая имитация процесса возврата (5 шагов)',
        ],
      },
      {
        page: 'Плагин — FISCAL_ERROR',
        pageRoute: '/prototype/wb-pay/plugin/fiscal-error',
        items: [
          'Имитация нештатного сценария: оплата прошла, но ФР не напечатал чек',
          'Автоматический экстренный возврат (EmergencyCancelPayment)',
        ],
      },
      {
        page: 'Плагин — Настройка',
        pageRoute: '/prototype/wb-pay/plugin/setup',
        items: [
          'Три канала настройки: Transport push, QR-проливка, ручная настройка',
          'Связь с Web-панелью: credentials синхронизируются автоматически',
        ],
      },
      {
        page: 'Панель Web',
        pageRoute: '/prototype/wb-pay/admin',
        items: [
          'Дерево организаций с цветовыми индикаторами статуса',
          'Форма ввода credentials (terminal_id, JWT, PEM) с валидацией',
          'Генерация QR-кода настройки для терминалов',
          'Удаление credentials с подтверждением',
        ],
      },
    ],
  },
];
