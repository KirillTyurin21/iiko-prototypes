import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiInputComponent, UiSelectComponent, UiTextareaComponent, UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_THEMES, MOCK_PRODUCT_CATALOG } from '../data/mock-data';
import {
  ArrivalsTheme,
  ArrivalsThemeElement,
  ArrivalsElementType,
  ProductCatalogItem,
} from '../types';

type PanelView = 'theme' | 'add-element' | 'element' | 'product-navigator';

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
              [style.left.px]="el.x"
              [style.top.px]="el.y"
              [style.width.px]="el.width"
              [style.height.px]="el.height"
              [style.border-width.px]="el.borderWidth"
              [style.border-color]="el.borderColor"
              [style.border-radius.px]="el.borderRadius"
              (click)="selectElement(el.id, $event)"
            >
              <span *ngIf="el.type === 'text'" class="el-text"
                [style.font-family]="el.fontFamily"
                [style.font-size.px]="el.fontSize"
                [style.font-weight]="el.fontBold ? 'bold' : 'normal'"
                [style.font-style]="el.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="el.textAlign"
              >{{ el.text || 'Type something' }}</span>
              <span *ngIf="el.type === 'counter'" class="el-counter">114</span>
              <span *ngIf="el.type === 'current-time'" class="el-time">12:00</span>
              <span *ngIf="el.type === 'image'" class="el-placeholder">
                <lucide-icon name="image" [size]="24"></lucide-icon>
              </span>
              <span *ngIf="el.type === 'area' || el.type === 'rectangle' || el.type === 'ad-block' || el.type === 'popup'"
                class="el-placeholder-label">{{ el.name }}</span>
              <span *ngIf="el.type === 'price'" class="el-price"
                [style.font-family]="el.fontFamily"
                [style.font-size.px]="el.fontSize"
                [style.font-weight]="el.fontBold ? 'bold' : 'normal'"
                [style.font-style]="el.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="el.textAlign"
              >
                <lucide-icon *ngIf="!el.productId" name="tag" [size]="14" class="price-icon"></lucide-icon>
                {{ el.productId ? ('Цена: ' + el.productName + (el.sizeName ? ' (' + el.sizeName + ')' : '')) : 'Цена' }}
              </span>

              <!-- Selection handles -->
              <ng-container *ngIf="selectedElementId === el.id">
                <div class="handle tl"></div>
                <div class="handle tr"></div>
                <div class="handle bl"></div>
                <div class="handle br"></div>
                <div class="handle tm"></div>
                <div class="handle bm"></div>
                <div class="handle ml"></div>
                <div class="handle mr"></div>
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

            <!-- ── Counter element ── -->
            <ng-container *ngIf="selectedElement.type === 'counter'">
              <div class="section-divider-bold">Источник данных (REST)</div>

              <div class="field-group">
                <label class="field-label">URL*</label>
                <input class="field-input" [(ngModel)]="selectedElement.dataSourceUrl" placeholder="https://..." />
              </div>
              <div class="field-group">
                <label class="field-label">HTTP-метод*</label>
                <select class="field-select" [(ngModel)]="selectedElement.httpMethod">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Заголовки</label>
                <input class="field-input" [(ngModel)]="selectedElement.headers" />
              </div>
              <div class="field-group">
                <label class="field-label">Таймаут, сек*</label>
                <input class="field-input" type="number" [(ngModel)]="selectedElement.timeout" />
              </div>

              <div class="section-divider-bold">Тип авторизации</div>
              <div class="field-group">
                <select class="field-select" [(ngModel)]="selectedElement.authType">
                  <option value="None">None</option>
                  <option value="Basic">Basic</option>
                  <option value="Bearer">Bearer</option>
                  <option value="API Key">API Key</option>
                </select>
              </div>

              <div class="section-divider-bold">План опроса</div>
              <div class="field-group">
                <label class="field-label">Интервал опроса, сек*</label>
                <input class="field-input" type="number" [(ngModel)]="selectedElement.pollInterval" />
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

            <!-- ── Generic element (area, rectangle, ad-block, popup, current-time) ── -->
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

            <!-- ── Price element ── -->
            <ng-container *ngIf="selectedElement.type === 'price'">
              <!-- Привязка к товару -->
              <div class="section-divider-bold">Привязка к товару</div>
              <div class="product-binding">
                <div *ngIf="selectedElement.productId" class="binding-info">
                  <lucide-icon name="package" [size]="16" class="binding-icon"></lucide-icon>
                  <span class="binding-name">{{ selectedElement.productName }}
                    <span *ngIf="selectedElement.sizeName" class="binding-size">({{ selectedElement.sizeName }})</span>
                  </span>
                </div>
                <div *ngIf="!selectedElement.productId" class="binding-empty">Товар не выбран</div>
                <button class="btn-select-product" (click)="openProductNavigator()">
                  {{ selectedElement.productId ? 'Изменить товар' : 'Выбрать товар' }}
                </button>
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

          </ng-container>

          <!-- ──── VIEW: Product navigator ──── -->
          <ng-container *ngIf="panelView === 'product-navigator'">
            <div class="add-element-header">
              <span class="add-element-title">
                {{ navigatorSizeMode ? 'Выберите размер' : 'Выбор товара' }}
              </span>
              <button class="icon-btn-sm" (click)="closeProductNavigator()">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <!-- Size selector mode -->
            <ng-container *ngIf="navigatorSizeMode && pendingProduct">
              <div class="nav-product-title">{{ pendingProduct.name }}</div>
              <div class="navigator-list">
                <div
                  *ngFor="let size of pendingProduct.sizes"
                  class="navigator-item product"
                  (click)="selectSize(size.id, size.name)"
                >
                  <span class="nav-item-name">{{ size.name }}</span>
                  <lucide-icon name="chevron-right" [size]="16" class="nav-chevron"></lucide-icon>
                </div>
              </div>
              <button class="btn-nav-back" (click)="navigatorSizeMode = false; pendingProduct = null">
                <lucide-icon name="arrow-left" [size]="16"></lucide-icon> Назад к товарам
              </button>
            </ng-container>

            <!-- Folder navigation mode -->
            <ng-container *ngIf="!navigatorSizeMode">
              <!-- Breadcrumbs -->
              <div *ngIf="navigationStack.length > 0" class="nav-breadcrumbs">
                <span class="bc-link" (click)="navigateToRoot()">Номенклатура</span>
                <ng-container *ngFor="let crumb of navigationStack; let i = index; let last = last">
                  <span class="bc-separator">/</span>
                  <span [class]="last ? 'bc-current' : 'bc-link'" (click)="!last && navigateToStackLevel(i)">{{ crumb.name }}</span>
                </ng-container>
              </div>

              <!-- Back button -->
              <button *ngIf="navigationStack.length > 0" class="btn-nav-back" (click)="navigateBack()">
                <lucide-icon name="arrow-left" [size]="16"></lucide-icon> Назад
              </button>

              <!-- Items list -->
              <div class="navigator-list">
                <div
                  *ngFor="let item of catalogItems"
                  class="navigator-item"
                  [class.group]="item.isGroup"
                  [class.product]="!item.isGroup"
                  (click)="item.isGroup ? navigateToGroup(item) : selectProduct(item)"
                >
                  <lucide-icon [name]="item.isGroup ? 'folder' : 'package'" [size]="18"
                    [class]="item.isGroup ? 'nav-icon-folder' : 'nav-icon-product'"></lucide-icon>
                  <span class="nav-item-name">{{ item.name }}</span>
                  <lucide-icon *ngIf="item.isGroup && item.hasChildren" name="chevron-right" [size]="16" class="nav-chevron"></lucide-icon>
                </div>
              </div>

              <!-- Empty state -->
              <div *ngIf="catalogItems.length === 0" class="navigator-empty">
                <lucide-icon name="package" [size]="32" class="empty-icon"></lucide-icon>
                <span>Нет элементов</span>
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
        title="Удалить элемент"
        [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'"
        confirmText="Удалить"
        confirmColor="red"
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
      position: absolute; border-style: dashed; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.5); transition: box-shadow 0.15s;
      font-size: 13px; color: #333; overflow: hidden;
    }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected {
      border-style: solid; border-color: #448aff !important;
      box-shadow: 0 0 0 1px #448aff;
    }

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
export class ArrivalsThemeEditorScreenComponent implements OnInit {
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

