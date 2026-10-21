import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse, HttpEvent, HttpParams } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { FileResponse } from "../models/response/file-response.model";
import { UpdateFileContentRequest } from "../models/request/update-file-content-request.model";
import { RenameFileRequest } from "../models/request/rename-file-request.model";
import { MoveFileRequest } from "../models/request/move-file-request.model";
import { RecentFilesParams } from "../models/request/recent-files-params.model";
import { PaginatedFilesResponse } from "../models/response/paginated-files-response.model";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of files */
export class FileService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to upload one or multiple .txt and .md files with progress reporting
    uploadFiles(
        files: File[],
        folderId?: string | null
    ): Observable<HttpEvent<FileResponse[]>> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        const params = (folderId && folderId.trim())
            ? new HttpParams().set('folderId', folderId.trim())
            : undefined;

        return this.http.post<FileResponse[]>(
            `${this.apiUrl}/files/upload`,
            formData,
            {
                params,
                observe: 'events',
                reportProgress: true,
            }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    getRecentFiles(params: RecentFilesParams): Observable<PaginatedFilesResponse> {
        let httpParams = new HttpParams()
            .set('page', params.page)
            .set('size', params.size)
            .set('direction', params.direction);

        if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.extension) httpParams = httpParams.set('extension', params.extension);
        if (params.from) httpParams = httpParams.set('from', params.from);
        if (params.to) httpParams = httpParams.set('to', params.to);

        return this.http.get<PaginatedFilesResponse>(`${this.apiUrl}/files/recent`, {
            params: httpParams
        });
    }



    //Method to upload files using custom FormData
    uploadFormData(formData: FormData): Observable<FileResponse[]> {
        return this.http.post<FileResponse[]>(
            `${this.apiUrl}/files/upload`,
            formData
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get file metadata by ID
    getFileById(id: string): Observable<FileResponse> {
        return this.http.get<FileResponse>(
            `${this.apiUrl}/files/${id}`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to download or stream file content as Blob
    downloadFile(id: string): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/files/${id}/download`,
            { responseType: 'blob' }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to get text content of a file
    getFileContent(id: string): Observable<string> {
        return this.http.get(
            `${this.apiUrl}/files/${id}/download`,
            { responseType: 'text' }
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to update text content of a file
    updateContent(id: string, request: UpdateFileContentRequest): Observable<FileResponse> {
        return this.http.patch<FileResponse>(
            `${this.apiUrl}/files/${id}/content`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to rename a file
    renameFile(id: string, request: RenameFileRequest): Observable<FileResponse> {
        return this.http.patch<FileResponse>(
            `${this.apiUrl}/files/${id}/rename`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to move a file to another folder
    moveFile(id: string, request: MoveFileRequest): Observable<FileResponse> {
        return this.http.patch<FileResponse>(
            `${this.apiUrl}/files/${id}/move`,
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
