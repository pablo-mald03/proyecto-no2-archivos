import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Role } from '../../../features/roles/models/role.model';
import { lucidePlus, lucideShield, lucideShieldCheck, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-role-selector-component',
  standalone: true,
  imports: [
    NgIcon
  ],
  templateUrl: './role-selector-component.html',
  styleUrl: './role-selector-component.css',
})
/*Principal role selector component */
export class RoleSelectorComponent {

  //Props
  roles = input<Role[]>([]);
  selectedRoles = input<Role[]>([]);
  loading = input(false);

  //Signals
  roleSelected = output<Role>();
  roleRemoved = output<Role>();

  readonly lucideShieldIcon = lucideShield;

  readonly lucideShieldCheckIcon = lucideShieldCheck;

  readonly lucidePlusIcon = lucidePlus;

  readonly lucideXIcon = lucideX;

  //Available roles
  readonly availableRoles = computed(() => {

    const selectedIds =
      new Set(
        this.selectedRoles().map(
          role => role.id
        )
      );

    return this.roles().filter(
      role => !selectedIds.has(role.id)
    );
  });

  //Method action when the role is selected
  selectRole(role: Role): void {
    this.roleSelected.emit(role);
  }

  //Remove role selection
  removeRole(role: Role): void {
    this.roleRemoved.emit(role);
  }
}