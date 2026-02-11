import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiBreadcrumbsComponent } from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-demo-main-screen',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiBreadcrumbsComponent, IconsModule],
  template: `
    <div class="max-w-3xl">
      <ui-breadcrumbs [items]="[{label: 'Демо-прототип'}]"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <h2 class="text-xl font-medium text-text-primary">Главный экран плагина</h2>
        <p class="text-sm text-text-secondary mt-1">Это главное окно плагина. Нажмите на карточку, чтобы перейти к соответствующему экрану.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ui-card *ngFor="let action of pluginActions" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(action.route)">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" [ngClass]="action.color">
              <lucide-icon [name]="action.icon" [size]="24"></lucide-icon>
            </div>
            <div>
              <h3 class="font-medium text-text-primary">{{ action.title }}</h3>
              <p class="text-sm text-text-secondary mt-0.5">{{ action.description }}</p>
            </div>
          </div>
        </ui-card>
      </div>
    </div>
  `,
})
export class DemoMainScreenComponent {
  private router = inject(Router);

  pluginActions = [
    { icon: 'list', title: 'Список элементов', description: 'Таблица с данными, сортировка, выбор строки', route: 'list', color: 'bg-blue-50 text-app-primary' },
    { icon: 'file-edit', title: 'Форма ввода', description: 'Поля, валидация, модальное окно', route: 'form', color: 'bg-green-50 text-app-success' },
    { icon: 'bar-chart-3', title: 'Отчёт', description: 'Пример информационного экрана', route: '', color: 'bg-orange-50 text-app-accent' },
    { icon: 'settings', title: 'Настройки', description: 'Настройки плагина', route: '', color: 'bg-gray-50 text-text-secondary' },
  ];

  navigate(route: string): void {
    if (route) {
      this.router.navigate(['/prototype/demo/' + route]);
    }
  }
}
