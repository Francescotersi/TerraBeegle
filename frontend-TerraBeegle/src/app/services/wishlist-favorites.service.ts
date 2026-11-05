import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { GameCardDTO, GameSearchResponse } from './game.service';
import { GridComponentProps } from '../views/grid/grid.component';
import { MOCK_GAME_COVERS } from '../mocks/games.mock';

export type GameCollectionType = 'wishlist' | 'favorites';

@Injectable({
  providedIn: 'root',
})
export class WishlistFavoritesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

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

  addGame(type: GameCollectionType, rawgGameId: number, userId?: number): Observable<void> {
    const baseUrl = this.getBaseUrl(type, userId);
    if (!baseUrl) {
      return throwError(() => new Error('User ID is required to add game to collection.'));
    }
    return this.http.post<void>(`${baseUrl}/${rawgGameId}`, {});
  }

  removeGame(type: GameCollectionType, rawgGameId: number, userId?: number): Observable<void> {
    const baseUrl = this.getBaseUrl(type, userId);
    if (!baseUrl) {
      return throwError(() => new Error('User ID is required to remove game from collection.'));
    }
    return this.http.delete<void>(`${baseUrl}/${rawgGameId}`);
  }


  getFavorites(page?: number, pageSize?: number) {
    return this.getGames('favorites', page, pageSize);
  }

  addFavorite(rawgGameId: number) {
    return this.addGame('favorites', rawgGameId);
  }

  removeFavorite(rawgGameId: number) {
    return this.removeGame('favorites', rawgGameId);
  }

  getWishlist(page?: number, pageSize?: number) {
    return this.getGames('wishlist', page, pageSize);
  }

  addWishlist(rawgGameId: number) {
    return this.addGame('wishlist', rawgGameId);
  }

  removeWishlist(rawgGameId: number) {
    return this.removeGame('wishlist', rawgGameId);
  }

  toGridProps(game: GameCardDTO): GridComponentProps {
    return {
      rawgGameId: game.rawgGameId,
      name: game.name,
      description: '',
      released: game.releaseDate ?? '',
      tba: game.tba ?? false,
      website: '',
      rating: game.rating ?? 0,
      metacritic: 0,
      coverImage:
        game.backgroundImage ||
        MOCK_GAME_COVERS[game.rawgGameId] ||
        'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg',
      developer: '',
      publisher: '',
      platforms: game.platforms?.map((p) => p.rawgPlatformId) ?? [],
      tags: [],
      genres: game.genres?.map((g) => g.name) ?? [],
    };
  }
}