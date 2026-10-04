import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthState } from "../../stores/auth.state";
import { homeFor } from "../utils/role-home";

// Principal guard to protect the URL by role
export const roleGuard: CanActivateFn = (route) => {

    const authState = inject(AuthState);
    const router = inject(Router);

    const role = route.data['role'] as string | undefined;

    if (!role?.length) {
        return true;
    }

    const userRole = authState.user()?.roleCode;

    if (userRole === role) {
        return true;
    }

    return router.createUrlTree([homeFor(userRole)]);
};