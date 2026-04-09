import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { HintData } from '../data/hint-types';

interface AnnotationItem {
  id: number;
  element: string;
  source: string;
  color: string;
}

type DesignType = 'card-add-first' | 'card-vertical' | 'card-icon-right' | 'card-two-squares' | 'pos';

/**
 * Панель «Анатомия карточки» — inline-рендер окна подсказки
 * с цветными аннотациями-маркерами, показывающими источник каждого поля.
 */
@Component({
  selector: 'hint-anatomy-panel',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="bg-surface rounded-xl border border-border overflow-hidden animate-slide-up">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 bg-surface-secondary border-b border-border flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <lucide-icon name="info" [size]="16" class="text-app-primary"></lucide-icon>
          <span class="text-sm font-semibold text-text-primary">Анатомия: {{ designLabel }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="openModal.emit()"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-surface hover:bg-surface-secondary border border-border text-text-secondary
                         hover:text-text-primary transition-all">
            <lucide-icon name="maximize-2" [size]="14"></lucide-icon>
            Модальное окно
          </button>
          <button (click)="showAnnotations = !showAnnotations"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  [ngClass]="{
                    'bg-app-primary/10 text-app-primary border border-app-primary/30': showAnnotations,
                    'bg-surface hover:bg-surface-secondary border border-border text-text-secondary': !showAnnotations
                  }">
            <lucide-icon [name]="showAnnotations ? 'eye' : 'eye-off'" [size]="14"></lucide-icon>
            {{ showAnnotations ? 'Скрыть' : 'Показать' }} источники
          </button>
        </div>
      </div>

      <!-- Content: Dialog + Legend -->
      <div class="flex flex-col lg:flex-row gap-6 p-6">

        <!-- ===== LEFT: Inline dialog ===== -->
        <div class="flex-shrink-0 mx-auto lg:mx-0">

          <!-- ===== CARD VARIANT (add-first / vertical) ===== -->
          <div *ngIf="isCard"
               class="bg-[#3a3a3a] text-white shadow-2xl border border-white/10"
               style="border-radius: 0; width: 480px; max-width: 100%;">

            <!-- ① ПОДСКАЗКА -->
            <div class="px-5 pt-4 pb-1 relative">
              <span class="text-[11px] font-medium uppercase tracking-widest text-white/40">Подсказка</span>
              <span *ngIf="showAnnotations"
                    class="absolute top-2 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #6b7280;">1</span>
            </div>

            <!-- ② Заголовок -->
            <div class="px-5 pb-3 relative">
              <h2 class="text-center text-lg font-bold text-white">{{ hint.title }}</h2>
              <span *ngIf="showAnnotations"
                    class="absolute top-0 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #3b82f6;">2</span>
            </div>

            <!-- ③ Слоган -->
            <div class="px-5 pb-4 relative">
              <p class="text-[#c9a84c] text-sm leading-snug">{{ hint.slogan }}</p>
              <span *ngIf="showAnnotations"
                    class="absolute top-0 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #3b82f6;">3</span>
            </div>

            <div class="border-t border-white/10 mx-5"></div>

            <!-- Контент: картинка + информация -->
            <div class="px-5 py-4" [ngClass]="{'pr-0': designType === 'card-icon-right'}">
              <div class="flex gap-4" [ngClass]="{'items-stretch': designType === 'card-icon-right'}">
                <!-- ④ Картинка -->
                <div *ngIf="hint.imageUrl" class="flex-shrink-0 relative">
                  <div class="w-[110px] h-[110px] overflow-hidden bg-[#2d2d2d] border border-white/10"
                       style="border-radius: 0;">
                    <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                         class="w-full h-full object-cover">
                  </div>
                  <span *ngIf="showAnnotations"
                        class="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #3b82f6;">4</span>
                </div>

                <div class="flex-1 min-w-0">
                  <!-- ⑤ Название товара -->
                  <div class="relative inline-block mb-2">
                    <h3 class="text-white font-semibold text-lg">{{ hint.recommendation.name }}</h3>
                    <span *ngIf="showAnnotations"
                          class="absolute -top-2 -right-6 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                          style="background-color: #10b981;">5</span>
                  </div>

                  <!-- ⑥ Триггер-текст -->
                  <div *ngIf="triggerText" class="relative mb-3">
                    <p class="text-sm text-white/50 leading-relaxed">{{ triggerText }}</p>
                    <span *ngIf="showAnnotations"
                          class="absolute top-0 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                          style="background-color: #8b5cf6;">6</span>
                  </div>

                  <!-- Цены -->
                  <div class="flex items-baseline gap-2 flex-wrap">
                    <!-- ⑦ Цена -->
                    <span *ngIf="hint.recommendation.discountedPrice !== null"
                          class="text-2xl font-bold text-[#c9a84c] relative">
                      {{ hint.recommendation.discountedPrice }} ₽
                      <span *ngIf="showAnnotations"
                            class="absolute -top-3 -right-3 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                            style="background-color: #f59e0b;">7</span>
                    </span>
                    <span *ngIf="hint.recommendation.discountedPrice === null"
                          class="text-2xl font-bold text-white relative">
                      {{ hint.recommendation.price }} ₽
                      <span *ngIf="showAnnotations"
                            class="absolute -top-3 -right-3 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                            [style.background-color]="'#10b981'">7</span>
                    </span>

                    <!-- ⑧ Старая цена -->
                    <span *ngIf="hint.recommendation.oldPrice !== null && hint.recommendation.discountedPrice !== null"
                          class="text-sm text-white/40 line-through relative">
                      {{ hint.recommendation.oldPrice }} ₽
                      <span *ngIf="showAnnotations"
                            class="absolute -top-2 -right-3 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                            style="background-color: #10b981;">8</span>
                    </span>

                    <!-- ⑨ Размер скидки -->
                    <span *ngIf="hint.recommendation.discountAmount !== null"
                          class="text-xs text-[#c9a84c] font-medium ml-1 relative">
                      –{{ hint.recommendation.discountAmount }} ₽
                      <span *ngIf="showAnnotations"
                            class="absolute -top-2 -right-3 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                            style="background-color: #f59e0b;">9</span>
                    </span>
                  </div>
                </div>

                <!-- ⑩ Кнопка-иконка «Добавить» справа (icon-right) -->
                <div *ngIf="designType === 'card-icon-right'"
                     class="flex-shrink-0 w-[90px] bg-[#c9a84c] flex flex-col items-center justify-center text-[#2a2a2a] border-l border-white/10 relative"
                     style="border-radius: 0;">
                  <lucide-icon name="shopping-cart" [size]="28"></lucide-icon>
                  <span class="text-xs font-bold mt-1.5">Добавить</span>
                  <span *ngIf="showAnnotations"
                        class="absolute top-1 right-1 min-w-[20px] h-5 px-0.5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #f97316;">10</span>
                </div>
              </div>
            </div>

            <!-- ⑩ Кнопки: add-first (горизонтальные) -->
            <div *ngIf="designType === 'card-add-first'" class="border-t border-white/10">
              <div class="flex">
                <div class="flex-1 py-4 text-center text-[#c9a84c] font-bold text-base bg-[#2a2a2a] border-r border-white/10 relative"
                     style="border-radius: 0;">
                  Добавить {{ hint.recommendation.name }}
                  <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
                  <span *ngIf="showAnnotations"
                        class="absolute top-1 right-1 min-w-[20px] h-5 px-0.5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #f97316;">10</span>
                </div>
                <div class="flex-1 py-4 text-center text-white/70 font-bold text-base bg-[#2a2a2a]"
                     style="border-radius: 0;">
                  Отказаться
                </div>
              </div>
            </div>

            <!-- ⑩ Кнопки: vertical -->
            <div *ngIf="designType === 'card-vertical'" class="border-t border-white/10">
              <div class="w-full py-4 text-center text-[#c9a84c] font-bold text-base bg-[#2a2a2a] border-b border-white/10 relative"
                   style="border-radius: 0;">
                Добавить {{ hint.recommendation.name }}
                <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
                <span *ngIf="showAnnotations"
                      class="absolute top-1 right-1 min-w-[20px] h-5 px-0.5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                      style="background-color: #f97316;">10</span>
              </div>
              <div class="w-full py-4 text-center text-white/70 font-bold text-base bg-[#2a2a2a]"
                   style="border-radius: 0;">
                Отказаться
              </div>
            </div>

            <!-- Кнопка «Отказаться» на всю ширину (icon-right) — кнопка «Добавить» уже в контенте -->
            <div *ngIf="designType === 'card-icon-right'" class="border-t border-white/10">
              <div class="w-full py-5 text-center text-white/70 font-bold text-base bg-[#2a2a2a]"
                   style="border-radius: 0;">
                Отказаться
              </div>
            </div>

            <!-- ⑩ Два квадрата: Отказаться слева, Добавить справа (two-squares) -->
            <div *ngIf="designType === 'card-two-squares'" class="border-t border-white/10">
              <div class="flex">
                <div class="flex-1 py-7 flex flex-col items-center justify-center gap-2
                            bg-[#2a2a2a] border-r border-white/10"
                     style="border-radius: 0;">
                  <lucide-icon name="x" [size]="28" class="text-white/50"></lucide-icon>
                  <span class="text-white/70 font-bold text-sm">Отказаться</span>
                </div>
                <div class="flex-1 py-7 flex flex-col items-center justify-center gap-2
                            bg-[#2a2a2a] relative"
                     style="border-radius: 0;">
                  <lucide-icon name="shopping-cart" [size]="28" class="text-[#c9a84c]"></lucide-icon>
                  <span class="text-[#c9a84c] font-bold text-sm">Добавить</span>
                  <span *ngIf="displayPrice" class="text-[#c9a84c]/70 text-xs">{{ displayPrice }} ₽</span>
                  <span *ngIf="showAnnotations"
                        class="absolute top-1 right-1 min-w-[20px] h-5 px-0.5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #f97316;">10</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== POS VARIANT ===== -->
          <div *ngIf="!isCard"
               class="bg-[#3a3a3a] text-white shadow-2xl border border-white/10"
               style="border-radius: 0; width: 460px; max-width: 100%;">

            <!-- ① ПОДСКАЗКА -->
            <div class="px-5 pt-4 pb-1 relative">
              <span class="text-[11px] font-medium uppercase tracking-widest text-white/40">Подсказка</span>
              <span *ngIf="showAnnotations"
                    class="absolute top-2 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #6b7280;">1</span>
            </div>

            <!-- ② Заголовок -->
            <div class="px-5 pb-2 relative">
              <h2 class="text-center text-base font-bold text-white">{{ hint.title }}</h2>
              <span *ngIf="showAnnotations"
                    class="absolute top-0 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #3b82f6;">2</span>
            </div>

            <!-- ③ Слоган -->
            <div class="px-5 pb-3 relative">
              <p class="text-[#c9a84c] text-sm leading-snug">{{ hint.slogan }}</p>
              <span *ngIf="showAnnotations"
                    class="absolute top-0 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #3b82f6;">3</span>
            </div>

            <!-- ⑥ Триггер-текст -->
            <div *ngIf="triggerText" class="px-5 pb-3 relative">
              <p class="text-xs text-white/40">{{ triggerText }}</p>
              <span *ngIf="showAnnotations"
                    class="absolute top-0 right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                    style="background-color: #8b5cf6;">6</span>
            </div>

            <div class="border-t border-white/10 mx-5"></div>

            <!-- Карточка блюда — компактная строка -->
            <div class="px-5 py-3">
              <div class="flex items-center gap-3 bg-[#2d2d2d] border border-white/10 p-3 relative"
                   style="border-radius: 0;">
                <!-- ④ Картинка -->
                <div *ngIf="hint.imageUrl" class="w-[48px] h-[48px] overflow-hidden bg-[#1a1a1a] flex-shrink-0 relative"
                     style="border-radius: 0;">
                  <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                       class="w-full h-full object-cover">
                  <span *ngIf="showAnnotations"
                        class="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #3b82f6;">4</span>
                </div>
                <div *ngIf="!hint.imageUrl" class="w-[48px] h-[48px] bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center"
                     style="border-radius: 0;">
                  <span class="text-xl">🍽️</span>
                </div>

                <!-- ⑤ Название -->
                <div class="flex-1 min-w-0 relative">
                  <h3 class="text-white font-semibold text-sm truncate">{{ hint.recommendation.name }}</h3>
                  <div *ngIf="hint.recommendation.attributes.length" class="text-xs text-white/40 mt-0.5">
                    {{ hint.recommendation.attributes.join(' · ') }}
                  </div>
                  <span *ngIf="showAnnotations"
                        class="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #10b981;">5</span>
                </div>

                <!-- ⑦⑧⑨ Цена -->
                <div class="text-right flex-shrink-0 relative">
                  <div *ngIf="hint.recommendation.discountedPrice !== null" class="text-base font-bold text-[#c9a84c]">
                    {{ hint.recommendation.discountedPrice }} ₽
                  </div>
                  <div *ngIf="hint.recommendation.discountedPrice === null" class="text-base font-bold text-white">
                    {{ hint.recommendation.price }} ₽
                  </div>
                  <div *ngIf="hint.recommendation.oldPrice !== null && hint.recommendation.discountedPrice !== null"
                       class="text-xs text-white/30 line-through">
                    {{ hint.recommendation.oldPrice }} ₽
                  </div>
                  <div *ngIf="hint.recommendation.discountAmount !== null"
                       class="text-xs text-[#c9a84c]/70">
                    –{{ hint.recommendation.discountAmount }} ₽
                  </div>
                  <span *ngIf="showAnnotations"
                        class="absolute -top-3 -right-3 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        [style.background-color]="hint.recommendation.discountedPrice !== null ? '#f59e0b' : '#10b981'">7</span>
                </div>
              </div>
            </div>

            <!-- ⑩ Кнопки -->
            <div class="border-t border-white/10">
              <div class="flex">
                <div class="flex-1 py-3.5 text-center text-white/70 font-bold text-sm bg-[#2a2a2a] border-r border-white/10"
                     style="border-radius: 0;">
                  Отказаться
                </div>
                <div class="flex-1 py-3.5 text-center text-[#c9a84c] font-bold text-sm bg-[#2a2a2a] relative"
                     style="border-radius: 0;">
                  Добавить {{ hint.recommendation.name }}
                  <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
                  <span *ngIf="showAnnotations"
                        class="absolute top-1 right-1 min-w-[20px] h-5 px-0.5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg z-10"
                        style="background-color: #f97316;">10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== RIGHT: Legend ===== -->
        <div class="flex-1 min-w-[260px]">
          <h4 class="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
            <lucide-icon name="book-open" [size]="14" class="text-text-secondary"></lucide-icon>
            Источники данных
          </h4>
          <p class="text-xs text-text-disabled mb-4">
            Откуда подставляются значения в окно подсказки
          </p>

          <div class="space-y-1.5">
            <div *ngFor="let ann of visibleAnnotations"
                 class="flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-surface-secondary transition-colors">
              <span class="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                    [style.background-color]="ann.color">
                {{ ann.id }}
              </span>
              <div class="min-w-0">
                <div class="text-sm font-medium text-text-primary leading-tight">{{ ann.element }}</div>
                <div class="text-xs text-text-secondary leading-tight">{{ ann.source }}</div>
              </div>
            </div>
          </div>

          <!-- Легенда типов источников -->
          <div class="mt-5 pt-4 border-t border-border">
            <h5 class="text-xs font-medium text-text-disabled mb-2 uppercase tracking-wider">Типы источников</h5>
            <div class="flex flex-wrap gap-x-4 gap-y-1.5">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: #3b82f6;"></span>
                <span class="text-xs text-text-secondary">Панель админа</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: #10b981;"></span>
                <span class="text-xs text-text-secondary">Номенклатура</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: #8b5cf6;"></span>
                <span class="text-xs text-text-secondary">Автоматический</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: #f59e0b;"></span>
                <span class="text-xs text-text-secondary">Расчёт</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: #f97316;"></span>
                <span class="text-xs text-text-secondary">Составной</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: #6b7280;"></span>
                <span class="text-xs text-text-secondary">Статичный</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HintAnatomyPanelComponent {
  @Input() designType: DesignType = 'card-add-first';
  @Input() hint!: HintData;
  @Output() openModal = new EventEmitter<void>();

  showAnnotations = true;

  get isCard(): boolean {
    return this.designType !== 'pos';
  }

  get designLabel(): string {
    const labels: Record<DesignType, string> = {
      'card-add-first': 'Кнопки в ряд',
      'card-vertical': 'Кнопки столбцом',
      'card-icon-right': 'Иконка-кнопка справа',
      'card-two-squares': 'Два квадрата',
      'pos': 'Компактный POS',
    };
    return labels[this.designType];
  }

  get triggerText(): string {
    if (!this.hint.description) return '';
    const dotIdx = this.hint.description.indexOf('.');
    return dotIdx > 0 ? this.hint.description.substring(0, dotIdx + 1) : this.hint.description;
  }

  get displayPrice(): number | null {
    return this.hint.recommendation.discountedPrice ?? this.hint.recommendation.price;
  }

  get visibleAnnotations(): AnnotationItem[] {
    const hasDiscount = this.hint.recommendation.discountedPrice !== null;
    const result: AnnotationItem[] = [
      { id: 1, element: 'Маркер «ПОДСКАЗКА»', source: 'Статичный текст (плагин)', color: '#6b7280' },
      { id: 2, element: 'Заголовок', source: 'Панель админа → поле «Наименование»', color: '#3b82f6' },
      { id: 3, element: 'Слоган', source: 'Панель админа → поле «Текст подсказки»', color: '#3b82f6' },
    ];

    if (this.hint.imageUrl) {
      result.push({ id: 4, element: 'Картинка товара', source: 'Панель админа → загруженное изображение', color: '#3b82f6' });
    }

    result.push({ id: 5, element: 'Название товара', source: 'Номенклатура → название добавляемой позиции', color: '#10b981' });

    if (this.triggerText) {
      result.push({ id: 6, element: '«Вы добавили…»', source: 'Авто → блюдо, которое послужило триггером', color: '#8b5cf6' });
    }

    if (hasDiscount) {
      result.push({ id: 7, element: 'Цена со скидкой', source: 'Расчёт → цена после применения скидки', color: '#f59e0b' });
      if (this.hint.recommendation.oldPrice !== null) {
        result.push({ id: 8, element: 'Исходная цена (зачёркнутая)', source: 'Номенклатура → исходная цена товара', color: '#10b981' });
      }
      if (this.hint.recommendation.discountAmount !== null) {
        result.push({ id: 9, element: 'Размер скидки', source: 'Расчёт → разница между исходной и скидочной ценой', color: '#f59e0b' });
      }
    } else {
      result.push({ id: 7, element: 'Цена товара', source: 'Номенклатура → цена товара из прайс-листа', color: '#10b981' });
    }

    result.push({ id: 10, element: 'Кнопка «Добавить»', source: 'Составной → «Добавить» + название товара + цена', color: '#f97316' });

    return result;
  }
}
