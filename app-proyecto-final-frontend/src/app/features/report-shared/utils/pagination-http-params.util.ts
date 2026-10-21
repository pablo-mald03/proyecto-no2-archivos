import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '../models/request/pagination-params.model';

//Appends the optional pagination params (page, size) to an HttpParams instance
export function withPaginationParams(
  pagination?: PaginationParams,
  base: HttpParams = new HttpParams()
): HttpParams {
  let httpParams = base;

  if (pagination?.page !== undefined) httpParams = httpParams.set('page', pagination.page);
  if (pagination?.size !== undefined) httpParams = httpParams.set('size', pagination.size);

  return httpParams;
}
