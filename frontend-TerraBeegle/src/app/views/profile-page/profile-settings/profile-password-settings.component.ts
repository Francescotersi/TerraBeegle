import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-profile-password-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="settings-card p-3 p-sm-4 rounded-3 d-flex flex-column gap-3">
      <button type="button" class="profile-toggle" [attr.aria-expanded]="isOpen()"
        (click)="isOpen.update((open) => !open)">
        <span class="d-flex flex-column align-items-start gap-1 text-start">
          <span class="fw-bold text-body">Change password</span>
          <span class="text-body-secondary small">Choose a new password for your account.</span>
        </span>
        <span class="toggle-icon" [class.open]="isOpen()" aria-hidden="true">&#x25BC;</span>
      </button>

      <div class="dropdown-content" [class.is-open]="isOpen()"
        [attr.aria-hidden]="!isOpen()" [attr.inert]="isOpen() ? null : ''">
        <div class="dropdown-content-inner d-flex flex-column gap-3">
          <div class="fields">
            <div>
              <label for="old-password" class="form-label small fw-semibold text-body">Current password</label>
              <input id="old-password" type="password" class="form-control settings-input"
                [(ngModel)]="oldPassword" autocomplete="current-password" />
            </div>
            <div>
              <label for="new-password" class="form-label small fw-semibold text-body">New password</label>
              <input id="new-password" type="password" class="form-control settings-input"
                [(ngModel)]="newPassword" autocomplete="new-password" />
            </div>
            <div>
              <label for="confirm-password" class="form-label small fw-semibold text-body">Confirm new password</label>
              <input id="confirm-password" type="password" class="form-control settings-input"
                [(ngModel)]="confirmNewPassword" autocomplete="new-password" />
            </div>
          </div>
          <span class="text-body-secondary small">
            Use at least 8 characters, including uppercase, lowercase, a number and a special character.
          </span>
          <button type="button" class="btn btn-confirm align-self-start"
            [disabled]="isLoading()" (click)="savePassword()">
            {{ isLoading() ? 'Saving...' : 'Change password' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .settings-card { background: var(--tb-glass-bg); border: 1px solid var(--tb-glass-border); border-radius: 16px; }
    .profile-toggle { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; padding: 0; background: transparent; border: 0; color: inherit; text-align: left; cursor: pointer; }
    .toggle-icon { color: var(--tb-accent); font-size: .8rem; transition: transform .2s ease; }
    .toggle-icon.open { transform: rotate(180deg); }
    .dropdown-content { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .3s ease, opacity .2s ease; }
    .dropdown-content.is-open { grid-template-rows: 1fr; opacity: 1; }
    .dropdown-content-inner { min-height: 0; overflow: hidden; }
    .fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
    .settings-input { background: var(--tb-input-bg); border: 1px solid var(--tb-input-border); color: var(--bs-body-color); border-radius: 10px; }
    .settings-input:focus { background: var(--tb-input-bg-focus); border-color: var(--tb-accent); color: var(--bs-body-color); box-shadow: none; }
    .btn-confirm { background: var(--tb-btn-gradient); color: #fff; border: 0; border-radius: 10px; font-weight: 600; }
    @media (max-width: 768px) { .fields { grid-template-columns: 1fr; } }
  `,
})
export class ProfilePasswordSettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  savePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      this.alertService.showAlert('All password fields are required.');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.alertService.showAlert('The new password and confirmation password do not match.');
      return;
    }

    this.isLoading.set(true);
    this.authService.changePassword({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword,
    }).subscribe({
      next: (message) => {
        this.isLoading.set(false);
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.isOpen.set(false);
        this.alertService.showAlert(message || 'Password changed successfully.');
      },
      error: (error: { error?: unknown }) => {
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
        this.alertService.showAlert(message || 'Could not change the password.');
      },
    });
  }
}