  // Product navigator state
  catalogItems: ProductCatalogItem[] = [];
  navigationStack: { id: string; name: string }[] = [];
  pendingProduct: ProductCatalogItem | null = null;
  navigatorSizeMode = false;

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
    { type: 'area', label: 'Область' },
    { type: 'ad-block', label: 'Рекламный блок' },
    { type: 'text', label: 'Текст' },
    { type: 'image', label: 'Изображение' },
    { type: 'rectangle', label: 'Прямоугольник' },
    { type: 'popup', label: 'Всплывающее окно' },
    { type: 'current-time', label: 'Текущее время' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'price', label: 'Цена' },
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

  onResolutionChange(): void {
    // Canvas updates reactively via resWidth / resHeight
  }

  onCanvasClick(): void {
    this.deselectElement();
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
    } else if (type === 'counter') {
      el.dataSourceUrl = '';
      el.httpMethod = 'GET';
      el.headers = '';
      el.timeout = 5;
      el.authType = 'None';
      el.pollInterval = 300;
    } else if (type === 'price') {
      el.productId = undefined;
      el.productName = undefined;
      el.sizeId = null;
      el.sizeName = undefined;
      el.fontFamily = 'Arial';
      el.fontSize = 16;
      el.fontBold = true;
      el.fontItalic = false;
      el.textAlign = 'center';
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
    return !['text', 'counter', 'image', 'price'].includes(type);
  }

