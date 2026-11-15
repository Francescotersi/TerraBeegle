import { Component, OnChanges, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { AlertService } from '../../../services/alert.service';
import { ReviewResponseDTO } from '../../../models-services/review.model';
import { SpinnerComponent } from '../../../ui/spinner/spinner.component';

const PAGE_SIZE = 5;

// "REVIEWS" tab of the profile: the reviews you wrote (GET /api/user/{username}/reviews), newest first
@Component({
  selector: 'app-profile-reviews',
  standalone: true,
  imports: [DatePipe, RouterLink, SpinnerComponent],
  template: `
    @if (errorMessage()) {
      <p class="text-body-secondary mb-0">{{ errorMessage() }}</p>
    } @else if (reviews().length === 0 && isLoading()) {
      <div class="d-flex justify-content-center py-4"><app-spinner /></div>
    } @else if (reviews().length === 0) {
      <p class="text-body-secondary mb-0">
        You haven't written any reviews yet. Open a game and press "Write a review".
      </p>
    } @else {
      <p class="review-total mb-3">{{ totalCount() }} {{ totalCount() === 1 ? 'review' : 'reviews' }}</p>

      <ul class="review-list list-unstyled mb-0">
        @for (review of reviews(); track review.id) {
          <li class="review-item d-flex gap-3">
            @if (review.game; as game) {
              <a [routerLink]="['/game', game.apiGameId]" class="cover-link flex-shrink-0" [attr.aria-label]="game.name">
                @if (game.cover) {
                  <img class="review-cover" [src]="game.cover" [alt]="game.name" width="56" height="75" loading="lazy" />
                } @else {
                  <span class="review-cover review-cover-empty" aria-hidden="true">?</span>
                }
              </a>
            }

            <div class="flex-grow-1 min-w-0">
              <div class="d-flex align-items-start gap-2 mb-1">
                @if (review.game; as game) {
                  <a [routerLink]="['/game', game.apiGameId]" class="game-name">{{ game.name }}</a>
                }
                <span class="review-rating ms-auto" [title]="review.rating + ' out of 10'">★ {{ review.rating }}/10</span>
              </div>
              @if (review.content) {
                <p class="review-content mb-1">{{ review.content }}</p>
              }
              <div class="d-flex align-items-center gap-2 review-meta">
                <span>{{ review.createdAt | date: 'mediumDate' }}</span>
                @if (review.game) {
                  <button type="button" class="btn-link-danger ms-auto" [disabled]="deletingId() === review.id" (click)="deleteReview(review)">
                    {{ deletingId() === review.id ? 'Deleting...' : 'Delete' }}
                  </button>
                }
              </div>
            </div>
          </li>
        }
      </ul>

      @if (hasMore()) {
        <div class="text-center mt-3">
          <button type="button" class="btn btn-sm px-3 btn-outline-glass" [disabled]="isLoading()" (click)="loadMore()">
            {{ isLoading() ? 'Loading...' : 'Show more' }}
          </button>
        </div>
      }
    }
  `,
  styles: `
    :host { display: block; color: var(--tb-text); }
    .review-total { font-size: 0.85rem; font-weight: 600; color: var(--tb-text-muted); }
    .review-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .review-item {
      padding: 0.75rem 0.9rem;
      border-radius: 14px;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-glass-inner-bg);
    }
    .min-w-0 { min-width: 0; }
    .review-cover { display: block; width: 56px; height: 75px; border-radius: 8px; object-fit: cover; }
    .review-cover-empty {
      display: flex; align-items: center; justify-content: center;
      background: var(--tb-glass-bg); color: var(--tb-text-muted); font-weight: 700;
    }
    .game-name { color: var(--tb-text); font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
    .game-name:hover { color: var(--tb-accent); }
    .review-rating { color: #facc15; font-weight: 700; font-size: 0.9rem; white-space: nowrap; }
    .review-content { white-space: pre-line; font-size: 0.92rem; overflow-wrap: anywhere; }
    .review-meta { font-size: 0.78rem; color: var(--tb-text-muted); }
    .btn-link-danger {
      background: none; border: none; padding: 0; font-size: 0.78rem; font-weight: 600; color: #ef4444;
    }
    .btn-link-danger:hover:not(:disabled) { text-decoration: underline; }
    .btn-outline-glass {
      border: 1px solid var(--tb-glass-border); color: var(--tb-text); background: var(--tb-glass-bg); border-radius: 12px;
    }
  `,
})
export class ProfileReviewsComponent implements OnChanges {
  readonly username = input.required<string>();

  private readonly reviewService = inject(ReviewService);
  private readonly alertService = inject(AlertService);

  protected readonly reviews = signal<ReviewResponseDTO[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly hasMore = computed(() => this.reviews().length < this.totalCount());
  private page = 1;
  private requestVersion = 0; // ignores answers that arrive after the username changed

  ngOnChanges(): void {
    this.reload();
  }

  protected loadMore(): void {
    if (this.isLoading() || !this.hasMore()) return;
    this.page++;
    this.fetch();
  }

  // DELETE /api/games/{igdbId}/reviews/{id}
  protected deleteReview(review: ReviewResponseDTO): void {
    const gameId = review.game?.apiGameId;
    if (!gameId || this.deletingId() !== null || !confirm('Delete your review?')) return;
    this.deletingId.set(review.id);
    this.reviewService.deleteReview(gameId, review.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.alertService.showSuccess('Review deleted.');
        this.reload();
      },
      error: () => {
        this.deletingId.set(null);
        this.alertService.showAlert('Could not delete your review. Please try again.');
      },
    });
  }

  private reload(): void {
    this.page = 1;
    this.reviews.set([]);
    this.totalCount.set(0);
    if (!this.username()) return;
    this.fetch();
  }

  private fetch(): void {
    const version = ++this.requestVersion;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.reviewService.getUserReviews(this.username(), this.page, PAGE_SIZE).subscribe({
      next: (response) => {
        if (version !== this.requestVersion) return;
        this.reviews.update((current) => (this.page === 1 ? response.items : [...current, ...response.items]));
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        if (version !== this.requestVersion) return;
        this.isLoading.set(false);
        this.errorMessage.set('Could not load your reviews right now.');
      },
    });
  }
}
