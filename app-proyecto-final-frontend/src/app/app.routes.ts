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
import { TrashPage } from './components/pages/trash-page/trash-page';
import { SharedWithMePage } from './components/pages/shared-with-me-page/shared-with-me-page';
import { ReportSharedPage } from './components/pages/report-shared-page/report-shared-page';
import { ReportUsersPage } from './components/pages/report-users-page/report-users-page';
import { ReportFilesPage } from './components/pages/report-files-page/report-files-page';

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
            { path: 'trash', component: TrashPage },
            { path: 'shared', component: SharedWithMePage },
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

             //REPORTS
            {
                path: 'reports',
                canActivate: [
                    permissionGuard
                ],
                data: {
                    permission: 'REPORTS_VIEW'
                },
                children: [

                    {
                        path: 'users',
                        component: ReportUsersPage,
                        canActivate: [permissionGuard],
                        data: { permission: 'REPORTS_USERS_VIEW' }
                    },
                    // {
                    //     path: 'users/lowest-stock',
                    //     component: ReportLowestStockComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:productos_menor_existencia' }
                    // },
                    // {
                    //     path: 'users/top-sold',
                    //     component: ReportTopSoldComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:top_productos_vendidos' }
                    // },
                    // {
                    //     path: 'users/product-movements',
                    //     component: ReportProductMovementComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:productos_mayor_movimiento' }
                    // },
                    // {
                    //     path: 'users/most-product-movements',
                    //     component: ReportMostMovementComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:historial_movimientos_producto' }
                    // },
                    {
                        path: 'sharing',
                        component: ReportSharedPage,
                        canActivate: [permissionGuard],
                        data: { permission: 'REPORTS_SHARING_VIEW' }
                    },
                    // {
                    //     path: 'sharing/top-providers',
                    //     component: ReportTopProviderComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:top_proveedores' }
                    // },
                    // {
                    //     path: 'sharing/most-purchased-products',
                    //     component: ReportMostPurchasedProductsComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:productos_mas_adquiridos' }
                    // },
                    // {
                    //     path: 'sharing/date-interval',
                    //     component: ReportPurchaseDateIntervalComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:compras_rango_fechas' }
                    // },
                    {
                        path: 'folders',
                        component: ReportFilesPage,
                        canActivate: [permissionGuard],
                        data: { permission: 'REPORTS_FOLDERS_VIEW' }
                    },
                    // {
                    //     path: 'files/top-customers',
                    //     component: ReportCustomerComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:top_clientes' }
                    // },
                    // {
                    //     path: 'files/top-products-by-revenue',
                    //     component: ReportToProductByRevenueComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:top_productos_ingresos' }
                    // },
                    // {
                    //     path: 'files/summary',
                    //     component: ReportSalesSummaryByPeriodComponent,
                    //     canActivate: [permissionGuard],
                    //     data: { permission: 'reportes:resumen_ventas_periodo' }
                    // },
                ]

            },
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
