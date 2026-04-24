import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiInputComponent, UiSelectComponent, UiTextareaComponent, UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_THEMES } from '../data/mock-data';
import {
  ArrivalsTheme,
  ArrivalsThemeElement,
  ArrivalsElementType,
} from '../types';

type PanelView = 'theme' | 'add-element' | 'element';

interface ElementTypeOption {
  type: ArrivalsElementType;
  label: string;
}

@Component({
  selector: 'app-arrivals-theme-editor-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
    UiConfirmDialogComponent,
  ],
  template: `
    <div class="editor-layout">
      <!-- ═══════ CANVAS AREA ═══════ -->
      <div class="canvas-area">
        <div class="canvas-scroll">
          <div
            class="canvas-viewport"
            [style.width.px]="resWidth"
            [style.height.px]="resHeight"
            [style.transform]="'scale(' + canvasScale + ')'"
            (click)="onCanvasClick()"
          >
            <!-- Elements on canvas -->
            <div
              *ngFor="let el of theme.elements"
              class="canvas-element"
              [class.selected]="selectedElementId === el.id"
              [class.dragging]="dragState?.elementId === el.id"
              [style.left.px]="el.x"
              [style.top.px]="el.y"
              [style.width.px]="el.width"
              [style.height.px]="el.height"
              [style.border-width.px]="el.borderWidth"
              [style.border-color]="el.borderColor"
              [style.border-radius.px]="el.borderRadius"
              (click)="selectElement(el.id, $event)"
              (mousedown)="onElementMouseDown($event, el)"
            >
              <span *ngIf="el.type === 'text'" class="el-text"
                [style.font-family]="el.fontFamily"
                [style.font-size.px]="el.fontSize"
                [style.font-weight]="el.fontBold ? 'bold' : 'normal'"
                [style.font-style]="el.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="el.textAlign"
              >{{ el.text || 'Type something' }}</span>
              <span *ngIf="el.type === 'image'" class="el-placeholder">
                <lucide-icon name="image" [size]="24"></lucide-icon>
              </span>
              <span *ngIf="el.type !== 'text' && el.type !== 'image'"
                class="el-placeholder-label">{{ el.name }}</span>

              <!-- Selection handles -->
              <ng-container *ngIf="selectedElementId === el.id">
                <div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div>
                <div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div>
                <div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div>
                <div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div>
                <div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div>
                <div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div>
                <div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div>
                <div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════ RIGHT PANEL ═══════ -->
      <div class="control-panel">
        <!-- Panel header -->
        <div class="panel-header" (click)="panelCollapsed = !panelCollapsed">
          <span>Панель управления</span>
          <lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon>
        </div>

        <div *ngIf="!panelCollapsed" class="panel-body">

          <!-- ──── VIEW: Theme properties ──── -->
          <ng-container *ngIf="panelView === 'theme'">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon>
              <span class="bc-link">Тема</span>
            </div>

            <div class="field-group">
              <label class="field-label">Имя темы</label>
              <input class="field-input" [(ngModel)]="theme.name" />
            </div>

            <div class="field-group">
              <label class="field-label">Разрешение</label>
              <select class="field-select" [(ngModel)]="theme.resolution" (ngModelChange)="onResolutionChange()">
                <option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option>
              </select>
            </div>

            <div class="section-divider">Настройка режима</div>

            <div class="field-group">
              <select class="field-select" [(ngModel)]="theme.screenMode">
                <option *ngFor="let m of screenModeOptions" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>

            <div class="section-divider">Элементы</div>

            <!-- List of existing elements -->
            <div *ngFor="let el of theme.elements; let i = index" class="element-list-item"
              [class.active]="selectedElementId === el.id"
              (click)="selectElementFromList(el.id)">
              <span class="el-list-name">{{ el.name }}</span>
              <button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить">
                <lucide-icon name="x" [size]="14"></lucide-icon>
              </button>
            </div>

            <button class="btn-add-element" (click)="panelView = 'add-element'">
              Добавить элемент
            </button>
          </ng-container>

          <!-- ──── VIEW: Add element picker ──── -->
          <ng-container *ngIf="panelView === 'add-element'">
            <div class="add-element-header">
              <span class="add-element-title">Добавить элемент</span>
              <button class="icon-btn-sm" (click)="panelView = 'theme'">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <div class="element-type-list">
              <div
                *ngFor="let et of elementTypes"
                class="element-type-item"
                (click)="addElement(et.type)"
              >
                {{ et.label }}
              </div>
            </div>
          </ng-container>

          <!-- ──── VIEW: Element properties ──── -->
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon>
              <span class="bc-link" (click)="deselectElement()">Тема</span>
              <span class="bc-separator">/</span>
              <span class="bc-current">{{ selectedElement.name }}</span>
            </div>

            <!-- ── Text element ── -->
            <ng-container *ngIf="selectedElement.type === 'text'">
              <div class="field-group">
                <label class="field-label">Текст</label>
                <textarea class="field-textarea" rows="3"
                  [(ngModel)]="selectedElement.text"></textarea>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Семейство</label>
                    <select class="field-select" [(ngModel)]="selectedElement.fontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.fontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row" style="gap: 16px;">
                    <label class="field-check">
                      <input type="checkbox" [(ngModel)]="selectedElement.fontBold" /> <strong>B</strong>
                    </label>
                    <label class="field-check">
                      <input type="checkbox" [(ngModel)]="selectedElement.fontItalic" /> <em>I</em>
                    </label>
                  </div>
                  <div class="fields-row" style="gap: 4px; margin-top: 8px;">
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'left'" (click)="selectedElement.textAlign = 'left'">
                      <lucide-icon name="align-left" [size]="16"></lucide-icon>
                    </button>
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'center'" (click)="selectedElement.textAlign = 'center'">
                      <lucide-icon name="align-center" [size]="16"></lucide-icon>
                    </button>
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'right'" (click)="selectedElement.textAlign = 'right'">
                      <lucide-icon name="align-right" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Image element ── -->
            <ng-container *ngIf="selectedElement.type === 'image'">
              <div class="field-group">
                <label class="field-label">URL изображения</label>
                <input class="field-input" [(ngModel)]="selectedElement.imageUrl" placeholder="https://..." />
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Generic element ── -->
            <ng-container *ngIf="isGenericElement(selectedElement.type)">
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

          </ng-container>
        </div>

        <!-- Panel footer -->
        <div class="panel-footer">
          <button class="btn-save" (click)="save()">СОХРАНИТЬ</button>
          <button class="btn-back" (click)="goBack()">НАЗАД</button>
        </div>
      </div>

      <!-- Toast notification -->
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>

      <!-- Delete confirm dialog -->
      <ui-confirm-dialog
        *ngIf="deleteElementTarget"
        [open]="true"
        title="Удалить элемент"
        [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDeleteElement()"
        (cancelled)="deleteElementTarget = null"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .editor-layout {
      display: flex; height: calc(100vh - 110px); margin: -20px -24px;
      font-family: Roboto, sans-serif;
    }

    /* ═══ Canvas ═══ */
    .canvas-area {
      flex: 1; min-width: 0; overflow: auto;
      background: #e0e0e0;
    }
    .canvas-scroll {
      display: flex; align-items: flex-start; justify-content: flex-start;
      min-height: 100%; padding: 0;
    }
    .canvas-viewport {
      position: relative; transform-origin: top left;
      background-color: #fff;
      background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    /* Canvas elements */
    .canvas-element {
      position: absolute; border-style: dashed; cursor: move;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.5); transition: box-shadow 0.15s;
      font-size: 13px; color: #333; overflow: hidden;
      user-select: none;
    }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected {
      border-style: solid; border-color: #448aff !important;
      box-shadow: 0 0 0 1px #448aff;
    }
    .canvas-element.dragging { opacity: 0.85; transition: none; }

    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-counter { font-size: 20px; font-weight: 500; }
    .el-time { font-size: 16px; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Resize handles */
    .handle {
      position: absolute; width: 8px; height: 8px; background: #fff;
      border: 2px solid #448aff; z-index: 2;
    }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; }
    .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; }
    .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; }
    .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; }
    .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }

    /* ═══ Right Panel ═══ */
    .control-panel {
      width: 320px; flex-shrink: 0;
      display: flex; flex-direction: column;
      background: #fff; border-left: 1px solid #e0e0e0;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333;
      border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none;
    }
    .panel-header:hover { background: #fafafa; }

    .panel-body {
      flex: 1; overflow-y: auto; padding: 16px;
    }

    .panel-footer {
      display: flex; gap: 12px; padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
    }
    .btn-save {
      flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px;
      background: transparent; color: #333; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; letter-spacing: 0.5px;
      transition: all 0.15s;
    }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back {
      flex: 1; height: 36px; border: none; border-radius: 4px;
      background: #ff9800; color: #fff; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; letter-spacing: 0.5px;
      transition: all 0.15s;
    }
    .btn-back:hover { background: #f57c00; }

    /* ═══ Panel breadcrumb ═══ */
    .panel-breadcrumb {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 16px; font-size: 14px;
    }
    .bc-home { color: #ff6d00; cursor: pointer; }
    .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; }
    .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; }
    .bc-current { color: #333; font-weight: 500; }

    /* ═══ Form fields ═══ */
    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-textarea {
      width: 100%; padding: 8px 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; resize: vertical; transition: border-color 0.15s;
    }
    .field-textarea:focus { outline: none; border-color: #448aff; }
    .field-select {
      width: 100%; height: 36px; padding: 0 8px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      background: #fff; cursor: pointer; box-sizing: border-box;
    }
    .field-color {
      width: 48px; height: 32px; padding: 0; border: 1px solid #e0e0e0;
      border-radius: 4px; cursor: pointer;
    }

    .fields-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .field-sm { flex: 1; }
    .field-sm label { display: block; font-size: 11px; color: #9e9e9e; margin-bottom: 2px; }
    .field-input-sm {
      width: 100%; height: 30px; padding: 0 6px;
      border: 1px solid #e0e0e0; border-radius: 3px;
      font-size: 13px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box;
    }
    .field-input-sm:focus { outline: none; border-color: #448aff; }

    .field-check { display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer; }

    .align-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer; transition: all 0.15s;
    }
    .align-btn:hover { background: #f0f0f0; }
    .align-btn.active { background: #e3f2fd; border-color: #448aff; color: #448aff; }

    /* ═══ Sections & dividers ═══ */
    .section-divider {
      position: relative; text-align: center;
      margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e;
    }
    .section-divider::before, .section-divider::after {
      content: ''; position: absolute; top: 50%;
      width: calc(50% - 50px); height: 1px; background: #e0e0e0;
    }
    .section-divider::before { left: 0; }
    .section-divider::after { right: 0; }

    .section-divider-bold {
      font-size: 14px; font-weight: 600; color: #333;
      margin: 16px 0 10px; padding-bottom: 4px;
    }

    .collapsible-section { border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; font-size: 14px; font-weight: 500; color: #333;
      cursor: pointer; user-select: none;
    }
    .section-header:hover { color: #448aff; }
    .section-content { padding-bottom: 12px; }

    /* ═══ Element list ═══ */
    .element-list-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; margin-bottom: 4px; border-radius: 4px;
      cursor: pointer; transition: background 0.15s; font-size: 13px;
    }
    .element-list-item:hover { background: #f5f5f5; }
    .element-list-item.active { background: #e3f2fd; }
    .el-list-name { flex: 1; }
    .el-list-delete {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
    }
    .el-list-delete:hover { background: #ffebee; color: #e53935; }

    .btn-add-element {
      width: 100%; height: 40px; border: none; border-radius: 4px;
      background: #448aff; color: #fff; font-size: 14px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer;
      transition: background 0.15s; margin-top: 8px;
    }
    .btn-add-element:hover { background: #2979ff; }

    /* ═══ Add element type list ═══ */
    .add-element-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .add-element-title { font-size: 18px; font-weight: 500; color: #333; }
    .icon-btn-sm {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border: none; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer;
    }
    .icon-btn-sm:hover { background: #f0f0f0; }

    .element-type-list { display: flex; flex-direction: column; }
    .element-type-item {
      padding: 12px 8px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background 0.15s;
    }
    .element-type-item:hover { background: #f5f5f5; }
    .element-type-item:last-child { border-bottom: none; }

    /* ═══ Toast ═══ */
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      padding: 10px 24px; background: #333; color: #fff;
      border-radius: 6px; font-size: 14px; z-index: 9000;
      animation: toastIn 0.3s ease;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }

    /* ═══ Price element on canvas ═══ */
    .el-price {
      display: flex; align-items: center; gap: 4px;
      width: 100%; padding: 4px; word-break: break-word;
      color: #333; font-size: 13px;
    }
    .el-price .price-icon { color: #ff6d00; flex-shrink: 0; }

    /* ═══ Product binding ═══ */
    .product-binding { margin-bottom: 16px; }
    .binding-info {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; background: #e8f5e9; border-radius: 6px;
      margin-bottom: 8px; font-size: 13px; color: #2e7d32;
    }
    .binding-icon { flex-shrink: 0; color: #43a047; }
    .binding-name { font-weight: 500; }
    .binding-size { font-weight: 400; color: #558b2f; }
    .binding-empty {
      padding: 10px 12px; background: #fff3e0; border-radius: 6px;
      margin-bottom: 8px; font-size: 13px; color: #e65100;
    }
    .btn-select-product {
      width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: #fff; color: #448aff; font-size: 13px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .btn-select-product:hover { background: #e3f2fd; border-color: #448aff; }

    /* ═══ Product navigator ═══ */
    .navigator-list { display: flex; flex-direction: column; margin-top: 8px; }
    .navigator-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 8px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background 0.15s;
    }
    .navigator-item:hover { background: #f5f5f5; }
    .navigator-item:last-child { border-bottom: none; }
    .nav-icon-folder { color: #ff9800; }
    .nav-icon-product { color: #448aff; }
    .nav-item-name { flex: 1; }
    .nav-chevron { color: #bdbdbd; }
    .nav-breadcrumbs {
      display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
      margin-bottom: 8px; font-size: 12px;
    }
    .btn-nav-back {
      display: flex; align-items: center; gap: 6px;
      width: 100%; height: 34px; border: none; border-radius: 4px;
      background: #f5f5f5; color: #757575; font-size: 13px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer;
      transition: background 0.15s; margin-top: 8px; padding: 0 12px;
    }
    .btn-nav-back:hover { background: #eeeeee; color: #333; }
    .navigator-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 32px 0; color: #bdbdbd; font-size: 14px;
    }
    .empty-icon { color: #e0e0e0; }
    .nav-product-title {
      font-size: 14px; font-weight: 500; color: #333;
      padding: 4px 0 8px; border-bottom: 1px solid #e0e0e0;
    }
  `],
})
export class ArrivalsThemeEditorScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);

  theme: ArrivalsTheme = {
    id: 0,
    name: 'Новая тема',
    resolution: '1024x768',
    screenMode: 'order-screen',
    elements: [],
  };

  panelCollapsed = false;
  panelView: PanelView = 'theme';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 0.65;

  // Drag & resize state
  dragState: {
    elementId: string;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
  } | null = null;

  resizeState: {
    elementId: string;
    handle: string;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
    startElW: number;
    startElH: number;
  } | null = null;

  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);

  openSections = new Set<string>();

  resolutionOptions: SelectOption[] = [
    { value: '1024x768', label: '1024px / 768px' },
    { value: '1366x768', label: '1366px / 768px' },
    { value: '1366x1000', label: '1366px / 1000px' },
    { value: '1920x1080', label: '1920px / 1080px' },
  ];

  screenModeOptions: SelectOption[] = [
    { value: 'order-screen', label: 'Экран заказа' },
    { value: 'welcome-screen', label: 'Экран приветствия' },
  ];

  elementTypes: ElementTypeOption[] = [
    { type: 'text', label: 'Текст' },
    { type: 'image', label: 'Изображение' },
    { type: 'order-number', label: 'Номер заказа' },
    { type: 'table-number', label: 'Номер стола' },
    { type: 'order-status', label: 'Статус заказа' },
    { type: 'cooking-start-time', label: 'Время начала приготовления заказа' },
    { type: 'cooking-end-time', label: 'Время завершения приготовления заказа' },
    { type: 'system-cooking-time', label: 'Системное время приготовления заказа' },
    { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа' },
    { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания' },
    { type: 'client-name', label: 'Имя клиента' },
    { type: 'client-phone', label: 'Номер телефона клиента' },
    { type: 'courier-name', label: 'Имя назначенного курьера' },
    { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа' },
    { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки' },
    { type: 'dispatch-time', label: 'Время отправки заказа' },
    { type: 'travel-time', label: 'Время в пути' },
    { type: 'delivery-time', label: 'Время доставки заказа' },
    { type: 'delivery-status', label: 'Статус доставки' },
    { type: 'client-comment', label: 'Комментарий от клиента' },
    { type: 'client-delivery-time', label: 'Время доставки, обозначенное клиентом' },
    { type: 'cancel-reason', label: 'Причина отмены заказа' },
    { type: 'cancel-comment', label: 'Комментарий к отмене заказа' },
    { type: 'cancel-time', label: 'Время отмены заказа' },
    { type: 'external-data', label: 'Внешние данные' },
  ];

  get resWidth(): number {
    return parseInt(this.theme.resolution.split('x')[0]) || 1024;
  }

  get resHeight(): number {
    return parseInt(this.theme.resolution.split('x')[1]) || 768;
  }

  get selectedElement(): ArrivalsThemeElement | null {
    if (!this.selectedElementId) return null;
    return this.theme.elements.find(e => e.id === this.selectedElementId) ?? null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const numId = Number(id);
      const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
      const found = allThemes.find(t => t.id === numId);
      if (found) {
        this.theme = JSON.parse(JSON.stringify(found));
      }
    } else {
      this.theme.id = Date.now();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  onResolutionChange(): void {
    // Canvas updates reactively via resWidth / resHeight
  }

  onCanvasClick(): void {
    if (this.dragState || this.resizeState) return;
    this.deselectElement();
  }

  /* ── Drag ── */

  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    if (event.button !== 0) return;
    // Ignore if mousedown originated on a resize handle
    const target = event.target as HTMLElement;
    if (target.classList.contains('handle')) return;

    event.preventDefault();
    event.stopPropagation();
    this.selectedElementId = el.id;
    this.panelView = 'element';

    this.dragState = {
      elementId: el.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElX: el.x,
      startElY: el.y,
    };

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Resize ── */

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.resizeState = {
      elementId: el.id,
      handle,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElX: el.x,
      startElY: el.y,
      startElW: el.width,
      startElH: el.height,
    };

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Shared mouse handlers ── */

  private onDocMouseMove(event: MouseEvent): void {
    const scale = this.canvasScale;
    if (this.dragState) {
      const dx = (event.clientX - this.dragState.startMouseX) / scale;
      const dy = (event.clientY - this.dragState.startMouseY) / scale;
      const el = this.theme.elements.find(e => e.id === this.dragState!.elementId);
      if (el) {
        el.x = Math.max(0, Math.round(this.dragState.startElX + dx));
        el.y = Math.max(0, Math.round(this.dragState.startElY + dy));
      }
    }

    if (this.resizeState) {
      const dx = (event.clientX - this.resizeState.startMouseX) / scale;
      const dy = (event.clientY - this.resizeState.startMouseY) / scale;
      const el = this.theme.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const h = this.resizeState.handle;
        const minSize = 20;

        // Horizontal
        if (h.includes('r')) {
          el.width = Math.max(minSize, Math.round(this.resizeState.startElW + dx));
        }
        if (h.includes('l')) {
          const newW = Math.max(minSize, Math.round(this.resizeState.startElW - dx));
          el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - newW));
          el.width = newW;
        }
        // 'm' middle handles: tm/bm affect only height, ml/mr only width — handled above with 'l'/'r'

        // Vertical
        if (h.includes('b')) {
          el.height = Math.max(minSize, Math.round(this.resizeState.startElH + dy));
        }
        if (h.includes('t')) {
          const newH = Math.max(minSize, Math.round(this.resizeState.startElH - dy));
          el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - newH));
          el.height = newH;
        }
      }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null;
    this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  selectElement(id: string, event: Event): void {
    event.stopPropagation();
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  selectElementFromList(id: string): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  deselectElement(): void {
    this.selectedElementId = null;
    this.panelView = 'theme';
  }

  addElement(type: ArrivalsElementType): void {
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    const el: ArrivalsThemeElement = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      type,
      name: label,
      x: 20 + this.theme.elements.length * 20,
      y: 20 + this.theme.elements.length * 20,
      width: 120,
      height: 60,
      borderWidth: 1,
      borderColor: '#000000',
      borderRadius: 0,
    };

    if (type === 'text') {
      el.text = 'Type something';
      el.fontFamily = 'Arial';
      el.fontSize = 14;
      el.fontBold = false;
      el.fontItalic = false;
      el.textAlign = 'left';
    }

    this.theme.elements.push(el);
    this.selectedElementId = el.id;
    this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void {
    event.stopPropagation();
    this.deleteElementTarget = el;
  }

  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.theme.elements = this.theme.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) {
        this.deselectElement();
      }
      this.deleteElementTarget = null;
    }
  }

  toggleSection(key: string): void {
    if (this.openSections.has(key)) {
      this.openSections.delete(key);
    } else {
      this.openSections.add(key);
    }
  }

  isSectionOpen(key: string): boolean {
    return this.openSections.has(key);
  }

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image'].includes(type);
  }

  save(): void {
    const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
    const idx = allThemes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) {
      allThemes[idx] = JSON.parse(JSON.stringify(this.theme));
    } else {
      allThemes.push(JSON.parse(JSON.stringify(this.theme)));
    }
    this.storage.save('web-screens', 'arrivals-themes', allThemes);

    // Also update list if it's a new theme
    const list: any[] = this.storage.load('web-screens', 'arrivals-list', []);
    if (!list.find((i: any) => i.id === this.theme.id)) {
      list.push({
        id: this.theme.id,
        name: this.theme.name,
        itemType: 'theme',
        resolution: this.theme.resolution,
        createdBy: 'Моя',
      });
      this.storage.save('web-screens', 'arrivals-list', list);
    }

    this.showToast('Тема сохранена');
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/themes-arrivals']);
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
