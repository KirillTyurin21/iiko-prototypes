import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiModalComponent, UiButtonComponent, UiSelectComponent, UiInputComponent, SelectOption } from '@/components/ui';
import { OrderSourceRef } from '../../types';

export interface OrderSourceDraft {
  sourceId: string;
  prefix: string;
  length: number;
  fillSymbols: string;
}

/**
 * Модалка «Настройка источника»: источник выбирается из справочника (Select Single)
 * — вместо ручного ввода имени, как на стенде.
 */
@Component({
  selector: 'app-source-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, UiModalComponent, UiButtonComponent, UiSelectComponent, UiInputComponent],
  template: `
    <ui-modal
      *ngIf="open"
      [open]="true"
      title="Настройка источника"
      size="sm"
      (modalClose)="close.emit()"
    >
      <p class="text-sm text-text-secondary mb-4">
        Источник выбирается из справочника, заведённого в Web.
      </p>

      <div class="flex flex-col gap-3">
        <ui-select
          label="Источник"
          [options]="sourceOptions"
          [(value)]="sourceId"
          placeholder="Выберите источник"
        ></ui-select>
        <ui-input
          label="Префикс номера заказа"
          [(value)]="prefix"
          placeholder="Напр. DEL-"
          hint="Подставляется перед номером заказа"
        ></ui-input>
        <ui-input
          label="Длина номера заказа"
          [(value)]="lengthText"
          type="number"
          placeholder="Напр. 5"
          hint="Длина номера заказа (символов)"
        ></ui-input>
        <ui-input
          label="Символы заполнения"
          [(value)]="fillSymbols"
          placeholder="Напр. 0"
          hint="Символ, которым дополняется номер до нужной длины"
        ></ui-input>
      </div>

      <div modalFooter class="flex items-center justify-end gap-2">
        <ui-button variant="secondary" size="sm" (click)="close.emit()">Назад</ui-button>
        <ui-button variant="primary" size="sm" [disabled]="!sourceId" (click)="confirmDraft()">Добавить</ui-button>
      </div>
    </ui-modal>
  `,
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

  get sourceOptions(): SelectOption[] {
    return this.sources.map(s => ({ value: s.id, label: s.name }));
  }

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
