import { Component, ElementRef, signal, computed, input, output, inject, OnInit, HostListener, PLATFORM_ID, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GridComponentProps } from './grid.model';
import { GridGameActionsService } from './services/grid-game-actions.service';
import { getReleaseYear } from './utils/grid.utils';
import { GameCardComponent } from './components/game-card/game-card.component';
import { MobileDetailSheetComponent } from './components/mobile-detail-sheet/mobile-detail-sheet.component';
import { createCarouselScroll } from '../../ui/carousel/carousel-scroll';

// Re-exported so the existing imports from './grid.component' keep working
export type { GridComponentProps } from './grid.model';

@Component({
  imports: [GameCardComponent, MobileDetailSheetComponent],
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
      } @else if (layout() === 'carousel') {
        <div class="similar-carousel-wrapper">
          <button
            type="button"
            class="similar-carousel-btn prev"
            [class.is-hidden]="!carousel.canPrev()"
            [inert]="!carousel.canPrev()"
            aria-label="Previous games"
            (click)="carousel.scroll(-1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div #carouselTrack class="similar-carousel-track" (scroll)="carousel.onScroll()">
            @for (game of games(); track game.rawgGameId; let idx = $index) {
              <div class="similar-carousel-item">
                <app-game-card
                  [expandable]="false"
                  [game]="game"
                  [index]="idx"
                  [isHovered]="hoveredGameId() === game.rawgGameId"
                  [isMobileSelected]="isMobileSheetOpen() && selectedMobileGame()?.rawgGameId === game.rawgGameId"
                  (hoverStart)="onMouseEnter(game.rawgGameId)"
                  (hoverEnd)="onMouseLeave()"
                  (cardClick)="onCardClick(game, idx, $event)"
                  (detailsClick)="openDetails(game.rawgGameId)"
                />
              </div>
            }
          </div>
          <button
            type="button"
            class="similar-carousel-btn next"
            [class.is-hidden]="!carousel.canNext()"
            [inert]="!carousel.canNext()"
            aria-label="Next games"
            (click)="carousel.scroll(1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      } @else {
        <div
          class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xxl-6 gx-3 gy-3 gx-md-4 gy-md-3 justify-content-center"
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
                (detailsClick)="openDetails(game.rawgGameId)"
              />
            </div>
          }
        </div>

        @if (hasMoreGames()) {
          <div class="text-center mt-4 mb-3">
            <button
              class="btn btn-show-more px-4 py-2 fw-semibold shadow-sm"
              type="button"
              [disabled]="isLoadingMore()"
              (click)="showMore()"
            >
              {{ isLoadingMore() ? 'Loading...' : 'Show More' }}
            </button>
          </div>
        }
      }

      <app-mobile-detail-sheet
        [game]="selectedMobileGame()"
        [isOpen]="isMobileSheetOpen()"
        (closed)="closeMobileSheet($event)"
        (detailsClick)="openDetails($event)"
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

    .similar-carousel-wrapper {
      position: relative;
    }
    .similar-carousel-track {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      padding: 4px 2px;
    }
    .similar-carousel-track::-webkit-scrollbar {
      display: none;
    }
    .similar-carousel-item {
      position: relative;
      flex: 0 0 160px;
      aspect-ratio: 3 / 4;
      scroll-snap-align: start;
    }
    .similar-carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(10px);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 1;
      transition:
        opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
        background-color 0.2s ease,
        border-color 0.2s ease;
    }
    .similar-carousel-btn svg {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .similar-carousel-btn:hover {
      background: rgba(15, 23, 42, 0.94);
      border-color: var(--tb-accent);
    }
    .similar-carousel-btn.prev:hover svg {
      transform: translateX(-2px);
    }
    .similar-carousel-btn.next:hover svg {
      transform: translateX(2px);
    }
    .similar-carousel-btn:active {
      transform: translateY(-50%) scale(0.94);
    }
    .similar-carousel-btn.is-hidden {
      opacity: 0;
      transform: translateY(-50%) scale(0.86);
      pointer-events: none;
    }
    .similar-carousel-btn.prev {
      left: 8px;
    }
    .similar-carousel-btn.next {
      right: 8px;
    }
  `,
})
export class GridComponent implements OnInit {
  readonly title = input<string>("Beegle's Games Catalog");
  readonly games = input<GridComponentProps[]>([]);
  readonly emptyMessage = input<string>('No games found.');
  readonly layout = input<'grid' | 'carousel'>('grid');
  private readonly carouselTrack = viewChild<ElementRef<HTMLElement>>('carouselTrack');
  protected readonly carousel = createCarouselScroll(this.carouselTrack, 260, this.games);
  // Server paging (catalog): the parent has more pages and loads the next one on loadMore
  readonly canLoadMore = input<boolean>(false);
  readonly isLoadingMore = input<boolean>(false);
  readonly loadMore = output<void>();

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
    return this.visibleCount() < this.games().length || this.canLoadMore();
  });

  // Shows the next 24 games; when they are not downloaded yet, asks the parent for the next page
  protected showMore(): void {
    this.visibleCount.update((count) => count + this.step);
    if (this.visibleCount() > this.games().length && this.canLoadMore()) {
      this.loadMore.emit();
    }
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Desktop: the card opens the details page; mobile: it opens the bottom sheet first
    if (window.innerWidth >= 992) {
      this.openDetails(game.rawgGameId);
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

  // Opens /game/{id}
  protected openDetails(gameId: number): void {
    this.isMobileSheetOpen.set(false);
    this.router.navigate(['/game', gameId]);
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
