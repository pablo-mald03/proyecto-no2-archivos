import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lucideArrowLeft, lucideShieldCheck, lucideUserRound } from '@ng-icons/lucide';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-user-edit-page',
  imports: [NgIcon, CustomButton, CustomCard],
  templateUrl: './user-edit-page.html',
  styleUrl: './user-edit-page.css',
})
/*Principal edit user page */
export class UserEditPage {

  //Aservices
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  //Path variable
  readonly userId = this.route.snapshot.paramMap.get('id')!;

  //Icons
  readonly lucideArrowLeftIcon = lucideArrowLeft;
  readonly lucideUserIcon = lucideUserRound;
  readonly lucideShieldIcon = lucideShieldCheck;

  //Method to navigate to edit profile
  editProfile(): void {
    this.router.navigate(['profile'], {
      relativeTo: this.route
    });
  }

  //Method to navigate to edit roles
  editRoles(): void {
    this.router.navigate(['roles'], {
      relativeTo: this.route
    });
  }

  //Method to return to all users
  goBack(): void {
    this.router.navigate(['/dashboard/administration/users']);
  }
}