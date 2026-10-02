import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ButtonSize, ButtonType, ButtonVariant } from './types/button.types';

@Component({
  selector: 'app-custom-button',
  imports: [
    NgIcon
  ],
  templateUrl: './custom-button.html',
  styleUrl: './custom-button.css',
})

/**
 * Principal button component
 */
export class CustomButton {

  label = input<string>();

  ariaLabel = input<string>();

  variant = input<ButtonVariant>('primary');

  type = input<ButtonType>('button');

  size = input<ButtonSize>('md');

  icon = input<string>();

  iconPosition = input<'left' | 'right'>('left');

  bordered = input(false);

  disabled = input(false);

  loading = input(false);

  clicked = output<void>();

  //Method to emit the signal when the button is clicked
  handleClick(): void {

    if (this.disabled() || this.loading()) {
      return;
    }

    this.clicked.emit();

  }
}