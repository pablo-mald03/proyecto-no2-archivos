import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { CreateFolderRequest } from "../models/request/create-folder-request.model";
import { RenameFolderRequest } from "../models/request/rename-folder-request.model";
import { MoveFolderRequest } from "../models/request/move-folder-request.model";
import { FolderResponse } from "../models/response/folder-response.model";
import { FolderContentResponse } from "../models/response/folder-content-response.model";

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

    //Method to list contents of the virtual root folder
    findRootContent(): Observable<FolderContentResponse> {
        return this.http.get<FolderContentResponse>(
            `${this.apiUrl}/folders/root`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to list contents of a specific folder
    findFolderContent(id: string): Observable<FolderContentResponse> {
        return this.http.get<FolderContentResponse>(
            `${this.apiUrl}/folders/${id}/content`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
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
