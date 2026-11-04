import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// constrolla che tu sia un utente loggato per accede ad un path
// usa dentro il file di routing cosi: canActivate: [authGuard]
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
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

  return router.createUrlTree(['/login']);
};