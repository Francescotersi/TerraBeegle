import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ProfileEmailSettingsComponent } from './profile-email-settings.component';
import { ProfilePasswordSettingsComponent } from './profile-password-settings.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [FormsModule, ProfileEmailSettingsComponent, ProfilePasswordSettingsComponent],
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
            <label for="profile-name" class="form-label small fw-semibold text-body">
              Name
              @if (user()?.name) {
                <span class="text-body-secondary fw-normal">({{ user()?.name }})</span>
              }
            </label>
            <input
              id="profile-name"
              type="text"
              class="form-control settings-input"
              [(ngModel)]="name"
              name="name"
              [placeholder]="user()?.name || 'Enter new name'"
              maxlength="100"
              autocomplete="given-name"
            />
          </div>

          <div class="profile-field">
            <label for="profile-family-name" class="form-label small fw-semibold text-body">
              Family name
              @if (user()?.familyName) {
                <span class="text-body-secondary fw-normal">({{ user()?.familyName }})</span>
              }
            </label>
            <input
              id="profile-family-name"
              type="text"
              class="form-control settings-input"
              [(ngModel)]="familyName"
              name="familyName"
              [placeholder]="user()?.familyName || 'Enter new family name'"
              maxlength="100"
              autocomplete="family-name"
            />
          </div>

          <div class="profile-field">
            <label for="profile-username" class="form-label small fw-semibold text-body">
              Username
              @if (user()?.username) {
                <span class="text-body-secondary fw-normal">(&#64;{{ user()?.username }})</span>
              }
            </label>
            <input
              id="profile-username"
              type="text"
              class="form-control settings-input"
              [(ngModel)]="username"
              name="username"
              [placeholder]="user()?.username || 'Enter new username'"
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
              [(ngModel)]="imageProfile"
              name="imageProfile"
              [placeholder]="user()?.imageProfile || 'https://example.com/image.jpg'"
              autocomplete="url"
            />
          </div>

          <div class="profile-field">
            <label for="profile-companion" class="form-label small fw-semibold text-body">Dog companion</label>
            <select
              id="profile-companion"
              class="form-select settings-input"
              [(ngModel)]="dogCompanion"
              name="dogCompanion"
            >
              @for (companion of dogCompanions; track companion.value) {
                <option [ngValue]="companion.value">{{ companion.label }}</option>
              }
            </select>
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

      <app-profile-email-settings />
      <app-profile-password-settings />

      <!-- 2FA section -->
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

        <!-- Password input box for confirmation -->
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
  styleUrl: './profile-settings.component.css',
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
  name = '';
  familyName = '';
  username = '';
  imageProfile = '';
  dogCompanion = this.user()?.dogCompanion ?? 'Beagle';
  confirmPassword = '';
  readonly dogCompanions = [
    { value: 'Beagle', label: 'Beagle' },
    { value: 'Elkhound', label: 'Elkhound' },
    { value: 'GoldenRetriever', label: 'Golden Retriever' },
    { value: 'Husky', label: 'Husky' },
  ] as const;

  toggleProfileForm(): void {
    this.isProfileFormOpen.update((isOpen) => !isOpen);
  }

  saveProfile(): void {
    const name = this.name.trim();
    const familyName = this.familyName.trim();
    const username = this.username.trim();
    const imageProfile = this.imageProfile.trim();
    const dogCompanion = this.dogCompanion;

    if (!name && !familyName && !username && !imageProfile && dogCompanion === this.user()?.dogCompanion) {
      this.alertService.showAlert('No changes to save.');
      return;
    }

    if (imageProfile && !/^https?:\/\//i.test(imageProfile)) {
      this.alertService.showAlert('Profile image URL must start with http:// or https://');
      return;
    }

    // Send only the fields the user actually filled in
    const payload: {
      name?: string;
      familyName?: string;
      username?: string;
      imageProfile?: string | null;
      dogCompanion?: typeof dogCompanion;
    } = {};
    if (name) payload.name = name;
    if (familyName) payload.familyName = familyName;
    if (username) payload.username = username;
    if (imageProfile) payload.imageProfile = imageProfile;
    if (dogCompanion !== this.user()?.dogCompanion) payload.dogCompanion = dogCompanion;

    this.isProfileLoading.set(true);
    this.authService.updateUser(payload).subscribe({
      next: () => {
        this.isProfileLoading.set(false);
        // Clear the inputs so they are empty for the next change
        this.name = '';
        this.familyName = '';
        this.username = '';
        this.imageProfile = '';
        this.dogCompanion = this.user()?.dogCompanion ?? 'Beagle';
        this.alertService.showSuccess('Profile updated successfully.');
      },
      error: (error) => {
        this.isProfileLoading.set(false);
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
        this.alertService.showSuccess(msg || '2FA settings updated successfully!');
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errorMsg = err.error || 'Password incorrect or request failed.';
        this.alertService.showAlert(typeof errorMsg === 'string' ? errorMsg : 'Operation failed');
      }
    });
  }
}
