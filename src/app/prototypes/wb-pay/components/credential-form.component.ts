import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import {
  UiInputComponent,
  UiTextareaComponent,
  UiButtonComponent,
} from '@/components/ui';
import { CredentialInput, WbPayCredentials } from '../types';

@Component({
  selector: 'app-credential-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiInputComponent,
    UiTextareaComponent,
    UiButtonComponent,
  ],
  template: `
    <div class="space-y-5">
      <h3 class="text-base font-semibold text-text-primary">{{ storeName }}</h3>

      <!-- terminal_id -->
      <ui-input
        label="terminal_id"
        placeholder="Введите terminal_id от WB"
        [(value)]="form.terminalId"
        [error]="errors['terminalId']"
      ></ui-input>

      <!-- JWT -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">JWT Bearer Token</label>
        <textarea
          class="w-full rounded-lg border px-3 py-2 text-sm min-h-[80px] font-mono resize-y
                 focus:outline-none focus:ring-2 focus:ring-app-primary/30 focus:border-app-primary"
          [class.border-red-500]="errors['jwtToken']"
          [class.border-border]="!errors['jwtToken']"
          placeholder="eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0..."
          [(ngModel)]="form.jwtToken"
        ></textarea>
        <p *ngIf="errors['jwtToken']" class="text-xs text-red-500 mt-1">{{ errors['jwtToken'] }}</p>
      </div>

      <!-- PEM -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">private.pem</label>
        <div class="flex gap-2 mb-2">
          <ui-button
            variant="outline"
            size="sm"
            iconName="upload"
            (click)="simulateFileUpload()"
          >Загрузить файл</ui-button>
          <span *ngIf="pemFileName" class="flex items-center gap-1 text-xs text-green-600">
            <lucide-icon name="check-circle" [size]="14"></lucide-icon>
            {{ pemFileName }}
          </span>
        </div>
        <textarea
          class="w-full rounded-lg border px-3 py-2 text-sm min-h-[80px] font-mono resize-y
                 focus:outline-none focus:ring-2 focus:ring-app-primary/30 focus:border-app-primary"
          [class.border-red-500]="errors['privateKeyPem']"
          [class.border-border]="!errors['privateKeyPem']"
          placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
          [(ngModel)]="form.privateKeyPem"
        ></textarea>
        <p *ngIf="errors['privateKeyPem']" class="text-xs text-red-500 mt-1">{{ errors['privateKeyPem'] }}</p>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3 pt-2">
        <ui-button
          variant="primary"
          iconName="save"
          [loading]="saving"
          [disabled]="saving"
          (click)="onSave()"
        >Сохранить</ui-button>
        <ui-button
          variant="outline"
          iconName="qr-code"
          [disabled]="!hasExistingCredentials || saving"
          (click)="generateQr.emit()"
        >Сгенерировать QR</ui-button>
        <ui-button
          variant="ghost"
          iconName="trash-2"
          [disabled]="!hasExistingCredentials || saving"
          class="ml-auto"
          (click)="deleteClick.emit()"
        >Удалить</ui-button>
      </div>

      <!-- Status -->
      <div
        *ngIf="statusMessage"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
        [class.bg-green-50]="statusType === 'success'"
        [class.text-green-700]="statusType === 'success'"
        [class.bg-red-50]="statusType === 'error'"
        [class.text-red-700]="statusType === 'error'"
      >
        <lucide-icon
          [name]="statusType === 'success' ? 'check-circle' : 'alert-circle'"
          [size]="16"
        ></lucide-icon>
        {{ statusMessage }}
      </div>
    </div>
  `,
})
export class CredentialFormComponent {
  @Input() storeName = '';
  @Input() existingCredentials: WbPayCredentials | null = null;
  @Input() set existingCredentialsInput(cred: WbPayCredentials | null) {
    this.existingCredentials = cred;
    if (cred) {
      this.form = {
        terminalId: cred.terminalId,
        jwtToken: cred.jwtToken,
        privateKeyPem: cred.privateKeyPem,
      };
      this.pemFileName = 'private.pem';
    } else {
      this.form = { terminalId: '', jwtToken: '', privateKeyPem: '' };
      this.pemFileName = '';
    }
    this.statusMessage = '';
    this.errors = {};
  }

  @Output() save = new EventEmitter<CredentialInput>();
  @Output() generateQr = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();

  form: CredentialInput = { terminalId: '', jwtToken: '', privateKeyPem: '' };
  errors: Record<string, string> = {};
  saving = false;
  statusMessage = '';
  statusType: 'success' | 'error' = 'success';
  pemFileName = '';

  get hasExistingCredentials(): boolean {
    return !!this.existingCredentials;
  }

  simulateFileUpload(): void {
    this.form.privateKeyPem =
      '-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJlr0WqPJBp3AMzrNd6Oo1PF\nbc9a1x2y3z4w5v6u7t8s9r0q\n-----END PRIVATE KEY-----';
    this.pemFileName = 'private.pem';
  }

  onSave(): void {
    this.errors = {};

    if (!this.form.terminalId.trim()) {
      this.errors['terminalId'] = 'Поле terminal_id обязательно';
    }

    if (!this.form.jwtToken.trim()) {
      this.errors['jwtToken'] = 'JWT токен обязателен';
    } else {
      const parts = this.form.jwtToken.trim().split('.');
      if (parts.length !== 3) {
        this.errors['jwtToken'] = 'JWT должен содержать 3 части, разделённые точкой';
      }
    }

    if (!this.form.privateKeyPem.trim()) {
      this.errors['privateKeyPem'] = 'Private key обязателен';
    } else if (!this.form.privateKeyPem.trim().startsWith('-----BEGIN PRIVATE KEY-----')) {
      this.errors['privateKeyPem'] = 'Файл должен начинаться с -----BEGIN PRIVATE KEY-----';
    }

    if (Object.keys(this.errors).length > 0) return;

    this.saving = true;
    setTimeout(() => {
      this.save.emit({ ...this.form });
      this.saving = false;
      this.statusMessage = 'Credentials WB Pay сохранены';
      this.statusType = 'success';
    }, 800);
  }

  showError(message: string): void {
    this.statusMessage = message;
    this.statusType = 'error';
  }

  showSuccess(message: string): void {
    this.statusMessage = message;
    this.statusType = 'success';
  }
}
