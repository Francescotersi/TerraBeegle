import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { GridGameActionsService } from './grid-game-actions.service';
import { WishlistFavoritesService } from '../../../services/wishlist-favorites.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

describe('GridGameActionsService', () => {
  let actions: GridGameActionsService;
  let service: any;
  let alerts: any;
  let request: Subject<void>;
  beforeEach(() => {
    request = new Subject<void>();
    service = {
      getAllGames: vi.fn().mockReturnValue(of([])),
      addGame: vi.fn().mockReturnValue(request),
      removeGame: vi.fn().mockReturnValue(request),
      changes: new Subject(),
    };
    alerts = { showAlert: vi.fn(), showSuccess: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      { provide: WishlistFavoritesService, useValue: service },
      { provide: AuthService, useValue: { currentUser: signal({ id: 1 }), isLoggedIn: () => true } },
      { provide: AlertService, useValue: alerts },
      { provide: PLATFORM_ID, useValue: 'browser' },
    ] });
    actions = TestBed.inject(GridGameActionsService);
    TestBed.tick();
  });
  it('updates favorites only after the server saves them and ignores duplicate clicks', () => {
    actions.onToggleFavorite(new MouseEvent('click'), 119133);
    actions.onToggleFavorite(new MouseEvent('click'), 119133);
    expect(service.addGame).toHaveBeenCalledTimes(1);
    expect(actions.favoritedIds().has(119133)).toBe(false);
    request.next();
    expect(actions.favoritedIds().has(119133)).toBe(true);
  });
  it('retains wishlist state when removal fails', () => {
    actions.wishlistedIds.set(new Set([119133]));
    actions.onToggleWishlist(new MouseEvent('click'), 119133);
    request.error(new Error('offline'));
    expect(actions.wishlistedIds().has(119133)).toBe(true);
    expect(alerts.showAlert).toHaveBeenCalled();
    expect(alerts.showSuccess).not.toHaveBeenCalled();
  });
  it('preserves the session error shown by the interceptor after logout', () => {
    actions.onToggleFavorite(new MouseEvent('click'), 119133);
    TestBed.inject(AuthService).currentUser.set(null);
    request.error(new Error('User not found.'));
    expect(alerts.showAlert).not.toHaveBeenCalled();
    expect(actions.favoritedIds().has(119133)).toBe(false);
  });

});
