import { Injectable, signal } from "@angular/core";
import { Toast } from "../types/toast.types";


@Injectable({
    providedIn: 'root'
})
export class ToastService {

    //Max constants for the stack toasts
    private readonly MAX_TOASTS = 5;

    private readonly state = signal<Toast[]>([]);

    //readonly toast fo all components
    readonly toasts = this.state.asReadonly();

    //Method to shon toast
    show(toast: Omit<Toast, 'id'>): void {
        const id = crypto.randomUUID();

        this.state.update(current => {

            const updated = [{ ...toast, id }, ...current];
            return updated.slice(0, this.MAX_TOASTS);
        });


        setTimeout(() => this.remove(id), 5000);
    }

    //Method to remove the toast
    remove(id: string): void {
        this.state.update(current => current.filter(t => t.id !== id));
    }

    //Principal methods to create any toasts
    success(message: string, title?: string) {
        this.show({ message, title, variant: 'success' });
    }
    error(message: string, title?: string) {
        this.show({ message, title, variant: 'error' });
    }
    info(message: string, title?: string) {
        this.show({ message, title, variant: 'info' });
    }
    warning(message: string, title?: string) {
        this.show({ message, title, variant: 'warning' });
    }
}