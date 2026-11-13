import { Component, inject, computed, signal } from '@angular/core';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';
import { logoutPopupComponent } from './logout-popup.component';
import { ProfileDetailsComponent } from './profile-details.component';
import { ProfileStatisticsComponent } from './profile-statistics.component';
import { ProfileFriendlistComponent } from './profile-friendlist/profile-friendlist.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';

// TODO: "modify profile" button
// pie chart with the most played game genres
// tre pulsanti 1) settings 3) statistics
//              |
//              |- 2) modify profile publics data 
//              |- 3) modify profile email
//              |- 4) modify profile password

export type ProfileTab = 'details' | 'statistics' | 'friendlist' | 'settings';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    LiquidGlassComponent,
    logoutPopupComponent,
    ProfileDetailsComponent,
    ProfileStatisticsComponent,
    ProfileFriendlistComponent,
    ProfileSettingsComponent,
  ],
  template: `
    <div class="container-fluid px-3 px-md-4 px-xl-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="profile-page-wrapper">
            <app-liquid-glass
              borderRadius="26px"
              blur="2px"
              [scale]="85"
            >
              <div class="p-4 p-md-5 profile-wrapper">

                <!-- Header -->
                <div class="d-flex align-items-center gap-3 pb-3">
                  <div class="avatar-circle">
                    @if (user()?.imageProfile) {
                      <img [src]="user()?.imageProfile" [alt]="user()?.name" class="avatar-img" />
                    } @else {
                      <span>{{ userInitials() }}</span>
                    }
                  </div>

                  <div class="d-flex flex-column">
                    <h1 class="h3 fw-bold text-body text-uppercase mb-0 tracking-wide">
                      {{ user()?.username || user()?.name || 'USERNAME' }}
                    </h1>
                    @if (user()?.name && user()?.familyName) {
                      <span class="text-body-secondary small fw-medium">
                        {{ user()?.name }} {{ user()?.familyName }}
                      </span>
                    }
                  </div>
                </div>

                <!-- DETAILS | STATISTICS | FRIENDLIST | SETTINGS -->
                <div class="profile-tabs-layout mb-4">
                  <div class="profile-tabs-nav d-flex align-items-center gap-3 gap-sm-4 pb-2 border-bottom border-secondary border-opacity-25">
                  <button
                    type="button"
                    class="profile-tab-btn"
                    [class.active]="activeTab() === 'details'"
                    (click)="setTab('details')"
                  >
                    DETAILS
                  </button>
                  <button
                    type="button"
                    class="profile-tab-btn"
                    [class.active]="activeTab() === 'statistics'"
                    (click)="setTab('statistics')"
                  >
                    STATISTICS
                  </button>
                  <button
                    type="button"
                    class="profile-tab-btn"
                    [class.active]="activeTab() === 'friendlist'"
                    (click)="setTab('friendlist')"
                  >
                    FRIENDLIST
                  </button>
                    <button
                      type="button"
                      class="profile-tab-btn"
                      [class.active]="activeTab() === 'settings'"
                      (click)="setTab('settings')"
                    >
                      SETTINGS
                    </button>
                  </div>
                </div>

                <!-- Central Content Area -->
                <div class="profile-tab-content">
                  @switch (activeTab()) {
                    @case ('details') {
                      <app-profile-details [user]="user()" />
                    }
                    @case ('statistics') {
                      <app-profile-statistics />
                    }
                    @case ('friendlist') {
                      <app-profile-friendlist />
                    }
                    @case ('settings') {
                      <app-profile-settings />
                    }
                  }
                </div>

                <!-- Footer -->
                <div class="profile-footer pt-3 mt-4 border-top border-secondary border-opacity-25">
                  <button
                    type="button"
                    class="logout-link"
                    (click)="openLogoutModal()"
                  >
                    LOGOUT
                  </button>
                </div>

              </div>
            </app-liquid-glass>
          </div>
        </div>
      </div>
    </div>

    <!-- Pop-up Logout -->
    <app-logout-popup
      [isOpen]="isLogoutModalOpen()"
      (close)="closeLogoutModal()"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .profile-page-wrapper {
      width: 100%;
    }

    :host-context([data-bs-theme="light"]) .profile-page-wrapper {
      filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.12));
    }

    .tracking-wide {
      letter-spacing: 0.05em;
    }

    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8 0%, #e788b3 100%);
      color: #ffffff;
      font-size: 1.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(255, 255, 255, 0.85);
      flex-shrink: 0;
      overflow: hidden;
    }

    :host-context([data-bs-theme="light"]) .avatar-circle {
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
      border: 3px solid #ffffff;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Navigation tabs */
    .profile-tabs-nav {
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
    }

    .profile-tabs-nav::-webkit-scrollbar {
      display: none;
    }

    :host-context([data-bs-theme="light"]) .profile-tabs-nav,
    :host-context([data-bs-theme="light"]) .profile-wrapper .border-secondary {
      border-color: rgba(51, 65, 85, 0.35) !important;
    }

    .profile-tab-btn {
      background: none;
      border: none;
      padding: 0.4rem 0.5rem;
      font-weight: 700;
      font-size: 0.88rem;
      letter-spacing: 0.05em;
      color: var(--tb-text-muted);
      cursor: pointer;
      position: relative;
      transition: color 0.2s ease;
    }

    .profile-tab-btn:hover {
      color: var(--tb-accent);
    }

    .profile-tab-btn.active {
      color: var(--tb-accent);
    }

    .profile-tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--tb-btn-gradient);
      border-radius: 3px 3px 0 0;
    }

    .profile-tabs-layout {
      position: relative;
    }

    @media (min-width: 576px) {
      .profile-tabs-nav {
        overflow: visible;
      }
    }

    @media (max-width: 575.98px) {
      .profile-tabs-nav {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.5rem !important;
        overflow-x: visible;
        white-space: normal;
      }

      .profile-tab-btn {
        width: 100%;
        padding: 0.6rem 0.35rem;
        text-align: center;
      }

      .profile-tab-btn.active::after {
        bottom: 0;
        left: 15%;
        right: 15%;
      }
    }

    .profile-tab-content {
      min-height: 180px;
    }

    .logout-link {
      background: none;
      border: none;
      padding: 0;
      color: #dc2626;
      text-decoration: underline;
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: color 0.2s ease, opacity 0.2s ease;
    }

    .profile-footer {
      display: flex;
      justify-content: flex-end;
    }

    .profile-footer .logout-link {
      align-self: flex-end;
    }

    .logout-link:hover {
      color: #b91c1c;
      opacity: 0.85;
    }
  `,
})
export class ProfilePageComponent {
  protected readonly authService = inject(AuthService);

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly activeTab = signal<ProfileTab>('details');

  protected readonly isLogoutModalOpen = signal(false);

  protected readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return 'U';
    const first = u.name ? u.name.charAt(0).toUpperCase() : '';
    const last = u.familyName ? u.familyName.charAt(0).toUpperCase() : '';
    return (first + last) || (u.username ? u.username.charAt(0).toUpperCase() : 'U');
  });

  protected setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  protected openLogoutModal(): void {
    this.isLogoutModalOpen.set(true);
  }

  protected closeLogoutModal(): void {
    this.isLogoutModalOpen.set(false);
  }

  protected confirmLogout(): void {
    this.isLogoutModalOpen.set(false);
    this.authService.logout();
  }
}
