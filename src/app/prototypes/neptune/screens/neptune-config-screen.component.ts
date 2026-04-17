import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PLUGIN_CONFIG } from '../data/mock-data';

interface ConfigParam {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string;
  description: string;
  note?: string;
  colorPreview?: string;
}

interface ConfigGroup {
  title: string;
  icon: string;
  params: ConfigParam[];
}

@Component({
  selector: 'app-neptune-config-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="min-h-screen bg-gray-50" style="font-family: Roboto, sans-serif;">

      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-6 py-4">
          <nav class="text-sm text-gray-400 mb-2">
            <a (click)="goBack()" class="text-blue-500 hover:underline cursor-pointer">← Каталог</a>
            <span class="mx-1">/</span>
            <span class="text-gray-600">Конфигурация плагина</span>
          </nav>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <lucide-icon name="settings" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                Конфигурация плагина
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Все параметры настройки плагина Neptune из конфигурации Front.
                Значения по умолчанию указаны по спецификации.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-6xl mx-auto px-6 py-6 space-y-6">

        <div *ngFor="let group of configGroups" class="bg-white rounded-xl border border-gray-200 overflow-hidden">

          <!-- Group Header -->
          <div class="flex items-center gap-2 px-5 py-4 bg-gray-50 border-b border-gray-200">
            <lucide-icon [name]="group.icon" [size]="18" class="text-gray-500"></lucide-icon>
            <h2 class="text-base font-medium text-gray-800">{{ group.title }}</h2>
            <span class="text-xs text-gray-400 ml-1">({{ group.params.length }})</span>
          </div>

          <!-- Params table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th class="text-left px-5 py-2 font-medium">Параметр</th>
                  <th class="text-left px-3 py-2 font-medium">Тип</th>
                  <th class="text-center px-3 py-2 font-medium">Обяз.</th>
                  <th class="text-left px-3 py-2 font-medium">По умолч.</th>
                  <th class="text-left px-5 py-2 font-medium">Описание</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let param of group.params; let last = last"
                    class="hover:bg-gray-50 transition-colors"
                    [class.border-b]="!last"
                    [class.border-gray-100]="!last">
                  <td class="px-5 py-3">
                    <code class="text-sm font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{{ param.name }}</code>
                  </td>
                  <td class="px-3 py-3 text-gray-500">{{ param.type }}</td>
                  <td class="px-3 py-3 text-center">
                    <span *ngIf="param.required" class="text-red-500 font-bold">✱</span>
                    <span *ngIf="!param.required" class="text-gray-300">—</span>
                  </td>
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-2">
                      <span class="text-gray-700 font-mono text-xs">{{ param.defaultValue }}</span>
                      <span *ngIf="param.colorPreview"
                            class="inline-block w-4 h-4 rounded border border-gray-300"
                            [style.background-color]="param.colorPreview"></span>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-gray-600">
                    {{ param.description }}
                    <span *ngIf="param.note"
                          class="inline-block ml-1 px-2 py-0.5 text-xs rounded-full"
                          [ngClass]="param.note === 'Won\\'t MVP' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'">
                      {{ param.note }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <div class="flex items-center gap-2 mb-1">
            <lucide-icon name="info" [size]="16"></lucide-icon>
            <span class="font-medium">Текущая конфигурация прототипа</span>
          </div>
          <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span class="text-blue-500 text-xs">RestaurantPointId</span>
              <div class="font-mono font-semibold">{{ pluginConfig.RestaurantPointId }}</div>
            </div>
            <div>
              <span class="text-blue-500 text-xs">ComplimentaryPointId</span>
              <div class="font-mono font-semibold">{{ pluginConfig.ComplimentaryPointId }}</div>
            </div>
            <div>
              <span class="text-blue-500 text-xs">point_service_id</span>
              <div class="font-mono font-semibold">{{ pluginConfig.point_service_id }}</div>
            </div>
            <div>
              <span class="text-blue-500 text-xs">service</span>
              <div class="font-mono font-semibold">{{ pluginConfig.service }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class NeptuneConfigScreenComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pluginConfig = PLUGIN_CONFIG;

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  configGroups: ConfigGroup[] = [
    {
      title: 'Подключение к MGS',
      icon: 'monitor',
      params: [
        { name: 'server', type: 'string', required: true, defaultValue: '—', description: 'URL сервера MGS (например, https://192.168.90.19:8089)' },
        { name: 'apiKey', type: 'string', required: true, defaultValue: '—', description: 'API-ключ для аутентификации в MGS (POST /v1/auth)' },
        { name: 'terminal', type: 'string', required: true, defaultValue: '—', description: 'Идентификатор терминала (POS), передаётся в контексте операций' },
      ],
    },
    {
      title: 'Таймауты и retry',
      icon: 'clock',
      params: [
        { name: 'requestTimeout', type: 'int', required: false, defaultValue: '30', description: 'Таймаут HTTP-запроса к MGS (секунды)' },
        { name: 'retryCount', type: 'int', required: false, defaultValue: '3', description: 'Количество повторных попыток при сетевой ошибке' },
        { name: 'retryInterval', type: 'int', required: false, defaultValue: '2', description: 'Интервал между повторными попытками (секунды)' },
      ],
    },
    {
      title: 'Роли — доступ к функциям',
      icon: 'key-round',
      params: [
        { name: 'card_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли Front, которым разрешена идентификация гостя. Несколько ролей через "|"' },
        { name: 'use_cashless_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым разрешена оплата кэш-поинтами' },
        { name: 'use_loyalty_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым разрешена оплата баллами лояльности' },
        { name: 'use_comp_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым разрешена оплата комплиментарными баллами' },
        { name: 'show_all_guests_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым разрешён просмотр списка гостей в казино' },
        { name: 'return_cashless_role', type: 'string', required: false, defaultValue: '(все)', description: 'Возврат кэш-поинтов — через систему заявок', note: "Won't MVP" },
        { name: 'return_loyalty_role', type: 'string', required: false, defaultValue: '(все)', description: 'Возврат баллов лояльности — через систему заявок', note: "Won't MVP" },
      ],
    },
    {
      title: 'Роли — видимость данных гостя',
      icon: 'eye',
      params: [
        { name: 'show_id_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым видны идентификационные данные (customer_id)' },
        { name: 'show_card_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым виден номер карты' },
        { name: 'show_fio_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым видны ФИО гостя' },
        { name: 'show_preferred_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли для preferred guest', note: 'Уточнение' },
        { name: 'show_age_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли для возраста (вычисляется из birthday)' },
        { name: 'show_gender_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли для пола гостя', note: 'Уточнение' },
        { name: 'show_birthday_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым видна дата рождения' },
        { name: 'show_state_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым виден статус лояльности' },
        { name: 'show_photo_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым видно фото гостя' },
        { name: 'show_cashless_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым виден баланс кэш-поинтов' },
        { name: 'show_loyalty_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым виден баланс баллов лояльности' },
        { name: 'show_comp_role', type: 'string', required: false, defaultValue: '(все)', description: 'Роли, которым виден баланс комплиментарных баллов' },
      ],
    },
    {
      title: 'Тексты кнопок и визуальное оформление',
      icon: 'palette',
      params: [
        { name: 'cashless_button', type: 'string', required: false, defaultValue: 'Безналичная оплата', description: 'Текст кнопки оплаты кэш-поинтами' },
        { name: 'loyalty_button', type: 'string', required: false, defaultValue: 'Списать баллы лояльности', description: 'Текст кнопки оплаты баллами лояльности' },
        { name: 'comp_button', type: 'string', required: false, defaultValue: 'Списать комплиментарные', description: 'Текст кнопки оплаты комплиментарными баллами' },
        { name: 'cashless_button_background', type: 'string', required: false, defaultValue: '#ffffff', description: 'Цвет фона кнопки кэш-поинтов (HEX)', colorPreview: '#ffffff' },
        { name: 'cashless_button_foreground', type: 'string', required: false, defaultValue: '#000000', description: 'Цвет текста кнопки кэш-поинтов (HEX)', colorPreview: '#000000' },
        { name: 'loyalty_button_background', type: 'string', required: false, defaultValue: '#ffffff', description: 'Цвет фона кнопки лояльности (HEX)', colorPreview: '#ffffff' },
        { name: 'loyalty_button_foreground', type: 'string', required: false, defaultValue: '#000000', description: 'Цвет текста кнопки лояльности (HEX)', colorPreview: '#000000' },
        { name: 'comp_button_background', type: 'string', required: false, defaultValue: '#ffffff', description: 'Цвет фона кнопки комплиментарных (HEX)', colorPreview: '#ffffff' },
        { name: 'comp_button_foreground', type: 'string', required: false, defaultValue: '#000000', description: 'Цвет текста кнопки комплиментарных (HEX)', colorPreview: '#000000' },
      ],
    },
    {
      title: 'Размеры и расположение UI',
      icon: 'sliders',
      params: [
        { name: 'window_height_percent', type: 'int', required: false, defaultValue: '80', description: 'Высота окна профиля гостя (% от экрана)' },
        { name: 'window_width_percent', type: 'int', required: false, defaultValue: '80', description: 'Ширина окна профиля гостя (% от экрана)' },
        { name: 'list_window_height_percent', type: 'int', required: false, defaultValue: '80', description: 'Высота окна списка гостей (% от экрана)' },
        { name: 'list_window_width_percent', type: 'int', required: false, defaultValue: '80', description: 'Ширина окна списка гостей (% от экрана)' },
        { name: 'title_font_size', type: 'int', required: false, defaultValue: '16', description: 'Размер шрифта заголовков (pt)' },
        { name: 'font_size', type: 'int', required: false, defaultValue: '24', description: 'Размер основного шрифта (pt)' },
        { name: 'X', type: 'int', required: false, defaultValue: '0', description: 'Координата X панели кнопок (px)' },
        { name: 'Y', type: 'int', required: false, defaultValue: '0', description: 'Координата Y панели кнопок (px)' },
        { name: 'Height', type: 'int', required: false, defaultValue: '0', description: 'Высота панели кнопок (px). 0 = авторазмер' },
        { name: 'Width', type: 'int', required: false, defaultValue: '0', description: 'Ширина панели кнопок (px). 0 = авторазмер' },
      ],
    },
    {
      title: 'Фильтрация категорий',
      icon: 'list',
      params: [
        { name: 'category_list', type: 'ArrayOfString', required: false, defaultValue: '—', description: 'Список категорий позиций меню для фильтрации оплаты' },
        { name: 'category_type', type: 'int', required: false, defaultValue: '0', description: 'Режим фильтрации: 0 = allowed (разрешённые), 1 = restricted (запрещённые)' },
      ],
    },
    {
      title: 'Печать',
      icon: 'printer',
      params: [
        { name: 'precheque_text', type: 'ArrayOfString', required: false, defaultValue: '—', description: 'Шаблон пречека. Переменная: {result_sum}. {discount_percent}, {discount_sum} — недоступны в MVP' },
      ],
    },
    {
      title: 'MGS-специфичные параметры',
      icon: 'database',
      params: [
        { name: 'point_service_id', type: 'int', required: true, defaultValue: '—', description: 'ID сервиса для ресторанного списания баллов', note: 'Уточнение' },
        { name: 'RestaurantPointId', type: 'int', required: false, defaultValue: '4', description: 'ID типа баллов «Ресторан» в MGS' },
        { name: 'ComplimentaryPointId', type: 'int', required: false, defaultValue: '0', description: 'ID типа баллов «Complimentary» в MGS' },
        { name: 'hospitality_item', type: 'int', required: false, defaultValue: '2', description: 'Идентификатор объекта (ресторана) в MGS' },
      ],
    },
    {
      title: 'Служебные',
      icon: 'settings',
      params: [
        { name: 'log_level', type: 'int', required: false, defaultValue: '0', description: 'Уровень логирования: 0 = мин., 1 = подробный, 2 = отладочный' },
      ],
    },
  ];
}
