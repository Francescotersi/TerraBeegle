import { Component, DestroyRef, ElementRef, computed, effect, input, output, inject, signal, untracked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { GridComponentProps } from '../../grid.model';
import { GridGameActionsService } from '../../services/grid-game-actions.service';
import { getReleaseYear } from '../../utils/grid.utils';
import { GAME_ACTIONS_STYLES } from '../../styles/game-actions.styles';
import { GAME_BADGES_STYLES } from '../../styles/game-badges.styles';

@Component({
  imports: [LiquidGlassComponent],
  selector: 'app-game-card',
  // On the host (always in its grid place, and the wide card is its child): coming back on a card that is
  // closing (pointer-events: none) still opens it again
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'hoverEnd.emit()',
  },
  template: `
    <div
      class="card game-card"
      [class.is-hovered]="isActive()"
      [class.is-closing]="isClosing()"
      [class.is-expanded]="isExpanded()"
      [class.is-mobile-selected]="isMobileSelected()"
      [style.width.px]="isExpanded() ? expansion()!.width : null"
      [style.left.px]="isExpanded() ? expansion()!.left : null"
      (click)="cardClick.emit($event)"
    >
      <!-- Image container -->
      <div
        class="game-cover-container"
        [style.height.px]="isExpanded() ? expansion()!.height : null"
        [style.clip-path]="coverClip()"
      >
        <img
          [src]="game().coverImage"
          [alt]="game().name"
          class="card-img game-cover"
          [attr.loading]="index() === 0 ? 'eager' : 'lazy'"
          [attr.fetchpriority]="index() === 0 ? 'high' : 'low'"
          width="264"
          height="374"
          decoding="async"
        />

        <!-- Hover: the trailer (muted, autoplay, loop) over the cover; pointer-events: none so the click opens the game -->
        @if (isExpanded() && trailerUrl(); as url) {
          <iframe
            class="game-trailer"
            [src]="url"
            [title]="game().name + ' trailer'"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerpolicy="strict-origin-when-cross-origin"
            tabindex="-1"
          ></iframe>
        }

        <!-- Title overlay -->
        <div class="card-img-overlay d-flex flex-column justify-content-end p-2.5 card-overlay-title">
          <h3 class="card-title fw-bold mb-0 text-white text-truncate" [title]="game().name">
            {{ game().name }}
          </h3>
        </div>
      </div>

      <!-- Details panel -->
      @if (isActive()) {
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
                  [class.is-active]="actions.wishlistedIds().has(game().rawgGameId)"
                  type="button"
                  [title]="actions.wishlistedIds().has(game().rawgGameId) ? 'Remove from Wishlist' : 'Add to Wishlist'"
                  (click)="actions.onToggleWishlist($event, game().rawgGameId)"
                >
                  @if (actions.wishlistedIds().has(game().rawgGameId)) {
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
                  class="heart-container"
                  [class.is-active]="actions.favoritedIds().has(game().rawgGameId)"
                  type="button"
                  [title]="actions.favoritedIds().has(game().rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
                  (click)="actions.onToggleFavorite($event, game().rawgGameId, game().name)"
                  [attr.aria-label]="actions.favoritedIds().has(game().rawgGameId) ? 'Remove from Favorites' : 'Add to Favorites'"
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
                    @if (actions.animatingFavoriteId() === game().rawgGameId) {
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

                <button class="btn-action-circle btn-more ms-auto" type="button" title="Game details" (click)="openDetails($event)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              <!-- Rating / Metacritic -->
              <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span class="rating-box" [title]="'Rating: ' + game().rating">
                  ★ {{ game().rating }}
                </span>
                @if (game().metacritic) {
                  <span
                    class="metacritic-box"
                    [class.meta-green]="game().metacritic >= 80"
                    [class.meta-yellow]="game().metacritic >= 50 && game().metacritic < 80"
                    [class.meta-red]="game().metacritic < 50"
                    [title]="'Metacritic: ' + game().metacritic"
                  >
                    {{ game().metacritic }}
                  </span>
                }
                @if (game().released) {
                  <span class="text-body-secondary small fw-medium">
                    {{ getReleaseYear(game().released) }}
                  </span>
                }
              </div>

              <!-- Categories / genres -->
              @if (game().genres && game().genres.length > 0) {
                <div class="game-genres-line text-truncate">
                  {{ game().genres.slice(0, 3).join(' • ') }}
                </div>
              } @else if (game().tags && game().tags.length > 0) {
                <div class="game-genres-line text-truncate">
                  {{ game().tags.slice(0, 3).join(' • ') }}
                </div>
              }
            </div>
          </app-liquid-glass>
        </div>
      }
    </div>
  `,
  styles: [
    `
    /* Keeps the card's place in the grid (also while the hovered card floats above it). On the host, not on
       the column: the column also contains the gutter, so it was taller than the card (empty space between rows) */
    :host {
      display: block;
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
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

    @media (min-width: 992px) {
      /* Wide hover: same height, 16:9 width (the trailer shape), above the neighbours without moving them */
      .game-card.is-hovered.is-expanded {
        transform: none;
      }

      /* The YouTube player already shows the video title on top */
      .game-card.is-expanded .card-overlay-title {
        display: none !important;
      }

      /* The clip-path (set in coverClip) goes from the original card to the wide card and back */
      .game-card.is-expanded .game-cover-container {
        aspect-ratio: auto;
        transition: clip-path 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Mouse left: the same animations backwards, then the card goes back to its place (see CLOSE_MS) */
      .game-card.is-closing {
        z-index: 999 !important; /* below a card that is opening at the same time */
        transform: none !important; /* the zoomed card (no trailer) shrinks back with the transform transition */
        pointer-events: none;
      }

      .game-card.is-closing.is-expanded .game-cover-container {
        transition-duration: 0.26s;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      .game-card.is-closing .game-trailer {
        animation: trailerFadeOut 0.18s ease forwards;
      }

      .game-card.is-closing .game-details-liquid {
        animation: detailsCollapseOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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

      .game-card.is-hovered .game-cover-container {
        border-radius: 14px 14px 0 0;
        border-bottom: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
    }

    @media (max-width: 991.98px) {
      .game-details-liquid {
        display: none !important;
      }

      .game-card.is-mobile-selected .game-cover-container {
        border-color: var(--tb-accent);
        box-shadow: 0 0 16px var(--tb-accent-glow);
      }
    }

    .game-cover-container {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4; /* vertical card: IGDB covers are portrait (264 x 374) */
      overflow: hidden;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      transition: border-radius 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .game-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .game-trailer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      pointer-events: none;
      background: #000;
      animation: trailerFadeIn 0.4s ease 0.15s both;
    }

    @keyframes trailerFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes trailerFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes detailsCollapseOut {
      from {
        opacity: 1;
        clip-path: inset(0 0 0 0);
      }
      to {
        opacity: 0;
        clip-path: inset(0 0 100% 0);
      }
    }

    .card-overlay-title .card-title {
      font-size: 1rem;
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
    `,
    GAME_ACTIONS_STYLES,
    GAME_BADGES_STYLES,
  ],
})
export class GameCardComponent {
  readonly game = input.required<GridComponentProps>();
  readonly index = input<number>(0);
  readonly isHovered = input<boolean>(false);
  readonly isMobileSelected = input<boolean>(false);
  // Wide hover with the trailer (grid). The carousel keeps the old zoom: its scroll area would cut a wider card
  readonly expandable = input<boolean>(true);

