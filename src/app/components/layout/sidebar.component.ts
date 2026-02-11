import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES, PrototypeEntry } from '@/shared/prototypes.registry';
import { AccessCodeService } from '@/shared/access-code.service';
import { ACCESS_CONFIG, GroupAccessEntry } from '@/shared/access-codes';
import { CodeInputModalComponent } from '@/components/ui/code-input-modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, CodeInputModalComponent],
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

        <!-- Групповые секции (для клиентов с групповым доступом) -->
        <div *ngFor="let group of accessibleGroups" class="pt-2">
          <button
            (click)="toggleGroup(group.code)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-text hover:bg-sidebar-hover transition-colors"
            [ngClass]="{ 'bg-sidebar-active text-white': isGroupExpanded(group.code) }"
          >
            <lucide-icon name="bot" [size]="18"></lucide-icon>
            <span *ngIf="!collapsed" class="flex-1 text-left truncate">{{ group.label }}</span>
            <lucide-icon
              *ngIf="!collapsed"
              [name]="isGroupExpanded(group.code) ? 'chevron-up' : 'chevron-down'"
              [size]="14"
              class="opacity-50"
            ></lucide-icon>
          </button>

          <div *ngIf="isGroupExpanded(group.code)" class="space-y-0.5 pl-2">
            <a
              *ngFor="let proto of getGroupPrototypes(group)"
              [routerLink]="proto.path"
              class="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm cursor-pointer"
              [ngClass]="isActive(proto.path) ? 'bg-sidebar-active text-white' : 'text-sidebar-text hover:bg-sidebar-hover'"
            >
              <lucide-icon [name]="proto.icon" [size]="16"></lucide-icon>
              <span *ngIf="!collapsed" class="truncate">{{ proto.label }}</span>
            </a>
          </div>
        </div>

        <!-- Разделитель если есть группы -->
        <div *ngIf="accessibleGroups.length > 0" class="my-1 border-t border-white/5"></div>

        <!-- Кнопка "Список прототипов" (мастер-доступ) -->
        <button
          (click)="toggleList()"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-text hover:bg-sidebar-hover transition-colors"
          [ngClass]="{ 'bg-sidebar-active text-white': showList && hasListAccess }"
        >
          <lucide-icon name="list" [size]="18"></lucide-icon>
          <span *ngIf="!collapsed" class="flex-1 text-left">Список прототипов</span>
          <lucide-icon
            *ngIf="!collapsed && hasListAccess"
            [name]="showList ? 'chevron-up' : 'chevron-down'"
            [size]="14"
            class="opacity-50"
          ></lucide-icon>
          <lucide-icon
            *ngIf="!collapsed && !hasListAccess"
            name="lock"
            [size]="14"
            class="opacity-50"
          ></lucide-icon>
        </button>

        <!-- Раскрытый полный список прототипов (мастер-доступ) -->
        <div *ngIf="showList && hasListAccess" class="space-y-0.5 pl-2">
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

        <!-- Кнопка выхода (мастер-доступ) -->
        <button
          *ngIf="hasMaster"
          (click)="logout()"
          class="flex items-center justify-center gap-2 w-full h-9 text-xs text-sidebar-text-muted hover:text-red-400 hover:bg-sidebar-hover transition-colors"
        >
          <lucide-icon name="log-out" [size]="14"></lucide-icon>
          <span *ngIf="!collapsed">Выйти</span>
        </button>
      </div>
    </aside>

    <!-- Модалка ввода кода -->
    <ui-code-input-modal
      [visible]="showCodeModal"
      title="Доступ к списку прототипов"
      subtitle="Введите мастер-код для просмотра списка"
      [error]="codeError"
      (codeSubmitted)="onCodeSubmit($event)"
      (closed)="onCodeModalClose()"
    ></ui-code-input-modal>
  `,
})
export class SidebarComponent {
  private accessService = inject(AccessCodeService);
  private router = inject(Router);

  collapsed = false;
  showList = false;
  showCodeModal = false;
  codeError = '';
  expandedGroups = new Set<string>();

  get hasListAccess(): boolean {
    return this.accessService.hasAccessToList();
  }

  get hasMaster(): boolean {
    return this.accessService.hasMasterAccess();
  }

  get allPrototypes(): PrototypeEntry[] {
    return PROTOTYPES;
  }

  get accessibleGroups(): GroupAccessEntry[] {
    return this.accessService.getAccessibleGroups();
  }

  getGroupPrototypes(group: GroupAccessEntry): PrototypeEntry[] {
    return PROTOTYPES.filter(p => {
      const slug = p.path.replace('/prototype/', '');
      return group.prototypeSlugs.includes(slug);
    });
  }

  isGroupExpanded(groupCode: string): boolean {
    return this.expandedGroups.has(groupCode);
  }

  toggleGroup(groupCode: string): void {
    if (this.expandedGroups.has(groupCode)) {
      this.expandedGroups.delete(groupCode);
    } else {
      this.expandedGroups.add(groupCode);
    }
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  toggleList(): void {
    if (this.hasListAccess) {
      this.showList = !this.showList;
    } else {
      this.showCodeModal = true;
    }
  }

  onCodeSubmit(code: string): void {
    const result = this.accessService.validateAndStoreCode(code);
    if (result.valid && result.type === 'master') {
      this.showCodeModal = false;
      this.showList = true;
      this.codeError = '';
    } else {
      this.codeError = 'Неверный код доступа';
    }
  }

  onCodeModalClose(): void {
    this.showCodeModal = false;
    this.codeError = '';
  }

  logout(): void {
    this.accessService.revokeAll();
    this.showList = false;
    this.expandedGroups.clear();
    this.router.navigateByUrl('/');
  }
}
