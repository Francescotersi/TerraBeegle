import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { MOCK_WISHLIST_GAMES } from '../../mocks/games.mock';
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
            API unavailable: showing sample wishlist games.
          </span>
        </div>
      }
      <app-grid-component
        title="Wishlist"
        [games]="wishlistGames()"
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
  readonly isUsingMock = signal<boolean>(false);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.wishlistGames.set(MOCK_WISHLIST_GAMES);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isUsingMock.set(false);

    this.wishlistFavoritesService.getWishlist().subscribe({
      next: (response) => {
        const mappedGames =
          response?.items?.map((g) => this.wishlistFavoritesService.toGridProps(g)) ?? [];
        this.wishlistGames.set(mappedGames);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Backend API unavailable. Loading mock wishlist instead:', err);
        this.wishlistGames.set(MOCK_WISHLIST_GAMES);
        this.isUsingMock.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
