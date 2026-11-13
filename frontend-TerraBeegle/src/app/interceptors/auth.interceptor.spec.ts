import { signal } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

describe('authInterceptor collection sessions', () => {
  let http: HttpClient;
  let requests: HttpTestingController;
  let auth: any;
  let alerts: any;

  beforeEach(() => {
    auth = { currentUser: signal({ id: 7 }), getToken: () => 'test-token', logout: vi.fn() };
    alerts = { showAlert: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: AuthService, useValue: auth },
      { provide: AlertService, useValue: alerts },
    ] });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());

  for (const list of ['favorites', 'wishlist']) {
    for (const path of [`/api/users/7/${list}`, `/api/users/7/${list}/119133`]) {
      it(`clears the stale session when the current account is missing: ${path}`, () => {
        http.post(path, {}).subscribe({ error: () => {} });
        requests.expectOne(path).flush('User not found.', { status: 404, statusText: 'Not Found' });
        expect(auth.logout).toHaveBeenCalledOnce();
        expect(alerts.showAlert).toHaveBeenCalledWith(expect.stringContaining('account is no longer available'));
      });
    }
  }
  it('keeps the session when a game is missing', () => {
    http.post('/api/users/7/favorites/999999999', {}).subscribe({ error: () => {} });
    requests.expectOne('/api/users/7/favorites/999999999')
      .flush('Game not found.', { status: 404, statusText: 'Not Found' });
    expect(auth.logout).not.toHaveBeenCalled();
  });
  it('keeps the session when another user is missing', () => {
    http.get('/api/users/8/wishlist').subscribe({ error: () => {} });
    requests.expectOne('/api/users/8/wishlist')
      .flush('User not found.', { status: 404, statusText: 'Not Found' });
    expect(auth.logout).not.toHaveBeenCalled();
  });
});
