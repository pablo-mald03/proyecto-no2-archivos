import { Component, computed, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomModalComponent } from '../../common/custom-modal-component/custom-modal-component';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { lucideFileText, lucideFolderPlus, lucidePencil } from '@ng-icons/lucide';
import { driveNameValidator } from '../../../core/validators/drive-name.validator';

@Component({
  selector: 'app-folder-modal-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CustomModalComponent,
    CustomButton,
    CustomTextfield
  ],
  templateUrl: './folder-modal-component.html',
  styleUrl: './folder-modal-component.css',
})
export class FolderModalComponent {
  // Inputs & Outputs
  readonly isOpen = input.required<boolean>();
  readonly mode = input<'create' | 'rename'>('create');
  readonly itemType = input<'folder' | 'file'>('folder');
  readonly initialName = input<string>('');

  readonly closed = output<void>();
  readonly submitted = output<string>();

  // Form Control
  readonly nameControl = new FormControl('', {
    nonNullable: true
  });

  // Icons
  readonly lucideFolderPlusIcon = lucideFolderPlus;
  readonly lucideFileIcon = lucideFileText;
  readonly lucideEdit3Icon = lucidePencil;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const type = this.itemType();
        const currentMode = this.mode();

        this.nameControl.setValidators([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
          driveNameValidator(type)
        ]);

        this.nameControl.setValue(currentMode === 'rename' ? this.initialName() : '');
        this.nameControl.updateValueAndValidity();
        this.nameControl.markAsUntouched();
      }
    });
  }

  //Modal tittle
  readonly modalTitle = computed(() => {
    if (this.mode() === 'create') return 'Nueva carpeta';
    return this.itemType() === 'file' ? 'Renombrar archivo' : 'Renombrar carpeta';
  });

  //Modal subtittle
  readonly modalSubtitle = computed(() => {
    if (this.mode() === 'create') return 'Ingresa el nombre para la nueva carpeta.';
    return this.itemType() === 'file'
      ? 'Ingresa el nuevo nombre conserva la extensión.'
      : 'Ingresa el nuevo nombre para la carpeta.';
  });

  //Input lable tittle
  readonly inputLabel = computed(() => {
    if (this.mode() === 'create') return 'Nombre de la carpeta';
    return this.itemType() === 'file' ? 'Nombre del archivo' : 'Nombre de la carpeta';
  });

  readonly inputPlaceholder = computed(() => {
    if (this.mode() === 'create') return 'Nueva Carpeta';
    return this.itemType() === 'file' ? 'nota.md' : 'Mi Carpeta';
  });

  readonly submitButtonLabel = computed(() => {
    if (this.mode() === 'create') return 'Crear carpeta';
    return 'Guardar cambios';
  });

  readonly fieldIcon = computed(() => {
    if (this.mode() === 'create') return this.lucideFolderPlusIcon;
    return this.itemType() === 'file' ? this.lucideFileIcon : this.lucideEdit3Icon;
  });

  onSubmit(): void {
    if (this.nameControl.invalid) {
      this.nameControl.markAllAsTouched();
      return;
    }

    const name = this.nameControl.value.trim();
    this.submitted.emit(name);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}