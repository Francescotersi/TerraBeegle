import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { WishlistFavoritesService } from '../../../services/wishlist-favorites.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ReviewService } from '../../../services/review.service';
import { ReviewSubmitPayload } from '../../../ui/review-popup/review-popup.component';

@Injectable({ providedIn: 'root' })
export class GridGameActionsService {
  // ---- Wishlist / Favorites functionality ----
  private readonly wishlistService = inject(WishlistFavoritesService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly reviewService = inject(ReviewService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly wishlistedIds = signal<Set<number>>(new Set());
  readonly favoritedIds = signal<Set<number>>(new Set());
  readonly animatingFavoriteId = signal<number | null>(null);
  readonly pendingReview = signal<{ gameId: number; gameName: string } | null>(null);
  readonly isPublishingReview = signal(false);

  private loadedUserId: number | undefined;
  private readonly collectionVersions = { wishlist: 0, favorites: 0 };
  private readonly pending = new Set<string>();

  constructor() {
    effect(() => {
      this.authService.currentUser();
      this.loadUserCollections();
    });
  }

  loadUserCollections(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId !== this.loadedUserId) {
      this.loadedUserId = userId;
      this.collectionVersions.wishlist++;
      this.collectionVersions.favorites++;
      this.wishlistedIds.set(new Set());
      this.favoritedIds.set(new Set());
    }
    if (!isPlatformBrowser(this.platformId) || !userId) {
      this.wishlistedIds.set(new Set());
      this.favoritedIds.set(new Set());
      return;
    }
    for (const type of ['wishlist', 'favorites'] as const) {
      const version = this.collectionVersions[type];
      this.wishlistService.getAllGames(type).subscribe({
        next: games => {
          if (this.authService.currentUser()?.id !== userId || version !== this.collectionVersions[type]) return;
          const ids = new Set(games.map(game => game.apiGameId));
          (type === 'wishlist' ? this.wishlistedIds : this.favoritedIds).set(ids);
        },
        error: () => {
          if (this.authService.currentUser()?.id === userId) {
            this.alertService.showAlert(`Could not load your ${type}. Please try again.`);
          }
        },
      });
    }
  }

  onToggleWishlist(event: MouseEvent, gameId: number): void {
    event.stopPropagation(); // stops from entering game details page
    if (!this.authService.isLoggedIn()) {
      this.alertService.showAlert('Please log in to manage your wishlist.');
      return;
    }
    this.toggle('wishlist', gameId);
  }

  private updateWishlistLocal(gameId: number, add: boolean): void {
    this.wishlistedIds.update((ids) => {
      const updated = new Set(ids);
      add ? updated.add(gameId) : updated.delete(gameId);
      return updated;
    });
  }

  onToggleFavorite(event: MouseEvent, gameId: number, gameName?: string): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      event.preventDefault();
      this.alertService.showAlert('Please log in to manage your favorites.');
      return;
    }
    if (!this.favoritedIds().has(gameId)) {
      this.pendingReview.set({ gameId, gameName: gameName || 'Game' });
      return;
    }
    this.toggle('favorites', gameId);
  }

  cancelReview(): void {
    if (this.isPublishingReview()) return;
    this.pendingReview.set(null);
  }

  publishReview(payload: ReviewSubmitPayload): void {
    const pending = this.pendingReview();
    if (!pending || this.isPublishingReview()) return;

    const userId = this.authService.currentUser()?.id;
    const key = `${userId}:favorites:${pending.gameId}`;
    if (this.pending.has(key)) return;

    this.pending.add(key);
    this.isPublishingReview.set(true);

    let reviewFailed = false;
    const review$ = this.reviewService
      .createReview(pending.gameId, {
        gameId: pending.gameId,
        rating: payload.rating,
        content: payload.content,
      })
      .pipe(
        catchError(() => {
          reviewFailed = true;
          return of(null);
        })
      );

    forkJoin({
      favorite: this.wishlistService.addGame('favorites', pending.gameId),
      review: review$,
    }).subscribe({
      next: () => {
        this.pending.delete(key);
        this.isPublishingReview.set(false);
        this.pendingReview.set(null);
        if (this.authService.currentUser()?.id !== userId) return;
        this.collectionVersions.favorites++;
        this.updateFavoriteLocal(pending.gameId, true);
        this.wishlistService.changes.next('favorites');
        if (reviewFailed) {
          this.alertService.showAlert('Added to favorites, but the review could not be saved.');
        } else {
          this.alertService.showSuccess('Added to favorites and review published.');
        }
      },
      error: () => {
        this.pending.delete(key);
        this.isPublishingReview.set(false);
        if (this.authService.currentUser()?.id !== userId) return;
        this.alertService.showAlert('Could not update your favorites. Please try again.');
      },
    });
  }

  private toggle(type: 'wishlist' | 'favorites', gameId: number): void {
    const key = `${this.authService.currentUser()?.id}:${type}:${gameId}`;
    if (this.pending.has(key)) return;
    const userId = this.authService.currentUser()?.id;
    const added = (type === 'wishlist' ? this.wishlistedIds : this.favoritedIds)().has(gameId);
    this.pending.add(key);
    const request = added ? this.wishlistService.removeGame(type, gameId) : this.wishlistService.addGame(type, gameId);
    request.subscribe({
      next: () => {
        this.pending.delete(key);
        if (this.authService.currentUser()?.id !== userId) return;
        this.collectionVersions[type]++;
        if (type === 'wishlist') this.updateWishlistLocal(gameId, !added);
        else this.updateFavoriteLocal(gameId, !added);
        this.wishlistService.changes.next(type);
        this.alertService.showSuccess(added ? `Removed from ${type}.` : `Added to ${type}.`);
      },
      error: () => {
        this.pending.delete(key);
        // The interceptor already explains expired sessions and redirects to login.
        if (this.authService.currentUser()?.id !== userId) return;
        this.alertService.showAlert(`Could not update your ${type}. Please try again.`);
      },
    });
  }

  private updateFavoriteLocal(gameId: number, add: boolean): void {
    this.favoritedIds.update((ids) => {
      const updated = new Set(ids);
      add ? updated.add(gameId) : updated.delete(gameId);
      return updated;
    });
  }
}
