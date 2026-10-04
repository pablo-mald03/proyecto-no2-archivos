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
            }

        ]
    },
    {
        path: 'drive',
        component: UserLayout,
        canActivate: [authGuard, roleGuard],
        data: { role: ROLES.USER },
        children: [
            { path: '', redirectTo: 'files', pathMatch: 'full' },

        ],
    },

];
