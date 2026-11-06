import { Component, signal, computed, input, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

export interface GridComponentProps {
  rawgGameId: number;
  name: string;
  description: string;
  released: string;
  tba: boolean;
  website: string;
  rating: number;
  metacritic: number;
  coverImage: string;
  developer: string;
  publisher: string;
  platforms: number[];
  tags: string[];
  genres: string[];
}

@Component({
  imports: [LiquidGlassComponent],
  selector: 'app-grid-component',
  template: `
    <div class="grid-wrapper w-100 pt-2 pt-md-4">
      <svg width="0" height="0" style="position: absolute; pointer-events: none;" aria-hidden="true">
        <filter id="tb-global-liquid-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" dur="14s" values="0.016;0.026;0.016" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="85" xChannelSelector="R" yChannelSelector="G" result="refracted" />
          <feGaussianBlur in="refracted" stdDeviation="0.8" />
        </filter>
      </svg>
      <div
        style="position: absolute; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; z-index: -1; backdrop-filter: url(#tb-global-liquid-filter);"
        aria-hidden="true"
      ></div>

      @if (title()) {
        <h2 class="h3 fw-bold pt-2 mb-4 text-center">{{ title() }}</h2>
      }

      @if (games().length === 0) {
        <div class="text-center py-5 text-muted">
          <p class="fs-5 mb-0">{{ emptyMessage() }}</p>
        </div>
      } @else {
        <div
          class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 gx-3 gy-2 gx-md-4 gy-md-2 justify-content-center"
        >
          @for (game of visibleGames(); track game.rawgGameId) {
            <div class="col game-col">
              <div
                class="card game-card"
                [class.is-hovered]="hoveredGameId() === game.rawgGameId"
                (mouseenter)="onMouseEnter(game.rawgGameId)"
                (mouseleave)="onMouseLeave()"
              >
                <!-- Contenitore immagine -->
                <div class="game-cover-container">
                  <img
                    [src]="game.coverImage"
                    [alt]="game.name"
                    class="card-img game-cover"
                    loading="lazy"
                  />

                  <!-- Overlay titolo -->
                  <div class="card-img-overlay d-flex flex-column justify-content-end p-2.5 card-overlay-title">
                    <h6 class="card-title fw-bold mb-0 text-white text-truncate" [title]="game.name">
                      {{ game.name }}
                    </h6>
                  </div>
                </div>

                <!-- Pannello dettagli -->
                @if (hoveredGameId() === game.rawgGameId) {
                  <div class="game-details-liquid">
                    <app-liquid-glass
                      sharedFilterId="tb-global-liquid-filter"
                      borderRadius="0 0 14px 14px"
                      blur="3px"
                      [scale]="85"
                      background="var(--tb-glass-bg)"
                      [customStyle]="{ 'border-top': 'none', 'border-color': 'var(--tb-glass-border)', 'border-bottom-left-radius': '14px', 'border-bottom-right-radius': '14px' }"
                    >
                      <div class="p-3 text-body details-inner">
                        <div class="d-flex align-items-center gap-2 mb-2 action-buttons">

                          <button
                            class="btn-action-circle"
                            [class.is-active]="wishlistedIds().has(game.rawgGameId)"
                            type="button"
                            [title]="wishlistedIds().has(game.rawgGameId) ? 'Remove from Wishlist' : 'Add to Wishlist'"
                            (click)="onToggleWishlist($event, game.rawgGameId)"
                          >
                            @if (wishlistedIds().has(game.rawgGameId)) {
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            } @else {
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            }
                          </button>

                          <div
                            class="heart-container"
                            [class.is-active]="favoritedIds().has(game.rawgGameId)"
                            [title]="favoritedIds().has(game.rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
                          >
                            <input
                              [id]="'fav-' + game.rawgGameId"
                              class="checkbox"
                              type="checkbox"
                              [checked]="favoritedIds().has(game.rawgGameId)"
                              (click)="onToggleFavorite($event, game.rawgGameId)"
                              [attr.aria-label]="favoritedIds().has(game.rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
                            />
                            <div class="svg-container">
                              <svg xmlns="http://www.w3.org/2000/svg" class="svg-outline" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                                </path>
                              </svg>
                              <svg xmlns="http://www.w3.org/2000/svg" class="svg-filled" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                                </path>
                              </svg>
                              <svg xmlns="http://www.w3.org/2000/svg" class="svg-celebrate" viewBox="0 0 100 100" aria-hidden="true">
                                <polygon points="10,10 20,20"></polygon>
                                <polygon points="10,50 20,50"></polygon>
                                <polygon points="20,80 30,70"></polygon>
                                <polygon points="90,10 80,20"></polygon>
                                <polygon points="90,50 80,50"></polygon>
                                <polygon points="80,80 70,70"></polygon>
                              </svg>
                            </div>
                          </div>

                          <button class="btn-action-circle btn-more ms-auto" type="button" title="Game details">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </div>

                        <!-- Rating / Metacritic -->
                        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span class="rating-box" [title]="'Rating: ' + game.rating">
                            ★ {{ game.rating }}
                          </span>
                          @if (game.metacritic) {
                            <span
                              class="metacritic-box"
                              [class.meta-green]="game.metacritic >= 80"
                              [class.meta-yellow]="game.metacritic >= 50 && game.metacritic < 80"
                              [class.meta-red]="game.metacritic < 50"
                              [title]="'Metacritic: ' + game.metacritic"
                            >
                              {{ game.metacritic }}
                            </span>
                          }
                          @if (game.released) {
                            <span class="text-body-secondary small fw-medium">
                              {{ getReleaseYear(game.released) }}
                            </span>
                          }
                        </div>

                        <!-- Categorie / Generi -->
                        @if (game.genres && game.genres.length > 0) {
                          <div class="game-genres-line text-truncate">
                            {{ game.genres.slice(0, 3).join(' • ') }}
                          </div>
                        } @else if (game.tags && game.tags.length > 0) {
                          <div class="game-genres-line text-truncate">
                            {{ game.tags.slice(0, 3).join(' • ') }}
                          </div>
                        }
                      </div>
                    </app-liquid-glass>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (hasMoreGames()) {
          <div class="text-center mt-4 mb-3">
            <button
              class="btn btn-show-more px-4 py-2 fw-semibold shadow-sm"
              type="button"
              (click)="showMore()"
            >
              Show More
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .grid-wrapper {
      width: 100%;
    }

    .game-col {
      position: relative;
      aspect-ratio: 16 / 9;
      margin-bottom: 0.35rem;
    }

    .game-card {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 14px;
      border: none;
      background: transparent;
      box-shadow: none;
      cursor: pointer;
      transform-origin: center top;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .game-card.is-hovered {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: auto;
      z-index: 1000;
      overflow: visible;
      transform: scale(1.15);
    }

    .game-cover-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      transition: border-radius 0.2s ease, box-shadow 0.2s ease;
    }

    .game-card.is-hovered .game-cover-container {
      border-radius: 14px 14px 0 0;
      border-bottom: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }

    .game-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .card-overlay-title {
      background: linear-gradient(
        to top,
        rgba(10, 10, 10, 0.72) 0%,
        rgba(10, 10, 10, 0.15) 45%,
        transparent 100%
      );
      pointer-events: none;
    }

    .game-details-liquid {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      border-radius: 0 0 14px 14px;
      overflow: hidden;
      transform-origin: center top;
      animation: detailsExpandIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 16px 32px rgba(244, 114, 182, 0.2), 0 8px 16px rgba(0, 0, 0, 0.08);
    }

    @keyframes detailsExpandIn {
      from {
        opacity: 0.9;
        transform: translateY(-2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .details-inner {
      font-size: 0.82rem;
    }

    .action-buttons {
      margin-top: 0.1rem;
    }

    .btn-action-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--tb-accent);
      background: var(--tb-glass-bg);
      color: var(--tb-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.2s ease;
    }

    .btn-action-circle:hover {
      background: var(--tb-accent);
      border-color: var(--tb-accent-hover);
      color: #ffffff;
      transform: scale(1.08);
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .btn-action-circle.is-active {
      background: var(--tb-accent);
      border-color: var(--tb-accent-hover);
      color: #ffffff;
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .btn-action-circle.btn-more {
      background: var(--tb-glass-bg);
      border-color: var(--tb-glass-border);
      color: var(--tb-text-muted);
    }

    .btn-action-circle.btn-more:hover {
      background: var(--tb-accent);
      border-color: var(--tb-accent);
      color: #ffffff;
      transform: scale(1.08);
    }

    .heart-container {
      --heart-color: var(--tb-accent);
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--tb-accent);
      background: var(--tb-glass-bg);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .heart-container:hover {
      background: var(--tb-accent-subtle);
      border-color: var(--tb-accent-hover);
      transform: scale(1.08);
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .heart-container.is-active,
    .heart-container:has(.checkbox:checked) {
      background: var(--tb-accent-subtle);
      border-color: var(--tb-accent-hover);
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .heart-container .checkbox {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      margin: 0;
      padding: 0;
      z-index: 20;
      cursor: pointer;
    }

    .heart-container:has(.checkbox:focus-visible) {
      outline: 2px solid var(--tb-accent);
      outline-offset: 2px;
    }

    .heart-container .svg-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      pointer-events: none;
    }

    .heart-container .svg-outline,
    .heart-container .svg-filled {
      fill: var(--heart-color);
      position: absolute;
      width: 15px;
      height: 15px;
      pointer-events: none;
      transition: fill 0.2s ease;
    }

    .heart-container .svg-filled {
      animation: keyframes-svg-filled 0.75s ease;
      display: none;
    }

    .heart-container .svg-celebrate {
      position: absolute;
      width: 38px;
      height: 38px;
      animation: keyframes-svg-celebrate 0.5s ease-out;
      animation-fill-mode: forwards;
      display: none;
      stroke: var(--heart-color);
      fill: var(--heart-color);
      stroke-width: 2px;
      pointer-events: none;
      overflow: visible;
    }

    .heart-container .checkbox:checked ~ .svg-container .svg-filled {
      display: block;
    }

    .heart-container .checkbox:checked ~ .svg-container .svg-celebrate {
      display: block;
    }

    @keyframes keyframes-svg-filled {
      0% {
        transform: scale(0);
      }
      30% {
        transform: scale(1.25);
      }
      60% {
        transform: scale(0.92);
        filter: brightness(1.3);
      }
      100% {
        transform: scale(1);
        filter: brightness(1);
      }
    }

    @keyframes keyframes-svg-celebrate {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      50% {
        opacity: 1;
        filter: brightness(1.4);
      }
      100% {
        transform: scale(1.4);
        opacity: 0;
        display: none;
      }
    }

    .game-genres-line {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--tb-text);
    }

    .metacritic-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 24px;
      padding: 0 5px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      user-select: none;
    }

    .meta-green {
      background-color: #00ce7a;
      color: #0f172a;
    }

    .meta-yellow {
      background-color: #ffcc33;
      color: #0f172a;
    }

    .meta-red {
      background-color: #ef4444;
      color: #ffffff;
    }

    .rating-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 28px;
      height: 24px;
      padding: 0 5px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1;
      background-color: #ffcc33;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      user-select: none;
    }

    .btn-show-more {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      color: #fff;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px var(--tb-btn-gradient-shadow);
    }
    .btn-show-more:hover {
      background: var(--tb-btn-gradient-hover);
      box-shadow: 0 4px 16px var(--tb-btn-gradient-shadow);
      transform: translateY(-2px);
      color: #fff;
    }
  `,
})
export class GridComponent implements OnInit {
  readonly title = input<string>("Beegle's Games Catalog");
  readonly games = input<GridComponentProps[]>([]);
  readonly emptyMessage = input<string>('No games found.');

  protected readonly hoveredGameId = signal<number | null>(null);
  // ---- Show More functuonality ----
  private readonly step = 20;
  protected readonly visibleCount = signal(20);

  protected readonly visibleGames = computed(() => {
    return this.games().slice(0, this.visibleCount());
  });

  protected readonly hasMoreGames = computed(() => {
    return this.visibleCount() < this.games().length;
  });

  protected showMore(): void {
    this.visibleCount.update((count) => count + this.step);
  }

  // -----------------------
  protected onMouseEnter(gameId: number): void {
    this.hoveredGameId.set(gameId);
  }

  protected onMouseLeave(): void {
    this.hoveredGameId.set(null);
  }

  protected getReleaseYear(releasedDate: string): string {
    if (!releasedDate) return '';
    return releasedDate.split('-')[0] || releasedDate;
  }

  // ---- Wishlist / Favorites functionality ----
  private readonly wishlistService = inject(WishlistFavoritesService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly wishlistedIds = signal<Set<number>>(new Set());
  protected readonly favoritedIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      this.wishlistService.getWishlist(1, 100).subscribe({
        next: (res) => {
          if (res?.results) {
            this.wishlistedIds.set(new Set(res.results.map((g) => g.rawgGameId)));
          }
        },
        error: () => {},
      });
      this.wishlistService.getFavorites(1, 100).subscribe({
        next: (res) => {
          if (res?.results) {
            this.favoritedIds.set(new Set(res.results.map((g) => g.rawgGameId)));
          }
        },
        error: () => {},
      });
    }
  }

  protected onToggleWishlist(event: MouseEvent, gameId: number): void {
    event.stopPropagation(); // stops from entering game details page
    if (!this.authService.isLoggedIn()) {
      this.alertService.showAlert('Please log in to manage your wishlist.');
      return;
    }
    const isAlreadyAdded = this.wishlistedIds().has(gameId);
    if (isAlreadyAdded) {
      this.wishlistService.removeWishlist(gameId).subscribe({
        next: () => this.updateWishlistLocal(gameId, false),
        error: () => this.updateWishlistLocal(gameId, false), // Fallback offline
      });
    } else {
      this.wishlistService.addWishlist(gameId).subscribe({
        next: () => this.updateWishlistLocal(gameId, true),
        error: () => this.updateWishlistLocal(gameId, true), // Fallback offline
      });
    }
  }

  private updateWishlistLocal(gameId: number, add: boolean): void {
    this.wishlistedIds.update((ids) => {
      const updated = new Set(ids);
      add ? updated.add(gameId) : updated.delete(gameId);
      return updated;
    });
  }

  protected onToggleFavorite(event: MouseEvent, gameId: number): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      event.preventDefault();
      this.alertService.showAlert('Please log in to manage your favorites.');
      return;
    }
    const isAlreadyAdded = this.favoritedIds().has(gameId);
    if (isAlreadyAdded) {
      this.wishlistService.removeFavorite(gameId).subscribe({
        next: () => this.updateFavoriteLocal(gameId, false),
        error: () => this.updateFavoriteLocal(gameId, false), // Fallback offline
      });
    } else {
      this.wishlistService.addFavorite(gameId).subscribe({
        next: () => this.updateFavoriteLocal(gameId, true),
        error: () => this.updateFavoriteLocal(gameId, true), // Fallback offline
      });
    }
  }

  private updateFavoriteLocal(gameId: number, add: boolean): void {
    this.favoritedIds.update((ids) => {
      const updated = new Set(ids);
      add ? updated.add(gameId) : updated.delete(gameId);
      return updated;
    });
  }
}
