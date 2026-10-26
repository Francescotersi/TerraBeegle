import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LiquidGlassComponent } from '../ui/LiquidGlass/liquid-glass.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LiquidGlassComponent],
  template: `
    <nav class="navbar navbar-expand-lg sticky-top">
      <div class="container justify-content-center">
        <a class="navbar-brand me-4" routerLink="/">
          <img
            src="./Logo.ico"
            alt="TerraBeegle"
            width="40"
            height="40"
          >
        </a>
        <!-- Bottone per Mobile -->
        <button
          class="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          (click)="toggleMenu()"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div
          class="collapse navbar-collapse flex-grow-0"
          id="navBarContent"
          [class.show]="isMenuOpen()"
        >
          <ul class="navbar-nav align-items-center text-center mb-2 mb-lg-0">
            <!-- struttura item per menu a tendina mobile -->
            <li class="nav-item ms-lg-3">
              <app-liquid-glass [borderRadius]="20" [borderWidth]="0.12" [distortionScale]="-160">
                <a
                  class="nav-link p-0"
                  routerLink="/"
                  routerLinkActive="active"
                  (click)="isMenuOpen.set(false)"
                >
                  Home
                </a>
              </app-liquid-glass>
            </li>
            <!-- da implemetare Immagine profilo -->
            <li class="nav-item">
              <a
                class="nav-link ms-4"
                (click)="isMenuOpen.set(false)"
              >
                Profile
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link ms-4"
                (click)="isMenuOpen.set(false)"
              >
                Wishlist
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link ms-4"
                (click)="isMenuOpen.set(false)"
              >
                Favorites
              </a>
            </li>
          </ul>
          <form
            class="d-flex ms-4"
            role="search"
            (submit)="$event.preventDefault(); onSearch()"
          >
            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
            <button class="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>
    </nav>
  `,
  styles: ``,
})
export class HeaderComponent {
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  // Da implementare
  protected onSearch(): void { }
}
