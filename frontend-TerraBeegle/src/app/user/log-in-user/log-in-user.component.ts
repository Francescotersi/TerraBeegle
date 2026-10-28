import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';

interface LoginData {
  identifier: string;
  password: string;
}

@Component({
  imports: [FormField, RouterLink, LiquidGlassComponent],
  selector: 'app-log-in-user',
  template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
        
        <app-liquid-glass borderRadius="28px" background="rgba(255, 255, 255, 0.22)" [scale]="95">
          <div class="p-4 p-md-5">
            
            <!-- Intestazione -->
            <div class="text-center mb-4">
              <h2 class="h3 fw-bold text-dark mb-1">Welcome back</h2>
              <p class="text-secondary small mb-0">Login to your TerraBeegle account!</p>
            </div>

            <!-- Form reattivo con Signal Forms -->
            <form (submit)="$event.preventDefault(); onSubmit()">
              
              <div class="mb-3">
                <label for="identifier" class="form-label fw-semibold small text-dark">
                  Username o Email
                </label>
                <input
                  type="text"
                  id="identifier"
                  class="form-control glass-input"
                  placeholder="es. player123 oppure email@example.com"
                  [formField]="loginForm.identifier"
                  [class.is-invalid]="loginForm.identifier().invalid() && loginForm.identifier().touched()"
                />
                @if (loginForm.identifier().invalid() && loginForm.identifier().touched()) {
                  <div class="invalid-feedback fw-medium">
                    Insert Email or Username
                  </div>
                }
              </div>

              <!-- Campo Password -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="password" class="form-label fw-semibold small text-dark mb-0">Password</label>
                  <a routerLink="/forgot-password" class="small text-decoration-none glass-link">
                   Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  class="form-control glass-input"
                  placeholder="••••••••"
                  [formField]="loginForm.password"
                  [class.is-invalid]="loginForm.password().invalid() && loginForm.password().touched()"
                />
                @if (loginForm.password().invalid() && loginForm.password().touched()) {
                  <div class="invalid-feedback fw-medium">
                    Password must be at least 6 characters long.
                  </div>
                }
              </div>

              <!-- Errore credenziali -->
              @if (errorMessage()) {
                <div class="alert alert-danger py-2 px-3 small mb-3 text-center fw-medium border-0 shadow-sm" style="border-radius: 12px; background: rgba(239, 68, 68, 0.15); color: #dc2626;">
                  {{ errorMessage() }}
                </div>
              }

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold glass-btn shadow-sm"
                [disabled]="loginForm().invalid() || isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                } @else {
                  Login
                }
              </button>

              <div class="text-center mt-4">
                <span class="small text-muted">You don't have an account? </span>
                <a routerLink="/register" class="small fw-semibold glass-link text-decoration-none">
                  Register
                </a>
              </div>

            </form>

          </div>
        </app-liquid-glass>

      </div>
    </div>
  `,
  styles: `
    .min-vh-75 {
      min-height: 75vh;
    }

    .glass-input {
      background: rgba(255, 255, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.8);
      color: #0f172a;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      transition: all 0.25s ease;
    }

    .glass-input::placeholder {
      color: #94a3b8;
    }

    .glass-input:focus {
      background: rgba(255, 255, 255, 0.75);
      border-color: #f472b6;
      box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.22);
      outline: none;
    }

    .glass-btn {
      background: linear-gradient(135deg, #fb7185 0%, #f472b6 100%);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 12px;
      transition: all 0.25s ease;
    }

    .glass-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(244, 114, 182, 0.4) !important;
      background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
    }

    .glass-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .glass-link {
      color: #db2777;
      transition: color 0.2s ease;
    }

    .glass-link:hover {
      color: #be185d;
      text-decoration: underline !important;
    }
  `,
})
export class LogInUser {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null)
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly loginModel = signal<LoginData>({
    identifier: '',
    password: '',
  });

  protected readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.identifier, {message: 'Insert Email or Username'});
    minLength(schema.identifier, 1, {message: 'Insert Email or Username'});

    required(schema.password, {message: 'Password is required'});
    minLength(schema.password, 8, {message: 'Password must be at least 8 characters long'});
  });

  protected onSubmit(): void {
    if (this.loginForm().invalid() || this.isLoading()) {
      return;
    }
    const data = this.loginModel();
    console.log('Dati di login pronti per il backend .NET:', data);
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService.login({
      emailOrUsername: data.identifier,
      password: data.password
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Login was successful', response);
        console.log('Dati utente:', response.user);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.detail || 'Login failed. Please check your credentials.');
        console.error('Login error:', error);
      }
    });
  }
}
