import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { CsComboboxComponent } from './cs-combobox.component';
import { TerminalTableRow } from '../cs-types';

/**
 * Строка таблицы «Настройка терминалов».
 * Используется как атрибут на `<tr>`: `<tr app-cs-table-row [row]="row" ...></tr>`
 *
 * Два режима отрисовки:
 * - computer (касса): иконка computer, стрелка раскрытия, кнопка «+»
 * - display (экран): иконка connected_tv, иконка edit, камера + удаление
 */
@Component({
  selector: 'tr[app-cs-table-row]',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CsComboboxComponent],
  template: `
    <!-- Колонка 1: Кассовый аппарат -->
    <td class="cs-col cs-col--name" [class.cs-col--advertise-indent]="row.kind === 'advertise'">
      <div class="cs-name-cell">
        <!-- Чекбокс -->
        <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
          <input
            type="checkbox"
            class="cs-checkbox"
            [checked]="selected"
            (change)="toggleSelect.emit(row.id)"
          />
        </label>

        <!-- Стрелка раскрытия (только computer) -->
        <button
          *ngIf="row.kind === 'computer'"
          type="button"
          class="cs-expand-btn"
          (click)="toggleExpand.emit(row.id); $event.stopPropagation()"
          [attr.title]="row.expanded ? 'Свернуть' : 'Развернуть'"
        >
          <lucide-icon
            [name]="row.expanded ? 'chevron-down' : 'chevron-right'"
            [size]="18"
          ></lucide-icon>
        </button>

        <!-- Заглушка для display/advertise строк (выравнивание) -->
        <span *ngIf="row.kind !== 'computer'" class="cs-expand-spacer"></span>

        <!-- Доп. отступ для advertise -->
        <span *ngIf="row.kind === 'advertise'" class="cs-advertise-indent-spacer"></span>

        <!-- Иконка типа -->
        <lucide-icon
          *ngIf="row.kind !== 'advertise'"
          [name]="row.kind === 'computer' ? 'computer' : 'monitor'"
          [size]="18"
          class="cs-type-icon"
        ></lucide-icon>
        <!-- Иконка advertise -->
        <lucide-icon
          *ngIf="row.kind === 'advertise'"
          name="radio"
          [size]="16"
          class="cs-type-icon cs-type-icon--advertise"
        ></lucide-icon>

        <!-- Имя -->
        <span class="cs-row-name">{{ row.name }}</span>

        <!-- Иконка edit (только display) -->
        <button
          *ngIf="row.kind === 'display'"
          type="button"
          class="cs-icon-btn-sm"
          title="Редактировать название"
          (click)="$event.stopPropagation()"
        >
          <lucide-icon name="pencil" [size]="14"></lucide-icon>
        </button>

        <!-- Статус online/offline (только computer) -->
        <span
          *ngIf="row.kind === 'computer'"
          class="cs-status-dot"
          [class.cs-status-dot--online]="row.isOnline"
          [class.cs-status-dot--offline]="!row.isOnline"
          [title]="row.isOnline ? 'Онлайн' : 'Офлайн'"
        ></span>
      </div>
    </td>

    <!-- Колонка 2: Тема -->
    <td class="cs-col cs-col--theme">
      <app-cs-combobox
        *ngIf="row.kind !== 'advertise'"
        placeholder="Выбрать"
        [options]="themeOptions"
        [value]="row.themeId"
        displayKey="name"
        valueKey="id"
        (valueChange)="onThemeChange($event)"
      ></app-cs-combobox>
    </td>

    <!-- Колонка 3: Терминальные группы -->
    <td class="cs-col cs-col--groups">
      <app-cs-combobox
        *ngIf="row.kind !== 'advertise'"
        placeholder="Выбрать"
        [options]="terminalGroupOptions"
        [value]="row.terminalGroupIds"
        [multi]="true"
        displayKey="name"
        valueKey="id"
        (valueChange)="onTerminalGroupsChange($event)"
      ></app-cs-combobox>
    </td>

    <!-- Колонка 4: Кампании -->
    <td class="cs-col cs-col--campaigns">
      <!-- Computer: нет кампаний -->
      <span *ngIf="row.kind === 'computer'" class="cs-cell-empty">—</span>

      <!-- Display: количество панелей -->
      <span *ngIf="row.kind === 'display'" class="cs-panel-count">
        {{ (row.advertisePanelCount ?? 0) === 0 ? '—' : (row.advertisePanelCount === 1 ? '1 панель' : row.advertisePanelCount + ' панели') }}
      </span>

      <!-- Advertise: мультивыбор кампании -->
      <app-cs-combobox
        *ngIf="row.kind === 'advertise'"
        [placeholder]="'Выбрать кампанию'"
        [options]="campaignOptions"
        [value]="row.campaignIds"
        [multi]="true"
        displayKey="name"
        valueKey="id"
        (valueChange)="onCampaignChangeForAdvertise($event)"
      ></app-cs-combobox>
    </td>

    <!-- Колонка 5: Настройки -->
    <td class="cs-col cs-col--settings">
      <app-cs-combobox
        *ngIf="row.kind !== 'advertise'"
        placeholder="Выбрать"
        [options]="settingsOptions"
        [value]="settingValue"
        displayKey="name"
        valueKey="id"
        (valueChange)="onSettingsChange($event)"
      ></app-cs-combobox>
    </td>

    <!-- Колонка 6: Действия -->
    <td class="cs-col cs-col--actions">
      <!-- Computer: кнопка «+» добавить экран -->
      <button
        *ngIf="row.kind === 'computer'"
        type="button"
        class="cs-action-btn"
        title="Добавить экран"
        (click)="addScreen.emit(row.id); $event.stopPropagation()"
      >
        <lucide-icon name="plus-circle" [size]="20"></lucide-icon>
      </button>

      <!-- Display: скриншот + удалить -->
      <ng-container *ngIf="row.kind === 'display'">
        <button
          *ngIf="row.supportsScreenshot"
          type="button"
          class="cs-action-btn"
          title="Скриншот"
          (click)="requestScreenshot.emit(row.id); $event.stopPropagation()"
        >
          <lucide-icon name="camera" [size]="18"></lucide-icon>
        </button>
        <button
          type="button"
          class="cs-action-btn cs-action-btn--danger"
          title="Удалить"
          (click)="deleteRow.emit(row.id); $event.stopPropagation()"
        >
          <lucide-icon name="trash-2" [size]="18"></lucide-icon>
        </button>
      </ng-container>
    </td>
  `,
  styles: [`
    :host {
      transition: background .1s;
      height: 48px;
    }
    :host(:hover) {
      background: #f5f5f5;
    }

    /* ─── Cells ─── */
    .cs-col {
      padding: 0 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      vertical-align: middle;
      font-family: 'Roboto', sans-serif;
      font-size: 13px;
      height: 48px;
    }
    .cs-col--name { min-width: 220px; }
    .cs-col--theme { min-width: 160px; }
    .cs-col--groups { min-width: 140px; }
    .cs-col--campaigns { min-width: 160px; }
    .cs-col--settings { min-width: 140px; }
    .cs-col--actions { min-width: 80px; text-align: right; white-space: nowrap; }

    /* ─── Name cell ─── */
    .cs-name-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Checkbox */
    .cs-checkbox-wrap {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .cs-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.38);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      background: #fff;
      transition: all .15s;
      margin: 0;
    }
    .cs-checkbox:checked {
      background: #1976d2;
      border-color: #1976d2;
    }
    .cs-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* Expand button */
    .cs-expand-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: #757575;
      border-radius: 50%;
      flex-shrink: 0;
      padding: 0;
      transition: all .15s;
    }
    .cs-expand-btn:hover {
      background: #f0f0f0;
      color: #424242;
    }
    .cs-expand-spacer {
      width: 24px;
      flex-shrink: 0;
    }

    /* Type icon */
    .cs-type-icon {
      color: #616161;
      flex-shrink: 0;
    }

    /* Name */
    .cs-row-name {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.87);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Small icon button */
    .cs-icon-btn-sm {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: #bdbdbd;
      border-radius: 50%;
      flex-shrink: 0;
      padding: 0;
      transition: all .15s;
    }
    .cs-icon-btn-sm:hover {
      background: #f0f0f0;
      color: #616161;
    }

    /* Status dot */
    .cs-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-left: 4px;
    }
    .cs-status-dot--online {
      background: #4caf50;
    }
    .cs-status-dot--offline {
      background: #bdbdbd;
    }

    /* ─── Empty cell ─── */
    .cs-cell-empty {
      color: #bdbdbd;
      font-size: 13px;
      padding: 0 8px;
    }

    /* ─── Advertise row styles ─── */
    .cs-col--advertise-indent {
      padding-left: 48px !important;
    }
    .cs-advertise-indent-spacer {
      width: 16px;
      flex-shrink: 0;
    }
    .cs-type-icon--advertise {
      color: #9e9e9e;
      opacity: 0.7;
    }
    .cs-panel-count {
      font-size: 13px;
      color: #757575;
      padding: 0 8px;
    }

    /* ─── Action buttons ─── */
    .cs-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      cursor: pointer;
      color: #757575;
      border-radius: 50%;
      padding: 0;
      transition: all .15s;
    }
    .cs-action-btn:hover {
      background: #f0f0f0;
      color: #424242;
    }
    .cs-action-btn--danger:hover {
      background: #ffebee;
      color: #c62828;
    }
  `],
})
export class CsTableRowComponent {
  /** Данные строки */
  @Input() row!: TerminalTableRow;
  /** Выбран ли чекбокс */
  @Input() selected = false;

