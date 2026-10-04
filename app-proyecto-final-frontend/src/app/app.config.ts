import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { API_URL } from './core/config/api.config';
import { environment } from '../environments/environment';
import { AuthService } from './features/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';


//Principal app configuration
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),
    //Allows the interceptor client (for the requests)
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor,
        refreshInterceptor,
      ])
    ),
    //BASE API URL
    {
      provide: API_URL,
      useValue: environment.apiUrl
    },

    //Principal app initializer (Verify jwt)
    provideAppInitializer(() => {

      const authService = inject(AuthService);

      return firstValueFrom(
        authService.getCurrentUser()
      ).catch(() => {
        // Valid session doesn't exists
      });

    })
  ]
};
