import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { PermissionPage } from "../models/permission-pagination.model";
import { catchError, Observable, throwError } from "rxjs";
import { PermissionQuery } from "../models/permission-query.model";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { PermissionCatalog } from "../models/permission-catalog.model";

@Injectable({ providedIn: 'root' })
//Principal permission service
export class PermissionService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = inject(API_URL);

    getPermissions(query: PermissionQuery = {}): Observable<PermissionPage> {

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

        if (query.module) {
            params = params.set('module', query.module);
        }

        if (query.search) {
            params = params.set('search', query.search);
        }

        return this.http.get<PermissionPage>(
            `${this.apiUrl}/permissions`,
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

    //Principal method to fetch the permission catalog
    getCatalog(): Observable<PermissionCatalog> {
        return this.http.get<PermissionCatalog>(
            `${this.apiUrl}/permissions/catalog`
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