  /** Опции для селекта темы */
  @Input() themeOptions: { id: number; name: string }[] = [];
  /** Опции для селекта групп */
  @Input() terminalGroupOptions: { id: number; name: string }[] = [];
  /** Опции для селекта кампаний */
  @Input() campaignOptions: { id: number; name: string }[] = [];
  /** Опции для селекта настроек */
  @Input() settingsOptions: { id: string; name: string }[] = [];
  @Input() settingValue: string | null = null;

  // ─── Outputs ───

  /** Клик по стрелке раскрытия (computer) */
  @Output() toggleExpand = new EventEmitter<number>();
  /** Клик по чекбоксу */
  @Output() toggleSelect = new EventEmitter<number>();
  /** Изменение темы */
  @Output() themeChange = new EventEmitter<{ rowId: number; themeId: number | null }>();
  /** Изменение групп */
  @Output() terminalGroupsChange = new EventEmitter<{ rowId: number; groupIds: number[] }>();
  /** Изменение кампании */
  @Output() campaignChange = new EventEmitter<{ rowId: number; panelId: number; campaignIds: number[] }>();
  /** Запрос скриншота */
  @Output() requestScreenshot = new EventEmitter<number>();
  /** Удаление строки */
  @Output() deleteRow = new EventEmitter<number>();
  /** Добавить экран к кассе */
  @Output() addScreen = new EventEmitter<number>();
  /** Изменение настройки отображения */
  @Output() settingsChange = new EventEmitter<{ rowId: number; settingId: string | null }>();

  // ─── Handlers ───

  onThemeChange(value: number | null): void {
    this.themeChange.emit({ rowId: this.row.id, themeId: value });
  }

  onTerminalGroupsChange(value: number[]): void {
    this.terminalGroupsChange.emit({ rowId: this.row.id, groupIds: value });
  }

  onSettingsChange(value: string | null): void {
    this.settingsChange.emit({ rowId: this.row.id, settingId: value });
  }

  onCampaignChangeForAdvertise(value: number[]): void {
    this.campaignChange.emit({ rowId: this.row.id, panelId: this.row.advertisePanelId!, campaignIds: value });
  }
}
