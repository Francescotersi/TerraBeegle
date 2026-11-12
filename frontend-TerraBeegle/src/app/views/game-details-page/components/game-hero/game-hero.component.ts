import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GameDetailsDTO } from '../../../../models-services/game.model';
import { GridGameActionsService } from '../../../grid/services/grid-game-actions.service';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GAME_BADGES_STYLES } from '../../../grid/styles/game-badges.styles';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';
import { joinNames, toTen } from '../../utils/game-details.utils';

// Top of the details page: cover, title, scores, main facts and the Favorites / Wishlist buttons
@Component({
  selector: 'app-game-hero',
  standalone: true,
  imports: [DatePipe, LiquidGlassComponent],
  template: `
    @let g = game();
    <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
      <div class="hero" [style.--hero-image]="heroImage()">
        <div class="hero-content d-flex flex-column flex-md-row gap-4 p-3 p-md-4">
          <img
            class="hero-cover flex-shrink-0 align-self-center align-self-md-start"
            [src]="g.cover || fallbackCover"
            [alt]="'Cover of ' + g.name"
            width="264"
            height="374"
          />

          <div class="flex-grow-1 min-w-0">
            @if (g.gameType && g.gameType !== 'Main Game') {
              <span class="type-chip mb-2">{{ g.gameType }}</span>
            }
            <h1 class="game-title fw-bold mb-2">{{ g.name }}</h1>

            <div class="d-flex align-items-center gap-2 flex-wrap mb-3">
              @if (g.rating != null) {
                <span class="rating-box" [title]="'User rating, ' + (g.ratingCount ?? 0) + ' votes'">
                  ★ {{ toTen(g.rating) }}
                </span>
              }
              @if (g.criticRating != null) {
                <span
                  class="metacritic-box"
                  [class.meta-green]="g.criticRating >= 80"
                  [class.meta-yellow]="g.criticRating >= 50 && g.criticRating < 80"
                  [class.meta-red]="g.criticRating < 50"
                  [title]="'Critic score, ' + (g.criticRatingCount ?? 0) + ' reviews'"
                >
                  {{ g.criticRating }}
                </span>
                <span class="small text-body-secondary">Critics</span>
              }
              @if (g.pegiRating) {
                <span class="pegi-box" [title]="pegiTitle()">PEGI {{ g.pegiRating }}</span>
              }
              @if (g.releaseDate) {
                <span class="small fw-medium text-body-secondary">{{ g.releaseDate | date: 'longDate' }}</span>
              }
            </div>

            @if (g.genres?.length) {
              <div class="d-flex flex-wrap gap-2 mb-3">
                @for (genre of g.genres; track genre.id) {
                  <span class="chip">{{ genre.name }}</span>
                }
              </div>
            }

            <dl class="facts mb-3">
              @if (g.developers?.length) {
                <dt>Developer</dt>
                <dd>{{ joinNames(g.developers) }}</dd>
              }
              @if (g.publishers?.length) {
                <dt>Publisher</dt>
                <dd>{{ joinNames(g.publishers) }}</dd>
              }
              @if (g.platforms?.length) {
                <dt>Platforms</dt>
                <dd class="d-flex flex-wrap gap-1">
                  @for (platform of g.platforms; track platform.apiPlatformId) {
                    <span class="platform-chip" [title]="platform.name">{{ platform.abbreviation || platform.name }}</span>
                  }
                </dd>
              }
              @if (g.gameStatus) {
                <dt>Status</dt>
                <dd>{{ g.gameStatus }}</dd>
              }
            </dl>

            <div class="d-flex flex-wrap gap-2">
              <button
                type="button"
                class="btn btn-gradient d-inline-flex align-items-center gap-2"
                [class.is-active]="actions.favoritedIds().has(g.apiGameId)"
                (click)="actions.onToggleFavorite($event, g.apiGameId)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" [attr.fill]="actions.favoritedIds().has(g.apiGameId) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.3 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.7 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z"></path>
                </svg>
                {{ actions.favoritedIds().has(g.apiGameId) ? 'In Favorites' : 'Add to Favorites' }}
              </button>
              <button
                type="button"
                class="btn btn-glass d-inline-flex align-items-center gap-2"
                [class.is-active]="actions.wishlistedIds().has(g.apiGameId)"
                (click)="actions.onToggleWishlist($event, g.apiGameId)"
              >
                @if (actions.wishlistedIds().has(g.apiGameId)) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  In Wishlist
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add to Wishlist
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-liquid-glass>
  `,
  styles: [
    GAME_BADGES_STYLES,
    GAME_DETAILS_STYLES,
    `
    /* The first artwork (or the cover) blurred behind the content */
    .hero {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--hero-image);
      background-size: cover;
      background-position: center;
      filter: blur(28px) saturate(140%);
      opacity: 0.35;
      transform: scale(1.15);
    }
    .hero-content {
      position: relative;
    }

    .hero-cover {
      width: 180px;
      height: auto;
      aspect-ratio: 264 / 374;
      object-fit: cover;
      border-radius: 14px;
      border: 1px solid var(--tb-glass-border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    @media (min-width: 768px) {
      .hero-cover {
        width: 220px;
      }
    }

    .game-title {
      font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.4rem);
      line-height: 1.15;
    }

    .pegi-box {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 7px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 800;
      background: #0f172a;
      color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
  `,
  ],
})
export class GameHeroComponent {
  readonly game = input.required<GameDetailsDTO>();

  // Provided by the details page, so the hero and the page share the same favorites / wishlist state
  protected readonly actions = inject(GridGameActionsService);

  protected readonly fallbackCover = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg';
  protected readonly toTen = toTen;
  protected readonly joinNames = joinNames;

  // Blurred background: first artwork, else first screenshot, else the cover
  protected readonly heroImage = computed(() => {
    const g = this.game();
    const image = g.artworks?.[0] || g.screenshots?.[0] || g.cover;
    return image ? `url("${image}")` : 'none';
  });

  protected readonly pegiTitle = computed(() => {
    const descriptions = this.game().pegiRatingDescription;
    return descriptions?.length ? descriptions.join(', ') : 'PEGI age rating';
  });
}
