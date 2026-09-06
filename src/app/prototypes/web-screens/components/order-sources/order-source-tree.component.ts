import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import {
  SoundTerminalGroupV2,
  DvArrivalsDisplay,
  RestaurantOrderSourceConfig,
} from '../../types';

/** Выбранный узел дерева источников заказов */
export type OrderSourceTreeNode =
  | { kind: 'network' }
  | { kind: 'restaurant'; restaurantId: number }
  | { kind: 'terminal'; restaurantId: number; terminalId: number }
  | { kind: 'display'; restaurantId: number; displayId: string };

/**
 * Дерево «Сеть → рестораны → терминалы → дисплеи» для экрана «Источники заказов».
 * Паттерн — enterprise-tree (звуки): аккордеоны, чекбоксы массового выбора, поиск.
 */
@Component({
  selector: 'app-order-source-tree',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="os-tree">
      <h3 class="os-title">Структура торговых предприятий</h3>

      <!-- Корень: вся сеть -->
      <button
        type="button"
        class="os-network"
        [class.os-network--active]="selected?.kind === 'network'"
        (click)="select.emit({ kind: 'network' })"
        [attr.aria-pressed]="selected?.kind === 'network'"
      >
        <lucide-icon name="building-2" [size]="16"></lucide-icon>
        <span class="os-network-name">Вся сеть</span>
        <span class="os-network-count">{{ groups.length }} рест.</span>
      </button>

      <div class="os-empty" *ngIf="visibleGroups.length === 0">
        <lucide-icon name="search" [size]="18"></lucide-icon>
        <span>Ничего не найдено</span>
      </div>

      <div class="os-org" *ngFor="let group of visibleGroups">
        <div class="os-org-row">
          <button
            type="button"
            class="os-org-chevron"
            (click)="toggleGroup(group.id)"
            [attr.aria-expanded]="isExpanded(group.id)"
            [attr.aria-label]="isExpanded(group.id) ? 'Свернуть ресторан ' + group.name : 'Развернуть ресторан ' + group.name"
          >
            <lucide-icon [name]="isExpanded(group.id) ? 'chevron-down' : 'chevron-right'" [size]="16"></lucide-icon>
          </button>
          <button
            type="button"
            class="os-org-name"
            [class.os-org-name--active]="selected?.kind === 'restaurant' && isSelectedRestaurant(selected, group.id)"
            (click)="select.emit({ kind: 'restaurant', restaurantId: group.id })"
          >
            <lucide-icon name="store" [size]="15"></lucide-icon>
            <span>{{ group.name }}</span>
          </button>
          <span class="os-badge" [class.os-badge--own]="!isNetworkConfig(group.id)">
            {{ isNetworkConfig(group.id) ? 'Сетевая' : 'Своя' }}
          </span>
          <input
            type="checkbox"
            class="os-check"
            [checked]="checkedRestaurantIds.has(group.id)"
            (change)="toggleCheck.emit(group.id)"
            [attr.aria-label]="'Выбрать ресторан: ' + group.name"
          />
          <span class="os-count">{{ group.terminals.length }}</span>
        </div>

        <div class="os-children" *ngIf="isExpanded(group.id)">
          <!-- Терминалы -->
          <div
            class="os-term"
            *ngFor="let t of visibleTerminals(group)"
            [class.os-term--active]="selected?.kind === 'terminal' && isSelectedTerminal(selected, t.id)"
            (click)="select.emit({ kind: 'terminal', restaurantId: group.id, terminalId: t.id })"
            role="button"
            [attr.aria-pressed]="selected?.kind === 'terminal' && isSelectedTerminal(selected, t.id)"
            tabindex="0"
            (keydown.enter)="select.emit({ kind: 'terminal', restaurantId: group.id, terminalId: t.id })"
          >
            <span class="os-node-icon"><lucide-icon name="computer" [size]="15"></lucide-icon></span>
            <span class="os-node-main">
              <span class="os-node-name">{{ t.name }}</span>
              <span class="os-node-meta">Активность: {{ t.lastActivity }}</span>
            </span>
          </div>

          <!-- Дисплеи -->
          <div
            class="os-display"
            *ngFor="let d of visibleDisplays(group.id)"
            [class.os-display--active]="selected?.kind === 'display' && isSelectedDisplay(selected, d.id)"
            (click)="select.emit({ kind: 'display', restaurantId: group.id, displayId: d.id })"
            role="button"
            [attr.aria-pressed]="selected?.kind === 'display' && isSelectedDisplay(selected, d.id)"
            tabindex="0"
            (keydown.enter)="select.emit({ kind: 'display', restaurantId: group.id, displayId: d.id })"
          >
            <span class="os-node-icon"><lucide-icon name="monitor" [size]="15"></lucide-icon></span>
            <span class="os-node-main">
              <span class="os-node-name">{{ d.name }}</span>
              <span class="os-node-meta">{{ d.themeName }}</span>
            </span>
            <span
              class="os-dot"
              [class.os-dot--on]="d.isOnline"
              [class.os-dot--off]="!d.isOnline"
              [title]="d.isOnline ? 'Онлайн' : 'Офлайн'"
            ></span>
          </div>

          <div class="os-node-empty" *ngIf="group.terminals.length === 0">
            Нет терминалов
          </div>
        </div>
      </div>

      <button type="button" class="os-apply" *ngIf="checkedRestaurantIds.size >= 2" (click)="apply.emit()">
        Применить к выбранным ({{ checkedRestaurantIds.size }})
      </button>
    </div>
  `,
  styles: [
    `
      :host { display: block; height: 100%; }
      .os-tree {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 16px 12px;
        overflow-y: auto;
        font-family: Roboto, sans-serif;
      }
      .os-title {
        margin: 0 0 10px 4px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--dt-text-secondary);
      }

      /* Корень сети */
      .os-network {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        margin-bottom: 8px;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        background: var(--dt-surface-primary);
        cursor: pointer;
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 500;
        color: var(--dt-text-primary);
        text-align: left;
        transition: background 0.12s ease;
      }
      .os-network:hover { background: #ebebeb; }
      .os-network--active {
        background: var(--dt-surface-sidebar-selected);
        box-shadow: inset 2px 0 0 var(--dt-brand-accent);
      }
      .os-network-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .os-network-count { font-size: 11.5px; color: var(--dt-text-disable); }

      .os-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 32px 8px;
        color: var(--dt-text-disable);
        font-size: 13px;
      }

      .os-org { margin-bottom: 2px; }
      .os-org-row {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 4px 2px 2px;
        border-radius: 4px;
      }
      .os-org-row:hover { background: #ebebeb; }
      .os-org-chevron {
        display: inline-flex;
        align-items: center;
        padding: 5px 2px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--dt-text-secondary);
      }
      .os-org-name {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        min-width: 0;
        padding: 5px 2px;
        border: none;
        background: none;
        cursor: pointer;
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 500;
        color: var(--dt-text-primary);
        text-align: left;
        border-radius: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .os-org-name:hover { color: var(--dt-brand-accent); }
      .os-org-name--active { color: var(--dt-brand-accent); }

      .os-badge {
        flex-shrink: 0;
        padding: 1px 6px;
        border-radius: 10px;
        font-size: 10.5px;
        font-weight: 500;
        background: var(--dt-brand-accent-lighter);
        color: var(--dt-brand-accent-dark);
      }
      .os-badge--own {
        background: var(--dt-brand-warning-lighter);
        color: var(--dt-brand-warning-darker);
      }

      .os-check {
        width: 15px;
        height: 15px;
        margin: 0 0 0 2px;
        flex-shrink: 0;
        accent-color: var(--dt-brand-accent);
        cursor: pointer;
      }
      .os-count { font-size: 12px; color: var(--dt-text-disable); padding: 0 6px; }

      .os-children { padding-left: 12px; }

      .os-term,
      .os-display {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        margin: 1px 0;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .os-term:hover,
      .os-display:hover { background: #ebebeb; }
      .os-term--active,
      .os-display--active {
        background: var(--dt-surface-sidebar-selected);
        box-shadow: inset 2px 0 0 var(--dt-brand-accent);
      }
      .os-node-icon {
        display: inline-flex;
        color: var(--dt-text-secondary);
        flex-shrink: 0;
      }
      .os-term--active .os-node-icon,
      .os-display--active .os-node-icon { color: var(--dt-brand-accent); }
      .os-node-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .os-node-name {
        font-size: 13px;
        color: var(--dt-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .os-node-meta { font-size: 11px; color: var(--dt-text-disable); }

      .os-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .os-dot--on { background: var(--dt-brand-positive); }
      .os-dot--off { background: var(--dt-text-disable); }

      .os-node-empty {
        padding: 10px 8px;
        font-size: 12.5px;
        color: var(--dt-text-disable);
      }

      .os-apply {
        margin-top: 14px;
        padding: 9px 12px;
        border: 1px solid var(--dt-brand-accent);
        border-radius: 4px;
        background: var(--dt-brand-accent-lighter);
        color: var(--dt-brand-accent);
        font-family: Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .os-apply:hover { background: var(--dt-brand-accent-lightest); }
    `,
  ],
})
export class OrderSourceTreeComponent {
  @Input() groups: SoundTerminalGroupV2[] = [];
  @Input() displaysMap: Record<number, DvArrivalsDisplay[]> = {};
  @Input() configs: RestaurantOrderSourceConfig[] = [];
  @Input() selected: OrderSourceTreeNode | null = null;
  @Input() checkedRestaurantIds: Set<number> = new Set();
  @Input() searchTerm = '';

  @Output() select = new EventEmitter<OrderSourceTreeNode>();
  @Output() toggleCheck = new EventEmitter<number>();
  @Output() apply = new EventEmitter<void>();

  private expandedGroups = new Set<number>();

  ngOnInit(): void {
    if (this.groups.length > 0) {
      this.expandedGroups.add(this.groups[0].id);
    }
  }

  isSelectedRestaurant(sel: OrderSourceTreeNode | null, id: number): boolean {
    return !!sel && sel.kind === 'restaurant' && sel.restaurantId === id;
  }

  isSelectedTerminal(sel: OrderSourceTreeNode | null, id: number): boolean {
    return !!sel && sel.kind === 'terminal' && sel.terminalId === id;
  }

  isSelectedDisplay(sel: OrderSourceTreeNode | null, id: string): boolean {
    return !!sel && sel.kind === 'display' && sel.displayId === id;
  }

  isNetworkConfig(restaurantId: number): boolean {
    const cfg = this.configs.find(c => c.restaurantId === restaurantId);
    return cfg ? cfg.usesNetwork : true;
  }

  get visibleGroups(): SoundTerminalGroupV2[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.groups;
    return this.groups
      .map(g => {
        if (g.name.toLowerCase().includes(q)) return g;
        const terminals = g.terminals
          .map(t => {
            if (t.name.toLowerCase().includes(q)) return t;
            const displays = (this.displaysMap[g.id] || []).filter(
              d => d.name.toLowerCase().includes(q) || d.themeName.toLowerCase().includes(q)
            );
            return displays.length > 0 ? t : null;
          })
          .filter((t): t is NonNullable<typeof t> => t !== null);
        return terminals.length > 0 ? { ...g, terminals } : null;
      })
      .filter((g): g is SoundTerminalGroupV2 => g !== null);
  }

  visibleTerminals(group: SoundTerminalGroupV2): SoundTerminalGroupV2['terminals'] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q || group.name.toLowerCase().includes(q)) return group.terminals;
    return group.terminals.filter(t => {
      if (t.name.toLowerCase().includes(q)) return true;
      return (this.displaysMap[group.id] || []).some(
        d => d.name.toLowerCase().includes(q) || d.themeName.toLowerCase().includes(q)
      );
    });
  }

  visibleDisplays(restaurantId: number): DvArrivalsDisplay[] {
    const q = this.searchTerm.trim().toLowerCase();
    const displays = this.displaysMap[restaurantId] || [];
    if (!q) return displays;
    return displays.filter(d => d.name.toLowerCase().includes(q) || d.themeName.toLowerCase().includes(q));
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroups.has(groupId);
  }

  toggleGroup(groupId: number): void {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
  }
}
