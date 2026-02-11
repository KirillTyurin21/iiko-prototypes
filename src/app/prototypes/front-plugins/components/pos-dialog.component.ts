import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Обёртка модального окна в стиле POS-терминала Front.
 * Тёмная тема: bg #3a3a3a, акцент #b8c959.
 */
@Component({
  selector: 'pos-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" (click)="onOverlayClick()"></div>
      <!-- Dialog -->
      <div
        class="relative bg-[#3a3a3a] rounded-lg text-white p-8 animate-scale-in w-full mx-4"
        [ngClass]="maxWidthClass"
        [class.border-none]="true"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PosDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closable = true;
  @Output() dialogClose = new EventEmitter<void>();

  private readonly widthMap: Record<string, string> = {
    sm: 'max-w-[350px]',
    md: 'max-w-[500px]',
    lg: 'max-w-[600px]',
    xl: 'max-w-[700px]',
  };

  get maxWidthClass(): string {
    return this.widthMap[this.maxWidth] || this.widthMap['md'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open && this.closable) this.close();
  }

  onOverlayClick(): void {
    if (this.closable) this.close();
  }

  close(): void {
    this.dialogClose.emit();
  }
}
