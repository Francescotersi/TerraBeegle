import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../../ui/theme.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LiquidGlassComponent, ThemeSwitchComponent],
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
              class="site-logo"
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
            <app-theme-switch class="ms-lg-3"></app-theme-switch>
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

    .site-logo {
      transition: filter 0.4s ease, transform 0.25s ease;
      display: block;
    }

    :host-context([data-bs-theme="dark"]) .site-logo {
      filter: hue-rotate(-40deg) brightness(1.2) drop-shadow(0 0 8px var(--tb-accent-glow));
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
      color: var(--tb-text);
      border-radius: 20px;
      transition: background 0.2s ease, color 0.2s ease;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
    }

    .nav-link.active {
      color: var(--tb-accent);
      font-weight: 600;
    }

    /* Pulsanti in evidenza per Login e Sign Up senza effetti glow */
    .nav-btn-login {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-accent);
      color: var(--tb-accent) !important;
      transition: all 0.2s ease;
    }

    .nav-btn-login:hover {
      background: var(--tb-accent);
      color: #ffffff !important;
      border-color: var(--tb-accent-hover);
      transform: translateY(-1px);
    }

    .nav-btn-login.active {
      background: var(--tb-accent);
      border-color: var(--tb-accent);
      color: #ffffff !important;
    }

    .nav-btn-signup {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      color: #ffffff !important;
      transition: all 0.2s ease;
    }

    .nav-btn-signup:hover {
      background: var(--tb-btn-gradient-hover);
      transform: translateY(-1px);
      color: #ffffff !important;
    }

    .nav-btn-signup.active {
      box-shadow: none;
    }

    .header-search-form {
      flex-shrink: 0;
    }

    .search-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      border-radius: 20px;
      padding: 0.375rem 0.85rem;
      color: var(--tb-text);
      width: 170px;
      transition: background 0.2s ease, width 0.2s ease, border-color 0.2s ease;
    }

    .search-input::placeholder {
      color: var(--tb-text-muted);
      opacity: 0.8;
    }

    .search-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      box-shadow: none;
      outline: none;
      color: var(--tb-text);
      width: 200px;
    }

    .search-btn {
      border-radius: 20px;
      white-space: nowrap;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      color: var(--tb-accent);
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-accent);
      transition: all 0.2s ease;
    }

    .search-btn:hover {
      background: var(--tb-btn-gradient);
      color: #ffffff;
      border-color: transparent;
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
