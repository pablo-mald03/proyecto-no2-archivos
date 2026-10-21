import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { CustomButton } from '../../common/custom-button/custom-button';
import { CustomCard } from '../../common/custom-card/custom-card';
import { RoleSelectorComponent } from '../../roles/role-selector-component/role-selector-component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../features/users/service/user.service';
import { RoleService } from '../../../features/roles/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role } from '../../../features/roles/models/role.model';
import { User } from '../../../features/users/models/user.model';
import { lucideArrowLeft, lucideMail, lucideSave, lucideShield, lucideUserRound } from '@ng-icons/lucide';
import { finalize } from 'rxjs';
import { ErrorResponse } from '../../../features/errors/models/error-response.model';
import { UpdateUserRolesRequest } from '../../../features/users/models/request/update-user-roles-request.model';
import { RolePage } from '../../../features/roles/models/pagination/role-pagination.model';

@Component({
  selector: 'app-roles-user-edit-component',
  standalone: true,
  imports: [
    NgIcon,
    CustomButton,
    CustomCard,
    RoleSelectorComponent
  ],
  templateUrl: './roles-user-edit-component.html',
  styleUrl: './roles-user-edit-component.css',
})
/*Principal user roles edit component */
export class RolesUserEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);

  readonly userId = this.route.snapshot.paramMap.get('id')!;

  readonly loading = signal(false);
  readonly rolesLoading = signal(false);
  readonly saving = signal(false);

  readonly user = signal<User | null>(null);
  readonly roles = signal<Role[]>([]);
  readonly selectedRoleCode = signal('');

  readonly lucideArrowLeftIcon = lucideArrowLeft;
  readonly lucideSaveIcon = lucideSave;
  readonly lucideShieldIcon = lucideShield;
  readonly lucideUserIcon = lucideUserRound;
  readonly lucideMailIcon = lucideMail;


  readonly selectedRoles = computed(() => {
    const roleCode = this.selectedRoleCode();

    return this.roles().filter(
      role => role.code === roleCode
    );
  });

  ngOnInit(): void {
    this.loadUser();
    this.loadRoles();
  }

  loadUser(): void {
    this.loading.set(true);

    this.userService
      .getUserById(this.userId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: user => {
          this.user.set(user);
          this.selectedRoleCode.set(user.roleCode);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar el usuario.',
            'Error al cargar usuario',
          );

          this.goBack();
        },
      });
  }

  loadRoles(): void {
    this.rolesLoading.set(true);

    this.roleService
      .getRoles({
        page: 0,
        size: 50,
        sortBy: 'name',
        direction: 'asc',
        isActive: true,
      })
      .pipe(finalize(() => this.rolesLoading.set(false)))
      .subscribe({
        next: (response: RolePage) => {
          this.roles.set(response.content);
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible cargar los roles.',
            'Error al cargar roles',
          );
        },
      });
  }

  updateRole(): void {
    const user = this.user();
    const roleCode = this.selectedRoleCode();

    if (!user || !roleCode || this.saving()) {
      return;
    }

    if (roleCode === user.roleCode) {
      this.toastService.error(
        'Selecciona un rol diferente para guardar los cambios.',
        'Sin cambios',
      );
      return;
    }

    this.saving.set(true);

    const request: UpdateUserRolesRequest = { roleCode };

    this.userService
      .updateUserRole(this.userId, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: updatedUser => {
          this.user.set(updatedUser);

          this.toastService.success(
            'El rol del usuario fue actualizado correctamente.',
            'Rol actualizado',
          );

          this.goBack();
        },
        error: (error: ErrorResponse) => {
          this.toastService.error(
            error.message || 'No fue posible actualizar el rol del usuario.',
            'Error al actualizar rol',
          );
        },
      });
  }

  selectRole(role: Role): void {
    this.selectedRoleCode.set(role.code);
  }

  removeRole(role: Role): void {
    if (this.selectedRoleCode() === role.code) {
      this.selectedRoleCode.set('');
    }
  }

  goBack(): void {
    this.router.navigate([
      '/dashboard/administration/users',
      this.userId,
      'edit',
    ]);
  }
}