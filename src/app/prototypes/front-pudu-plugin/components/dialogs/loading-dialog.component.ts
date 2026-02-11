import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'pudu-loading-dialog',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="sm" theme="light" [closable]="false">
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
        <h2 class="text-xl font-semibold text-gray-900">Выполняется...</h2>
        <p class="text-sm text-gray-500">{{ message }}</p>
      </div>
    </pudu-pos-dialog>
  `,
})
export class PuduLoadingDialogComponent {
  @Input() open = false;
  @Input() message = 'Отправка команды роботу';
}
