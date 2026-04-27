import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
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
