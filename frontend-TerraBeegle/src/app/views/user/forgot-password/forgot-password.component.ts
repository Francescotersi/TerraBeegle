import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LiquidGlassComponent } from '../../../ui/liquid-glass/liquid-glass.component';
import { SpinnerComponent } from '../../../ui/spinner/spinner.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, LiquidGlassComponent, SpinnerComponent],
  template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
        <app-liquid-glass borderRadius="28px" background="rgba(255, 255, 255, 0.22)" [scale]="95">
          <div class="p-4 p-md-5">

            <div class="text-center mb-4">
              <h2 class="h3 fw-bold text-dark mb-1">
                {{ step() === 'request' ? 'Forgot Password' : 'Reset Password' }}
              </h2>
              <p class="text-secondary small mb-0">
                @if (step() === 'request') {
                  Enter your email to receive an OTP code
                } @else {
                  Enter the code sent to <span class="fw-semibold text-dark">{{ email }}</span>
                }
              </p>
            </div>

            @if (errorMessage()) {
              <div class="alert alert-danger py-2 px-3 small mb-3 text-center border-0"
                   style="border-radius: 12px; background: rgba(239, 68, 68, 0.15); color: #dc2626;">
                {{ errorMessage() }}
              </div>
            }

            <!-- Richiesta Codice -->
            @if (step() === 'request') {
              <form (submit)="$event.preventDefault(); onRequestCode()">
                <div class="mb-4">
                  <label class="form-label fw-semibold small text-dark">Email</label>
                  <input
                    type="email"
                    class="form-control glass-input"
                    placeholder="name@example.com"
                    [(ngModel)]="email"
                    name="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 fw-semibold glass-btn d-flex align-items-center justify-content-center gap-2 mb-3"
                  [disabled]="!email.trim() || isLoading()"
                >
                  @if (isLoading()) {
                    <app-spinner size="btn" />
                  } @else {
                    <span>Send Code</span>
                  }
                </button>

                <div class="text-center">
                  <a routerLink="/login" class="small glass-link text-decoration-none">← Back to Login</a>
                </div>
              </form>
            }

            <!-- Inserimento Codice e Nuova Password -->
            @else {
              <form (submit)="$event.preventDefault(); onResetPassword()">
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">Code (8 chars)</label>
                  <input
                    type="text"
                    maxlength="8"
                    class="form-control glass-input text-center text-uppercase fw-bold fs-5 tracking-wider"
                    placeholder="XXXXXXXX"
                    [(ngModel)]="code"
                    name="code"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">New Password</label>
                  <input
                    type="password"
                    class="form-control glass-input"
                    placeholder="••••••••"
                    [(ngModel)]="newPassword"
                    name="newPassword"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold small text-dark">Confirm Password</label>
                  <input
                    type="password"
                    class="form-control glass-input"
                    placeholder="••••••••"
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 fw-semibold glass-btn d-flex align-items-center justify-content-center gap-2 mb-3"
                  [disabled]="!isResetValid() || isLoading()"
                >
                  @if (isLoading()) {
                    <app-spinner size="btn" />
                  } @else {
                    <span>Reset Password</span>
                  }
                </button>

                <div class="d-flex justify-content-between align-items-center">
                  <a href="javascript:void(0)" class="small glass-link text-decoration-none" (click)="step.set('request')">
                    ← Re-send code
                  </a>
                  <a routerLink="/login" class="small glass-link text-decoration-none">Back to Login</a>
                </div>
              </form>
            }

          </div>
        </app-liquid-glass>
      </div>
    </div>
  `,
  styles: `
    .min-vh-75 { min-height: 75vh; }
    .tracking-wider { letter-spacing: 0.25em; }
    .glass-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      color: var(--tb-text);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
    }
    .glass-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      outline: none;
      box-shadow: none;
    }
    .glass-btn {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      border-radius: 12px;
    }
    .glass-btn:hover:not(:disabled) {
      background: var(--tb-btn-gradient-hover);
      transform: translateY(-1px);
    }
    .glass-link { color: var(--tb-accent); }
    .glass-link:hover { color: var(--tb-accent-hover); }
  `,
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<'request' | 'reset'>('request');
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  isResetValid(): boolean {
    return (
      !!this.email.trim() &&
      this.code.trim().length === 8 &&
      this.newPassword.length >= 8 &&
      this.newPassword === this.confirmPassword
    );
  }

  onRequestCode(): void {
    if (!this.email.trim() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPasswordRequest(this.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('reset');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || err.error || 'Failed to send reset code.');
      },
    });
  }

  onResetPassword(): void {
    if (!this.isResetValid() || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword({
      emailOrUsername: this.email.trim(),
      code: this.code.trim().toUpperCase(),
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmPassword,
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || err.error || 'Password reset failed.');
      },
    });
  }
}