import { Component, signal, computed, OnInit, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { MOCK_GAMES } from '../../mocks/games.mock';
import { GameService } from '../../services/game.service';
import { AlertService } from '../../services/alert.service';
import { CatalogFilters, CatalogFiltersService } from '../../services/catalog-filters.service';

// Games per request; the grid also shows 24 more on each "Show More"
const PAGE_SIZE = 24;

@Component({
  imports: [GridComponent, SpinnerComponent],
  standalone: true,
  selector: 'app-catalog-page',
  template: `
    @if (isLoading()) {
      <div class="d-flex flex-column align-items-center justify-content-center py-5 my-4">
        <app-spinner size="lg" />
      </div>
    } @else if (errorMessage()) {
      <div class="alert alert-danger mx-auto my-4 text-center" style="max-width: 600px;">
        {{ errorMessage() }}
      </div>
    } @else {
      @if (isUsingMock()) {
        <div
          class="alert alert-warning py-2 px-3 mx-auto my-3 text-center d-flex align-items-center justify-content-center gap-2"
          style="max-width: 620px; border-radius: 10px;"
          role="status"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span class="small fw-medium">
            API unavailable: showing sample games.
          </span>
        </div>
      }
      <app-grid-component
        [title]="title()"
        [games]="catalogGames()"
        [canLoadMore]="!isUsingMock() && currentPage() < totalPages()"
        [isLoadingMore]="isLoadingMore()"
        (loadMore)="loadNextPage()"
        [emptyMessage]="emptyMessage()"
      >
      </app-grid-component>
    }
  `,
})
export class CatalogPage implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly filtersService = inject(CatalogFiltersService);
  private readonly alertService = inject(AlertService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly catalogGames = signal<GridComponentProps[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isUsingMock = signal<boolean>(false);
  // Search text + filters from the URL (header search and sidebar)
  readonly filters = signal<CatalogFilters>(this.filtersService.filters());
  readonly searchTerm = computed(() => this.filters().search);
  private readonly isFiltered = computed(() => this.filtersService.hasFilters(this.filters()));

  readonly title = computed(() => {
    if (this.searchTerm()) return `Results for “${this.searchTerm()}”`;
    return this.isFiltered() ? 'Filtered games' : 'Games Catalog';
  });

  readonly emptyMessage = computed(() => {
    if (this.searchTerm()) return `No games found for “${this.searchTerm()}”.`;
    return this.isFiltered() ? 'No games match these filters.' : 'No games found in the catalog.';
  });
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly isLoadingMore = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // The header search and the sidebar filters are in the URL, so the results survive a refresh and Back
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.filters.set(this.filtersService.parse(params));
      this.loadCatalogGames();
    });
  }

  loadCatalogGames(page: number = 1): void {
    // During server-side prerendering (SSR) load the mocks directly, relative HTTP calls are not handled there
    if (!isPlatformBrowser(this.platformId)) {
      this.catalogGames.set(MOCK_GAMES);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isUsingMock.set(false);

    this.gameService
      // PAGE_SIZE = the grid step (24), so each "Show More" shows exactly one new page
      .getGames(this.filtersService.toSearchParams(this.filters(), page, PAGE_SIZE))
      .subscribe({
        next: (response) => {
          this.currentPage.set(response?.page ?? 1);
          this.totalPages.set(response?.totalPages ?? 1);
          if (response?.items && response.items.length > 0) {
            const mappedGames = response.items.map((g) => this.gameService.toGridProps(g));
            this.catalogGames.set(mappedGames);
          } else if (this.searchTerm() || this.isFiltered()) {
            // A search or filters without results is a normal answer: show the message, not the mocks
            this.catalogGames.set([]);
          } else {
            console.warn('API returned empty results, loading mock games catalog.');
            this.catalogGames.set(MOCK_GAMES);
            this.isUsingMock.set(true);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.warn('Backend API unavailable. Loading mock games instead:', err);
          this.catalogGames.set(MOCK_GAMES);
          this.isUsingMock.set(true);
          this.isLoading.set(false);
        },
      });
  }

  // "Show More" after the downloaded games: the next page is added at the end of the list
  loadNextPage(): void {
    if (this.isLoadingMore() || this.currentPage() >= this.totalPages()) {
      return;
    }

    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    this.gameService
      .getGames(this.filtersService.toSearchParams(this.filters(), nextPage, PAGE_SIZE))
      .subscribe({
        next: (response) => {
          const newGames = (response?.items ?? []).map((g) => this.gameService.toGridProps(g));
          // IGDB can return a game again on the next page; keep each id once (the grid tracks by id)
          const known = new Set(this.catalogGames().map((game) => game.rawgGameId));
          this.catalogGames.update((games) => [...games, ...newGames.filter((game) => !known.has(game.rawgGameId))]);
          this.currentPage.set(nextPage);
          this.totalPages.set(response?.totalPages ?? this.totalPages());
          this.isLoadingMore.set(false);
        },
        error: () => {
          this.isLoadingMore.set(false);
          this.alertService.showAlert('Could not load more games. Please try again.');
        },
      });
  }
}
