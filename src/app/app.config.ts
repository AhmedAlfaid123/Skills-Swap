import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    { provide: API_BASE_URL, useValue: 'http://localhost:5000/api' }
  ]
};
