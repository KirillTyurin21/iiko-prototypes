import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { NeptunePosDialogComponent } from '../pos-dialog.component';

@Component({
  selector: 'neptune-loading-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule, NeptunePosDialogComponent],
  template: `
    <neptune-pos-dialog [open]="open" maxWidth="sm" [closable]="false">
      <div class="flex flex-col items-center justify-center py-10">
        <lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
        <p class="text-white text-base mt-4">{{ message }}</p>
      </div>
    </neptune-pos-dialog>
  `,
})
export class NeptuneLoadingDialogComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() message = 'Загрузка...';
  @Output() loadingComplete = new EventEmitter<void>();

  private timer: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        this.timer = setTimeout(() => {
          this.loadingComplete.emit();
        }, 3000);
      } else {
        clearTimeout(this.timer);
      }
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
