import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { WishlistFavoritesService } from './wishlist-favorites.service';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

describe('WishlistFavoritesService', () => {
  it('loads collection membership across pages within the API page-size limit', () => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: AuthService, useValue: { currentUser: signal({ id: 7 }) } },
      { provide: AlertService, useValue: {} },
    ] });
    const http = TestBed.inject(HttpTestingController);
    let ids: number[] = [];
    TestBed.inject(WishlistFavoritesService).getAllGames('favorites').subscribe(games => {
      ids = games.map(game => game.apiGameId);
    });
    http.expectOne('/api/users/7/favorites?page=1&pageSize=50').flush({
      items: [{ apiGameId: 119133 }], page: 1, totalPages: 2,
    });
    expect(ids).toEqual([]);
    http.expectOne('/api/users/7/favorites?page=2&pageSize=50').flush({
      items: [{ apiGameId: 1942 }], page: 2, totalPages: 2,
    });
    expect(ids).toEqual([119133, 1942]);
    http.verify();
  });
});
