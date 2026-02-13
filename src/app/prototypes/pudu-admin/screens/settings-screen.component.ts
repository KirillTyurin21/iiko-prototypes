import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UiButtonComponent,
  UiTabsComponent,
  UiInputComponent,
  UiSelectComponent,
  UiCheckboxComponent,
  UiConfirmDialogComponent,
} from '@/components/ui';
import type { TabItem, SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { ScenarioSettings, Robot, PhraseWithTimer } from '../types';
import { MOCK_ROBOTS, getInitialSettings } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';

@Component({
  selector: 'app-settings-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiTabsComponent,
    UiInputComponent,
    UiSelectComponent,
    UiCheckboxComponent,
    UiConfirmDialogComponent,
    IconsModule,
  ],
  host: {
    style: 'display: flex; flex-direction: column; flex: 1; overflow: hidden;',
  },
  template: `
    <!-- Loading state -->
    <div *ngIf="loading" class="flex-1 flex items-center justify-center">
      <lucide-icon name="loader-2" [size]="32" class="animate-spin text-app-primary"></lucide-icon>
    </div>

    <!-- No robots state -->
    <div *ngIf="!loading && robots.length === 0" class="flex-1 flex items-center justify-center">
      <p class="text-gray-500 text-sm">Зарегистрируйте робота для настройки параметров</p>
    </div>

    <!-- Content -->
    <ng-container *ngIf="!loading && robots.length > 0">
      <!-- Header -->
      <div class="px-6 pt-5 pb-4">
        <h1 class="text-xl font-semibold text-gray-900">Настройки роботов</h1>
      </div>

      <!-- Tabs -->
      <div class="px-6">
        <ui-tabs [tabs]="tabItems" [activeTab]="activeTab" (tabChange)="onTabChange($event)"></ui-tabs>
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="max-w-2xl space-y-6 animate-fade-in">

          <!-- ============================================ -->
          <!-- TAB 1: Доставка меню (send_menu) — C4        -->
          <!-- ============================================ -->
          <ng-container *ngIf="activeTab === 'send_menu'">

            <!-- Секция 1: Фраза у стола -->
            <h3 class="text-base font-semibold text-gray-900">Фраза у стола</h3>

            <!-- 1. Фраза робота при доставке -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза робота при доставке</label>
              <ui-input
                [(value)]="settings.send_menu.phrase"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.send_menu.phrase)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза, которую робот произнесёт у стола. Максимум 180 символов</span>
                <span class="text-xs" [ngClass]="settings.send_menu.phrase.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.send_menu.phrase.length }} / 180
                </span>
              </div>
              <p *ngIf="phraseChangedRecently" class="text-xs text-orange-500 mt-1">Следующее изменение фразы доступно через 23:45</p>
            </div>

            <!-- 2. URL видео/аудио для фразы при доставке -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио для фразы при доставке</label>
              <ui-input
                [(value)]="sendMenuPhraseUrl"
                placeholder="https://example.com/audio.mp3"
              ></ui-input>
              <p class="text-xs text-gray-400 mt-1">Ссылка на mp4-видео или mp3-аудио. Если указано, робот воспроизведёт файл вместо синтезированной речи</p>
            </div>

            <!-- 5. Время ожидания у стола -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания у стола (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.send_menu.wait_time"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
                max="600"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает у стола</p>
            </div>

            <hr class="border-t border-gray-200" />

            <!-- Секция 2: Фраза на станции выдачи (pickup) -->
            <h3 class="text-base font-semibold text-gray-900">Фраза на станции выдачи (pickup)</h3>

            <!-- 3. Фраза при заборе меню (pickup-точка) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при заборе меню (pickup-точка)</label>
              <ui-input
                [(value)]="settings.send_menu.phrase_pickup"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.send_menu.phrase_pickup)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза робота на станции выдачи. Подстановка &#123;N&#125; — номер стола</span>
                <span class="text-xs" [ngClass]="settings.send_menu.phrase_pickup.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.send_menu.phrase_pickup.length }} / 180
                </span>
              </div>
              <p *ngIf="phraseChangedRecently" class="text-xs text-orange-500 mt-1">Следующее изменение фразы доступно через 23:45</p>
            </div>

            <!-- 4. URL видео/аудио для фразы при заборе -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио для фразы при заборе</label>
              <ui-input
                [(value)]="sendMenuPhrasePickupUrl"
                placeholder="https://example.com/audio.mp3"
              ></ui-input>
              <p class="text-xs text-gray-400 mt-1">Ссылка на mp4-видео или mp3-аудио для фразы при заборе меню</p>
            </div>

            <!-- 6. Время ожидания на точке выдачи -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания на точке выдачи (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.send_menu.wait_time_pickup"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
                max="600"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает на станции выдачи</p>
            </div>
          </ng-container>

          <!-- ============================================ -->
          <!-- TAB 2: Доставка блюд (send_dish) — C5        -->
          <!-- ============================================ -->
          <ng-container *ngIf="activeTab === 'send_dish'">

            <!-- Макс. блюд за рейс -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Макс. блюд за рейс <span class="text-red-500">*</span></label>
              <input
                type="number"
                [(ngModel)]="settings.send_dish.max_dishes_per_trip"
                class="w-full h-9 rounded border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                [ngClass]="getNumberError(settings.send_dish.max_dishes_per_trip, 1, 20) ? 'border-red-500' : 'border-border'"
                min="1"
                max="20"
              />
              <p class="text-xs mt-1" [ngClass]="getNumberError(settings.send_dish.max_dishes_per_trip, 1, 20) ? 'text-red-500' : 'text-gray-400'">
                {{ getNumberError(settings.send_dish.max_dishes_per_trip, 1, 20) || 'Максимальное количество блюд за один рейс (не более 20)' }}
              </p>
            </div>

            <!-- Время ожидания у стола -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания у стола (сек) <span class="text-red-500">*</span></label>
              <input
                type="number"
                [(ngModel)]="settings.send_dish.wait_time"
                class="w-full h-9 rounded border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                [ngClass]="getNumberError(settings.send_dish.wait_time, 1, 600) ? 'border-red-500' : 'border-border'"
                min="1"
                max="600"
              />
              <p class="text-xs mt-1" [ngClass]="getNumberError(settings.send_dish.wait_time, 1, 600) ? 'text-red-500' : 'text-gray-400'">
                {{ getNumberError(settings.send_dish.wait_time, 1, 600) || 'Общее время ожидания робота у стола. Сумма таймеров фраз не должна его превышать' }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                Использовано: {{ totalPhraseTime.toFixed(1) }} сек из {{ settings.send_dish.wait_time }} сек ({{ phraseTimePercent }}%)
              </p>
            </div>

            <!-- Ошибка: превышение таймера -->
            <div *ngIf="totalPhraseTime > settings.send_dish.wait_time" class="text-sm text-red-600">
              Суммарное время фраз ({{ totalPhraseTime.toFixed(1) }} сек) превышает время ожидания у стола ({{ settings.send_dish.wait_time }} сек).
            </div>

            <hr class="border-t border-gray-200" />

            <!-- Динамический список фраз -->
            <h3 class="text-base font-semibold text-gray-900">Фразы при доставке</h3>

            <div *ngFor="let phrase of settings.send_dish.phrases; let i = index; trackBy: trackByIndex"
                 class="border border-gray-200 rounded-lg p-4 space-y-3">
              <!-- Заголовок фразы -->
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">Фраза №{{ i + 1 }}</span>
                <button
                  *ngIf="i > 0"
                  (click)="removePhrase(i)"
                  class="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <lucide-icon name="x" [size]="16"></lucide-icon>
                </button>
              </div>

              <!-- Текст фразы -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Текст фразы</label>
                <ui-input
                  [(value)]="phrase.text"
                  placeholder="Введите фразу"
                  [error]="getPhraseError(phrase.text)"
                ></ui-input>
                <div class="flex justify-between mt-1">
                  <span class="text-xs text-gray-400">Текст фразы робота</span>
                  <span class="text-xs" [ngClass]="phrase.text.length > 180 ? 'text-red-500' : 'text-gray-400'">
                    {{ phrase.text.length }} / 180
                  </span>
                </div>
              </div>

              <!-- URL видео/аудио -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">URL видео/аудио (необязательно)</label>
                <ui-input
                  [(value)]="phrase.url"
                  placeholder="https://example.com/audio.mp3"
                ></ui-input>
                <p class="text-xs text-gray-400 mt-1">Ссылка на mp4-видео или mp3-аудио</p>
              </div>

              <!-- Задержка перед фразой -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Задержка перед фразой (сек)</label>
                <input
                  type="number"
                  [(ngModel)]="phrase.delay_sec"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                  min="0"
                />
                <p class="text-xs text-gray-400 mt-1">Пауза перед произнесением этой фразы</p>
              </div>
            </div>

            <!-- Кнопка добавить фразу -->
            <ui-button
              variant="ghost"
              size="sm"
              iconName="plus"
              (click)="addPhrase()"
            >Добавить фразу</ui-button>
          </ng-container>

          <!-- ============================================ -->
          <!-- TAB 3: Уборка посуды (cleanup) — C6          -->
          <!-- ============================================ -->
          <ng-container *ngIf="activeTab === 'cleanup'">

            <!-- Radio Group: 3 режима -->
            <div class="space-y-0">
              <!-- Ручной режим -->
              <label class="flex items-start gap-3 py-3 cursor-pointer border-b border-gray-100">
                <input
                  type="radio"
                  name="cleanupMode"
                  value="manual"
                  [(ngModel)]="settings.cleanup.mode"
                  class="mt-0.5 accent-app-primary"
                />
                <div>
                  <span class="text-sm font-medium text-gray-900">Ручной режим</span>
                  <p class="text-xs text-gray-500 mt-0.5">Официант вручную отправляет робота для уборки стола через iikoFront</p>
                </div>
              </label>

              <!-- Автоматический режим -->
              <label class="flex items-start gap-3 py-3 cursor-pointer border-b border-gray-100">
                <input
                  type="radio"
                  name="cleanupMode"
                  value="auto"
                  [(ngModel)]="settings.cleanup.mode"
                  class="mt-0.5 accent-app-primary"
                />
                <div>
                  <span class="text-sm font-medium text-gray-900">Автоматический режим</span>
                  <p class="text-xs text-gray-500 mt-0.5">Робот автоматически отправляется на уборку по таймерам: после доставки блюда или закрытия чека</p>
                </div>
              </label>

              <!-- Смешанный режим -->
              <label class="flex items-start gap-3 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="cleanupMode"
                  value="mixed"
                  [(ngModel)]="settings.cleanup.mode"
                  class="mt-0.5 accent-app-primary"
                />
                <div>
                  <span class="text-sm font-medium text-gray-900">Смешанный режим</span>
                  <p class="text-xs text-gray-500 mt-0.5">Автоматическая уборка по таймерам с возможностью ручного запуска через iikoFront</p>
                </div>
              </label>
            </div>

            <hr class="border-t border-gray-200" />

            <!-- Секция ручной (фразы) — видна для manual и mixed -->
            <ng-container *ngIf="settings.cleanup.mode === 'manual' || settings.cleanup.mode === 'mixed'">
              <div class="space-y-6 animate-fade-in">
                <h3 class="text-base font-semibold text-gray-900">Фразы при уборке</h3>

                <!-- 1. Фраза при подъезде к столу -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при подъезде к столу</label>
                  <ui-input
                    [(value)]="settings.cleanup.phrase_arrival"
                    placeholder="Введите фразу"
                    [error]="getPhraseError(settings.cleanup.phrase_arrival)"
                  ></ui-input>
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-gray-400">Фраза робота при прибытии к столу для уборки</span>
                    <span class="text-xs" [ngClass]="settings.cleanup.phrase_arrival.length > 180 ? 'text-red-500' : 'text-gray-400'">
                      {{ settings.cleanup.phrase_arrival.length }} / 180
                    </span>
                  </div>
                </div>

                <!-- 2. URL видео/аудио -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио</label>
                  <ui-input
                    [(value)]="cleanupArrivalUrl"
                    placeholder="https://example.com/audio.mp3"
                  ></ui-input>
                  <p class="text-xs text-gray-400 mt-1">Ссылка на mp4/mp3 для фразы при уборке</p>
                </div>

                <!-- 3. Время ожидания у стола -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания у стола (сек)</label>
                  <input
                    type="number"
                    [(ngModel)]="settings.cleanup.wait_time"
                    class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                    min="1"
                    max="600"
                  />
                  <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает, пока гость положит посуду</p>
                </div>

                <!-- 4. Фраза «приеду позже» -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Фраза «приеду позже»</label>
                  <ui-input
                    [(value)]="settings.cleanup.phrase_later"
                    placeholder="Введите фразу"
                    [error]="getPhraseError(settings.cleanup.phrase_later)"
                  ></ui-input>
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-gray-400">Фраза, если гость не положил посуду</span>
                    <span class="text-xs" [ngClass]="settings.cleanup.phrase_later.length > 180 ? 'text-red-500' : 'text-gray-400'">
                      {{ settings.cleanup.phrase_later.length }} / 180
                    </span>
                  </div>
                </div>

                <!-- 5. URL видео/аудио для «приеду позже» -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио</label>
                  <ui-input
                    [(value)]="cleanupLaterUrl"
                    placeholder="https://example.com/audio.mp3"
                  ></ui-input>
                  <p class="text-xs text-gray-400 mt-1">Ссылка на mp4/mp3 для фразы «приеду позже»</p>
                </div>
              </div>
            </ng-container>

            <!-- Подсказка для авто-режима (без ручной секции) -->
            <p *ngIf="settings.cleanup.mode === 'auto'" class="text-sm italic text-orange-500 animate-fade-in">
              Фраза и время ожидания из ручного режима. Для изменения переключитесь в «Смешанный» режим.
            </p>

            <!-- Секция авто (таймеры) — видна для auto и mixed -->
            <ng-container *ngIf="settings.cleanup.mode === 'auto' || settings.cleanup.mode === 'mixed'">
              <div class="space-y-6 animate-fade-in">
                <h3 class="text-base font-semibold text-gray-900">Автоматический режим</h3>

                <!-- 6. Таймер после доставки блюда -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Таймер после доставки блюда (мин)</label>
                  <input
                    type="number"
                    [(ngModel)]="settings.cleanup.auto_timer_after_delivery"
                    class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                    min="1"
                  />
                  <p class="text-xs text-gray-400 mt-1">Через сколько минут после доставки робот приедет</p>
                  <p class="text-xs text-gray-400 mt-0.5 italic">Рекомендуемое: 12–14 мин</p>
                </div>

                <!-- 7. Таймер после закрытия чека -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Таймер после закрытия чека (мин)</label>
                  <input
                    type="number"
                    [(ngModel)]="settings.cleanup.auto_timer_after_check"
                    class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                    min="0"
                  />
                  <p class="text-xs text-gray-400 mt-1">Через сколько минут после закрытия чека. 0 — сразу</p>
                </div>
              </div>
            </ng-container>
          </ng-container>

          <!-- ============================================ -->
          <!-- TAB 4: Оплата по QR (qr_payment) — C7        -->
          <!-- ============================================ -->
          <ng-container *ngIf="activeTab === 'qr_payment'">

            <!-- Секция 1: Фаза: Кассир -->
            <h3 class="text-base font-semibold text-gray-900">Фаза: Кассир</h3>

            <!-- 1. Фраза у кассира -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза у кассира</label>
              <ui-input
                [(value)]="settings.qr_payment.cashier_phrase"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.qr_payment.cashier_phrase)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза робота при прибытии к кассиру</span>
                <span class="text-xs" [ngClass]="settings.qr_payment.cashier_phrase.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.qr_payment.cashier_phrase.length }} / 180
                </span>
              </div>
            </div>

            <!-- 2. URL видео/аудио -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио</label>
              <ui-input
                [(value)]="qrCashierUrl"
                placeholder="https://example.com/audio.mp3"
              ></ui-input>
              <p class="text-xs text-gray-400 mt-1">Ссылка на mp4/mp3 для фразы у кассира</p>
            </div>

            <!-- 3. Тайм-аут ожидания у кассира -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Тайм-аут ожидания у кассира (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.qr_payment.cashier_timeout"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
                max="600"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает укладки чека</p>
            </div>

            <hr class="border-t border-gray-200" />

            <!-- Секция 2: Фаза: Гость -->
            <h3 class="text-base font-semibold text-gray-900">Фаза: Гость</h3>

            <!-- 4. Время ожидания оплаты -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Время ожидания оплаты (сек)</label>
              <input
                type="number"
                [(ngModel)]="settings.qr_payment.guest_wait_time"
                class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                min="1"
                max="600"
              />
              <p class="text-xs text-gray-400 mt-1">Сколько секунд робот ожидает оплату. По умолчанию 120 сек</p>
            </div>

            <!-- 5. Фраза при успешной оплате -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при успешной оплате</label>
              <ui-input
                [(value)]="settings.qr_payment.phrase_success"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.qr_payment.phrase_success)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза после подтверждения оплаты</span>
                <span class="text-xs" [ngClass]="settings.qr_payment.phrase_success.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.qr_payment.phrase_success.length }} / 180
                </span>
              </div>
            </div>

            <!-- 6. URL видео/аудио (успех) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио (успех)</label>
              <ui-input
                [(value)]="qrSuccessUrl"
                placeholder="https://example.com/audio.mp3"
              ></ui-input>
              <p class="text-xs text-gray-400 mt-1">Ссылка на mp4/mp3 при успешной оплате</p>
            </div>

            <!-- 7. Фраза при неуспешной оплате -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фраза при неуспешной оплате</label>
              <ui-input
                [(value)]="settings.qr_payment.phrase_failure"
                placeholder="Введите фразу"
                [error]="getPhraseError(settings.qr_payment.phrase_failure)"
              ></ui-input>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-400">Фраза если оплата не прошла</span>
                <span class="text-xs" [ngClass]="settings.qr_payment.phrase_failure.length > 180 ? 'text-red-500' : 'text-gray-400'">
                  {{ settings.qr_payment.phrase_failure.length }} / 180
                </span>
              </div>
            </div>

            <!-- 8. URL видео/аудио (неуспех) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL видео/аудио (неуспех)</label>
              <ui-input
                [(value)]="qrFailureUrl"
                placeholder="https://example.com/audio.mp3"
              ></ui-input>
              <p class="text-xs text-gray-400 mt-1">Ссылка на mp4/mp3 при неуспешной оплате</p>
            </div>
          </ng-container>

          <!-- ============================================ -->
          <!-- TAB 5: Маркетинг (marketing)                 -->
          <!-- ============================================ -->
          <ng-container *ngIf="activeTab === 'marketing'">
            <!-- Warning card -->
            <div class="border border-orange-200 bg-orange-50/50 rounded-lg p-5">
              <div class="flex gap-3">
                <lucide-icon name="alert-triangle" [size]="20" class="text-orange-500 shrink-0 mt-0.5"></lucide-icon>
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 mb-1">Загрузка рекламных материалов</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    Загрузка рекламных материалов (видео, изображения, аудио) производится через приложение PuduLink.
                    Обратитесь к инженеру NE для настройки контента. В будущем функция будет доступна через Signage.
                  </p>
                </div>
              </div>
            </div>

            <!-- Робот для маркетинга -->
            <ui-select
              label="Робот для маркетинга"
              [options]="robotOptions"
              [value]="settings.marketing.robot_id"
              (valueChange)="settings.marketing.robot_id = $event"
              placeholder="Выберите робота"
            ></ui-select>

            <!-- Автозапуск круиза при простое -->
            <ui-checkbox
              label="Автозапуск круиза при простое"
              [(checked)]="settings.marketing.auto_cruise_on_idle"
            ></ui-checkbox>

            <!-- Запуск по таймеру -->
            <ui-checkbox
              label="Запуск по таймеру"
              [(checked)]="settings.marketing.timer_enabled"
            ></ui-checkbox>

            <!-- Timer fields -->
            <div *ngIf="settings.marketing.timer_enabled" class="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Время начала</label>
                <input
                  type="time"
                  [(ngModel)]="settings.marketing.timer_start"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Время окончания</label>
                <input
                  type="time"
                  [(ngModel)]="settings.marketing.timer_end"
                  class="w-full h-9 rounded border border-border bg-surface text-sm text-text-primary px-3 outline-none transition-colors hover:border-border-strong focus:border-border-focus focus:ring-2 focus:ring-app-primary/20"
                />
              </div>
            </div>
          </ng-container>

        </div>
      </div>

      <!-- Sticky footer -->
      <div class="border-t border-gray-200 bg-white px-6 py-3 flex items-center gap-3 shrink-0">
        <ui-button
          variant="primary"
          iconName="save"
          [disabled]="!hasChanges"
          (click)="save()"
        >Сохранить</ui-button>
        <ui-button
          variant="outline"
          [disabled]="!hasChanges"
          (click)="resetSettings()"
        >Сбросить</ui-button>
      </div>
    </ng-container>

    <!-- Toast -->
    <div
      *ngIf="toastVisible"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-slide-up"
    >
      <lucide-icon name="check-circle-2" [size]="18"></lucide-icon>
      {{ toastMessage }}
    </div>

    <!-- Confirm dialog: unsaved changes -->
    <ui-confirm-dialog
      [open]="confirmDialogOpen"
      title="Несохранённые изменения"
      message="Сохранить перед переходом?"
      confirmText="Сохранить"
      cancelText="Не сохранять"
      (confirmed)="onConfirmSave()"
      (cancelled)="onDiscardChanges()"
    ></ui-confirm-dialog>

    <!-- Confirm dialog: 24h phrase change -->
    <ui-confirm-dialog
      [open]="phraseConfirmOpen"
      title="Ограничение на изменение фразы"
      message="Изменить фразу можно один раз в 24 часа (конвертация текста в аудио — платная услуга). После сохранения повторное изменение фразы будет доступно через 24 часа. Продолжить?"
      confirmText="Сохранить"
      cancelText="Отмена"
      (confirmed)="onPhraseConfirmSave()"
      (cancelled)="phraseConfirmOpen = false"
    ></ui-confirm-dialog>
  `,
})
export class SettingsScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);

  loading = true;
  robots: Robot[] = [];
  settings!: ScenarioSettings;
  originalSettings = '';

  activeTab = 'send_menu';
  pendingTab = '';

  toastVisible = false;
  toastMessage = '';
  confirmDialogOpen = false;
  phraseConfirmOpen = false;

  /** Mock flag: phrases were recently saved (24h cooldown) */
  phraseChangedRecently = false;

  /** Original phrases for send_menu to detect change */
  private savedPhrase = '';
  private savedPhrasePickup = '';

  tabItems: TabItem[] = [
    { key: 'send_menu', label: 'Доставка меню' },
    { key: 'send_dish', label: 'Доставка блюд' },
    { key: 'cleanup', label: 'Уборка посуды' },
    { key: 'qr_payment', label: 'Оплата по QR' },
    { key: 'marketing', label: 'Маркетинг' },
  ];

  robotOptions: SelectOption[] = [];

  ngOnInit(): void {
    setTimeout(() => {
      this.robots = [...MOCK_ROBOTS];
      this.settings = this.storage.load('pudu-admin', 'settings', getInitialSettings());
      this.originalSettings = JSON.stringify(this.settings);
      this.savedPhrase = this.settings.send_menu.phrase;
      this.savedPhrasePickup = this.settings.send_menu.phrase_pickup;
      this.robotOptions = this.robots.map(r => ({
        value: r.id,
        label: `${r.name} (${r.id})`,
      }));
      this.loading = false;
    }, 1000);
  }

  // ---- URL proxy getters/setters for optional fields ----

  get sendMenuPhraseUrl(): string {
    return this.settings.send_menu.phrase_url ?? '';
  }
  set sendMenuPhraseUrl(v: string) {
    this.settings.send_menu.phrase_url = v;
  }

  get sendMenuPhrasePickupUrl(): string {
    return this.settings.send_menu.phrase_pickup_url ?? '';
  }
  set sendMenuPhrasePickupUrl(v: string) {
    this.settings.send_menu.phrase_pickup_url = v;
  }

  get cleanupArrivalUrl(): string {
    return this.settings.cleanup.phrase_arrival_url ?? '';
  }
  set cleanupArrivalUrl(v: string) {
    this.settings.cleanup.phrase_arrival_url = v;
  }

  get cleanupLaterUrl(): string {
    return this.settings.cleanup.phrase_later_url ?? '';
  }
  set cleanupLaterUrl(v: string) {
    this.settings.cleanup.phrase_later_url = v;
  }

  get qrCashierUrl(): string {
    return this.settings.qr_payment.cashier_phrase_url ?? '';
  }
  set qrCashierUrl(v: string) {
    this.settings.qr_payment.cashier_phrase_url = v;
  }

  get qrSuccessUrl(): string {
    return this.settings.qr_payment.phrase_success_url ?? '';
  }
  set qrSuccessUrl(v: string) {
    this.settings.qr_payment.phrase_success_url = v;
  }

  get qrFailureUrl(): string {
    return this.settings.qr_payment.phrase_failure_url ?? '';
  }
  set qrFailureUrl(v: string) {
    this.settings.qr_payment.phrase_failure_url = v;
  }

  // ---- Computed ----

  get hasChanges(): boolean {
    if (!this.settings) return false;
    return JSON.stringify(this.settings) !== this.originalSettings;
  }

  /** Total phrase time for send_dish: sum of delay_sec + speech duration (~0.06s per char) */
  get totalPhraseTime(): number {
    if (!this.settings?.send_dish?.phrases) return 0;
    return this.settings.send_dish.phrases.reduce((sum, p) => {
      return sum + p.delay_sec + p.text.length * 0.06;
    }, 0);
  }

  get phraseTimePercent(): number {
    if (!this.settings?.send_dish) return 0;
    const wt = this.settings.send_dish.wait_time;
    if (wt <= 0) return 0;
    return Math.round((this.totalPhraseTime / wt) * 100);
  }

  // ---- Tab navigation ----

  onTabChange(key: string): void {
    if (this.hasChanges) {
      this.pendingTab = key;
      this.confirmDialogOpen = true;
    } else {
      this.activeTab = key;
    }
  }

  onConfirmSave(): void {
    this.confirmDialogOpen = false;
    this.saveInternal();
    this.activeTab = this.pendingTab;
    this.pendingTab = '';
  }

  onDiscardChanges(): void {
    this.confirmDialogOpen = false;
    this.settings = JSON.parse(this.originalSettings);
    this.activeTab = this.pendingTab;
    this.pendingTab = '';
  }

  // ---- Save / Reset ----

  save(): void {
    // Check if send_menu phrases changed → 24h confirm
    if (this.activeTab === 'send_menu' && this.isSendMenuPhrasesChanged()) {
      this.phraseConfirmOpen = true;
      return;
    }
    this.performSave();
  }

  onPhraseConfirmSave(): void {
    this.phraseConfirmOpen = false;
    this.phraseChangedRecently = true;
    this.performSave();
  }

  resetSettings(): void {
    this.settings = JSON.parse(this.originalSettings);
  }

  // ---- Dynamic phrases (send_dish) ----

  addPhrase(): void {
    this.settings.send_dish.phrases.push({
      text: '',
      url: '',
      delay_sec: 10,
    });
  }

  removePhrase(index: number): void {
    if (index > 0) {
      this.settings.send_dish.phrases.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---- Validation helpers ----

  getPhraseError(value: string): string {
    if (value && value.length > 180) {
      return 'Превышен лимит 180 символов';
    }
    return '';
  }

  getNumberError(value: number, min: number, max?: number): string {
    if (value < min) return `Значение должно быть не менее ${min}`;
    if (max !== undefined && value > max) return `Значение должно быть не более ${max}`;
    return '';
  }

  // ---- Internal ----

  private isSendMenuPhrasesChanged(): boolean {
    return (
      this.settings.send_menu.phrase !== this.savedPhrase ||
      this.settings.send_menu.phrase_pickup !== this.savedPhrasePickup
    );
  }

  private performSave(): void {
    this.saveInternal();
    this.showToast('Изменения сохранены');
  }

  private saveInternal(): void {
    this.originalSettings = JSON.stringify(this.settings);
    this.savedPhrase = this.settings.send_menu.phrase;
    this.savedPhrasePickup = this.settings.send_menu.phrase_pickup;
    this.storage.save('pudu-admin', 'settings', this.settings);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}
