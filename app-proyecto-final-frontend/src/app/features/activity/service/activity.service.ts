import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../../../core/config/api.config";
import { LogPage } from "../../logs/models/pagination/log-pagination.model";
import { catchError, Observable, throwError } from "rxjs";
import { ActivityQuery } from "../models/activity-query.model";
import { LogCatalog } from "../../logs/models/query/log-request.model";
import { ErrorResponse } from "../../errors/models/error-response.model";

@Injectable({
  providedIn: 'root'
})
//Activity service class
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  /**
   * Fetch current authenticated user's activity logs
   */
  getMyActivity(query: ActivityQuery = {}): Observable<LogPage> {
    let params = new HttpParams();

    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.size !== undefined) params = params.set('size', query.size);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.direction) params = params.set('direction', query.direction);
    if (query.action) params = params.set('action', query.action);
    if (query.resourceType) params = params.set('resourceType', query.resourceType);
    if (query.resourceId) params = params.set('resourceId', query.resourceId);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);

    return this.http.get<LogPage>(`${this.apiUrl}/activity/me`, { params }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => this.parseError(error)))
    );
  }

  /**
   * Fetch catalog for filter options
   */
  getCatalog(): Observable<LogCatalog> {
    return this.http.get<LogCatalog>(`${this.apiUrl}/activity/drive/catalog`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => this.parseError(error)))
    );
  }

  private parseError(error: HttpErrorResponse): ErrorResponse {
    return error.error || { message: 'Ocurrió un error inesperado al consultar la actividad.' };
  }
}