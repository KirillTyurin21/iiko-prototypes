import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiCardComponent, UiCardHeaderComponent, UiCardTitleComponent, UiCardContentComponent } from '@/components/ui';
import { UiBreadcrumbsComponent, UiBadgeComponent } from '@/components/ui';
import { ModalType } from '../types';
import { MOCK_DIALOGS, MOCK_PLUGINS } from '../data/mock-data';

// POS-диалоги
import { PosCustomerSearchDialogComponent } from '../components/customer-search-dialog.component';
import { PosCustomerFoundDialogComponent } from '../components/customer-found-dialog.component';
import { PosCustomerNotFoundDialogComponent } from '../components/customer-not-found-dialog.component';
import { PosCustomerBlockedDialogComponent } from '../components/customer-blocked-dialog.component';
import { PaymentDialogComponent } from '../components/payment-dialog.component';
import { AccumulateOnlyDialogComponent } from '../components/accumulate-only-dialog.component';
import { SuccessDialogComponent } from '../components/success-dialog.component';
import { LoadingDialogComponent } from '../components/loading-dialog.component';
import { ErrorDialogComponent } from '../components/error-dialog.component';
import { NetworkErrorDialogComponent } from '../components/network-error-dialog.component';
import { RegistrationDialogComponent } from '../components/registration-dialog.component';

@Component({
  selector: 'app-plugin-dialogs-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiCardComponent,
    UiCardHeaderComponent,
    UiCardTitleComponent,
    UiCardContentComponent,
    UiBreadcrumbsComponent,
    UiBadgeComponent,
    // POS-диалоги
    PosCustomerSearchDialogComponent,
    PosCustomerFoundDialogComponent,
    PosCustomerNotFoundDialogComponent,
    PosCustomerBlockedDialogComponent,
    PaymentDialogComponent,
    AccumulateOnlyDialogComponent,
    SuccessDialogComponent,
    LoadingDialogComponent,
    ErrorDialogComponent,
    NetworkErrorDialogComponent,
    RegistrationDialogComponent,
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <ui-breadcrumbs [items]="breadcrumbs" class="mb-6"></ui-breadcrumbs>

      <!-- Заголовок -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-lg bg-app-primary/10 flex items-center justify-center">
            <lucide-icon name="credit-card" [size]="20" class="text-app-primary"></lucide-icon>
          </div>
          <h1 class="text-2xl font-semibold text-text-primary">{{ plugin?.name }}</h1>
        </div>
        <p class="text-text-secondary ml-[52px]">{{ plugin?.description }}</p>
      </div>

      <!-- Сетка окон -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let dialog of dialogs"
          (click)="openDialog(dialog.modalType)"
          class="group relative bg-surface rounded-lg border border-border hover:border-app-primary/40
                 hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <!-- Цветовой акцент сверху -->
          <div class="h-1 w-full bg-[#3a3a3a]"></div>

          <div class="p-5">
            <div class="flex items-start gap-3.5">
              <!-- Иконка -->
              <div class="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                   [ngClass]="dialog.iconBg">
                <lucide-icon [name]="dialog.icon" [size]="22" [ngClass]="dialog.iconColor"></lucide-icon>
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary
                           transition-colors leading-tight mb-1.5">
                  {{ dialog.name }}
                </h3>
                <p class="text-xs text-text-secondary leading-relaxed">
                  {{ dialog.description }}
                </p>
              </div>
            </div>

            <!-- Footer: тип -->
            <div class="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
              <span class="text-[10px] font-medium uppercase tracking-wider text-text-disabled">
                POS Modal
              </span>
              <span class="text-xs text-app-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Открыть →
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Диалоги -->
      <pos-customer-search-dialog
        [open]="activeModal === 'search'"
        (onClose)="closeDialog()"
      ></pos-customer-search-dialog>

      <pos-customer-found-dialog
        [open]="activeModal === 'found'"
        (onClose)="closeDialog()"
      ></pos-customer-found-dialog>

      <pos-customer-not-found-dialog
        [open]="activeModal === 'not-found'"
        (onClose)="closeDialog()"
      ></pos-customer-not-found-dialog>

      <pos-customer-blocked-dialog
        [open]="activeModal === 'blocked'"
        (onClose)="closeDialog()"
      ></pos-customer-blocked-dialog>

      <app-payment-dialog
        [open]="activeModal === 'payment'"
        (onClose)="closeDialog()"
      ></app-payment-dialog>

      <app-accumulate-only-dialog
        [open]="activeModal === 'accumulate'"
        (onClose)="closeDialog()"
      ></app-accumulate-only-dialog>

      <app-success-dialog
        [open]="activeModal === 'success'"
        (onClose)="closeDialog()"
      ></app-success-dialog>

      <pos-loading-dialog
        [open]="activeModal === 'loading'"
      ></pos-loading-dialog>

      <pos-error-dialog
        [open]="activeModal === 'error'"
        (onClose)="closeDialog()"
      ></pos-error-dialog>

      <pos-network-error-dialog
        [open]="activeModal === 'network-error'"
        (onClose)="closeDialog()"
      ></pos-network-error-dialog>

      <pos-registration-dialog
        [open]="activeModal === 'registration'"
        (onClose)="closeDialog()"
      ></pos-registration-dialog>
    </div>
  `,
})
export class PluginDialogsScreenComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeModal: ModalType = null;

  pluginId = '';
  plugin: typeof MOCK_PLUGINS[0] | undefined;
  dialogs: typeof MOCK_DIALOGS['premium-bonus'] = [];

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigateByUrl('/') },
    { label: 'Плагины Front', onClick: () => this.router.navigateByUrl('/prototype/front-plugins') },
    { label: '' },
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pluginId = params['pluginId'] || 'premium-bonus';
      this.plugin = MOCK_PLUGINS.find(p => p.id === this.pluginId);
      this.dialogs = MOCK_DIALOGS[this.pluginId] || [];
      this.breadcrumbs[2] = { label: this.plugin?.name || 'Плагин' };
    });
  }

  openDialog(type: ModalType): void {
    this.activeModal = type;

    // Если это loading — автоматически закроем через 3 секунды
    if (type === 'loading') {
      setTimeout(() => {
        this.activeModal = null;
      }, 3000);
    }
  }

  closeDialog(): void {
    this.activeModal = null;
  }
}
