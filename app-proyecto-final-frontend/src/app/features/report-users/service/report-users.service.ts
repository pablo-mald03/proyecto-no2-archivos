import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { TopUsersReportParams } from "../models/request/top-users-report-params.model";
import { TopUserByFileCountResponse } from "../models/response/top-user-by-file-count-response.model";
import { TopUserByStorageResponse } from "../models/response/top-user-by-storage-response.model";
import { UserStoragePercentageResponse } from "../models/response/user-storage-percentage-response.model";
import { UserShareCountResponse } from "../models/response/user-share-count-response.model";
import { PaginationParams } from "../../report-shared/models/request/pagination-params.model";
import { PaginatedResponse } from "../../report-shared/models/response/paginated-response.model";
import { withPaginationParams } from "../../report-shared/utils/pagination-http-params.util";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of user reports */
export class ReportUsersService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to get the top 10 users with the most files
    getTopByFileCount(params?: TopUsersReportParams): Observable<TopUserByFileCountResponse[]> {
        return this.http.get<TopUserByFileCountResponse[]>(
            `${this.apiUrl}/reports/users/top-file-count`,
            { params: this.buildTopUsersParams(params) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get the top 10 users with the most storage used
    getTopByStorageUsed(params?: TopUsersReportParams): Observable<TopUserByStorageResponse[]> {
        return this.http.get<TopUserByStorageResponse[]>(
            `${this.apiUrl}/reports/users/top-storage-used`,
            { params: this.buildTopUsersParams(params) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get the storage percentage used by each user
    getStoragePercentage(pagination?: PaginationParams): Observable<PaginatedResponse<UserStoragePercentageResponse>> {
        return this.http.get<PaginatedResponse<UserStoragePercentageResponse>>(
            `${this.apiUrl}/reports/users/storage-percentage`,
            { params: withPaginationParams(pagination) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get the share count of each user
    getShareCount(pagination?: PaginationParams): Observable<PaginatedResponse<UserShareCountResponse>> {
        return this.http.get<PaginatedResponse<UserShareCountResponse>>(
            `${this.apiUrl}/reports/users/share-count`,
            { params: withPaginationParams(pagination) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to build the query params of the top users reports
    private buildTopUsersParams(params?: TopUsersReportParams): HttpParams {
        let httpParams = new HttpParams();

        if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
        if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);
        if (params?.search) httpParams = httpParams.set('search', params.search);

        return httpParams;
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
