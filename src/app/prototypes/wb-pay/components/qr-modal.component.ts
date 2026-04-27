import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { UiModalComponent, UiButtonComponent } from '@/components/ui';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [CommonModule, IconsModule, UiModalComponent, UiButtonComponent],
  template: `
    <ui-modal
      [open]="open"
      title="QR-код настройки WB Pay"
      size="sm"
      (modalClose)="close.emit()"
    >
      <div class="flex flex-col items-center gap-4 py-4">
        <p class="text-sm text-text-secondary text-center">
          Отсканируйте QR-код на кассовом терминале для автоматической настройки плагина WB Pay
        </p>

        <!-- QR placeholder (SVG pattern) -->
        <div class="bg-white p-4 rounded-lg border-2 border-gray-200">
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- QR code pattern (simplified visual) -->
            <rect width="200" height="200" fill="white"/>
            <!-- Position patterns -->
            <rect x="10" y="10" width="50" height="50" fill="black"/>
            <rect x="15" y="15" width="40" height="40" fill="white"/>
            <rect x="20" y="20" width="30" height="30" fill="black"/>
            <rect x="140" y="10" width="50" height="50" fill="black"/>
            <rect x="145" y="15" width="40" height="40" fill="white"/>
            <rect x="150" y="20" width="30" height="30" fill="black"/>
            <rect x="10" y="140" width="50" height="50" fill="black"/>
            <rect x="15" y="145" width="40" height="40" fill="white"/>
            <rect x="20" y="150" width="30" height="30" fill="black"/>
            <!-- Data modules (random pattern) -->
            <rect x="70" y="10" width="10" height="10" fill="black"/>
            <rect x="90" y="10" width="10" height="10" fill="black"/>
            <rect x="110" y="10" width="10" height="10" fill="black"/>
            <rect x="70" y="30" width="10" height="10" fill="black"/>
            <rect x="100" y="30" width="10" height="10" fill="black"/>
            <rect x="120" y="30" width="10" height="10" fill="black"/>
            <rect x="80" y="50" width="10" height="10" fill="black"/>
            <rect x="110" y="50" width="10" height="10" fill="black"/>
            <rect x="10" y="70" width="10" height="10" fill="black"/>
            <rect x="30" y="70" width="10" height="10" fill="black"/>
            <rect x="50" y="70" width="10" height="10" fill="black"/>
            <rect x="70" y="70" width="10" height="10" fill="black"/>
            <rect x="90" y="70" width="10" height="10" fill="black"/>
            <rect x="110" y="70" width="10" height="10" fill="black"/>
            <rect x="130" y="70" width="10" height="10" fill="black"/>
            <rect x="150" y="70" width="10" height="10" fill="black"/>
            <rect x="170" y="70" width="10" height="10" fill="black"/>
            <rect x="20" y="90" width="10" height="10" fill="black"/>
            <rect x="50" y="90" width="10" height="10" fill="black"/>
            <rect x="80" y="90" width="10" height="10" fill="black"/>
            <rect x="100" y="90" width="10" height="10" fill="black"/>
            <rect x="130" y="90" width="10" height="10" fill="black"/>
            <rect x="160" y="90" width="10" height="10" fill="black"/>
            <rect x="40" y="110" width="10" height="10" fill="black"/>
            <rect x="70" y="110" width="10" height="10" fill="black"/>
            <rect x="110" y="110" width="10" height="10" fill="black"/>
            <rect x="140" y="110" width="10" height="10" fill="black"/>
            <rect x="170" y="110" width="10" height="10" fill="black"/>
            <rect x="70" y="130" width="10" height="10" fill="black"/>
            <rect x="90" y="130" width="10" height="10" fill="black"/>
            <rect x="120" y="130" width="10" height="10" fill="black"/>
            <rect x="150" y="130" width="10" height="10" fill="black"/>
            <rect x="70" y="150" width="10" height="10" fill="black"/>
            <rect x="100" y="150" width="10" height="10" fill="black"/>
            <rect x="130" y="150" width="10" height="10" fill="black"/>
            <rect x="160" y="150" width="10" height="10" fill="black"/>
            <rect x="70" y="170" width="10" height="10" fill="black"/>
            <rect x="90" y="170" width="10" height="10" fill="black"/>
            <rect x="110" y="170" width="10" height="10" fill="black"/>
            <rect x="140" y="170" width="10" height="10" fill="black"/>
            <rect x="170" y="170" width="10" height="10" fill="black"/>
            <rect x="180" y="150" width="10" height="10" fill="black"/>
          </svg>
        </div>

        <p class="text-xs text-gray-400 font-mono break-all max-w-[240px] text-center">
          {{ qrData | slice:0:40 }}...
        </p>

        <div class="flex gap-3 pt-2">
          <ui-button variant="outline" size="sm" iconName="printer" (click)="print.emit()">
            Печать
          </ui-button>
          <ui-button variant="outline" size="sm" iconName="download" (click)="download.emit()">
            Скачать
          </ui-button>
          <ui-button variant="ghost" size="sm" (click)="close.emit()">
            Закрыть
          </ui-button>
        </div>
      </div>
    </ui-modal>
  `,
})
export class QrModalComponent {
  @Input() open = false;
  @Input() qrData = '';
  @Output() close = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
}
