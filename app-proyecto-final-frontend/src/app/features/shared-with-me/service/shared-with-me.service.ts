import { catchError, Observable, throwError } from "rxjs";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { SharedWithMeItem } from "../models/shared-with-me-item.model";

@Injectable({
    providedIn: 'root'
})
/*Service for shared-with-me resource queries */
export class SharedWithMeService {

    //variables to make the http services
    private readonly http = inject(HttpClient);

    private readonly apiUrl = inject(API_URL);

    //Method to list files and folders directly shared with current user
    getSharedWithMe(): Observable<SharedWithMeItem[]> {
        return this.http.get<SharedWithMeItem[]>(
            `${this.apiUrl}/shares/shared-with-me`
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
