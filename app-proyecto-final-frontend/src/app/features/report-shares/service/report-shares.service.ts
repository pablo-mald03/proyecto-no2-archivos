import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { MostSharedFileResponse } from "../models/response/most-shared-file-response.model";
import { SharedByUserItemResponse } from "../models/response/shared-by-user-item-response.model";
import { ReceivedByUserItemResponse } from "../models/response/received-by-user-item-response.model";
import { NeverSharedFileResponse } from "../models/response/never-shared-file-response.model";
import { PaginationParams } from "../../report-shared/models/request/pagination-params.model";
import { PaginatedResponse } from "../../report-shared/models/response/paginated-response.model";
import { withPaginationParams } from "../../report-shared/utils/pagination-http-params.util";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of share reports */
export class ReportSharesService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to get files shared with the most users
    getMostSharedFiles(pagination?: PaginationParams): Observable<PaginatedResponse<MostSharedFileResponse>> {
        return this.http.get<PaginatedResponse<MostSharedFileResponse>>(
            `${this.apiUrl}/reports/shares/most-shared-files`,
            { params: withPaginationParams(pagination) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get resources shared by a selected user
    getSharedByUser(userId: string, pagination?: PaginationParams): Observable<PaginatedResponse<SharedByUserItemResponse>> {
        return this.http.get<PaginatedResponse<SharedByUserItemResponse>>(
            `${this.apiUrl}/reports/shares/shared-by-user`,
            { params: withPaginationParams(pagination, new HttpParams().set('userId', userId)) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get resources received by a selected user
    getReceivedByUser(userId: string, pagination?: PaginationParams): Observable<PaginatedResponse<ReceivedByUserItemResponse>> {
        return this.http.get<PaginatedResponse<ReceivedByUserItemResponse>>(
            `${this.apiUrl}/reports/shares/received-by-user`,
            { params: withPaginationParams(pagination, new HttpParams().set('userId', userId)) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get files that have never been shared
    getNeverSharedFiles(pagination?: PaginationParams): Observable<PaginatedResponse<NeverSharedFileResponse>> {
        return this.http.get<PaginatedResponse<NeverSharedFileResponse>>(
            `${this.apiUrl}/reports/shares/never-shared-files`,
            { params: withPaginationParams(pagination) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
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
