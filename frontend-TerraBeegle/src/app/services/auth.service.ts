import { Injectable , inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, RegisterPayload, LoginPayload, AuthResponse } from '../models/user.model';

export type { User, RegisterPayload, LoginPayload, AuthResponse };

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


  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data);
  }

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', data).pipe(
      tap((response) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }
        this.currentUser.set(response.user);
      })
    );
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
}