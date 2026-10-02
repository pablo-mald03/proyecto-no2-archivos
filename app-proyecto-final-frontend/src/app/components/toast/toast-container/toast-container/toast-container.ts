import { Component, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastVariant } from '../../../../core/types/toast.types';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [NgIcon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
//Principal toast service
export class ToastContainer {

  //Dependency inversion
  toastService = inject(ToastService);
  toasts = this.toastService.toasts;
  isHovered = signal(false);

  //Principal method to get the icon for the toast
  getIcon(variant: ToastVariant): string {
    const icons: Record<ToastVariant, string> = {
      default: 'lucideInfo',
      info: 'lucideInfo',
      success: 'lucideCheckCircle',
      warning: 'lucideAlertTriangle',
      error: 'lucideXCircle'
    };
    return icons[variant];
  }

  //Principal method to get the different classes fo the toast
  getVariantClasses(variant: ToastVariant): string {
    const classes: Record<ToastVariant, string> = {
      default: 'bg-surface/95 border-border text-text backdrop-blur-md',
      info: 'bg-blue-950/90 border-blue-800/80 text-blue-200 backdrop-blur-md',
      success: 'bg-green-950/90 border-green-800/80 text-green-200 backdrop-blur-md',
      warning: 'bg-yellow-950/90 border-yellow-800/80 text-yellow-200 backdrop-blur-md',
      error: 'bg-red-950/90 border-red-800/80 text-red-200 backdrop-blur-md'
    };
    return classes[variant];
  }

  //Principal method to get the different variatns of close buttons
  getCloseButtonClasses(variant: ToastVariant): string {
    const classes: Record<ToastVariant, string> = {
      default: 'text-text-muted hover:bg-surface-raised hover:text-text',
      info: 'text-blue-600 hover:bg-blue-900/60 hover:text-blue-100',
      success: 'text-green-600 hover:bg-green-900/60 hover:text-green-100',
      warning: 'text-yellow-600 hover:bg-yellow-900/60 hover:text-yellow-100',
      error: 'text-red-600 hover:bg-red-900/60 hover:text-red-100'
    };
    return classes[variant];
  }
}
