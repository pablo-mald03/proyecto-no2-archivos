import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { RoleQuery } from "../models/query/role-query.model";
import { catchError, Observable, throwError } from "rxjs";
import { RolePage } from "../models/pagination/role-pagination.model";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { Role } from "../models/role.model";
import { CreateRoleRequest } from "../models/request/create-role-request.model";
import { RolePermissions } from "../models/role-permissions";
import { UpdateRolePermissionsRequest } from "../models/request/update-role-permissions-request";
import { RoleEdit } from "../models/role-edit.model";
import { UpdateRoleRequest } from "../models/request/update-role.model";

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    //variables to make the http services
    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to create a new role
    createRole(request: CreateRoleRequest): Observable<Role> {
        return this.http.post<Role>(
            `${this.apiUrl}/roles`,
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

    //Method to get all pagination roles
    getRoles(query: RoleQuery = {}): Observable<RolePage> {

        let params = new HttpParams();

        if (query.page !== undefined) {
            params = params.set('page', query.page);
        }

        if (query.size !== undefined) {
            params = params.set('size', query.size);
        }

        if (query.sortBy) {
            params = params.set('sortBy', query.sortBy);
        }

        if (query.direction) {
            params = params.set('direction', query.direction);
        }

        return this.http.get<RolePage>(
            `${this.apiUrl}/roles`,
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

    //Method change the role status
    changeStatus(id: string, status: boolean): Observable<void> {
        return this.http.patch<void>(
            `${this.apiUrl}/roles/${id}/status`,
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

    /*Method to get the role permissions */
    getRolePermissions(id: number): Observable<RolePermissions> {
        return this.http.get<RolePermissions>(
            `${this.apiUrl}/roles/${id}/permissions`
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }

    /*Method to update the role permissions */
    updateRolePermissions(
        id: number,
        request: UpdateRolePermissionsRequest
    ): Observable<void> {
        return this.http.put<void>(
            `${this.apiUrl}/roles/${id}/permissions`,
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

    /*Method to find role by id */
    getRoleById(id: number): Observable<RoleEdit> {
        return this.http.get<RoleEdit>(
            `${this.apiUrl}/roles/${id}`
        ).pipe(

            catchError(
                (error: HttpErrorResponse) =>
                    throwError(
                        () => this.parseError(error)
                    )
            )

        );
    }

    /*Method to update role */
    updateRole(id: number, request: UpdateRoleRequest): Observable<void> {
        return this.http.patch<void>(
            `${this.apiUrl}/roles/${id}/role`,
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