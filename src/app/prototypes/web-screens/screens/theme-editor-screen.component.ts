import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UiInputComponent,
  UiSelectComponent,
  UiCheckboxComponent,
  UiToggleComponent,
  UiConfirmDialogComponent,
  UiBadgeComponent,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import {
  CSTheme,
  ThemeElement,
  HintAreaSettings,
  DEFAULT_HINT_AREA,
  THEME_ELEMENT_TYPES,
  ThemeElementTypeOption,
  getHintElements,
  ElementTypeOption,
} from '../cs-types';

// ─── Helper: deep clone ──────────────────────
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Component({
  selector: 'app-theme-editor-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    UiSelectComponent,
    UiCheckboxComponent,
    UiToggleComponent,
    UiConfirmDialogComponent,
    UiBadgeComponent,
    IconsModule,
  ],
  template: `
    <div class="editor-root" *ngIf="theme">
      <!-- ─── Toast ─── -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- ─── Breadcrumbs ─── -->
      <div class="breadcrumbs">
        <span class="crumb" (click)="navigateBack()">Настройки</span>
        <span class="crumb-sep">/</span>
        <span class="crumb" (click)="navigateBack()">Дисплей покупателя</span>
        <span class="crumb-sep">/</span>
        <span class="crumb" (click)="navigateBack()">Темы</span>
        <span class="crumb-sep">/</span>
        <span class="crumb-active">{{ theme.name }}</span>
      </div>

      <!-- ─── Toolbar ─── -->
      <div class="toolbar">
        <div class="toolbar-fields">
          <ui-input
            label="Название"
            placeholder="Название темы"
            [(value)]="theme.name"
            [fullWidth]="false"
          ></ui-input>
          <ui-input
            label="Описание"
            placeholder="Описание темы"
            [(value)]="theme.description"
            [fullWidth]="false"
          ></ui-input>
        </div>
        <button class="app-btn app-btn-primary" (click)="saveAndClose()">
          <lucide-icon name="save" [size]="16"></lucide-icon>
          <span>Сохранить</span>
        </button>
      </div>

      <!-- ─── Main 3-column layout ─── -->
      <div class="editor-body">

        <!-- ═══ LEFT PANEL: Element tree ═══ -->
        <div class="panel-left">
          <div class="panel-header">
            <span class="panel-title">Элементы</span>
          </div>

          <!-- Add element button + dropdown -->
          <div class="add-element-wrap">
            <button class="app-btn app-btn-primary app-btn-sm app-btn-full" (click)="toggleAddMenu()">
              <lucide-icon name="plus" [size]="14"></lucide-icon>
              Добавить элемент
            </button>
            <div class="add-dropdown" *ngIf="addMenuOpen">
              <div
                *ngFor="let opt of elementTypeOptions"
                class="add-dropdown-item"
                [class.disabled]="opt.disabled"
                (click)="addElement(opt)"
              >
                <lucide-icon [name]="opt.icon" [size]="16"></lucide-icon>
                <div class="add-dropdown-label">
                  <span class="add-dropdown-name">{{ opt.label }}</span>
                  <span class="add-dropdown-desc" *ngIf="opt.disabled">(уже добавлен)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Element list -->
          <div class="tree-list">
            <div
              *ngFor="let el of theme.elements; let i = index"
              class="tree-item"
              [class.selected]="selectedElementId === el.id"
              (click)="selectElement(el.id)"
            >
              <span class="tree-icon">{{ getElementEmoji(el.type) }}</span>
              <span class="tree-name">{{ el.name }}</span>
              <button class="tree-delete" (click)="confirmDeleteElement(el, $event)" title="Удалить">
                <lucide-icon name="x" [size]="14"></lucide-icon>
              </button>
            </div>
            <div *ngIf="theme.elements.length === 0" class="tree-empty">
              Нет элементов
            </div>
          </div>
        </div>

        <!-- ═══ CENTER: Canvas ═══ -->
        <div class="panel-center">
          <div class="canvas-container">
            <div class="canvas" [style.transform]="'scale(' + canvasScale + ')'" [style.transform-origin]="'top left'">
              <!-- Canvas background -->
              <div class="canvas-bg"></div>
              <!-- Render elements -->
              <div
                *ngFor="let el of theme.elements"
                class="canvas-element"
                [class.canvas-element-selected]="selectedElementId === el.id"
                [class.canvas-element-hints]="el.type === 'hints'"
                [style.left.px]="getElementLayout(el).x * canvasScale"
                [style.top.px]="getElementLayout(el).y * canvasScale"
                [style.width.px]="getElementLayout(el).width * canvasScale"
                [style.height.px]="getElementLayout(el).height * canvasScale"
                [style.background]="getElementColor(el.type)"
                [style.border-radius.px]="getElementBorderRadius(el) * canvasScale"
                [style.box-shadow]="getElementShadow(el)"
                (click)="selectElement(el.id)"
              >
                <span class="canvas-element-label" [style.font-size.px]="Math.max(9, 11 * canvasScale)">
                  {{ getElementEmoji(el.type) }} {{ el.name }}
                </span>
                <!-- Hints area: show inner grid preview -->
                <div *ngIf="el.type === 'hints'" class="canvas-hints-grid">
                  <div *ngFor="let slot of getHintSlots(el)" class="canvas-hint-slot"
                    [style.width.px]="slot.w * canvasScale"
                    [style.height.px]="slot.h * canvasScale"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ RIGHT PANEL: Settings ═══ -->
        <div class="panel-right">
          <div class="panel-header">
            <span class="panel-title">Свойства</span>
          </div>

          <!-- No selection -->
          <div *ngIf="!selectedElement" class="settings-empty">
            <lucide-icon name="mouse-pointer-click" [size]="32" class="text-gray-300"></lucide-icon>
            <p>Выберите элемент на canvas или в дереве</p>
          </div>

          <!-- Element settings -->
          <div *ngIf="selectedElement" class="settings-scroll">
            <!-- Element name -->
            <div class="settings-section">
              <ui-input label="Название элемента" [(value)]="selectedElement.name"></ui-input>
              <div class="element-type-badge">
                <ui-badge variant="default">{{ getTypeName(selectedElement.type) }}</ui-badge>
              </div>
            </div>

            <!-- ── IMAGE settings ── -->
            <ng-container *ngIf="selectedElement.type === 'image'">
              <div class="settings-section" *ngIf="isCollapsibleOpen('layout')">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('layout')">
                  <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asImage(selectedElement).layout }"></ng-container>
                </div>
              </div>
            </ng-container>

            <!-- ── TEXT settings ── -->
            <ng-container *ngIf="selectedElement.type === 'text'">
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('content')">
                  <span>Содержимое</span>
                  <lucide-icon [name]="isSectionOpen('content') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('content')">
                  <ui-input label="Текст" [(value)]="asText(selectedElement).content"></ui-input>
                </div>
              </div>
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('layout')">
                  <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asText(selectedElement).layout }"></ng-container>
                </div>
              </div>
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('font')">
                  <ng-container *ngTemplateOutlet="fontFields; context: { $implicit: ensureTextFont(selectedElement) }"></ng-container>
                </div>
              </div>
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('align')">
                  <span>Выравнивание</span>
                  <lucide-icon [name]="isSectionOpen('align') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('align')">
                  <ng-container *ngTemplateOutlet="alignFields; context: { $implicit: selectedElement }"></ng-container>
                </div>
              </div>
            </ng-container>

            <!-- ── ADVERTISE settings ── -->
            <ng-container *ngIf="selectedElement.type === 'advertise'">
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('layout')">
                  <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asAdvertise(selectedElement).layout }"></ng-container>
                </div>
              </div>
            </ng-container>

            <!-- ── ANIMATION settings ── -->
            <ng-container *ngIf="selectedElement.type === 'animation'">
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('anim-display')">
                  <span>Параметры отображения</span>
                  <lucide-icon [name]="isSectionOpen('anim-display') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('anim-display')">
                  <ui-toggle
                    label="Скрывать по таймеру"
                    [checked]="asAnimation(selectedElement).hideByTimer"
                    (checkedChange)="asAnimation(selectedElement).hideByTimer = $event"
                  ></ui-toggle>
                  <div class="field-row">
                    <ui-input label="Время показа (сек)" type="number" [value]="'' + asAnimation(selectedElement).displayTime" (valueChange)="asAnimation(selectedElement).displayTime = +$event"></ui-input>
                    <ui-input label="Длительность анимации (сек)" type="number" [value]="'' + asAnimation(selectedElement).animationDuration" (valueChange)="asAnimation(selectedElement).animationDuration = +$event"></ui-input>
                  </div>
                  <ui-select label="Тип анимации" [options]="animationTypeOptions" [value]="asAnimation(selectedElement).animationType" (valueChange)="asAnimation(selectedElement).animationType = $event"></ui-select>
                </div>
              </div>
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('anim-control')">
                  <span>Контрол</span>
                  <lucide-icon [name]="isSectionOpen('anim-control') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('anim-control')">
                  <ui-select
                    label="Контрол анимации"
                    [options]="animationControlOptions"
                    [value]="'' + asAnimation(selectedElement).controlId"
                    (valueChange)="onAnimationControlChange($event)"
                    placeholder="Выберите контрол..."
                  ></ui-select>
                </div>
              </div>
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('layout')">
                  <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asAnimation(selectedElement).layout }"></ng-container>
                </div>
              </div>
            </ng-container>

            <!-- ── HINTS settings ── -->
            <ng-container *ngIf="selectedElement.type === 'hints'">
              <!-- Display params -->
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('hints-display')">
                  <span>Параметры отображения</span>
                  <lucide-icon [name]="isSectionOpen('hints-display') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('hints-display')">
                  <ui-toggle
                    label="Скрывать по таймеру"
                    [checked]="asHints(selectedElement).settings.hideByTimer"
                    (checkedChange)="asHints(selectedElement).settings.hideByTimer = $event"
                  ></ui-toggle>
                  <div class="field-row">
                    <ui-input label="Время показа (сек)" type="number" [value]="'' + asHints(selectedElement).settings.displayTime" (valueChange)="asHints(selectedElement).settings.displayTime = +$event"></ui-input>
                    <ui-input label="Длительность анимации (сек)" type="number" [value]="'' + asHints(selectedElement).settings.animationDuration" (valueChange)="asHints(selectedElement).settings.animationDuration = +$event"></ui-input>
                  </div>
                  <ui-select label="Тип анимации" [options]="animationTypeOptions" [value]="asHints(selectedElement).settings.animationType" (valueChange)="setHintsAnimationType($event)"></ui-select>
                </div>
              </div>

              <!-- Hint area settings -->
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('hints-area')">
                  <span>Область подсказок</span>
                  <lucide-icon [name]="isSectionOpen('hints-area') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('hints-area')">
                  <ui-select label="Режим отображения" [options]="[{value:'list',label:'Лист'}]" value="list" [disabled]="true"></ui-select>
                  <ui-select label="Направление заполнения" [options]="fillDirectionOptions" [value]="asHints(selectedElement).settings.fillDirection" (valueChange)="setHintsFillDirection($event)"></ui-select>
                  <div class="field-row">
                    <ui-input label="Макс. столбцов" type="number" [value]="'' + asHints(selectedElement).settings.maxColumns" (valueChange)="asHints(selectedElement).settings.maxColumns = +$event"></ui-input>
                    <ui-input label="Макс. подсказок" type="number" [value]="'' + asHints(selectedElement).settings.maxHintsVisible" (valueChange)="asHints(selectedElement).settings.maxHintsVisible = +$event"></ui-input>
                  </div>
                  <div class="field-row">
                    <ui-input label="Отступ строк (px)" type="number" [value]="'' + asHints(selectedElement).settings.rowGap" (valueChange)="asHints(selectedElement).settings.rowGap = +$event"></ui-input>
                    <ui-input label="Отступ столбцов (px)" type="number" [value]="'' + asHints(selectedElement).settings.columnGap" (valueChange)="asHints(selectedElement).settings.columnGap = +$event"></ui-input>
                  </div>
                  <ui-input label="Время жизни подсказки (сек)" type="number" [value]="'' + asHints(selectedElement).settings.hintLifetime" (valueChange)="asHints(selectedElement).settings.hintLifetime = +$event"></ui-input>
                  <ui-select label="При удалении триггера" [options]="triggerRemovalOptions" [value]="asHints(selectedElement).settings.triggerRemovalBehavior" (valueChange)="setHintsTriggerRemoval($event)"></ui-select>
                </div>
              </div>

              <!-- Hint inner elements -->
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('hints-elements')">
                  <span>Элементы ({{ asHints(selectedElement).elements.length }})</span>
                  <lucide-icon [name]="isSectionOpen('hints-elements') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('hints-elements')">
                  <!-- Add hint element -->
                  <div class="hint-add-row">
                    <ui-select
                      placeholder="Добавить элемент..."
                      [options]="hintElementOptions"
                      [value]="hintElementToAdd"
                      (valueChange)="hintElementToAdd = $event"
                    ></ui-select>
                    <button class="app-btn app-btn-primary app-btn-sm" [disabled]="!hintElementToAdd" (click)="addHintElement()">
                      <lucide-icon name="plus" [size]="14"></lucide-icon>
                    </button>
                  </div>
                  <!-- Hint element list (accordion) -->
                  <div *ngFor="let hel of asHints(selectedElement).elements; let hi = index" class="hint-el-item">
                    <div class="hint-el-header" (click)="toggleHintElement(hi)">
                      <span class="hint-el-name">{{ hel.name }}</span>
                      <div class="hint-el-actions">
                        <button class="tree-delete" (click)="removeHintElement(hi, $event)">
                          <lucide-icon name="x" [size]="12"></lucide-icon>
                        </button>
                        <lucide-icon [name]="expandedHintElements[hi] ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-icon>
                      </div>
                    </div>
                    <div class="hint-el-body" *ngIf="expandedHintElements[hi]">
                      <p class="hint-el-type-label">Тип: {{ hel.type }}</p>
                      <!-- Hint child element has no individual settings in theme (simplified) -->
                      <p class="hint-el-type-label text-xs text-gray-400">Настройки наследуются из контрола</p>
                    </div>
                  </div>
                  <div *ngIf="asHints(selectedElement).elements.length === 0" class="tree-empty">
                    Нет дочерних элементов
                  </div>
                </div>
              </div>

              <!-- Hint layout -->
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('hints-layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('hints-layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('hints-layout')">
                  <div class="field-row">
                    <ui-input label="X" type="number" [value]="'' + asHints(selectedElement).settings.layout.x" (valueChange)="asHints(selectedElement).settings.layout.x = +$event"></ui-input>
                    <ui-input label="Y" type="number" [value]="'' + asHints(selectedElement).settings.layout.y" (valueChange)="asHints(selectedElement).settings.layout.y = +$event"></ui-input>
                  </div>
                  <div class="field-row">
                    <ui-input label="Ширина" type="number" [value]="'' + asHints(selectedElement).settings.layout.width" (valueChange)="asHints(selectedElement).settings.layout.width = +$event"></ui-input>
                    <ui-input label="Высота" type="number" [value]="'' + asHints(selectedElement).settings.layout.height" (valueChange)="asHints(selectedElement).settings.layout.height = +$event"></ui-input>
                  </div>
                  <div class="field-row-4">
                    <ui-input label="Сверху" type="number" [value]="'' + asHints(selectedElement).settings.layout.padding[0]" (valueChange)="asHints(selectedElement).settings.layout.padding[0] = +$event"></ui-input>
                    <ui-input label="Справа" type="number" [value]="'' + asHints(selectedElement).settings.layout.padding[1]" (valueChange)="asHints(selectedElement).settings.layout.padding[1] = +$event"></ui-input>
                    <ui-input label="Снизу" type="number" [value]="'' + asHints(selectedElement).settings.layout.padding[2]" (valueChange)="asHints(selectedElement).settings.layout.padding[2] = +$event"></ui-input>
                    <ui-input label="Слева" type="number" [value]="'' + asHints(selectedElement).settings.layout.padding[3]" (valueChange)="asHints(selectedElement).settings.layout.padding[3] = +$event"></ui-input>
                  </div>
                </div>
              </div>

              <!-- Hint control select -->
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('hints-control')">
                  <span>Контрол подсказки</span>
                  <lucide-icon [name]="isSectionOpen('hints-control') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('hints-control')">
                  <ui-select
                    label="Контрол подсказки"
                    [options]="hintControlOptions"
                    [value]="'' + (asHints(selectedElement).controlId || '')"
                    (valueChange)="onHintControlChange($event)"
                    placeholder="Выберите контрол..."
                  ></ui-select>
                  <p class="hint-note">Контрол определяет внешний вид каждой подсказки внутри области</p>
                </div>
              </div>

              <!-- Hint border -->
              <div class="settings-section">
                <div class="section-header" (click)="toggleSection('hints-border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('hints-border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div class="section-body" *ngIf="isSectionOpen('hints-border')">
                  <div class="field-row">
                    <ui-input label="Толщина" type="number" [value]="'' + asHints(selectedElement).settings.border.width" (valueChange)="asHints(selectedElement).settings.border.width = +$event"></ui-input>
                    <ui-input label="Радиус" type="number" [value]="'' + asHints(selectedElement).settings.border.radius" (valueChange)="asHints(selectedElement).settings.border.radius = +$event"></ui-input>
                  </div>
                  <ui-input label="Цвет рамки" type="color" [value]="asHints(selectedElement).settings.border.color" (valueChange)="asHints(selectedElement).settings.border.color = $event"></ui-input>

                  <!-- Shadow -->
                  <div class="settings-subsection">
                    <div class="subsection-title">
                      <span>Тень</span>
                      <ui-toggle
                        [checked]="asHints(selectedElement).settings.border.shadow.enabled"
                        (checkedChange)="asHints(selectedElement).settings.border.shadow.enabled = $event"
                      ></ui-toggle>
                    </div>
                    <div *ngIf="asHints(selectedElement).settings.border.shadow.enabled" class="shadow-params">
                      <div class="field-row">
                        <ui-input label="X смещение" type="number" [value]="'' + asHints(selectedElement).settings.border.shadow.x" (valueChange)="asHints(selectedElement).settings.border.shadow.x = +$event"></ui-input>
                        <ui-input label="Y смещение" type="number" [value]="'' + asHints(selectedElement).settings.border.shadow.y" (valueChange)="asHints(selectedElement).settings.border.shadow.y = +$event"></ui-input>
                      </div>
                      <div class="field-row">
                        <ui-input label="Размытие" type="number" [value]="'' + asHints(selectedElement).settings.border.shadow.blur" (valueChange)="asHints(selectedElement).settings.border.shadow.blur = +$event"></ui-input>
                        <div class="field-color">
                          <label class="field-color-label">Цвет тени</label>
                          <ui-input type="color" [value]="asHints(selectedElement).settings.border.shadow.color" (valueChange)="asHints(selectedElement).settings.border.shadow.color = $event"></ui-input>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>

          </div>
        </div>
      </div>

      <!-- ─── Footer ─── -->
      <div class="editor-footer">
        <button class="app-btn app-btn-ghost" (click)="navigateBack()">Отмена</button>
        <button class="app-btn app-btn-primary" (click)="saveAndClose()">
          <lucide-icon name="save" [size]="16"></lucide-icon>
          <span>Сохранить</span>
        </button>
      </div>

      <!-- ─── Delete element confirm ─── -->
      <ui-confirm-dialog
        [open]="deleteElementDialogOpen"
        title="Удаление элемента"
        [message]="'Удалить элемент «' + (elementToDelete?.name || '') + '»?'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteElement()"
        (cancelled)="deleteElementDialogOpen = false"
      ></ui-confirm-dialog>

      <!-- ─── Reusable Templates ─── -->
      <!-- Layout fields template -->
      <ng-template #layoutFields let-layout>
        <div class="field-row">
          <ui-input label="X" type="number" [value]="'' + layout.x" (valueChange)="layout.x = +$event"></ui-input>
          <ui-input label="Y" type="number" [value]="'' + layout.y" (valueChange)="layout.y = +$event"></ui-input>
        </div>
        <div class="field-row">
          <ui-input label="Ширина" type="number" [value]="'' + layout.width" (valueChange)="layout.width = +$event"></ui-input>
          <ui-input label="Высота" type="number" [value]="'' + layout.height" (valueChange)="layout.height = +$event"></ui-input>
        </div>
      </ng-template>

      <!-- Font fields template -->
      <ng-template #fontFields let-font>
        <ui-input label="Семейство шрифта" [value]="font.family" (valueChange)="font.family = $event"></ui-input>
        <ui-input label="Размер" type="number" [value]="'' + font.size" (valueChange)="font.size = +$event"></ui-input>
        <div class="field-row">
          <ui-checkbox label="Жирный" [checked]="font.bold" (checkedChange)="font.bold = $event"></ui-checkbox>
          <ui-checkbox label="Курсив" [checked]="font.italic" (checkedChange)="font.italic = $event"></ui-checkbox>
        </div>
      </ng-template>

      <!-- Align fields template -->
      <ng-template #alignFields let-el>
        <div class="align-group">
          <button class="align-btn" [class.active]="getTextAlign(el) === 'left'" (click)="setTextAlign(el, 'left')">
            <lucide-icon name="align-left" [size]="16"></lucide-icon>
          </button>
          <button class="align-btn" [class.active]="getTextAlign(el) === 'center'" (click)="setTextAlign(el, 'center')">
            <lucide-icon name="align-center" [size]="16"></lucide-icon>
          </button>
          <button class="align-btn" [class.active]="getTextAlign(el) === 'right'" (click)="setTextAlign(el, 'right')">
            <lucide-icon name="align-right" [size]="16"></lucide-icon>
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    /* ─── Root ─── */
    :host { display: block; font-family: Roboto, sans-serif; height: 100%; }
    .editor-root {
      display: flex; flex-direction: column; height: calc(100vh - 48px);
      animation: fadeIn 0.2s ease-out; position: relative;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ─── Toast ─── */
    .toast {
      position: fixed; top: 20px; right: 20px; z-index: 200;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 6px;
      background: #323232; color: #fff; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

    /* ─── Breadcrumbs ─── */
    .breadcrumbs {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 16px; font-size: 13px; color: #757575;
      border-bottom: 1px solid #e0e0e0; background: #fafafa;
      flex-shrink: 0;
    }
    .crumb { cursor: pointer; color: #1976D2; }
    .crumb:hover { text-decoration: underline; }
    .crumb-sep { color: #bdbdbd; }
    .crumb-active { color: #212121; font-weight: 500; }

    /* ─── Toolbar ─── */
    .toolbar {
      display: flex; align-items: flex-end; gap: 16px;
      padding: 12px 16px; border-bottom: 1px solid #e0e0e0;
      background: #fff; flex-shrink: 0;
    }
    .toolbar-fields { display: flex; gap: 12px; flex: 1; }
    .toolbar-fields ui-input { min-width: 200px; flex: 0 1 280px; }

    /* ─── Buttons ─── */
    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 14px; height: 34px; border: none; border-radius: 4px;
      font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-ghost { background: transparent; color: #616161; border: 1px solid #e0e0e0; }
    .app-btn-ghost:hover { background: #f5f5f5; }
    .app-btn-sm { height: 30px; padding: 0 10px; font-size: 12px; }
    .app-btn-full { width: 100%; justify-content: center; }

    /* ─── Main layout ─── */
    .editor-body {
      display: flex; flex: 1; overflow: hidden;
    }

    /* ─── Left panel ─── */
    .panel-left {
      width: 240px; min-width: 240px; border-right: 1px solid #e0e0e0;
      background: #fafafa; display: flex; flex-direction: column; overflow: hidden;
    }
    .panel-header {
      padding: 10px 12px; border-bottom: 1px solid #e0e0e0;
      background: #fff;
    }
    .panel-title { font-size: 13px; font-weight: 600; color: #424242; text-transform: uppercase; letter-spacing: 0.5px; }

    .add-element-wrap { position: relative; padding: 8px; }
    .add-dropdown {
      position: absolute; top: 100%; left: 8px; right: 8px;
      background: #fff; border: 1px solid #e0e0e0; border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 50;
      max-height: 300px; overflow-y: auto;
    }
    .add-dropdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; cursor: pointer; font-size: 13px;
      transition: background 0.1s;
    }
    .add-dropdown-item:hover { background: #f0f6ff; }
    .add-dropdown-item.disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .add-dropdown-label { display: flex; flex-direction: column; }
    .add-dropdown-name { font-weight: 500; color: #212121; }
    .add-dropdown-desc { font-size: 11px; color: #9e9e9e; }

    .tree-list { flex: 1; overflow-y: auto; padding: 4px 0; }
    .tree-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; cursor: pointer; font-size: 13px;
      transition: background 0.1s; border-left: 3px solid transparent;
    }
    .tree-item:hover { background: #e8eaf6; }
    .tree-item.selected { background: #e3f2fd; border-left-color: #1976D2; }
    .tree-icon { font-size: 14px; flex-shrink: 0; }
    .tree-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #424242; }
    .tree-delete {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border: none; background: transparent;
      color: #bdbdbd; cursor: pointer; border-radius: 3px;
      opacity: 0; transition: all 0.15s;
    }
    .tree-item:hover .tree-delete { opacity: 1; }
    .tree-delete:hover { background: #ffebee; color: #e53935; }
    .tree-empty { padding: 16px 12px; text-align: center; font-size: 12px; color: #9e9e9e; }

    /* ─── Center (Canvas) ─── */
    .panel-center {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: #eeeeee; overflow: hidden; position: relative;
    }
    .canvas-container {
      position: relative; width: 90%; max-width: 800px;
      aspect-ratio: 16 / 9; background: #1a1a2e;
      border-radius: 4px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .canvas {
      position: absolute; inset: 0;
      width: 1920px; height: 1080px;
    }
    .canvas-bg { position: absolute; inset: 0; background: #1a1a2e; }
    .canvas-element {
      position: absolute; border: 1px dashed rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
      overflow: hidden; border-radius: 3px;
    }
    .canvas-element:hover { border-color: rgba(255,255,255,0.6); }
    .canvas-element-hints {
      border: 2px dashed rgba(255,152,0,0.7) !important;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,152,0,0.05) 10px,
        rgba(255,152,0,0.05) 20px
      ) !important;
    }
    .canvas-element-selected {
      border: 2px solid #448aff !important;
      box-shadow: 0 0 0 2px rgba(68,138,255,0.3);
    }
    .canvas-element-selected.canvas-element-hints {
      border: 2px solid #448aff !important;
    }
    .canvas-hints-grid {
      position: absolute; inset: 4px; display: flex; flex-wrap: wrap;
      gap: 3px; align-content: flex-start; pointer-events: none;
    }
    .canvas-hint-slot {
      border: 1px dashed rgba(255,255,255,0.25);
      border-radius: 2px; background: rgba(255,152,0,0.1);
    }
    .canvas-element-label {
      color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 500;
      text-align: center; pointer-events: none; padding: 2px 4px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }

    /* ─── Right panel ─── */
    .panel-right {
      width: 320px; min-width: 320px; border-left: 1px solid #e0e0e0;
      background: #fff; display: flex; flex-direction: column; overflow: hidden;
    }
    .settings-empty {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; color: #9e9e9e; font-size: 13px;
      padding: 24px;
    }
    .settings-scroll { flex: 1; overflow-y: auto; padding: 0; }

    .settings-section {
      border-bottom: 1px solid #f0f0f0; padding: 10px 12px;
    }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer; font-size: 12px; font-weight: 600; color: #616161;
      text-transform: uppercase; letter-spacing: 0.4px;
      padding: 4px 0; user-select: none;
    }
    .section-header:hover { color: #1976D2; }
    .section-body {
      display: flex; flex-direction: column; gap: 8px;
      margin-top: 8px;
    }

    .field-row { display: flex; gap: 8px; }
    .field-row > * { flex: 1; }
    .field-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }

    .element-type-badge { margin-top: 6px; }

    /* ─── Align group ─── */
    .align-group { display: flex; gap: 2px; }
    .align-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 30px; border: 1px solid #e0e0e0;
      background: #fff; cursor: pointer; border-radius: 4px;
      color: #757575; transition: all 0.15s;
    }
    .align-btn:hover { background: #f5f5f5; }
    .align-btn.active { background: #e3f2fd; color: #1976D2; border-color: #90caf9; }

    /* ─── Hint elements ─── */
    .hint-add-row { display: flex; gap: 6px; align-items: flex-end; }
    .hint-add-row ui-select { flex: 1; }

    .hint-el-item {
      border: 1px solid #f0f0f0; border-radius: 4px; margin-top: 6px;
      overflow: hidden;
    }
    .hint-el-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; background: #fafafa; cursor: pointer;
      font-size: 12px; font-weight: 500; color: #424242;
    }
    .hint-el-header:hover { background: #f0f0f0; }
    .hint-el-actions { display: flex; align-items: center; gap: 4px; }
    .hint-el-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hint-el-body { padding: 8px; font-size: 12px; }
    .hint-el-type-label { margin: 0 0 4px; color: #757575; font-size: 11px; }

    .hint-note { font-size: 11px; color: #9e9e9e; margin: 4px 0 0; line-height: 1.4; }

    /* ─── Shadow & subsection ─── */
    .settings-subsection { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; }
    .subsection-title {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12px; font-weight: 500; color: #616161; margin-bottom: 8px;
    }
    .shadow-params { display: flex; flex-direction: column; gap: 8px; }
    .field-color { display: flex; flex-direction: column; flex: 1; }
    .field-color-label { font-size: 11px; color: #9e9e9e; margin-bottom: 4px; }

    /* ─── Footer ─── */
    .editor-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; border-top: 1px solid #e0e0e0;
      background: #fff; flex-shrink: 0;
    }

    /* ─── Collapsible default open ─── */
    .settings-section:first-child .section-header { margin-top: 0; }
  `],
})
export class ThemeEditorScreenComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(CsDataService);

  // Expose Math to template
  Math = Math;

  // ─── State ──────────────────────────────────
  theme: CSTheme | null = null;
  selectedElementId: number | null = null;
  addMenuOpen = false;
  deleteElementDialogOpen = false;
  elementToDelete: ThemeElement | null = null;
  canvasScale = 1;

  // Toast
  toastMessage = '';
  private toastTimer: any;

  // Section collapse state
  private openSections: Set<string> = new Set([
    'layout', 'content', 'font', 'align',
    'anim-display', 'anim-control',
    'hints-display', 'hints-area', 'hints-control', 'hints-elements', 'hints-layout', 'hints-border',
  ]);

  // Hint elements accordion
  expandedHintElements: Record<number, boolean> = {};
  hintElementToAdd = '';

  // Element ID counter
  private nextElementId = 100;

  // ─── Dropdown / Select options ──────────────

  elementTypeOptions: { type: string; label: string; icon: string; disabled: boolean }[] = [];

  animationTypeOptions: SelectOption[] = [
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'slideLeft', label: 'Slide Left' },
    { value: 'slideRight', label: 'Slide Right' },
    { value: 'slideUp', label: 'Slide Up' },
    { value: 'slideDown', label: 'Slide Down' },
    { value: 'none', label: 'Без анимации' },
  ];

  fillDirectionOptions: SelectOption[] = [
    { value: 'horizontal', label: 'Горизонтально' },
    { value: 'vertical', label: 'Вертикально' },
  ];

  triggerRemovalOptions: SelectOption[] = [
    { value: 'remove', label: 'Убрать подсказку' },
    { value: 'keepUntilOrderEnd', label: 'Оставить до конца заказа' },
  ];

  animationControlOptions: SelectOption[] = [];

  hintControlOptions: SelectOption[] = [];

  hintElementOptions: SelectOption[] = [];

  // ─── Computed ───────────────────────────────

  get selectedElement(): ThemeElement | null {
    if (!this.theme || this.selectedElementId == null) return null;
    return this.theme.elements.find(e => e.id === this.selectedElementId) ?? null;
  }

  // ─── Lifecycle ──────────────────────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.dataService.themes.find(t => t.id === id);
    if (!found) {
      this.navigateBack();
      return;
    }
    this.theme = deepClone(found);
    this.nextElementId = Math.max(100, ...this.theme.elements.map(e => e.id)) + 1;

    this.buildElementTypeOptions();
    this.buildAnimationControlOptions();
    this.buildHintControlOptions();
    this.buildHintElementOptions();
    this.computeCanvasScale();
  }

  // ─── Navigation ─────────────────────────────

  navigateBack(): void {
    this.router.navigate(['/prototype/web-screens/themes-cs']);
  }

  // ─── Element type options ───────────────────

  private buildElementTypeOptions(): void {
    this.elementTypeOptions = THEME_ELEMENT_TYPES.map(t => {
      const alreadyAdded = t.singular && this.theme!.elements.some(e => e.type === t.type);
      return {
        type: t.type,
        label: t.name,
        icon: t.icon,
        disabled: alreadyAdded,
      };
    });
  }

  private buildAnimationControlOptions(): void {
    this.animationControlOptions = this.dataService.controls
      .filter(c => c.type === 'animation')
      .map(c => ({ value: '' + c.id, label: c.name }));
  }

  private buildHintControlOptions(): void {
    this.hintControlOptions = this.dataService.controls
      .filter(c => c.type === 'hint')
      .map(c => ({ value: '' + c.id, label: c.name }));
  }

  private buildHintElementOptions(): void {
    this.hintElementOptions = getHintElements().map(e => ({
      value: e.type,
      label: e.name,
    }));
  }

  // ─── Canvas ─────────────────────────────────

  private computeCanvasScale(): void {
    // Scale 1920x1080 to fit ~800px container width
    // This is a static approximation; real calc would use ViewChild
    this.canvasScale = 800 / 1920;
  }

  getElementLayout(el: ThemeElement): { x: number; y: number; width: number; height: number } {
    if (el.type === 'hints') {
      return el.settings.layout;
    }
    return (el as any).layout ?? { x: 0, y: 0, width: 200, height: 100 };
  }

  getElementBorderRadius(el: ThemeElement): number {
    if (el.type === 'hints') {
      return el.settings.border.radius;
    }
    return 3;
  }

  getElementShadow(el: ThemeElement): string {
    if (el.type === 'hints' && el.settings.border.shadow.enabled) {
      const s = el.settings.border.shadow;
      return `${s.x}px ${s.y}px ${s.blur}px ${s.color}`;
    }
    return 'none';
  }

  /** Generate hint slot rectangles for canvas preview */
  getHintSlots(el: ThemeElement): { w: number; h: number }[] {
    if (el.type !== 'hints') return [];
    const s = el.settings;
    const maxCols = s.maxColumns || 1;
    const maxHints = s.maxHintsVisible || 3;
    const gap = s.columnGap || 8;
    const rowGap = s.rowGap || 8;
    const pad = s.layout.padding;
    const innerW = s.layout.width - pad[1] - pad[3];
    const innerH = s.layout.height - pad[0] - pad[2];
    const slotW = (innerW - (maxCols - 1) * gap) / maxCols;
    const rows = Math.ceil(maxHints / maxCols);
    const slotH = (innerH - (rows - 1) * rowGap) / rows;
    const slots: { w: number; h: number }[] = [];
    for (let i = 0; i < maxHints; i++) {
      slots.push({ w: Math.max(20, slotW), h: Math.max(20, slotH) });
    }
    return slots;
  }

  getElementColor(type: string): string {
    const colors: Record<string, string> = {
      image: 'rgba(76,175,80,0.35)',
      text: 'rgba(33,150,243,0.35)',
      animation: 'rgba(156,39,176,0.35)',
      hints: 'rgba(255,152,0,0.35)',
      advertise: 'rgba(244,67,54,0.30)',
    };
    return colors[type] ?? 'rgba(158,158,158,0.3)';
  }

  getElementEmoji(type: string): string {
    const map: Record<string, string> = {
      image: '🖼️',
      text: '📝',
      animation: '🎬',
      hints: '💡',
      advertise: '📢',
    };
    return map[type] ?? '📦';
  }

  getTypeName(type: string): string {
    const opt = THEME_ELEMENT_TYPES.find(t => t.type === type);
    return opt?.name ?? type;
  }

  // ─── Selection ──────────────────────────────

  selectElement(id: number): void {
    this.selectedElementId = this.selectedElementId === id ? null : id;
    this.addMenuOpen = false;
  }

  // ─── Add element ────────────────────────────

  toggleAddMenu(): void {
    this.addMenuOpen = !this.addMenuOpen;
    if (this.addMenuOpen) {
      this.buildElementTypeOptions();
    }
  }

  addElement(opt: { type: string; label: string; disabled: boolean }): void {
    if (opt.disabled || !this.theme) return;
    const id = this.nextElementId++;
    let newEl: ThemeElement;

    switch (opt.type) {
      case 'image':
        newEl = { id, type: 'image', name: 'Изображение ' + id, layout: { x: 100, y: 100, width: 400, height: 300 } };
        break;
      case 'text':
        newEl = { id, type: 'text', name: 'Текст ' + id, content: 'Текст', layout: { x: 100, y: 100, width: 300, height: 50 } };
        break;
      case 'animation': {
        const defaultCtrl = this.dataService.controls.find(c => c.type === 'animation');
        newEl = {
          id, type: 'animation', name: 'Анимации',
          controlId: defaultCtrl?.id ?? 0, controlName: defaultCtrl?.name ?? '',
          hideByTimer: true, displayTime: 5, animationDuration: 0.3, animationType: 'fadeIn',
          layout: { x: 600, y: 100, width: 400, height: 300 },
        };
        break;
      }
      case 'hints':
        newEl = {
          id, type: 'hints', name: 'Подсказки',
          settings: deepClone(DEFAULT_HINT_AREA),
          elements: [],
        };
        break;
      case 'advertise':
        newEl = { id, type: 'advertise', name: 'Рекламный блок ' + id, layout: { x: 50, y: 400, width: 600, height: 200 } };
        break;
      default:
        return;
    }

    this.theme.elements.push(newEl);
    this.theme.elementsCount = this.theme.elements.length;
    this.selectedElementId = id;
    this.addMenuOpen = false;
    this.buildElementTypeOptions();
  }

  // ─── Delete element ─────────────────────────

  confirmDeleteElement(el: ThemeElement, event: Event): void {
    event.stopPropagation();
    this.elementToDelete = el;
    this.deleteElementDialogOpen = true;
  }

  deleteElement(): void {
    if (!this.theme || !this.elementToDelete) return;
    this.theme.elements = this.theme.elements.filter(e => e.id !== this.elementToDelete!.id);
    this.theme.elementsCount = this.theme.elements.length;
    if (this.selectedElementId === this.elementToDelete.id) {
      this.selectedElementId = null;
    }
    this.deleteElementDialogOpen = false;
    this.elementToDelete = null;
    this.buildElementTypeOptions();
  }

  // ─── Type casting helpers for template ──────

  asImage(el: ThemeElement): Extract<ThemeElement, { type: 'image' }> {
    return el as any;
  }

  asText(el: ThemeElement): Extract<ThemeElement, { type: 'text' }> {
    return el as any;
  }

  asAnimation(el: ThemeElement): Extract<ThemeElement, { type: 'animation' }> {
    return el as any;
  }

  asHints(el: ThemeElement): Extract<ThemeElement, { type: 'hints' }> {
    return el as any;
  }

  asAdvertise(el: ThemeElement): Extract<ThemeElement, { type: 'advertise' }> {
    return el as any;
  }

  // ─── Text font/align helpers ────────────────

  ensureTextFont(el: ThemeElement): { family: string; size: number; bold: boolean; italic: boolean } {
    const txt = el as any;
    if (!txt._font) {
      txt._font = { family: 'Roboto', size: 16, bold: false, italic: false };
    }
    return txt._font;
  }

  getTextAlign(el: ThemeElement): string {
    return (el as any)._align ?? 'left';
  }

  setTextAlign(el: ThemeElement, align: string): void {
    (el as any)._align = align;
  }

  // ─── Animation control change ───────────────

  onAnimationControlChange(controlIdStr: string): void {
    const anim = this.asAnimation(this.selectedElement!);
    anim.controlId = +controlIdStr;
    const ctrl = this.dataService.controls.find(c => c.id === anim.controlId);
    anim.controlName = ctrl?.name ?? '';
  }

  // ─── Hints setting helpers (avoid 'as any' in template) ──

  setHintsAnimationType(val: string): void {
    if (this.selectedElement?.type === 'hints') {
      (this.selectedElement as any).settings.animationType = val;
    }
  }

  setHintsFillDirection(val: string): void {
    if (this.selectedElement?.type === 'hints') {
      (this.selectedElement as any).settings.fillDirection = val;
    }
  }

  setHintsTriggerRemoval(val: string): void {
    if (this.selectedElement?.type === 'hints') {
      (this.selectedElement as any).settings.triggerRemovalBehavior = val;
    }
  }

  onHintControlChange(val: string): void {
    if (this.selectedElement?.type === 'hints') {
      (this.selectedElement as any).controlId = +val || null;
    }
  }

  // ─── Hint inner elements ────────────────────

  toggleHintElement(index: number): void {
    this.expandedHintElements[index] = !this.expandedHintElements[index];
  }

  addHintElement(): void {
    if (!this.hintElementToAdd || !this.selectedElement || this.selectedElement.type !== 'hints') return;
    const hintEl = this.asHints(this.selectedElement);
    const opt = getHintElements().find(e => e.type === this.hintElementToAdd);
    if (!opt) return;
    const newId = hintEl.elements.length > 0 ? Math.max(...hintEl.elements.map(e => e.id)) + 1 : 1;
    hintEl.elements.push({ id: newId, type: opt.type, name: opt.name });
    this.hintElementToAdd = '';
  }

  removeHintElement(index: number, event: Event): void {
    event.stopPropagation();
    if (!this.selectedElement || this.selectedElement.type !== 'hints') return;
    this.asHints(this.selectedElement).elements.splice(index, 1);
    delete this.expandedHintElements[index];
  }

  // ─── Section collapse ──────────────────────

  isCollapsibleOpen(key: string): boolean {
    return true; // all sections rendered, but body toggled
  }

  isSectionOpen(key: string): boolean {
    return this.openSections.has(key);
  }

  toggleSection(key: string): void {
    if (this.openSections.has(key)) {
      this.openSections.delete(key);
    } else {
      this.openSections.add(key);
    }
  }

  // ─── Save ───────────────────────────────────

  saveAndClose(): void {
    if (!this.theme) return;
    this.theme.updatedAt = new Date().toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    this.theme.elementsCount = this.theme.elements.length;
    this.dataService.updateTheme(this.theme);
    this.showToast(`Тема «${this.theme.name}» сохранена`);
    setTimeout(() => this.navigateBack(), 600);
  }

  // ─── Toast ──────────────────────────────────

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
