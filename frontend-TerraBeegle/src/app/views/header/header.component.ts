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
    <div
      class="mobile-menu-backdrop d-lg-none"
      [class.show]="isMenuOpen()"
      (click)="isMenuOpen.set(false)"
      aria-hidden="true"
    ></div>

    <app-liquid-glass
      borderRadius="100px"
      blur="2px"
      [scale]="80"
      overflow="visible"
    >
      <nav class="navbar navbar-expand-lg px-3 px-sm-4 py-2 w-100">
        <div class="container-fluid d-flex align-items-center justify-content-between p-0 w-100 position-relative">
          <a class="navbar-brand me-0 d-flex align-items-center" routerLink="/" (click)="isMenuOpen.set(false)">
            <img
              src="./Logo.ico"
              alt="TerraBeegle"
              class="site-logo"
              width="40"
              height="40"
            >
          </a>

          <button
            class="menu-toggle-btn d-lg-none"
            type="button"
            aria-label="Toggle navigation"
            [attr.aria-expanded]="isMenuOpen()"
            [class.open]="isMenuOpen()"
            (click)="toggleMenu()"
          >
            <span class="hamburger-box">
              <span class="hamburger-line line-1"></span>
              <span class="hamburger-line line-2"></span>
              <span class="hamburger-line line-3"></span>
            </span>
          </button>

          <div class="header-menu-clip flex-grow-1">
            <div
              class="header-menu-panel flex-grow-1"
              id="navBarContent"
              [class.show]="isMenuOpen()"
            >
              <form
                class="d-flex align-items-center header-search-form order-1 order-lg-3 ms-lg-2"
                role="search"
                (submit)="$event.preventDefault(); onSearch()"
              >
                <input
                  class="form-control me-2 search-input"
                  type="search"
                  placeholder="Search games..."
                  aria-label="Search"
                />
                <button class="btn search-btn" type="submit">
                  Search
                </button>
              </form>

              <ul class="navbar-nav d-flex justify-content-evenly align-items-center flex-grow-1 mb-0 px-lg-3 order-2 order-lg-1">
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

              <div class="theme-switch-wrapper d-flex align-items-center justify-content-center order-3 order-lg-2 ms-lg-3">
                <app-theme-switch></app-theme-switch>
              </div>
            </div>
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
      z-index: 1050;
      width: 100%;
      pointer-events: none;
    }

    .header-wrapper {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      pointer-events: auto;
    }

    @media (min-width: 1200px) {
      .header-wrapper {
        max-width: none;
        width: 66.666667%;
        margin-left: 25%;
        margin-right: 0;
      }
    }

    @media (min-width: 1400px) {
      .header-wrapper {
        margin-left: 16.666667%;
      }
    }

    .header-wrapper app-liquid-glass {
      display: block;
      width: 100%;
      position: relative;
      z-index: 1055;
    }

    .site-logo {
      transition: filter 0.4s ease, transform 0.25s ease;
      display: block;
    }

    .site-logo:hover {
      transform: scale(1.06);
    }

    :host-context([data-bs-theme="dark"]) .site-logo {
      filter: hue-rotate(-40deg) brightness(1.2) drop-shadow(0 0 8px var(--tb-accent-glow));
    }

    .navbar {
      background: transparent;
      width: 100%;
    }

    .menu-toggle-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-input-bg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
      outline: none;
    }

    .menu-toggle-btn:hover,
    .menu-toggle-btn.open {
      border-color: var(--tb-accent);
      background: var(--tb-accent-subtle);
    }

    .menu-toggle-btn:focus-visible {
      box-shadow: 0 0 0 3px var(--tb-accent-glow);
    }

    .hamburger-box {
      width: 20px;
      height: 14px;
      position: relative;
      display: inline-block;
    }

    .hamburger-line {
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      border-radius: 2px;
      background-color: var(--tb-text);
      transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease, background-color 0.25s ease;
    }

    .menu-toggle-btn:hover .hamburger-line,
    .menu-toggle-btn.open .hamburger-line {
      background-color: var(--tb-accent);
    }

    .hamburger-line.line-1 {
      top: 0;
    }

    .hamburger-line.line-2 {
      top: 6px;
    }

    .hamburger-line.line-3 {
      top: 12px;
    }

    .menu-toggle-btn.open .hamburger-line.line-1 {
      transform: translateY(6px) rotate(45deg);
    }

    .menu-toggle-btn.open .hamburger-line.line-2 {
      opacity: 0;
      transform: translateX(8px);
    }

    .menu-toggle-btn.open .hamburger-line.line-3 {
      transform: translateY(-6px) rotate(-45deg);
    }

    .header-menu-clip {
      display: flex;
      align-items: center;
    }

    .header-menu-panel {
      display: flex;
      align-items: center;
    }

    .navbar-nav {
      width: 100%;
    }

    .nav-link {
      cursor: pointer;
      color: var(--tb-text);
      border-radius: 20px;
      transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
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

    /* Pulsanti in evidenza per Login e Sign Up */
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

    @media (min-width: 2000px) {
      .header-wrapper {
        margin-bottom: 1.5rem;
      }

      .navbar {
        padding-top: 0.9rem !important;
        padding-bottom: 0.9rem !important;
      }

      .site-logo {
        width: 54px;
        height: 54px;
      }

      .nav-link {
        font-size: 1.5rem;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }

      .search-input {
        width: 220px;
        font-size: 1.4rem;
        padding: 0.55rem 1rem;
      }

      .search-input:focus {
        width: 260px;
      }

      .search-btn {
        font-size: 1.4rem;
        padding: 0.5rem 1rem;
      }

      .theme-switch-wrapper {
        --theme-switch-width: 72px;
        --theme-switch-height: 38px;
        --theme-switch-thumb-size: 32px;
        --theme-switch-thumb-offset: 34px;
        --theme-switch-icon-size: 20px;
      }
    }

    @media (max-width: 991.98px) {
      .mobile-menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1040;
        background: rgba(15, 23, 42, 0.25);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.32s ease, visibility 0.32s ease;
      }

      .mobile-menu-backdrop.show {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .header-menu-clip {
        position: fixed;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 1060;
      }

      .header-menu-panel {
        position: absolute;
        top: 5.25rem;
        right: 1rem;
        width: min(360px, calc(100vw - 2rem));
        z-index: 1060;
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
        padding: 1.25rem;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(22px) saturate(190%);
        -webkit-backdrop-filter: blur(22px) saturate(190%);
        border: 1px solid var(--tb-glass-border);
        box-shadow:
          0 22px 48px rgba(0, 0, 0, 0.16),
          inset 1px 1px 2px rgba(255, 255, 255, 0.7);

        transform: translateX(calc(100% + 2rem));
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
          transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
          opacity 0.28s ease,
          visibility 0.4s;
      }

      :host-context([data-bs-theme="dark"]) .header-menu-panel {
        background: rgba(7, 31, 73, 0.9);
        box-shadow:
          0 22px 48px rgba(0, 0, 0, 0.65),
          inset 1px 1px 2px rgba(46, 217, 231, 0.2);
      }

      .header-menu-panel.show {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .header-menu-panel .header-search-form,
      .header-menu-panel .navbar-nav,
      .header-menu-panel .theme-switch-wrapper {
        transform: translateX(24px);
        opacity: 0;
        transition:
          transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
          opacity 0.28s ease;
      }

      .header-menu-panel.show .header-search-form {
        transform: translateX(0);
        opacity: 1;
        transition-delay: 0.05s;
      }

      .header-menu-panel.show .navbar-nav {
        transform: translateX(0);
        opacity: 1;
        transition-delay: 0.1s;
      }

      .header-menu-panel.show .theme-switch-wrapper {
        transform: translateX(0);
        opacity: 1;
        transition-delay: 0.15s;
      }

      .header-search-form {
        width: 100%;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--bs-border-color);
      }

      .search-input,
      .search-input:focus {
        width: 100% !important;
        flex: 1;
      }

      .navbar-nav {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.5rem;
        padding: 0;
      }

      .nav-item {
        width: 100%;
      }

      .nav-link {
        display: block;
        width: 100%;
        text-align: center;
        padding: 0.55rem 1rem !important;
      }

      .theme-switch-wrapper {
        width: 100%;
        padding-top: 0.75rem;
        border-top: 1px solid var(--bs-border-color);
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