  /* ── Product navigator methods ── */

  openProductNavigator(): void {
    this.navigationStack = [];
    this.pendingProduct = null;
    this.navigatorSizeMode = false;
    this.catalogItems = MOCK_PRODUCT_CATALOG['root'] || [];
    this.panelView = 'product-navigator';
  }

  closeProductNavigator(): void {
    this.panelView = 'element';
    this.pendingProduct = null;
    this.navigatorSizeMode = false;
  }

  navigateToGroup(group: ProductCatalogItem): void {
    this.navigationStack.push({ id: group.id, name: group.name });
    this.catalogItems = MOCK_PRODUCT_CATALOG[group.id] || [];
  }

  navigateBack(): void {
    this.navigationStack.pop();
    const parentId = this.navigationStack.length > 0
      ? this.navigationStack[this.navigationStack.length - 1].id
      : 'root';
    this.catalogItems = MOCK_PRODUCT_CATALOG[parentId] || [];
  }

  navigateToRoot(): void {
    this.navigationStack = [];
    this.catalogItems = MOCK_PRODUCT_CATALOG['root'] || [];
  }

  navigateToStackLevel(index: number): void {
    this.navigationStack = this.navigationStack.slice(0, index + 1);
    const id = this.navigationStack[index].id;
    this.catalogItems = MOCK_PRODUCT_CATALOG[id] || [];
  }

  selectProduct(product: ProductCatalogItem): void {
    if (product.sizes && product.sizes.length > 1) {
      this.pendingProduct = product;
      this.navigatorSizeMode = true;
    } else {
      this.applyProductBinding(
        product.id,
        product.name,
        product.sizes && product.sizes.length === 1 ? product.sizes[0].id : null,
        product.sizes && product.sizes.length === 1 ? product.sizes[0].name : undefined,
      );
    }
  }

  selectSize(sizeId: string, sizeName: string): void {
    if (this.pendingProduct) {
      this.applyProductBinding(this.pendingProduct.id, this.pendingProduct.name, sizeId, sizeName);
    }
  }

  private applyProductBinding(productId: string, productName: string, sizeId: string | null, sizeName?: string): void {
    if (this.selectedElement && this.selectedElement.type === 'price') {
      this.selectedElement.productId = productId;
      this.selectedElement.productName = productName;
      this.selectedElement.sizeId = sizeId;
      this.selectedElement.sizeName = sizeName;
      this.selectedElement.name = 'Цена: ' + productName + (sizeName ? ' (' + sizeName + ')' : '');
    }
    this.pendingProduct = null;
    this.navigatorSizeMode = false;
    this.panelView = 'element';
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
