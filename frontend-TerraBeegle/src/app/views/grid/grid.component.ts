import { Component, signal, computed, input, inject, OnInit, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GridComponentProps } from './grid.model';
import { GridGameActionsService } from './services/grid-game-actions.service';
import { getReleaseYear } from './utils/grid.utils';
import { GameCardComponent } from './components/game-card/game-card.component';
import { MobileDetailSheetComponent } from './components/mobile-detail-sheet/mobile-detail-sheet.component';

// Re-exported so the existing imports from './grid.component' keep working
export type { GridComponentProps } from './grid.model';

@Component({
  imports: [GameCardComponent, MobileDetailSheetComponent],
  selector: 'app-grid-component',
  providers: [GridGameActionsService],
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
          class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xxl-4 gx-3 gy-2 gx-md-4 gy-md-2 justify-content-center"
        >
          @for (game of visibleGames(); track game.rawgGameId; let idx = $index) {
            <div class="col game-col">
              <app-game-card
                [game]="game"
                [index]="idx"
                [isHovered]="hoveredGameId() === game.rawgGameId"
                [isMobileSelected]="isMobileSheetOpen() && selectedMobileGame()?.rawgGameId === game.rawgGameId"
                (hoverStart)="onMouseEnter(game.rawgGameId)"
                (hoverEnd)="onMouseLeave()"
                (cardClick)="onCardClick(game, idx, $event)"
              />
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

      <app-mobile-detail-sheet
        [game]="selectedMobileGame()"
        [isOpen]="isMobileSheetOpen()"
        (closed)="closeMobileSheet($event)"
      />
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

  protected readonly mobileDismissIndexOffset = 1;

  protected readonly hoveredGameId = signal<number | null>(null);
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  // State of the mobile detail card
  protected readonly selectedMobileGame = signal<GridComponentProps | null>(null);
  protected readonly isMobileSheetOpen = signal<boolean>(false);
  private openedCardIndex = 0;
  private openedScrollY = 2;
  private singleCardScrollStep = 210;

  // ---- Show More functuonality ----
  private readonly step = 24;
  protected readonly visibleCount = signal(24);

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
    if (isPlatformBrowser(this.platformId) && window.innerWidth < 992) {
      return;
    }
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => {
      this.hoveredGameId.set(gameId);
    }, 300);
  }

  protected onMouseLeave(): void {
    this.clearHoverTimer();
    this.hoveredGameId.set(null);
  }

  private clearHoverTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  protected onCardClick(game: GridComponentProps, index: number, event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId) || window.innerWidth >= 992) {
      return;
    }

    this.selectedMobileGame.set(game);
    this.isMobileSheetOpen.set(true);
    this.openedCardIndex = index;
    this.openedScrollY = window.scrollY;

    const colEl = (event.currentTarget as HTMLElement | null)?.closest('.game-col') as HTMLElement | null;
    if (colEl && colEl.offsetHeight > 0) {
      this.singleCardScrollStep = colEl.offsetHeight + 12;
    }
  }

  protected closeMobileSheet(event?: Event): void {
    event?.stopPropagation();
    if (event?.target instanceof HTMLElement) {
      event.target.blur();
    }
    this.isMobileSheetOpen.set(false);
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (!this.isMobileSheetOpen() || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const scrolledPx = Math.abs(window.scrollY - this.openedScrollY);
    const scrolledIndices = scrolledPx / this.singleCardScrollStep;

    if (scrolledIndices >= this.mobileDismissIndexOffset) {
      this.closeMobileSheet();
    }
  }

  protected getReleaseYear(releasedDate: string): string {
    return getReleaseYear(releasedDate);
  }

  // ---- Wishlist / Favorites functionality (logic in GridGameActionsService) ----
  private readonly actions = inject(GridGameActionsService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly wishlistedIds = this.actions.wishlistedIds;
  protected readonly favoritedIds = this.actions.favoritedIds;
  protected readonly animatingFavoriteId = this.actions.animatingFavoriteId;

  ngOnInit(): void {
    this.actions.loadUserCollections();
  }

  protected onToggleWishlist(event: MouseEvent, gameId: number): void {
    this.actions.onToggleWishlist(event, gameId);
  }

  protected onToggleFavorite(event: MouseEvent, gameId: number): void {
    this.actions.onToggleFavorite(event, gameId);
  }
}
