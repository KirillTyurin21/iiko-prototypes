import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeMode } from '../../types';

/**
 * Панель страниц слева в конструкторе тем (как панель слайдов в PowerPoint).
 * Карточки-миниатюры с превью элементов страницы, сворачивание, переименование карандашом,
 * ресайз перетаскиванием правой границы, добавление кастомных страниц.
 */
@Component({
  selector: 'app-mode-panel',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="mode-panel" [class.collapsed]="collapsed" [style.width.px]="collapsed ? 36 : width">
      <ng-container *ngIf="!collapsed">
        <div class="mp-header">
          <span class="mp-title">Страницы</span>
          <button type="button" class="mp-collapse" (click)="toggleCollapse.emit()" title="Свернуть панель" aria-label="Свернуть панель">
            <lucide-icon name="chevrons-left" [size]="16"></lucide-icon>
          </button>
        </div>
        <div class="mp-list">
          <div class="mp-empty" *ngIf="modes.length === 0">
            <span>Страниц пока нет</span>
          </div>
          <div
            class="mp-card"
            *ngFor="let m of modes"
            [class.active]="m.id === activeModeId"
            tabindex="0"
            (click)="selectMode.emit(m.id)"
            (keydown.enter)="selectMode.emit(m.id)"
            (keydown.space)="selectMode.emit(m.id); $event.preventDefault()"
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
              <ng-container *ngIf="editingId !== m.id">
                <span class="mp-name" [title]="m.name">{{ m.name }}</span>
                <span class="mp-id" *ngIf="m.isCustom">{{ m.id }}</span>
                <button
                  type="button"
                  class="mp-rename"
                  (click)="startRename(m); $event.stopPropagation()"
                  title="Переименовать страницу"
                  aria-label="Переименовать страницу">
                  <lucide-icon name="pencil" [size]="12"></lucide-icon>
                </button>
              </ng-container>
              <ng-container *ngIf="editingId === m.id">
                <input
                  class="mp-name-input"
                  type="text"
                  [value]="editName"
                  maxlength="60"
                  (input)="editName = $any($event.target).value"
                  (keydown.enter)="commitRename(m.id); $event.stopPropagation()"
                  (keydown.escape)="cancelRename(); $event.stopPropagation()"
                  (blur)="commitRename(m.id)" />
              </ng-container>
            </div>
            <button
              type="button"
              class="mp-delete"
              *ngIf="m.isCustom"
              (click)="deleteMode.emit(m.id); $event.stopPropagation()"
              title="Удалить страницу"
              aria-label="Удалить страницу">
              <lucide-icon name="x" [size]="12"></lucide-icon>
            </button>
          </div>
        </div>
        <div class="mp-footer">
          <button type="button" class="mp-add" (click)="addMode.emit()">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            <span>Добавить страницу</span>
          </button>
        </div>
      </ng-container>

      <ng-container *ngIf="collapsed">
        <button type="button" class="mp-expand" (click)="toggleCollapse.emit()" title="Развернуть панель страниц" aria-label="Развернуть панель страниц">
          <lucide-icon name="chevrons-right" [size]="16"></lucide-icon>
        </button>
        <button
          type="button"
          class="mp-mini"
          *ngFor="let m of modes"
          [class.active]="m.id === activeModeId"
          (click)="selectMode.emit(m.id)"
          [title]="m.name"
          [attr.aria-label]="'Страница ' + m.name">
          {{ m.name.charAt(0) }}
        </button>
        <button type="button" class="mp-add-mini" (click)="addMode.emit()" title="Добавить страницу" aria-label="Добавить страницу">
          <lucide-icon name="plus" [size]="16"></lucide-icon>
        </button>
      </ng-container>

      <div
        class="mp-resizer"
        *ngIf="!collapsed"
        (mousedown)="onResizeStart($event)"
        role="separator"
        aria-orientation="vertical"
        [attr.aria-valuenow]="width"
        aria-valuemin="140"
        aria-valuemax="360"
        aria-label="Изменить ширину панели"></div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mode-panel {
      position: relative;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-right: 1px solid #D6D6D6;
      font-family: Roboto, sans-serif;
    }
    .mode-panel.collapsed {
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
    .mp-rename {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #9E9E9E;
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.12s ease-out;
    }
    .mp-card:hover .mp-rename, .mp-card:focus-within .mp-rename, .mp-rename:focus-visible { opacity: 1; }
    .mp-rename:hover { background: #EBEBEB; color: #333333; }
    .mp-name-input {
      flex: 1;
      min-width: 0;
      height: 22px;
      padding: 0 4px;
      border: 1px solid #448AFF;
      border-radius: 4px;
      font-size: 12px;
      font-family: Roboto, sans-serif;
      color: #333333;
      background: #fff;
      box-sizing: border-box;
    }
    .mp-name-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(68, 138, 255, 0.16); }
    .mp-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 8px;
      font-size: 12px;
      color: #9E9E9E;
      text-align: center;
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
    .mp-resizer {
      position: absolute;
      top: 0;
      right: -3px;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      z-index: 10;
      background: transparent;
    }
    .mp-resizer:hover, .mp-resizer:active { background: rgba(68, 138, 255, 0.25); }
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
  /** Ширина панели в развёрнутом виде (px) */
  @Input() width = 172;
  /** Разрешение холста для расчёта миниатюры */
  @Input() canvasWidth = 1024;
  @Input() canvasHeight = 768;

  @Output() selectMode = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() addMode = new EventEmitter<void>();
  @Output() deleteMode = new EventEmitter<string>();
  @Output() renameMode = new EventEmitter<{ id: string; name: string }>();
  @Output() widthChange = new EventEmitter<number>();

  /** Инлайн-переименование */
  editingId: string | null = null;
  editName = '';

  /** Ресайз за правую границу */
  private resizing = false;
  private startX = 0;
  private startWidth = 172;
  private readonly boundResizeMove = (e: MouseEvent) => this.onResizeMove(e);
  private readonly boundResizeEnd = () => this.onResizeEnd();

  startRename(mode: ArrivalsThemeMode): void {
    this.editingId = mode.id;
    this.editName = mode.name;
    // Фокус + выделение после рендера input'а (setTimeout надёжнее rAF в скрытых табах)
    const focusInput = () => {
      const el = document.querySelector('.mp-name-input') as HTMLInputElement | null;
      if (el) { el.focus(); el.select(); }
    };
    setTimeout(focusInput, 0);
    setTimeout(focusInput, 120);
  }

  commitRename(id: string): void {
    if (this.editingId !== id) return;
    const name = (this.editName || '').trim().slice(0, 60);
    this.editingId = null;
    if (name) this.renameMode.emit({ id, name });
  }

  cancelRename(): void {
    this.editingId = null;
  }

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.resizing = true;
    this.startX = event.clientX;
    this.startWidth = this.width;
    document.addEventListener('mousemove', this.boundResizeMove);
    document.addEventListener('mouseup', this.boundResizeEnd);
  }

  private onResizeMove(event: MouseEvent): void {
    if (!this.resizing) return;
    const next = Math.min(360, Math.max(140, Math.round(this.startWidth + event.clientX - this.startX)));
    this.widthChange.emit(next);
  }

  private onResizeEnd(): void {
    if (!this.resizing) return;
    this.resizing = false;
    document.removeEventListener('mousemove', this.boundResizeMove);
    document.removeEventListener('mouseup', this.boundResizeEnd);
  }

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
