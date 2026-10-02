import { HttpInterceptorFn } from "@angular/common/http";

//Principal interceptor to check if the cookie JWT is active
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {

    return next(
        req.clone({
            withCredentials: true
        })
    );

};