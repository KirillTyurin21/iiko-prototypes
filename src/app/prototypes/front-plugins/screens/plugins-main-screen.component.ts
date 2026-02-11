import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiCardComponent, UiCardContentComponent } from '@/components/ui';
import { UiBadgeComponent } from '@/components/ui';
import { MOCK_PLUGINS } from '../data/mock-data';

@Component({
  selector: 'app-plugins-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiCardComponent,
    UiCardContentComponent,
    UiBadgeComponent,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
      <!-- Заголовок -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-[#3a3a3a] flex items-center justify-center">
            <lucide-icon name="monitor" [size]="24" class="text-[#b8c959]"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-text-primary">Плагины Front</h1>
            <p class="text-sm text-text-secondary">Макеты модальных окон для кассовых плагинов</p>
          </div>
        </div>
      </div>

      <!-- Описание -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-start gap-3">
          <lucide-icon name="info" [size]="18" class="text-app-primary mt-0.5 flex-shrink-0"></lucide-icon>
          <p class="text-sm text-text-secondary leading-relaxed">
            Здесь представлены макеты модальных окон (попапов), которые будут реализованы
            разработчиками на кассовом терминале Front. Каждый плагин содержит набор окон
            для демонстрации UX-сценариев.
          </p>
        </div>
      </div>

      <!-- Список плагинов -->
      <div class="space-y-4">
        <div
          *ngFor="let plugin of plugins"
          (click)="goToPlugin(plugin)"
          class="group bg-surface rounded-xl border border-border hover:border-app-primary/40
                 hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <!-- Тёмная POS-полоска -->
          <div class="h-1.5 w-full bg-[#3a3a3a]"></div>

          <div class="p-6">
            <div class="flex items-start gap-5">
              <!-- Иконка плагина -->
              <div class="w-16 h-16 rounded-xl bg-[#3a3a3a] flex items-center justify-center flex-shrink-0
                          group-hover:bg-[#2d2d2d] transition-colors">
                <lucide-icon [name]="plugin.icon" [size]="32" class="text-[#b8c959]"></lucide-icon>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-2">
                  <h2 class="text-lg font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                    {{ plugin.name }}
                  </h2>
                  <ui-badge variant="default">{{ plugin.dialogCount }} окон</ui-badge>
                </div>
                <p class="text-sm text-text-secondary leading-relaxed mb-3">
                  {{ plugin.description }}
                </p>

                <!-- Мини-превью типов окон -->
                <div class="flex flex-wrap gap-1.5">
                  <span *ngFor="let tag of pluginTags"
                        class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium
                               bg-surface-secondary text-text-secondary border border-border/60">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Стрелка -->
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
export class PluginsMainScreenComponent {
  private router = inject(Router);

  plugins = MOCK_PLUGINS;
  pluginTags = [
    'Поиск клиента', 'Оплата', 'Бонусы', 'Регистрация',
    'Ошибки', 'Загрузка', 'Успех',
  ];

  goToPlugin(plugin: typeof MOCK_PLUGINS[0]): void {
    if (plugin.link) {
      this.router.navigateByUrl(plugin.link);
    } else {
      this.router.navigate(['/prototype/front-plugins', plugin.id]);
    }
  }
}
