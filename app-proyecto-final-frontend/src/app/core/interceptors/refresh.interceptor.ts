import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from "rxjs";
import { AuthService } from "../../features/auth/services/auth.service";
import { AuthState } from "../../stores/auth.state";
import { Router } from "@angular/router";

//Shared between requests: only one refresh runs at a time
let refreshing$: Observable<unknown> | null = null;

//These calls must never trigger a refresh (avoids loops and wrong retries on bad credentials)
const AUTH_CALLS = /\/auth\/(login|refresh|logout)$/;
const ME_CALL = /\/auth\/me$/;

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const state = inject(AuthState);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status !== 401 || AUTH_CALLS.test(req.url)) {
                return throwError(() => error);
            }

            refreshing$ ??= auth.refresh().pipe(
                finalize(() => (refreshing$ = null)),
                shareReplay(1),
            );

            return refreshing$.pipe(
                //Only refresh failures are handled here, not errors from the retried request
                catchError((refreshError: HttpErrorResponse) => {
                    if (refreshError.status === 401 || refreshError.status === 403) {
                        state.clear();
                        if (!ME_CALL.test(req.url)) router.navigate(['/auth/login']);
                    }
                    return throwError(() => error);
                }),
                switchMap(() => next(req)),
            );
        }),
    );
};