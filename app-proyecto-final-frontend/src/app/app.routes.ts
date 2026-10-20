import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { LandingPage } from './components/landingpage/landing-page/landing-page';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { LoginComponent } from './components/auth/login-component/login-component';
import { ForgotPasswordComponent } from './components/auth/forgot-password-component/forgot-password-component';
import { UserLayout } from './layouts/user-layout/user-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES } from './core/constants/roles';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { managementGuard } from './core/guards/management.guard';
import { DashboardHome } from './components/pages/dashboard-home/dashboard-home';
import { DriveHome } from './components/pages/drive-home/drive-home';
import { permissionGuard } from './core/guards/permission.guard';
import { LogsPage } from './components/pages/logs-page/logs-page';
import { ProfileComponent } from './components/users /profile-component/profile-component';
import { UsersPage } from './components/pages/users-page/users-page';
import { CreateUserComponent } from './components/users /create-user-component/create-user-component';
import { UserEditPage } from './components/pages/user-edit-page/user-edit-page';
import { ProfileUserEditComponent } from './components/users /profile-user-edit-component/profile-user-edit-component';
import { RolesUserEditComponent } from './components/users /roles-user-edit-component/roles-user-edit-component';
import { RolesPage } from './components/pages/roles-page/roles-page';
import { CreateRoleComponent } from './components/roles/create-role-component/create-role-component';
import { RoleEditComponent } from './components/roles/role-edit-component/role-edit-component';
import { RolePermissionsComponent } from './components/roles/role-permissions-component/role-permissions-component';
import { PermissionsPage } from './components/pages/permissions-page/permissions-page';
import { RegisterUserComponent } from './components/auth/register-user-component/register-user-component';
import { SettingsPage } from './components/pages/settings-page/settings-page';
import { UpdateSettingsComponent } from './components/settings/update-settings-component/update-settings-component';
import { DriveFilesPageComponent } from './components/drive/drive-files-page-component/drive-files-page-component';
import { DriveExplorerComponent } from './components/files/drive-explorer-component/drive-explorer-component';
import { FilePreviewLayoutComponent } from './components/viewer/file-preview-layout-component/file-preview-layout-component';
import { ForbiddenPage } from './components/forbidden/forbidden-page/forbidden-page';
import { UserActivityPage } from './components/pages/user-activity-page/user-activity-page';

export const routes: Routes = [

    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                component: LandingPage
            }
        ]
    },
    {
        path: 'auth',
        component: AuthLayout,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'login'
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'forgot-password',
                component: ForgotPasswordComponent
            },
            {
                path: 'register',
                component: RegisterUserComponent
            }

        ]
    },
    {
        path: 'drive',
        component: UserLayout,
        canActivate: [authGuard, roleGuard],
        data: { role: ROLES.USER },
        children: [
            { path: '', component: DriveHome },
            { path: 'profile', component: ProfileComponent },
            { path: 'activity', component: UserActivityPage },
            {
                path: 'files',
                component: DriveExplorerComponent,
                children: [
                    { path: '', component: DriveFilesPageComponent },
                    { path: 'folder/:id', component: DriveFilesPageComponent },
                    { path: 'preview/:id', component: FilePreviewLayoutComponent },
                    { path: 'file/:id', redirectTo: 'preview/:id' }
                ]
            }
        ],
    },
    {
        path: 'dashboard',
        component: DashboardLayout,
        canActivate: [managementGuard],
        canActivateChild: [authGuard],
        children: [
            { path: '', component: DashboardHome },
            { path: 'profile', component: ProfileComponent },
            {
                path: 'activity',
                canActivate: [
                    permissionGuard
                ],
                data: {
                    permission: 'REPORTS_ACTIVITY_VIEW'
                },
                children: [

                    {
                        path: '',
                        component: LogsPage
                    },
                ]
            },
            // ADMINISTRATION
            {
                path: 'administration',
                children: [
                    {
                        path: '',
                        component: DashboardHome
                    },
                    {

                        path: 'users',
                        canActivate: [
                            permissionGuard
                        ],
                        data: {
                            permission: 'USERS_VIEW'
                        },
                        children: [

                            {
                                path: '',
                                component: UsersPage
                            },
                            {
                                path: 'create',
                                component: CreateUserComponent,
                                canActivate: [permissionGuard],
                                data: { permission: 'USERS_CREATE' }
                            },
                            {
                                path: ':id/edit',
                                component: UserEditPage,
                                data: { permission: 'USERS_UPDATE' }
                            },
                            {
                                path: ':id/edit/profile',
                                component: ProfileUserEditComponent,
                                canActivate: [permissionGuard],
                                data: { permission: 'USERS_UPDATE' }
                            },
                            {
                                path: ':id/edit/roles',
                                component: RolesUserEditComponent,
                                canActivate: [permissionGuard],
                                data: { permission: 'USERS_UPDATE' }
                            }

                        ]
                    },
                    {
                        path: 'roles',
                        canActivate: [
                            permissionGuard
                        ],
                        data: {
                            permission: 'ROLES_VIEW'
                        },
                        children: [

                            {
                                path: '',
                                component: RolesPage
                            },
                            {
                                path: 'create',
                                component: CreateRoleComponent,
                                canActivate: [permissionGuard],
                                data: {
                                    permission: 'ROLES_CREATE'
                                }
                            },
                            {
                                path: ':id/edit',
                                component: RoleEditComponent,
                                canActivate: [permissionGuard],
                                data: {
                                    permission: 'ROLES_UPDATE'
                                }
                            },
                            {
                                path: ':id/permissions',
                                component: RolePermissionsComponent,
                                canActivate: [permissionGuard],
                                data: {
                                    permission: 'ROLES_PERMISSIONS_UPDATE'
                                }
                            }
                        ]
                    },
                    {
                        path: 'permissions',
                        canActivate: [
                            permissionGuard
                        ],
                        data: {
                            permission: 'PERMISSIONS_VIEW'
                        },
                        children: [

                            {
                                path: '',
                                component: PermissionsPage
                            },
                        ]
                    }

                ]
            },
            //SYSTEM SETTINGS
            {
                path: 'settings',
                canActivate: [
                    permissionGuard
                ],
                data: {
                    permission: 'SETTINGS_VIEW'
                },
                children: [

                    {
                        path: '',
                        component: SettingsPage
                    },
                    {
                        path: ':key/edit',
                        canActivate: [permissionGuard],
                        data: { permission: 'SETTINGS_VIEW' },
                        component: UpdateSettingsComponent
                    }
                ]
            }
        ],
    },
    //ACCES DENIED PAGE
    {
        path: 'forbidden',
        component: ForbiddenPage
    },
    //FORBIDDEN PAGE
    {
        path: '**',
        component: ForbiddenPage
    }

];
