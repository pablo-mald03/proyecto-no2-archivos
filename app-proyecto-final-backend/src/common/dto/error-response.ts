
//Principal interface to define the error responses (Interceptable)
export interface ErrorResponse {
    code: string;
    message: string;
    errors: Record<string, string>;
}