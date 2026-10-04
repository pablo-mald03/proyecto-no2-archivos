import { catchError, Observable, throwError } from "rxjs";
import { RecoverPasswordRequest } from "../models/request/recover-password-request.model";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { UserQuery } from "../models/query/user-query.model";
import { UserPage } from "../models/pagination/user-pagination.model";
import { RegisterUserRequest } from "../models/request/register-user-request.model";
import { RegisterUserResponse } from "../models/response/register-user-response.model";
import { User } from "../models/user.model";
import { UpdateUserRequest } from "../models/request/update-user-request.model";
import { UpdateUserRolesRequest } from "../models/request/update-user-roles-request.model";
import { UserRoleAssignment } from "../models/request/user-role-assignment.model";
import { UserProfile } from "../models/user-profile.model";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of users */
export class UserService {

    //variables to make the http services
    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);


    //User profile query
    getUserProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(
            `${this.apiUrl}/users/profile`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }


    /*Get all users query request endpoint*/
    getUsers(query: UserQuery = {}): Observable<UserPage> {

        let params = new HttpParams();

        if (query.page !== undefined) {
            params = params.set(
                'page',
                query.page
            );
        }

        if (query.size !== undefined) {
            params = params.set(
                'size',
                query.size
            );
        }

        if (query.sortBy) {
            params = params.set(
                'sortBy',
                query.sortBy
            );
        }

        if (query.direction) {
            params = params.set(
                'direction',
                query.direction
            );
        }

        return this.http.get<UserPage>(
            `${this.apiUrl}/users`,
            { params }
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }

    //Register user endpoint request
    registerUser(request: RegisterUserRequest): Observable<RegisterUserResponse> {

        return this.http.post<RegisterUserResponse>(
            `${this.apiUrl}/users/register`,
            request
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );

    }


    //Recover password endpoint request
    recoverPassword(request: RecoverPasswordRequest): Observable<void> {

        return this.http.post<void>(
            `${this.apiUrl}/users/recover-password`,
            request
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );

    }


    //Principal disable/enable status for users endpoint
    changeStatus(id: string, status: boolean): Observable<void> {
        return this.http.patch<void>(
            `${this.apiUrl}/users/${id}/status`,
            { status }
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }

    //Principal method to find user by id
    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }

    //Principal method to update user
    updateUser(id: string, request: UpdateUserRequest): Observable<User> {
        return this.http.patch<User>(
            `${this.apiUrl}/users/${id}`,
            request
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }

    //Principal method to get the user roles
    getUserRoles(id: string): Observable<UserRoleAssignment> {
        return this.http.get<UserRoleAssignment>(
            `${this.apiUrl}/users/${id}/roles`
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }


    //Principal method to update the user roles
    updateUserRoles(id: string, request: UpdateUserRolesRequest
    ): Observable<void> {
        return this.http.put<void>(
            `${this.apiUrl}/users/${id}/roles`,
            request
        ).pipe(

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