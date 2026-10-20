import { Component, computed, effect, ElementRef, HostListener, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconType, NgIconComponent } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [ReactiveFormsModule, NgIconComponent],
  templateUrl: './custom-dropdown.html',
  styleUrl: './custom-dropdown.css'
})
/* Custom dropdown component */
export class CustomDropdown {
  private readonly elementRef = inject(ElementRef);

  // Trigger element reference
  readonly triggerEl = viewChild<ElementRef<HTMLDivElement>>('triggerBtn');

  // Icons
  readonly lucideXIcon = lucideX;
  readonly lucideChevronDownIcon = lucideChevronDown;
  readonly lucideCheckIcon = lucideCheck;

  // Inputs
  label = input('');
  placeholder = input('Select an option');
  options = input.required<any[]>();
  optionKey = input.required<string>();
  optionLabel = input.required<string>();
  control = input.required<FormControl>();
  icon = input<IconType>();
  clearable = input(false);
  selectableFirst = input(false);
  size = input<'sm' | 'md' | 'lg'>('md');

  // Open state and position
  readonly isOpen = signal(false);
  readonly dropdownPosition = signal<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0
  });

  readonly controlValue = signal<any>(null);
  private readonly valueChangeTrigger = signal(0);

  private firstOptionInitialized = false;

  constructor() {
    effect(() => {
      const ctrl = this.control();
      if (ctrl) {
        this.controlValue.set(ctrl.value);
        ctrl.valueChanges.subscribe(val => {
          this.controlValue.set(val);
        });
      }
    });

    effect(() => {
      const options = this.options();
      if (!this.selectableFirst() || !options.length || this.firstOptionInitialized) return;

      const control = this.control();
      if (control && (control.value === null || control.value === undefined || control.value === '')) {
        control.setValue(this.getOptionValue(options[0]));
      }
      this.firstOptionInitialized = true;
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updatePositionOnScroll(): void {
    if (this.isOpen()) {
      this.calculatePosition();
    }
  }

  private calculatePosition(): void {
    const trigger = this.triggerEl()?.nativeElement;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    this.dropdownPosition.set({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width
    });
  }

  toggleDropdown(): void {
    if (!this.isOpen()) {
      this.calculatePosition();
    }
    this.isOpen.update(open => !open);
    if (!this.isOpen()) {
      this.control().markAsTouched();
    }
  }

  readonly hasError = computed(() => {
    const control = this.control();
    return control?.invalid && (control.touched || control.dirty);
  });

  readonly errorMessage = computed(() => {
    const errors = this.control()?.errors;
    if (!errors) return '';
    if (errors['required']) return 'Select an option';
    return 'Invalid value';
  });

  readonly selectedOption = computed(() => {
    this.controlValue();
    this.valueChangeTrigger();

    const ctrl = this.control();
    const val = ctrl?.value;
    if (val === null || val === undefined || val === '') return null;
    return this.options().find(opt => this.getOptionValue(opt) === val) ?? null;
  });

  getOptionValue(option: Record<string, unknown>): unknown {
    return option[this.optionKey()];
  }

  getOptionLabel(option: Record<string, unknown>): string {
    return String(option[this.optionLabel()] ?? '');
  }

  selectOption(option: Record<string, unknown>): void {
    const val = this.getOptionValue(option);
    const ctrl = this.control();
    ctrl.setValue(val);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity();
    this.valueChangeTrigger.update(v => v + 1);
    this.isOpen.set(false);
  }

  clear(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.control().reset();
    this.valueChangeTrigger.update(v => v + 1);
    this.isOpen.set(false);
  }
}