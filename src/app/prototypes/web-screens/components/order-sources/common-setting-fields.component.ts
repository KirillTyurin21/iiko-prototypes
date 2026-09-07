import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { UiInputComponent } from '@/components/ui';
import { CommonOrderSourceSetting } from '../../types';

/**
 * Поля общей настройки источника заказов: префикс, длина, символы заполнения.
 */
@Component({
  selector: 'app-common-setting-fields',
  standalone: true,
  imports: [CommonModule, IconsModule, UiInputComponent],
  template: `
    <div class="csf">
      <div class="csf-title">
        <lucide-icon name="settings" [size]="14"></lucide-icon>
        <span>{{ title }}</span>
      </div>
      <div class="csf-grid">
        <ui-input
          label="Префикс номера заказа"
          [value]="setting.prefix"
          (valueChange)="setting.prefix = $event; changed.emit()"
          placeholder="Напр. DEL-"
          hint="Добавляется перед номером заказа"
        ></ui-input>
        <ui-input
          label="Длина номера заказа"
          [value]="setting.length ? setting.length.toString() : ''"
          (valueChange)="onLength($event)"
          type="number"
          hint="Общая длина номера с учётом префикса"
        ></ui-input>
        <ui-input
          label="Символы заполнения"
          [value]="setting.fillSymbols"
          (valueChange)="setting.fillSymbols = $event; changed.emit()"
          placeholder="Напр. 0"
          hint="Дополняют номер, добавляются между префиксом и номером заказа"
        ></ui-input>
      </div>
    </div>
  `,
  styles: [
    `
      .csf {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-primary);
      }
      .csf-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--dt-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .csf-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      @media (max-width: 900px) {
        .csf-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class CommonSettingFieldsComponent {
  @Input() setting!: CommonOrderSourceSetting;
  @Input() title = 'Общая настройка';
  @Output() changed = new EventEmitter<void>();

  onLength(val: string): void {
    const parsed = parseInt(val, 10);
    this.setting.length = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    this.changed.emit();
  }
}
