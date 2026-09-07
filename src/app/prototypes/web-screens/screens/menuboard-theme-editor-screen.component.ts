import { Component, inject, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { CsDataService } from '../cs-data.service';
import { MOCK_ARRIVALS_THEMES, MOCK_ARRIVALS_CONTROLS, MOCK_ARRIVALS_ORDERS, MOCK_EXTERNAL_MENU, MOCK_COMPANIES, ExternalMenuItem } from '../data/mock-data';
import { MENUBOARD_THEME_CATEGORIES } from '../data/menuboard-categories.data';
import { ArrivalsTheme, ArrivalsThemeElement, ArrivalsElementType, ArrivalsControl, ArrivalsOrderMock, ElementCategory, AdvertiseCompany, AdvertisePanelConfig } from '../types';
import { AreaElementRendererComponent } from '../components/theme-editor/area-element-renderer.component';
import { ThemeElementInspectorComponent } from '../components/theme-editor/theme-element-inspector.component';
import { AreaElementInspectorComponent } from '../components/theme-editor/area-element-inspector.component';
import { OrderSimulatorComponent } from '../components/simulator/order-simulator.component';
import { AreaEmulationHelper } from '../components/theme-editor/area-emulation.service';
import { SimulatorHelper } from '../components/theme-editor/simulator.helper';
import { DishSelectorModalComponent } from '../components/dish-selector-modal/dish-selector-modal.component';
import { CollapsibleSectionComponent } from '../components/inspector/collapsible-section.component';
import { ElementPaletteComponent } from '../components/element-palette/element-palette.component';

type PanelView = 'theme' | 'add-element' | 'element';

interface CampaignOption { id: number; name: string; dateFrom: string; dateTo: string; }

@Component({
  selector: 'app-menuboard-theme-editor-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiConfirmDialogComponent, AreaElementRendererComponent, ThemeElementInspectorComponent, AreaElementInspectorComponent, OrderSimulatorComponent, DishSelectorModalComponent, CollapsibleSectionComponent, ElementPaletteComponent],
  template: `
    <div class="editor-layout">
      <div class="canvas-column">
        <div class="canvas-area" #canvasAreaRef>
        <div class="canvas-scroll">
          <div class="canvas-viewport" [style.width.px]="resWidth" [style.height.px]="resHeight" [style.transform]="'scale(' + canvasScale + ')'" (click)="onCanvasClick()">
            <ng-container *ngFor="let el of theme.elements; let i = index">
              <div *ngIf="el.type === 'area'" class="canvas-element area-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.z-index]="theme.elements.length - i" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <app-area-element-renderer [element]="el" [orderPositions]="areaHelper.getOrderPositions(el, sim.orders, sim.active, mockOrders, availableControls)" [emulationRunning]="areaHelper.isRunning(el.id)" [hasControl]="!!el.areaControlId" (toggleEmu)="areaHelper.toggle($event, getFilterSource(), availableControls)" (resetEmu)="areaHelper.reset($event.id)" (fillEmu)="areaHelper.fill($event, getFilterSource(), availableControls)"></app-area-element-renderer>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
              <div *ngIf="el.type !== 'area'" class="canvas-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.z-index]="theme.elements.length - i" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <span *ngIf="el.type === 'text'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">{{ el.text }}</span>
                <img *ngIf="el.type === 'image' && el.imageUrl" [src]="el.imageUrl" class="el-image-img" (error)="el.imageUrl = ''" />
                <span *ngIf="el.type === 'image' && !el.imageUrl" class="el-placeholder"><lucide-icon name="image" [size]="24"></lucide-icon></span>
                <span *ngIf="el.type === 'price'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign" [title]="getPriceTooltip(el)">{{ getPricePreview(el) }}</span>
                <span *ngIf="el.type === 'advertise'" class="el-placeholder-label">{{ getAdvertiseLabel(el) }}</span>
                <span *ngIf="el.type === 'counter'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">{{ el.text || '--:--' }}</span>
                <div *ngIf="el.type === 'menulist'" class="el-menulist">
                  <div class="ml-empty" *ngIf="!el.productIds?.length">Выберите блюда</div>
                  <div class="ml-rows" *ngIf="el.productIds?.length">
                    <div class="ml-row" *ngFor="let pid of el.productIds || []; let odd = odd"
                      [style.min-height.px]="el.rowHeight || 48"
                      [style.background-color]="getRowBg(el, odd)"
                      [style.padding.px]="el.rowPadding || 4">
                      <!-- Icon -->
                      <div class="ml-icon" *ngIf="el.showIcons !== false">
                        <lucide-icon *ngIf="!getDishData(pid)?.imageUrl" name="image-off" [size]="20"></lucide-icon>
                        <img *ngIf="getDishData(pid)?.imageUrl" [src]="getDishData(pid)?.imageUrl" class="ml-icon-img" />
                      </div>
                      <!-- Main column -->
                      <div class="ml-main">
                        <div class="ml-name" [style.font-size.px]="el.fontName?.size || 16"
                          [style.font-family]="el.fontName?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontName?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontName?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontName?.color || '#333'">
                          {{ getDishData(pid)?.name || '#' + pid.slice(0, 6) }}
                        </div>
                        <div class="ml-modifiers" *ngIf="getDishData(pid)?.modifiers?.length"
                          [style.font-size.px]="el.fontModifiers?.size || 12"
                          [style.font-family]="el.fontModifiers?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontModifiers?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontModifiers?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontModifiers?.color || '#666'">
                          Модификаторы: {{ getDishData(pid)?.modifiers?.join(', ') }}
                        </div>
                        <div class="ml-sizes" *ngIf="getDishData(pid)?.sizes?.length"
                          [style.font-size.px]="el.fontModifiers?.size || 12"
                          [style.font-family]="el.fontModifiers?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontModifiers?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontModifiers?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontModifiers?.color || '#666'">
                          Размеры: {{ formatSizes(getDishData(pid)?.sizes) }}
                        </div>
                        <div class="ml-desc" *ngIf="el.showDescription && getDishData(pid)?.description"
                          [style.font-size.px]="el.fontDescription?.size || 11"
                          [style.font-family]="el.fontDescription?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontDescription?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontDescription?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontDescription?.color || '#999'">
                          {{ getDishData(pid)?.description }}
                        </div>
                        <div class="ml-extra" *ngIf="(el.showAllergens && getDishData(pid)?.allergens?.length) || (el.showNutrition && getDishData(pid)?.energy != null)"
                          [style.font-size.px]="(el.fontDescription?.size || 11)">
                          <span class="ml-allergens" *ngIf="el.showAllergens && getDishData(pid)?.allergens?.length"
                            [style.color]="el.allergensColor || '#e65100'">
                            ⚠ {{ getDishData(pid)?.allergens?.join(', ') }}
                          </span>
                          <span class="ml-sep" *ngIf="el.showAllergens && getDishData(pid)?.allergens?.length && el.showNutrition && getDishData(pid)?.energy != null"
                            [style.color]="el.fontDescription?.color || '#999'"> | </span>
                          <span class="ml-nutrition" *ngIf="el.showNutrition && getDishData(pid)?.energy != null"
                            [style.color]="el.nutritionColor || '#999'">
                            {{ getDishData(pid)?.energy }} ккал Б:{{ getDishData(pid)?.proteins || 0 }} Ж:{{ getDishData(pid)?.fats || 0 }} У:{{ getDishData(pid)?.carbs || 0 }}
                          </span>
                        </div>
                      </div>
                      <!-- Price column -->
                      <div class="ml-price-col">
                        <div class="ml-price" [style.font-size.px]="el.fontPrice?.size || 16"
                          [style.font-family]="el.fontPrice?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontPrice?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontPrice?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontPrice?.color || '#C00'">
                          {{ getDishData(pid)?.price || 0 }} \u20BD
                        </div>
                        <div class="ml-weight" *ngIf="getDishData(pid)?.weight"
                          [style.font-size.px]="(el.fontDescription?.size || 11)"
                          [style.color]="el.fontDescription?.color || '#999'">
                          {{ getDishData(pid)?.weight }} {{ getDishData(pid)?.measure || '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span *ngIf="el.type !== 'text' && el.type !== 'image' && el.type !== 'price' && el.type !== 'advertise' && el.type !== 'menulist' && el.type !== 'counter'" class="el-placeholder-label">{{ el.name }}</span>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
            </ng-container>
          </div>
        </div>
        </div>
        <app-order-simulator [orders]="sim.orders" [autoRunning]="sim.autoRunning" (addOrder)="sim.addOrder(); areaHelper.clearAll()" (loadMocks)="sim.loadMocks(); areaHelper.clearAll()" (removeOrder)="sim.removeByIdx($event); areaHelper.clearAll()" (cycleStatus)="sim.cycleStatus($event); areaHelper.clearAll()" (changeOrderType)="sim.changeOrderType($event.order, $event.newType); areaHelper.clearAll()" (toggleAuto)="sim.toggleAuto()" (clearAll)="sim.clearAll(); areaHelper.clearAll()"></app-order-simulator>
        <!-- Баннер: нет платной лицензии (вариант D) -->
        <div *ngIf="!dataService.hasPremiumLicense && themeHasPremium" class="premium-banner">
          <lucide-icon name="alert-triangle" [size]="16"></lucide-icon>
          <span>Отсутствует лицензия.</span>
        </div>
      </div>
      <div class="control-panel">
        <div class="panel-header" (click)="panelCollapsed = !panelCollapsed"><span>Панель управления</span><lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon></div>
        <div *ngIf="!panelCollapsed" class="panel-body">
          <ng-container *ngIf="panelView === 'theme'">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon><span class="bc-link">Тема</span></div>
            <div class="field-group"><label class="field-label">Имя темы</label><input class="field-input" [(ngModel)]="theme.name" /></div>
            <div class="field-group"><label class="field-label">Разрешение</label><select class="field-select" [(ngModel)]="theme.resolution" (ngModelChange)="onResolutionChange()"><option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option></select></div>
            <div class="section-divider">Настройка режима</div>
            <div class="field-group"><select class="field-select" [(ngModel)]="theme.screenMode"><option *ngFor="let m of screenModeOptions" [value]="m.value">{{ m.label }}</option></select></div>
            <div class="section-divider">Элементы</div>
            <div *ngFor="let el of theme.elements; let i = index" class="element-list-item" [class.active]="selectedElementId === el.id" [class.list-dragging]="listDragIndex === i" [class.list-drag-above]="listDragOverIndex === i && listDragIndex !== null && listDragIndex! > i" [class.list-drag-below]="listDragOverIndex === i && listDragIndex !== null && listDragIndex! < i" (click)="selectElementFromList(el.id)" (mousedown)="onListMouseDown(i, $event)"><span class="el-list-name">{{ el.name }}</span><span *ngIf="el.type === 'area'" class="premium-badge" title="Платный элемент — доступен при платной лицензии"><lucide-icon name="alert-circle" [size]="14"></lucide-icon></span><button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить"><lucide-icon name="x" [size]="14"></lucide-icon></button></div>
            <button class="btn-add-element" (click)="panelView = 'add-element'">Добавить элемент</button>
          </ng-container>
          <app-element-palette
            *ngIf="panelView === 'add-element'"
            [categories]="themeCategories"
            [hasPremiumLicense]="dataService.hasPremiumLicense"
            (elementSelected)="addElement($any($event))"
            (closed)="panelView = 'theme'">
          </app-element-palette>
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon><span class="bc-link" (click)="deselectElement()">Тема</span><span class="bc-separator">/</span><span class="bc-current">{{ selectedElement.name }}</span></div>
            <!-- Advertise: панели + компания + кампании (мини-борды) -->
            <div *ngIf="selectedElement.type === 'advertise'" class="field-group">
              <label class="field-label">Рекламные панели</label>
              <div class="panels-list">
                <div
                  *ngFor="let p of selectedPanels"
                  class="panel-item"
                  [class.active]="selectedPanel?.id === p.id"
                  (click)="selectPanel(p.id)"
                >
                  <span class="panel-item-name">{{ p.name }}</span>
                  <span class="panel-item-company" *ngIf="getCompanyName(p.companyId)">{{ getCompanyName(p.companyId) }}</span>
                  <button class="panel-item-delete" (click)="removePanel(p.id, $event)" title="Удалить панель"><lucide-icon name="x" [size]="14"></lucide-icon></button>
                </div>
                <div *ngIf="!selectedPanels.length" class="campaign-empty-hint">Панели не добавлены</div>
              </div>
              <button class="btn-add-panel" (click)="addPanel()"><lucide-icon name="plus" [size]="14"></lucide-icon> Добавить панель</button>
            </div>

            <ng-container *ngIf="selectedElement.type === 'advertise' && selectedPanel">
              <div class="field-group">
                <label class="field-label">Компания</label>
                <select class="field-select" [(ngModel)]="selectedPanel.companyId">
                  <option [ngValue]="null">Компания не выбрана</option>
                  <option *ngFor="let c of companies" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Рекламные кампании</label>
                <div class="campaign-multiselect">
                  <label
                    *ngFor="let c of campaignOptions"
                    class="campaign-checkbox"
                    (click)="toggleCampaign(c.id)"
                  >
                    <span class="campaign-checkbox-box" [class.checked]="isCampaignSelected(c.id)"></span>
                    <span class="campaign-checkbox-label">{{ c.name }}</span>
                    <span class="campaign-checkbox-dates">{{ formatCampaignDate(c.dateFrom) }} – {{ formatCampaignDate(c.dateTo) }}</span>
                  </label>
                  <div *ngIf="!selectedCampaignCount" class="campaign-empty-hint">Кампании не выбраны</div>
                </div>
                <div *ngIf="selectedCampaignCount" class="campaign-selected-count">
                  Выбрано кампаний: {{ selectedCampaignCount }}
                </div>
              </div>
            </ng-container>
            <!-- MenuList inspector -->
            <ng-container *ngIf="selectedElement.type === 'menulist'">
              <app-collapsible-section title="Данные" [expanded]="true">
                <div class="field-group">
                  <button class="btn-select-dishes" (click)="openDishSelector()">
                    <lucide-icon name="list" [size]="16"></lucide-icon>
                    Выбрать блюда
                  </button>
                </div>
                <div class="field-group" *ngIf="selectedElement.productIds?.length">
                  <label class="field-label">Выбранные блюда</label>
                  <div class="selected-dishes">
                    <div class="sd-item" *ngFor="let pid of selectedElement.productIds">
                      <span class="sd-name">{{ getDishDisplayName(pid) }}</span>
                      <span class="sd-price">{{ getDishDisplayPrice(pid) }}</span>
                      <button class="sd-remove" (click)="removeDishFromList(pid)" title="Убрать">
                        <lucide-icon name="x" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="field-group" *ngIf="!selectedElement.productIds?.length">
                  <p class="field-hint">Блюда не выбраны</p>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Макет">
                <div class="field-group">
                  <label class="field-label">Позиция X</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.x" />
                </div>
                <div class="field-group">
                  <label class="field-label">Позиция Y</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.y" />
                </div>
                <div class="field-group">
                  <label class="field-label">Ширина (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.width" min="100" />
                </div>
                <div class="field-group">
                  <label class="field-label">Высота (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.height" min="100" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Граница">
                <div class="field-group">
                  <label class="field-label">Толщина (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.borderWidth" min="0" />
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.borderColor" />
                </div>
                <div class="field-group">
                  <label class="field-label">Скругление (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.borderRadius" min="0" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Настройки таблицы">
                <div class="field-group">
                  <label class="field-label">Чередование строк</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.alternateRows" /> Включено</label>
                </div>
                <div class="field-group">
                  <label class="field-label">Высота строки (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.rowHeight" min="24" max="200" />
                </div>
                <div class="field-group">
                  <label class="field-label">Отступ строк (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.rowPadding" min="0" max="20" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Подсветка строк">
                <div class="field-group">
                  <label class="field-label">Цвет основной строки</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.rowBgColor" [disabled]="!!selectedElement.rowBgTransparent" />
                  <label class="field-check" style="margin-top:6px"><input type="checkbox" [(ngModel)]="selectedElement.rowBgTransparent" /> Прозрачный</label>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет подсветки</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.highlightColor" [disabled]="!!selectedElement.highlightTransparent" />
                  <label class="field-check" style="margin-top:6px"><input type="checkbox" [(ngModel)]="selectedElement.highlightTransparent" /> Прозрачный</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт названия">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontName!.size" min="8" max="72" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontName!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontName!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontName!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontName!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт цены">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontPrice!.size" min="8" max="72" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontPrice!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontPrice!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontPrice!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontPrice!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт модификаторов">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontModifiers!.size" min="8" max="48" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontModifiers!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontModifiers!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontModifiers!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontModifiers!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт описания">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontDescription!.size" min="8" max="48" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontDescription!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontDescription!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontDescription!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontDescription!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Отображение">
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showIcons" /> Показывать иконки</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showDescription" /> Показывать описание</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showAllergens" /> Показывать аллергены</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showNutrition" /> Показывать КБЖУ</label>
                </div>
                <div class="field-group" *ngIf="selectedElement.showAllergens">
                  <label class="field-label">Цвет аллергенов</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.allergensColor" />
                </div>
                <div class="field-group" *ngIf="selectedElement.showNutrition">
                  <label class="field-label">Цвет КБЖУ</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.nutritionColor" />
                </div>
              </app-collapsible-section>
            </ng-container>
            <!-- Standard element inspector for non-menulist, non-area -->
            <app-theme-element-inspector *ngIf="selectedElement.type !== 'area' && selectedElement.type !== 'menulist'" [element]="selectedElement"></app-theme-element-inspector>
            <app-area-element-inspector *ngIf="selectedElement.type === 'area'" [element]="selectedElement" [availableControls]="availableControls" (areaControlChange)="onAreaControlChange()" (editControl)="onEditControl($event)"></app-area-element-inspector>
          </ng-container>
        </div>
        <div class="panel-footer"><button class="btn-save" (click)="save()">СОХРАНИТЬ</button><button class="btn-back" (click)="goBack()">НАЗАД</button></div>
      </div>
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>
      <ui-confirm-dialog *ngIf="deleteElementTarget" [open]="true" title="Удалить элемент" [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'" confirmText="Удалить" variant="danger" (confirmed)="confirmDeleteElement()" (cancelled)="deleteElementTarget = null"></ui-confirm-dialog>

      <!-- Dish selector modal -->
      <app-dish-selector-modal
        [open]="dishSelectorOpen"
        [categories]="externalMenuCategories"
        [selectedIds]="dishSelectorIds"
        (confirm)="onDishSelectorConfirm($event)"
        (cancel)="dishSelectorOpen = false"
      ></app-dish-selector-modal>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .editor-layout { display: flex; height: calc(100vh - 110px); margin: -20px -24px; font-family: Roboto, sans-serif; }
    .canvas-column { flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; }
    .premium-banner { position: absolute; bottom: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(0, 0, 0, 0.25); color: #fff; font-size: 12px; font-weight: 500; }
    .premium-badge { display: inline-flex; align-items: center; margin-right: 6px; color: #ff6d00; cursor: help; flex-shrink: 0; }
    .canvas-area { flex: 1; min-width: 0; overflow: auto; background: #e0e0e0; }
    .canvas-scroll { display: flex; align-items: flex-start; justify-content: center; min-height: 100%; padding: 8px; }
    .canvas-viewport { position: relative; transform-origin: top left; background-color: #fff; background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .canvas-element { position: absolute; border-style: dashed; cursor: move; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.5); transition: box-shadow 0.15s; font-size: 13px; color: #333; overflow: hidden; user-select: none; }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected { border-style: solid; border-color: #448aff !important; box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.dragging { opacity: 0.85; transition: none; }
    .canvas-element.area-element { border-style: dashed !important; }
    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .el-menulist { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .ml-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #bdbdbd; font-size: 11px; }
    .ml-rows { flex: 1; overflow: hidden; }
    .ml-row { display: flex; align-items: flex-start; gap: 6px; overflow-x: hidden; border-bottom: 1px solid #eee; box-sizing: border-box; }
    .ml-row:last-child { border-bottom: none; }
    .ml-icon { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 3px; overflow: hidden; color: #ccc; }
    .ml-icon-img { width: 100%; height: 100%; object-fit: cover; }
    .ml-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
    .ml-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.25; }
    .ml-modifiers, .ml-sizes, .ml-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
    .ml-extra { display: flex; flex-wrap: wrap; gap: 2px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
    .ml-allergens { flex-shrink: 0; }
    .ml-nutrition { flex-shrink: 0; }
    .ml-sep { color: #ddd; flex-shrink: 0; }
    .ml-price-col { flex-shrink: 0; text-align: right; display: flex; flex-direction: column; gap: 1px; min-width: 50px; }
    .ml-price { font-weight: 600; white-space: nowrap; line-height: 1.25; }
    .ml-weight { white-space: nowrap; line-height: 1.3; }
    .handle { position: absolute; width: 8px; height: 8px; background: #fff; border: 2px solid #448aff; z-index: 2; }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; } .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; } .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; } .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; } .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }
    .control-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; border-left: 1px solid #e0e0e0; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333; border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none; }
    .panel-header:hover { background: #fafafa; }
    .panel-body { flex: 1; overflow-y: auto; padding: 16px; }
    .panel-footer { display: flex; gap: 12px; padding: 12px 16px; border-top: 1px solid #e0e0e0; }
    .btn-save { flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px; background: transparent; color: #333; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back { flex: 1; height: 36px; border: none; border-radius: 4px; background: #ff9800; color: #fff; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-back:hover { background: #f57c00; }
    .panel-breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
    .bc-home { color: #ff6d00; cursor: pointer; } .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; } .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; } .bc-current { color: #333; font-weight: 500; }
    .field-group { margin-bottom: 12px; } .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input { width: 100%; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-select { width: 100%; height: 36px; padding: 0 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; background: #fff; cursor: pointer; box-sizing: border-box; }
    /* Campaign multi-select */
    .campaign-multiselect { max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
    .campaign-checkbox { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid #f5f5f5; }
    .campaign-checkbox:last-child { border-bottom: none; }
    .campaign-checkbox:hover { background: #f5f5f5; }
    .campaign-checkbox-box { width: 18px; height: 18px; border: 2px solid #bdbdbd; border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .campaign-checkbox-box.checked { background: #1976d2; border-color: #1976d2; }
    .campaign-checkbox-box.checked::after { content: ''; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -1px; }
    .campaign-checkbox-label { flex: 1; font-size: 13px; color: #333; }
    .campaign-checkbox-dates { font-size: 11px; color: #9e9e9e; flex-shrink: 0; }
    .campaign-empty-hint { padding: 12px 10px; font-size: 12px; color: #bdbdbd; text-align: center; }
    .campaign-selected-count { margin-top: 6px; font-size: 12px; color: #1976d2; font-weight: 500; }
    /* Advertise panels */
    .panels-list { max-height: 180px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
    .panel-item { display: flex; align-items: center; gap: 6px; padding: 7px 10px; cursor: pointer; border-bottom: 1px solid #f5f5f5; font-size: 13px; color: #333; }
    .panel-item:last-child { border-bottom: none; }
    .panel-item:hover { background: #f5f5f5; }
    .panel-item.active { background: #e3f2fd; }
    .panel-item-name { flex-shrink: 0; font-weight: 500; }
    .panel-item-company { flex: 1; color: #757575; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .panel-item-delete { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; flex-shrink: 0; }
    .panel-item-delete:hover { background: #ffebee; color: #e53935; }
    .btn-add-panel { width: 100%; height: 34px; margin-top: 6px; border: 2px solid #1976d2; border-radius: 4px; background: #e3f2fd; color: #1565c0; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-add-panel:hover { background: #bbdefb; }
    .section-divider { position: relative; text-align: center; margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e; }
    .section-divider::before, .section-divider::after { content: ''; position: absolute; top: 50%; width: calc(50% - 50px); height: 1px; background: #e0e0e0; }
    .section-divider::before { left: 0; } .section-divider::after { right: 0; }
    .element-list-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; cursor: grab; transition: background 0.15s, opacity 0.15s, transform 0.1s; font-size: 13px; position: relative; }
    .element-list-item:hover { background: #f5f5f5; } .element-list-item.active { background: #e3f2fd; }
    .element-list-item.list-dragging { opacity: 0.4; cursor: grabbing; }
    .element-list-item.list-drag-above::before { content: ''; position: absolute; top: -2px; left: 0; right: 0; height: 2px; background: #1976d2; border-radius: 1px; z-index: 1; }
    .element-list-item.list-drag-below::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #1976d2; border-radius: 1px; z-index: 1; }
    .el-list-name { flex: 1; }
    .el-list-delete { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; }
    .el-list-delete:hover { background: #ffebee; color: #e53935; }
    .btn-add-element { width: 100%; height: 40px; border: none; border-radius: 4px; background: #448aff; color: #fff; font-size: 14px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; margin-top: 8px; }
    .btn-add-element:hover { background: #2979ff; }

    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 24px; background: #333; color: #fff; border-radius: 6px; font-size: 14px; z-index: 9000; animation: toastIn 0.3s ease; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }

    .btn-select-dishes {
      width: 100%; height: 38px; border: 2px solid #1976d2; border-radius: 4px;
      background: #e3f2fd; color: #1565c0; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .btn-select-dishes:hover { background: #bbdefb; }

    .selected-dishes { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }
    .sd-item { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: #f5f5f5; border-radius: 4px; font-size: 12px; }
    .sd-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333; }
    .sd-price { flex-shrink: 0; font-weight: 600; color: #c62828; }
    .sd-remove { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; flex-shrink: 0; }
    .sd-remove:hover { background: #ffebee; color: #e53935; }

    .field-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #424242; cursor: pointer; margin-bottom: 6px; }
    .field-check input[type="checkbox"] { cursor: pointer; }
    .field-hint { font-size: 12px; color: #bdbdbd; font-style: italic; margin: 0; text-align: center; padding: 8px 0; }
    .field-color { width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2px; cursor: pointer; box-sizing: border-box; }
  `],
})
export class MenuboardThemeEditorScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);
  dataService = inject(CsDataService);

  theme: ArrivalsTheme = { id: 0, name: 'Новая тема', resolution: '1024x768', screenMode: 'order-screen', elements: [] };
  panelCollapsed = false;
  panelView: PanelView = 'theme';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 1;

  /** Тема содержит платный элемент (для баннера) */
  get themeHasPremium(): boolean {
    return this.theme.elements.some(e => e.type === 'area');
  }
  availableControls: ArrivalsControl[] = [];
  mockOrders: ArrivalsOrderMock[] = [...MOCK_ARRIVALS_ORDERS];
  externalMenuCategories = MOCK_EXTERNAL_MENU;
  dishSelectorOpen = false;
  dishSelectorIds: string[] = [];

  companies: AdvertiseCompany[] = [...MOCK_COMPANIES];
  selectedPanelId: number | null = null;

  campaignOptions: CampaignOption[] = [
    { id: 1, name: 'Новогодняя', dateFrom: '2026-01-01', dateTo: '2026-01-31' },
    { id: 2, name: 'Летнее меню', dateFrom: '2026-06-01', dateTo: '2026-08-31' },
    { id: 3, name: 'Осенние скидки', dateFrom: '2026-09-01', dateTo: '2026-11-30' },
    { id: 4, name: 'Сезонное предложение', dateFrom: '2026-03-01', dateTo: '2026-05-31' },
  ];

  areaHelper = new AreaEmulationHelper();
  sim = new SimulatorHelper();

  @ViewChild('canvasAreaRef') canvasAreaRef!: ElementRef<HTMLDivElement>;

  dragState: { elementId: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number } | null = null;
  resizeState: { elementId: string; handle: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number; startElW: number; startElH: number } | null = null;

  /* ── List drag reorder ── */
  listDragIndex: number | null = null;
  listDragOverIndex: number | null = null;
  private listDragStartY = 0;
  private boundListMouseMove = this.onListMouseMove.bind(this);
  private boundListMouseUp = this.onListMouseUp.bind(this);

  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);

  resolutionOptions: SelectOption[] = [
    { value: '1024x768', label: '1024px / 768px' }, { value: '1366x768', label: '1366px / 768px' },
    { value: '1366x1000', label: '1366px / 1000px' }, { value: '1920x1080', label: '1920px / 1080px' },
  ];
  screenModeOptions: SelectOption[] = [
    { value: 'order-screen', label: 'Экран заказа' }, { value: 'welcome-screen', label: 'Экран приветствия' },
  ];
  elementTypes: { type: ArrivalsElementType; label: string }[] = [
    { type: 'menulist' as ArrivalsElementType, label: 'Меню-лист' },
    { type: 'advertise' as ArrivalsElementType, label: 'Динамическая область' },
    { type: 'text', label: 'Текст' }, { type: 'image', label: 'Изображение' },
    { type: 'counter' as ArrivalsElementType, label: 'Текущее время' },
  ];

  themeCategories = MENUBOARD_THEME_CATEGORIES.map(cat => ({ ...cat, collapsed: cat.collapsed, elements: [...cat.elements] }));

  /* ── List drag reorder ── */
  onListMouseDown(index: number, event: MouseEvent): void {
    if (event.button !== 0) return;
    // Don't start drag if clicking the delete button
    const target = event.target as HTMLElement;
    if (target.closest('.el-list-delete')) return;
    event.preventDefault();
    this.listDragIndex = index;
    this.listDragOverIndex = index;
    this.listDragStartY = event.clientY;
    document.addEventListener('mousemove', this.boundListMouseMove);
    document.addEventListener('mouseup', this.boundListMouseUp);
  }

  private onListMouseMove(event: MouseEvent): void {
    if (this.listDragIndex === null) return;
    const items = document.querySelectorAll('.element-list-item');
    let closest = this.listDragIndex;
    let closestDist = Infinity;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dist = Math.abs(event.clientY - midY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    this.listDragOverIndex = closest;
  }

  private onListMouseUp(): void {
    if (this.listDragIndex !== null && this.listDragOverIndex !== null && this.listDragIndex !== this.listDragOverIndex) {
      const el = this.theme.elements.splice(this.listDragIndex, 1)[0];
      this.theme.elements.splice(this.listDragOverIndex, 0, el);
    }
    this.listDragIndex = null;
    this.listDragOverIndex = null;
    document.removeEventListener('mousemove', this.boundListMouseMove);
    document.removeEventListener('mouseup', this.boundListMouseUp);
  }

  get resWidth(): number { return parseInt(this.theme.resolution.split('x')[0]) || 1024; }
  get resHeight(): number { return parseInt(this.theme.resolution.split('x')[1]) || 768; }
  get selectedElement(): ArrivalsThemeElement | null {
    return this.selectedElementId ? (this.theme.elements.find(e => e.id === this.selectedElementId) ?? null) : null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'menuboard-themes', [...MOCK_ARRIVALS_THEMES]);
      const found = allThemes.find(t => t.id === Number(id));
      if (found) this.theme = JSON.parse(JSON.stringify(found));
    } else {
      this.theme.id = Date.now();
    }
    this.theme.elements.forEach(el => { if (el.type === 'advertise') this.ensureAdvertisePanels(el); });
    this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);

    // Handle return from control editor with newControlId (Save as Copy)
    const newControlId = this.route.snapshot.queryParamMap.get('newControlId');
    if (newControlId) {
      const ncId = Number(newControlId);
      const elementId = this.route.snapshot.queryParamMap.get('elementId');
      const targetEl = elementId
        ? this.theme.elements.find(e => e.id === elementId && e.type === 'area')
        : null;
      if (targetEl) {
        targetEl.areaControlId = ncId;
        this.selectedElementId = targetEl.id;
      }
      this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
      this.save();
    }

    setTimeout(() => this.updateCanvasScale(), 0);
  }

  ngAfterViewInit(): void { this.updateCanvasScale(); }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('mousemove', this.boundListMouseMove);
    document.removeEventListener('mouseup', this.boundListMouseUp);
    this.areaHelper.clearAll();
    this.sim.stopAuto();
  }

  onResolutionChange(): void { setTimeout(() => this.updateCanvasScale(), 0); }
  @HostListener('window:resize') onWindowResize(): void { this.updateCanvasScale(); }

  updateCanvasScale(): void {
    if (!this.canvasAreaRef?.nativeElement) return;
    const c = this.canvasAreaRef.nativeElement;
    const newScale = Math.min((c.clientWidth - 16) / this.resWidth, (c.clientHeight - 16) / this.resHeight, 1);
    if (this.canvasScale !== newScale) {
      this.canvasScale = newScale;
      this.cdr.detectChanges();
    }
  }

  onCanvasClick(): void { if (!this.dragState && !this.resizeState) this.deselectElement(); }

  getFilterSource(): ArrivalsOrderMock[] {
    return this.sim.active ? this.sim.orders : this.mockOrders;
  }

  /* Drag & Resize */
  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    if (event.button !== 0 || (event.target as HTMLElement).classList.contains('handle')) return;
    event.preventDefault(); event.stopPropagation();
    this.selectedElementId = el.id; this.panelView = 'element';
    this.dragState = { elementId: el.id, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.x, startElY: el.y };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.preventDefault(); event.stopPropagation();
    this.resizeState = { elementId: el.id, handle, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.x, startElY: el.y, startElW: el.width, startElH: el.height };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onDocMouseMove(event: MouseEvent): void {
    const s = this.canvasScale;
    if (this.dragState) {
      const el = this.theme.elements.find(e => e.id === this.dragState!.elementId);
      if (el) { el.x = Math.max(0, Math.round(this.dragState.startElX + (event.clientX - this.dragState.startMouseX) / s)); el.y = Math.max(0, Math.round(this.dragState.startElY + (event.clientY - this.dragState.startMouseY) / s)); }
    }
    if (this.resizeState) {
      const el = this.theme.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const dx = (event.clientX - this.resizeState.startMouseX) / s, dy = (event.clientY - this.resizeState.startMouseY) / s, h = this.resizeState.handle, min = 20;
        if (h.includes('r')) el.width = Math.max(min, Math.round(this.resizeState.startElW + dx));
        if (h.includes('l')) { const nw = Math.max(min, Math.round(this.resizeState.startElW - dx)); el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - nw)); el.width = nw; }
        if (h.includes('b')) el.height = Math.max(min, Math.round(this.resizeState.startElH + dy));
        if (h.includes('t')) { const nh = Math.max(min, Math.round(this.resizeState.startElH - dy)); el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - nh)); el.height = nh; }
      }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null; this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  /* Selection */
  selectElement(id: string, event: Event): void { event.stopPropagation(); this.selectedElementId = id; this.selectedPanelId = null; this.panelView = 'element'; }
  selectElementFromList(id: string): void { this.selectedElementId = id; this.selectedPanelId = null; this.panelView = 'element'; }
  deselectElement(): void { this.selectedElementId = null; this.panelView = 'theme'; }

  /* Price helpers */
  getPricePreview(el: ArrivalsThemeElement): string {
    const value = String(el.previewPrice ?? 350);
    if (!el.showCurrency) return value;
    const sym = el.currencySymbol || '₽';
    return el.currencyPosition === 'before' ? sym + ' ' + value : value + ' ' + sym;
  }

  getPriceTooltip(el: ArrivalsThemeElement): string {
    if (el.bindingType === 'modifier' && el.modifierName) return 'Модификатор: ' + el.modifierName;
    if (el.bindingType === 'size' && el.productName && el.sizeName) return el.productName + ' ' + el.sizeName;
    if (el.bindingType === 'product' && el.productName) return el.productName;
    return 'Товар не привязан';
  }

  /* Advertise helpers */
  getAdvertiseLabel(el: ArrivalsThemeElement): string {
    if (el.panels && el.panels.length > 0) {
      const parts = el.panels.map(p => {
        const company = this.getCompanyName(p.companyId);
        return company ? `${p.name}: ${company}` : p.name;
      });
      return parts.join(' · ');
    }
    return 'Динамическая область';
  }

  /** Миграция: старые campaignIds элемента → первая Advertise-панель */
  ensureAdvertisePanels(el: ArrivalsThemeElement): void {
    if (el.type !== 'advertise') return;
    if (el.panels === undefined) {
      el.panels = [
        {
          id: Date.now(),
          name: 'Advertise панель 1',
          companyId: null,
          campaignIds: el.campaignIds ? [...el.campaignIds] : [],
        },
      ];
    }
  }

  get selectedPanels(): AdvertisePanelConfig[] {
    return this.selectedElement?.panels ?? [];
  }

  get selectedPanel(): AdvertisePanelConfig | null {
    const panels = this.selectedPanels;
    if (!panels.length) return null;
    return panels.find(p => p.id === this.selectedPanelId) ?? panels[0];
  }

  selectPanel(panelId: number): void { this.selectedPanelId = panelId; }

  addPanel(): void {
    if (!this.selectedElement || this.selectedElement.type !== 'advertise') return;
    this.ensureAdvertisePanels(this.selectedElement);
    const n = this.selectedElement.panels!.length + 1;
    const panel: AdvertisePanelConfig = {
      id: Date.now() + n,
      name: 'Advertise панель ' + n,
      companyId: null,
      campaignIds: [],
    };
    this.selectedElement.panels!.push(panel);
    this.selectedPanelId = panel.id;
  }

  removePanel(panelId: number, event: Event): void {
    event.stopPropagation();
    if (!this.selectedElement?.panels) return;
    this.selectedElement.panels = this.selectedElement.panels.filter(p => p.id !== panelId);
    if (this.selectedPanelId === panelId) this.selectedPanelId = null;
  }

  getCompanyName(companyId: number | null | undefined): string {
    if (companyId == null) return '';
    return this.companies.find(c => c.id === companyId)?.name ?? '#' + companyId;
  }

  /* Campaign multi-select helpers */
  toggleCampaign(campId: number): void {
    const panel = this.selectedPanel;
    if (!panel) return;
    const idx = panel.campaignIds.indexOf(campId);
    if (idx >= 0) {
      panel.campaignIds.splice(idx, 1);
    } else {
      panel.campaignIds.push(campId);
    }
  }

  isCampaignSelected(campId: number): boolean {
    return this.selectedPanel?.campaignIds?.includes(campId) ?? false;
  }

  get selectedCampaignCount(): number {
    return this.selectedPanel?.campaignIds?.length ?? 0;
  }

  getDishData(productId: string): ExternalMenuItem | undefined {
    // Parse composite ID: externalId::sizeIndex
    const parts = productId.split('::');
    const externalId = parts[0];
    const sizeIndex = parts.length > 1 ? parseInt(parts[1], 10) : -1;

    for (const cat of this.externalMenuCategories) {
      const dish = cat.items.find(d => d.externalId === externalId);
      if (!dish) continue;
      // If a specific size is selected, return dish with size-specific overrides
      if (sizeIndex >= 0 && dish.sizes && dish.sizes[sizeIndex]) {
        const size = dish.sizes[sizeIndex];
        return {
          ...dish,
          name: dish.name + ' ' + size.name,
          price: size.price,
          sizes: undefined, // Hide sizes list — only one size selected
        };
      }
      return dish;
    }
    return undefined;
  }

  /** Get display name for a productId (for inspector selected-dishes list) */
  getDishDisplayName(productId: string): string {
    const dish = this.getDishData(productId);
    return dish?.name || '#' + productId.slice(0, 10);
  }

  /** Get display price for a productId */
  getDishDisplayPrice(productId: string): string {
    const dish = this.getDishData(productId);
    return dish ? dish.price + ' \u20BD' : '';
  }

  getRowBg(el: ArrivalsThemeElement, odd: boolean): string {
    const primary = el.rowBgTransparent ? 'transparent' : (el.rowBgColor || '#ffffff');
    const alt = el.highlightTransparent ? 'transparent' : (el.highlightColor || '#f5f5f5');
    if (!el.alternateRows) return primary;
    return odd ? alt : primary;
  }

  formatSizes(sizes?: { name: string; price: number }[]): string {
    if (!sizes?.length) return '';
    return sizes.map(s => s.name + ' (' + s.price + '\u20BD)').join(' \u00B7 ');
  }

  openDishSelector(): void {
    this.dishSelectorIds = [...(this.selectedElement?.productIds || [])];
    this.dishSelectorOpen = true;
  }

  onDishSelectorConfirm(ids: string[]): void {
    if (this.selectedElement) {
      this.selectedElement.productIds = ids;
    }
    this.dishSelectorOpen = false;
  }

  removeDishFromList(externalId: string): void {
    if (this.selectedElement?.productIds) {
      this.selectedElement.productIds = this.selectedElement.productIds.filter(id => id !== externalId);
    }
  }

  formatCampaignDate(dateStr: string): string {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  /* Add / Delete */
  addElement(type: ArrivalsElementType): void {
    // Сообщение при добавлении платного элемента без лицензии (вариант E)
    if (type === 'area' && !this.dataService.hasPremiumLicense) {
      this.showToast('Вы добавляете платный элемент. Он будет недоступен на экране без платной лицензии.');
    }
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    const el: ArrivalsThemeElement = { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), type, name: label, x: 20 + this.theme.elements.length * 20, y: 20 + this.theme.elements.length * 20, width: 120, height: 60, borderWidth: 1, borderColor: '#000000', borderRadius: 0 };
    if (type === 'text') { el.text = 'Type something'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; }
    if (type === 'price') { el.name = 'Цена блюда'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; el.productId = undefined; el.productName = undefined; el.sizeId = null; el.sizeName = undefined; el.showCurrency = true; el.currencySymbol = '₽'; el.currencyPosition = 'after'; }
    if (type === 'area') { el.name = 'Область контрола'; el.width = 300; el.height = 500; el.borderWidth = 2; el.borderColor = '#90CAF9'; el.borderRadius = 4; el.areaBgColor = '#ffffff'; el.areaControlId = this.availableControls.length > 0 ? this.availableControls[0].id : undefined; el.areaMode = 'list'; el.areaListDirection = 'top'; el.areaMaxColumns = 1; el.areaStatusType = 'kitchen'; el.areaStatuses = []; el.areaOrderTypes = ['ordinary', 'courier', 'pickup']; el.areaOrderSources = []; el.areaSortOrder = 'oldest-first'; el.areaInterlineSpacing = 0; }
    if (type === 'advertise') { el.name = 'Динамическая область'; el.width = 200; el.height = 150; el.campaignIds = []; el.panels = []; }
    if (type === 'menulist') { el.name = 'Меню-лист'; el.width = 400; el.height = 300; el.productIds = []; el.rowHeight = 48; el.alternateRows = true; el.rowPadding = 4; el.rowBgColor = '#ffffff'; el.rowBgTransparent = false; el.highlightColor = '#f5f5f5'; el.highlightTransparent = false; el.showIcons = true; el.showDescription = false; el.showAllergens = false; el.showNutrition = false; el.nutritionColor = '#999999'; el.allergensColor = '#e65100'; el.fontName = { size: 16, family: 'Segoe UI', color: '#333333', bold: false, italic: false }; el.fontModifiers = { size: 12, family: 'Segoe UI', color: '#666666', bold: false, italic: false }; el.fontPrice = { size: 16, family: 'Segoe UI', color: '#CC0000', bold: false, italic: false }; el.fontDescription = { size: 11, family: 'Segoe UI', color: '#999999', bold: false, italic: false }; }
    if (type === 'counter') { el.name = 'Текущее время'; el.width = 100; el.height = 40; el.fontFamily = 'Arial'; el.fontSize = 16; el.fontBold = false; el.fontItalic = false; el.textAlign = 'center'; el.text = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
    this.theme.elements.push(el);
    this.selectedElementId = el.id; this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void { event.stopPropagation(); this.deleteElementTarget = el; }
  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.theme.elements = this.theme.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) this.deselectElement();
      this.deleteElementTarget = null;
    }
  }

  onAreaControlChange(): void { if (this.selectedElement) { this.areaHelper.reset(this.selectedElement.id); this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]); } }

  /* Save */
  save(): void {
    const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'menuboard-themes', [...MOCK_ARRIVALS_THEMES]);
    const idx = allThemes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) allThemes[idx] = JSON.parse(JSON.stringify(this.theme)); else allThemes.push(JSON.parse(JSON.stringify(this.theme)));
    this.storage.save('web-screens', 'menuboard-themes', allThemes);
    const list: any[] = this.storage.load('web-screens', 'menuboard-list', []);
    if (!list.find((i: any) => i.id === this.theme.id)) { list.push({ id: this.theme.id, name: this.theme.name, itemType: 'theme', resolution: this.theme.resolution, createdBy: 'Моя' }); this.storage.save('web-screens', 'menuboard-list', list); }
    this.showToast('Тема сохранена');
  }

  goBack(): void { this.router.navigate(['/prototype/web-screens/menuboard-themes']); }

  onEditControl(controlId: number): void {
    this.save();
    this.router.navigate(['/prototype/web-screens/menuboard-control-editor', controlId], {
      queryParams: { return: 'menuboard-theme-editor', themeId: this.theme.id, elementId: this.selectedElementId }
    });
  }
  private showToast(msg: string): void { this.toastMessage = msg; setTimeout(() => (this.toastMessage = ''), 3000); }
}
