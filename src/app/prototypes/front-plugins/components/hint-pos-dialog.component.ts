import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HintData } from '../data/hint-types';

/**
 * Дизайн 3: «Компактный POS» — в стиле существующих POS-диалогов Front.
 * Тёмный фон #3a3a3a, акцент #b8c959. Минималистичный. Блюдо в строке-карточке.
 */
@Component({
  selector: 'hint-pos-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Overlay (НЕ кликабельный) -->
      <div class="absolute inset-0 bg-black/60"></div>

      <!-- Dialog -->
      <div class="relative bg-[#3a3a3a] rounded-lg text-white w-full max-w-[500px] mx-4 animate-scale-in border border-white/5">
        <!-- Header — как в POS-диалогах -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-[#b8c959]"></div>
            <span class="text-white font-semibold">{{ hint.title }}</span>
          </div>
        </div>

        <!-- Слоган -->
        <div class="px-6 pt-5 pb-3">
          <p class="text-[#b8c959] font-medium text-base">{{ hint.slogan }}</p>
        </div>

        <!-- Описание -->
        <div *ngIf="hint.description" class="px-6 pb-3">
          <p class="text-sm text-white/50">{{ hint.description }}</p>
        </div>

        <!-- Карточка блюда — строка как в POS -->
        <div class="mx-6 mb-4 bg-[#2d2d2d] rounded-lg border border-white/10 overflow-hidden">
          <div class="flex items-center gap-3 p-3">
            <!-- Картинка (маленькая) -->
            <div *ngIf="hint.imageUrl" class="w-[56px] h-[56px] rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
              <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                   class="w-full h-full object-cover"
                   (error)="onImageError($event)">
            </div>
            <div *ngIf="!hint.imageUrl" class="w-[56px] h-[56px] rounded-lg bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center">
              <span class="text-2xl">🍽️</span>
            </div>

            <!-- Название и атрибуты -->
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-sm truncate">{{ hint.recommendation.name }}</h3>
              <div *ngIf="hint.recommendation.attributes.length" class="text-xs text-white/40 mt-0.5">
                {{ hint.recommendation.attributes.join(' · ') }}
              </div>
            </div>

            <!-- Цена -->
            <div class="text-right flex-shrink-0">
              <div *ngIf="hint.recommendation.discountedPrice !== null" class="text-lg font-bold text-[#b8c959]">
                {{ hint.recommendation.discountedPrice }} ₽
              </div>
              <div *ngIf="hint.recommendation.discountedPrice === null" class="text-lg font-bold text-white">
                {{ hint.recommendation.price }} ₽
              </div>
              <div *ngIf="hint.recommendation.oldPrice !== null && hint.recommendation.discountedPrice !== null"
                   class="text-xs text-white/30 line-through">
                {{ hint.recommendation.oldPrice }} ₽
              </div>
              <div *ngIf="hint.recommendation.discountAmount !== null"
                   class="text-xs text-[#b8c959]/70">
                –{{ hint.recommendation.discountAmount }} ₽
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки — как в POS -->
        <div class="px-6 pb-6 flex gap-3">
          <button (click)="onDecline()"
                  class="flex-1 py-3.5 rounded-lg bg-[#4a4a4a] text-white/70 font-medium text-sm
                         hover:bg-[#555] active:bg-[#444] transition-colors border border-white/10">
            Отказаться
          </button>
          <button (click)="onAdd()"
                  class="flex-1 py-3.5 rounded-lg bg-[#b8c959] text-[#1a1a1a] font-bold text-sm
                         hover:bg-[#c9da6a] active:bg-[#a7b84a] transition-colors">
            Добавить {{ hint.recommendation.name }}
            <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HintPosDialogComponent implements OnChanges {
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
