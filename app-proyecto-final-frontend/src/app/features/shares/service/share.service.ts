import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { ShareTargetType } from "../constants/share.constants";
import { ShareResponse } from "../models/response/share-response.model";
import { SharedWithMeItem } from "../models/response/shared-with-me-item.model";
import { ShareResourceRequest } from "../models/request/share-resource-request.model";
import { RevokeShareRequest } from "../models/request/revoke-share-request.model";
import { SharedWithMeQueryParams } from "../models/request/shared-with-me-query.model";
import { PaginatedSharedWithMeResponse } from "../models/response/paginated-shared-with-me-response.model";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of shares */
export class ShareService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to list files and folders directly shared with current user (paginated)
    getSharedWithMe(query: SharedWithMeQueryParams = {}): Observable<PaginatedSharedWithMeResponse> {
        let params = new HttpParams()
            .set('page', String(query.page ?? 0))
            .set('size', String(query.size ?? 15))
            .set('direction', query.direction ?? 'desc');

        if (query.sortBy) params = params.set('sortBy', query.sortBy);
        if (query.search?.trim()) params = params.set('search', query.search.trim());
        if (query.type) params = params.set('type', query.type);
        if (query.extension) params = params.set('extension', query.extension);
        if (query.access) params = params.set('access', query.access);
        if (query.from) params = params.set('from', query.from);
        if (query.to) params = params.set('to', query.to);

        return this.http.get<PaginatedSharedWithMeResponse>(
            `${this.apiUrl}/shares/shared-with-me`,
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to share a file or folder
    shareResource(type: ShareTargetType, id: string, request: ShareResourceRequest): Observable<ShareResponse[]> {
        return this.http.post<ShareResponse[]>(
            `${this.apiUrl}/shares/${type}/${id}`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to list all direct shares on a file or folder
    getResourceShares(type: ShareTargetType, id: string): Observable<ShareResponse[]> {
        return this.http.get<ShareResponse[]>(
            `${this.apiUrl}/shares/${type}/${id}`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to revoke share access for a user or disable ANY_USER link
    revokeShare(type: ShareTargetType, id: string, request: RevokeShareRequest): Observable<void> {
        return this.http.request<void>('delete', `${this.apiUrl}/shares/${type}/${id}`, {
            body: request
        }).pipe(
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
