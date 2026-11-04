import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  template: `
    <div class="d-flex flex-column gap-2 py-2">
      <div class="settings-item p-3 rounded-3 d-flex align-items-center justify-content-between">
        <div>
          <span class="fw-bold d-block text-body small">Public profile information</span>
          <span class="text-body-secondary small">Edit first name, last name, and profile photo</span>
        </div>
        <span class="badge bg-secondary-subtle text-secondary small">todo</span>
      </div>
      <div class="settings-item p-3 rounded-3 d-flex align-items-center justify-content-between">
        <div>
          <span class="fw-bold d-block text-body small">Account email</span>
          <span class="text-body-secondary small">Update the associated email address</span>
        </div>
        <span class="badge bg-secondary-subtle text-secondary small">Todo</span>
      </div>
      <div class="settings-item p-3 rounded-3 d-flex align-items-center justify-content-between">
        <div>
          <span class="fw-bold d-block text-body small">Security and password</span>
          <span class="text-body-secondary small">Change your login password</span>
        </div>
        <span class="badge bg-secondary-subtle text-secondary small">TO DO</span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .settings-item {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-glass-border);
      box-shadow: 0 4px 14px var(--tb-glass-shadow);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
  `,
})
export class ProfileSettingsComponent {}

