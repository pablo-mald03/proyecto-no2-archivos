import { Component, ElementRef, HostListener, inject, input, output } from '@angular/core';

@Component({
  selector: 'app-custom-toggle-menu',
  standalone: true,
  imports: [],
  templateUrl: './custom-toggle-menu.html',
  styleUrl: './custom-toggle-menu.css',
})
export class CustomToggleMenu {

private readonly elementRef = inject(ElementRef);

  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly closed = output<void>();

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closed.emit();
    }
  }

  // Close on Escape key press for accessibility
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.closed.emit();
    }
  }
}