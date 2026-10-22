import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { FolderWithMostFilesResponse } from "../models/response/folder-with-most-files-response.model";
import { UserRootFolderSpaceResponse } from "../models/response/user-root-folder-space-response.model";
import { FolderContentReportItemResponse } from "../models/response/folder-content-report-item-response.model";
import { PaginationParams } from "../../report-shared/models/request/pagination-params.model";
import { PaginatedResponse } from "../../report-shared/models/response/paginated-response.model";
import { withPaginationParams } from "../../report-shared/utils/pagination-http-params.util";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of folder reports */
export class ReportFoldersService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to get folders with the most files
    getFoldersWithMostFiles(pagination?: PaginationParams): Observable<PaginatedResponse<FolderWithMostFilesResponse>> {
        return this.http.get<PaginatedResponse<FolderWithMostFilesResponse>>(
            `${this.apiUrl}/reports/folders/most-files`,
            { params: withPaginationParams(pagination) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get space used by root folders of a user
    getUserRootFoldersSpace(userId: string, pagination?: PaginationParams): Observable<PaginatedResponse<UserRootFolderSpaceResponse>> {
        return this.http.get<PaginatedResponse<UserRootFolderSpaceResponse>>(
            `${this.apiUrl}/reports/folders/user-root-folders-space`,
            { params: withPaginationParams(pagination, new HttpParams().set('userId', userId)) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get contents of a selected folder and its subfolders
    getFolderContents(folderId: string, pagination?: PaginationParams): Observable<PaginatedResponse<FolderContentReportItemResponse>> {
        return this.http.get<PaginatedResponse<FolderContentReportItemResponse>>(
            `${this.apiUrl}/reports/folders/contents`,
            { params: withPaginationParams(pagination, new HttpParams().set('folderId', folderId)) }
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
