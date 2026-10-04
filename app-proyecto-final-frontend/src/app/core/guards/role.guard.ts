import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthState } from "../../stores/auth.state";

//Principal guard to protect the URL by ROL
export const roleGuard: CanActivateFn = (route) => {

    const authState = inject(AuthState);
    const router = inject(Router);

    const role = route.data['role'] as string[] | undefined;

    if (!role?.length) {
        return true;
    }

    const userRoles = authState.user()?.roleCode ?? [];

    const hasRole =
        role.some(role =>
            userRoles.includes(role)
        );

    if (hasRole) {
        return true;
    }

    return router.createUrlTree([
        '/dashboard'
    ]);
}