import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsDataService } from '../cs-data.service';
import { CSTerminal, Campaign, Hint } from '../cs-types';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-cs-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <!-- Toast -->
    <div
      *ngIf="showToast"
      class="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in"
    >
      <lucide-icon name="check-circle" [size]="18"></lucide-icon>
      <span>Настройки терминалов сохранены</span>
    </div>

    <div class="p-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-medium text-gray-800">Настройки терминалов</h2>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-app-primary text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          (click)="save()"
        >
          <lucide-icon name="save" [size]="16"></lucide-icon>
          Сохранить
        </button>
      </div>

      <!-- Matrix table -->
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="cs-matrix-table">
            <!-- Group headers row -->
            <thead>
              <tr class="bg-gray-100 border-b border-gray-200">
                <th class="sticky-col sticky-col-1 bg-gray-100 z-20" rowspan="2">
                  Терминал
                </th>
                <th class="sticky-col sticky-col-2 bg-gray-100 z-20" rowspan="2">
                  Тема
                </th>
                <th
                  *ngIf="campaigns.length > 0"
                  [attr.colspan]="campaigns.length"
                  class="group-header campaign-group"
                >
                  Рекл. кампании
                </th>
                <th
                  *ngIf="hints.length > 0"
                  [attr.colspan]="hints.length"
                  class="group-header hint-group"
                >
                  Подсказки
                </th>
              </tr>
              <!-- Individual column headers -->
              <tr class="bg-gray-50 border-b border-gray-300">
                <th
                  *ngFor="let c of campaigns"
                  class="col-header"
                  [title]="c.name"
                >
                  <span class="col-header-text">{{ c.name }}</span>
                </th>
                <th
                  *ngFor="let h of hints"
                  class="col-header"
                  [title]="h.name"
                >
                  <span class="col-header-text">{{ h.name }}</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                *ngFor="let terminal of terminals; let odd = odd"
                [class.bg-gray-50]="odd"
                class="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
              >
                <!-- Terminal name (sticky) -->
                <td
                  class="sticky-col sticky-col-1 font-medium text-gray-800 text-sm"
                  [class.bg-gray-50]="odd"
                  [class.bg-white]="!odd"
                >
                  {{ terminal.name }}
                </td>

                <!-- Theme name (sticky) -->
                <td
                  class="sticky-col sticky-col-2 text-sm text-gray-600"
                  [class.bg-gray-50]="odd"
                  [class.bg-white]="!odd"
                >
                  {{ terminal.themeName }}
                </td>

                <!-- Campaign checkboxes -->
                <td *ngFor="let c of campaigns" class="checkbox-cell">
                  <label class="checkbox-wrapper">
                    <input
                      type="checkbox"
                      [checked]="hasCampaign(terminal, c.id)"
                      (change)="toggleCampaign(terminal.id, c.id)"
                      class="cs-checkbox"
                    />
                  </label>
                </td>

                <!-- Hint checkboxes -->
                <td *ngFor="let h of hints" class="checkbox-cell">
                  <label class="checkbox-wrapper">
                    <input
                      type="checkbox"
                      [checked]="hasHint(terminal, h.id)"
                      (change)="toggleHint(terminal.id, h.id)"
                      class="cs-checkbox"
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-300"></span>
          Рекл. кампании ({{ campaigns.length }})
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-300"></span>
          Подсказки ({{ hints.length }})
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-gray-100 border border-gray-300"></span>
          Терминалов: {{ terminals.length }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Roboto', sans-serif;
    }

    /* ── Table base ── */
    .cs-matrix-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }

    .cs-matrix-table th,
    .cs-matrix-table td {
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 0;
    }

    .cs-matrix-table th:last-child,
    .cs-matrix-table td:last-child {
      border-right: none;
    }

    /* ── Sticky columns ── */
    .sticky-col {
      position: sticky;
      z-index: 10;
    }
    .sticky-col-1 {
      left: 0;
      min-width: 180px;
      max-width: 220px;
      padding: 10px 14px;
      border-right: 2px solid #d1d5db !important;
    }
    .sticky-col-2 {
      left: 180px;
      min-width: 160px;
      max-width: 200px;
      padding: 10px 14px;
      border-right: 2px solid #d1d5db !important;
    }

    /* ── Group headers ── */
    .group-header {
      text-align: center;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 8px 4px;
      border-bottom: 1px solid #d1d5db;
    }
    .campaign-group {
      background: #dbeafe;
      color: #1e40af;
      border-right: 2px solid #93c5fd;
    }
    .hint-group {
      background: #fef3c7;
      color: #92400e;
    }

    /* ── Column headers (rotated) ── */
    .col-header {
      width: 48px;
      min-width: 48px;
      max-width: 48px;
      height: 100px;
      padding: 4px 2px;
      vertical-align: bottom;
      text-align: center;
      position: relative;
    }
    .col-header-text {
      display: block;
      max-width: 100px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 11px;
      font-weight: 500;
      color: #374151;
      transform: rotate(-55deg);
      transform-origin: center center;
      position: absolute;
      bottom: 8px;
      left: 50%;
      margin-left: -50px;
      width: 100px;
      text-align: center;
    }

    /* ── Checkbox cells ── */
    .checkbox-cell {
      width: 48px;
      min-width: 48px;
      max-width: 48px;
      text-align: center;
      vertical-align: middle;
      padding: 6px 0;
    }

    .checkbox-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }

    /* ── Custom checkbox ── */
    .cs-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid #9ca3af;
      border-radius: 3px;
      background: #fff;
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .cs-checkbox:hover {
      border-color: #1976D2;
      background: #eff6ff;
    }
    .cs-checkbox:checked {
      background: #1976D2;
      border-color: #1976D2;
    }
    .cs-checkbox:checked::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 5px;
      width: 5px;
      height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .cs-checkbox:focus-visible {
      outline: 2px solid #1976D2;
      outline-offset: 2px;
    }

    /* ── Row hover highlight ── */
    .cs-matrix-table tbody tr:hover .sticky-col {
      background: #eff6ff !important;
    }
  `],
})
export class CsTerminalsScreenComponent {
  private dataService = inject(CsDataService);

  showToast = false;

  get terminals(): CSTerminal[] {
    return this.dataService.terminals;
  }

  get campaigns(): Campaign[] {
    return this.dataService.campaigns;
  }

  get hints(): Hint[] {
    return this.dataService.hints;
  }

  hasCampaign(terminal: CSTerminal, campaignId: number): boolean {
    return terminal.campaigns.includes(campaignId);
  }

  hasHint(terminal: CSTerminal, hintId: number): boolean {
    return terminal.hints.includes(hintId);
  }

  toggleCampaign(terminalId: number, campaignId: number): void {
    this.dataService.toggleCampaignAssignment(terminalId, campaignId);
  }

  toggleHint(terminalId: number, hintId: number): void {
    this.dataService.toggleHintAssignment(terminalId, hintId);
  }

  save(): void {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
