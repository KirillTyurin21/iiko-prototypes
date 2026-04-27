import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';
import { OrgTreeComponent, TreeSelection, TreeNodeType } from '../components/org-tree.component';
import { QrModalComponent } from '../components/qr-modal.component';
import { CredentialInput, WbPayCredentials } from '../types';

@Component({
  selector: 'app-admin-credentials-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiConfirmDialogComponent,
    OrgTreeComponent,
    QrModalComponent,
  ],
  template: `
    <div class="animate-fade-in flex flex-col h-full">
      <!-- Page header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
        <div class="flex items-center gap-2">
          <button
            class="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            (click)="router.navigate(['/prototype/wb-pay'])"
          >
            <lucide-icon name="arrow-left" [size]="18"></lucide-icon>
          </button>
          <h1 class="text-xl font-semibold text-gray-900">Интеграции → WB Pay</h1>
        </div>
        <p class="text-sm text-gray-500 mt-1 ml-10">Управление credentials для подключения WB-кошелька к ресторанам</p>
      </div>

      <!-- Split panel -->
      <div class="flex flex-1 min-h-0">
        <!-- Left: Org Tree -->
        <div class="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50/50">
          <div class="p-4">
            <app-org-tree
              [organizations]="state.organizations"
              [selectedId]="selectedId"
              (selectionChange)="onSelectionChange($event)"
            ></app-org-tree>
          </div>
        </div>

        <!-- Right: Detail panel -->
        <div class="flex-1 overflow-y-auto bg-white">
          <!-- Empty state -->
          <div *ngIf="!selectedStore && selectedType !== 'terminal'" class="flex items-center justify-center h-full">
            <div class="text-center">
              <lucide-icon name="mouse-pointer-click" [size]="36" class="text-gray-300 mx-auto mb-3"></lucide-icon>
              <p class="text-sm text-gray-500">Выберите ресторан в дереве слева</p>
              <p class="text-xs text-gray-400 mt-1">Для просмотра и редактирования credentials</p>
            </div>
          </div>

          <!-- Store selected: Credential form -->
          <div *ngIf="selectedStore && selectedType === 'store'" class="p-6 max-w-2xl">
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ selectedStore.name }}</h2>
                <p class="text-sm text-gray-500 mt-0.5">Credentials для подключения WB Pay</p>
              </div>

              <div class="border-t border-gray-200"></div>

              <!-- terminal_id -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  terminal_id <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10
                         focus:border-gray-400 transition-all font-mono"
                  [class.border-red-400]="errors['terminalId']"
                  [class.focus:ring-red-100]="errors['terminalId']"
                  placeholder="Введите terminal_id от WB"
                  [(ngModel)]="form.terminalId"
                />
                <p *ngIf="errors['terminalId']" class="text-xs text-red-500 mt-1">{{ errors['terminalId'] }}</p>
              </div>

              <!-- JWT Bearer Token -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  JWT Bearer Token <span class="text-red-500">*</span>
                </label>
                <textarea
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white min-h-[80px]
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10
                         focus:border-gray-400 transition-all font-mono resize-y"
                  [class.border-red-400]="errors['jwtToken']"
                  placeholder="eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0..."
                  [(ngModel)]="form.jwtToken"
                ></textarea>
                <p *ngIf="errors['jwtToken']" class="text-xs text-red-500 mt-1">{{ errors['jwtToken'] }}</p>
                <p *ngIf="!errors['jwtToken']" class="text-xs text-gray-400 mt-1">Формат: header.payload.signature (3 части через точку)</p>
              </div>

              <!-- private.pem -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  private.pem <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-2 mb-2">
                  <button
                    class="h-8 px-3 text-sm font-medium rounded-md border border-gray-300 bg-white
                           text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                    (click)="simulateFileUpload()"
                  >
                    <lucide-icon name="upload" [size]="14"></lucide-icon>
                    Загрузить файл
                  </button>
                  <span *ngIf="pemFileName" class="flex items-center gap-1 text-xs text-green-600">
                    <lucide-icon name="check-circle" [size]="14"></lucide-icon>
                    {{ pemFileName }}
                  </span>
                </div>
                <textarea
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white min-h-[80px]
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10
                         focus:border-gray-400 transition-all font-mono resize-y"
                  [class.border-red-400]="errors['privateKeyPem']"
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  [(ngModel)]="form.privateKeyPem"
                ></textarea>
                <p *ngIf="errors['privateKeyPem']" class="text-xs text-red-500 mt-1">{{ errors['privateKeyPem'] }}</p>
              </div>

              <div class="border-t border-gray-200"></div>

              <!-- Buttons -->
              <div class="flex items-center gap-3">
                <button
                  class="h-9 px-4 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                  [disabled]="saving"
                  (click)="onSave()"
                >
                  <lucide-icon name="save" [size]="14"></lucide-icon>
                  Сохранить
                </button>
                <button
                  class="h-9 px-4 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700
                         hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                  [disabled]="!hasExistingCredentials || saving"
                  (click)="onGenerateQr()"
                >
                  <lucide-icon name="qr-code" [size]="14"></lucide-icon>
                  Сгенерировать QR
                </button>
                <button
                  class="h-9 px-4 text-sm font-medium rounded-md text-red-600 hover:bg-red-50
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5 ml-auto"
                  [disabled]="!hasExistingCredentials || saving"
                  (click)="showDeleteConfirm = true"
                >
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  Удалить
                </button>
              </div>

              <!-- Status toast -->
              <div
                *ngIf="statusMessage"
                class="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                [class.bg-green-50]="statusType === 'success'"
                [class.text-green-700]="statusType === 'success'"
                [class.border]="true"
                [class.border-green-200]="statusType === 'success'"
                [class.bg-red-50]="statusType === 'error'"
                [class.text-red-600]="statusType === 'error'"
                [class.border-red-200]="statusType === 'error'"
              >
                <lucide-icon
                  [name]="statusType === 'success' ? 'check-circle' : 'alert-circle'"
                  [size]="16"
                ></lucide-icon>
                {{ statusMessage }}
              </div>
            </div>
          </div>

          <!-- Terminal selected: Info panel -->
          <div *ngIf="selectedType === 'terminal' && selectedTerminal" class="p-6 max-w-2xl">
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ selectedTerminal.name }}</h2>
                <p class="text-sm text-gray-500 mt-0.5">Информация о терминале</p>
              </div>

              <div class="border-t border-gray-200"></div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">ID терминала</label>
                  <p class="text-sm font-mono text-gray-900">{{ selectedTerminal.id }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Ресторан</label>
                  <p class="text-sm text-gray-900">{{ selectedTerminal.storeName }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Последний запрос</label>
                  <p class="text-sm text-gray-900">{{ formatDate(selectedTerminal.lastSeen) }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Источник конфигурации</label>
                  <p class="text-sm text-gray-900">{{ configSourceLabel }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Credentials применены</label>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    [class.text-green-600]="selectedTerminal.credentialsApplied"
                    [class.bg-green-50]="selectedTerminal.credentialsApplied"
                    [class.text-gray-500]="!selectedTerminal.credentialsApplied"
                    [class.bg-gray-100]="!selectedTerminal.credentialsApplied"
                  >
                    {{ selectedTerminal.credentialsApplied ? '✓ Да' : 'Нет' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Modal -->
    <app-qr-modal
      [open]="showQrModal"
      [qrData]="qrData"
      (close)="showQrModal = false"
      (print)="showQrModal = false"
      (download)="showQrModal = false"
    ></app-qr-modal>

    <!-- Delete Confirm -->
    <ui-confirm-dialog
      *ngIf="showDeleteConfirm"
      title="Удалить credentials?"
      [message]="'Credentials WB Pay для ресторана «' + (selectedStore?.name || '') + '» будут удалены. Плагин потеряет доступ к WB Pay.'"
      confirmText="Удалить"
      confirmVariant="danger"
      (confirm)="onDelete()"
      (cancel)="showDeleteConfirm = false"
    ></ui-confirm-dialog>
  `,
})
export class AdminCredentialsScreenComponent {
  router = inject(Router);
  state = inject(WbPayStateService);

