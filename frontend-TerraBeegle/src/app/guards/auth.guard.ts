import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

// Allows the route only for logged-in users
// Use it in the routes file like this: canActivate: [authGuard]
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR (Node.js server) localStorage is not available.
  // Let the browser hydration continue, the token lives there.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  alertService.showAlert('Please log in to access this page.');
  return router.createUrlTree(['/login']);
};