import { Injectable , inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, RegisterPayload, LoginPayload, AuthResponse, TwoFactorLoginPayload, OtpContext } from '../models/user.model';

export type { User, RegisterPayload, LoginPayload, AuthResponse, TwoFactorLoginPayload, OtpContext } from '../models/user.model';

const TOKEN_KEY = 'tb_token';
const USER_KEY = 'tb_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly pendingOtpContext = signal<OtpContext | null>(null);

  setOtpContext(context: OtpContext): void {
    this.pendingOtpContext.set(context);
  }

  clearOtpContext(): void {
    this.pendingOtpContext.set(null);
  }

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data);
  }

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', data).pipe(
      tap((response) => {
        if (response.token && response.user) {
          this.saveSession(response.token, response.user);
        }
      })
    );
  }

  loginTwoFactor(data: TwoFactorLoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login/2fa', data).pipe(
      tap((response) => {
        if (response.token && response.user) {
          this.saveSession(response.token, response.user);
        }
      })
    );
  }

  resendTwoFactorCode(challengeToken: string): Observable<string> {
    return this.http.post('/api/auth/login/2fa/resend', { challengeToken }, { responseType: 'text' });
  }

  resendEmail(email: string): Observable<string> {
    return this.http.post('/api/auth/resend-email', { email }, { responseType: 'text' });
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ritorna il token JWT dello user loggato
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private saveSession(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  enableTwoFactor(password: string): Observable<string> {
    return this.http.post('/api/users/2fa/enable', { password }, { responseType: 'text' }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          const updatedUser: User = { ...user, twoFactorEnabled: true };
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
          }
          this.currentUser.set(updatedUser);
        }
      })
    );
  }

  disableTwoFactor(password: string): Observable<string> {
    return this.http.post('/api/users/2fa/disable', { password }, { responseType: 'text' }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          const updatedUser: User = { ...user, twoFactorEnabled: false };
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
          }
          this.currentUser.set(updatedUser);
        }
      })
    );
  }
}