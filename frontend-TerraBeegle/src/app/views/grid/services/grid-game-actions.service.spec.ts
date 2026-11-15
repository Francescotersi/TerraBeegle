import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { GridGameActionsService } from './grid-game-actions.service';
import { WishlistFavoritesService } from '../../../services/wishlist-favorites.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ReviewService } from '../../../services/review.service';

describe('GridGameActionsService', () => {
  let actions: GridGameActionsService;
  let service: any;
  let reviewService: any;
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
    reviewService = {
      createReview: vi.fn().mockReturnValue(of({ id: 1, rating: 8, content: null, createdAt: '' })),
    };
    alerts = { showAlert: vi.fn(), showSuccess: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      { provide: WishlistFavoritesService, useValue: service },
      { provide: ReviewService, useValue: reviewService },
      { provide: AuthService, useValue: { currentUser: signal({ id: 1 }), isLoggedIn: () => true } },
      { provide: AlertService, useValue: alerts },
      { provide: PLATFORM_ID, useValue: 'browser' },
    ] });
    actions = TestBed.inject(GridGameActionsService);
    TestBed.tick();
  });
  it('opens the review popup before adding to favorites and saves both on publish', () => {
    actions.onToggleFavorite(new MouseEvent('click'), 119133, 'Elden Ring');
    expect(actions.pendingReview()).toEqual({ gameId: 119133, gameName: 'Elden Ring' });
    expect(service.addGame).not.toHaveBeenCalled();

    actions.publishReview({ rating: 8, content: null });
    actions.publishReview({ rating: 8, content: null });
    expect(service.addGame).toHaveBeenCalledTimes(1);
    expect(reviewService.createReview).toHaveBeenCalledWith(119133, { apiGameId: 119133, rating: 8, content: null });
    expect(actions.favoritedIds().has(119133)).toBe(false);

    request.next();
    request.complete();
    expect(actions.favoritedIds().has(119133)).toBe(true);
    expect(actions.pendingReview()).toBeNull();
  });
  it('retains wishlist state when removal fails', () => {
    actions.wishlistedIds.set(new Set([119133]));
    actions.onToggleWishlist(new MouseEvent('click'), 119133);
    request.error(new Error('offline'));
    // Optimistic: the success message appears right away, then the error undoes the change
    expect(actions.wishlistedIds().has(119133)).toBe(true);
    expect(alerts.showAlert).toHaveBeenCalled();
  });
  it('preserves the session error shown by the interceptor after logout', () => {
    actions.onToggleFavorite(new MouseEvent('click'), 119133, 'Elden Ring');
    actions.publishReview({ rating: 5, content: 'Great' });
    TestBed.inject(AuthService).currentUser.set(null);
    request.error(new Error('User not found.'));
    expect(alerts.showAlert).not.toHaveBeenCalled();
    expect(actions.favoritedIds().has(119133)).toBe(false);
  });

});
