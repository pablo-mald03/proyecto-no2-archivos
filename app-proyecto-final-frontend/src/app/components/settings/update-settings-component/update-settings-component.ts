import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { CustomTextfield } from '../../common/custom-textfield/custom-textfield';
import { CustomConfirmDialog } from '../../common/custom-confirm-dialog/custom-confirm-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { lucideArrowLeft, lucideFileSliders, lucideSave } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { SettingsService } from '../../../features/settings/services/settings.service';
import { SystemSetting } from '../../../features/settings/models/setting.model';


@Component({
  selector: 'app-update-setting',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    ReactiveFormsModule,
    NgIcon,
    CustomButton,
    CustomCard,
    CustomTextfield,
    CustomConfirmDialog
  ],
  templateUrl: './update-settings-component.html',
  styleUrl: './update-settings-component.css',
})
/**
 * Principal component to update a system setting value by key
 */
export class UpdateSettingsComponent implements OnInit {

  // Dependencies
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);

  // State signals
  readonly setting = signal<SystemSetting | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly dialogOpen = signal(false);

  // Form group definition
  readonly settingForm = new FormGroup({
    value: new FormControl<string | number>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  // Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;
  readonly lucideSaveIcon = lucideSave;
  readonly lucideSettingsIcon = lucideFileSliders;

  // Validation if form can be submitted and value has changed
  get canSubmit(): boolean {
    const current = this.setting();
    const formValue = this.settingForm.controls.value.value;

    return this.settingForm.valid
      && current !== null
      && formValue !== current.value;
  }

  // Confirmation dialog dynamic message
  get dialogMessage(): string {
    const current = this.setting();
    if (!current) return '';

    return `La configuración '${current.key}' pasará del valor "${current.value}" a "${this.settingForm.controls.value.value}".`;
  }

  ngOnInit(): void {
    this.loadSetting();
  }

  /**
   * Load setting data by route param key
   */
  private loadSetting(): void {
    const key = this.route.snapshot.paramMap.get('key');
    if (!key) {
      this.goBack();
      return;
    }

    this.loading.set(true);

    this.settingsService.getSettings()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (settings: SystemSetting[]) => {
          const found = settings.find(s => s.key === key);
          if (found) {
            this.setting.set(found);
            this.settingForm.controls.value.setValue(found.value);
          } else {
            this.toastService.error('La configuración solicitada no existe.', 'Error');
            this.goBack();
          }
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar la configuración.',
            'Error al cargar'
          );
          this.goBack();
        }
      });
  }

  // Open confirmation dialog
  openConfirmDialog(): void {
    if (!this.canSubmit || this.saving()) {
      return;
    }
    this.dialogOpen.set(true);
  }

  // Close confirmation dialog
  closeDialog(): void {
    if (this.saving()) return;
    this.dialogOpen.set(false);
  }

  // Confirm and send update request to the backend
  confirmUpdate(): void {
    const current = this.setting();
    if (!current || !this.canSubmit) return;

    this.saving.set(true);
    const newValue = this.settingForm.controls.value.value;

    this.settingsService.updateSetting(current.key, { value: newValue })
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.dialogOpen.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `La configuración '${current.key}' fue actualizada correctamente.`,
            'Configuración actualizada'
          );
          this.goBack();
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible actualizar la configuración.',
            'Error al actualizar'
          );
        }
      });
  }

  // Navigate back to settings list page
  goBack(): void {
    this.router.navigate(['/dashboard/settings']);
  }
}