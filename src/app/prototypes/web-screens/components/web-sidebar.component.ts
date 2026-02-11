import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { SidebarSection } from '../types';
import { SIDEBAR_SECTIONS } from '../data/mock-data';

@Component({
  selector: 'app-web-sidebar',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <aside
      class="web-sidebar"
      [class.collapsed]="collapsed"
    >
      <div class="sidebar-scroll">
        <!-- Menu sections -->
        <div *ngFor="let section of sections; let last = last" class="section">
          <div class="section-header" *ngIf="!collapsed">
            {{ section.title }}
          </div>
          <div
            *ngFor="let item of section.items"
            class="menu-item"
            [class.active]="activeRoute === item.route"
            (click)="onNavigate(item.route)"
          >
            <div class="active-indicator" *ngIf="activeRoute === item.route"></div>
            <div class="item-icon">
              <lucide-icon [name]="item.icon" [size]="20"></lucide-icon>
            </div>
            <span class="item-label" *ngIf="!collapsed">{{ item.label }}</span>
            <span
              class="item-badge"
              *ngIf="item.badge && !collapsed"
            >{{ item.badge }}</span>
          </div>
          <div class="section-divider" *ngIf="!last"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="footer-links">
          <a href="javascript:void(0)">Помощь</a>
          <a href="javascript:void(0)">О программе</a>
        </div>
        <div class="footer-copy">
          <span>©</span>
          <span class="copy-sep"></span>
          <span>v8.10</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .web-sidebar {
      position: fixed;
      top: 64px;
      left: 0;
      height: calc(100% - 64px);
      width: 256px;
      background-color: #f7f8fc;
      box-shadow: 0 1px 1px rgba(158,158,158,.14),
                  0 2px 1px rgba(158,158,158,.12),
                  0 1px 3px rgba(158,158,158,.2);
      z-index: 101;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.4s cubic-bezier(.25,.8,.25,1);
      font-family: Roboto, sans-serif;
    }
    .web-sidebar.collapsed {
      width: 72px;
    }
    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-top: 4px;
    }
    .section {
      margin-bottom: 0;
    }
    .section-header {
      padding: 16px 24px 8px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9e9e9e;
      white-space: nowrap;
    }
    .menu-item {
      position: relative;
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 24px;
      cursor: pointer;
      user-select: none;
      color: #424242;
      font-size: 14px;
      font-weight: 400;
      transition: background-color 0.15s;
      white-space: nowrap;
      overflow: hidden;
    }
    .web-sidebar.collapsed .menu-item {
      padding: 0;
      justify-content: center;
    }
    .menu-item:hover {
      background-color: rgba(0,0,0,0.04);
    }
    .menu-item.active {
      background-color: #e8f1ff;
      color: #1976d2;
      font-weight: 500;
    }
    .active-indicator {
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      border-radius: 0 4px 4px 0;
      background-color: #448aff;
    }
    .item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    .item-label {
      margin-left: 16px;
      line-height: 20px;
    }
    .item-badge {
      margin-left: auto;
      background: #448aff;
      color: #fff;
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 12px;
      min-width: 20px;
      text-align: center;
    }
    .section-divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 8px 24px;
    }
    .web-sidebar.collapsed .section-divider {
      margin: 8px 16px;
    }
    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #757575;
    }
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .footer-links a {
      color: #448aff;
      text-decoration: none;
      font-size: 12px;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    .footer-copy {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #9e9e9e;
    }
    .copy-sep {
      display: block;
      width: 1px;
      height: 8px;
      background: #e0e0e0;
      margin: 0 8px;
    }
  `],
})
export class WebSidebarComponent {
  @Input() collapsed = false;
  @Input() activeRoute = '';
  @Output() navigate = new EventEmitter<string>();

  sections: SidebarSection[] = SIDEBAR_SECTIONS;

  onNavigate(route: string): void {
    this.navigate.emit(route);
  }
}
