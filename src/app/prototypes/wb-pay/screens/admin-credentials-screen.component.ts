import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiCardComponent,
  UiCardContentComponent,
  UiBreadcrumbsComponent,
  UiConfirmDialogComponent,
} from '@/components/ui';
import { WbPayStateService } from '../wb-pay-state.service';
import { OrgTreeComponent, TreeSelection, TreeNodeType } from '../components/org-tree.component';
import { CredentialFormComponent } from '../components/credential-form.component';
import { QrModalComponent } from '../components/qr-modal.component';
import { CredentialInput, WbPayCredentials } from '../types';

@Component({
  selector: 'app-admin-credentials-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBreadcrumbsComponent,
    UiConfirmDialogComponent,
    OrgTreeComponent,
    CredentialFormComponent,
    QrModalComponent,
  ],
  template: `
    <div class="max-w-5xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <lucide-icon name="settings" [size]="20" class="text-app-primary"></lucide-icon>
        Интеграции → WB Pay — Credentials
      </h2>

      <div class="grid grid-cols-12 gap-4">
        <!-- Left: Org Tree -->
        <div class="col-span-4">
          <ui-card>
            <ui-card-content>
              <app-org-tree
                [organizations]="state.organizations"
                [selectedId]="selectedId"
                (selectionChange)="onSelectionChange($event)"
              ></app-org-tree>
            </ui-card-content>
          </ui-card>
        </div>

        <!-- Right: Form -->
        <div class="col-span-8">
          <ui-card>
            <ui-card-content>
              <div *ngIf="!selectedStore" class="py-12 text-center">
                <lucide-icon name="mouse-pointer-click" [size]="32" class="text-gray-300 mx-auto mb-3"></lucide-icon>
                <p class="text-sm text-text-secondary">Выберите ресторан в дереве слева</p>
              </div>

              <div *ngIf="selectedStore && selectedType === 'store'">
                <app-credential-form
                  [storeName]="selectedStore.name"
                  [existingCredentialsInput]="existingCredentials"
                  (save)="onSave($event)"
                  (generateQr)="onGenerateQr()"
                  (deleteClick)="showDeleteConfirm = true"
                ></app-credential-form>
              </div>

              <div *ngIf="selectedType === 'terminal' && selectedTerminal" class="space-y-4">
                <h3 class="text-base font-semibold text-text-primary">{{ selectedTerminal.name }}</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-text-secondary">ID терминала</p>
                    <p class="text-sm font-mono text-text-primary">{{ selectedTerminal.id }}</p>
                  </div>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-text-secondary">Ресторан</p>
                    <p class="text-sm text-text-primary">{{ selectedTerminal.storeName }}</p>
                  </div>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-text-secondary">Последний запрос</p>
                    <p class="text-sm text-text-primary">{{ formatDate(selectedTerminal.lastSeen) }}</p>
                  </div>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-text-secondary">Источник конфигурации</p>
                    <p class="text-sm text-text-primary">{{ configSourceLabel }}</p>
                  </div>
                  <div class="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p class="text-xs text-text-secondary">Credentials применены</p>
                    <p class="text-sm" [class.text-green-600]="selectedTerminal.credentialsApplied" [class.text-gray-500]="!selectedTerminal.credentialsApplied">
                      {{ selectedTerminal.credentialsApplied ? 'Да ✓' : 'Нет' }}
                    </p>
                  </div>
                </div>
              </div>
            </ui-card-content>
          </ui-card>
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
  private router = inject(Router);
  state = inject(WbPayStateService);

  breadcrumbs = [
    { label: 'WB Pay', onClick: () => this.router.navigate(['/prototype/wb-pay']) },
    { label: 'Панель Web' },
  ];

  selectedId = '';
  selectedType: TreeNodeType | '' = '';
  showQrModal = false;
  showDeleteConfirm = false;
  qrData = '';

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
  }

  onSave(input: CredentialInput): void {
    const store = this.selectedStore;
    if (!store) return;
    this.state.saveCredentials(store.id, input);
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
