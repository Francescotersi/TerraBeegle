import { Injectable , inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface RegisterPayload {
  name: string;
  familyName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    familyName: string;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly currentUser = signal<AuthResponse['user'] | null>(null);

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', data).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this.currentUser.set(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}