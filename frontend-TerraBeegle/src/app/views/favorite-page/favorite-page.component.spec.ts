import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { FavoritePageComponent } from './favorite-page.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';

describe('FavoritePageComponent', () => {
  const game = { apiGameId: 119133, name: 'Elden Ring' };
  let component: FavoritePageComponent;
  let service: any;
  beforeEach(() => {
    service = {
      getFavorites: vi.fn().mockReturnValue(of({ items: [game], totalPages: 2 })),
      toGridProps: vi.fn((g) => ({ rawgGameId: g.apiGameId, name: g.name })),
      changes: new Subject(),
    };
    TestBed.configureTestingModule({ providers: [
      { provide: WishlistFavoritesService, useValue: service },
      { provide: PLATFORM_ID, useValue: 'browser' },
    ] });
    component = TestBed.runInInjectionContext(() => new FavoritePageComponent());
  });
  it('loads real games and requests the next page', () => {
    component.loadFavorites();
    expect(component.favoriteGames()[0].rawgGameId).toBe(119133);
    expect(component.hasMore()).toBe(true);
    component.loadMore();
    expect(service.getFavorites).toHaveBeenLastCalledWith(2, 24);
  });
  it('shows an error without adding sample games', () => {
    service.getFavorites.mockReturnValue(throwError(() => new Error('offline')));
    component.loadFavorites();
    expect(component.errorMessage()).toBeTruthy();
    expect(component.favoriteGames()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });
  it('refreshes after a successful collection change', () => {
    component.ngOnInit();
    service.changes.next('favorites');
    expect(service.getFavorites).toHaveBeenCalledTimes(2);
  });
});
