import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

describe('authGuard', () => {
  let authService: AuthService;
  let alertService: AlertService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    authService = TestBed.inject(AuthService);
    alertService = TestBed.inject(AlertService);
    router = TestBed.inject(Router);
  });

  it('should allow access if user is logged in', () => {
    authService.currentUser.set({
      id: 1,
      name: 'Mario',
      familyName: 'Rossi',
      username: 'mariorossi',
      email: 'mario@example.com',
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(alertService.currentAlert()).toBeNull();
  });

  it('should trigger alert and redirect to /login if user is not logged in', () => {
    authService.currentUser.set(null);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).not.toBe(true);
    expect(alertService.currentAlert()).not.toBeNull();
    expect(alertService.currentAlert()?.message).toBe('Please log in to access this page.');
  });
});
