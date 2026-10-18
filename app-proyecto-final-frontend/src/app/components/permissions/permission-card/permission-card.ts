import { Component, input } from '@angular/core';
import { lucideKeyRound } from '@ng-icons/lucide';
import { Permission } from '../../../features/permissions/models/permission.model';
import { NgIcon } from '@ng-icons/core';
import { CustomCard } from '../../common/custom-card/custom-card';

@Component({
  selector: 'app-permission-card',
  standalone: true,
  imports: [
    NgIcon,
    CustomCard
  ],
  templateUrl: './permission-card.html',
  styleUrl: './permission-card.css',
})
/*Permission card component */
export class PermissionCard {

  //Inputs
  permission = input.required<Permission>();

  //Icons
  readonly lucideKeyIcon = lucideKeyRound;
}