  readonly hoverStart = output<void>();
  readonly detailsClick = output<void>();
  readonly hoverEnd = output<void>();
  readonly cardClick = output<MouseEvent>();

  protected readonly actions = inject(GridGameActionsService);
  protected readonly getReleaseYear = getReleaseYear;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly sanitizer = inject(DomSanitizer);

  // Size and position of the wide hover card, measured when the mouse enters (null = normal hover)
  protected readonly expansion = signal<{ width: number; height: number; left: number; clipLeft: number; clipRight: number } | null>(null);
  // Short "closing" phase after the mouse leaves, so the card animates back instead of disappearing
  protected readonly isClosing = signal(false);
  protected readonly isActive = computed(() => this.isHovered() || this.isClosing());
  protected readonly isExpanded = computed(() => this.isActive() && this.expansion() !== null);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  // false = clipped to the original card, true = the whole wide card (the CSS transition animates between them)
  private readonly clipOpen = signal(false);
  private openFrame = 0;
  protected readonly coverClip = computed(() => {
    const e = this.expansion();
    if (!this.isExpanded() || !e) return null;
    return this.clipOpen()
      ? 'inset(0px 0px 0px 0px round 14px 14px 0px 0px)'
      : `inset(0px ${e.clipRight}px 0px ${e.clipLeft}px round 14px)`;
  });
  private static readonly CLOSE_MS = 260; // = the longest closing animation in the styles

  constructor() {
    let wasHovered = false;
    effect(() => {
      const hovered = this.isHovered();
      untracked(() => {
        if (wasHovered && !hovered) this.startClosing();
        if (!wasHovered && hovered) this.openClip();
        wasHovered = hovered;
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.clearCloseTimer();
      cancelAnimationFrame(this.openFrame);
    });
  }

  // First frame clipped to the original card, then the whole card: the transition makes it open to the sides
  private openClip(): void {
    this.clipOpen.set(false);
    cancelAnimationFrame(this.openFrame);
    this.openFrame = requestAnimationFrame(() => {
      this.openFrame = requestAnimationFrame(() => this.clipOpen.set(true));
    });
  }

  private startClosing(): void {
    this.clearCloseTimer();
    cancelAnimationFrame(this.openFrame);
    this.isClosing.set(true);
    this.clipOpen.set(false); // back to the original card size, animated by the transition
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;
      this.isClosing.set(false);
      if (!this.isHovered()) this.expansion.set(null);
    }, GameCardComponent.CLOSE_MS);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  // YouTube embed: muted (browsers block autoplay with sound), no controls, looping
  protected readonly trailerUrl = computed<SafeResourceUrl | null>(() => {
    const id = this.game().trailer;
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null; // only a YouTube id can reach the iframe URL
    const params = `autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}?${params}`);
  });

  // Measures the wide card: same height, 16:9 width, centred on the card but kept inside the grid
  protected onMouseEnter(): void {
    // Back on the card while it was closing: stop closing, it opens again
    this.clearCloseTimer();
    this.isClosing.set(false);
    this.expansion.set(null);
    if (this.expandable() && this.game().trailer && window.innerWidth >= 992) {
      const card = this.host.nativeElement.getBoundingClientRect();
      const area = (this.host.nativeElement.closest('.grid-wrapper') ?? document.body).getBoundingClientRect();
      const width = Math.min(card.height * 16 / 9, area.width);
      let left = (card.width - width) / 2;
      if (card.left + left < area.left) left = area.left - card.left;
      if (card.left + left + width > area.right) left = area.right - width - card.left;
      this.expansion.set({
        width,
        height: card.height,
        left,
        clipLeft: -left,
        clipRight: width - card.width + left,
      });
    }
    this.hoverStart.emit();
  }

  // Opens the details page without also triggering the card click
  protected openDetails(event: MouseEvent): void {
    event.stopPropagation();
    this.detailsClick.emit();
  }
}
