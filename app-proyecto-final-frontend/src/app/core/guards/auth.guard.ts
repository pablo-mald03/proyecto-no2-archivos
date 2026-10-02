import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthState } from "../../stores/auth.state";


//Principal authentication guard
export const authGuard: CanActivateFn = () => {

    const authState =
        inject(AuthState);

    const router =
        inject(Router);


    if (authState.isAuthenticated()) {
        return true;
    }


    return router.createUrlTree([
        '/auth/login'
    ]);

};