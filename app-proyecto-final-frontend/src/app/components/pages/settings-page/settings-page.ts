import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CustomAlert } from '../../common/custom-alert/custom-alert';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthState } from '../../../stores/auth.state';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { finalize } from 'rxjs';
import { SettingsService } from '../../../features/settings/services/settings.service';
import { SystemSetting } from '../../../features/settings/models/setting.model';
import { SettingCardComponent } from '../../settings/settings-card/settings-card';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  host: { class: 'flex flex-col h-full min-h-0' },
  imports: [
    CustomAlert,
    SettingCardComponent
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
/*Principal iva page */
export class SettingsPage implements OnInit {

  // Dependencies
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);
  private readonly authState = inject(AuthState);

  readonly canEdit = computed(() =>
    this.authState.hasPermission('SETTINGS_UPDATE')
  );

  // Data signals
  readonly settingsList = signal<SystemSetting[]>([]);
  readonly loading = signal(false);
  readonly initialized = signal(false);
  readonly hasError = signal(false);

  // Skeleton placeholders while loading
  readonly skeletons = [0, 1];


  ngOnInit(): void {
    this.loadSettings();
  }

  // Load all system settings
  loadSettings(): void {
    this.loading.set(true);
    this.hasError.set(false);

    this.settingsService.getSettings()
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.initialized.set(true);
        })
      )
      .subscribe({
        next: (response: SystemSetting[]) => {
          this.settingsList.set(response);
        },
        error: (error: ErrorResponse) => {
          this.hasError.set(true);
          this.toastService.error(
            error.message || 'No fue posible cargar la configuración del sistema.',
            'Error al cargar configuraciones'
          );
        }
      });
  }

  editSetting(setting: SystemSetting): void {
    this.router.navigate([
      '/dashboard/settings',
      setting.key,
      'edit'
    ]);
  }

  // Method to update a setting value by key
  updateSettingValue(key: string, newValue: any): void {
    this.settingsService.updateSetting(key, { value: newValue }).subscribe({
      next: (updatedSetting) => {
        this.toastService.success('Configuración actualizada correctamente', 'Éxito');
        this.settingsList.update(list =>
          list.map(s => s.key === key ? updatedSetting : s)
        );
      },
      error: (error: ErrorResponse) => {
        this.toastService.error(
          error.message || 'No se pudo actualizar la configuración.',
          'Error'
        );
      }
    });
  }
}