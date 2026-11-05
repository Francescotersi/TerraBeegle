import { Component, signal, computed, input, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';
import { AuthService } from '../../services/auth.service';

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

                          <button
                            class="btn-action-circle"
                            [class.is-active]="favoritedIds().has(game.rawgGameId)"
                            type="button"
                            [title]="favoritedIds().has(game.rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
                            (click)="onToggleFavorite($event, game.rawgGameId)"
                          >
                            @if (favoritedIds().has(game.rawgGameId)) {
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            } @else {
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            }
                          </button>

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

    /* Pannello dettagli Liquid Glass: sincronizzato istantaneamente con l'espansione della card */
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

    /* Pulsanti circolari: 32px rotondi */
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

    .game-genres-line {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--tb-text);
    }

    /* Badge Metacritic in stile originale con codifica colori dinamica */
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
      this.router.navigate(['/login']);
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
      this.router.navigate(['/login']);
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
