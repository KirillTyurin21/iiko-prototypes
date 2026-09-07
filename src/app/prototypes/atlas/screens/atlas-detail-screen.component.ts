import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  UiButtonComponent, UiCardComponent, UiCardHeaderComponent, UiCardTitleComponent, UiCardContentComponent,
  UiCheckboxComponent, UiStatusDotComponent, UiConfirmDialogComponent,
  UiAlertComponent, UiDividerComponent, UiBadgeComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import {
  PaymentIntegration, OperationCategory, RestaurantNode, AccountType,
} from '../types';
import { MOCK_INTEGRATIONS, MOCK_CHAIN_RESTAURANTS, MOCK_RMS_RESTAURANT } from '../data/mock-data';

type DetailMode = 'view' | 'connect';

@Component({
  selector: 'app-atlas-detail-screen',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    UiButtonComponent, UiCardComponent, UiCardHeaderComponent, UiCardTitleComponent, UiCardContentComponent,
    UiCheckboxComponent, UiStatusDotComponent, UiConfirmDialogComponent,
    UiAlertComponent, UiDividerComponent, UiBadgeComponent,
    IconsModule,
  ],
  template: `
    <!-- Header (Comet-style) -->
    <header class="border-b border-gray-200 bg-white">
      <div class="flex h-14 items-center gap-4 px-4">
        <div *ngIf="!networkWide" class="flex items-center gap-2 ml-6">
          <span class="text-xs text-gray-400">Режим:</span>
          <div class="flex rounded-md border border-gray-300 overflow-hidden">
            <button (click)="setAccountType('chain')"
              class="px-3 py-1 text-xs transition-colors"
              [class.bg-gray-900]="accountType === 'chain'" [class.text-white]="accountType === 'chain'"
              [class.text-gray-600]="accountType !== 'chain'">Чейн (15)</button>
            <button (click)="setAccountType('rms')"
              class="px-3 py-1 text-xs transition-colors border-l border-gray-300"
              [class.bg-gray-900]="accountType === 'rms'" [class.text-white]="accountType === 'rms'"
              [class.text-gray-600]="accountType !== 'rms'">RMS (1)</button>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <!-- License toggle -->
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-gray-400">Лицензия:</span>
            <button (click)="hasLicense = !hasLicense"
              class="text-[10px] px-2 py-0.5 rounded border transition-colors"
              [class.bg-green-50]="hasLicense" [class.border-green-300]="hasLicense" [class.text-green-700]="hasLicense"
              [class.bg-gray-50]="!hasLicense" [class.border-gray-300]="!hasLicense" [class.text-gray-500]="!hasLicense">
              {{ hasLicense ? 'Есть' : 'Нет' }}
            </button>
          </div>
          <button class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm text-gray-700">
            <lucide-icon name="user" [size]="16"></lucide-icon>
            <span>admin</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex" style="height: calc(100vh - 3.5rem)">
      <!-- Sidebar -->
      <aside class="w-52 border-r border-gray-200 bg-gray-50/70 shrink-0">
        <nav class="p-2 space-y-0.5">
          <button (click)="goBack()"
            class="w-full flex items-center gap-2 text-left rounded px-3 py-2 text-sm transition-colors text-gray-500 hover:bg-gray-100">
            <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
            Платёжные системы
          </button>
          <div class="px-3 pt-3 pb-1">
            <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Интеграция</p>
          </div>
          <button
            class="w-full text-left rounded px-3 py-2 text-sm font-medium transition-colors bg-gray-200 text-gray-800">
            <lucide-icon name="settings" [size]="14" class="inline mr-1.5 -mt-0.5"></lucide-icon>
            {{ integration?.name || '...' }}
          </button>
        </nav>
      </aside>

      <!-- CONTENT -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Page Header -->
        <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <button (click)="goBack()" class="p-1 rounded hover:bg-gray-100 transition-colors">
                <lucide-icon name="arrow-left" [size]="20" class="text-gray-500"></lucide-icon>
              </button>
              <div *ngIf="integration?.logoIcon" class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" [class]="integration?.logoColor || 'bg-gray-200'">
                <span class="w-7 h-7 block" [innerHTML]="logo(integration)"></span>
              </div>
              <div>
                <h1 class="text-2xl font-semibold text-gray-900">{{ integration?.name }}</h1>
                <div class="flex items-center gap-2 mt-0.5">
                  <ui-status-dot [color]="isConnected ? 'green' : 'gray'" [pulse]="isConnected"></ui-status-dot>
                  <span class="text-sm" [class.text-green-600]="isConnected" [class.text-gray-500]="!isConnected">
                    {{ isConnected ? 'Подключен' : 'Не подключен' }}
                  </span>
                  <span *ngIf="isConnected" class="text-sm text-gray-400 ml-2">{{ restaurantCountLabel }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <ui-button *ngIf="!isConnected && detailMode === 'view' && hasLicense" (click)="startConnect()">Подключить</ui-button>
              <ui-button *ngIf="!isConnected && detailMode === 'view' && !hasLicense" [disabled]="true" title="Требуется лицензия">Подключить</ui-button>
              <ui-button *ngIf="isConnected && detailMode === 'view'" variant="danger" (click)="showDisconnectConfirm = true">Отключить</ui-button>
              <ui-button *ngIf="detailMode !== 'view'" variant="ghost" (click)="cancelFlow()">Отмена</ui-button>
            </div>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- MODE: VIEW                               -->
        <!-- ======================================== -->
        <ng-container *ngIf="detailMode === 'view'">
          <!-- Не подключен — empty -->
          <div *ngIf="!isConnected" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <lucide-icon name="plug" [size]="48" class="text-gray-300 mx-auto mb-4"></lucide-icon>
              <p class="text-gray-500 text-sm mb-2">Система не подключена</p>
              <p class="text-gray-400 text-xs mb-4">Нажмите «Подключить», чтобы начать интеграцию с {{ integration?.name }}.</p>
              <ui-alert *ngIf="!hasLicense" variant="warning" class="mb-4 text-left">
                Для подключения требуется лицензия на использование {{ integration?.name }}.
                Обратитесь к поставщику для получения лицензии.
              </ui-alert>
              <ui-button *ngIf="hasLicense" (click)="startConnect()">Начать подключение</ui-button>
              <ui-button *ngIf="!hasLicense" [disabled]="true">Требуется лицензия</ui-button>
            </div>
          </div>

          <!-- Подключен — split panel -->
          <div *ngIf="isConnected" class="flex flex-1 min-h-0">
            <!-- Left: Restaurant Tree -->
            <div *ngIf="!networkWide" class="w-96 border-r border-gray-200 overflow-y-auto shrink-0" (click)="onTreePanelClick($event)">
              <div class="p-4">
                <h2 class="mb-1 text-sm font-semibold text-gray-500" (click)="selectedRestaurantId = null" style="cursor: default">
                  {{ accountType === 'rms' ? 'Ваше торговое предприятие' : 'Структура торговых предприятий' }}
                </h2>
                <p *ngIf="accountType === 'rms'" class="text-xs text-gray-400 mb-3">
                  Режим RMS — показано только ваше ТП
                </p>
                <div *ngIf="flatRestaurantList.length === 0" class="py-8 text-center text-sm text-gray-400">Нет ресторанов</div>
                <div class="space-y-1">
                  <ng-container *ngFor="let item of flatRestaurantList">
                    <!-- Group -->
                    <button *ngIf="item.isGroup"
                      (click)="toggleGroup(item.id)"
                      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      [style.padding-left.px]="8 + item.depth * 16">
                      <lucide-icon [name]="isGroupExpanded(item.id) ? 'chevron-down' : 'chevron-right'" [size]="16" class="shrink-0 text-gray-400"></lucide-icon>
                      <span class="flex-1 text-left font-medium text-gray-700">{{ item.name }}</span>
                    </button>
                    <!-- Restaurant -->
                    <button *ngIf="!item.isGroup"
                      (click)="selectRestaurant(item.id)"
                      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors"
                      [style.padding-left.px]="8 + item.depth * 16"
                      [class.bg-gray-200]="selectedRestaurantId === item.id"
                      [class.hover:bg-gray-100]="selectedRestaurantId !== item.id">
                      <span class="flex-1 text-left text-gray-700">{{ item.name }}</span>
                      <span *ngIf="item.useCustomSettings" class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium shrink-0">индив.</span>
                      <lucide-icon *ngIf="item.checked && !item.useCustomSettings" name="check-circle-2" [size]="16" class="shrink-0 text-green-600"></lucide-icon>
                      <lucide-icon *ngIf="item.checked && item.useCustomSettings" name="alert-circle" [size]="16" class="shrink-0 text-orange-500"></lucide-icon>
                      <lucide-icon *ngIf="!item.checked" name="circle" [size]="16" class="shrink-0 text-gray-300"></lucide-icon>
                    </button>
                  </ng-container>
                </div>
              </div>
            </div>

            <!-- Right: Detail Panel -->
            <div class="flex-1 overflow-y-auto bg-white">
              <div *ngIf="!selectedRestaurantId" class="p-6 animate-fade-in">
                <div class="max-w-2xl space-y-6">
                  <ui-alert *ngIf="integration?.connectedNote" variant="info">{{ integration?.connectedNote }}</ui-alert>
                  <ui-alert *ngIf="networkWide" variant="info">
                    Тип оплаты создан для всей сети и подключен во всех ресторанах ({{ totalRestaurantCount }}).
                  </ui-alert>
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">Общие настройки</h2>
                    <p *ngIf="!networkWide" class="text-sm text-gray-500 mt-1">Выберите ресторан в дереве слева для просмотра индивидуальных настроек.</p>
                  </div>

                  <!-- Global Operations -->
                  <ui-card>
                    <ui-card-header><ui-card-title>Разрешённые операции</ui-card-title></ui-card-header>
                    <ui-card-content>
                      <div class="space-y-2">
                        <div *ngFor="let cat of integration?.operationCategories || []"
                          class="flex items-start gap-3 px-3 py-2 border border-gray-200 rounded-lg"
                          [class.border-green-200]="cat.allowed" [class.bg-green-50]="cat.allowed">
                          <lucide-icon [name]="cat.iconName" [size]="18" class="shrink-0 mt-0.5" [class.text-green-600]="cat.allowed" [class.text-gray-400]="!cat.allowed"></lucide-icon>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                          </div>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Created Entities -->
                  <ui-card *ngIf="integration?.paymentType">
                    <ui-card-header><ui-card-title>Созданные сущности</ui-card-title></ui-card-header>
                    <ui-card-content>
                      <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                        <div class="flex items-start gap-3">
                          <lucide-icon name="credit-card" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                          <div>
                            <p class="text-sm font-medium">Тип оплаты «{{ integration?.paymentType?.name }}»</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ integration?.paymentType?.fiscal ? 'Фискальный' : 'Нефискальный' }} &middot; Кнопка: «{{ integration?.paymentType?.buttonLabel }}»</p>
                            <p *ngIf="integration?.paymentType?.note" class="text-xs text-gray-400 mt-0.5">{{ integration?.paymentType?.note }}</p>
                          </div>
                        </div>
                        <ng-container *ngFor="let ent of integration?.autoEntities || []">
                          <ui-divider></ui-divider>
                          <div class="flex items-start gap-3">
                            <lucide-icon [name]="ent.iconName" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                            <div>
                              <p class="text-sm font-medium">{{ ent.title }}</p>
                              <p class="text-xs text-gray-500 mt-0.5">{{ ent.subtitle }}</p>
                            </div>
                          </div>
                        </ng-container>
                        <ui-divider *ngIf="integration?.discount"></ui-divider>
                        <div *ngIf="integration?.discount" class="flex items-start gap-3">
                          <lucide-icon name="percent" [size]="18" class="text-orange-500 mt-0.5 shrink-0"></lucide-icon>
                          <div>
                            <p class="text-sm font-medium">Скидка «{{ integration?.discount?.name }}»</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ integration?.discount?.percent }}% &middot; Привязана к «{{ integration?.discount?.linkedToPaymentType }}»</p>
                          </div>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Custom settings note -->
                  <ui-alert *ngIf="!networkWide && customSettingsCount > 0" variant="info">
                    {{ customSettingsCount }} ресторанов имеют индивидуальные настройки. Выберите ресторан в дереве слева для просмотра.
                  </ui-alert>
                </div>
              </div>

              <!-- Per-restaurant detail -->
              <div *ngIf="selectedRestaurantId && getRestaurant(selectedRestaurantId) as r" class="p-6 animate-fade-in">
                <div class="max-w-2xl space-y-6">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-xl font-semibold text-gray-900">{{ r.name }}</h2>
                      <ui-badge *ngIf="r.useCustomSettings" variant="warning">Индивидуальные</ui-badge>
                      <ui-badge *ngIf="!r.useCustomSettings && r.isConnected" variant="success">Подключен</ui-badge>
                      <ui-badge *ngIf="!r.isConnected" variant="default">Не подключен</ui-badge>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">{{ r.address }}</p>
                  </div>

                  <!-- NOT CONNECTED: info -->
                  <ui-alert *ngIf="!r.isConnected" variant="info" class="mb-4">
                    Ресторан не подключён к {{ integration?.name }}. Операции будут недоступны до подключения через мастер.
                  </ui-alert>

                  <!-- Operations (read-only) -->
                  <ui-card>
                    <ui-card-header>
                      <ui-card-title>Разрешённые операции</ui-card-title>
                    </ui-card-header>
                    <ui-card-content>
                      <div class="space-y-2">
                        <div *ngFor="let cat of getRestaurantCategories(r)"
                          class="flex items-start gap-3 px-3 py-2 border border-gray-200 rounded-lg"
                          [class.border-green-200]="r.isConnected && cat.allowed" [class.bg-green-50]="r.isConnected && cat.allowed"
                          [class.opacity-50]="!r.isConnected">
                          <lucide-icon [name]="cat.iconName" [size]="18" class="shrink-0 mt-0.5" [class.text-green-600]="r.isConnected && cat.allowed" [class.text-gray-400]="!r.isConnected || !cat.allowed"></lucide-icon>
                          <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                          </div>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Credentials -->
                  <ui-card *ngIf="integration?.requiredFields?.length">
                    <ui-card-header><ui-card-title>Реквизиты</ui-card-title></ui-card-header>
                    <ui-card-content>
                      <div class="space-y-3">
                        <div *ngFor="let field of integration?.requiredFields || []">
                          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}<span *ngIf="field.required" class="text-red-500 ml-0.5">*</span></label>
                          <select *ngIf="field.type === 'select'"
                            [ngModel]="r.customCredentials?.[field.key] || ''"
                            (ngModelChange)="onCredentialChange(r, field.key, $event)"
                            class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                              focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all">
                            <option value="" disabled>Выберите...</option>
                            <option *ngFor="let opt of field.options || []" [value]="opt.value">{{ opt.label }}</option>
                          </select>
                          <input *ngIf="field.type !== 'select'" [type]="field.type === 'password' ? 'password' : 'text'"
                            [placeholder]="field.placeholder || ''"
                            [ngModel]="r.customCredentials?.[field.key] || ''"
                            (ngModelChange)="onCredentialChange(r, field.key, $event)"
                            class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10
                              focus:border-gray-400 transition-all font-mono" />
                          <p *ngIf="field.helpText" class="text-xs text-gray-400 mt-1">{{ field.helpText }}</p>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Actions -->
                  <div class="flex gap-2">
                    <ui-button *ngIf="!r.isConnected" size="sm" (click)="connectRestaurant(r)">
                      <lucide-icon name="plug" [size]="14" class="mr-1"></lucide-icon>
                      Подключить
                    </ui-button>
                    <ui-button *ngIf="r.useCustomSettings" variant="ghost" size="sm" class="text-red-500 ml-auto" (click)="resetToGlobal(r)">
                      Сбросить к общим
                    </ui-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ======================================== -->
        <!-- MODE: CONNECT / EDIT                     -->
        <!-- ======================================== -->
        <ng-container *ngIf="detailMode === 'connect'">
          <div class="flex flex-1 min-h-0">
            <!-- Left: Stepper -->
            <div class="w-64 border-r border-gray-200 overflow-y-auto shrink-0 bg-gray-50/30">
              <div class="p-4">
                <h2 class="mb-4 text-sm font-semibold text-gray-500">Мастер подключения</h2>
                <div class="space-y-1">
                  <div *ngFor="let step of wizardStepLabels; let i = index"
                    class="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                    [class.bg-gray-200]="connectStep === i + 1"
                    [class.text-gray-900]="connectStep === i + 1"
                    [class.text-gray-500]="connectStep !== i + 1">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                      [class.bg-gray-900]="connectStep === i + 1"
                      [class.text-white]="connectStep === i + 1"
                      [class.bg-green-500]="connectStep > i + 1"
                      [class.text-white]="connectStep > i + 1"
                      [class.bg-gray-200]="connectStep < i + 1">
                      <lucide-icon *ngIf="connectStep > i + 1" name="check" [size]="12"></lucide-icon>
                      <span *ngIf="connectStep <= i + 1">{{ i + 1 }}</span>
                    </div>
                    <span>{{ step }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Wizard Steps -->
            <div class="flex-1 overflow-y-auto bg-white p-6">
              <div class="max-w-xl">

                <!-- Step 1: Выбор ресторанов (skip for RMS) -->
                <div *ngIf="connectStep === 1 && accountType === 'chain' && !networkWide">
                  <h2 class="text-lg font-semibold text-gray-900 mb-1">Выберите рестораны</h2>
                  <p class="text-sm text-gray-500 mb-4">Отметьте рестораны для подключения. Можно выбрать все или отдельные для пилота.</p>
                  <div class="flex gap-2 mb-3">
                    <button (click)="wizSelectAll()" class="text-xs text-blue-600 hover:text-blue-800">Выбрать все</button>
                    <span class="text-gray-300">|</span>
                    <button (click)="wizDeselectAll()" class="text-xs text-blue-600 hover:text-blue-800">Снять все</button>
                    <span class="ml-auto text-xs text-gray-400">Выбрано: {{ wizSelectedCount }} из {{ wizTotalCount }}</span>
                  </div>
                  <div class="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    <ng-container *ngFor="let item of wizFlatRestaurantList">
                      <div *ngIf="item.isGroup"
                        class="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        [style.padding-left.px]="8 + item.depth * 16"
                        (click)="wizToggleGroup(item)">
                        <lucide-icon name="folder" [size]="14" class="text-gray-400 shrink-0"></lucide-icon>
                        <span class="text-sm font-medium text-gray-700 flex-1">{{ item.name }}</span>
                        <lucide-icon *ngIf="wizIsGroupFullyChecked(item)" name="check-square" [size]="14" class="text-green-600 shrink-0"></lucide-icon>
                        <lucide-icon *ngIf="wizIsGroupPartial(item)" name="minus-square" [size]="14" class="text-amber-500 shrink-0"></lucide-icon>
                        <lucide-icon *ngIf="!wizIsGroupFullyChecked(item) && !wizIsGroupPartial(item)" name="square" [size]="14" class="text-gray-300 shrink-0"></lucide-icon>
                      </div>
                      <div *ngIf="!item.isGroup"
                        class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
                        [style.padding-left.px]="8 + item.depth * 16">
                        <ui-checkbox [checked]="item.checked" (checkedChange)="wizToggleRestaurant(item)"></ui-checkbox>
                        <span class="text-sm text-gray-700 flex-1">{{ item.name }}</span>
                        <span class="text-xs text-gray-400 hidden sm:inline">{{ item.address }}</span>
                      </div>
                    </ng-container>
                  </div>
                </div>
                <div *ngIf="connectStep === 1 && accountType === 'rms' && !networkWide" class="text-center py-12">
                  <p class="text-sm text-gray-500">У вас одно торговое предприятие — подключение будет выполнено для него автоматически.</p>
                </div>

                <!-- Step 2: Credentials (conditional) -->
                <div *ngIf="connectStep === 2 && hasWizRequiredFields">
                  <h2 class="text-lg font-semibold text-gray-900 mb-1">Реквизиты подключения</h2>
                  <p class="text-sm text-gray-500 mb-4">Введите данные для подключения к {{ integration?.name }}.</p>
                  <div class="space-y-4">
                    <div *ngFor="let field of integration?.requiredFields || []">
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}<span *ngIf="field.required" class="text-red-500 ml-0.5">*</span></label>
                      <select *ngIf="field.type === 'select'"
                        [(ngModel)]="wizCredentials[field.key]"
                        class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                          focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all">
                        <option *ngFor="let opt of field.options || []" [value]="opt.value">{{ opt.label }}</option>
                      </select>
                      <div *ngIf="field.type !== 'select'" class="relative">
                        <input [type]="field.type === 'password' && !wizShowPwd ? 'password' : 'text'"
                          [placeholder]="field.placeholder || ''" [(ngModel)]="wizCredentials[field.key]"
                          class="w-full h-9 px-3 pr-9 text-sm border border-gray-300 rounded-md bg-white placeholder:text-gray-400
                            focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all" />
                        <button *ngIf="field.type === 'password'" (click)="wizShowPwd = !wizShowPwd"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                          <lucide-icon [name]="wizShowPwd ? 'eye-off' : 'eye'" [size]="16"></lucide-icon>
                        </button>
                      </div>
                      <p *ngIf="field.helpText" class="text-xs text-gray-400 mt-1">{{ field.helpText }}</p>
                    </div>
                  </div>
                </div>

                <!-- Final step: Подтверждение + Согласие -->
                <div *ngIf="connectStep === totalWizSteps">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Подтверждение подключения</h2>

                  <!-- Summary info -->
                  <div class="space-y-2 text-sm mb-4">
                    <div class="flex justify-between py-1.5 border-b border-gray-100">
                      <span class="text-gray-500">Система</span>
                      <span class="font-medium">{{ integration?.name }}</span>
                    </div>
                    <div *ngIf="!networkWide" class="flex justify-between py-1.5 border-b border-gray-100">
                      <span class="text-gray-500">Рестораны</span>
                      <span class="font-medium">{{ accountType === 'rms' ? '1 (RMS)' : 'выбрано ' + wizSelectedCount + ' из ' + wizTotalCount }}</span>
                    </div>
                    <div *ngIf="networkWide" class="flex justify-between py-1.5 border-b border-gray-100">
                      <span class="text-gray-500">Рестораны</span>
                      <span class="font-medium">Все рестораны сети ({{ totalRestaurantCount }})</span>
                    </div>
                    <div *ngIf="hasWizRequiredFields" class="flex justify-between py-1.5 border-b border-gray-100">
                      <span class="text-gray-500">Реквизиты</span>
                      <span class="font-medium text-green-600">заполнены</span>
                    </div>
                  </div>

                  <!-- Network-wide info: тип оплаты создаётся для всей сети -->
                  <ui-alert *ngIf="networkWide" variant="info" class="mb-4">
                    Тип оплаты будет создан для всей сети и подключен во всех ресторанах ({{ totalRestaurantCount }}).
                  </ui-alert>

                  <!-- Access scopes (read-only, informational) -->
                  <ui-alert variant="info" class="mb-4">
                    {{ integration?.accessIntro || 'Банк' }} <strong>{{ integration?.name }}</strong> получит доступ к следующим операциям:
                  </ui-alert>
                  <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-2 mb-4">
                    <div *ngFor="let cat of integration?.operationCategories || []"
                      class="flex items-start gap-3">
                      <lucide-icon [name]="cat.iconName" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                        <p class="text-xs text-gray-500">{{ cat.description }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Preview created entities -->
                  <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3 mb-4">
                    <h4 class="text-sm font-semibold text-gray-700">Будет создано автоматически</h4>
                    <div *ngIf="integration?.paymentType" class="flex items-start gap-3">
                      <lucide-icon name="credit-card" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-sm font-medium">Тип оплаты «{{ integration?.paymentType?.name }}»</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ integration?.paymentType?.fiscal ? 'Фискальный' : 'Нефискальный' }} &middot; Кнопка: «{{ integration?.paymentType?.buttonLabel }}»</p>
                        <p *ngIf="integration?.paymentType?.note" class="text-xs text-gray-400 mt-0.5">{{ integration?.paymentType?.note }}</p>
                      </div>
                    </div>
                    <ng-container *ngFor="let ent of integration?.autoEntities || []">
                      <ui-divider></ui-divider>
                      <div class="flex items-start gap-3">
                        <lucide-icon [name]="ent.iconName" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                        <div>
                          <p class="text-sm font-medium">{{ ent.title }}</p>
                          <p class="text-xs text-gray-500 mt-0.5">{{ ent.subtitle }}</p>
                        </div>
                      </div>
                    </ng-container>
                    <ui-divider *ngIf="integration?.paymentType && integration?.discount"></ui-divider>
                    <div *ngIf="integration?.discount" class="flex items-start gap-3">
                      <lucide-icon name="percent" [size]="18" class="text-orange-500 mt-0.5 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-sm font-medium">Скидка «{{ integration?.discount?.name }}»</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ integration?.discount?.percent }}% &middot; Привязана к «{{ integration?.discount?.linkedToPaymentType }}»</p>
                      </div>
                    </div>
                  </div>

                  <!-- Consent checkbox -->
                  <div class="mb-4">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox"
                        [ngModel]="wizConsent"
                        (ngModelChange)="wizConsent = $event"
                        class="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/20" />
                      <span *ngIf="!integration?.consentText" class="text-sm text-gray-700">
                        Я принимаю условия подключения к {{ integration?.name }}. Подтверждаю, что ознакомлен с перечнем операций, к которым банк получает доступ, и даю согласие на автоматическое создание типа оплаты<ng-container *ngIf="integration?.discount"> и скидки</ng-container>.
                      </span>
                      <span *ngIf="integration?.consentText" class="text-sm text-gray-700">{{ integration?.consentText }}</span>
                    </label>
                  </div>

                </div>

                <!-- Wizard navigation -->
                <div class="flex justify-between mt-8 pt-4 border-t border-gray-200">
                  <ui-button variant="ghost" (click)="cancelFlow()">Отмена</ui-button>
                  <div class="flex gap-2">
                    <ui-button *ngIf="connectStep > 1" variant="outline" (click)="wizPrev()">Назад</ui-button>
                    <ui-button *ngIf="connectStep < totalWizSteps" [disabled]="!canWizNext" (click)="wizNext()">Далее</ui-button>
                    <ui-button *ngIf="connectStep === totalWizSteps" [disabled]="!canWizNext" [loading]="wizSubmitting" (click)="submitConnect()">{{ integration?.submitLabel || 'Подтвердить и подключить' }}</ui-button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ng-container>

      </div>
    </div>

    <!-- Disconnect Confirm -->
    <ui-confirm-dialog
      [open]="showDisconnectConfirm" title="Отключить {{ integration?.name }}?"
      message="Тип оплаты будет отключен для всех ресторанов."
      confirmText="Отключить" variant="danger"
      (confirmed)="confirmDisconnect()" (cancelled)="showDisconnectConfirm = false">
    </ui-confirm-dialog>

    <!-- Connect Confirm (для интеграций на всю сеть) -->
    <ui-confirm-dialog
      [open]="showConnectConfirm" title="Подключить {{ integration?.name }}?"
      message="Тип оплаты будет подключен во всех ресторанах."
      confirmText="Подключить"
      (confirmed)="confirmConnect()" (cancelled)="showConnectConfirm = false">
    </ui-confirm-dialog>

    <!-- Toast -->
    <div *ngIf="toastMessage" class="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-slide-up">
      <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
    </div>
  `,
})
export class AtlasDetailScreenComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private sanitizer = inject(DomSanitizer);

  // Integration
  integration: PaymentIntegration | null = null;
  integrationId = '';
  accountType: AccountType = 'chain';
  hasLicense = true;  // demo toggle

  // View state
  detailMode: DetailMode = 'view';
  selectedRestaurantId: string | null = null;
  restaurantTree: RestaurantNode[] = [];
  flatRestaurantList: FlatItem[] = [];
  expandedGroups = new Set<string>();

  // Connect/Edit wizard state
  connectStep = 1;
  wizConsent = false;
  wizCredentials: Record<string, string> = {};
  wizShowPwd = false;
  wizSubmitting = false;
  wizFlatRestaurantList: WizFlatItem[] = [];

  // UI
  showDisconnectConfirm = false;
  showConnectConfirm = false;
  toastMessage = '';


  // --- Computed ---

  get isConnected(): boolean { return this.integration?.status === 'connected'; }
  get connectedCount(): number { return this.integration?.connectedRestaurantIds?.length ?? 0; }
  get restaurantCountLabel(): string {
    const n = this.totalRestaurantCount;
    if (this.networkWide) { return n === 1 ? 'в 1 ресторане' : 'во всех ' + n + ' ресторанах'; }
    return this.connectedCount + ' из ' + n + ' ресторанов';
  }
  get totalRestaurantCount(): number { let c = 0; const f = (n: RestaurantNode[]) => { for (const x of n) { if (!x.children) c++; if (x.children) f(x.children); } }; f(this.restaurantTree); return c; }
  get customSettingsCount(): number { let c = 0; const f = (n: RestaurantNode[]) => { for (const x of n) { if (!x.children && x.useCustomSettings) c++; if (x.children) f(x.children); } }; f(this.restaurantTree); return c; }

  get networkWide(): boolean { return !!this.integration?.networkWide; }
  get hasWizRequiredFields(): boolean { return (this.integration?.requiredFields?.length ?? 0) > 0; }
  get totalWizSteps(): number { if (this.networkWide) return 1; return this.hasWizRequiredFields ? 3 : 2; }
  get wizardStepLabels(): string[] { if (this.networkWide) return ['Подтверждение']; const l = ['Рестораны']; if (this.hasWizRequiredFields) l.push('Реквизиты'); l.push('Подтверждение'); return l; }
  get wizSelectedCount(): number { return this.wizFlatRestaurantList.filter(i => !i.isGroup && i.checked).length; }
  get wizTotalCount(): number { return this.wizFlatRestaurantList.filter(i => !i.isGroup).length; }

  get canWizNext(): boolean {
    if (this.connectStep === this.totalWizSteps) return this.wizConsent;
    if (this.connectStep === 1) return this.accountType === 'rms' || this.wizSelectedCount > 0;
    if (this.connectStep === 2 && this.hasWizRequiredFields) {
      for (const f of this.integration?.requiredFields || []) { if (f.required && !this.wizCredentials[f.key]?.trim()) return false; }
      return true;
    }
    return true;
  }

  // --- Init ---

  ngOnInit(): void {
    this.accountType = this.storage.load('atlas', 'accountType', 'chain' as AccountType);
    this.integrationId = this.route.snapshot.params['integrationId'];
    // Конфигурация всегда из моков; из сохранённых данных берётся только пользовательское состояние
    const saved = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    const all = MOCK_INTEGRATIONS.map(mock => {
      const s = saved.find(i => i.id === mock.id);
      if (!s) return { ...mock };
      return {
        ...mock,
        status: s.status,
        connectedRestaurantIds: s.connectedRestaurantIds,
        operationCategories: mock.operationCategories.map(cat => ({
          ...cat,
          allowed: s.operationCategories?.find(sc => sc.id === cat.id)?.allowed ?? false,
        })),
      };
    });
    this.storage.save('atlas', 'integrations', all);
    this.integration = all.find(i => i.id === this.integrationId) || null;
    if (!this.integration) { this.router.navigate(['/prototype/atlas']); return; }
    this.buildTree();
  }

  // --- Tree ---

  buildTree(): void {
    const saved = this.storage.load<RestaurantNode[]>('atlas', this.integrationId + '_restaurants', null as any);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      this.restaurantTree = saved;
      // Filter tree for RMS: only keep the connected restaurant
      if (this.accountType === 'rms') {
        this.restaurantTree = this.filterRmsTree(saved);
      }
    } else {
      const connectedIds = new Set(this.integration?.connectedRestaurantIds ?? []);
      const source = this.accountType === 'rms' ? MOCK_RMS_RESTAURANT : MOCK_CHAIN_RESTAURANTS;
      this.restaurantTree = JSON.parse(JSON.stringify(source));
      const mark = (ns: any[]) => { for (const n of ns) { n.isConnected = connectedIds.has(n.id); if (n.children) mark(n.children); } };
      mark(this.restaurantTree);
    }
    this.rebuildFlatList();
  }

  /** For RMS: extract only the single restaurant (no groups, no hierarchy) */
  private filterRmsTree(saved: RestaurantNode[]): RestaurantNode[] {
    const findLeaf = (ns: RestaurantNode[]): RestaurantNode | null => {
      for (const n of ns) {
        if (!n.children) return n;
        if (n.children) { const r = findLeaf(n.children); if (r) return r; }
      }
      return null;
    };
    const leaf = findLeaf(saved);
    return leaf ? [{ ...leaf, children: undefined }] : saved;
  }

  rebuildFlatList(): void {
    this.flatRestaurantList = [];
    const walk = (nodes: RestaurantNode[], depth: number, parentExpanded: boolean) => {
      for (const n of nodes) {
        const hasChildren = !!n.children?.length;
        const isExpanded = this.expandedGroups.has(n.id);
        this.flatRestaurantList.push({
          id: n.id, name: n.name, address: n.address, isGroup: hasChildren, depth,
          checked: n.isConnected, useCustomSettings: n.useCustomSettings || false,
        });
        if (hasChildren && isExpanded) walk(n.children!, depth + 1, true);
      }
    };
    walk(this.restaurantTree, 0, true);
  }

  isGroupExpanded(id: string): boolean { return this.expandedGroups.has(id); }

  toggleGroup(id: string): void {
    if (this.expandedGroups.has(id)) this.expandedGroups.delete(id); else this.expandedGroups.add(id);
    this.selectedRestaurantId = null;
    this.rebuildFlatList();
  }

  selectRestaurant(id: string): void {
    this.selectedRestaurantId = this.selectedRestaurantId === id ? null : id;
  }

  /** Клик в пустое место дерева — сброс выбора ресторана */
  onTreePanelClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('button')) {
      this.selectedRestaurantId = null;
    }
  }

  getRestaurant(id: string): RestaurantNode | null {
    const f = (ns: RestaurantNode[]): RestaurantNode | null => {
      for (const n of ns) { if (n.id === id) return n; if (n.children) { const r = f(n.children); if (r) return r; } }
      return null;
    };
    return f(this.restaurantTree);
  }

  getRestaurantCategories(r: RestaurantNode): OperationCategory[] {
    return (this.integration?.operationCategories || []).map(c => ({
      ...c,
      allowed: r.isConnected ? c.allowed : false,
    }));
  }

  /** Вызывается при изменении реквизита для ресторана — автосохранение */
  onCredentialChange(r: RestaurantNode, key: string, value: string): void {
    if (!r.useCustomSettings) {
      this.enableCustomSettingsSilent(r);
    }
    if (!r.customCredentials) r.customCredentials = {};
    r.customCredentials[key] = value;
    this.persistTree();
  }

  /** Включить индивидуальные настройки (реквизиты) без toast-уведомления */
  private enableCustomSettingsSilent(r: RestaurantNode): void {
    r.customCredentials = { ...(this.integration?.requiredFields?.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}) || {}) };
    r.useCustomSettings = true;
    this.rebuildFlatList();
  }

  resetToGlobal(r: RestaurantNode): void {
    r.customCredentials = undefined;
    r.useCustomSettings = false;
    this.persistTree();
    this.rebuildFlatList();
    this.toast('Настройки «' + r.name + '» сброшены к общим');
  }

  /** Подключить отдельный ресторан к интеграции (inline action) */
  connectRestaurant(r: RestaurantNode): void {
    if (!this.integration) return;
    r.isConnected = true;
    // Add to integration's connected list if not already there
    if (!this.integration.connectedRestaurantIds.includes(r.id)) {
      this.integration.connectedRestaurantIds = [...this.integration.connectedRestaurantIds, r.id];
      const all = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
      const t = all.find(i => i.id === this.integrationId);
      if (t) t.connectedRestaurantIds = this.integration.connectedRestaurantIds;
      this.storage.save('atlas', 'integrations', all);
    }
    this.persistTree();
    this.rebuildFlatList();
    this.toast('Ресторан «' + r.name + '» подключен к ' + this.integration.name);
  }

  // --- Navigation ---

  goBack(): void { this.router.navigate(['/prototype/atlas']); }

  logo(it: PaymentIntegration | null): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(it?.logoIcon || ''); }

  // --- Connect Flow ---

  startConnect(): void {
    this.detailMode = 'connect';
    this.connectStep = this.networkWide ? this.totalWizSteps : 1;
    this.wizConsent = false;
    this.wizCredentials = {};
    // Предзаполняем select-поля первым вариантом
    for (const f of this.integration?.requiredFields || []) {
      if (f.type === 'select' && f.options?.length) this.wizCredentials[f.key] = f.options[0].value;
    }
    if (!this.networkWide) this.initWizTree();
  }

  cancelFlow(): void {
    this.detailMode = 'view';
    this.selectedRestaurantId = null;
    this.buildTree();
  }



  // --- Wizard tree ---

  initWizTree(): void {
    const connectedIds = new Set(this.integration?.connectedRestaurantIds ?? []);
    const r = this.accountType === 'rms' ? JSON.parse(JSON.stringify(MOCK_RMS_RESTAURANT)) : JSON.parse(JSON.stringify(MOCK_CHAIN_RESTAURANTS));
    const mark = (ns: any[]) => { for (const n of ns) { n.isConnected = connectedIds.has(n.id); if (n.children) mark(n.children); } };
    mark(r);
    this.wizFlatRestaurantList = [];
    const walk = (ns: any[], depth: number) => {
      for (const n of ns) {
        const hc = !!n.children?.length;
        this.wizFlatRestaurantList.push({ id: n.id, name: n.name, address: n.address || '', isGroup: hc, depth, checked: !!n.isConnected });
        if (hc) walk(n.children, depth + 1);
      }
    };
    walk(r, 0);
  }

  wizToggleRestaurant(item: WizFlatItem): void { item.checked = !item.checked; }
  wizSelectAll(): void { for (const i of this.wizFlatRestaurantList) i.checked = true; }
  wizDeselectAll(): void { for (const i of this.wizFlatRestaurantList) i.checked = false; }

  wizToggleGroup(group: WizFlatItem): void {
    // Toggle all children of this group in the flat list
    let inGroup = false;
    const newState = !this.wizIsGroupFullyChecked(group);
    for (const item of this.wizFlatRestaurantList) {
      if (item.id === group.id) { inGroup = true; continue; }
      if (inGroup && item.isGroup && item.depth <= group.depth) break; // next group at same/higher level
      if (inGroup && !item.isGroup) item.checked = newState;
    }
  }

  wizIsGroupFullyChecked(group: WizFlatItem): boolean {
    const children = this.wizGetGroupChildren(group);
    return children.length > 0 && children.every(c => c.checked);
  }

  wizIsGroupPartial(group: WizFlatItem): boolean {
    const children = this.wizGetGroupChildren(group);
    const someChecked = children.some(c => c.checked);
    const allChecked = children.every(c => c.checked);
    return someChecked && !allChecked;
  }

  private wizGetGroupChildren(group: WizFlatItem): WizFlatItem[] {
    const result: WizFlatItem[] = [];
    let inGroup = false;
    for (const item of this.wizFlatRestaurantList) {
      if (item.id === group.id) { inGroup = true; continue; }
      if (inGroup && item.isGroup && item.depth <= group.depth) break;
      if (inGroup && !item.isGroup) result.push(item);
    }
    return result;
  }

  wizNext(): void {
    if (this.connectStep === 1 && !this.hasWizRequiredFields) { this.connectStep = this.totalWizSteps; return; }
    if (this.connectStep < this.totalWizSteps) this.connectStep++;
  }

  wizPrev(): void {
    if (this.connectStep === this.totalWizSteps && !this.hasWizRequiredFields) { this.connectStep = 1; return; }
    if (this.connectStep > 1) this.connectStep--;
  }

  /** Нажатие кнопки подтверждения мастера: для сети — окно подтверждения, иначе сразу сабмит */
  submitConnect(): void {
    if (this.networkWide) { this.showConnectConfirm = true; } else { this.wizSubmit(); }
  }

  confirmConnect(): void {
    this.showConnectConfirm = false;
    this.wizSubmit();
  }

  wizSubmit(): void {
    this.wizSubmitting = true;
    setTimeout(() => {
      if (!this.integration) return;
      const all = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
      const t = all.find(i => i.id === this.integrationId);
      if (!t) return;
      t.status = 'connected';
      const ids: string[] = [];
      if (!this.networkWide) {
        for (const i of this.wizFlatRestaurantList) { if (!i.isGroup && i.checked) ids.push(i.id); }
      } else {
        // На всю сеть: подключаются все рестораны текущего контекста (Чейн / RMS)
        const source = this.accountType === 'rms' ? MOCK_RMS_RESTAURANT : MOCK_CHAIN_RESTAURANTS;
        const collect = (ns: RestaurantNode[]) => {
          for (const n of ns) { if (!n.children?.length) ids.push(n.id); if (n.children) collect(n.children); }
        };
        collect(source);
      }
      t.connectedRestaurantIds = ids;
      for (const c of t.operationCategories) c.allowed = this.networkWide ? true : ids.length > 0;
      this.storage.save('atlas', 'integrations', all);

      // Build and save restaurant tree (only when per-restaurant management is used)
      if (!this.networkWide) {
        const r = this.accountType === 'rms' ? JSON.parse(JSON.stringify(MOCK_RMS_RESTAURANT)) : JSON.parse(JSON.stringify(MOCK_CHAIN_RESTAURANTS));
        const mark = (ns: any[]) => { for (const n of ns) { n.isConnected = ids.includes(n.id); if (n.children) mark(n.children); } };
        mark(r);
        this.storage.save('atlas', this.integrationId + '_restaurants', r);
      }
      this.integration = t;
      this.wizSubmitting = false;
      this.detailMode = 'view';
      this.selectedRestaurantId = null;
      this.buildTree();
      this.toast(this.integration?.activatedToast || (this.integration?.name + ' успешно подключен'));
    }, 1500);
  }

  // --- Disconnect ---

  confirmDisconnect(): void {
    if (!this.integration) return;
    const all = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    const t = all.find(i => i.id === this.integrationId);
    if (!t) return;
    t.status = 'disconnected';
    t.connectedRestaurantIds = [];
    for (const c of t.operationCategories) c.allowed = false;
    this.storage.save('atlas', 'integrations', all);
    this.storage.save('atlas', this.integrationId + '_restaurants', null);
    this.integration = t;
    this.buildTree();
    this.selectedRestaurantId = null;
    this.showDisconnectConfirm = false;
    this.toast(t.name + ' отключен');
  }

  // --- Account change ---

  setAccountType(type: AccountType): void {
    this.accountType = type;
    this.storage.save('atlas', 'accountType', type);
    this.onAccountTypeChange();
  }

  onAccountTypeChange(): void { if (this.detailMode === 'view') this.buildTree(); else this.initWizTree(); }

  // --- Helpers ---

  persistTree(): void { this.storage.save('atlas', this.integrationId + '_restaurants', this.restaurantTree); }

  toast(msg: string): void { this.toastMessage = msg; setTimeout(() => { this.toastMessage = ''; }, 2500); }

  trackById(_: number, item: any): string { return item.id; }
}

// Local flat item types (inline, not in types.ts)
interface FlatItem {
  id: string; name: string; address: string; isGroup: boolean; depth: number; checked: boolean; useCustomSettings: boolean;
}

interface WizFlatItem {
  id: string; name: string; address: string; isGroup: boolean; depth: number; checked: boolean;
}
