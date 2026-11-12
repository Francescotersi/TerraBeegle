import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../../ui/theme.component';
import { HeaderBrandComponent } from './header-brand.component';
import { GameSearchBoxComponent } from './game-search-box.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LiquidGlassComponent, ThemeSwitchComponent, HeaderBrandComponent, GameSearchBoxComponent],
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
          <app-header-brand (clicked)="isMenuOpen.set(false)" />

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
              <app-game-search-box
                class="header-search-form order-1 order-lg-3 ms-lg-2"
                (navigated)="isMenuOpen.set(false)"
              />

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
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

}
