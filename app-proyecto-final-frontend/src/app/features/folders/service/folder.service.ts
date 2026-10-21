import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { CreateFolderRequest } from "../models/request/create-folder-request.model";
import { RenameFolderRequest } from "../models/request/rename-folder-request.model";
import { MoveFolderRequest } from "../models/request/move-folder-request.model";
import { FolderResponse } from "../models/response/folder-response.model";
import { FolderContentResponse } from "../models/response/folder-content-response.model";
import { ListFolderContentQueryParams } from "../models/request/list-folder-content-query.model";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of folders */
export class FolderService {

    //variables to make the http services
    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to create a new folder
    createFolder(request: CreateFolderRequest): Observable<FolderResponse> {
        return this.http.post<FolderResponse>(
            `${this.apiUrl}/folders`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Build query params for folder content listing
    private buildQueryParams(queryParams: ListFolderContentQueryParams = {}): HttpParams {
        let params = new HttpParams()
            .set('page', queryParams.page ?? 0)
            .set('size', queryParams.size ?? 10)
            .set('sortBy', queryParams.sortBy ?? 'name')
            .set('direction', queryParams.direction ?? 'desc');

        if (queryParams.search) params = params.set('search', queryParams.search);
        if (queryParams.type && queryParams.type !== 'ALL') params = params.set('type', queryParams.type);
        if (queryParams.extension) params = params.set('extension', queryParams.extension);

        return params;
    }

    //Method to list contents of the virtual root folder with filters and pagination
    findRootContent(queryParams: ListFolderContentQueryParams = {}): Observable<FolderContentResponse> {
        return this.http.get<FolderContentResponse>(
            `${this.apiUrl}/folders/root`,
            { params: this.buildQueryParams(queryParams) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to list contents of a specific folder with filters and pagination
    findFolderContent(id: string, queryParams: ListFolderContentQueryParams = {}): Observable<FolderContentResponse> {
        return this.http.get<FolderContentResponse>(
            `${this.apiUrl}/folders/${id}/content`,
            { params: this.buildQueryParams(queryParams) }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Unified helper method to get content whether root or specific folder
    getFolderContent(folderId: string | null, queryParams: ListFolderContentQueryParams = {}): Observable<FolderContentResponse> {
        return folderId
            ? this.findFolderContent(folderId, queryParams)
            : this.findRootContent(queryParams);
    }

    //Method to get folder details by id
    getFolderById(id: string): Observable<FolderResponse> {
        return this.http.get<FolderResponse>(
            `${this.apiUrl}/folders/${id}`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to rename a folder
    renameFolder(id: string, request: RenameFolderRequest): Observable<FolderResponse> {
        return this.http.patch<FolderResponse>(
            `${this.apiUrl}/folders/${id}/rename`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to move a folder to another parent
    moveFolder(id: string, request: MoveFolderRequest): Observable<FolderResponse> {
        return this.http.patch<FolderResponse>(
            `${this.apiUrl}/folders/${id}/move`,
            request
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
