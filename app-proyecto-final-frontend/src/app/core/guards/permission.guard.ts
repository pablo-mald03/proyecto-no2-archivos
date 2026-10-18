import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthState } from "../../stores/auth.state";


//Principal permission ACL guard (THE MOST IMPORTANT GUARD)
export const permissionGuard: CanActivateFn = (route) => {
    const authState = inject(AuthState);
    const router = inject(Router);

    const permission = route.data['permission'] as string;

    if (permission && authState.hasPermission(permission)) {
        return true;
    }

    return router.createUrlTree(['/dashboard']);
};