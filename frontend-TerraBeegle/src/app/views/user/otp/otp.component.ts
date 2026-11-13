import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LiquidGlassComponent } from '../../../ui/liquid-glass/liquid-glass.component';
import { SpinnerComponent } from '../../../ui/spinner/spinner.component';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { OtpContext } from '../../../models-services/user.model';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [LiquidGlassComponent, SpinnerComponent, FormsModule],
  template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
        <app-liquid-glass borderRadius="28px" background="rgba(255, 255, 255, 0.22)" [scale]="95">
          <div class="p-4 p-md-5">

            <!-- Dynamic header -->
            <div class="text-center mb-4">
              <h2 class="h3 fw-bold text-dark mb-1">
                {{ is2FA() ? 'Two-Factor Authentication' : 'Verify Your Email' }}
              </h2>
              <p class="text-secondary small mb-0">
                @if (is2FA()) {
                  Enter the 8-character security code sent to your email to verify your login.
                } @else {
                  Enter the 8-character code sent to your email to activate your TerraBeegle account.
                }
              </p>
            </div>

            <!-- Error messages -->
            @if (errorMessage()) {
              <div class="alert alert-danger py-2 px-3 small mb-3 text-center fw-medium border-0" style="border-radius: 12px; background: rgba(239, 68, 68, 0.15); color: #dc2626;">
                {{ errorMessage() }}
              </div>
            }

            <!-- Credentials fallback, if they are lost on refresh during email verification -->
            @if (!is2FA() && (!emailOrUsername() || !password())) {
              <div class="mb-3">
                <label for="identifier" class="form-label fw-semibold small text-dark">Email or Username</label>
                <input
                  type="text"
                  id="identifier"
                  class="form-control glass-input"
                  placeholder="Enter email or username..."
                  [ngModel]="emailOrUsername()"
                  (ngModelChange)="emailOrUsername.set($event)"
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label fw-semibold small text-dark">Password</label>
                <input
                  type="password"
                  id="password"
                  class="form-control glass-input"
                  placeholder="Enter password..."
                  [ngModel]="password()"
                  (ngModelChange)="password.set($event)"
                />
              </div>
            }

            <!-- Campo Codice OTP -->
            <div class="mb-4">
              <label for="otpCode" class="form-label fw-semibold small text-dark">Security Code (OTP)</label>
              <input
                type="text"
                id="otpCode"
                maxlength="8"
                class="form-control glass-input text-center text-uppercase fw-bold fs-4 tracking-wider"
                placeholder="XXXXXXXX"
                [ngModel]="otpCode()"
                (ngModelChange)="otpCode.set($event.toUpperCase())"
                (keydown.enter)="onVerify()"
                autocomplete="one-time-code"
                autofocus
              />
            </div>

            <!-- Verify button -->
            <button
              type="button"
              class="btn btn-primary w-100 py-2 fw-semibold glass-btn d-flex align-items-center justify-content-center gap-2 mb-3"
              [disabled]="otpCode().length !== 8 || isLoading() || (!is2FA() && (!emailOrUsername() || !password()))"
              (click)="onVerify()"
            >
              @if (isLoading()) {
                <app-spinner size="btn" />
              } @else {
                <span>{{ is2FA() ? 'Verify & Login' : 'Activate & Sign In' }}</span>
              }
            </button>

            <!-- Secondary actions (Resend and Back) -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <button
                type="button"
                class="btn btn-link btn-sm text-decoration-none glass-link p-0"
                (click)="onBackToLogin()"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                class="btn btn-link btn-sm text-decoration-none glass-link p-0"
                [disabled]="isLoading() || isResending()"
                (click)="onResend()"
              >
                {{ isResending() ? 'Sending...' : 'Resend code' }}
              </button>
            </div>

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

    .tracking-wider {
      letter-spacing: 0.18em;
      font-family: monospace;
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
      color: #fff;
      transition: all 0.25s ease;
      box-shadow: none !important;
    }

    .glass-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      background: var(--tb-btn-gradient-hover);
      color: #fff;
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
export class OtpComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isLoading = signal(false);
  protected readonly isResending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly infoMessage = signal<string | null>(null);

  protected readonly otpCode = signal('');
  protected readonly is2FA = signal(false);

  protected readonly challengeToken = signal<string | null>(null);
  protected readonly emailOrUsername = signal<string>('');
  protected readonly email = signal<string>('');
  protected readonly password = signal<string>('');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const navHistoryState = typeof window !== 'undefined' && window.history ? (window.history.state as OtpContext) : null;
    const ctx: OtpContext | null = this.authService.pendingOtpContext() || navHistoryState || null;

    if (ctx && (ctx.type === '2fa' || ctx.type === 'email-verification')) {
      this.is2FA.set(ctx.type === '2fa');
      if (ctx.challengeToken) this.challengeToken.set(ctx.challengeToken);
      if (ctx.emailOrUsername) this.emailOrUsername.set(ctx.emailOrUsername);
      if (ctx.email) this.email.set(ctx.email);
      if (ctx.password) this.password.set(ctx.password);
      if (ctx.message) this.infoMessage.set(ctx.message);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onVerify(): void {
    const code = this.otpCode().trim().toUpperCase();
    if (code.length !== 8) {
      this.errorMessage.set('The verification code must be exactly 8 characters.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.is2FA()) {
      const token = this.challengeToken();
      if (!token) {
        this.isLoading.set(false);
        this.errorMessage.set('Login session expired. Please return to login.');
        return;
      }

      this.authService.loginTwoFactor({ challengeToken: token, code }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.authService.clearOtpContext();
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.detail || err.error || 'Invalid or expired security code.');
        },
      });
      return;
    }

    const identifier = this.emailOrUsername();
    const pwd = this.password();

    if (!identifier || !pwd) {
      this.isLoading.set(false);
      this.errorMessage.set('Please provide your username/email and password.');
      return;
    }

    this.authService.login({
      emailOrUsername: identifier,
      password: pwd,
      code,
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.authService.clearOtpContext();
        this.alertService.showSuccess('Account verified and logged in successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || err.error || 'Invalid verification code or credentials.');
      },
    });
  }

  onResend(): void {
    if (this.isLoading() || this.isResending()) return;
    this.isResending.set(true);
    this.errorMessage.set(null);

    if (this.is2FA()) {
      const token = this.challengeToken();
      if (!token) {
        this.isResending.set(false);
        this.errorMessage.set('Session expired. Please log in again.');
        return;
      }

      this.authService.resendTwoFactorCode(token).subscribe({
        next: (msg) => {
          this.isResending.set(false);
          this.infoMessage.set(msg || 'A new security code has been sent to your email.');
        },
        error: (err) => {
          this.isResending.set(false);
          this.errorMessage.set(err.error?.detail || err.error || 'Failed to resend code.');
        },
      });
      return;
    }

    const emailToUse = this.email() || (this.emailOrUsername().includes('@') ? this.emailOrUsername() : '');
    if (!emailToUse) {
      this.isResending.set(false);
      this.errorMessage.set('Email address missing. Please return to login and try again.');
      return;
    }

    this.authService.resendEmail(emailToUse).subscribe({
      next: (msg) => {
        this.isResending.set(false);
        this.infoMessage.set(msg || 'If the account exists and is not verified, a new code has been sent.');
      },
      error: (err) => {
        this.isResending.set(false);
        this.errorMessage.set(err.error?.detail || err.error || 'Failed to resend verification email.');
      },
    });
  }

  onBackToLogin(): void {
    this.authService.clearOtpContext();
    this.router.navigate(['/login']);
  }
}
