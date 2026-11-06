import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

// controlla che tu sia un utente loggato per accedere ad un path
// usa dentro il file di routing cosi: canActivate: [authGuard]
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // In ambiente SSR (server Node.js), localStorage non è accessibile.
  // Lasciamo procedere l'idratazione iniziale lato browser dove risiede il token.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  alertService.showAlert('Please log in to access this page.');
  return router.createUrlTree(['/login']);
};