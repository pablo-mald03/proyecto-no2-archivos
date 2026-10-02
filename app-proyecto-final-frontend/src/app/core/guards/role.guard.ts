import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthState } from "../../stores/auth.state";

//Principal guard to protect the URL by ROL
export const roleGuard: CanActivateFn = (route) => {

    const authState = inject(AuthState);
    const router = inject(Router);

    const roles = route.data['roles'] as string[] | undefined;

    if (!roles?.length) {
        return true;
    }

    const userRoles = authState.user()?.roleCode ?? [];

    const hasRole =
        roles.some(role =>
            userRoles.includes(role)
        );

    if (hasRole) {
        return true;
    }

    return router.createUrlTree([
        '/dashboard'
    ]);
}