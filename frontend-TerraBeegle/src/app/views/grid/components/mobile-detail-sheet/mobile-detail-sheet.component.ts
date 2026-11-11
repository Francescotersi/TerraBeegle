import { Component, input, output, inject } from '@angular/core';
import { GridComponentProps } from '../../grid.model';
import { GridGameActionsService } from '../../services/grid-game-actions.service';
import { getReleaseYear } from '../../utils/grid.utils';
import { GAME_ACTIONS_STYLES } from '../../styles/game-actions.styles';
import { GAME_BADGES_STYLES } from '../../styles/game-badges.styles';

@Component({
  selector: 'app-mobile-detail-sheet',
  template: `
    <!-- ==================== MOBILE DETAIL BOTTOM SHEET (< 992px) ==================== -->
    <div
      class="mobile-detail-sheet d-lg-none"
      [class.show]="isOpen() && !!game()"
      [inert]="!isOpen()"
    >
      @if (game(); as mobileGame) {
        <div class="mobile-sheet-top d-flex gap-3 p-3 pb-2">
          <img
            [src]="mobileGame.coverImage"
            [alt]="mobileGame.name"
            class="mobile-sheet-poster"
          />

          <div class="mobile-sheet-info flex-grow-1 min-w-0">
            <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
              <h3 class="mobile-sheet-title fw-bold mb-0 text-truncate" [title]="mobileGame.name">
                {{ mobileGame.name }}
              </h3>
              <button
                type="button"
                class="mobile-sheet-close flex-shrink-0"
                (click)="closed.emit($event)"
                aria-label="Chiudi dettagli"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="mobile-sheet-meta d-flex align-items-center gap-2 mb-2 flex-wrap">
              <span class="rating-box" [title]="'Rating: ' + mobileGame.rating">
                ★ {{ mobileGame.rating }}
              </span>
              @if (mobileGame.metacritic) {
                <span
                  class="metacritic-box"
                  [class.meta-green]="mobileGame.metacritic >= 80"
                  [class.meta-yellow]="mobileGame.metacritic >= 50 && mobileGame.metacritic < 80"
                  [class.meta-red]="mobileGame.metacritic < 50"
                  [title]="'Metacritic: ' + mobileGame.metacritic"
                >
                  {{ mobileGame.metacritic }}
                </span>
              }
              @if (mobileGame.released) {
                <span class="text-body-secondary small fw-medium">
                  {{ getReleaseYear(mobileGame.released) }}
                </span>
              }
            </div>

            @if (mobileGame.genres && mobileGame.genres.length > 0) {
              <div class="game-genres-line text-truncate mb-1">
                {{ mobileGame.genres.slice(0, 3).join(' • ') }}
              </div>
            } @else if (mobileGame.tags && mobileGame.tags.length > 0) {
              <div class="game-genres-line text-truncate mb-1">
                {{ mobileGame.tags.slice(0, 3).join(' • ') }}
              </div>
            }

            <p class="mobile-sheet-desc mb-0">
              {{ mobileGame.description || ('Scopri ' + mobileGame.name + ', sviluppato da ' + (mobileGame.developer || mobileGame.publisher || 'TerraBeegle Studio') + '.') }}
            </p>
          </div>
        </div>

        <div class="mobile-sheet-actions d-flex justify-content-around align-items-center px-3 py-2">
          <!-- Wishlist -->
          <div class="mobile-action-item d-flex flex-column align-items-center gap-1">
            <button
              class="btn-action-circle mobile-btn-scale"
              [class.is-active]="actions.wishlistedIds().has(mobileGame.rawgGameId)"
              type="button"
              [title]="actions.wishlistedIds().has(mobileGame.rawgGameId) ? 'Remove from Wishlist' : 'Add to Wishlist'"
              (click)="actions.onToggleWishlist($event, mobileGame.rawgGameId)"
            >
              @if (actions.wishlistedIds().has(mobileGame.rawgGameId)) {
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
            <span class="mobile-action-label">
              {{ actions.wishlistedIds().has(mobileGame.rawgGameId) ? 'In Wishlist' : 'Wishlist' }}
            </span>
          </div>

          <!-- Favorites -->
          <div class="mobile-action-item d-flex flex-column align-items-center gap-1">
            <button
              class="heart-container"
              [class.is-active]="actions.favoritedIds().has(mobileGame.rawgGameId)"
              type="button"
              [title]="actions.favoritedIds().has(mobileGame.rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
              (click)="actions.onToggleFavorite($event, mobileGame.rawgGameId)"
              [attr.aria-label]="actions.favoritedIds().has(mobileGame.rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
            >
              <div class="svg-container">
                <svg xmlns="http://www.w3.org/2000/svg" class="svg-outline" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                  </path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="svg-filled" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                  </path>
                </svg>
                @if (actions.animatingFavoriteId() === mobileGame.rawgGameId) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="svg-celebrate" viewBox="0 0 100 100" aria-hidden="true">
                    <polygon points="10,10 20,20"></polygon>
                    <polygon points="10,50 20,50"></polygon>
                    <polygon points="20,80 30,70"></polygon>
                    <polygon points="90,10 80,20"></polygon>
                    <polygon points="90,50 80,50"></polygon>
                    <polygon points="80,80 70,70"></polygon>
                  </svg>
                }
              </div>
            </button>
            <span class="mobile-action-label">Favorites</span>
          </div>

          <!-- Game Details -->
          <div class="mobile-action-item d-flex flex-column align-items-center gap-1">
            <button
              class="btn-action-circle btn-more mobile-btn-scale"
              type="button"
              title="Game details"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <span class="mobile-action-label">Details</span>
          </div>
        </div>

        <!-- Barra inferiore: -->
        <button
          type="button"
          class="mobile-sheet-footer d-flex align-items-center justify-content-between w-100 px-3 py-2"
        >
          <div class="d-flex align-items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span class="fw-semibold small">Details</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [
    GAME_ACTIONS_STYLES,
    GAME_BADGES_STYLES,
    `
    /* ==================== MOBILE DETAIL BOTTOM SHEET (< 992px) ==================== */
    .mobile-detail-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1090;
      border-radius: 24px 24px 0 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(24px) saturate(190%);
      -webkit-backdrop-filter: blur(24px) saturate(190%);
      border-top: 1px solid var(--tb-glass-border);
      box-shadow:
        0 -14px 40px rgba(0, 0, 0, 0.22),
        inset 0 1px 1px rgba(255, 255, 255, 0.6);
      color: var(--tb-text);
      overflow: hidden;

      /* Stato chiuso: nascosto in basso sotto il bordo inferiore dello schermo */
      transform: translateY(105%);
      visibility: hidden;
      pointer-events: none;
      transition:
        transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
        visibility 0.38s;
    }

    :host-context([data-bs-theme="dark"]) .mobile-detail-sheet {
      background: rgba(8, 18, 38, 0.96);
      box-shadow:
        0 -14px 42px rgba(0, 0, 0, 0.72),
        inset 0 1px 1px rgba(46, 217, 231, 0.25);
    }

    /* Stato aperto: sale dal basso verso l'alto e resta ancorato allo schermo */
    .mobile-detail-sheet.show {
      transform: translateY(0);
      visibility: visible;
      pointer-events: auto;
    }

    .mobile-sheet-poster {
      width: 94px;
      height: 126px;
      object-fit: cover;
      border-radius: 10px;
      flex-shrink: 0;
      border: 1px solid var(--tb-glass-border);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .mobile-sheet-title {
      font-size: 1.08rem;
      line-height: 1.25;
      color: var(--tb-text);
    }

    .mobile-sheet-close {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-input-bg);
      color: var(--tb-text);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mobile-sheet-close:hover {
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
      border-color: var(--tb-accent);
    }

    .mobile-sheet-meta {
      font-size: 0.78rem;
      color: var(--tb-text-muted);
      font-weight: 500;
    }

    .mobile-sheet-genres {
      color: var(--tb-accent);
      font-weight: 600;
      max-width: 170px;
    }

    .mobile-sheet-desc {
      font-size: 0.82rem;
      line-height: 1.38;
      color: var(--tb-text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Pulsanti azione nella Bottom Sheet Mobile: ingranditi e senza box-shadow */
    .mobile-detail-sheet .btn-action-circle,
    .mobile-detail-sheet .heart-container {
      width: 44px;
      height: 44px;
      box-shadow: none !important;
      outline: none !important;
      -webkit-tap-highlight-color: transparent;
    }

    .mobile-detail-sheet .btn-action-circle:hover,
    .mobile-detail-sheet .btn-action-circle:active,
    .mobile-detail-sheet .btn-action-circle:focus,
    .mobile-detail-sheet .btn-action-circle:focus-visible,
    .mobile-detail-sheet .btn-action-circle.is-active,
    .mobile-detail-sheet .heart-container:hover,
    .mobile-detail-sheet .heart-container:active,
    .mobile-detail-sheet .heart-container:focus,
    .mobile-detail-sheet .heart-container:focus-visible,
    .mobile-detail-sheet .heart-container.is-active {
      box-shadow: none !important;
      outline: none !important;
      transform: none !important;
    }

    .mobile-detail-sheet .btn-action-circle svg {
      width: 17px;
      height: 17px;
    }

    .mobile-detail-sheet .heart-container .svg-outline,
    .mobile-detail-sheet .heart-container .svg-filled {
      width: 20px;
      height: 20px;
    }

    .mobile-detail-sheet .heart-container .svg-celebrate {
      width: 50px;
      height: 50px;
    }

    .mobile-action-label {
      font-size: 0.72rem;
      color: var(--tb-text-muted);
      font-weight: 500;
    }

    .mobile-sheet-footer {
      background: transparent;
      border: none;
      border-top: 1px solid var(--bs-border-color);
      color: var(--tb-text);
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .mobile-sheet-footer:hover {
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
    }
    `,
  ],
})
export class MobileDetailSheetComponent {
  readonly game = input<GridComponentProps | null>(null);
  readonly isOpen = input<boolean>(false);

  readonly closed = output<Event>();

  protected readonly actions = inject(GridGameActionsService);
  protected readonly getReleaseYear = getReleaseYear;
}
