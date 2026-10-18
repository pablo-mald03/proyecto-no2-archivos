import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { Role } from '../../../features/roles/models/role.model';
import { lucideKeyRound, lucidePencil, lucidePower, lucideShield } from '@ng-icons/lucide';

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [
    NgIcon,
    CustomButton,
    CustomCard
  ],
  templateUrl: './role-card.html',
  styleUrl: './role-card.css',
})
/*Role card component */
/* Role card component */
export class RoleCard {
  // Inputs
  role = input.required<Role>();
  canEdit = input(false);
  canChangeStatus = input(false);
  canAssignPermissions = input(false);

  // Outputs
  editClicked = output<Role>();
  statusClicked = output<Role>();
  permissionsClicked = output<Role>();

  // Icons
  readonly lucideShieldIcon = lucideShield;
  readonly lucideEditIcon = lucidePencil;
  readonly lucideKeyIcon = lucideKeyRound;
  readonly lucidePowerIcon = lucidePower;

  // Edit role
  edit(): void {
    this.editClicked.emit(this.role());
  }

  // Toggle status
  toggleStatus(): void {
    this.statusClicked.emit(this.role());
  }

  // Assign permissions
  assignPermissions(): void {
    this.permissionsClicked.emit(this.role());
  }
}