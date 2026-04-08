import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HintData } from '../data/hint-types';

/**
 * Дизайн 2: «Акцентный баннер» — вертикальный layout.
 * Крупный слоган, кнопка «Добавить» на всю ширину, «Отказаться» — ghost.
 */
@Component({
  selector: 'hint-banner-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Overlay (НЕ кликабельный) -->
      <div class="absolute inset-0 bg-black/60"></div>

      <!-- Dialog -->
      <div class="relative bg-[#2d2d2d] rounded-2xl text-white w-full max-w-[480px] mx-4 shadow-2xl animate-scale-in border border-white/10 overflow-hidden">
        <!-- Акцентная полоса сверху -->
        <div class="h-1.5 bg-gradient-to-r from-[#b8c959] via-[#d4e87c] to-[#b8c959]"></div>

        <!-- Картинка + Заголовок -->
        <div class="px-6 pt-6 pb-2 text-center">
          <div *ngIf="hint.imageUrl" class="mx-auto w-[100px] h-[100px] rounded-2xl overflow-hidden bg-[#3a3a3a] border border-white/10 mb-4">
            <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                 class="w-full h-full object-cover"
                 (error)="onImageError($event)">
          </div>
          <div *ngIf="!hint.imageUrl" class="mx-auto w-[80px] h-[80px] rounded-2xl bg-[#3a3a3a] border border-white/10 flex items-center justify-center mb-4">
            <span class="text-4xl">🍽️</span>
          </div>
          <h2 class="text-lg font-bold text-white mb-1">{{ hint.title }}</h2>
        </div>

        <!-- Слоган-баннер -->
        <div class="mx-6 mb-4">
          <div class="bg-gradient-to-r from-[#b8c959]/20 to-[#b8c959]/10 rounded-xl px-5 py-4 border border-[#b8c959]/30 text-center">
            <p class="text-[#b8c959] font-bold text-lg leading-snug">{{ hint.slogan }}</p>
          </div>
        </div>

        <!-- Блюдо и цена -->
        <div class="px-6 pb-2 text-center">
          <h3 class="text-white font-semibold text-xl mb-1">{{ hint.recommendation.name }}</h3>

          <!-- Атрибуты -->
          <div *ngIf="hint.recommendation.attributes.length" class="flex flex-wrap justify-center gap-1.5 mb-2">
            <span *ngFor="let attr of hint.recommendation.attributes"
                  class="text-xs text-white/50 bg-white/10 rounded-full px-2.5 py-0.5">
              {{ attr }}
            </span>
          </div>

          <!-- Описание -->
          <p *ngIf="hint.description" class="text-sm text-white/50 leading-relaxed mb-3 max-w-[360px] mx-auto">
            {{ hint.description }}
          </p>

          <!-- Цена — крупная -->
          <div class="flex items-baseline justify-center gap-3 mb-1">
            <span *ngIf="hint.recommendation.discountedPrice !== null"
                  class="text-3xl font-extrabold text-[#b8c959]">
              {{ hint.recommendation.discountedPrice }} ₽
            </span>
            <span *ngIf="hint.recommendation.discountedPrice === null"
                  class="text-3xl font-extrabold text-white">
              {{ hint.recommendation.price }} ₽
            </span>
            <span *ngIf="hint.recommendation.oldPrice !== null && hint.recommendation.discountedPrice !== null"
                  class="text-lg text-white/30 line-through">
              {{ hint.recommendation.oldPrice }} ₽
            </span>
          </div>
          <div *ngIf="hint.recommendation.discountName" class="mb-4">
            <span class="text-sm text-[#b8c959]/80 font-medium">
              {{ hint.recommendation.discountName }} (–{{ hint.recommendation.discountAmount }} ₽)
            </span>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="px-6 pb-6 space-y-2">
          <button (click)="onAdd()"
                  class="w-full py-4.5 rounded-xl bg-[#b8c959] text-[#1a1a1a] font-bold text-base
                         hover:bg-[#c9da6a] active:bg-[#a7b84a] transition-colors shadow-lg shadow-[#b8c959]/20"
                  style="padding-top: 18px; padding-bottom: 18px;">
            Добавить {{ hint.recommendation.name }}
            <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
          </button>
          <button (click)="onDecline()"
                  class="w-full py-3 text-white/40 font-medium text-sm
                         hover:text-white/60 transition-colors text-center">
            Отказаться
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HintBannerDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() hint!: HintData;
  @Output() add = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();

  get displayPrice(): number | null {
    return this.hint.recommendation.discountedPrice ?? this.hint.recommendation.price;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  onAdd(): void {
    this.add.emit();
  }

  onDecline(): void {
    this.decline.emit();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
