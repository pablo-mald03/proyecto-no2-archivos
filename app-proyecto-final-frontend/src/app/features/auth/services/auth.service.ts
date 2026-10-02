import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { AuthState } from "../../../stores/auth.state";
import { LoginRequest } from "../models/login-request.model";
import { catchError, Observable, switchMap, tap, throwError } from "rxjs";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { AuthUser } from "../models/aut-user.model";

@Injectable({
    providedIn: 'root'
})
/*Auth service to send the request to the endpoint */
export class AuthService {

    //variables to make the http services
    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    private readonly authState = inject(AuthState);


    //Login endpoint request to the API
    login(request: LoginRequest): Observable<AuthUser> {
        return this.http.post<AuthUser>(`${this.apiUrl}/auth/login`, request).pipe(
            tap(user => this.authState.setUser(user)),
            catchError((error: HttpErrorResponse) => throwError(() => this.parseError(error)))
        );
    }

    //Principal method to know if the user is logged in 
    getCurrentUser(): Observable<AuthUser> {

        return this.http.get<AuthUser>(
            `${this.apiUrl}/auth/me`
        ).pipe(

            tap(user => {
                this.authState.setUser(user);
            }),

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );

    }

    //Method to renews the session with the refresh cookie
    refresh(): Observable<AuthUser> {
        return this.http.post<AuthUser>(`${this.apiUrl}/auth/refresh`, {}).pipe(
            tap(user => this.authState.setUser(user))
        );
    }


    //Method to log out
    logout(): Observable<void> {

        return this.http.post<void>(
            `${this.apiUrl}/auth/logout`,
            {}
        ).pipe(

            tap(() => {
                this.authState.clear();
            }),

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );

    }

    //Principal method to translate the error response status with claims
    private parseError(error: HttpErrorResponse): ErrorResponse {

        if (error.error) {
            return error.error as ErrorResponse;
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: 'Ha ocurrido un error inesperado.',
            errors: {}
        };

    }

}


