import { computed, Injectable, signal } from '@angular/core';
import { AuthUser } from '../features/auth/models/aut-user.model';

@Injectable({
  providedIn: 'root'
})
/*Class to respresentate the state of the auth token security */
export class AuthState {

  //Constants
  private readonly userState = signal<AuthUser | null>(null);

  readonly user = this.userState.asReadonly();

  readonly isAuthenticated = computed(() => this.userState() !== null);

  readonly permissions = computed(() => this.userState()?.permissions ?? []);


  //Method to set the authenticated user
  setUser(user: AuthUser): void {
    this.userState.set(user);
  }

  //Method to clear the estate
  clear(): void {
    this.userState.set(null);
  }


  /*Method to compare if the user has the permissions */
  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }


  /*Method to compare if the user has any selected permissions */
  hasAnyPermission(permissions: string[]): boolean {

    return permissions.some(
      permission => this.hasPermission(permission)
    );

  }

  //Method to compare if has all permissions
  hasAllPermissions(permissions: string[]): boolean {

    return permissions.every(
      permission => this.hasPermission(permission)
    );

  }


}