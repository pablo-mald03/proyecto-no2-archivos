import { inject, Injectable } from "@angular/core";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { API_URL } from "../../../core/config/api.config";
import { LogQuery } from "../models/query/log-query.model";
import { LogPage } from "../models/pagination/log-pagination.model";
import { catchError, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
//Principal log serice endpoints requests
export class LogService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to get all pagination logs
    getLogs(query: LogQuery = {}): Observable<LogPage> {

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

        if (query.createdFrom) {
            params = params.set('createdFrom', query.createdFrom);
        }

        if (query.createdTo) {
            params = params.set('createdTo', query.createdTo);
        }

        return this.http.get<LogPage>(
            `${this.apiUrl}/activity`,
            { params }
        ).pipe(
            catchError(
                (error: HttpErrorResponse) =>
                    throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get the available log modules to feed the filter dropdown
    getModules(): Observable<string[]> {
        return this.http.get<string[]>(
            `${this.apiUrl}/activity/modules`
        ).pipe(
            catchError(
                (error: HttpErrorResponse) =>
                    throwError(() => this.parseError(error))
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