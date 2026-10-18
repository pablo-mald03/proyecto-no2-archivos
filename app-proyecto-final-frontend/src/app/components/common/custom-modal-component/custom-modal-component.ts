import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, input, output, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-modal-component',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './custom-modal-component.html',
  styleUrl: './custom-modal-component.css',
})
//Custom modal component
export class CustomModalComponent {

  // Inputs
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly maxWidth = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly closeOnBackdrop = input<boolean>(true);

  // Outputs
  readonly closed = output<void>();

  // Icons
  readonly lucideXIcon = lucideX;

  @ViewChild('modalContainer') modalContainer?: ElementRef<HTMLDivElement>;


  //Document listener
  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdrop()) return;

    if (this.modalContainer && !this.modalContainer.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  get widthClass(): string {
    switch (this.maxWidth()) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'md':
      default: return 'max-w-md';
    }
  }
}