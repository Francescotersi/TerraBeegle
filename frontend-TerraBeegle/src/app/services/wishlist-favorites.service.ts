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

  // Every page of a list; without username the logged-in user's, with it a friend's (the backend allows only friends)
  getAllGames(type: GameCollectionType, username?: string): Observable<GameCardDTO[]> {
    return this.getGames(type, 1, 50, username).pipe(
      expand(page => page.page < page.totalPages ? this.getGames(type, page.page + 1, 50, username) : EMPTY),
      reduce((games, page) => [...games, ...page.items], [] as GameCardDTO[])
    );
  }

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  private getBaseUrl(type: GameCollectionType, username?: string): string | null {
    const targetUsername = username ?? this.authService.currentUser()?.username;
    if (!targetUsername) {
      return null;
    }
    return `/api/users/${encodeURIComponent(targetUsername)}/${type}`;
  }

  getGames(
    type: GameCollectionType,
    page: number = 1,
    pageSize: number = 20,
    username?: string,
    name?: string
  ): Observable<GameSearchResponse> {
    const baseUrl = this.getBaseUrl(type, username);
    if (!baseUrl) {
      return throwError(() => new Error('Username is required to fetch collection.'));
    }
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    const trimmed = name?.trim();
    if (trimmed) {
      params = params.set('name', trimmed);
    }
    return this.http.get<GameSearchResponse>(baseUrl, { params });
  }

  addGame(type: GameCollectionType, apiGameId: number, username?: string): Observable<void> {
    const baseUrl = this.getBaseUrl(type, username);
    if (!baseUrl) {
      this.alertService.showAlert(`Please log in to add games to your ${type}.`);
      return throwError(() => new Error('Username is required to add game to collection.'));
    }
    return this.http.post<void>(`${baseUrl}/${apiGameId}`, {});
  }

  removeGame(type: GameCollectionType, apiGameId: number, username?: string): Observable<void> {
    const baseUrl = this.getBaseUrl(type, username);
    if (!baseUrl) {
      this.alertService.showAlert(`Please log in to remove games from your ${type}.`);
      return throwError(() => new Error('Username is required to remove game from collection.'));
    }
    return this.http.delete<void>(`${baseUrl}/${apiGameId}`);
  }


  getFavorites(page?: number, pageSize?: number, name?: string) {
    return this.getGames('favorites', page, pageSize, undefined, name);
  }

  addFavorite(apiGameId: number) {
    return this.addGame('favorites', apiGameId);
  }

  removeFavorite(apiGameId: number) {
    return this.removeGame('favorites', apiGameId);
  }

  getWishlist(page?: number, pageSize?: number, name?: string) {
    return this.getGames('wishlist', page, pageSize, undefined, name);
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
      slug: game.slug,
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