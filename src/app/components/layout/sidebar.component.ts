import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES, PrototypeEntry } from '@/shared/prototypes.registry';
import { SessionService } from '@/shared/session.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <aside
      class="h-screen flex flex-col bg-sidebar-bg text-sidebar-text transition-all duration-200 shrink-0"
      [class.w-60]="!collapsed"
      [class.w-16]="collapsed"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 h-14 border-b border-white/10">
        <div
          class="w-8 h-8 rounded bg-app-primary flex items-center justify-center text-white text-sm font-bold shrink-0"
        >
          ii
        </div>
        <div *ngIf="!collapsed" class="overflow-hidden">
          <div class="text-sm font-semibold text-white leading-tight">Прототипы</div>
          <div class="text-xs text-sidebar-text-muted leading-tight">Workspace</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <!-- Главная -->
        <a
          routerLink="/"
          routerLinkActive="bg-sidebar-active text-white"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-text hover:bg-sidebar-hover"
        >
          <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
          <span *ngIf="!collapsed">Главная</span>
        </a>

        <!-- Раскрывающийся список доступных прототипов -->
        <div *ngIf="allPrototypes.length > 0" class="pt-1">
          <button
            (click)="showList = !showList"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-text hover:bg-sidebar-hover transition-colors"
            [ngClass]="{ 'bg-sidebar-active text-white': showList }"
          >
            <lucide-icon name="list" [size]="18"></lucide-icon>
            <span *ngIf="!collapsed" class="flex-1 text-left">Прототипы</span>
            <lucide-icon
              *ngIf="!collapsed"
              [name]="showList ? 'chevron-up' : 'chevron-down'"
              [size]="14"
              class="opacity-50"
            ></lucide-icon>
          </button>

          <div *ngIf="showList" class="space-y-0.5 pl-2">
            <a
              *ngFor="let proto of allPrototypes"
              [routerLink]="proto.path"
              class="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm cursor-pointer"
              [ngClass]="isActive(proto.path) ? 'bg-sidebar-active text-white' : 'text-sidebar-text hover:bg-sidebar-hover'"
            >
              <lucide-icon [name]="proto.icon" [size]="16"></lucide-icon>
              <span *ngIf="!collapsed" class="truncate">{{ proto.label }}</span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Нижняя панель -->
      <div class="border-t border-white/10">
        <!-- Кнопка сворачивания -->
        <button
          (click)="collapsed = !collapsed"
          class="flex items-center justify-center w-full h-10 text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
        >
          <lucide-icon
            [name]="collapsed ? 'chevron-right' : 'chevron-left'"
            [size]="18"
          ></lucide-icon>
        </button>

        <!-- Кнопка «Добавить код» (только для авторизованных не-мастеров) -->
        <button
          *ngIf="showAddCodeButton"
          (click)="addCode()"
          class="flex items-center justify-center gap-2 w-full h-9 text-xs text-sidebar-text-muted hover:text-indigo-300 hover:bg-sidebar-hover transition-colors"
          [title]="collapsed ? 'Добавить код' : ''"
        >
          <lucide-icon name="key-round" [size]="14"></lucide-icon>
          <span *ngIf="!collapsed">Добавить код</span>
        </button>

        <!-- Кнопка выхода -->
        <button
          (click)="logout()"
          class="flex items-center justify-center gap-2 w-full h-9 text-xs text-sidebar-text-muted hover:text-red-400 hover:bg-sidebar-hover transition-colors"
        >
          <lucide-icon name="log-out" [size]="14"></lucide-icon>
          <span *ngIf="!collapsed">Выйти</span>
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private router = inject(Router);
  private session = inject(SessionService);

  collapsed = false;
  showList = false;

  get allPrototypes(): PrototypeEntry[] {
    if (this.session.isMaster()) return PROTOTYPES;
    return PROTOTYPES.filter(p => {
      const slug = p.path.replace('/prototype/', '');
      return this.session.hasAccess(slug);
    });
  }

  /** Показывать кнопку «Добавить код» только авторизованным не-мастерам */
  get showAddCodeButton(): boolean {
    return this.session.isAuthenticated() && !this.session.isMaster();
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  /** Переход на серверную страницу добавления кода */
  addCode(): void {
    const returnTo = window.location.pathname;
    window.location.href = `/__add_code?return_to=${encodeURIComponent(returnTo)}`;
  }

  logout(): void {
    this.session.clearSession();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/__logout';
    document.body.appendChild(form);
    form.submit();
  }
}
