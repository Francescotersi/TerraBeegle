import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { WishlistPageComponent } from './wishlist-page.component';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';

describe('WishlistPageComponent', () => {
  const game = { apiGameId: 119133, name: 'Elden Ring' };
  let component: WishlistPageComponent;
  let service: any;
  beforeEach(() => {
    service = {
      getWishlist: vi.fn().mockReturnValue(of({ items: [game], totalPages: 2 })),
      toGridProps: vi.fn((g) => ({ rawgGameId: g.apiGameId, name: g.name })),
      changes: new Subject(),
    };
    TestBed.configureTestingModule({ providers: [
      { provide: WishlistFavoritesService, useValue: service },
      { provide: PLATFORM_ID, useValue: 'browser' },
    ] });
    component = TestBed.runInInjectionContext(() => new WishlistPageComponent());
  });
  it('loads real games and requests the next page', () => {
    component.loadWishlist();
    expect(component.wishlistGames()[0].rawgGameId).toBe(119133);
    expect(component.hasMore()).toBe(true);
    component.loadMore();
    expect(service.getWishlist).toHaveBeenLastCalledWith(2, 24);
  });
  it('shows an error without adding sample games', () => {
    service.getWishlist.mockReturnValue(throwError(() => new Error('offline')));
    component.loadWishlist();
    expect(component.errorMessage()).toBeTruthy();
    expect(component.wishlistGames()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });
  it('refreshes after a successful collection change', () => {
    component.ngOnInit();
    service.changes.next('wishlist');
    expect(service.getWishlist).toHaveBeenCalledTimes(2);
  });
});
