import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LiquidGlassComponent],
  template: `
  <header class="header-wrapper">
    <app-liquid-glass
      borderRadius="100px"
      blur="2px"
      [scale]="80"
    >
      <nav class="navbar navbar-expand-lg px-4 py-2 w-100">
        <div class="container-fluid d-flex align-items-center justify-content-between p-0 w-100">
          <a class="navbar-brand me-0 d-flex align-items-center" routerLink="/">
            <img
              src="./Logo.ico"
              alt="TerraBeegle"
              width="40"
              height="40"
            >
          </a>
          <!-- Bottone per Mobile -->
          <button
            class="navbar-toggler border-0"
            type="button"
            aria-label="Toggle navigation"
            (click)="toggleMenu()"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div
            class="collapse navbar-collapse flex-grow-1"
            id="navBarContent"
            [class.show]="isMenuOpen()"
          >
            <ul class="navbar-nav d-flex justify-content-evenly align-items-center flex-grow-1 mb-0 px-lg-3">
              <li class="nav-item">
                <a
                  class="nav-link fw-semibold px-3 py-1"
                  routerLink="/"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="isMenuOpen.set(false)"
                >
                  Home
                </a>
              </li>

              @if (authService.isLoggedIn()) {
                <li class="nav-item">
                  <a
                    routerLink="/profile"
                    routerLinkActive="active"
                    class="nav-link fw-semibold px-3 py-1"
                    (click)="isMenuOpen.set(false)"
                  >
                    Profile
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    routerLink="/wishlist"
                    routerLinkActive="active"
                    class="nav-link fw-semibold px-3 py-1"
                    (click)="isMenuOpen.set(false)"
                  >
                    Wishlist
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    routerLink="/favorites"
                    routerLinkActive="active"
                    class="nav-link fw-semibold px-3 py-1"
                    (click)="isMenuOpen.set(false)"
                  >
                    Favorites
                  </a>
                </li>
              } @else {
                <li class="nav-item">
                  <a
                    routerLink="/login"
                    routerLinkActive="active"
                    class="nav-link nav-btn-login fw-semibold px-3 py-1"
                    (click)="isMenuOpen.set(false)"
                  >
                    Log In
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    routerLink="/register"
                    routerLinkActive="active"
                    class="nav-link nav-btn-signup fw-semibold px-3 py-1"
                    (click)="isMenuOpen.set(false)"
                  >
                    Sign Up
                  </a>
                </li>
              }
            </ul>

            <form
              class="d-flex align-items-center header-search-form ms-lg-2"
              role="search"
              (submit)="$event.preventDefault(); onSearch()"
            >
              <input
                class="form-control me-2 search-input"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button class="btn search-btn" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </nav>
    </app-liquid-glass>
  </header>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 1rem;
      z-index: 1000;
      width: 100%;
      pointer-events: none;
    }

    .header-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      pointer-events: auto;
    }

    .header-wrapper app-liquid-glass {
      display: block;
      width: 100%;
    }

    .navbar {
      background: transparent;
      width: 100%;
    }

    .navbar-nav {
      width: 100%;
    }

    .nav-link {
      cursor: pointer;
      color: #334155;
      border-radius: 20px;
      transition: background 0.2s ease, color 0.2s ease;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: rgba(244, 114, 182, 0.12);
      color: #db2777;
    }

    .nav-link.active {
      color: #db2777;
      font-weight: 600;
    }

    /* Pulsanti in evidenza per Login e Sign Up */
    .nav-btn-login {
      background: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(244, 114, 182, 0.5);
      color: #db2777 !important;
      box-shadow: 0 2px 8px rgba(219, 39, 119, 0.1);
      transition: all 0.2s ease;
    }

    .nav-btn-login:hover {
      background: rgba(244, 114, 182, 0.18);
      color: #be185d !important;
      border-color: rgba(244, 114, 182, 0.8);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(219, 39, 119, 0.2);
    }

    .nav-btn-login.active {
      background: rgba(244, 114, 182, 0.25);
      border-color: #db2777;
      color: #9d174d !important;
    }

    .nav-btn-signup {
      background: linear-gradient(135deg, #fb7185 0%, #f472b6 100%);
      border: 1px solid rgba(255, 255, 255, 0.7);
      color: #ffffff !important;
      box-shadow: 0 2px 10px rgba(244, 114, 182, 0.35);
      transition: all 0.2s ease;
    }

    .nav-btn-signup:hover {
      background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
      box-shadow: 0 4px 16px rgba(244, 114, 182, 0.5);
      transform: translateY(-1px);
      color: #ffffff !important;
    }

    .nav-btn-signup.active {
      box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.35), 0 4px 16px rgba(244, 114, 182, 0.5);
    }

    .header-search-form {
      flex-shrink: 0;
    }

    .search-input {
      background: rgba(255, 255, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 20px;
      padding: 0.375rem 0.85rem;
      color: inherit;
      width: 170px;
      transition: background 0.2s ease, box-shadow 0.2s ease, width 0.2s ease, border-color 0.2s ease;
    }

    .search-input:focus {
      background: rgba(255, 255, 255, 0.75);
      border-color: rgba(244, 114, 182, 0.6);
      box-shadow: 0 0 0 0.25rem rgba(244, 114, 182, 0.25);
      width: 200px;
    }

    .search-btn {
      border-radius: 20px;
      white-space: nowrap;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      color: #db2777;
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(244, 114, 182, 0.45);
      transition: all 0.2s ease;
    }

    .search-btn:hover {
      background: linear-gradient(135deg, #fb7185 0%, #f472b6 100%);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 2px 10px rgba(244, 114, 182, 0.35);
      transform: translateY(-1px);
    }

    @media (max-width: 991px) {
      .navbar-nav {
        flex-direction: column !important;
        gap: 0.75rem;
        padding: 1rem 0;
      }
      .header-search-form {
        width: 100%;
        margin-top: 0.5rem;
      }
      .search-input {
        width: 100% !important;
      }
      .nav-btn-login,
      .nav-btn-signup {
        width: 100%;
        text-align: center;
      }
    }
  `,
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  // Da implementare
  protected onSearch(): void { }
}
