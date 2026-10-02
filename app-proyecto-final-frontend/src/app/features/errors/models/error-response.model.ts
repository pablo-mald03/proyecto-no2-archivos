/*Error response interface */
export interface ErrorResponse {
  code: string;
  message: string;
  errors: Record<string, string>;
}