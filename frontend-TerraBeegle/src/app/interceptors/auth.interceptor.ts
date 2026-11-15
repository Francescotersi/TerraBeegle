import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const token = authService.getToken();

  // Intercepts every request and automatically adds the
  // authentication token, if there is one
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const collectionOwner = /^\/api\/users\/(\d+)\/(favorites|wishlist)(?:\/\d+)?$/.exec(req.url);
      const missingSessionUser = error.status === 404
        && error.error === 'User not found.'
        && collectionOwner !== null
        && Number(collectionOwner[1]) === authService.currentUser()?.id;

      if (missingSessionUser) {
        authService.logout();
        alertService.showAlert('Your account is no longer available. Please log in again or create a new account.');
      } else if (error.status === 401 && !req.url.startsWith('/api/auth/login')) {
        authService.logout();
        alertService.showAlert('Please log in to perform this action.');
      }
      return throwError(() => error);
    })
  );
}