import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos-dialog-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pos-overlay" (click)="onCancel()">
      <div class="pos-dialog" (click)="$event.stopPropagation()">
        <!-- Title bar -->
        <div class="pos-title-bar">
          <span class="pos-title">{{ title }}</span>
        </div>
        <!-- Content -->
        <div class="pos-body">
          <ng-content></ng-content>
        </div>
        <!-- Buttons -->
        <div class="pos-buttons" *ngIf="showButtons">
          <button class="pos-btn pos-btn-cancel" (click)="onCancel()">Отмена</button>
          <button
            class="pos-btn pos-btn-ok"
            (click)="onOk()"
            [disabled]="okDisabled"
          >ОК</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pos-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .pos-dialog {
      background: #2d2d2d;
      border: 2px solid #555;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    .pos-title-bar {
      background: #3a3a3a;
      padding: 12px 16px;
      border-bottom: 1px solid #555;
      border-radius: 6px 6px 0 0;
    }
    .pos-title {
      color: #e0e0e0;
      font-size: 16px;
      font-weight: 600;
    }
    .pos-body {
      padding: 24px 16px;
      color: #ccc;
      font-size: 14px;
      line-height: 1.6;
    }
    .pos-buttons {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-top: 1px solid #555;
      justify-content: flex-end;
    }
    .pos-btn {
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background 0.15s;
    }
    .pos-btn-cancel {
      background: #555;
      color: #e0e0e0;
    }
    .pos-btn-cancel:hover {
      background: #666;
    }
    .pos-btn-ok {
      background: #b8c959;
      color: #1a1a1a;
    }
    .pos-btn-ok:hover {
      background: #c8d96a;
    }
    .pos-btn-ok:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
})
export class PosDialogFrameComponent {
  @Input() title = '';
  @Input() showButtons = true;
  @Input() okDisabled = false;
  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onOk(): void {
    this.ok.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
