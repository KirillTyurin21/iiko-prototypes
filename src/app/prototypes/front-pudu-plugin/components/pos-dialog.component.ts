import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pudu-pos-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" (click)="onOverlayClick()"></div>
      <!-- Content -->
      <div class="relative rounded-lg p-8 animate-scale-in w-full mx-4"
           [ngClass]="[maxWidthClass, themeClasses]">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PuduPosDialogComponent {
  @Input() open = false;
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() theme: 'dark' | 'light' = 'dark';
  @Input() closable = true;
  @Output() dialogClose = new EventEmitter<void>();

  get maxWidthClass(): string {
    const map: Record<string, string> = {
      sm: 'max-w-[350px]',
      md: 'max-w-[500px]',
      lg: 'max-w-[600px]',
      xl: 'max-w-[700px]',
    };
    return map[this.maxWidth] || map['md'];
  }

  get themeClasses(): string {
    return this.theme === 'dark'
      ? 'bg-[#3a3a3a] text-white'
      : 'bg-white text-gray-900';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.closable && this.open) {
      this.dialogClose.emit();
    }
  }

  onOverlayClick(): void {
    if (this.closable) {
      this.dialogClose.emit();
    }
  }
}
