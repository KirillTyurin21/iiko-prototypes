import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Organization, Store, TerminalInfo } from '../types';

export type TreeNodeType = 'org' | 'store' | 'terminal';

export interface TreeSelection {
  type: TreeNodeType;
  id: string;
  storeId?: string;
}

@Component({
  selector: 'app-org-tree',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="org-tree">
      <div *ngFor="let org of organizations" class="mb-1">
        <!-- Organization node -->
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
          (click)="toggleOrg(org.id)"
        >
          <lucide-icon
            [name]="expandedOrgs[org.id] ? 'chevron-down' : 'chevron-right'"
            [size]="14"
            class="text-gray-400 shrink-0"
          ></lucide-icon>
          <lucide-icon name="building-2" [size]="15" class="text-gray-400 shrink-0"></lucide-icon>
          <span class="text-sm font-medium text-gray-900">{{ org.name }}</span>
        </div>

        <!-- Stores -->
        <div *ngIf="expandedOrgs[org.id]" class="ml-4">
          <div *ngFor="let store of org.stores" class="mb-0.5">
            <!-- Store node -->
            <div
              class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors"
              [class.bg-gray-900]="selectedId === store.id"
              [class.text-white]="selectedId === store.id"
              [class.hover:bg-gray-100]="selectedId !== store.id"
              (click)="selectStore(store)"
            >
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                [class.bg-green-400]="store.credentialsStatus === 'configured' && selectedId === store.id"
                [class.bg-green-500]="store.credentialsStatus === 'configured' && selectedId !== store.id"
                [class.bg-gray-400]="store.credentialsStatus === 'not-configured' && selectedId === store.id"
                [class.bg-gray-300]="store.credentialsStatus === 'not-configured' && selectedId !== store.id"
                [class.bg-red-400]="store.credentialsStatus === 'error'"
              ></div>
              <lucide-icon name="store" [size]="14" [class.text-gray-300]="selectedId === store.id" [class.text-gray-400]="selectedId !== store.id"></lucide-icon>
              <span class="text-sm" [class.font-medium]="selectedId === store.id">
                {{ store.name }}
              </span>
            </div>

            <!-- Terminals -->
            <div *ngIf="selectedId === store.id" class="ml-6 mt-0.5 mb-1">
              <div
                *ngFor="let term of store.terminals"
                class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md cursor-pointer transition-colors"
                [class.text-gray-500]="true"
                [class.hover:bg-gray-100]="true"
                (click)="selectTerminal(term, store.id); $event.stopPropagation()"
              >
                <lucide-icon name="monitor" [size]="12" class="text-gray-400"></lucide-icon>
                <span>{{ term.name }}</span>
                <span
                  *ngIf="term.credentialsApplied"
                  class="ml-auto text-green-600 text-[10px]"
                >✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 pt-3 border-t border-gray-200 px-3 space-y-1.5">
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          Настроен
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-gray-300"></div>
          Не настроен
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          Ошибка
        </div>
      </div>
    </div>
  `,
  styles: [`
    .org-tree {
      min-width: 240px;
    }
  `],
})
export class OrgTreeComponent {
  @Input() organizations: Organization[] = [];
  @Input() selectedId = '';
  @Output() selectionChange = new EventEmitter<TreeSelection>();

  expandedOrgs: Record<string, boolean> = {};

  ngOnInit(): void {
    for (const org of this.organizations) {
      this.expandedOrgs[org.id] = true;
    }
  }

  toggleOrg(orgId: string): void {
    this.expandedOrgs[orgId] = !this.expandedOrgs[orgId];
  }

  selectStore(store: Store): void {
    this.selectionChange.emit({
      type: 'store',
      id: store.id,
    });
  }

  selectTerminal(terminal: TerminalInfo, storeId: string): void {
    this.selectionChange.emit({
      type: 'terminal',
      id: terminal.id,
      storeId,
    });
  }
}
