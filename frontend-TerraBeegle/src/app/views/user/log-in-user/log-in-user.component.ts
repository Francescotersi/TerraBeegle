import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { LiquidGlassComponent } from '../../../ui/liquid-glass/liquid-glass.component';
import { SpinnerComponent } from '../../../ui/spinner/spinner.component';
import { AuthService } from '../../../services/auth.service';

interface LoginData {
  identifier: string;
  password: string;
}

@Component({
  imports: [FormField, RouterLink, LiquidGlassComponent, SpinnerComponent],
  selector: 'app-log-in-user',
  template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
        
        <app-liquid-glass borderRadius="28px" background="rgba(255, 255, 255, 0.22)" [scale]="95">
          <div class="p-4 p-md-5">

            <!-- Header -->
            <div class="text-center mb-4">
              <h2 class="h3 fw-bold text-dark mb-1">Welcome back</h2>
              <p class="text-secondary small mb-0">Login to your TerraBeegle account!</p>
            </div>

            <!-- Reactive form with Signal Forms -->
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
                    Password must be at least 8 characters long.
                  </div>
                }
              </div>

              <!-- Credentials error -->
              @if (errorMessage()) {
                <div class="alert alert-danger py-2 px-3 small mb-3 text-center fw-medium border-0 shadow-sm" style="border-radius: 12px; background: rgba(239, 68, 68, 0.15); color: #dc2626;">
                  {{ errorMessage() }}
                </div>
              }

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold glass-btn shadow-sm d-flex align-items-center justify-content-center gap-2"
                [disabled]="loginForm().invalid() || isLoading()"
              >
                @if (isLoading()) {
                  <app-spinner size="btn" />
                } @else {
                  <span>Login</span>
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
    :host {
      display: block;
      width: 100%;
    }

    .min-vh-75 {
      min-height: 75vh;
    }

    .glass-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      color: var(--tb-text);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      transition: all 0.25s ease;
      box-shadow: none !important;
    }

    .glass-input::placeholder {
      color: var(--tb-text-muted);
    }

    .glass-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      color: var(--tb-text);
      outline: none;
      box-shadow: none !important;
    }

    .glass-btn {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      border-radius: 12px;
      transition: all 0.25s ease;
      box-shadow: none !important;
    }

    .glass-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      background: var(--tb-btn-gradient-hover);
      box-shadow: none !important;
    }

    .glass-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .glass-link {
      color: var(--tb-accent);
      transition: color 0.2s ease;
    }

    .glass-link:hover {
      color: var(--tb-accent-hover);
      text-decoration: underline !important;
    }
  `,
})
export class LogInUser {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly loginModel = signal<LoginData>({
    identifier: '',
    password: '',
  });

  protected readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.identifier, { message: 'Insert Email or Username' });
    minLength(schema.identifier, 1, { message: 'Insert Email or Username' });

    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 8, { message: 'Password must be at least 8 characters long' });
  });

  protected onSubmit(): void {
    if (this.loginForm().invalid() || this.isLoading()) {
      return;
    }
    const data = this.loginModel();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login({
        emailOrUsername: data.identifier,
        password: data.password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);

          // If the backend asks for 2FA:
          if (response.requires2FA && response.challengeToken) {
            this.authService.setOtpContext({
              type: '2fa',
              challengeToken: response.challengeToken,
              message: 'A security code has been sent to your email.',
            });
            this.router.navigate(['/otp'], {
              state: {
                type: '2fa',
                challengeToken: response.challengeToken,
                message: 'A security code has been sent to your email.',
              }
            });
            return;
          }

          // Without 2FA the user is already authenticated
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading.set(false);

          // If the email is not verified (403 Forbidden):
          if (error.status === 403) {
            this.authService.setOtpContext({
              type: 'email-verification',
              emailOrUsername: data.identifier,
              password: data.password,
              message: 'Your email is not verified yet. Enter the 8-character code sent to your email.',
            });
            this.router.navigate(['/otp'], {
              state: {
                type: 'email-verification',
                emailOrUsername: data.identifier,
                password: data.password,
                message: 'Your email is not verified yet. Enter the 8-character code sent to your email.',
              }
            });
            return;
          }

          this.errorMessage.set(error.error?.detail || error.error || 'Login failed. Please check your credentials.');
        },
      });
  }
}
