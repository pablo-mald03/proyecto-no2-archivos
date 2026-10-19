import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { CommentResponse } from "../models/response/comment-response.model";
import { CreateCommentRequest } from "../models/request/create-comment-request.model";
import { UpdateCommentRequest } from "../models/request/update-comment-request.model";

@Injectable({
    providedIn: 'root'
})
/*Service for all endpoints of comments */
export class CommentService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to add a comment or nested reply to a file (requires COMMENTER access)
    createComment(fileId: string, request: CreateCommentRequest): Observable<CommentResponse> {
        return this.http.post<CommentResponse>(
            `${this.apiUrl}/comments/files/${fileId}`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to list threaded comments for a file
    getCommentsByFile(fileId: string): Observable<CommentResponse[]> {
        return this.http.get<CommentResponse[]>(
            `${this.apiUrl}/comments/files/${fileId}`
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to edit comment content
    updateComment(id: string, request: UpdateCommentRequest): Observable<CommentResponse> {
        return this.http.patch<CommentResponse>(
            `${this.apiUrl}/comments/${id}`,
            request
        ).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    //Method to delete a comment
    deleteComment(id: string): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/comments/${id}`
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
