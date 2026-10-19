import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { TrashItem } from "../models/trash-item.model";
import { TrashTargetType } from "../constants/trash.constants";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of trash */
export class TrashService {

    //variables to make the http services
    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to list all root deleted items in trash for current user
    getTrashItems(): Observable<TrashItem[]> {
        return this.http.get<TrashItem[]>(
            `${this.apiUrl}/trash`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to send a file or folder to trash
    moveToTrash(type: TrashTargetType, id: string): Observable<void> {
        return this.http.post<void>(
            `${this.apiUrl}/trash/${type}/${id}`,
            {}
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to restore a deleted file or folder batch from trash
    restoreFromTrash(trashBatchId: string): Observable<void> {
        return this.http.patch<void>(
            `${this.apiUrl}/trash/${trashBatchId}/restore`,
            {}
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to permanently delete a file or folder batch
    deletePermanently(trashBatchId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/trash/${trashBatchId}/permanent`
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
