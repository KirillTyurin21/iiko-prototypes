import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HintData } from '../data/hint-types';

/**
 * Дизайн 1: «Карточка товара» — в стилистике диалоговых окон iiko Front.
 * Тёмный фон, прямые углы, жёлтые заголовки, чёрные кнопки.
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
      <div class="relative bg-[#3a3a3a] text-white w-full max-w-[520px] mx-4 shadow-2xl animate-scale-in border border-white/10"
           style="border-radius: 0;">

        <!-- Метка ПОДСКАЗКА — сверху слева -->
        <div class="px-5 pt-4 pb-1">
          <span class="text-[11px] font-medium uppercase tracking-widest text-white/40">Подсказка</span>
        </div>

        <!-- Заголовок — по центру -->
        <div class="px-5 pb-3">
          <h2 class="text-center text-lg font-bold text-[#c9a84c]">{{ hint.title }}</h2>
        </div>

        <!-- Слоган — слева, жёлтый акцент без обрамления -->
        <div class="px-5 pb-4">
          <p class="text-[#c9a84c] text-sm leading-snug">{{ hint.slogan }}</p>
        </div>

        <!-- Разделитель -->
        <div class="border-t border-white/10 mx-5"></div>

        <!-- Контент: картинка + информация -->
        <div class="px-5 py-4">
          <div class="flex gap-4">
            <!-- Картинка -->
            <div *ngIf="hint.imageUrl" class="flex-shrink-0">
              <div class="w-[110px] h-[110px] overflow-hidden bg-[#2d2d2d] border border-white/10"
                   style="border-radius: 0;">
                <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                     class="w-full h-full object-cover"
                     (error)="onImageError($event)">
              </div>
            </div>

            <!-- Информация о блюде -->
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-lg mb-2">{{ hint.recommendation.name }}</h3>

              <!-- Описание: только «Вы добавили ...» -->
              <p *ngIf="triggerText" class="text-sm text-white/50 leading-relaxed mb-3">
                {{ triggerText }}
              </p>

              <!-- Цена -->
              <div class="flex items-baseline gap-2">
                <span *ngIf="hint.recommendation.discountedPrice !== null"
                      class="text-2xl font-bold text-[#c9a84c]">
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
                      class="text-xs text-[#c9a84c] font-medium ml-1">
                  –{{ hint.recommendation.discountAmount }} ₽
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки — чёрные, в стиле iiko -->
        <div class="border-t border-white/10">
          <div class="flex">
            <button (click)="onDecline()"
                    class="flex-1 py-4 text-center text-white/70 font-bold text-base
                           bg-[#2a2a2a] hover:bg-[#333] active:bg-[#222] transition-colors
                           border-r border-white/10"
                    style="border-radius: 0;">
              Отказаться
            </button>
            <button (click)="onAdd()"
                    class="flex-1 py-4 text-center text-[#c9a84c] font-bold text-base
                           bg-[#2a2a2a] hover:bg-[#333] active:bg-[#222] transition-colors"
                    style="border-radius: 0;">
              Добавить {{ hint.recommendation.name }}
              <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
            </button>
          </div>
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

  /** Извлекает только часть «Вы добавили ...» из description */
  get triggerText(): string {
    if (!this.hint.description) return '';
    const dotIdx = this.hint.description.indexOf('.');
    if (dotIdx > 0) {
      return this.hint.description.substring(0, dotIdx + 1);
    }
    return this.hint.description;
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
