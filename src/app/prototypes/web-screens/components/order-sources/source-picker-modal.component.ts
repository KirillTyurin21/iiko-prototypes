import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { OrderSourceRef } from '../../types';

export interface OrderSourceDraft {
  sourceId: string;
  prefix: string;
  length: number;
  fillSymbols: string;
}

/**
 * Модалка «Настройка источника» (стиль WFDS): источник выбирается из справочника (Select Single).
 */
@Component({
  selector: 'app-source-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="spm-overlay" *ngIf="open" (click)="close.emit()">
      <div class="spm-modal" role="dialog" aria-label="Настройка источника" (click)="$event.stopPropagation()">
        <div class="spm-header">
          <h3 class="spm-title">Настройка источника</h3>
          <button type="button" class="ds-icon-btn" (click)="close.emit()" aria-label="Закрыть" title="Закрыть">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="spm-body">
          <p class="spm-desc">Источник выбирается из справочника, заведённого в Web.</p>
          <div class="ds-field">
            <label class="ds-field-label">Источник</label>
            <select class="ds-select" [(ngModel)]="sourceId">
              <option [ngValue]="" disabled>Выберите источник</option>
              <option *ngFor="let s of sources" [ngValue]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="ds-field">
            <label class="ds-field-label">Префикс номера заказа</label>
            <input class="ds-field-input" type="text" [(ngModel)]="prefix" placeholder="Напр. DEL-" />
            <p class="ds-field-hint">Добавляется перед номером заказа</p>
          </div>
          <div class="ds-field">
            <label class="ds-field-label">Длина номера заказа</label>
            <input class="ds-field-input" type="number" [(ngModel)]="lengthText" placeholder="Напр. 5" />
            <p class="ds-field-hint">Общая длина номера с учётом префикса</p>
          </div>
          <div class="ds-field">
            <label class="ds-field-label">Символы заполнения</label>
            <input class="ds-field-input" type="text" [(ngModel)]="fillSymbols" placeholder="Напр. 0" />
            <p class="ds-field-hint">Дополняют номер, добавляются между префиксом и номером заказа</p>
          </div>
        </div>
        <div class="spm-footer">
          <button type="button" class="ds-btn ds-btn--neutral" (click)="close.emit()">Назад</button>
          <button type="button" class="ds-btn ds-btn--primary" [disabled]="!sourceId" (click)="confirmDraft()">Добавить</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .spm-overlay {
        position: fixed;
        inset: 0;
        z-index: 150;
        background: rgba(33, 33, 33, 0.32);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        font-family: Roboto, sans-serif;
      }
      .spm-modal {
        width: 100%;
        max-width: 520px;
        background: #FFFFFF;
        border-radius: 4px;
        box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.9), 0 8px 10px 0 rgba(214, 214, 214, 0.9);
        overflow: hidden;
      }
      .spm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid #D6D6D6;
      }
      .spm-title { margin: 0; font-size: 16px; font-weight: 500; color: #333333; }
      .spm-body { display: flex; flex-direction: column; gap: 16px; padding: 20px 24px; }
      .spm-desc { margin: 0; font-size: 13px; color: #616161; }
      .spm-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 24px;
        border-top: 1px solid #D6D6D6;
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

      .ds-select {
        width: 100%;
        height: 38px;
        padding: 0 32px 0 12px;
        border: 1px solid #D6D6D6;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 13.5px;
        color: #333333;
        background-color: #FFFFFF;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23616161' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        outline: none;
        appearance: none;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .ds-select:focus { border-color: #448AFF; box-shadow: 0 0 0 2px rgba(68, 138, 255, 0.16); }

      .ds-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: none;
        color: #616161;
        cursor: pointer;
      }
      .ds-icon-btn:hover { background: #EBEBEB; }

      .ds-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 36px;
        padding: 0 16px;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .ds-btn:disabled { background: #EBEBEB; color: #9E9E9E; border-color: transparent; cursor: default; }
      .ds-btn--primary { background: #448AFF; color: #FFFFFF; }
      .ds-btn--primary:hover:not(:disabled) { background: #3969D5; }
      .ds-btn--neutral { background: #FFFFFF; color: #333333; border-color: #D6D6D6; }
      .ds-btn--neutral:hover:not(:disabled) { background: #FAFAFA; }
    `,
  ],
})
export class SourcePickerModalComponent implements OnChanges {
  @Input() open = false;
  @Input() sources: OrderSourceRef[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<OrderSourceDraft>();

  sourceId = '';
  prefix = '';
  lengthText = '5';
  fillSymbols = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.sourceId = '';
      this.prefix = '';
      this.lengthText = '5';
      this.fillSymbols = '';
    }
  }

  confirmDraft(): void {
    if (!this.sourceId) return;
    const parsed = parseInt(this.lengthText, 10);
    const length = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    this.confirm.emit({
      sourceId: this.sourceId,
      prefix: this.prefix,
      length,
      fillSymbols: this.fillSymbols,
    });
  }
}
