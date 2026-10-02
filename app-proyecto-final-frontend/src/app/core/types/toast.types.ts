export type ToastVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

//Toast props representation
export interface Toast {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
}
