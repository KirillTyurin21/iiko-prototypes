import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5">
      <div
        class="w-2.5 h-2.5 rounded-full"
        [class.bg-green-500]="status === 'configured'"
        [class.bg-gray-300]="status === 'not-configured'"
        [class.bg-red-500]="status === 'error'"
      ></div>
      <span
        class="text-xs"
        [class.text-green-700]="status === 'configured'"
        [class.text-gray-500]="status === 'not-configured'"
        [class.text-red-700]="status === 'error'"
      >{{ label }}</span>
    </div>
  `,
})
export class StatusIndicatorComponent {
  @Input() status: 'configured' | 'not-configured' | 'error' = 'not-configured';
  @Input() label = '';
}
