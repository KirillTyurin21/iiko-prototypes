import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiBreadcrumbsComponent, UiBadgeComponent } from '@/components/ui';

/**
 * Хаб-экран подсказок: два режима (Демо + Сравнение вариантов).
 */
@Component({
  selector: 'app-hint-hub-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, UiBreadcrumbsComponent, UiBadgeComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <ui-breadcrumbs [items]="breadcrumbs" class="mb-6"></ui-breadcrumbs>

      <!-- Заголовок -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-[#3a3a3a] flex items-center justify-center">
            <lucide-icon name="lightbulb" [size]="24" class="text-[#b8c959]"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-text-primary">Digital Signage — Подсказки</h1>
            <p class="text-sm text-text-secondary">Макеты модального окна подсказки для кассира (DS-575)</p>
          </div>
        </div>
      </div>

      <!-- Описание -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-start gap-3">
          <lucide-icon name="info" [size]="18" class="text-app-primary mt-0.5 flex-shrink-0"></lucide-icon>
          <p class="text-sm text-text-secondary leading-relaxed">
            Когда кассир добавляет блюдо в заказ, появляется модальное окно с предложением допродажи.
            Окно блокирует интерфейс — закрыть можно только кнопками «Добавить» или «Отказаться».
          </p>
        </div>
      </div>

      <!-- Два режима -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Демо: Экран заказа -->
        <div (click)="goTo('demo')"
             class="group bg-surface rounded-xl border border-border hover:border-app-primary/40
                    hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden">
          <div class="h-1.5 w-full bg-[#3a3a3a]"></div>
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-xl bg-[#3a3a3a] flex items-center justify-center flex-shrink-0
                          group-hover:bg-[#2d2d2d] transition-colors">
                <lucide-icon name="monitor-play" [size]="28" class="text-[#b8c959]"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h2 class="text-lg font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                    Демо: Экран заказа
                  </h2>
                  <ui-badge variant="success">Интерактив</ui-badge>
                </div>
                <p class="text-sm text-text-secondary leading-relaxed mb-3">
                  Имитация экрана Front с чеком и меню. Нажмите на блюдо — появится окно подсказки в контексте реального интерфейса.
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded
                               bg-surface-secondary text-text-secondary border border-border/60">
                    Экран заказа
                  </span>
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded
                               bg-surface-secondary text-text-secondary border border-border/60">
                    Модальное окно
                  </span>
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded
                               bg-surface-secondary text-text-secondary border border-border/60">
                    Добавление в заказ
                  </span>
                </div>
              </div>
              <div class="flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <lucide-icon name="chevron-right" [size]="24" class="text-app-primary"></lucide-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Сравнение вариантов -->
        <div (click)="goTo('variants')"
             class="group bg-surface rounded-xl border border-border hover:border-app-primary/40
                    hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden">
          <div class="h-1.5 w-full bg-gradient-to-r from-[#b8c959] via-[#d4e87c] to-[#b8c959]"></div>
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-xl bg-[#3a3a3a] flex items-center justify-center flex-shrink-0
                          group-hover:bg-[#2d2d2d] transition-colors">
                <lucide-icon name="layout-grid" [size]="28" class="text-[#b8c959]"></lucide-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h2 class="text-lg font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                    Сравнение 3 вариантов
                  </h2>
                  <ui-badge variant="warning">Выбор</ui-badge>
                </div>
                <p class="text-sm text-text-secondary leading-relaxed mb-3">
                  Три дизайна окна: «Карточка», «Баннер», «POS». Переключайте данные (со скидкой, без картинки, комбо) и сравнивайте.
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded
                               bg-surface-secondary text-text-secondary border border-border/60">
                    3 дизайна
                  </span>
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded
                               bg-surface-secondary text-text-secondary border border-border/60">
                    3 набора данных
                  </span>
                  <span class="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded
                               bg-surface-secondary text-text-secondary border border-border/60">
                    Таблица сравнения
                  </span>
                </div>
              </div>
              <div class="flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <lucide-icon name="chevron-right" [size]="24" class="text-app-primary"></lucide-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HintHubScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigateByUrl('/') },
    { label: 'Плагины Front', onClick: () => this.router.navigateByUrl('/prototype/front-plugins') },
    { label: 'Подсказки' },
  ];

  goTo(page: 'demo' | 'variants'): void {
    this.router.navigateByUrl(`/prototype/front-plugins/hints/${page}`);
  }
}
