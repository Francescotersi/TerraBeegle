import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// constrolla che tu sia un utente loggato per accede ad un path
// usa dentro il file di routing cosi: canActivate: [authGuard]
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) {
    return true;
  } else {
    return router.navigate(['/login']);
  }
};