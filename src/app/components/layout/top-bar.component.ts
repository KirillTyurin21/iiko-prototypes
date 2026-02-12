import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES, PrototypeEntry } from '@/shared/prototypes.registry';
import { ResetButtonComponent } from './reset-button.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, ResetButtonComponent],
  template: `
    <header class="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-medium text-text-primary">{{ pageTitle }}</h1>
        <span
          *ngIf="currentPrototype?.description"
          class="text-sm text-text-secondary hidden sm:inline"
        >
          — {{ currentPrototype?.description }}
        </span>
      </div>
      <div class="flex items-center gap-2 text-sm text-text-secondary">
        <app-reset-button></app-reset-button>
        <span class="px-2 py-1 rounded bg-surface-secondary text-xs font-medium">Прототип</span>
      </div>
    </header>
  `,
})
export class TopBarComponent {
  private router = inject(Router);

  get currentPrototype(): PrototypeEntry | undefined {
    return PROTOTYPES.find(p => this.router.url.startsWith(p.path));
  }

  get pageTitle(): string {
    return this.currentPrototype?.label || (this.router.url === '/' ? 'Главная' : 'Прототип');
  }
}
