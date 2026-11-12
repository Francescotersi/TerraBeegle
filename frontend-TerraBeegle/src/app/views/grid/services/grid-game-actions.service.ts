import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WishlistFavoritesService } from '../../../services/wishlist-favorites.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

// Provided at GridComponent level (providers: [...]), so every grid has its own instance
@Injectable()
export class GridGameActionsService {
  // ---- Wishlist / Favorites functionality ----
  private readonly wishlistService = inject(WishlistFavoritesService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly wishlistedIds = signal<Set<number>>(new Set());
  readonly favoritedIds = signal<Set<number>>(new Set());
  readonly animatingFavoriteId = signal<number | null>(null);

  loadUserCollections(): void {
    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      this.wishlistService.getWishlist(1, 100).subscribe({
        next: (res) => {
          if (res?.results) {
            this.wishlistedIds.set(new Set(res.results.map((g) => g.rawgGameId)));
          }
        },
        error: () => {},
      });
      this.wishlistService.getFavorites(1, 100).subscribe({
        next: (res) => {
          if (res?.results) {
            this.favoritedIds.set(new Set(res.results.map((g) => g.rawgGameId)));
          }
        },
        error: () => {},
      });
    }
  }

  onToggleWishlist(event: MouseEvent, gameId: number): void {
    event.stopPropagation(); // stops from entering game details page
    if (!this.authService.isLoggedIn()) {
      this.alertService.showAlert('Please log in to manage your wishlist.');
      return;
    }
    const isAlreadyAdded = this.wishlistedIds().has(gameId);
    if (isAlreadyAdded) {
      this.wishlistService.removeWishlist(gameId).subscribe({
        next: () => this.updateWishlistLocal(gameId, false),
        error: () => this.updateWishlistLocal(gameId, false), // Fallback offline
      });
    } else {
      this.wishlistService.addWishlist(gameId).subscribe({
        next: () => this.updateWishlistLocal(gameId, true),
        error: () => this.updateWishlistLocal(gameId, true), // Fallback offline
      });
    }
  }

  private updateWishlistLocal(gameId: number, add: boolean): void {
    this.wishlistedIds.update((ids) => {
      const updated = new Set(ids);
      add ? updated.add(gameId) : updated.delete(gameId);
      return updated;
    });
  }

  onToggleFavorite(event: MouseEvent, gameId: number): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      event.preventDefault();
      this.alertService.showAlert('Please log in to manage your favorites.');
      return;
    }
    const isAlreadyAdded = this.favoritedIds().has(gameId);
    if (isAlreadyAdded) {
      this.wishlistService.removeFavorite(gameId).subscribe({
        next: () => this.updateFavoriteLocal(gameId, false),
        error: () => this.updateFavoriteLocal(gameId, false), // Fallback offline
      });
    } else {
      this.animatingFavoriteId.set(gameId);
      setTimeout(() => {
        if (this.animatingFavoriteId() === gameId) {
          this.animatingFavoriteId.set(null);
        }
      }, 750);
      this.wishlistService.addFavorite(gameId).subscribe({
        next: () => this.updateFavoriteLocal(gameId, true),
        error: () => this.updateFavoriteLocal(gameId, true), // Fallback offline
      });
    }
  }

  private updateFavoriteLocal(gameId: number, add: boolean): void {
    this.favoritedIds.update((ids) => {
      const updated = new Set(ids);
      add ? updated.add(gameId) : updated.delete(gameId);
      return updated;
    });
  }
}
