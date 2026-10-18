import { Component, computed, input, output } from '@angular/core';
import { Permission } from '../../../features/permissions/models/permission.model';
import { NgIcon, NgIconComponent } from '@ng-icons/core';
import { lucideCheck, lucidePlus, lucideShieldCheck, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-permission-selector-component',
  imports: [NgIcon],
  templateUrl: './permission-selector-component.html',
  styleUrl: './permission-selector-component.css',
})
/*Principal permission selector comoponent */
export class PermissionSelectorComponent {

  readonly lucideXIcon = lucideX;
  readonly lucideCheckIcon = lucideCheck;
  readonly lucidePlusIcon = lucidePlus;
  readonly lucideShieldCheckIcon = lucideShieldCheck;

  //Reactive variables
  permissions = input<Permission[]>([]);
  selectedPermissions = input<Permission[]>([]);
  loading = input(false);

  //signals
  permissionSelected = output<Permission>();
  permissionRemoved = output<Permission>();

  //Selected ids
  readonly selectedIds = computed(() =>
    new Set(
      this.selectedPermissions().map(permission => permission.code)
    )
  );

  //Available permissions
  readonly availablePermissions = computed(() =>
    this.permissions().filter(
      permission => !this.selectedIds().has(permission.code)
    )
  );

  //Method to select permissions
  selectPermission(permission: Permission): void {
    this.permissionSelected.emit(permission);
  }

  //Method to remove permissions
  removePermission(permission: Permission): void {
    this.permissionRemoved.emit(permission);
  }
}