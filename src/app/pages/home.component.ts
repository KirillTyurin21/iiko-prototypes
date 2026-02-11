import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES } from '@/shared/prototypes.registry';
import { AccessCodeService } from '@/shared/access-code.service';
import { CodeInputModalComponent } from '@/components/ui/code-input-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, IconsModule, CodeInputModalComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-medium text-text-primary mb-2">Добро пожаловать в Прототипы</h2>
        <p class="text-text-secondary">
          Рабочая область для создания интерактивных прототипов плагинов Front и Web.
          Выберите прототип из списка ниже или создайте новый.
        </p>
      </div>

      <!-- Prototypes grid (visible only with list access) -->
      <div *ngIf="hasListAccess && visiblePrototypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ui-card *ngFor="let proto of visiblePrototypes" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(proto.path)">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-app-primary/10 text-app-primary flex items-center justify-center shrink-0">
              <lucide-icon [name]="proto.icon" [size]="20"></lucide-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-medium text-text-primary truncate">{{ proto.label }}</h3>
                <ui-badge variant="primary">Прототип</ui-badge>
              </div>
              <p *ngIf="proto.description" class="text-sm text-text-secondary">{{ proto.description }}</p>
            </div>
            <lucide-icon name="arrow-right" [size]="18" class="text-text-disabled shrink-0 mt-1"></lucide-icon>
          </div>
        </ui-card>
      </div>

      <!-- Locked state (no list access) -->
      <ui-card *ngIf="!hasListAccess" padding="lg" class="mb-8">
        <div class="flex flex-col items-center py-10 text-center">
          <div class="w-16 h-16 rounded-full bg-app-primary/10 flex items-center justify-center mb-4">
            <lucide-icon name="lock" [size]="32" class="text-app-primary"></lucide-icon>
          </div>
          <h3 class="text-lg font-medium text-text-primary mb-2">Список прототипов</h3>
          <p class="text-sm text-text-secondary mb-6 max-w-md">
            Для просмотра списка всех прототипов введите код доступа.
            Если у вас есть прямая ссылка на прототип — перейдите по ней.
          </p>
          <button (click)="openCodeModal()"
                  class="px-6 py-2.5 bg-app-primary text-white font-medium rounded-lg hover:bg-app-primary/90 transition-colors flex items-center gap-2">
            <lucide-icon name="lock" [size]="16"></lucide-icon>
            Ввести код доступа
          </button>
        </div>
      </ui-card>
    </div>

    <!-- Code input modal -->
    <ui-code-input-modal
      [visible]="showCodeModal"
      [error]="codeError"
      (codeSubmitted)="onCodeSubmit($event)"
      (closed)="onCodeModalClose()">
    </ui-code-input-modal>
  `,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly accessService = inject(AccessCodeService);

  showCodeModal = false;
  codeError = '';

  get hasListAccess(): boolean {
    return this.accessService.hasAccessToList();
  }

  get hasMaster(): boolean {
    return this.accessService.hasMasterAccess();
  }

  get visiblePrototypes() {
    if (!this.hasListAccess) return [];
    return PROTOTYPES;
  }

  ngOnInit(): void {
    this.accessService.checkCodeFromUrl();
  }

  openCodeModal(): void {
    this.showCodeModal = true;
    this.codeError = '';
  }

  onCodeSubmit(code: string): void {
    const result = this.accessService.validateAndStoreCode(code);
    if (result.valid) {
      this.showCodeModal = false;
      this.codeError = '';
    } else {
      this.codeError = 'Неверный код доступа';
    }
  }

  onCodeModalClose(): void {
    this.showCodeModal = false;
    this.codeError = '';
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }
}