  selectedId = '';
  selectedType: TreeNodeType | '' = '';
  showQrModal = false;
  showDeleteConfirm = false;
  qrData = '';

  // Form state (inline, like Comet)
  form: CredentialInput = { terminalId: '', jwtToken: '', privateKeyPem: '' };
  errors: Record<string, string> = {};
  saving = false;
  statusMessage = '';
  statusType: 'success' | 'error' = 'success';
  pemFileName = '';

  get selectedStore() {
    if (this.selectedType === 'store') {
      return this.state.findStore(this.selectedId);
    }
    if (this.selectedType === 'terminal') {
      return this.state.findStoreByTerminalId(this.selectedId);
    }
    return null;
  }

  get selectedTerminal() {
    if (this.selectedType === 'terminal') {
      return this.state.findTerminal(this.selectedId);
    }
    return null;
  }

  get existingCredentials(): WbPayCredentials | null {
    const store = this.selectedStore;
    if (!store) return null;
    return this.state.getCredentialsForStore(store.id) ?? null;
  }

  get hasExistingCredentials(): boolean {
    return !!this.existingCredentials;
  }

  get configSourceLabel(): string {
    if (!this.selectedTerminal) return '';
    const map: Record<string, string> = {
      transport: 'Transport Push',
      qr: 'QR-проливка',
      manual: 'Ручная настройка',
      none: 'Не настроен',
    };
    return map[this.selectedTerminal.configSource] || this.selectedTerminal.configSource;
  }

  onSelectionChange(selection: TreeSelection): void {
    this.selectedId = selection.id;
    this.selectedType = selection.type;

    // Load existing credentials into form
    if (selection.type === 'store') {
      const cred = this.existingCredentials;
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
    const store = this.selectedStore;
    if (!store) return;

    setTimeout(() => {
      this.state.saveCredentials(store.id, { ...this.form });
      this.saving = false;
      this.statusMessage = 'Credentials WB Pay сохранены';
      this.statusType = 'success';
    }, 800);
  }

  onGenerateQr(): void {
    const store = this.selectedStore;
    if (!store) return;
    this.qrData = this.state.generateQrData(store.id);
    this.showQrModal = true;
  }

  onDelete(): void {
    this.showDeleteConfirm = false;
    const store = this.selectedStore;
    if (!store) return;
    this.state.deleteCredentials(store.id);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
}
