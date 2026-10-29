import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';

// da fare tasto modify profile 
// grafico a torta per i generidi giochi piu giocati
// tre pulsanti 1) settings 3) statistics
//              |
//              |- 2) modify profile publics data 
//              |- 3) modify profile email
//              |- 4) modify profile password

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [LiquidGlassComponent, RouterLink],
  template: `
    <div class="w-100 profile-page-wrapper">
      <app-liquid-glass
        borderRadius="26px"
        blur="2px"
        [scale]="85"
      >
        <div class="p-4 p-md-5 profile-wrapper">

            <!-- Header -->
            <div class="profile-header d-flex flex-column flex-sm-row align-items-center gap-4 pb-4 mb-4 border-bottom border-white-50">
              <div class="avatar-circle">
                @if (user()?.imageProfile) {
                  <img [src]="user()?.imageProfile" [alt]="user()?.name" class="avatar-img" />
                } @else {
                  <span>{{ userInitials() }}</span>
                }
              </div>

              <div class="text-center text-sm-start flex-grow-1">
                <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                  <h1 class="h3 fw-bold text-dark mb-0">
                    {{ user()?.name }} {{ user()?.familyName }}
                  </h1>
                </div>
                <p class="text-secondary mb-1 fw-medium">&#64;{{ user()?.username }}</p>
                <p class="text-muted small mb-0 d-flex align-items-center justify-content-center justify-content-sm-start gap-1">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  {{ user()?.email }}
                </p>
              </div>
            </div>

            <!-- Footer: Back to Home e Logout -->
            <div class="d-flex align-items-center justify-content-between pt-3 border-top border-white-50">
              <a routerLink="/" class="small fw-semibold text-decoration-none glass-home-link d-flex align-items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back to Home
              </a>

              <!-- Scritta rossa con sottolineatura per il logout -->
              <button
                type="button"
                class="logout-link"
                (click)="openLogoutModal()"
              >
                Log Out
              </button>
            </div>

          </div>
        </app-liquid-glass>
      </div>

    <!-- Modal Pop-up di Conferma Logout Personalizzato Liquid Glass -->
    @if (isLogoutModalOpen()) {
      <div class="modal-backdrop-custom" (click)="closeLogoutModal()">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <app-liquid-glass
            borderRadius="24px"
            background="rgba(255, 255, 255, 0.55)"
            [scale]="95"
          >
            <div class="p-4 text-center">
              <div class="modal-icon mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
              </div>

              <h3 class="h5 fw-bold text-dark mb-2">Log Out</h3>
              <p class="text-secondary small mb-4">Are you sure you want to log out?</p>

              <div class="d-flex justify-content-center gap-3">
                <button
                  type="button"
                  class="btn btn-cancel-custom"
                  (click)="closeLogoutModal()"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-confirm-custom"
                  (click)="confirmLogout()"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </app-liquid-glass>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .profile-page-wrapper {
      width: 100%;
    }

    /* Avatar cerchio satinato sfumato */
    .avatar-circle {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8 0%, #e788b3 100%);
      color: #ffffff;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(219, 39, 119, 0.28), inset 0 2px 4px rgba(255, 255, 255, 0.4);
      border: 3px solid rgba(255, 255, 255, 0.85);
      flex-shrink: 0;
      overflow: hidden;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Scritta rossa con sottolineatura per il logout */
    .logout-link {
      background: none;
      border: none;
      padding: 0;
      color: #dc2626;
      text-decoration: underline;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: color 0.2s ease, opacity 0.2s ease;
    }

    .logout-link:hover {
      color: #b91c1c;
      opacity: 0.85;
    }

    /* Link ritorno home */
    .glass-home-link {
      color: #0284c7;
      transition: color 0.2s ease, transform 0.2s ease;
    }

    .glass-home-link:hover {
      color: #0369a1;
      transform: translateX(-2px);
    }

    /* Modal Pop-up Personalizzato Liquid Glass */
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
      animation: modalFadeIn 0.25s ease-out;
    }

    .modal-dialog-custom {
      width: 100%;
      max-width: 380px;
      animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(220, 38, 38, 0.12);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
    }

    .btn-cancel-custom {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #475569;
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .btn-cancel-custom:hover {
      background: rgba(255, 255, 255, 0.95);
      color: #1e293b;
    }

    .btn-confirm-custom {
      background: #dc2626;
      border: none;
      color: #ffffff;
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transition: all 0.2s ease;
    }

    .btn-confirm-custom:hover {
      background: #b91c1c;
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
      transform: translateY(-1px);
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalScaleUp {
      from {
        opacity: 0;
        transform: scale(0.92);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
})
export class ProfilePageComponent {
  protected readonly authService = inject(AuthService);

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly isLogoutModalOpen = signal(false);

  protected readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return 'U';
    const first = u.name ? u.name.charAt(0).toUpperCase() : '';
    const last = u.familyName ? u.familyName.charAt(0).toUpperCase() : '';
    return (first + last) || (u.username ? u.username.charAt(0).toUpperCase() : 'U');
  });

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
