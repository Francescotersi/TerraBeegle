import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError, expand, reduce, EMPTY } from 'rxjs';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { GameCardDTO, GameSearchResponse, GameCollectionType } from '../models-services/game.model';
import { GridComponentProps } from '../views/grid/grid.component';
import { MOCK_GAME_COVERS } from '../mocks/games.mock';

export type { GameCollectionType };

@Injectable({
  providedIn: 'root',
})
export class WishlistFavoritesService {
  readonly changes = new Subject<GameCollectionType>();

  // Every page of a list; without userId the logged-in user's, with it a friend's (the backend allows only friends)
  getAllGames(type: GameCollectionType, userId?: number): Observable<GameCardDTO[]> {
    return this.getGames(type, 1, 50, userId).pipe(
      expand(page => page.page < page.totalPages ? this.getGames(type, page.page + 1, 50, userId) : EMPTY),
      reduce((games, page) => [...games, ...page.items], [] as GameCardDTO[])
    );
  }

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  private getBaseUrl(type: GameCollectionType, userId?: number): string | null {
    const id = userId ?? this.authService.currentUser()?.id;
    if (!id) {
      return null;
    }
    return `/api/users/${id}/${type}`;
  }

  getGames(
    type: GameCollectionType,
    page: number = 1,
    pageSize: number = 20,
    userId?: number
  ): Observable<GameSearchResponse> {
    const baseUrl = this.getBaseUrl(type, userId);
    if (!baseUrl) {
      return throwError(() => new Error('User ID is required to fetch collection.'));
    }
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<GameSearchResponse>(baseUrl, { params });
  }

  addGame(type: GameCollectionType, apiGameId: number, userId?: number): Observable<void> {
    const baseUrl = this.getBaseUrl(type, userId);
    if (!baseUrl) {
      this.alertService.showAlert(`Please log in to add games to your ${type}.`);
      return throwError(() => new Error('User ID is required to add game to collection.'));
    }
    return this.http.post<void>(`${baseUrl}/${apiGameId}`, {});
  }

  removeGame(type: GameCollectionType, apiGameId: number, userId?: number): Observable<void> {
    const baseUrl = this.getBaseUrl(type, userId);
    if (!baseUrl) {
      this.alertService.showAlert(`Please log in to remove games from your ${type}.`);
      return throwError(() => new Error('User ID is required to remove game from collection.'));
    }
    return this.http.delete<void>(`${baseUrl}/${apiGameId}`);
  }


  getFavorites(page?: number, pageSize?: number) {
    return this.getGames('favorites', page, pageSize);
  }

  addFavorite(apiGameId: number) {
    return this.addGame('favorites', apiGameId);
  }

  removeFavorite(apiGameId: number) {
    return this.removeGame('favorites', apiGameId);
  }

  getWishlist(page?: number, pageSize?: number) {
    return this.getGames('wishlist', page, pageSize);
  }

  addWishlist(apiGameId: number) {
    return this.addGame('wishlist', apiGameId);
  }

  removeWishlist(apiGameId: number) {
    return this.removeGame('wishlist', apiGameId);
  }

  toGridProps(game: GameCardDTO): GridComponentProps {
    return {
      rawgGameId: game.apiGameId,
      name: game.name,
      description: '',
      released: game.releaseDate ?? '',
      tba: false,
      website: '',
      rating: game.rating != null ? Math.round(game.rating) / 10 : 0,
      metacritic: game.criticRating ?? 0,
      coverImage:
        game.cover ||
        MOCK_GAME_COVERS[game.apiGameId] ||
        'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg',
      developer: '',
      publisher: '',
      platforms: game.platforms?.map((p) => p.apiPlatformId) ?? [],
      tags: [],
      genres: game.genres?.map((g) => g.name) ?? [],
      trailer: game.trailer ?? null,
    };
  }
}