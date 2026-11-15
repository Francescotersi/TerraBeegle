import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
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
  // Emits the game id after a review is published (the details page reloads its reviews)
  readonly reviewPublished = new Subject<number>();

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

  // The heart adds / removes the game directly (the review has its own button on the details page)
  onToggleFavorite(event: MouseEvent, gameId: number, _gameName?: string): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      event.preventDefault();
      this.alertService.showAlert('Please log in to manage your favorites.');
      return;
    }
    this.toggle('favorites', gameId);
  }

  // "Write a review" on the details page: opens the review popup
  openReview(gameId: number, gameName: string): void {
    if (!this.authService.isLoggedIn()) {
      this.alertService.showAlert('Please log in to write a review.');
      return;
    }
    this.pendingReview.set({ gameId, gameName: gameName || 'Game' });
  }

  // "Cancel", backdrop or Escape on the review popup: close it
  cancelReview(): void {
    if (this.isPublishingReview()) return;
    this.pendingReview.set(null);
  }

  // "Publish": saves only the review (it no longer adds the game to favorites)
  publishReview(payload: ReviewSubmitPayload): void {
    const pending = this.pendingReview();
    if (!pending || this.isPublishingReview()) return;

    const userId = this.authService.currentUser()?.id;
    this.isPublishingReview.set(true);

    this.reviewService
      .createReview(pending.gameId, { gameId: pending.gameId, rating: payload.rating, content: payload.content })
      .subscribe({
        next: () => {
          this.isPublishingReview.set(false);
          this.pendingReview.set(null);
          if (this.authService.currentUser()?.id !== userId) return;
          this.reviewPublished.next(pending.gameId);
          this.alertService.showSuccess('Review published.');
        },
        error: (error: { status?: number; error?: unknown }) => {
          this.isPublishingReview.set(false);
          if (this.authService.currentUser()?.id !== userId) return;
          if (error.status === 409) {
            // One review per game: close the popup, there is nothing else to do
            this.pendingReview.set(null);
            this.alertService.showAlert('You already reviewed this game.');
            return;
          }
          this.alertService.showAlert(
            typeof error.error === 'string' ? error.error : 'Could not publish your review. Please try again.'
          );
        },
      });
  }

  private toggle(type: 'wishlist' | 'favorites', gameId: number): void {
    const key = `${this.authService.currentUser()?.id}:${type}:${gameId}`;
    if (this.pending.has(key)) return;
    const userId = this.authService.currentUser()?.id;
    const added = (type === 'wishlist' ? this.wishlistedIds : this.favoritedIds)().has(gameId);
    const updateLocal = (add: boolean) =>
      type === 'wishlist' ? this.updateWishlistLocal(gameId, add) : this.updateFavoriteLocal(gameId, add);
    this.pending.add(key);

    // Optimistic update: the heart and the message change right away. The first time a game is added the
    // backend also downloads it from IGDB and saves it, which can take a few seconds; on error we undo it
    this.collectionVersions[type]++;
    updateLocal(!added);
    this.alertService.showSuccess(added ? `Removed from ${type}.` : `Added to ${type}.`);

    const request = added ? this.wishlistService.removeGame(type, gameId) : this.wishlistService.addGame(type, gameId);
    request.subscribe({
      next: () => {
        this.pending.delete(key);
        if (this.authService.currentUser()?.id !== userId) return;
        this.wishlistService.changes.next(type);
      },
      error: () => {
        this.pending.delete(key);
        const currentUser = this.authService.currentUser();
        // Undo the optimistic change, also after a logout (but not on the lists of another user who logged in)
        if (!currentUser || currentUser.id === userId) {
          this.collectionVersions[type]++;
          updateLocal(added);
        }
        // The interceptor already explains expired sessions and redirects to login.
        if (currentUser?.id !== userId) return;
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
