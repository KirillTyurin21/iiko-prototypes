import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiButtonComponent } from '@/components/ui';

interface SidebarItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-pudu-prototype',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconsModule, UiButtonComponent],
  template: `
    <div class="flex flex-col h-screen overflow-hidden bg-gray-50">
      <!-- HEADER -->
      <header class="border-b border-gray-200 bg-white h-14 flex items-center gap-4 px-4 shrink-0 z-10">
        <div class="flex items-center gap-2">
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none" class="text-[#E94B35]">
            <path d="M0 0H8V24H0V0Z" fill="currentColor"/>
            <path d="M12 0H20V24H12V0Z" fill="currentColor"/>
            <path d="M28 7L32 0H40L36 7H44V17H36L40 24H32L28 17V7Z" fill="currentColor"/>
            <path d="M52 0C56.4183 0 60 3.58172 60 8V16C60 20.4183 56.4183 24 52 24C47.5817 24 44 20.4183 44 16V8C44 3.58172 47.5817 0 52 0Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <ui-button variant="ghost" size="sm" iconName="user">Администратор</ui-button>
        </div>
      </header>

      <!-- BODY -->
      <div class="flex flex-1 overflow-hidden">
        <!-- SIDEBAR -->
        <aside class="w-52 border-r border-gray-200 bg-slate-50 shrink-0 flex flex-col" role="navigation">
          <nav class="space-y-1 p-2 flex-1">
            <a
              *ngFor="let item of sidebarItems"
              [routerLink]="item.route"
              routerLinkActive="bg-blue-50 text-blue-700 font-medium"
              [routerLinkActiveOptions]="{ exact: item.route === './' }"
              class="flex items-center gap-3 rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              [attr.aria-current]="isActive(item.route) ? 'page' : null"
            >
              <lucide-icon [name]="item.icon" [size]="18" class="shrink-0"></lucide-icon>
              <span>{{ item.label }}</span>
            </a>
          </nav>
          <div class="p-3 text-xs text-gray-400 border-t border-gray-200">
            © 2026 iiko / ver: 9.6.1.240000
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="flex-1 flex flex-col overflow-hidden">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- TOAST CONTAINER -->
      <div class="fixed bottom-4 right-4 z-50 space-y-2" id="toast-container">
        <div
          *ngFor="let t of toasts; trackBy: trackToast"
          class="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg min-w-[300px] animate-slide-up"
        >
          <p class="text-sm font-medium text-gray-900">{{ t.title }}</p>
          <p *ngIf="t.description" class="text-xs text-gray-500 mt-0.5">{{ t.description }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `],
})
export class PuduPrototypeComponent {
  private router = inject(Router);

  sidebarItems: SidebarItem[] = [
    { icon: 'bot', label: 'Роботы PUDU', route: './' },
    { icon: 'map-pin', label: 'Маппинг столов', route: 'mapping' },
    { icon: 'settings', label: 'Настройки роботов', route: 'settings' },
  ];

  // Toast state (shared via service pattern — simple array)
  toasts: { id: number; title: string; description?: string }[] = [];
  private toastCounter = 0;

  isActive(route: string): boolean {
    const currentUrl = this.router.url;
    const basePath = '/prototype/pudu-yandex-pay';
    if (route === './') {
      return currentUrl === basePath || currentUrl === basePath + '/';
    }
    return currentUrl.startsWith(basePath + '/' + route);
  }

  showToast(title: string, description?: string, duration = 3000) {
    const id = ++this.toastCounter;
    const t = { id, title, description };
    this.toasts.push(t);
    setTimeout(() => {
      this.toasts = this.toasts.filter(x => x.id !== id);
    }, duration);
  }

  trackToast(_: number, item: { id: number }) {
    return item.id;
  }
}
