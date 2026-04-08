import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HintData } from '../data/hint-types';

/**
 * Дизайн 1: «Карточка товара» — горизонтальный layout.
 * Картинка слева, информация справа. Кнопка «Добавить» на всю ширину.
 */
@Component({
  selector: 'hint-card-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Overlay (НЕ кликабельный — закрытие только по кнопкам) -->
      <div class="absolute inset-0 bg-black/60"></div>

      <!-- Dialog -->
      <div class="relative bg-[#2d2d2d] rounded-2xl text-white w-full max-w-[520px] mx-4 shadow-2xl animate-scale-in border border-white/10">
        <!-- Header -->
        <div class="px-6 pt-6 pb-3">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 rounded-full bg-[#b8c959]"></div>
            <span class="text-xs font-medium uppercase tracking-wider text-white/50">Подсказка</span>
          </div>
          <h2 class="text-lg font-bold text-white">{{ hint.title }}</h2>
        </div>

        <!-- Слоган -->
        <div class="px-6 pb-4">
          <div class="bg-[#b8c959]/15 rounded-xl px-4 py-3 border border-[#b8c959]/30">
            <p class="text-[#b8c959] font-semibold text-base leading-snug">{{ hint.slogan }}</p>
          </div>
        </div>

        <!-- Контент: картинка + информация -->
        <div class="px-6 pb-4">
          <div class="flex gap-4">
            <!-- Картинка -->
            <div *ngIf="hint.imageUrl" class="flex-shrink-0">
              <div class="w-[120px] h-[120px] rounded-xl overflow-hidden bg-[#3a3a3a] border border-white/10">
                <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                     class="w-full h-full object-cover"
                     (error)="onImageError($event)">
              </div>
            </div>

            <!-- Информация о блюде -->
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-lg mb-1">{{ hint.recommendation.name }}</h3>

              <!-- Атрибуты -->
              <div *ngIf="hint.recommendation.attributes.length" class="flex flex-wrap gap-1.5 mb-2">
                <span *ngFor="let attr of hint.recommendation.attributes"
                      class="text-xs text-white/50 bg-white/10 rounded px-2 py-0.5">
                  {{ attr }}
                </span>
              </div>

              <!-- Описание -->
              <p *ngIf="hint.description" class="text-sm text-white/60 leading-relaxed mb-3">
                {{ hint.description }}
              </p>

              <!-- Цена -->
              <div class="flex items-baseline gap-2">
                <span *ngIf="hint.recommendation.discountedPrice !== null"
                      class="text-2xl font-bold text-[#b8c959]">
                  {{ hint.recommendation.discountedPrice }} ₽
                </span>
                <span *ngIf="hint.recommendation.discountedPrice === null"
                      class="text-2xl font-bold text-white">
                  {{ hint.recommendation.price }} ₽
                </span>
                <span *ngIf="hint.recommendation.oldPrice !== null && hint.recommendation.discountedPrice !== null"
                      class="text-sm text-white/40 line-through">
                  {{ hint.recommendation.oldPrice }} ₽
                </span>
                <span *ngIf="hint.recommendation.discountAmount !== null"
                      class="text-xs text-[#b8c959] bg-[#b8c959]/15 rounded px-1.5 py-0.5 font-medium">
                  –{{ hint.recommendation.discountAmount }} ₽
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="px-6 pb-6 space-y-2">
          <button (click)="onAdd()"
                  class="w-full py-4 rounded-xl bg-[#b8c959] text-[#1a1a1a] font-bold text-base
                         hover:bg-[#c9da6a] active:bg-[#a7b84a] transition-colors">
            Добавить {{ hint.recommendation.name }}
            <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
          </button>
          <button (click)="onDecline()"
                  class="w-full py-3.5 rounded-xl bg-white/10 text-white/70 font-medium text-base
                         hover:bg-white/15 active:bg-white/5 transition-colors">
            Отказаться
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HintCardDialogComponent implements OnChanges {
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
