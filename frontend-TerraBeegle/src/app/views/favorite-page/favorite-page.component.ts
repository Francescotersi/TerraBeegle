import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, signal, OnInit, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { CollectionSearchBarComponent } from '../../ui/collection-search-bar/collection-search-bar.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';

@Component({
  selector: 'app-favorite-page',
  standalone: true,
  imports: [GridComponent, SpinnerComponent, CollectionSearchBarComponent],
  template: `
    <app-collection-search-bar
      placeholder="Search in favorites..."
      ariaLabel="Search in favorites"
      [(query)]="searchQuery"
    />

    @if (isLoading()) {
      <div class="d-flex flex-column align-items-center justify-content-center py-5 my-4">
        <app-spinner size="lg" text="Loading your favorites..." />
      </div>
    } @else if (errorMessage()) {
      <div class="alert alert-danger mx-auto my-4 text-center" style="max-width: 600px;">
        {{ errorMessage() }}
        <button type="button" class="btn btn-outline-danger d-block mx-auto mt-3" (click)="loadFavorites()">Try again</button>
      </div>
    } @else {
      <app-grid-component
        title=""
        [games]="favoriteGames()"
        [canLoadMore]="hasMore()"
        [isLoadingMore]="isLoadingMore()"
        (loadMore)="loadMore()"
        emptyMessage="No favorite games yet. Browse the catalog and add your favorites!"
      >
      </app-grid-component>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
})
export class FavoritePageComponent implements OnInit {
  private readonly wishlistFavoritesService = inject(WishlistFavoritesService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly favoriteGames = signal<GridComponentProps[]>([]);
  readonly searchQuery = signal<string>('');
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  private readonly destroyRef = inject(DestroyRef);
  private page = 1;
  readonly hasMore = signal(false);
  readonly isLoadingMore = signal(false);

  loadMore(): void {
    if (this.hasMore() && !this.isLoadingMore()) this.fetchPage(this.page + 1);
  }

  ngOnInit(): void {
    this.loadFavorites();
    this.wishlistFavoritesService.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(type => {
      if (type === 'favorites') this.loadFavorites();
    });
  }

  loadFavorites(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fetchPage(1);
  }

  private fetchPage(page: number): void {
    this.isLoadingMore.set(page > 1);

    this.wishlistFavoritesService.getFavorites(page, 24).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const mappedGames =
          response?.items?.map((g) => this.wishlistFavoritesService.toGridProps(g)) ?? [];
        this.favoriteGames.update(games => page === 1 ? mappedGames : [...games, ...mappedGames]);
        this.page = page;
        this.hasMore.set(page < response.totalPages);
        this.isLoadingMore.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your favorites. Please try again.');
        this.isLoadingMore.set(false);
        this.isLoading.set(false);
      },
    });
  }
}
