import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="settings-container d-flex flex-column gap-3 py-2">
      <!-- Informatii profil -->
      <div class="settings-card p-3 p-sm-4 rounded-3 d-flex flex-column gap-3">
        <button
          type="button"
          class="profile-toggle"
          [attr.aria-expanded]="isProfileFormOpen()"
          aria-controls="profile-information-form"
          (click)="toggleProfileForm()"
        >
          <span class="d-flex flex-column align-items-start gap-1 text-start">
            <span class="fw-bold text-body">Profile information</span>
            <span class="text-body-secondary small">
              Update the information displayed on your TerraBeegle profile.
            </span>
          </span>
          <span class="profile-toggle-icon" [class.open]="isProfileFormOpen()" aria-hidden="true">
            &#x25BC;
          </span>
        </button>

        <div
          id="profile-information-form"
          class="dropdown-content"
          [class.is-open]="isProfileFormOpen()"
          [attr.aria-hidden]="!isProfileFormOpen()"
          [attr.inert]="isProfileFormOpen() ? null : ''"
        >
          <div class="dropdown-content-inner profile-form d-flex flex-column gap-3">
            <div class="profile-fields">
          <div class="profile-field">
            <label for="profile-name" class="form-label small fw-semibold text-body">Name</label>
            <input
              id="profile-name"
              type="text"
              class="form-control settings-input"
              placeholder="{{ this.name }}"
              maxlength="100"
              autocomplete="given-name"
            />
          </div>

          <div class="profile-field">
            <label for="profile-family-name" class="form-label small fw-semibold text-body">Family name</label>
            <input
              id="profile-family-name"
              type="text"
              class="form-control settings-input"
              placeholder="{{ this.familyName }}"
              maxlength="100"
              autocomplete="family-name"
            />
          </div>

          <div class="profile-field">
            <label for="profile-username" class="form-label small fw-semibold text-body">Username</label>
            <input
              id="profile-username"
              type="text"
              class="form-control settings-input"
              placeholder="{{ this.username }}"
              maxlength="100"
              autocomplete="username"
            />
          </div>

          <div class="profile-field">
            <label for="profile-image" class="form-label small fw-semibold text-body">Profile image URL</label>
            <input
              id="profile-image"
              type="url"
              class="form-control settings-input"
              placeholder="https://example.com/image.jpg"
              autocomplete="url"
            />
          </div>
            </div>

            <button
              type="button"
              class="btn btn-confirm align-self-start"
              [disabled]="isProfileLoading()"
              (click)="saveProfile()"
            >
              {{ isProfileLoading() ? 'Saving...' : 'Save profile' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sezione 2FA -->
      <div class="settings-card p-3 p-sm-4 rounded-3 d-flex flex-column gap-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex flex-column gap-1">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-body">Two-Factor Authentication (2FA)</span>
              @if (is2faEnabled()) {
                <span class="badge-status badge-enabled">Enabled</span>
              } @else {
                <span class="badge-status badge-disabled">Disabled</span>
              }
            </div>
            <span class="text-body-secondary small">
              Receive an 8-character security code via email each time you log in to protect your account.
            </span>
          </div>

          <button
            type="button"
            class="btn btn-sm action-btn"
            [class.btn-action-disable]="is2faEnabled()"
            [class.btn-action-enable]="!is2faEnabled()"
            (click)="togglePasswordBox()"
          >
            {{ is2faEnabled() ? 'Disable' : 'Enable' }}
          </button>
        </div>

        <!-- Box inserimento Password per conferma -->
        <div
          class="dropdown-content"
          [class.is-open]="showPasswordBox()"
          [attr.aria-hidden]="!showPasswordBox()"
          [attr.inert]="showPasswordBox() ? null : ''"
        >
          <div class="dropdown-content-inner">
            <div class="password-box p-3 rounded-3 d-flex flex-column gap-2">
              <span class="small fw-semibold text-body">
                Confirm your password to {{ is2faEnabled() ? 'disable' : 'enable' }} 2FA:
              </span>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <input
                  type="password"
                  class="form-control form-control-sm settings-input"
                  placeholder="Enter password..."
                  [(ngModel)]="confirmPassword"
                  (keydown.enter)="onConfirm2FA()"
                />
                <button
                  class="btn btn-sm btn-confirm text-nowrap"
                  [disabled]="!confirmPassword || isLoading()"
                  (click)="onConfirm2FA()"
                >
                  {{ isLoading() ? 'Saving...' : 'Confirm' }}
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-cancel text-nowrap"
                  (click)="cancelPasswordBox()"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .settings-card {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-glass-border);
      border-radius: 16px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: background 0.25s ease, border-color 0.25s ease;
    }

    .profile-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .profile-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 0;
      background: transparent;
      border: 0;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }

    .profile-toggle:focus-visible {
      outline: 2px solid var(--tb-accent);
      outline-offset: 4px;
      border-radius: 6px;
    }

    .profile-toggle-icon {
      color: var(--tb-accent);
      font-size: 0.8rem;
      transition: transform 0.2s ease;
    }

    .profile-toggle-icon.open {
      transform: rotate(180deg);
    }

    .profile-field {
      min-width: 0;
    }

    .dropdown-content {
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      transition: grid-template-rows 0.3s ease, opacity 0.2s ease;
    }

    .dropdown-content.is-open {
      grid-template-rows: 1fr;
      opacity: 1;
    }

    .dropdown-content-inner {
      min-height: 0;
      overflow: hidden;
    }

    .badge-status {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      line-height: 1;
    }

    .badge-enabled {
      background: rgba(34, 197, 94, 0.15);
      color: #15803d;
      border: 1px solid rgba(34, 197, 94, 0.35);
    }

    .badge-disabled {
      background: rgba(100, 116, 139, 0.12);
      color: #64748b;
      border: 1px solid rgba(100, 116, 139, 0.25);
    }

    :host-context([data-bs-theme="dark"]) .badge-enabled {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.4);
    }

    :host-context([data-bs-theme="dark"]) .badge-disabled {
      background: rgba(140, 163, 199, 0.15);
      color: #8ca3c7;
      border: 1px solid rgba(140, 163, 199, 0.3);
    }

    .action-btn {
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.4rem 1.1rem;
      border-radius: 10px;
      transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
    }

    .action-btn:focus,
    .action-btn:active {
      outline: none !important;
    }

    .btn-action-enable {
      background: var(--tb-btn-gradient);
      color: #ffffff;
      border: 1px solid transparent;
    }

    .btn-action-enable:hover:not(:disabled) {
      background: var(--tb-btn-gradient-hover);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-action-disable {
      background: transparent;
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.5);
    }

    .btn-action-disable:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.12);
      border-color: #ef4444;
      color: #dc2626;
      transform: translateY(-1px);
    }

    :host-context([data-bs-theme="dark"]) .btn-action-disable {
      color: #f87171;
      border-color: rgba(248, 113, 113, 0.5);
    }

    :host-context([data-bs-theme="dark"]) .btn-action-disable:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: #f87171;
      color: #fca5a5;
    }

    .password-box {
      background: var(--tb-accent-subtle);
      border: 1px solid var(--tb-glass-border);
      border-radius: 12px;
    }

    .settings-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      color: var(--bs-body-color);
      border-radius: 10px;
      padding: 0.45rem 0.75rem;
      max-width: 220px;
      outline: none !important;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .profile-field .settings-input {
      width: 100%;
      max-width: none;
    }

    .settings-input::placeholder {
      color: var(--tb-text-muted);
      opacity: 0.7;
    }

    .settings-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      color: var(--bs-body-color);
      outline: none !important;
    }

    .btn-confirm {
      background: var(--tb-btn-gradient);
      color: #ffffff;
      border: 1px solid transparent;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.45rem 1rem;
      transition: background 0.2s ease, transform 0.15s ease, opacity 0.2s ease;
    }

    .btn-confirm:hover:not(:disabled) {
      background: var(--tb-btn-gradient-hover);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-confirm:focus,
    .btn-confirm:active {
      outline: none !important;
    }

    .btn-confirm:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid var(--tb-input-border);
      color: var(--tb-text-muted);
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.45rem 1rem;
      transition: all 0.2s ease;
    }

    .btn-cancel:hover {
      background: var(--tb-accent-subtle);
      border-color: var(--tb-accent);
      color: var(--tb-text);
      transform: translateY(-1px);
    }

    .btn-cancel:focus,
    .btn-cancel:active {
      outline: none !important;
    }

    @media (max-width: 576px) {
      .profile-fields {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ProfileSettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  readonly user = this.authService.currentUser;
  readonly is2faEnabled = () => !!this.user()?.twoFactorEnabled;

  isProfileFormOpen = signal(false);
  showPasswordBox = signal(false);
  isLoading = signal(false);
  isProfileLoading = signal(false);
  name = this.user()?.name ?? '';
  familyName = this.user()?.familyName ?? '';
  username = this.user()?.username ?? '';
  imageProfile = this.user()?.imageProfile ?? '';
  confirmPassword = '';

  toggleProfileForm(): void {
    this.isProfileFormOpen.update((isOpen) => !isOpen);
  }

  saveProfile(): void {
    const name = this.name.trim();
    const familyName = this.familyName.trim();
    const username = this.username.trim();
    const imageProfile = this.imageProfile.trim();

    if (!name || !familyName || !username) {
      this.alertService.showAlert('Name, family name and username are required.');
      return;
    }

    this.isProfileLoading.set(true);
    this.authService.updateUser({
      name,
      familyName,
      username,
      imageProfile: imageProfile || null,
    }).subscribe({
      next: () => {
        this.isProfileLoading.set(false);
        this.name = name;
        this.familyName = familyName;
        this.username = username;
        this.imageProfile = imageProfile;
        this.alertService.showAlert('Profile updated successfully.');
      },
      error: (error) => {
        this.isProfileLoading.set(false);
        const message = error.error?.detail || error.error;
        this.alertService.showAlert(
          typeof message === 'string' ? message : 'Could not update profile.'
        );
      },
    });
  }

  togglePasswordBox(): void {
    this.showPasswordBox.update((v) => !v);
    this.confirmPassword = '';
  }

  cancelPasswordBox(): void {
    this.showPasswordBox.set(false);
    this.confirmPassword = '';
  }

  onConfirm2FA(): void {
    if (!this.confirmPassword) return;

    this.isLoading.set(true);
    const action$: Observable<string> = this.is2faEnabled()
      ? this.authService.disableTwoFactor(this.confirmPassword)
      : this.authService.enableTwoFactor(this.confirmPassword);

    action$.subscribe({
      next: (msg: string) => {
        this.isLoading.set(false);
        this.showPasswordBox.set(false);
        this.confirmPassword = '';
        this.alertService.showAlert(msg || '2FA settings updated successfully!');
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errorMsg = err.error || 'Password incorrect or request failed.';
        this.alertService.showAlert(typeof errorMsg === 'string' ? errorMsg : 'Operation failed');
      }
    });
  }
}
