import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiBreadcrumbsComponent, UiBadgeComponent } from '@/components/ui';
import { HintCardDialogComponent } from '../components/hint-card-dialog.component';
import { HintPosDialogComponent } from '../components/hint-pos-dialog.component';
import { HintAnatomyPanelComponent } from '../components/hint-anatomy-panel.component';
import { HintData } from '../data/hint-types';
import {
  HINT_FULL_DISCOUNT,
  HINT_FULL_NO_DISCOUNT,
  HINT_NOIMG_DISCOUNT,
  HINT_NOIMG_NO_DISCOUNT,
  HINT_LONG_TEXT,
  HINT_BIG_DISCOUNT,
} from '../data/hint-mock-data';

type DesignType = 'card-add-first' | 'card-vertical' | 'card-icon-right' | 'card-two-squares' | 'pos';
type DataVariant = '1' | '2' | '3' | '4' | '5' | '6';

/**
 * Экран сравнения вариантов дизайна окна подсказки.
 * Три варианта + интерактивная анатомия с аннотациями источников данных.
 */
@Component({
  selector: 'app-hint-variants-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiBreadcrumbsComponent,
    UiBadgeComponent,
    HintCardDialogComponent,
    HintPosDialogComponent,
    HintAnatomyPanelComponent,
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <ui-breadcrumbs [items]="breadcrumbs" class="mb-6"></ui-breadcrumbs>

      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-text-primary mb-2">Сравнение вариантов дизайна</h1>
        <p class="text-text-secondary text-sm">
          Нажмите на карточку варианта, чтобы открыть анатомию карточки подсказки с аннотациями источников данных.
        </p>
      </div>

      <!-- Переключатель данных -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-center gap-3 mb-3">
          <lucide-icon name="bar-chart-3" [size]="16" class="text-text-secondary"></lucide-icon>
          <span class="text-sm font-medium text-text-primary">Набор демо-данных:</span>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button *ngFor="let v of dataVariants"
                  (click)="selectData(v.key)"
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                  [ngClass]="{
                    'bg-app-primary text-white border-app-primary': selectedData === v.key,
                    'bg-surface text-text-secondary border-border hover:border-app-primary': selectedData !== v.key
                  }">
            {{ v.label }}
          </button>
        </div>
        <p class="text-xs text-text-disabled mt-2">{{ currentDataDescription }}</p>
      </div>

      <!-- 5 вариантов дизайна -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

        <!-- Вариант 1: Кнопки горизонтально, Добавить слева -->
        <div (click)="toggleExpanded('card-add-first')"
             class="group bg-surface rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
             [ngClass]="{
               'border-app-primary shadow-card-hover': expandedDesign === 'card-add-first',
               'border-border hover:border-app-primary/40 hover:shadow-card-hover': expandedDesign !== 'card-add-first'
             }">
          <div class="h-1.5" [ngClass]="{'bg-app-primary': expandedDesign === 'card-add-first', 'bg-[#2d2d2d]': expandedDesign !== 'card-add-first'}"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="columns" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                Вариант 1: Кнопки в ряд
              </h3>
            </div>
            <div class="bg-[#2d2d2d] rounded-lg p-3 mb-3">
              <div class="flex gap-2">
                <div class="w-10 h-10 bg-[#3a3a3a] border border-white/10 flex items-center justify-center text-xs" style="border-radius: 0;">🍎</div>
                <div class="flex-1">
                  <div class="h-2 w-20 bg-white/20 mb-1" style="border-radius: 0;"></div>
                  <div class="h-1.5 w-16 bg-white/10 mb-1" style="border-radius: 0;"></div>
                  <div class="h-2 w-12 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
                </div>
              </div>
              <div class="flex gap-0 mt-2 border-t border-white/10 pt-1">
                <div class="flex-1 h-5 bg-[#c9a84c]/20 border-r border-white/10" style="border-radius: 0;"></div>
                <div class="flex-1 h-5 bg-white/10" style="border-radius: 0;"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Добавить слева, Отказаться справа. Горизонтальное расположение кнопок.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="success">Основной</ui-badge>
              <ui-badge variant="default">Горизонтальный</ui-badge>
            </div>
          </div>
        </div>

        <!-- Вариант 2: Кнопки вертикально -->
        <div (click)="toggleExpanded('card-vertical')"
             class="group bg-surface rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
             [ngClass]="{
               'border-app-primary shadow-card-hover': expandedDesign === 'card-vertical',
               'border-border hover:border-app-primary/40 hover:shadow-card-hover': expandedDesign !== 'card-vertical'
             }">
          <div class="h-1.5" [ngClass]="{'bg-app-primary': expandedDesign === 'card-vertical', 'bg-[#2d2d2d]': expandedDesign !== 'card-vertical'}"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="rows" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                Вариант 2: Кнопки столбцом
              </h3>
            </div>
            <div class="bg-[#2d2d2d] rounded-lg p-3 mb-3">
              <div class="flex gap-2">
                <div class="w-10 h-10 bg-[#3a3a3a] border border-white/10 flex items-center justify-center text-xs" style="border-radius: 0;">🍎</div>
                <div class="flex-1">
                  <div class="h-2 w-20 bg-white/20 mb-1" style="border-radius: 0;"></div>
                  <div class="h-1.5 w-16 bg-white/10 mb-1" style="border-radius: 0;"></div>
                  <div class="h-2 w-12 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
                </div>
              </div>
              <div class="mt-2 border-t border-white/10 pt-1 space-y-0">
                <div class="h-5 bg-[#c9a84c]/20 border-b border-white/10" style="border-radius: 0;"></div>
                <div class="h-5 bg-white/10" style="border-radius: 0;"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Добавить сверху, Отказаться снизу. Вертикальное расположение кнопок.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="warning">Альтернативный</ui-badge>
              <ui-badge variant="default">Вертикальный</ui-badge>
            </div>
          </div>
        </div>

        <!-- Вариант 3: Иконка-кнопка справа (Руслан) -->
        <div (click)="toggleExpanded('card-icon-right')"
             class="group bg-surface rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
             [ngClass]="{
               'border-app-primary shadow-card-hover': expandedDesign === 'card-icon-right',
               'border-border hover:border-app-primary/40 hover:shadow-card-hover': expandedDesign !== 'card-icon-right'
             }">
          <div class="h-1.5" [ngClass]="{'bg-app-primary': expandedDesign === 'card-icon-right', 'bg-[#2d2d2d]': expandedDesign !== 'card-icon-right'}"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="shopping-cart" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                Вариант 3: Иконка-кнопка
              </h3>
            </div>
            <!-- Мини-превью: контент + квадратная кнопка справа -->
            <div class="bg-[#2d2d2d] rounded-lg p-3 mb-3">
              <div class="flex gap-2">
                <div class="w-10 h-10 bg-[#3a3a3a] border border-white/10 flex items-center justify-center text-xs" style="border-radius: 0;">🍎</div>
                <div class="flex-1">
                  <div class="h-2 w-20 bg-white/20 mb-1" style="border-radius: 0;"></div>
                  <div class="h-1.5 w-16 bg-white/10 mb-1" style="border-radius: 0;"></div>
                  <div class="h-2 w-12 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
                </div>
                <div class="w-10 h-10 bg-[#c9a84c]/40 flex items-center justify-center" style="border-radius: 0;">
                  <span class="text-[8px] text-white/80">🛒</span>
                </div>
              </div>
              <div class="mt-2 border-t border-white/10 pt-1">
                <div class="h-5 bg-white/10" style="border-radius: 0;"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Квадратная иконка-кнопка «Добавить» справа от контента. «Отказаться» на всю ширину внизу.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="info">Новый</ui-badge>
              <ui-badge variant="default">Тач-френдли</ui-badge>
            </div>
          </div>
        </div>

        <!-- Вариант 4: Два квадрата (Кирилл) -->
        <div (click)="toggleExpanded('card-two-squares')"
             class="group bg-surface rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
             [ngClass]="{
               'border-app-primary shadow-card-hover': expandedDesign === 'card-two-squares',
               'border-border hover:border-app-primary/40 hover:shadow-card-hover': expandedDesign !== 'card-two-squares'
             }">
          <div class="h-1.5" [ngClass]="{'bg-app-primary': expandedDesign === 'card-two-squares', 'bg-[#2d2d2d]': expandedDesign !== 'card-two-squares'}"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="layout-grid" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                Вариант 4: Два квадрата
              </h3>
            </div>
            <!-- Мини-превью: контент + два квадрата снизу -->
            <div class="bg-[#2d2d2d] rounded-lg p-3 mb-3">
              <div class="flex gap-2">
                <div class="w-10 h-10 bg-[#3a3a3a] border border-white/10 flex items-center justify-center text-xs" style="border-radius: 0;">🍎</div>
                <div class="flex-1">
                  <div class="h-2 w-20 bg-white/20 mb-1" style="border-radius: 0;"></div>
                  <div class="h-1.5 w-16 bg-white/10 mb-1" style="border-radius: 0;"></div>
                  <div class="h-2 w-12 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
                </div>
              </div>
              <div class="flex gap-0 mt-2 border-t border-white/10 pt-1">
                <div class="flex-1 h-10 bg-white/10 border-r border-white/10 flex items-center justify-center" style="border-radius: 0;">
                  <span class="text-[8px] text-white/40">✕</span>
                </div>
                <div class="flex-1 h-10 bg-[#c9a84c]/20 flex items-center justify-center" style="border-radius: 0;">
                  <span class="text-[8px] text-white/60">🛒</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Два больших квадрата: «Отказаться» слева, «Добавить» справа. Максимально простой выбор.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="info">Новый</ui-badge>
              <ui-badge variant="default">Квадраты</ui-badge>
            </div>
          </div>
        </div>

        <!-- Вариант 5: POS -->
        <div (click)="toggleExpanded('pos')"
             class="group bg-surface rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
             [ngClass]="{
               'border-app-primary shadow-card-hover': expandedDesign === 'pos',
               'border-border hover:border-app-primary/40 hover:shadow-card-hover': expandedDesign !== 'pos'
             }">
          <div class="h-1.5" [ngClass]="{'bg-app-primary': expandedDesign === 'pos', 'bg-[#3a3a3a]': expandedDesign !== 'pos'}"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="monitor" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                Вариант 5: «Компактный POS»
              </h3>
            </div>
            <!-- Мини-превью -->
            <div class="bg-[#3a3a3a] rounded-lg p-3 mb-3">
              <div class="flex items-center gap-1 mb-1">
                <div class="h-1.5 w-3 bg-white/30" style="border-radius: 0;"></div>
                <div class="h-1.5 w-14 bg-white/20" style="border-radius: 0;"></div>
              </div>
              <div class="h-1.5 w-24 bg-[#c9a84c]/30 mb-2" style="border-radius: 0;"></div>
              <div class="bg-[#2d2d2d] p-1.5 flex items-center gap-1 mb-2 border border-white/10" style="border-radius: 0;">
                <div class="w-6 h-6 bg-[#1a1a1a] flex items-center justify-center text-[8px]" style="border-radius: 0;">🍽️</div>
                <div class="flex-1">
                  <div class="h-1.5 w-12 bg-white/20" style="border-radius: 0;"></div>
                </div>
                <div class="h-2 w-6 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
              </div>
              <div class="flex gap-0 border-t border-white/10 pt-1">
                <div class="flex-1 h-5 bg-white/10 border-r border-white/10" style="border-radius: 0;"></div>
                <div class="flex-1 h-5 bg-[#c9a84c]/20" style="border-radius: 0;"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Компактная строка-карточка с товаром. Консистентный стиль Front.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="info">Консистентный</ui-badge>
              <ui-badge variant="default">POS-стиль</ui-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Панель анатомии (раскрывается при клике на вариант) -->
      <div *ngIf="expandedDesign" class="mb-8">
        <hint-anatomy-panel
          [designType]="expandedDesign"
          [hint]="activeHint"
          (openModal)="openDesignModal(expandedDesign)">
        </hint-anatomy-panel>
      </div>

      <!-- Таблица сравнения -->
      <div class="bg-surface rounded-xl border border-border overflow-hidden">
        <div class="px-5 py-3 bg-surface-secondary border-b border-border">
          <h2 class="text-sm font-semibold text-text-primary">Сравнительная таблица</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left px-5 py-3 text-text-secondary font-medium">Критерий</th>
                <th class="text-center px-3 py-3 text-text-secondary font-medium text-xs">В ряд</th>
                <th class="text-center px-3 py-3 text-text-secondary font-medium text-xs">Столбцом</th>
                <th class="text-center px-3 py-3 text-text-secondary font-medium text-xs">Иконка</th>
                <th class="text-center px-3 py-3 text-text-secondary font-medium text-xs">Квадраты</th>
                <th class="text-center px-3 py-3 text-text-secondary font-medium text-xs">POS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of comparisonData" class="border-b border-border/60">
                <td class="px-5 py-2.5 text-text-primary">{{ row.label }}</td>
                <td class="text-center px-3 py-2.5">{{ row.addFirst }}</td>
                <td class="text-center px-3 py-2.5">{{ row.vertical }}</td>
                <td class="text-center px-3 py-2.5">{{ row.iconRight }}</td>
                <td class="text-center px-3 py-2.5">{{ row.twoSquares }}</td>
                <td class="text-center px-3 py-2.5">{{ row.pos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Модалки (открываются по кнопке из панели анатомии) -->
      <hint-card-dialog
        [open]="activeModal === 'card-add-first'"
        [hint]="activeHint"
        buttonLayout="add-first"
        (add)="closeModal()"
        (decline)="closeModal()">
      </hint-card-dialog>

      <hint-card-dialog
        [open]="activeModal === 'card-vertical'"
        [hint]="activeHint"
        buttonLayout="vertical"
        (add)="closeModal()"
        (decline)="closeModal()">
      </hint-card-dialog>

      <hint-card-dialog
        [open]="activeModal === 'card-icon-right'"
        [hint]="activeHint"
        buttonLayout="icon-right"
        (add)="closeModal()"
        (decline)="closeModal()">
      </hint-card-dialog>

      <hint-card-dialog
        [open]="activeModal === 'card-two-squares'"
        [hint]="activeHint"
        buttonLayout="two-squares"
        (add)="closeModal()"
        (decline)="closeModal()">
      </hint-card-dialog>

      <hint-pos-dialog
        [open]="activeModal === 'pos'"
        [hint]="activeHint"
        (add)="closeModal()"
        (decline)="closeModal()">
      </hint-pos-dialog>
    </div>
  `,
})
export class HintVariantsScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigateByUrl('/') },
    { label: 'Плагины Front', onClick: () => this.router.navigateByUrl('/prototype/front-plugins') },
    { label: 'Подсказки', onClick: () => this.router.navigateByUrl('/prototype/front-plugins/hints') },
    { label: 'Сравнение вариантов' },
  ];

  expandedDesign: DesignType | null = null;
  activeModal: DesignType | null = null;
  selectedData: DataVariant = '1';

  dataVariants: { key: DataVariant; label: string }[] = [
    { key: '1', label: 'Со скидкой (Полный)' },
    { key: '2', label: 'Без скидки (Полный)' },
    { key: '3', label: 'Со скидкой (Без картинки)' },
    { key: '4', label: 'Без скидки (Без картинки)' },
    { key: '5', label: 'Длинные тексты' },
    { key: '6', label: 'Большая скидка (–50%)' },
  ];

  comparisonData = [
    { label: 'Скорость выбора', addFirst: '⭐⭐⭐', vertical: '⭐⭐', iconRight: '⭐⭐⭐', twoSquares: '⭐⭐⭐', pos: '⭐⭐⭐' },
    { label: 'Удобство для тач', addFirst: '⭐⭐', vertical: '⭐⭐⭐', iconRight: '⭐⭐⭐', twoSquares: '⭐⭐⭐', pos: '⭐⭐' },
    { label: 'Заметность «Добавить»', addFirst: '⭐⭐⭐', vertical: '⭐⭐⭐', iconRight: '⭐⭐⭐', twoSquares: '⭐⭐', pos: '⭐⭐' },
    { label: 'Заметность «Отказаться»', addFirst: '⭐⭐⭐', vertical: '⭐⭐', iconRight: '⭐⭐⭐', twoSquares: '⭐⭐⭐', pos: '⭐⭐⭐' },
    { label: 'Консистентность с Front', addFirst: '⭐⭐⭐', vertical: '⭐⭐', iconRight: '⭐⭐', twoSquares: '⭐⭐', pos: '⭐⭐⭐' },
    { label: 'Компактность', addFirst: '⭐⭐⭐', vertical: '⭐⭐', iconRight: '⭐⭐', twoSquares: '⭐⭐', pos: '⭐⭐⭐' },
  ];

  private hintMap: Record<DataVariant, HintData> = {
    '1': HINT_FULL_DISCOUNT,
    '2': HINT_FULL_NO_DISCOUNT,
    '3': HINT_NOIMG_DISCOUNT,
    '4': HINT_NOIMG_NO_DISCOUNT,
    '5': HINT_LONG_TEXT,
    '6': HINT_BIG_DISCOUNT,
  };

  get activeHint(): HintData {
    return this.hintMap[this.selectedData];
  }

  get currentDataDescription(): string {
    const descs: Record<DataVariant, string> = {
      '1': 'Полный набор: картинка, скидка (–7 ₽), описание с триггер-блюдом',
      '2': 'Полный набор без скидки: картинка, обычная цена, описание',
      '3': 'Без картинки: скидка (–15%), слоган и описание',
      '4': 'Минимальная подсказка: без картинки, без скидки, без описания',
      '5': 'Стресс-тест: длинное название товара (40+ символов), длинный слоган',
      '6': 'Агрессивная акция: скидка –50% (490 ₽ → 245 ₽)',
    };
    return descs[this.selectedData];
  }

  selectData(key: DataVariant): void {
    this.selectedData = key;
  }

  toggleExpanded(design: DesignType): void {
    this.expandedDesign = this.expandedDesign === design ? null : design;
  }

  openDesignModal(design: DesignType): void {
    this.activeModal = design;
  }

  closeModal(): void {
    this.activeModal = null;
  }
}
