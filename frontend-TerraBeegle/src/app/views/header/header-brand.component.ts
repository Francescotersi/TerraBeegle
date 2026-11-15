import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-brand',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="navbar-brand me-0 d-flex align-items-center" routerLink="/" (click)="clicked.emit()">
      <img src="./Logo-header.webp" alt="TerraBeegle" class="site-logo" width="40" height="40">
    </a>
  `,
  styles: `
    .site-logo {
      display: block;
      transition: filter 0.4s ease, transform 0.25s ease;
    }

    .site-logo:hover {
      transform: scale(1.06);
    }

    :host-context([data-bs-theme="dark"]) .site-logo {
      filter: hue-rotate(-40deg) brightness(1.2) drop-shadow(0 0 8px var(--tb-accent-glow));
    }

    @media (min-width: 2000px) {
      .site-logo {
        width: 54px;
        height: 54px;
      }
    }
  `,
})
export class HeaderBrandComponent {
  readonly clicked = output<void>();
}
