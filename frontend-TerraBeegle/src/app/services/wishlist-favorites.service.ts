import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { GameSearchResponse } from './game.service';

export type GameCollectionType = 'wishlist' | 'favorites';

@Injectable({
	providedIn: 'root',
})
export class WishlistFavoritesService {
	private readonly http = inject(HttpClient);
	private readonly authService = inject(AuthService);

	private getBaseUrl(type: GameCollectionType, userId?: number): string {
		const id = userId ?? this.authService.currentUser()?.id;
		if (!id) {
			throw new Error('User ID is required to fetch wishlist or favorites.');
		}
		return `/api/users/${id}/${type}`;
	}

	getGames(type: GameCollectionType, page: number = 1, pageSize: number = 20,
		userId?: number): Observable<GameSearchResponse> {
			const params = new HttpParams()
				.set('page', page.toString())
				.set('pageSize', pageSize.toString());
			return this.http.get<GameSearchResponse>(this.getBaseUrl(type, userId), { params })
	}

	addGame(type: GameCollectionType, rawgGameId: number, userId?: number): Observable<void> {
		return this.http.post<void>(`${this.getBaseUrl(type, userId)}/${rawgGameId}`, {});
	}

	removeGame(type: GameCollectionType, rawgGameId: number, userId?: number): Observable<void> {
		return this.http.delete<void>(`${this.getBaseUrl(type, userId)}/${rawgGameId}`);
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
}