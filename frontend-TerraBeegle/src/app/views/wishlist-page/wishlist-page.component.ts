import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, signal, OnInit, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [GridComponent, SpinnerComponent],
  template: `
    @if (isLoading()) {
      <div class="d-flex flex-column align-items-center justify-content-center py-5 my-4">
        <app-spinner size="lg" text="Loading your wishlist..." />
      </div>
    } @else if (errorMessage()) {
      <div class="alert alert-danger mx-auto my-4 text-center" style="max-width: 600px;">
        {{ errorMessage() }}
        <button type="button" class="btn btn-outline-danger d-block mx-auto mt-3" (click)="loadWishlist()">Try again</button>
      </div>
    } @else {
      <app-grid-component
        title="Wishlist"
        [games]="wishlistGames()"
        [canLoadMore]="hasMore()"
        [isLoadingMore]="isLoadingMore()"
        (loadMore)="loadMore()"
        emptyMessage="Your wishlist is empty. Add games you want to play later!"
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
export class WishlistPageComponent implements OnInit {
  private readonly wishlistFavoritesService = inject(WishlistFavoritesService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly wishlistGames = signal<GridComponentProps[]>([]);
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
    this.loadWishlist();
    this.wishlistFavoritesService.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(type => {
      if (type === 'wishlist') this.loadWishlist();
    });
  }

  loadWishlist(): void {
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

    this.wishlistFavoritesService.getWishlist(page, 24).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const mappedGames =
          response?.items?.map((g) => this.wishlistFavoritesService.toGridProps(g)) ?? [];
        this.wishlistGames.update(games => page === 1 ? mappedGames : [...games, ...mappedGames]);
        this.page = page;
        this.hasMore.set(page < response.totalPages);
        this.isLoadingMore.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your wishlist. Please try again.');
        this.isLoadingMore.set(false);
        this.isLoading.set(false);
      },
    });
  }
}
