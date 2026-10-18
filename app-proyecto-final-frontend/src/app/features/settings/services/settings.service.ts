import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { catchError, Observable, throwError } from "rxjs";
import { SystemSetting } from "../models/setting.model";
import { UpdateSettingRequest } from "../models/update-setting-request.model";

@Injectable({
    providedIn: 'root'
})

/*Principal iva service */
export class SettingsService {

    // Variables to make http requests
    private readonly http = inject(HttpClient);
    private readonly apiUrl = inject(API_URL);

    /**
     * Fetch all general rules/settings of the system
     */
    getSettings(): Observable<SystemSetting[]> {
        return this.http.get<SystemSetting[]>(`${this.apiUrl}/settings`).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    /**
     * Update the value of a specific system setting rule by its key
     */
    updateSetting(key: string, request: UpdateSettingRequest): Observable<SystemSetting> {
        return this.http.patch<SystemSetting>(`${this.apiUrl}/settings/${key}`, request).pipe(
            catchError((error: HttpErrorResponse) =>
                throwError(() => this.parseError(error))
            )
        );
    }

    /**
     * Principal method to translate the error response status with claims
     */
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