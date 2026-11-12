import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-profile-email-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="settings-card p-3 p-sm-4 rounded-3 d-flex flex-column gap-3">
      <button type="button" class="profile-toggle" [attr.aria-expanded]="isOpen()"
        (click)="isOpen.update((open) => !open)">
        <span class="d-flex flex-column align-items-start gap-1 text-start">
          <span class="fw-bold text-body">Change email</span>
          <span class="text-body-secondary small">Update the email address linked to your account.</span>
        </span>
        <span class="toggle-icon" [class.open]="isOpen()" aria-hidden="true">&#x25BC;</span>
      </button>

      <div class="dropdown-content" [class.is-open]="isOpen()"
        [attr.aria-hidden]="!isOpen()" [attr.inert]="isOpen() ? null : ''">
        <div class="dropdown-content-inner d-flex flex-column gap-3">
          @if (!verificationPending()) {
            <div class="fields">
              <div>
                <label for="new-email" class="form-label small fw-semibold text-body">New email</label>
                <input id="new-email" type="email" class="form-control settings-input"
                  [(ngModel)]="newEmail" autocomplete="email" />
              </div>
              <div>
                <label for="email-password" class="form-label small fw-semibold text-body">Current password</label>
                <input id="email-password" type="password" class="form-control settings-input"
                  [(ngModel)]="password" autocomplete="current-password" />
              </div>
            </div>
            <button type="button" class="btn btn-confirm align-self-start"
              [disabled]="isLoading()" (click)="requestEmailChange()">
              {{ isLoading() ? 'Sending...' : 'Send verification code' }}
            </button>
          } @else {
            <div>
              <label for="email-code" class="form-label small fw-semibold text-body">Verification code</label>
              <input id="email-code" type="text" class="form-control settings-input"
                [(ngModel)]="verificationCode" maxlength="8" autocomplete="one-time-code"
                placeholder="Enter the 8-character code" />
              <span class="text-body-secondary small">The code was sent to {{ newEmail }}.</span>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <button type="button" class="btn btn-confirm" [disabled]="isLoading()"
                (click)="confirmEmailChange()">
                {{ isLoading() ? 'Confirming...' : 'Confirm email' }}
              </button>
              <button type="button" class="btn btn-cancel" [disabled]="isLoading()"
                (click)="cancelVerification()">Cancel</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .settings-card { background: var(--tb-glass-inner-bg, var(--tb-glass-bg)); border: 1px solid var(--tb-glass-border); border-radius: 16px; }
    :host-context([data-bs-theme="light"]) .settings-card { background: rgba(255, 255, 255, 0.90); border: 1px solid rgba(51, 65, 85, 0.30); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); }
    .profile-toggle { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; padding: 0; background: transparent; border: 0; color: inherit; text-align: left; cursor: pointer; }
    .toggle-icon { color: var(--tb-accent); font-size: .8rem; transition: transform .2s ease; }
    .toggle-icon.open { transform: rotate(180deg); }
    .dropdown-content { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .3s ease, opacity .2s ease; }
    .dropdown-content.is-open { grid-template-rows: 1fr; opacity: 1; }
    .dropdown-content-inner { min-height: 0; overflow: hidden; }
    .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .settings-input { background: var(--tb-input-bg); border: 1px solid var(--tb-input-border); color: var(--bs-body-color); border-radius: 10px; }
    .settings-input:focus { background: var(--tb-input-bg-focus); border-color: var(--tb-accent); color: var(--bs-body-color); box-shadow: none; }
    .btn-confirm { background: var(--tb-btn-gradient); color: #fff; border: 0; border-radius: 10px; font-weight: 600; }
    .btn-cancel { background: transparent; border: 1px solid var(--tb-input-border); color: var(--tb-text-muted); border-radius: 10px; }
    @media (max-width: 576px) { .fields { grid-template-columns: 1fr; } }
  `,
})
export class ProfileEmailSettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  readonly user = this.authService.currentUser;
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly verificationPending = signal(false);
  newEmail = '';
  password = '';
  verificationCode = '';

  requestEmailChange(): void {
    const email = this.newEmail.trim().toLowerCase();
    const currentEmail = this.user()?.email?.toLowerCase();

    if (!email || !this.password) {
      this.alertService.showAlert('New email and current password are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.alertService.showAlert('Please enter a valid email address.');
      return;
    }

    if (currentEmail && email === currentEmail) {
      this.alertService.showAlert('The new email must be different from the current one.');
      return;
    }

    this.isLoading.set(true);
    this.authService.changeEmail({ email, password: this.password }).subscribe({
      next: (message) => {
        this.isLoading.set(false);
        this.newEmail = email;
        this.verificationPending.set(true);
        this.alertService.showSuccess(message || 'Verification code sent to the new email.');
      },
      error: (error) => this.handleError(error, 'Could not request the email change.'),
    });
  }

  confirmEmailChange(): void {
    const code = this.verificationCode.trim().toUpperCase();
    if (code.length !== 8) {
      this.alertService.showAlert('The verification code must be exactly 8 characters.');
      return;
    }

    this.isLoading.set(true);
    this.authService.confirmEmail({ code }, this.newEmail).subscribe({
      next: (message) => {
        this.isLoading.set(false);
        this.verificationPending.set(false);
        this.password = '';
        this.verificationCode = '';
        this.newEmail = '';
        this.alertService.showSuccess(message || 'Email changed successfully.');
      },
      error: (error) => this.handleError(error, 'Could not confirm the email change.'),
    });
  }

  cancelVerification(): void {
    this.verificationPending.set(false);
    this.verificationCode = '';
  }

  private handleError(error: { error?: unknown }, fallback: string): void {
    this.isLoading.set(false);
    let message: string | undefined;

    if (typeof error.error === 'string') {
      try {
        const parsed = JSON.parse(error.error);
        message = parsed.detail || parsed.title || error.error;
      } catch {
        message = error.error;
      }
    } else if (typeof error.error === 'object' && error.error !== null) {
      const errObj = error.error as Record<string, any>;
      message = errObj['detail'] || errObj['title'] || errObj['message'];
    }

    this.alertService.showAlert(message || fallback);
  }
}
