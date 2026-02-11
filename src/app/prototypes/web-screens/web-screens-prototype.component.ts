import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { WebHeaderComponent } from './components/web-header.component';
import { WebSidebarComponent } from './components/web-sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-web-screens-prototype',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WebHeaderComponent,
    WebSidebarComponent,
  ],
  template: `
    <div class="web-shell">
      <!-- Header -->
      <app-web-header
        [pageTitle]="'Advertise screens'"
        (menuToggle)="toggleSidebar()"
      ></app-web-header>

      <!-- Sidebar -->
      <app-web-sidebar
        [collapsed]="sidebarCollapsed"
        [activeRoute]="activeRoute"
        (navigate)="onNavigate($event)"
      ></app-web-sidebar>

      <!-- Content -->
      <main
        class="web-content"
        [class.sidebar-collapsed]="sidebarCollapsed"
      >
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .web-shell {
      min-height: 100vh;
      background-color: #ffffff;
      font-family: Roboto, sans-serif;
    }
    .web-content {
      margin-top: 64px;
      margin-left: 256px;
      min-height: calc(100vh - 64px);
      padding: 20px 30px;
      background-color: #ffffff;
      transition: margin-left 0.4s cubic-bezier(.25,.8,.25,1);
    }
    .web-content.sidebar-collapsed {
      margin-left: 72px;
    }
    @media (max-width: 1023px) {
      .web-content {
        margin-left: 72px;
      }
    }
    @media (max-width: 767px) {
      .web-content {
        margin-left: 0;
        padding: 16px;
      }
    }
  `],
})
export class WebScreensPrototypeComponent {
  private router = inject(Router);

  sidebarCollapsed = false;
  activeRoute = 'displays';

  constructor() {
    // Определяем активный маршрут при загрузке и при навигации
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.updateActiveRoute(e.urlAfterRedirects);
      });

    // Инициализация из текущего URL
    this.updateActiveRoute(this.router.url);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onNavigate(route: string): void {
    this.router.navigate(['/prototype/web-screens', route]);
  }

  private updateActiveRoute(url: string): void {
    const segments = url.split('/');
    const last = segments[segments.length - 1];
    if (last && last !== 'web-screens') {
      this.activeRoute = last;
    }
  }
}
