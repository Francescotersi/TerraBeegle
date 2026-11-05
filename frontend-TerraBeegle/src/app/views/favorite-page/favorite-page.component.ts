import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GridComponent, GridComponentProps } from '../grid/grid.component';
import { SpinnerComponent } from '../../ui/spinner/spinner.component';
import { createMockGame } from '../../mocks/games.mock';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';

const INITIAL_MOCK_FAVORITES: GridComponentProps[] = [
  createMockGame({
    rawgGameId: 1,
    name: 'The Witcher 3: Wild Hunt',
    released: '2015-05-19',
    rating: 4.8,
    metacritic: 93,
    genres: ['RPG', 'Adventure'],
    tags: ['open world', 'fantasy'],
  }),
  createMockGame({
    rawgGameId: 3,
    name: 'Elden Ring',
    released: '2022-02-25',
    rating: 4.9,
    metacritic: 96,
    genres: ['RPG', 'Action'],
    tags: ['souls-like', 'dark fantasy'],
  }),
  createMockGame({
    rawgGameId: 4,
    name: 'Hollow Knight',
    released: '2017-02-24',
    rating: 4.7,
    metacritic: 90,
    genres: ['Platformer', 'Adventure'],
    tags: ['metroidvania', 'indie'],
  }),
];

@Component({
  selector: 'app-favorite-page',
  standalone: true,
  imports: [GridComponent, SpinnerComponent],
  template: `
    @if (isLoading()) {
      <div class="d-flex flex-column align-items-center justify-content-center py-5 my-4">
        <app-spinner size="lg" text="Loading your favorites..." />
      </div>
    } @else if (errorMessage()) {
      <div class="alert alert-danger mx-auto my-4 text-center" style="max-width: 600px;">
        {{ errorMessage() }}
      </div>
    } @else {
      <app-grid-component
        title="Favorites"
        [games]="favoriteGames()"
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

  readonly favoriteGames = signal<GridComponentProps[]>(INITIAL_MOCK_FAVORITES);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.favoriteGames.set(INITIAL_MOCK_FAVORITES);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.wishlistFavoritesService.getFavorites().subscribe({
      next: (response) => {
        const mappedGames =
          response?.results?.map((g) => this.wishlistFavoritesService.toGridProps(g)) ?? [];
        if (mappedGames.length > 0) {
          this.favoriteGames.set(mappedGames);
        } else {
          this.favoriteGames.set(INITIAL_MOCK_FAVORITES);
        }
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback ai mock
        this.favoriteGames.set(INITIAL_MOCK_FAVORITES);
        this.isLoading.set(false);
      },
    });
  }
}
