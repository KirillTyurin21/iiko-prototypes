import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeMode } from '../../types';

/**
 * Панель режимов слева в конструкторе тем (как панель слайдов в PowerPoint).
 * Карточки-миниатюры с превью элементов режима, сворачивание, добавление кастомных режимов.
 */
@Component({
  selector: 'app-mode-panel',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="mode-panel" [class.collapsed]="collapsed">
      <ng-container *ngIf="!collapsed">
        <div class="mp-header">
          <span class="mp-title">Режимы</span>
          <button type="button" class="mp-collapse" (click)="toggleCollapse.emit()" title="Свернуть панель" aria-label="Свернуть панель">
            <lucide-icon name="chevrons-left" [size]="16"></lucide-icon>
          </button>
        </div>
        <div class="mp-list">
          <div
            class="mp-card"
            *ngFor="let m of modes"
            [class.active]="m.id === activeModeId"
            (click)="selectMode.emit(m.id)"
            [attr.aria-current]="m.id === activeModeId ? 'true' : null">
            <div class="mp-thumb" [style.width.px]="thumbWidth" [style.height.px]="thumbHeight">
              <div
                class="mp-thumb-scale"
                [style.width.px]="canvasWidth"
                [style.height.px]="canvasHeight"
                [style.transform]="'scale(' + thumbScale + ')'">
                <div
                  class="mp-el"
                  *ngFor="let el of m.elements"
                  [style.left.px]="el.x"
                  [style.top.px]="el.y"
                  [style.width.px]="el.width"
                  [style.height.px]="el.height"
                  [style.background-color]="elementColor(el.type)"></div>
              </div>
              <div class="mp-thumb-empty" *ngIf="!m.elements?.length">Пусто</div>
            </div>
            <div class="mp-card-body">
              <span class="mp-name" [title]="m.name">{{ m.name }}</span>
              <span class="mp-id" *ngIf="m.isCustom">{{ m.id }}</span>
            </div>
            <button
              type="button"
              class="mp-delete"
              *ngIf="m.isCustom"
              (click)="deleteMode.emit(m.id); $event.stopPropagation()"
              title="Удалить режим"
              aria-label="Удалить режим">
              <lucide-icon name="x" [size]="12"></lucide-icon>
            </button>
          </div>
        </div>
        <div class="mp-footer">
          <button type="button" class="mp-add" (click)="addMode.emit()">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            <span>Добавить режим</span>
          </button>
        </div>
      </ng-container>

      <ng-container *ngIf="collapsed">
        <button type="button" class="mp-expand" (click)="toggleCollapse.emit()" title="Развернуть панель режимов" aria-label="Развернуть панель режимов">
          <lucide-icon name="chevrons-right" [size]="16"></lucide-icon>
        </button>
        <button
          type="button"
          class="mp-mini"
          *ngFor="let m of modes"
          [class.active]="m.id === activeModeId"
          (click)="selectMode.emit(m.id)"
          [title]="m.name"
          [attr.aria-label]="'Режим ' + m.name">
          {{ m.name.charAt(0) }}
        </button>
        <button type="button" class="mp-add-mini" (click)="addMode.emit()" title="Добавить режим" aria-label="Добавить режим">
          <lucide-icon name="plus" [size]="16"></lucide-icon>
        </button>
      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mode-panel {
      width: 172px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-right: 1px solid #D6D6D6;
      font-family: Roboto, sans-serif;
    }
    .mode-panel.collapsed {
      width: 36px;
      align-items: center;
      padding-top: 8px;
      gap: 6px;
    }
    .mp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 10px 8px 12px;
    }
    .mp-title {
      font-size: 12px;
      font-weight: 500;
      color: #616161;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .mp-collapse, .mp-expand {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #616161;
      cursor: pointer;
    }
    .mp-collapse:hover, .mp-expand:hover { background: #EBEBEB; }
    .mp-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mp-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px;
      border: 1px solid #D6D6D6;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      transition: box-shadow 0.12s ease-out, border-color 0.12s ease-out;
    }
    .mp-card:hover {
      box-shadow: 0 2px 2px 0 rgba(224, 224, 224, 1), 0 1px 1px 0 rgba(214, 214, 214, 1);
      border-color: #9E9E9E;
    }
    .mp-card.active {
      border-color: #448AFF;
      background: #F0F5FF;
      box-shadow: none;
    }
    .mp-thumb {
      position: relative;
      overflow: hidden;
      background: #F8F9FC;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      align-self: center;
    }
    .mp-thumb-scale {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: top left;
      background: #fff;
    }
    .mp-el {
      position: absolute;
      border: 1px solid rgba(0,0,0,0.18);
      border-radius: 1px;
    }
    .mp-thumb-empty {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #9E9E9E;
    }
    .mp-card-body {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 2px 2px;
    }
    .mp-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #333333;
    }
    .mp-id {
      font-size: 11px;
      font-weight: 500;
      color: #448AFF;
      background: rgba(68, 138, 255, 0.12);
      border-radius: 999px;
      padding: 1px 7px;
      flex-shrink: 0;
    }
    .mp-card.active .mp-id { background: #FFFFFF; }
    .mp-delete {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border: none;
      border-radius: 4px;
      background: rgba(255,255,255,0.9);
      color: #9E9E9E;
      cursor: pointer;
    }
    .mp-delete:hover { background: #FFF2F2; color: #FF5252; }
    .mp-footer { padding: 8px; border-top: 1px solid #D6D6D6; }
    .mp-add {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      height: 36px;
      border: 1px solid #448AFF;
      border-radius: 4px;
      background: #FFFFFF;
      color: #448AFF;
      font-size: 13px;
      font-weight: 500;
      font-family: Roboto, sans-serif;
      cursor: pointer;
    }
    .mp-add:hover { background: rgba(68, 138, 255, 0.06); }
    .mp-mini, .mp-add-mini {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 1px solid #D6D6D6;
      border-radius: 4px;
      background: #fff;
      color: #616161;
      font-size: 12px;
      font-weight: 500;
      font-family: Roboto, sans-serif;
      cursor: pointer;
    }
    .mp-mini:hover, .mp-add-mini:hover { background: #EBEBEB; }
    .mp-mini.active { border-color: #448AFF; background: #F0F5FF; color: #448AFF; }
    .mp-collapse:focus-visible, .mp-expand:focus-visible, .mp-card:focus-visible,
    .mp-add:focus-visible, .mp-mini:focus-visible, .mp-add-mini:focus-visible, .mp-delete:focus-visible {
      outline: 2px solid #448aff;
      outline-offset: -2px;
    }
  `],
})
export class ModePanelComponent {
  @Input() modes: ArrivalsThemeMode[] = [];
  @Input() activeModeId: string | null = null;
  @Input() collapsed = false;
  /** Разрешение холста для расчёта миниатюры */
  @Input() canvasWidth = 1024;
  @Input() canvasHeight = 768;

  @Output() selectMode = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() addMode = new EventEmitter<void>();
  @Output() deleteMode = new EventEmitter<string>();

  get thumbWidth(): number { return 124; }
  get thumbHeight(): number {
    return Math.max(36, Math.round(this.thumbWidth * Math.max(1, this.canvasHeight) / Math.max(1, this.canvasWidth)));
  }
  get thumbScale(): number { return this.thumbWidth / Math.max(1, this.canvasWidth); }

  /** Цвет заполнителя элемента в миниатюре по типу (пастель WFDS) */
  elementColor(type: string): string {
    switch (type) {
      case 'area': return '#A8C9FF';
      case 'text': return '#E0E0E0';
      case 'image': return '#97E8B9';
      case 'price': return '#FFD9A8';
      case 'menulist': return '#FFE0B2';
      case 'advertise': return '#E1BEE7';
      case 'counter': return '#A8C9FF';
      default: return '#ECEFF1';
    }
  }
}
