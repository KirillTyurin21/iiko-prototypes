import { Component, inject, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { CsDataService } from '../cs-data.service';
import { MOCK_ARRIVALS_THEMES, MOCK_ARRIVALS_CONTROLS, MOCK_ARRIVALS_ORDERS } from '../data/mock-data';
import { ARRIVALS_THEME_CATEGORIES } from '../data/element-categories.data';
import { ArrivalsTheme, ArrivalsThemeElement, ArrivalsThemeMode, ArrivalsElementType, ArrivalsControl, ArrivalsOrderMock, ElementCategory } from '../types';
import { AreaElementRendererComponent } from '../components/theme-editor/area-element-renderer.component';
import { ThemeElementInspectorComponent } from '../components/theme-editor/theme-element-inspector.component';
import { AreaElementInspectorComponent } from '../components/theme-editor/area-element-inspector.component';
import { OrderSimulatorComponent } from '../components/simulator/order-simulator.component';
import { AreaEmulationHelper } from '../components/theme-editor/area-emulation.service';
import { SimulatorHelper } from '../components/theme-editor/simulator.helper';
import { ElementPaletteComponent } from '../components/element-palette/element-palette.component';
import { CanvasZoomControlComponent } from '../components/theme-editor/canvas-zoom-control.component';
import { ModePanelComponent } from '../components/theme-editor/mode-panel.component';

type PanelView = 'theme' | 'add-element' | 'element';

@Component({
  selector: 'app-arrivals-theme-editor-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiConfirmDialogComponent, AreaElementRendererComponent, ThemeElementInspectorComponent, AreaElementInspectorComponent, OrderSimulatorComponent, ElementPaletteComponent, CanvasZoomControlComponent, ModePanelComponent],
  template: `
    <div class="editor-layout">
      <app-mode-panel
        [modes]="theme.modes ?? []"
        [activeModeId]="theme.activeModeId ?? null"
        [collapsed]="modePanelCollapsed"
        [canvasWidth]="resWidth"
        [canvasHeight]="resHeight"
        (selectMode)="selectMode($event)"
        (toggleCollapse)="modePanelCollapsed = !modePanelCollapsed"
        (addMode)="openNewModeModal()"
        (deleteMode)="requestDeleteMode($event)">
      </app-mode-panel>
      <div class="canvas-column">
        <div class="canvas-area" #canvasAreaRef>
        <div class="canvas-scroll">
          <div class="canvas-sizer" #canvasSizerRef [style.width.px]="resWidth * canvasScale" [style.height.px]="resHeight * canvasScale">
            <div class="canvas-viewport" [class.hide-grid]="!gridVisible" [class.hide-borders]="!bordersVisible" [style.width.px]="resWidth" [style.height.px]="resHeight" [style.transform]="'scale(' + canvasScale + ')'" (click)="onCanvasClick()">
            <ng-container *ngFor="let el of activeElements; let i = index">
              <div *ngIf="el.type === 'area'" class="canvas-element area-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.z-index]="activeElements.length - i" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <app-area-element-renderer [element]="el" [orderPositions]="areaHelper.getOrderPositions(el, sim.orders, sim.active, mockOrders, availableControls)" [emulationRunning]="areaHelper.isRunning(el.id)" [hasControl]="!!el.areaControlId" (toggleEmu)="areaHelper.toggle($event, getFilterSource(), availableControls)" (resetEmu)="areaHelper.reset($event.id)" (fillEmu)="areaHelper.fill($event, getFilterSource(), availableControls)"></app-area-element-renderer>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
              <div *ngIf="el.type !== 'area'" class="canvas-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.z-index]="activeElements.length - i" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <span *ngIf="el.type === 'text'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">{{ el.text }}</span>
                <span *ngIf="el.type === 'image'" class="el-placeholder"><lucide-icon name="image" [size]="24"></lucide-icon></span>
                <span *ngIf="el.type === 'price'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign" [title]="getPriceTooltip(el)">{{ getPricePreview(el) }}</span>
                <span *ngIf="el.type === 'external-order-number'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">#EXT-12345</span>
                <span *ngIf="el.type !== 'text' && el.type !== 'image' && el.type !== 'price' && el.type !== 'external-order-number'" class="el-placeholder-label">{{ el.name }}</span>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
            </ng-container>
            </div>
          </div>
        </div>
        </div>
        <div class="canvas-bottom-bar" role="toolbar" aria-label="Панель управления канвасом">
          <div class="bottom-group">
            <button type="button" class="tool-toggle" [class.active]="bordersVisible" [attr.aria-pressed]="bordersVisible" (click)="bordersVisible = !bordersVisible" title="Показать или скрыть границы элементов">
              <lucide-icon [name]="bordersVisible ? 'eye' : 'eye-off'" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="bottom-divider"></div>
          <div class="bottom-group">
            <button type="button" class="tool-toggle" [class.active]="gridVisible" [attr.aria-pressed]="gridVisible" (click)="gridVisible = !gridVisible" title="Показать или скрыть сетку">
              <lucide-icon name="layout-grid" [size]="18"></lucide-icon>
            </button>
            <button type="button" class="tool-toggle" [class.active]="snapEnabled" [attr.aria-pressed]="snapEnabled" (click)="snapEnabled = !snapEnabled" title="Прилипание к сетке">
              <lucide-icon name="magnet" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="bottom-zoom">
            <app-canvas-zoom-control
              [zoom]="canvasScale"
              [dropUp]="true"
              variant="toolbar"
              (zoomChange)="applyZoom($event)"
              (fitRequested)="fitCanvas()">
            </app-canvas-zoom-control>
          </div>
        </div>
        <app-order-simulator [orders]="sim.orders" [autoRunning]="sim.autoRunning" (addOrder)="sim.addOrder(); areaHelper.clearAll()" (loadMocks)="sim.loadMocks(); areaHelper.clearAll()" (removeOrder)="sim.removeByIdx($event); areaHelper.clearAll()" (cycleStatus)="sim.cycleStatus($event); areaHelper.clearAll()" (changeOrderType)="sim.changeOrderType($event.order, $event.newType); areaHelper.clearAll()" (toggleAuto)="sim.toggleAuto()" (clearAll)="sim.clearAll(); areaHelper.clearAll()"></app-order-simulator>
      </div>
      <div class="control-panel">
        <div class="panel-body">
          <ng-container *ngIf="panelView === 'theme'">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon><span class="bc-link">Тема</span><ng-container *ngIf="activeMode"><span class="bc-separator">/</span><span class="bc-current">{{ activeMode.name }}</span></ng-container></div>
            <div class="field-group"><label class="field-label">Имя темы</label><input class="field-input" [(ngModel)]="theme.name" /></div>
            <div class="field-group"><label class="field-label">Разрешение</label><select class="field-select" [(ngModel)]="theme.resolution" (ngModelChange)="onResolutionChange()"><option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option></select></div>
            <ng-container *ngIf="activeMode">
              <div class="section-divider">Настройка режима</div>
              <div class="field-group" *ngIf="activeMode.isCustom">
                <label class="field-label">Название *</label>
                <input class="field-input" [(ngModel)]="activeMode.name" placeholder="Название режима" />
                <div class="condition-row" *ngFor="let c of activeMode.conditions ?? []; let i = index">
                  <label class="field-label cond-label">Операция</label>
                  <select class="field-select cond-select" [(ngModel)]="c.operation">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                  <button type="button" class="cond-remove" (click)="removeCondition(activeMode, i)" title="Убрать условие" aria-label="Убрать условие">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
                <button type="button" class="btn-add-condition" (click)="addCondition(activeMode)">Добавить условие</button>
              </div>
              <div class="field-group" *ngIf="!activeMode.isCustom && activeMode.id !== 'order-screen'">
                <label class="field-toggle">
                  <input type="checkbox" class="toggle-input" [(ngModel)]="activeMode.activated" />
                  <span class="toggle-track"></span>
                  <span class="toggle-label">Активировать</span>
                </label>
              </div>
            </ng-container>
            <div class="section-divider">Элементы</div>
            <div *ngFor="let el of activeElements; let i = index" class="element-list-item" [class.active]="selectedElementId === el.id" [class.list-dragging]="listDragIndex === i" [class.list-drag-above]="listDragOverIndex === i && listDragIndex !== null && listDragIndex! > i" [class.list-drag-below]="listDragOverIndex === i && listDragIndex !== null && listDragIndex! < i" (click)="selectElementFromList(el.id)" (mousedown)="onListMouseDown(i, $event)"><span class="el-list-name">{{ el.name }}</span><span *ngIf="el.type === 'area'" class="premium-badge" title="Платный элемент — доступен при платной лицензии"><lucide-icon name="alert-circle" [size]="14"></lucide-icon></span><button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить"><lucide-icon name="x" [size]="14"></lucide-icon></button></div>
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
            <app-theme-element-inspector *ngIf="selectedElement.type !== 'area'" [element]="selectedElement"></app-theme-element-inspector>
            <app-area-element-inspector *ngIf="selectedElement.type === 'area'" [element]="selectedElement" [availableControls]="availableControls" (areaControlChange)="onAreaControlChange()" (editControl)="onEditControl($event)"></app-area-element-inspector>
          </ng-container>
        </div>
        <div class="panel-footer"><button class="btn-save" (click)="save()">СОХРАНИТЬ</button><button class="btn-back" (click)="goBack()">НАЗАД</button></div>
        <!-- Баннер: нет платной лицензии (вариант D) -->
      <div *ngIf="!dataService.hasPremiumLicense && themeHasPremium" class="premium-banner">
        <lucide-icon name="alert-triangle" [size]="16"></lucide-icon>
        <span>Отсутствует лицензия.</span>
      </div>
    </div>
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>
      <ui-confirm-dialog *ngIf="deleteElementTarget" [open]="true" title="Удалить элемент" [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'" confirmText="Удалить" variant="danger" (confirmed)="confirmDeleteElement()" (cancelled)="deleteElementTarget = null"></ui-confirm-dialog>
      <ui-confirm-dialog *ngIf="deleteModeTarget" [open]="true" title="Удалить режим" [message]="'Удалить режим «' + deleteModeTarget.name + '»? Элементы режима будут удалены.'" confirmText="Удалить" variant="danger" (confirmed)="confirmDeleteMode()" (cancelled)="deleteModeTarget = null"></ui-confirm-dialog>
      <div *ngIf="newModeModalOpen" class="mode-modal-overlay" (click)="closeNewModeModal()">
        <div class="mode-modal" (click)="$event.stopPropagation()" role="dialog" aria-label="Новый режим">
          <div class="mode-modal-title">Новый режим</div>
          <div class="field-group">
            <label class="field-label">Название режима</label>
            <input class="field-input" [(ngModel)]="newModeName" (keydown.enter)="confirmNewMode()" placeholder="Напр. Режим доставки" />
          </div>
          <div class="mode-modal-actions">
            <button class="btn-save" (click)="confirmNewMode()">Создать</button>
            <button class="btn-back" (click)="closeNewModeModal()">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .editor-layout { display: flex; height: calc(100vh - 110px); margin: -20px -24px; font-family: Roboto, sans-serif; }
    .canvas-column { flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; }
    .premium-banner { position: absolute; bottom: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(0, 0, 0, 0.25); color: #fff; font-size: 12px; font-weight: 500; }
    .canvas-area { flex: 1; min-width: 0; overflow: auto; background: #e0e0e0; }
    .tool-toggle { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; padding: 0; border: 1px solid #D6D6D6; border-radius: 4px; background: #fff; color: #616161; cursor: pointer; }
    .tool-toggle:hover { background: #EBEBEB; }
    .tool-toggle.active { background: #F0F5FF; border-color: #448AFF; color: #448AFF; }
    .tool-toggle:focus-visible { outline: 2px solid #448aff; outline-offset: -2px; }
    .canvas-bottom-bar { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; background: #fff; border-top: 1px solid #D6D6D6; box-shadow: 0 2px 2px 0 rgba(224, 224, 224, 1), 0 1px 1px 0 rgba(214, 214, 214, 1); flex-shrink: 0; }
    .bottom-group { display: flex; align-items: center; gap: 4px; }
    .bottom-divider { width: 1px; height: 20px; background: #D6D6D6; flex-shrink: 0; }
    .bottom-zoom { margin-left: auto; display: flex; align-items: center; }
    .canvas-scroll { display: flex; min-height: 100%; padding: 8px; box-sizing: border-box; }
    .canvas-sizer { position: relative; margin: auto; }
    .canvas-viewport.hide-grid { background-color: #fff; background-image: none; }
    .canvas-viewport.hide-borders .canvas-element { border-color: transparent !important; }
    .canvas-viewport { position: absolute; top: 0; left: 0; transform-origin: top left; background-color: #fff; background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .canvas-element { position: absolute; border-style: dashed; cursor: move; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.5); transition: box-shadow 0.15s; font-size: 13px; color: #333; overflow: hidden; user-select: none; }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected { border-style: solid; border-color: #448aff !important; box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.dragging { opacity: 0.85; transition: none; }
    .canvas-element.area-element { border-style: dashed !important; }
    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .handle { position: absolute; width: 8px; height: 8px; background: #fff; border: 2px solid #448aff; z-index: 2; }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; } .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; } .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; } .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; } .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }
    .control-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; border-left: 1px solid #D6D6D6; }
    .panel-body { flex: 1; overflow-y: auto; padding: 16px; }
    .panel-footer { display: flex; gap: 12px; padding: 12px 16px; border-top: 1px solid #D6D6D6; }
    .btn-save { flex: 1; height: 36px; border: none; border-radius: 4px; background: #448AFF; color: #FFFFFF; font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-save:hover { background: #3969D5; }
    .btn-back { flex: 1; height: 36px; border: 1px solid #D6D6D6; border-radius: 4px; background: #FFFFFF; color: #333333; font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-back:hover { background: #FAFAFA; }
    .panel-breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
    .bc-home { color: #448AFF; cursor: pointer; } .bc-link { color: #448AFF; cursor: pointer; font-weight: 500; } .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; } .bc-current { color: #333; font-weight: 500; }
    .field-group { margin-bottom: 12px; } .field-label { display: block; font-size: 12px; color: #616161; margin-bottom: 4px; }
    .field-input { width: 100%; height: 38px; padding: 0 12px; border: 1px solid #D6D6D6; border-radius: 4px; font-size: 13.5px; font-family: Roboto, sans-serif; color: #333333; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: #448AFF; box-shadow: 0 0 0 2px rgba(68, 138, 255, 0.16); }
    .field-toggle { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #333333; cursor: pointer; user-select: none; }
    .toggle-input { display: none; }
    .toggle-track { position: relative; width: 36px; height: 20px; border-radius: 999px; background: #D6D6D6; flex-shrink: 0; transition: background 0.15s; }
    .toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 2px 0 rgba(33, 33, 33, 0.24); transition: transform 0.15s; }
    .toggle-input:checked + .toggle-track { background: #448AFF; }
    .toggle-input:checked + .toggle-track::after { transform: translateX(16px); }
    .condition-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .cond-label { margin-bottom: 0; flex-shrink: 0; width: 56px; }
    .cond-select { width: 110px; }
    .cond-remove { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 4px; background: transparent; color: #9E9E9E; cursor: pointer; flex-shrink: 0; }
    .cond-remove:hover { background: #FFF2F2; color: #FF5252; }
    .btn-add-condition { height: 36px; padding: 0 14px; border: 1px solid #448AFF; border-radius: 4px; background: #FFFFFF; color: #448AFF; font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-add-condition:hover { background: rgba(68, 138, 255, 0.06); }
    .field-select { width: 100%; height: 38px; padding: 0 8px; border: 1px solid #D6D6D6; border-radius: 4px; font-size: 13.5px; font-family: Roboto, sans-serif; color: #333333; background: #fff; cursor: pointer; box-sizing: border-box; }
    .section-divider { position: relative; text-align: center; margin: 20px 0 12px; font-size: 12px; font-weight: 500; color: #616161; text-transform: uppercase; letter-spacing: 0.3px; }
    .section-divider::before, .section-divider::after { content: ''; position: absolute; top: 50%; width: calc(50% - 50px); height: 1px; background: #D6D6D6; }
    .section-divider::before { left: 0; } .section-divider::after { right: 0; }
    .element-list-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; cursor: grab; transition: background 0.15s, opacity 0.15s; font-size: 13px; position: relative; }
    .element-list-item:hover { background: #EBEBEB; } .element-list-item.active { background: #F0F5FF; }
    .element-list-item.list-dragging { opacity: 0.4; cursor: grabbing; }
    .element-list-item.list-drag-above::before { content: ''; position: absolute; top: -2px; left: 0; right: 0; height: 2px; background: #448AFF; border-radius: 1px; z-index: 1; }
    .element-list-item.list-drag-below::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #448AFF; border-radius: 1px; z-index: 1; }
    .el-list-name { flex: 1; }
    .premium-badge { display: inline-flex; align-items: center; margin-right: 6px; color: #FFAB40; cursor: help; flex-shrink: 0; }
    .el-list-delete { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 4px; background: transparent; color: #9E9E9E; cursor: pointer; }
    .el-list-delete:hover { background: #FFF2F2; color: #FF5252; }
    .btn-add-element { width: 100%; height: 40px; border: none; border-radius: 4px; background: #448AFF; color: #fff; font-size: 14px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; margin-top: 8px; }
    .btn-add-element:hover { background: #3969D5; }
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 24px; background: #424242; color: #fff; border-radius: 4px; font-size: 14px; z-index: 9000; animation: toastIn 0.3s ease; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
    .mode-modal-overlay { position: fixed; inset: 0; background: rgba(33, 33, 33, 0.32); z-index: 8000; display: flex; align-items: center; justify-content: center; }
    .mode-modal { width: 340px; background: #fff; border-radius: 4px; padding: 24px; box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.9), 0 8px 10px 0 rgba(214, 214, 214, 0.9); }
    .mode-modal-title { font-size: 16px; font-weight: 500; color: #333333; margin-bottom: 16px; }
    .mode-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }
    .mode-modal .btn-save { flex: none; width: 120px; border: none; background: #448AFF; color: #FFFFFF; }
    .mode-modal .btn-save:hover { background: #3969D5; }
    .mode-modal .btn-back { flex: none; width: 120px; background: #FFFFFF; border: 1px solid #D6D6D6; color: #333333; }
    .mode-modal .btn-back:hover { background: #FAFAFA; }
  `],
})
export class ArrivalsThemeEditorScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);
  dataService = inject(CsDataService);

  theme: ArrivalsTheme = { id: 0, name: 'Новая тема', resolution: '1024x768', screenMode: 'order-screen', elements: [] };
  panelView: PanelView = 'theme';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  modePanelCollapsed = false;
  deleteModeTarget: ArrivalsThemeMode | null = null;
  newModeModalOpen = false;
  newModeName = '';
  toastMessage = '';
  canvasScale = 1;
  bordersVisible = true;
  gridVisible = true;
  snapEnabled = false;
  private readonly ZOOM_MIN = 0.25;
  private readonly ZOOM_MAX = 2;
  private boundWheel = this.onCanvasWheel.bind(this);
  private wheelTarget: HTMLElement | null = null;
  availableControls: ArrivalsControl[] = [];
  mockOrders: ArrivalsOrderMock[] = [...MOCK_ARRIVALS_ORDERS];

  areaHelper = new AreaEmulationHelper();
  sim = new SimulatorHelper();

  @ViewChild('canvasAreaRef') canvasAreaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasSizerRef') canvasSizerRef!: ElementRef<HTMLDivElement>;

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
  elementTypes: { type: ArrivalsElementType; label: string }[] = [
    { type: 'text', label: 'Текст' }, { type: 'image', label: 'Изображение' },
    { type: 'order-number', label: 'Номер заказа' }, { type: 'table-number', label: 'Номер стола' },
    { type: 'order-status', label: 'Статус заказа' }, { type: 'cooking-start-time', label: 'Время начала приготовления заказа' },
    { type: 'cooking-end-time', label: 'Время завершения приготовления заказа' }, { type: 'system-cooking-time', label: 'Системное время приготовления заказа' },
    { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа' }, { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания' },
    { type: 'client-name', label: 'Имя клиента' }, { type: 'client-phone', label: 'Номер телефона клиента' },
    { type: 'courier-name', label: 'Имя назначенного курьера' }, { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа' },
    { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки' }, { type: 'dispatch-time', label: 'Время отправки заказа' },
    { type: 'travel-time', label: 'Время в пути' }, { type: 'delivery-time', label: 'Время доставки заказа' },
    { type: 'delivery-status', label: 'Статус доставки' }, { type: 'client-comment', label: 'Комментарий от клиента' },
    { type: 'client-delivery-time', label: 'Время доставки, обозначенное клиентом' }, { type: 'cancel-reason', label: 'Причина отмены заказа' },
    { type: 'cancel-comment', label: 'Комментарий к отмене заказа' }, { type: 'cancel-time', label: 'Время отмены заказа' },
    { type: 'external-data', label: 'Внешние данные' },
    { type: 'external-order-number', label: 'Внешний номер заказа' },
    { type: 'price', label: 'Цена блюда' },
  ];

  themeCategories = ARRIVALS_THEME_CATEGORIES.map(cat => ({ ...cat, collapsed: cat.collapsed, elements: [...cat.elements] }));

  /* ── List drag reorder ── */
  onListMouseDown(index: number, event: MouseEvent): void {
    if (event.button !== 0) return;
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
      const el = this.activeElements.splice(this.listDragIndex, 1)[0];
      this.activeElements.splice(this.listDragOverIndex, 0, el);
    }
    this.listDragIndex = null;
    this.listDragOverIndex = null;
    document.removeEventListener('mousemove', this.boundListMouseMove);
    document.removeEventListener('mouseup', this.boundListMouseUp);
  }

  get resWidth(): number { return parseInt(this.theme.resolution.split('x')[0]) || 1024; }
  get resHeight(): number { return parseInt(this.theme.resolution.split('x')[1]) || 768; }
  /** Активный режим темы */
  get activeMode(): ArrivalsThemeMode | null {
    if (!this.theme.modes || this.theme.modes.length === 0) return null;
    return this.theme.modes.find(m => m.id === this.theme.activeModeId) ?? this.theme.modes[0];
  }
  /** Элементы активного режима (для канваса и списка) */
  get activeElements(): ArrivalsThemeElement[] {
    return this.activeMode?.elements ?? [];
  }
  get selectedElement(): ArrivalsThemeElement | null {
    return this.selectedElementId ? (this.activeElements.find(e => e.id === this.selectedElementId) ?? null) : null;
  }
  /** Тема содержит платный элемент (для баннера) */
  get themeHasPremium(): boolean {
    return this.activeElements.some(e => e.type === 'area');
  }

  /** Миграция старых тем к модели режимов (стандартные: «Экран заказа» + «Режим ожидания») */
  private normalizeTheme(t: ArrivalsTheme): ArrivalsTheme {
    if (t.modes && t.modes.length > 0) {
      // Миграция второго режима «Экран приветствия» → «Режим ожидания»
      t.modes = t.modes.map(m => {
        if (m.id === 'welcome-screen') return { ...m, id: 'idle-screen', name: 'Режим ожидания', activated: m.activated ?? false };
        if (m.id === 'order-screen') return { ...m, activated: m.activated ?? true };
        return m;
      });
      if (t.activeModeId === 'welcome-screen') t.activeModeId = 'idle-screen';
      if (!t.modes.some(m => m.id === t.activeModeId)) t.activeModeId = t.modes[0].id;
      return t;
    }
    const legacy = t.elements ?? [];
    const legacyIsIdle = t.screenMode === 'welcome-screen' || t.screenMode === 'idle-screen';
    t.modes = [
      { id: 'order-screen', name: 'Экран заказа', activated: true, elements: legacyIsIdle ? [] : legacy },
      { id: 'idle-screen', name: 'Режим ожидания', activated: false, elements: legacyIsIdle ? legacy : [] },
    ];
    t.activeModeId = legacyIsIdle ? 'idle-screen' : 'order-screen';
    return t;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
      const found = allThemes.find(t => t.id === Number(id));
      if (found) this.theme = JSON.parse(JSON.stringify(found));
    } else {
      this.theme.id = Date.now();
    }
    this.theme = this.normalizeTheme(this.theme);
    this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);

    // Handle return from control editor with newControlId (Save as Copy)
    const newControlId = this.route.snapshot.queryParamMap.get('newControlId');
    if (newControlId) {
      const ncId = Number(newControlId);
      // Apply to the EXACT area element that was being edited
      const elementId = this.route.snapshot.queryParamMap.get('elementId');
      const targetEl = elementId
        ? (this.theme.modes ?? []).flatMap(m => m.elements).find(e => e.id === elementId && e.type === 'area')
        : null;
      if (targetEl) {
        targetEl.areaControlId = ncId;
        this.selectedElementId = targetEl.id;
      }
      this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
      // Auto-save theme after applying new control
      this.save();
    }

    setTimeout(() => this.updateCanvasScale(), 0);
  }

  ngAfterViewInit(): void {
    // Первичный auto-fit — после первой проверки шаблона, чтобы не ловить NG0100
    setTimeout(() => this.updateCanvasScale(), 0);
    this.wheelTarget = this.canvasAreaRef?.nativeElement ?? null;
    this.wheelTarget?.addEventListener('wheel', this.boundWheel, { passive: false });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('mousemove', this.boundListMouseMove);
    document.removeEventListener('mouseup', this.boundListMouseUp);
    this.wheelTarget?.removeEventListener('wheel', this.boundWheel);
    this.areaHelper.clearAll();
    this.sim.stopAuto();
  }

  onResolutionChange(): void { setTimeout(() => this.updateCanvasScale(), 0); }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    if (!event.ctrlKey && !event.metaKey) return;
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (event.key === '0') { event.preventDefault(); this.zoomAroundCenter(1); }
    else if (event.key === '1') { event.preventDefault(); this.fitCanvas(); }
  }

  updateCanvasScale(): void {
    if (!this.canvasAreaRef?.nativeElement) return;
    const c = this.canvasAreaRef.nativeElement;
    this.canvasScale = Math.max(this.ZOOM_MIN, Math.min((c.clientWidth - 16) / this.resWidth, (c.clientHeight - 16) / this.resHeight, 1));
    c.scrollLeft = 0;
    c.scrollTop = 0;
  }

  /** Применить масштаб из контрола (клики по пилюле) — с центрированием */
  applyZoom(k: number): void {
    this.zoomAroundCenter(k);
  }

  /** Подогнать холст под экран */
  fitCanvas(): void { this.updateCanvasScale(); }

  /** Шаг масштаба: ±10% (Ctrl/Shift+колесо) — с центрированием */
  private zoomStep(dir: 1 | -1): void {
    this.zoomAroundCenter(Math.min(
      this.ZOOM_MAX,
      Math.max(this.ZOOM_MIN, Math.round((this.canvasScale + dir * 0.1) * 100) / 100)
    ));
  }

  /**
   * Зум с удержанием точки канваса под центром видимой области:
   * измеряем происхождение канваса в координатах скролл-контента,
   * после смены масштаба компенсируем scrollLeft/scrollTop.
   */
  private zoomAroundCenter(k: number): void {
    const sNew = Math.min(this.ZOOM_MAX, Math.max(this.ZOOM_MIN, k));
    if (Math.abs(sNew - this.canvasScale) < 0.0001) {
      this.canvasScale = sNew;
      return;
    }
    const area = this.canvasAreaRef?.nativeElement;
    const sizer = this.canvasSizerRef?.nativeElement;
    if (!area || !sizer) {
      this.canvasScale = sNew;
      return;
    }
    const sOld = this.canvasScale;
    const areaRect = area.getBoundingClientRect();
    const sizerRect = sizer.getBoundingClientRect();
    // Происхождение канваса в координатах скролл-контента
    const ox = sizerRect.left - areaRect.left + area.scrollLeft;
    const oy = sizerRect.top - areaRect.top + area.scrollTop;
    // Точка канваса под центром видимой области
    const px = (area.scrollLeft + area.clientWidth / 2 - ox) / sOld;
    const py = (area.scrollTop + area.clientHeight / 2 - oy) / sOld;
    this.canvasScale = sNew;
    // После применения масштаба и пересчёта размеров спейсера — компенсируем скролл
    requestAnimationFrame(() => {
      const a = this.canvasAreaRef?.nativeElement;
      const s = this.canvasSizerRef?.nativeElement;
      if (!a || !s) return;
      const aRect = a.getBoundingClientRect();
      const sRect = s.getBoundingClientRect();
      const ox2 = sRect.left - aRect.left + a.scrollLeft;
      const oy2 = sRect.top - aRect.top + a.scrollTop;
      a.scrollLeft = px * sNew + ox2 - a.clientWidth / 2;
      a.scrollTop = py * sNew + oy2 - a.clientHeight / 2;
    });
  }

  private onCanvasWheel(event: WheelEvent): void {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) return;
    event.preventDefault();
    this.zoomStep(event.deltaY < 0 ? 1 : -1);
  }

  onCanvasClick(): void { if (!this.dragState && !this.resizeState) this.deselectElement(); }

  getFilterSource(): ArrivalsOrderMock[] {
    return this.sim.active ? this.sim.orders : this.mockOrders;
  }

  /* ── Drag & Resize ── */
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
      const el = this.activeElements.find(e => e.id === this.dragState!.elementId);
      if (el) {
        el.x = Math.max(0, Math.round(this.snapVal(this.dragState.startElX + (event.clientX - this.dragState.startMouseX) / s)));
        el.y = Math.max(0, Math.round(this.snapVal(this.dragState.startElY + (event.clientY - this.dragState.startMouseY) / s)));
      }
    }
    if (this.resizeState) {
      const el = this.activeElements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const dx = (event.clientX - this.resizeState.startMouseX) / s, dy = (event.clientY - this.resizeState.startMouseY) / s, h = this.resizeState.handle;
        if (h.includes('r')) el.width = this.snapVal(this.resizeState.startElW + dx);
        if (h.includes('l')) { const nw = this.snapVal(this.resizeState.startElW - dx); el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - nw)); el.width = nw; }
        if (h.includes('b')) el.height = this.snapVal(this.resizeState.startElH + dy);
        if (h.includes('t')) { const nh = this.snapVal(this.resizeState.startElH - dy); el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - nh)); el.height = nh; }
      }
    }
  }

  /** Значение с прилипанием к сетке 20px (если включено) */
  private snapVal(v: number): number {
    const val = Math.max(20, Math.round(v));
    return this.snapEnabled ? Math.round(val / 20) * 20 : val;
  }

  private onDocMouseUp(): void {
    this.dragState = null; this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Selection ── */
  selectElement(id: string, event: Event): void { event.stopPropagation(); this.selectedElementId = id; this.panelView = 'element'; }
  selectElementFromList(id: string): void { this.selectedElementId = id; this.panelView = 'element'; }
  deselectElement(): void { this.selectedElementId = null; this.panelView = 'theme'; }

  /* ── Режимы (левая панель) ── */
  selectMode(id: string): void {
    if (!this.theme.modes?.some(m => m.id === id)) return;
    this.theme.activeModeId = id;
    this.selectedElementId = null;
    this.panelView = 'theme';
    this.areaHelper.clearAll();
  }

  openNewModeModal(): void { this.newModeName = ''; this.newModeModalOpen = true; }
  closeNewModeModal(): void { this.newModeModalOpen = false; }

  confirmNewMode(): void {
    const name = (this.newModeName || '').trim();
    if (!name || !this.theme.modes) return;
    const customCount = this.theme.modes.filter(m => m.isCustom).length;
    const id = 'A' + (customCount + 1);
    this.theme.modes.push({ id, name, isCustom: true, elements: [] });
    this.theme.activeModeId = id;
    this.newModeModalOpen = false;
    this.selectedElementId = null;
    this.panelView = 'theme';
    this.showToast('Режим «' + name + '» создан');
  }

  requestDeleteMode(modeId: string): void {
    const mode = this.theme.modes?.find(m => m.id === modeId);
    if (mode?.isCustom) this.deleteModeTarget = mode;
  }

  /** Добавить строку условия показа (как на стенде: «Операция» AND/OR) */
  addCondition(mode: ArrivalsThemeMode): void {
    if (!mode.conditions) mode.conditions = [];
    mode.conditions.push({ operation: 'OR' });
  }

  /** Убрать строку условия */
  removeCondition(mode: ArrivalsThemeMode, index: number): void {
    if (mode.conditions) mode.conditions.splice(index, 1);
  }

  confirmDeleteMode(): void {
    if (!this.deleteModeTarget || !this.theme.modes) return;
    const deletedId = this.deleteModeTarget.id;
    this.theme.modes = this.theme.modes.filter(m => m.id !== deletedId);
    if (this.theme.activeModeId === deletedId) this.theme.activeModeId = this.theme.modes[0]?.id ?? '';
    this.selectedElementId = null;
    this.panelView = 'theme';
    this.deleteModeTarget = null;
    this.showToast('Режим удалён');
  }

  /* ── Add / Delete ── */
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

  addElement(type: ArrivalsElementType): void {
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    // Сообщение при добавлении платного элемента без лицензии (вариант E)
    if (type === 'area' && !this.dataService.hasPremiumLicense) {
      this.showToast('Вы добавляете платный элемент. Он будет недоступен на экране без платной лицензии.');
    }
    const el: ArrivalsThemeElement = { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), type, name: label, x: 20 + this.activeElements.length * 20, y: 20 + this.activeElements.length * 20, width: 120, height: 60, borderWidth: 1, borderColor: '#000000', borderRadius: 0 };
    if (type === 'text') { el.text = 'Type something'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; }
    if (type === 'price') { el.name = 'Цена блюда'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; el.productId = undefined; el.productName = undefined; el.sizeId = null; el.sizeName = undefined; el.showCurrency = true; el.currencySymbol = '₽'; el.currencyPosition = 'after'; }
    if (type === 'area') { el.name = 'Область контрола'; el.width = 300; el.height = 500; el.borderWidth = 2; el.borderColor = '#90CAF9'; el.borderRadius = 4; el.areaBgColor = '#ffffff'; el.areaControlId = this.availableControls.length > 0 ? this.availableControls[0].id : undefined; el.areaMode = 'list'; el.areaListDirection = 'top'; el.areaMaxColumns = 1; el.areaStatusType = 'kitchen'; el.areaStatuses = []; el.areaOrderTypes = ['ordinary', 'courier', 'pickup']; el.areaOrderSources = []; el.areaSortOrder = 'oldest-first'; el.areaInterlineSpacing = 0; }
    this.activeElements.push(el);
    this.selectedElementId = el.id; this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void { event.stopPropagation(); this.deleteElementTarget = el; }
  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      const mode = this.activeMode;
      if (mode) mode.elements = mode.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) this.deselectElement();
      this.deleteElementTarget = null;
    }
  }

  onAreaControlChange(): void { if (this.selectedElement) { this.areaHelper.reset(this.selectedElement.id); this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]); } }

  /* ── Save ── */
  save(): void {
    const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
    const idx = allThemes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) allThemes[idx] = JSON.parse(JSON.stringify(this.theme)); else allThemes.push(JSON.parse(JSON.stringify(this.theme)));
    this.storage.save('web-screens', 'arrivals-themes', allThemes);
    const list: any[] = this.storage.load('web-screens', 'arrivals-list', []);
    if (!list.find((i: any) => i.id === this.theme.id)) { list.push({ id: this.theme.id, name: this.theme.name, itemType: 'theme', resolution: this.theme.resolution, createdBy: 'Моя' }); this.storage.save('web-screens', 'arrivals-list', list); }
    this.showToast('Тема сохранена');
  }

  goBack(): void { this.router.navigate(['/prototype/web-screens/themes-arrivals']); }

  onEditControl(controlId: number): void {
    // Автосохранение темы перед уходом в редактор контрола
    this.save();
    this.router.navigate(['/prototype/web-screens/arrivals-control-editor', controlId], {
      queryParams: { return: 'theme-editor', themeId: this.theme.id, elementId: this.selectedElementId }
    });
  }
  private showToast(msg: string): void { this.toastMessage = msg; setTimeout(() => (this.toastMessage = ''), 3000); }
}
