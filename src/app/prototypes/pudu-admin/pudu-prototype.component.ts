import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiButtonComponent } from '@/components/ui';
import { Restaurant } from './types';
import { filter } from 'rxjs/operators';

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
          <!-- Robot face logo -->
          <img src="assets/face.png" alt="PUDU Robot" width="32" height="32" class="object-contain" />
          <span class="text-sm font-semibold text-gray-700 tracking-wide">ADMIN PANEL</span>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <ui-button variant="ghost" size="sm" iconName="user">Администратор</ui-button>
        </div>
      </header>

      <!-- BODY -->
      <div class="flex flex-1 overflow-hidden">
        <!-- SIDEBAR (v1.4: двухуровневая навигация) -->
        <aside class="w-52 border-r border-gray-200 bg-slate-50 shrink-0 flex flex-col" role="navigation">
          <nav class="space-y-1 p-2 flex-1">
            <!-- Уровень 1: Корневой пункт -->
            <a
              class="flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors cursor-pointer"
              [ngClass]="!selectedRestaurant
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'"
              (click)="goToRestaurants()"
            >
              <lucide-icon name="bot" [size]="18" class="shrink-0"></lucide-icon>
              <span>Настройки PUDU</span>
            </a>

            <!-- Уровень 2: Подпункты (видны только при выбранном ресторане) -->
            <ng-container *ngIf="selectedRestaurant">
              <a
                *ngFor="let item of subItems"
                [routerLink]="item.route"
                routerLinkActive
                #rla="routerLinkActive"
                [routerLinkActiveOptions]="{ exact: item.route === 'robots' }"
                class="flex items-center gap-3 rounded pl-6 px-3 py-1.5 text-sm transition-colors cursor-pointer animate-fade-in"
                [ngClass]="rla.isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'"
                [attr.aria-label]="item.label + ' для ' + selectedRestaurant.restaurant_name"
              >
                <lucide-icon [name]="item.icon" [size]="16" class="shrink-0"></lucide-icon>
                <span>{{ item.label }}</span>
              </a>
            </ng-container>
          </nav>
          <div class="p-3 text-xs text-gray-400 border-t border-gray-200">
            © 2026 / ver: 9.6.1.240000
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
          class="rounded-lg border px-4 py-3 shadow-lg min-w-[300px] animate-slide-up"
          [ngClass]="{
            'border-gray-200 bg-white': t.variant === 'default',
            'border-red-200 bg-red-50': t.variant === 'destructive',
            'border-orange-200 bg-orange-50': t.variant === 'warning'
          }"
        >
          <p class="text-sm font-medium"
            [ngClass]="{
              'text-gray-900': t.variant === 'default',
              'text-red-800': t.variant === 'destructive',
              'text-orange-800': t.variant === 'warning'
            }"
          >{{ t.title }}</p>
          <p *ngIf="t.description" class="text-xs mt-0.5"
            [ngClass]="{
              'text-gray-500': t.variant === 'default',
              'text-red-600': t.variant === 'destructive',
              'text-orange-600': t.variant === 'warning'
            }"
          >{{ t.description }}</p>
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

  // v1.4: Restaurant context
  selectedRestaurant: Restaurant | null = null;

  // v1.4: Sub-items (level 2) — visible only when restaurant is selected
  subItems: SidebarItem[] = [
    { icon: 'bot', label: 'Роботы PUDU', route: 'robots' },
    { icon: 'map-pin', label: 'Маппинг столов', route: 'mapping' },
    { icon: 'settings', label: 'Настройки роботов', route: 'settings' },
  ];

  // Toast state
  toasts: { id: number; title: string; description?: string; variant: 'default' | 'destructive' | 'warning' }[] = [];
  private toastCounter = 0;

  constructor() {
    // Track navigation to detect when user is on root screen
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const basePath = '/prototype/pudu-admin';
      // If navigated to root, clear context
      if (e.urlAfterRedirects === basePath || e.urlAfterRedirects === basePath + '/') {
        this.selectedRestaurant = null;
      }
    });
  }

  // v1.4: Restaurant context methods
  setRestaurantContext(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
  }

  clearRestaurantContext(): void {
    this.selectedRestaurant = null;
  }

  goToRestaurants(): void {
    this.selectedRestaurant = null;
    this.router.navigate(['/prototype/pudu-admin']);
  }

  /** Get current screen label for breadcrumb */
  getCurrentScreenLabel(): string {
    const url = this.router.url;
    if (url.includes('/robots')) return 'Роботы PUDU';
    if (url.includes('/mapping')) return 'Маппинг столов';
    if (url.includes('/settings')) return 'Настройки роботов';
    return '';
  }

  showToast(title: string, description?: string, duration = 3000, variant: 'default' | 'destructive' | 'warning' = 'default') {
    const id = ++this.toastCounter;
    const t = { id, title, description, variant };
    this.toasts.push(t);
    setTimeout(() => {
      this.toasts = this.toasts.filter(x => x.id !== id);
    }, duration);
  }

  trackToast(_: number, item: { id: number }) {
    return item.id;
  }
}
