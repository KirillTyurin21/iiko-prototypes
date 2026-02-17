import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiButtonComponent, UiAlertComponent } from '@/components/ui';
import { Restaurant } from '../types';
import { MOCK_RESTAURANTS } from '../data/mock-data';
import { PuduPrototypeComponent } from '../pudu-prototype.component';

@Component({
  selector: 'app-restaurants-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiButtonComponent, UiAlertComponent],
  template: `
    <!-- SUBHEADER -->
    <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
      <h1 class="text-lg font-semibold text-gray-900">Настройки PUDU</h1>
    </div>

    <!-- CONTENT -->
    <div class="bg-gray-50 p-6 flex-1 overflow-y-auto">

      <!-- LOADING -->
      <div *ngIf="isLoading" class="flex items-center justify-center h-64" role="status">
        <lucide-icon name="loader-2" [size]="32" class="animate-spin text-gray-400"></lucide-icon>
      </div>

      <!-- ERROR STATE -->
      <div *ngIf="!isLoading && hasError" class="animate-fade-in">
        <ui-alert
          variant="error"
          title="Не удалось загрузить список ресторанов. Попробуйте обновить страницу"
          [dismissible]="false"
        >
          <ui-button variant="outline" size="sm" iconName="refresh-cw" (click)="loadData()">Обновить</ui-button>
        </ui-alert>
      </div>

      <!-- EMPTY STATE (0 restaurants) -->
      <div *ngIf="!isLoading && !hasError && restaurants.length === 0" class="flex items-center justify-center h-64" role="status">
        <p class="text-gray-400 text-sm">Нет ресторанов, доступных для настройки PUDU</p>
      </div>

      <!-- WITH DATA -->
      <ng-container *ngIf="!isLoading && !hasError && restaurants.length > 0">
        <!-- SEARCH -->
        <div class="mb-4 relative" style="width: 320px;">
          <lucide-icon
            name="search"
            [size]="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
          ></lucide-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            class="w-80 h-9 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Поиск по названию ресторана..."
            aria-label="Поиск ресторана"
          />
        </div>

        <!-- EMPTY SEARCH -->
        <div *ngIf="filteredRestaurants.length === 0" class="flex items-center justify-center h-48" role="status">
          <p class="text-gray-400 text-sm">Ничего не найдено</p>
        </div>

        <!-- TABLE -->
        <div *ngIf="filteredRestaurants.length > 0" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Название ресторана (торгового предприятия) из платформы iiko">
                    Название ресторана
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Общее количество зарегистрированных роботов PUDU в этом ресторане (не считая удалённых)">
                    Всего роботов
                  </th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Количество роботов, которые сейчас подключены к облаку PUDU и доступны для выполнения задач">
                    Активных роботов
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title="Агрегированный статус готовности интеграции PUDU: настроены ли роботы, маппинг столов и сценарии">
                    Статус настройки
                  </th>
                  <th class="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let r of filteredRestaurants; let last = last"
                  class="cursor-pointer hover:bg-gray-100 transition-colors"
                  [class.border-b]="!last"
                  [class.border-gray-200]="!last"
                  role="link"
                  [attr.aria-label]="'Перейти к настройкам ' + r.restaurant_name"
                  (click)="selectRestaurant(r)"
                >
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {{ r.restaurant_name }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700 text-center">{{ r.robots_total }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700 text-center">{{ r.robots_online }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1.5 text-sm cursor-help"
                      [attr.aria-label]="'Статус настройки: ' + getStatusLabel(r.setup_status)"
                      [title]="getStatusTooltip(r.setup_status)"
                    >
                      <lucide-icon
                        *ngIf="r.setup_status === 'configured'"
                        name="check-circle-2"
                        [size]="16"
                        class="text-green-600"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="r.setup_status === 'partial'"
                        name="alert-circle"
                        [size]="16"
                        class="text-orange-500"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="r.setup_status === 'not_configured'"
                        name="circle"
                        [size]="16"
                        class="text-gray-300"
                      ></lucide-icon>
                      <span [ngClass]="{
                        'text-green-600': r.setup_status === 'configured',
                        'text-orange-500': r.setup_status === 'partial',
                        'text-gray-300': r.setup_status === 'not_configured'
                      }">{{ getStatusLabel(r.setup_status) }}</span>
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <lucide-icon name="chevron-right" [size]="16" class="text-gray-400" aria-hidden="true"></lucide-icon>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
  `],
})
export class RestaurantsScreenComponent implements OnInit {
  private router = inject(Router);
  parent = inject(PuduPrototypeComponent);

  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  isLoading = true;
  hasError = false;
  searchQuery = '';
  private searchTimeout: any = null;

  ngOnInit(): void {
    // Clear restaurant context when navigating back to Э0
    this.parent.clearRestaurantContext();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    setTimeout(() => {
      this.restaurants = [...MOCK_RESTAURANTS];
      this.filteredRestaurants = [...this.restaurants];
      this.isLoading = false;
    }, 1000);
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.filterRestaurants();
    }, 300);
  }

  filterRestaurants(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredRestaurants = [...this.restaurants];
    } else {
      this.filteredRestaurants = this.restaurants.filter(r =>
        r.restaurant_name.toLowerCase().includes(q)
      );
    }
  }

  getStatusLabel(status: Restaurant['setup_status']): string {
    switch (status) {
      case 'configured': return 'Настроено';
      case 'partial': return 'Частично';
      case 'not_configured': return 'Не настроено';
    }
  }

  getStatusTooltip(status: Restaurant['setup_status']): string {
    switch (status) {
      case 'configured': return 'Все настройки интеграции PUDU завершены: роботы зарегистрированы, маппинг столов выполнен, сценарии активированы';
      case 'partial': return 'Настройка интеграции PUDU выполнена частично: часть настроек ещё не завершена (проверьте роботов, маппинг столов и сценарии)';
      case 'not_configured': return 'Интеграция PUDU не настроена: роботы не зарегистрированы, маппинг столов и сценарии не настроены';
    }
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.parent.setRestaurantContext(restaurant);
    this.router.navigate(['/prototype/pudu-admin/robots']);
  }
}
