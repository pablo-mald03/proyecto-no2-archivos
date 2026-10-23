import { inject, Injectable } from "@angular/core";
import { ErrorResponse } from "../../errors/models/error-response.model";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { API_URL } from "../../../core/config/api.config";
import { LogQuery } from "../models/query/log-query.model";
import { LogPage } from "../models/pagination/log-pagination.model";
import { catchError, Observable, throwError } from "rxjs";
import { LogCatalog } from "../models/query/log-request.model";

@Injectable({
  providedIn: 'root'
})
//Principal log serice endpoints requests
export class LogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  // Get paginated activity logs with filters.
  getLogs(query: LogQuery = {}): Observable<LogPage> {
    let params = new HttpParams();

    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.size !== undefined) params = params.set('size', query.size);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.direction) params = params.set('direction', query.direction);
    if (query.actorId) params = params.set('actorId', query.actorId);
    if (query.action) params = params.set('action', query.action);
    if (query.resourceType) params = params.set('resourceType', query.resourceType);
    if (query.resourceId) params = params.set('resourceId', query.resourceId);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);

    return this.http.get<LogPage>(
      `${this.apiUrl}/activity`,
      { params }
    ).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => this.parseError(error))
      )
    );
  }

  
  // Get available actions and resource types for filters.
  getCatalog(): Observable<LogCatalog> {
    return this.http.get<LogCatalog>(
      `${this.apiUrl}/activity/catalog`
    ).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => this.parseError(error))
      )
    );
  }

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
