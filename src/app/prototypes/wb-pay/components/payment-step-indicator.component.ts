import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  label: string;
  status: 'done' | 'active' | 'pending';
}

@Component({
  selector: 'app-payment-step-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1 py-3">
      <ng-container *ngFor="let step of steps; let i = index; let last = last">
        <div class="flex items-center gap-2">
          <!-- Circle -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
            [class.bg-green-500]="step.status === 'done'"
            [class.border-green-500]="step.status === 'done'"
            [class.text-white]="step.status === 'done'"
            [class.bg-app-primary]="step.status === 'active'"
            [class.border-app-primary]="step.status === 'active'"
            [class.text-white]="step.status === 'active'"
            [class.animate-pulse]="step.status === 'active'"
            [class.bg-white]="step.status === 'pending'"
            [class.border-gray-300]="step.status === 'pending'"
            [class.text-gray-400]="step.status === 'pending'"
          >
            <span *ngIf="step.status === 'done'">✓</span>
            <span *ngIf="step.status === 'active'">►</span>
            <span *ngIf="step.status === 'pending'">{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs hidden sm:inline whitespace-nowrap"
            [class.text-green-700]="step.status === 'done'"
            [class.text-app-primary]="step.status === 'active'"
            [class.font-semibold]="step.status === 'active'"
            [class.text-gray-400]="step.status === 'pending'"
          >{{ step.label }}</span>
        </div>
        <!-- Connector line -->
        <div
          *ngIf="!last"
          class="flex-1 h-0.5 min-w-[16px]"
          [class.bg-green-400]="step.status === 'done'"
          [class.bg-gray-200]="step.status !== 'done'"
        ></div>
      </ng-container>
    </div>
  `,
})
export class PaymentStepIndicatorComponent {
  @Input() steps: StepItem[] = [];
}
