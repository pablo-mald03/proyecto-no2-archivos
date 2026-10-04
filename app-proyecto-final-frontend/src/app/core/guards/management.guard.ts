import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../../stores/auth.state';
import { ROLES } from '../constants/roles';
import { homeFor } from '../utils/role-home';

//Principal guard to allow the management module to every role except the end user
export const managementGuard: CanActivateFn = () => {

    const authState = inject(AuthState);
    const router = inject(Router);

    const userRole = authState.user()?.roleCode;

    if (userRole && userRole !== ROLES.USER) {
        return true;
    }

    return router.createUrlTree([homeFor(userRole)]);
};