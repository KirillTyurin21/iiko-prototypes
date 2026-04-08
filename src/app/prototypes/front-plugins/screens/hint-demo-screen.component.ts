import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiBreadcrumbsComponent } from '@/components/ui';
import { HintCardDialogComponent } from '../components/hint-card-dialog.component';
import { HintData, OrderDish } from '../data/hint-types';
import { MOCK_ORDER_DISHES, MOCK_MENU_ITEMS, MOCK_QUICK_MENU, HINT_VARIANT_A } from '../data/hint-mock-data';

/**
 * Вариант A: Имитация экрана редактирования заказа Front.
 * При нажатии на блюдо в меню — появляется подсказка.
 */
@Component({
  selector: 'app-hint-demo-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiBreadcrumbsComponent,
    HintCardDialogComponent,
  ],
  template: `
    <div class="p-6 max-w-6xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <ui-breadcrumbs [items]="breadcrumbs" class="mb-6"></ui-breadcrumbs>

      <!-- Описание -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-start gap-3">
          <lucide-icon name="info" [size]="18" class="text-app-primary mt-0.5 flex-shrink-0"></lucide-icon>
          <div class="text-sm text-text-secondary leading-relaxed">
            <p class="mb-1"><strong>Демо:</strong> Нажмите на любое блюдо в правой части экрана (меню), чтобы увидеть модальное окно подсказки.</p>
            <p>Здесь показан <strong>Дизайн 1 «Карточка товара»</strong> — горизонтальный layout. Другие варианты дизайна — на
              <a (click)="goToVariants()" class="text-app-primary hover:underline cursor-pointer">странице сравнения</a>.
            </p>
          </div>
        </div>
      </div>

      <!-- Имитация экрана Front -->
      <div class="rounded-xl overflow-hidden border border-white/10 shadow-xl" style="height: 620px;">
        <div class="flex h-full bg-[#1a1a1a]">

          <!-- ЛЕВАЯ ЧАСТЬ: Чек заказа -->
          <div class="w-[340px] flex flex-col border-r border-white/10 bg-[#222]">
            <!-- Header заказа -->
            <div class="flex items-center justify-between px-3 py-2 bg-[#2a2a2a] border-b border-white/10 text-white/60 text-xs">
              <div class="flex items-center gap-2">
                <lucide-icon name="receipt" [size]="14" class="text-white/40"></lucide-icon>
                <span>08.04 14:12</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="bg-[#3a3a3a] px-2 py-0.5 rounded text-[10px]">291</span>
                <lucide-icon name="user" [size]="14" class="text-white/40"></lucide-icon>
                <span>user</span>
              </div>
            </div>

            <!-- Позиции заказа -->
            <div class="flex-1 overflow-auto">
              <div *ngFor="let dish of orderDishes; let i = index"
                   class="flex items-center justify-between px-3 py-2 border-b border-white/5 text-sm"
                   [ngClass]="{
                     'bg-yellow-600/20 text-yellow-200': i === 0,
                     'text-white/80': i !== 0
                   }">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span *ngIf="dish.qty > 1" class="text-white/40 text-xs">{{ dish.qty }}×</span>
                  <span class="truncate">{{ dish.name }}</span>
                  <lucide-icon *ngIf="i < 2" name="alert-triangle" [size]="12" class="text-yellow-500 flex-shrink-0"></lucide-icon>
                </div>
                <span class="ml-2 text-white/50 flex-shrink-0" *ngIf="dish.price > 0">{{ dish.price | number:'1.2-2' }} р.</span>
              </div>
            </div>

            <!-- Итого -->
            <div class="border-t border-white/10 bg-[#2a2a2a] px-3 py-3">
              <div class="flex justify-between text-xs text-white/40 mb-1">
                <span>СКИДКА: <span class="text-white/60">10,00%</span></span>
                <span>подытог <span class="text-white/60">{{ subtotal | number:'1.2-2' }} р.</span></span>
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-xs text-white/40">НАДБАВКА: <span class="text-white/60">0,00%</span></span>
                <span class="text-white text-2xl font-bold">{{ total | number:'1.2-2' }} р.</span>
              </div>
            </div>

            <!-- Bottom bar -->
            <div class="flex items-center justify-between px-3 py-2 bg-[#2a2a2a] border-t border-white/10">
              <div class="flex items-center gap-4 text-white/50">
                <lucide-icon name="plus" [size]="20"></lucide-icon>
                <span class="text-white/50 text-lg">—</span>
                <span class="text-sm">123</span>
                <lucide-icon name="settings" [size]="18"></lucide-icon>
                <lucide-icon name="list" [size]="18"></lucide-icon>
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </div>
            </div>
          </div>

          <!-- ПРАВАЯ ЧАСТЬ: Меню -->
          <div class="flex-1 flex flex-col">
            <!-- Навигация категорий -->
            <div class="flex items-center gap-1 px-3 py-2 bg-[#2a2a2a] border-b border-white/10">
              <button class="p-1.5 text-white/40 hover:text-white/60">
                <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
              </button>
              <button class="p-1.5 text-white/40 hover:text-white/60">
                <lucide-icon name="search" [size]="16"></lucide-icon>
              </button>
              <button class="p-1.5 text-white/40 hover:text-white/60">
                <lucide-icon name="layout-dashboard" [size]="16"></lucide-icon>
              </button>
              <button class="p-1.5 text-white/40 hover:text-white/60">
                <lucide-icon name="package" [size]="16"></lucide-icon>
              </button>
              <button class="p-1.5 text-white/40 hover:text-white/60">
                <lucide-icon name="clock" [size]="16"></lucide-icon>
              </button>
              <div class="flex-1"></div>
              <!-- Tabs -->
              <div class="flex gap-0">
                <button class="px-4 py-1.5 text-sm font-medium bg-[#c9a84c] text-[#1a1a1a] rounded-t">I</button>
                <button class="px-4 py-1.5 text-sm text-white/40 hover:text-white/60">II</button>
                <button class="px-4 py-1.5 text-sm text-white/40 hover:text-white/60">III</button>
              </div>
            </div>

            <!-- Сетка блюд -->
            <div class="flex-1 flex">
              <div class="flex-1 grid grid-cols-3 auto-rows-min gap-0 p-0 overflow-auto">
                <button *ngFor="let item of menuItems"
                        (click)="onMenuItemClick(item)"
                        class="border border-white/5 text-center py-6 px-2 transition-all duration-150
                               hover:bg-white/5 active:bg-white/10"
                        [ngClass]="{
                          'bg-teal-800/40 text-white/80 hover:bg-teal-800/60': item.isCategory,
                          'text-white/60': !item.isCategory
                        }">
                  <span class="text-sm font-medium">{{ item.name }}</span>
                </button>
              </div>

              <!-- Быстрые кнопки справа -->
              <div class="w-[130px] border-l border-white/10 bg-[#2a2a2a]">
                <button *ngFor="let name of quickMenu"
                        (click)="onQuickMenuClick(name)"
                        class="w-full py-4 px-2 text-sm text-white/60 border-b border-white/5
                               hover:bg-white/5 active:bg-white/10 transition-all text-center">
                  {{ name }}
                </button>
              </div>
            </div>

            <!-- Нижняя навигация -->
            <div class="flex items-center justify-between px-2 py-2 bg-[#2a2a2a] border-t border-white/10 text-xs text-white/40">
              <div class="flex items-center gap-1">
                <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
                <span>НАЗАД</span>
              </div>
              <div class="flex items-center gap-1">
                <lucide-icon name="clock" [size]="14"></lucide-icon>
                <span>ЗАКРЫТЫЕ ЗАКА…</span>
              </div>
              <div class="flex items-center gap-1">
                <lucide-icon name="chevronsUpDown" [size]="14"></lucide-icon>
                <span>ДОПОЛНЕНИЯ</span>
              </div>
              <div class="flex-1"></div>
              <div class="flex items-center gap-1">
                <lucide-icon name="star" [size]="14"></lucide-icon>
                <span>ВНЕ ОЧЕРЕДИ</span>
              </div>
              <div class="flex items-center gap-1 ml-4">
                <lucide-icon name="receipt" [size]="14"></lucide-icon>
                <span>КАССА</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Уведомление о добавлении -->
      <div *ngIf="addedMessage"
           class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#b8c959] text-[#1a1a1a] px-6 py-3 rounded-xl
                  font-semibold shadow-lg animate-slide-up z-40">
        ✅ {{ addedMessage }}
      </div>

      <!-- Модальное окно подсказки (Дизайн 1: Карточка) -->
      <hint-card-dialog
        [open]="showHint"
        [hint]="currentHint"
        (add)="onHintAdd()"
        (decline)="onHintDecline()">
      </hint-card-dialog>
    </div>
  `,
})
export class HintDemoScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigateByUrl('/') },
    { label: 'Плагины Front', onClick: () => this.router.navigateByUrl('/prototype/front-plugins') },
    { label: 'Подсказки', onClick: () => this.router.navigateByUrl('/prototype/front-plugins/hints') },
    { label: 'Демо: Экран заказа' },
  ];

  orderDishes = [...MOCK_ORDER_DISHES];
  menuItems = MOCK_MENU_ITEMS;
  quickMenu = MOCK_QUICK_MENU;
  currentHint: HintData = HINT_VARIANT_A;
  showHint = false;
  addedMessage = '';

  get subtotal(): number {
    return this.orderDishes.reduce((s, d) => s + d.price * d.qty, 0);
  }

  get total(): number {
    return this.subtotal * 0.9; // 10% скидка
  }

  onMenuItemClick(item: OrderDish): void {
    if (item.isCategory) return;
    this.triggerHint();
  }

  onQuickMenuClick(name: string): void {
    this.triggerHint();
  }

  private triggerHint(): void {
    this.showHint = true;
  }

  onHintAdd(): void {
    this.showHint = false;
    const rec = this.currentHint.recommendation;
    this.orderDishes.push({
      id: 'added-' + Date.now(),
      name: rec.name,
      price: rec.discountedPrice ?? rec.price,
      qty: 1,
      category: '',
    });
    this.showNotification(`${rec.name} добавлен в заказ`);
  }

  onHintDecline(): void {
    this.showHint = false;
  }

  goToVariants(): void {
    this.router.navigateByUrl('/prototype/front-plugins/hints/variants');
  }

  private showNotification(msg: string): void {
    this.addedMessage = msg;
    setTimeout(() => this.addedMessage = '', 3000);
  }
}
