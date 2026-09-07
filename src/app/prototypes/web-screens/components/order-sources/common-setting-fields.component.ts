import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { CommonOrderSourceSetting } from '../../types';

/**
 * Поля настройки отображения заказов: префикс, длина, символы заполнения (стиль WFDS).
 */
@Component({
  selector: 'app-common-setting-fields',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="csf">
      <div class="csf-title">
        <lucide-icon name="settings" [size]="14"></lucide-icon>
        <span>{{ title }}</span>
      </div>
      <div class="csf-grid">
        <div class="ds-field">
          <label class="ds-field-label">Префикс номера заказа</label>
          <input
            class="ds-field-input"
            type="text"
            [value]="setting.prefix"
            (input)="onPrefix($any($event.target).value)"
            placeholder="Напр. DEL-"
          />
          <p class="ds-field-hint">Добавляется перед номером заказа</p>
        </div>
        <div class="ds-field">
          <label class="ds-field-label">Длина номера заказа</label>
          <input
            class="ds-field-input"
            type="number"
            [value]="setting.length ? setting.length : ''"
            (input)="onLength($any($event.target).value)"
          />
          <p class="ds-field-hint">Общая длина номера с учётом префикса</p>
        </div>
        <div class="ds-field">
          <label class="ds-field-label">Символы заполнения</label>
          <input
            class="ds-field-input"
            type="text"
            [value]="setting.fillSymbols"
            (input)="onFill($any($event.target).value)"
            placeholder="Напр. 0"
          />
          <p class="ds-field-hint">Дополняют номер, добавляются между префиксом и номером заказа</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .csf {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border: 1px solid #D6D6D6;
        border-radius: 4px;
        background: #FFFFFF;
      }
      .csf-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #616161;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .csf-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @media (max-width: 900px) {
        .csf-grid { grid-template-columns: 1fr; }
      }

      .ds-field { display: flex; flex-direction: column; gap: 6px; }
      .ds-field-label { font-size: 12px; font-weight: 500; color: #616161; }
      .ds-field-input {
        width: 100%;
        height: 38px;
        padding: 0 12px;
        border: 1px solid #D6D6D6;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: #333333;
        background: #FFFFFF;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .ds-field-input::placeholder { color: #BDBDBD; }
      .ds-field-input:focus { border-color: #448AFF; box-shadow: 0 0 0 2px rgba(68, 138, 255, 0.16); }
      .ds-field-hint { margin: 0; font-size: 12px; color: #9E9E9E; line-height: 1.4; }
    `,
  ],
})
export class CommonSettingFieldsComponent {
  @Input() setting!: CommonOrderSourceSetting;
  @Input() title = 'Общая настройка';
  @Output() changed = new EventEmitter<void>();

  onPrefix(val: string): void {
    this.setting.prefix = val;
    this.changed.emit();
  }

  onFill(val: string): void {
    this.setting.fillSymbols = val;
    this.changed.emit();
  }

  onLength(val: string): void {
    const parsed = parseInt(val, 10);
    this.setting.length = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    this.changed.emit();
  }
}
