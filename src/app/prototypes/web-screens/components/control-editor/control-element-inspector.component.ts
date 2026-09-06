import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { ArrivalsThemeElement, ArrivalsElementType } from '../../types';
import { MOCK_ORDER_SOURCES } from '../../data/mock-data';
import { CollapsibleSectionComponent } from '../inspector/collapsible-section.component';
import { LayoutFieldsComponent } from '../inspector/layout-fields.component';
import { BorderFieldsComponent } from '../inspector/border-fields.component';
import { FontFieldsComponent } from '../inspector/font-fields.component';
import { ColorFieldComponent } from '../inspector/color-field.component';
import { AlignFieldsComponent } from '../inspector/align-fields.component';

@Component({
  selector: 'app-control-element-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    CollapsibleSectionComponent,
    LayoutFieldsComponent,
    BorderFieldsComponent,
    FontFieldsComponent,
    ColorFieldComponent,
    AlignFieldsComponent,
  ],
  template: `
    <!-- ── Text element ── -->
    <ng-container *ngIf="element.type === 'text'">
      <div class="field-group">
        <label class="field-label">Текст</label>
        <textarea class="field-textarea" rows="3" [(ngModel)]="element.text"></textarea>
      </div>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <app-font-fields
          [(fontFamily)]="element.fontFamily!"
          [(fontSize)]="element.fontSize!"
          [(fontBold)]="element.fontBold!"
          [(fontItalic)]="element.fontItalic!">
        </app-font-fields>
        <app-align-fields
          [hAlign]="element.textAlign || 'left'"
          (hAlignChange)="element.textAlign = $event">
        </app-align-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Image element ── -->
    <ng-container *ngIf="element.type === 'image'">
      <div class="field-group">
        <label class="field-label">URL изображения</label>
        <input class="field-input" [(ngModel)]="element.imageUrl" placeholder="https://..." />
      </div>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Generic element ── -->
    <ng-container *ngIf="isGenericElement(element.type)">
      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── External Order Number (Внешний номер заказа) ── -->
    <ng-container *ngIf="element.type === 'external-order-number'">
      <app-collapsible-section title="Данные" [expanded]="true">
        <div class="field-group">
          <label class="field-label">Источник заказов</label>
          <select class="field-select" [(ngModel)]="element.externalSource">
            <option value="">— Любой источник —</option>
            <option *ngFor="let s of orderSources" [ngValue]="s.id">{{ s.name }}</option>
          </select>
          <p class="field-hint">Источник выбирается из справочника, заведённого в Web</p>
        </div>
        <div class="field-group">
          <label class="field-label">Демо-номер (для предпросмотра)</label>
          <input class="field-input" [(ngModel)]="element.externalDemoNumber" placeholder="#EXT-12345" />
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Формат">
        <div class="field-group">
          <label class="field-label">Префикс</label>
          <input class="field-input" [(ngModel)]="element.externalPrefix" placeholder="Напр. DEL-" />
        </div>
        <div class="field-group">
          <label class="field-label">Суффикс</label>
          <input class="field-input" [(ngModel)]="element.externalSuffix" placeholder="Напр. -01" />
        </div>
        <div class="field-group">
          <label class="field-label">Макс. длина символов</label>
          <input type="number" class="field-input" [(ngModel)]="element.externalMaxLength" min="0" placeholder="0 — не ограничена" />
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Отображение">
        <label class="field-check">
          <input type="checkbox" [(ngModel)]="element.externalShowFallback" />
          Показывать обычный номер при отсутствии внешнего
        </label>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <app-font-fields
          [(fontFamily)]="element.fontFamily!"
          [(fontSize)]="element.fontSize!"
          [(fontBold)]="element.fontBold!"
          [(fontItalic)]="element.fontItalic!">
        </app-font-fields>
        <app-align-fields
          [(hAlign)]="element.textAlign!">
        </app-align-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Order items (Type A) ── -->
    <ng-container *ngIf="element.type === 'order-items'">
      <!-- Данные -->
      <app-collapsible-section title="Данные">
        <div class="field-group">
          <label class="field-label">Режим отображения</label>
          <select class="field-select" [(ngModel)]="element.orderDisplayMode">
            <option value="all">Все блюда</option>
            <option value="ready-only">Только готовые</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Статус готовности</label>
          <select class="field-select" [(ngModel)]="element.orderTriggerStatus">
            <option value="">— По умолчанию (Готово) —</option>
            <option *ngFor="let s of emuItemStatuses" [value]="s">{{ s }}</option>
          </select>
        </div>
        <label class="field-check" style="margin-top: 8px;">
          <input type="checkbox" [(ngModel)]="element.orderHideOnComplete" />
          Скрывать при полной готовности
        </label>
        <label class="field-check" style="margin-top: 4px;">
          <input type="checkbox" [(ngModel)]="element.orderHidePendingStatusText" />
          Скрывать статус у неготовых
        </label>
        <label class="field-check" style="margin-top: 4px;">
          <input type="checkbox" [(ngModel)]="element.orderHideDeliveredItems" />
          Скрывать выданные блюда
        </label>
        <label class="field-check" style="margin-top: 4px;">
          <input type="checkbox"
            [checked]="element.orderGroupReadyFirst !== false"
            (change)="element.orderGroupReadyFirst = $any($event.target).checked" />
          Группировать готовые вверху
        </label>
        <label class="field-check" style="margin-top: 4px;">
          <input type="checkbox" [(ngModel)]="element.orderDynamicHeight" />
          Динамическая высота (по количеству блюд)
        </label>
      </app-collapsible-section>

      <!-- Колонки -->
      <app-collapsible-section title="Колонки">
        <label class="field-check" style="margin-bottom: 6px;">
          <input type="checkbox" [(ngModel)]="element.orderShowName" /> Наименование
        </label>
        <label class="field-check" style="margin-bottom: 6px;">
          <input type="checkbox" [(ngModel)]="element.orderShowQty" /> Количество
        </label>
        <label class="field-check">
          <input type="checkbox" [(ngModel)]="element.orderShowStatus" /> Статус
        </label>
      </app-collapsible-section>

      <!-- Макет -->
      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height"
          [heightDisabled]="!!element.orderDynamicHeight">
        </app-layout-fields>
      </app-collapsible-section>

      <!-- Граница -->
      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <!-- Настройки таблицы -->
      <app-collapsible-section title="Настройки таблицы">
        <div class="section-divider-bold">Ширина колонок</div>
        <div class="fields-row">
          <div class="field-sm"><label>Название</label><input type="number" [(ngModel)]="element.orderNameColWidth" class="field-input-sm" /></div>
          <div class="field-sm"><label>Кол-во</label><input type="number" [(ngModel)]="element.orderQtyColWidth" class="field-input-sm" /></div>
          <div class="field-sm"><label>Статус</label><input type="number" [(ngModel)]="element.orderStatusColWidth" class="field-input-sm" /></div>
        </div>
        <div class="section-divider-bold">Заголовок</div>
        <label class="field-check" style="margin-bottom: 8px;">
          <input type="checkbox" [(ngModel)]="element.orderShowHeader" />
          Показывать заголовок
        </label>
        <div class="fields-row">
          <div class="field-sm">
            <label>Фон</label>
            <input type="color" [(ngModel)]="element.orderHeaderBg" class="field-color" />
          </div>
          <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="element.orderHeaderHeight" class="field-input-sm" /></div>
        </div>
        <div class="section-divider-bold">Заголовки колонок</div>
        <div class="field-group">
          <label class="field-check" style="margin-bottom: 4px;">
            <input type="checkbox" [(ngModel)]="element.orderShowNameLabel" /> Показывать
          </label>
          <label class="field-label">Колонка названия</label>
          <input class="field-input" [(ngModel)]="element.orderNameLabel" />
        </div>
        <div class="field-group">
          <label class="field-check" style="margin-bottom: 4px;">
            <input type="checkbox" [(ngModel)]="element.orderShowQtyLabel" /> Показывать
          </label>
          <label class="field-label">Колонка кол-ва</label>
          <input class="field-input" [(ngModel)]="element.orderQtyLabel" />
        </div>
        <div class="field-group">
          <label class="field-check" style="margin-bottom: 4px;">
            <input type="checkbox" [(ngModel)]="element.orderShowStatusLabel" /> Показывать
          </label>
          <label class="field-label">Колонка статуса</label>
          <input class="field-input" [(ngModel)]="element.orderStatusLabel" />
        </div>
        <div class="section-divider-bold">Строка</div>
        <div class="field-sm"><label>Высота строки</label><input type="number" [(ngModel)]="element.orderRowHeight" class="field-input-sm" /></div>
      </app-collapsible-section>

      <!-- Подсветка строк -->
      <app-collapsible-section title="Подсветка строк">
        <app-color-field label="Готовые строки" [(value)]="element.orderReadyColor!"></app-color-field>
        <app-color-field label="Неготовые строки" [(value)]="element.orderNotReadyColor!"></app-color-field>
      </app-collapsible-section>

      <!-- Шрифт заголовка -->
      <app-collapsible-section title="Шрифт заголовка">
        <app-color-field label="Цвет" [(value)]="element.orderHeaderFontColor!"></app-color-field>
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.orderHeaderFontSize" class="field-input-sm" /></div>
        </div>
        <div class="field-group">
          <label class="field-label">Шрифт</label>
          <select class="field-select" [(ngModel)]="element.orderHeaderFontFamily">
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
      </app-collapsible-section>

      <!-- Название шрифт -->
      <app-collapsible-section title="Название шрифт">
        <app-color-field label="Цвет" [(value)]="element.orderNameFontColor!"></app-color-field>
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.orderNameFontSize" class="field-input-sm" /></div>
        </div>
        <div class="field-group">
          <label class="field-label">Шрифт</label>
          <select class="field-select" [(ngModel)]="element.orderNameFontFamily">
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
      </app-collapsible-section>

      <!-- Количество шрифт -->
      <app-collapsible-section title="Количество шрифт">
        <app-color-field label="Цвет" [(value)]="element.orderQtyFontColor!"></app-color-field>
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.orderQtyFontSize" class="field-input-sm" /></div>
        </div>
        <div class="field-group">
          <label class="field-label">Шрифт</label>
          <select class="field-select" [(ngModel)]="element.orderQtyFontFamily">
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
      </app-collapsible-section>

      <!-- Статус шрифт -->
      <app-collapsible-section title="Статус шрифт">
        <app-color-field label="Цвет «Готово»" [(value)]="element.orderReadyStatusFontColor!"></app-color-field>
        <app-color-field label="Цвет «Не готово»" [(value)]="element.orderPendingStatusFontColor!"></app-color-field>
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.orderStatusFontSize" class="field-input-sm" /></div>
        </div>
        <div class="field-group">
          <label class="field-label">Шрифт</label>
          <select class="field-select" [(ngModel)]="element.orderStatusFontFamily">
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
      </app-collapsible-section>
    </ng-container>

    <!-- ── B: Two Zones ── -->
    <ng-container *ngIf="element.type === 'order-items-zones'">
      <app-collapsible-section title="Данные">
        <label class="field-check">
          <input type="checkbox" [(ngModel)]="element.orderDynamicHeight" />
          Динамическая высота (по количеству блюд)
        </label>
      </app-collapsible-section>
      <app-collapsible-section title="Настройки зон">
        <div class="field-group">
          <label class="field-label">Заголовок «Готово»</label>
          <input class="field-input" [(ngModel)]="element.zonesReadyHeaderText" />
        </div>
        <div class="field-group">
          <label class="field-label">Заголовок «Готовится»</label>
          <input class="field-input" [(ngModel)]="element.zonesPendingHeaderText" />
        </div>
        <label class="field-check" style="margin-top: 8px;">
          <input type="checkbox" [(ngModel)]="element.zonesShowAllReadyMsg" />
          Показывать сообщение «Заказ полностью готов»
        </label>
      </app-collapsible-section>

      <app-collapsible-section title="Цвета зон">
        <app-color-field label="Фон зоны «Готово»" [(value)]="element.zonesReadyBg!"></app-color-field>
        <app-color-field label="Фон зоны «Готовится»" [(value)]="element.zonesPendingBg!"></app-color-field>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <div class="fields-row">
          <div class="field-sm"><label>Заголовок</label><input type="number" [(ngModel)]="element.zonesHeaderFontSize" class="field-input-sm" /></div>
          <div class="field-sm"><label>Элемент</label><input type="number" [(ngModel)]="element.zonesItemFontSize" class="field-input-sm" /></div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height"
          [heightDisabled]="!!element.orderDynamicHeight">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── C: Progress ── -->
    <ng-container *ngIf="element.type === 'order-items-progress'">
      <app-collapsible-section title="Данные">
        <label class="field-check">
          <input type="checkbox" [(ngModel)]="element.orderDynamicHeight" />
          Динамическая высота (по количеству блюд)
        </label>
      </app-collapsible-section>
      <app-collapsible-section title="Прогресс-круг">
        <app-color-field label="Цвет прогресса" [(value)]="element.progressCircleColor!"></app-color-field>
        <app-color-field label="Цвет трека" [(value)]="element.progressTrackColor!"></app-color-field>
        <div class="fields-row">
          <div class="field-sm"><label>Размер (px)</label><input type="number" [(ngModel)]="element.progressCircleSize" class="field-input-sm" /></div>
        </div>
        <label class="field-check" style="margin-top: 8px;">
          <input type="checkbox" [(ngModel)]="element.progressShowPercent" />
          Показывать процент
        </label>
        <label class="field-check" style="margin-top: 4px;">
          <input type="checkbox" [(ngModel)]="element.progressShowCount" />
          Показывать счётчик (2/4)
        </label>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт списка">
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.progressItemFontSize" class="field-input-sm" /></div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height"
          [heightDisabled]="!!element.orderDynamicHeight">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── D: Checklist ── -->
    <ng-container *ngIf="element.type === 'order-items-checklist'">
      <app-collapsible-section title="Данные">
        <label class="field-check">
          <input type="checkbox" [(ngModel)]="element.orderDynamicHeight" />
          Динамическая высота (по количеству блюд)
        </label>
      </app-collapsible-section>
      <app-collapsible-section title="Настройки чеклиста">
        <label class="field-check" style="margin-bottom: 6px;">
          <input type="checkbox" [(ngModel)]="element.checklistStrikethrough" />
          Зачёркивать готовые
        </label>
        <label class="field-check" style="margin-bottom: 6px;">
          <input type="checkbox" [(ngModel)]="element.checklistShowCounter" />
          Показывать счётчик
        </label>
        <div class="field-group" style="margin-top: 8px;">
          <label class="field-label">Текст завершения</label>
          <input class="field-input" [(ngModel)]="element.checklistDoneText" />
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Цвета">
        <app-color-field label="Фон готовых" [(value)]="element.checklistReadyBg!"></app-color-field>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.checklistItemFontSize" class="field-input-sm" /></div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height"
          [heightDisabled]="!!element.orderDynamicHeight">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── E: Cards ── -->
    <ng-container *ngIf="element.type === 'order-items-cards'">
      <app-collapsible-section title="Данные">
        <label class="field-check">
          <input type="checkbox" [(ngModel)]="element.orderDynamicHeight" />
          Динамическая высота (по количеству блюд)
        </label>
      </app-collapsible-section>
      <app-collapsible-section title="Сетка карточек">
        <div class="field-group">
          <label class="field-label">Карточек в строке</label>
          <select class="field-select" [(ngModel)]="element.cardsPerRow">
            <option [ngValue]="2">2</option>
            <option [ngValue]="3">3</option>
            <option [ngValue]="4">4</option>
          </select>
        </div>
        <div class="fields-row">
          <div class="field-sm"><label>Отступ (px)</label><input type="number" [(ngModel)]="element.cardsGap" class="field-input-sm" /></div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Цвета">
        <app-color-field label="Рамка готовой карточки" [(value)]="element.cardsReadyBorderColor!"></app-color-field>
        <app-color-field label="Фон статус-бара «Готово»" [(value)]="element.cardsReadyBg!"></app-color-field>
        <app-color-field label="Фон статус-бара «Готовится»" [(value)]="element.cardsPendingBg!"></app-color-field>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <div class="fields-row">
          <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="element.cardsItemFontSize" class="field-input-sm" /></div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height"
          [heightDisabled]="!!element.orderDynamicHeight">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Counter (Количество блюд) ── -->
    <ng-container *ngIf="element.type === 'counter'">
      <app-collapsible-section title="Считать по статусам" [expanded]="true">
        <div *ngFor="let s of emuItemStatuses" style="margin-bottom: 4px;">
          <label class="field-check">
            <input type="checkbox"
              [checked]="(element.counterStatuses || []).includes(s)"
              (change)="toggleCounterStatus(s, $any($event.target).checked)" />
            {{ s }}
          </label>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Вид отображения" [expanded]="true">
        <div style="margin-bottom: 8px;">
          <label class="field-check" style="margin-bottom: 6px;">
            <input type="radio" name="counterDisplayMode"
              [checked]="(element.counterDisplayMode || 'text') === 'text'"
              (change)="element.counterDisplayMode = 'text'" />
            Текст (3 из 5)
          </label>
          <label class="field-check" style="margin-bottom: 6px;">
            <input type="radio" name="counterDisplayMode"
              [checked]="element.counterDisplayMode === 'fraction'"
              (change)="element.counterDisplayMode = 'fraction'" />
            Дробь (3/5)
          </label>
          <label class="field-check" style="margin-bottom: 6px;">
            <input type="radio" name="counterDisplayMode"
              [checked]="element.counterDisplayMode === 'circle'"
              (change)="element.counterDisplayMode = 'circle'" />
            Круговой прогресс
          </label>
        </div>
        <ng-container *ngIf="element.counterDisplayMode === 'circle'">
          <div class="section-divider-bold">Настройки круга</div>
          <app-color-field label="Цвет прогресса" [(value)]="element.counterCircleColor!"></app-color-field>
          <app-color-field label="Цвет фона" [(value)]="element.counterCircleTrackColor!"></app-color-field>
          <div class="fields-row">
            <div class="field-sm"><label>Размер (px)</label><input type="number" [(ngModel)]="element.counterCircleSize" class="field-input-sm" /></div>
          </div>
          <label class="field-check" style="margin-top: 6px;">
            <input type="checkbox" [(ngModel)]="element.counterShowPercent" />
            Показывать процент
          </label>
        </ng-container>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <app-font-fields
          [(fontFamily)]="element.fontFamily!"
          [(fontSize)]="element.fontSize!"
          [(fontBold)]="element.fontBold!"
          [(fontItalic)]="element.fontItalic!">
        </app-font-fields>
        <app-align-fields
          [(hAlign)]="element.textAlign!">
        </app-align-fields>
      </app-collapsible-section>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }

    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-hint { margin: 4px 0 0; font-size: 11.5px; color: #9e9e9e; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-textarea {
      width: 100%; padding: 8px 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; resize: vertical; transition: border-color 0.15s;
    }
    .field-textarea:focus { outline: none; border-color: #448aff; }
    .field-select {
      width: 100%; height: 36px; padding: 0 8px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      background: #fff; cursor: pointer; box-sizing: border-box;
    }
    .field-color {
      width: 48px; height: 32px; padding: 0; border: 1px solid #e0e0e0;
      border-radius: 4px; cursor: pointer;
    }
    .fields-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .field-sm { flex: 1; }
    .field-sm label { display: block; font-size: 11px; color: #9e9e9e; margin-bottom: 2px; }
    .field-input-sm {
      width: 100%; height: 30px; padding: 0 6px;
      border: 1px solid #e0e0e0; border-radius: 3px;
      font-size: 13px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box;
    }
    .field-input-sm:focus { outline: none; border-color: #448aff; }
    .field-check { display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer; }
    .section-divider-bold {
      font-size: 14px; font-weight: 600; color: #333;
      margin: 16px 0 10px; padding-bottom: 4px;
    }
  `],
})
export class ControlElementInspectorComponent {
  @Input() element!: ArrivalsThemeElement;
  @Input() emuItemStatuses: string[] = [];

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image', 'order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards', 'counter', 'external-order-number'].includes(type);
  }

  /* ── External Order Number Sources ── */
  /* Справочник источников заказов (ведётся в Web) */
  private storage = inject(StorageService);

  get orderSources() {
    return this.storage.load('web-screens', 'order-sources-refs', [...MOCK_ORDER_SOURCES]);
  }

  toggleCounterStatus(status: string, checked: boolean): void {
    const arr = this.element.counterStatuses ? [...this.element.counterStatuses] : [];
    if (checked && !arr.includes(status)) {
      arr.push(status);
    } else if (!checked) {
      const idx = arr.indexOf(status);
      if (idx >= 0) arr.splice(idx, 1);
    }
    this.element.counterStatuses = arr;
  }
}
