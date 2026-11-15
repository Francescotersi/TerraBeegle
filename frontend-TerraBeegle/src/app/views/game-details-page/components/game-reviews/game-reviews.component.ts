import { Component, DestroyRef, OnChanges, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewService } from '../../../../services/review.service';
import { AuthService } from '../../../../services/auth.service';
import { AlertService } from '../../../../services/alert.service';
import { ReviewResponseDTO } from '../../../../models-services/review.model';
import { GridGameActionsService } from '../../../grid/services/grid-game-actions.service';
import { LiquidGlassComponent } from '../../../../ui/liquid-glass/liquid-glass.component';
import { SpinnerComponent } from '../../../../ui/spinner/spinner.component';
import { GAME_DETAILS_STYLES } from '../../styles/game-details.styles';

const PAGE_SIZE = 5;
const REVIEW_PREVIEW_CHARS = 180;
const REVIEW_PREVIEW_LINES = 3;

/** Displays paginated user reviews with expand/collapse and delete support. */
@Component({
  selector: 'app-game-reviews',
  standalone: true,
  imports: [DatePipe, LiquidGlassComponent, SpinnerComponent],
  template: `
    <app-liquid-glass borderRadius="20px" blur="3px" [scale]="85" background="var(--tb-glass-bg)">
      <section class="p-3 p-md-4">
        <h2 class="section-title">
          Reviews
          @if (totalCount() > 0) {
            <span class="review-count">({{ totalCount() }})</span>
          }
        </h2>

        @if (errorMessage()) {
          <p class="text-body-secondary mb-0">{{ errorMessage() }}</p>
        } @else if (reviews().length === 0 && isLoading()) {
          <div class="d-flex justify-content-center py-3"><app-spinner /></div>
        } @else if (reviews().length === 0) {
          <p class="text-body-secondary mb-0">No reviews yet. Be the first to write one!</p>
        } @else {
          <ul class="review-list list-unstyled mb-0">
            @for (review of reviews(); track review.id) {
              <li class="review-item">
                <div class="d-flex align-items-center gap-2 mb-1">
                  @if (review.user?.imageProfile) {
                    <img class="review-avatar" [src]="review.user?.imageProfile" alt="" width="32" height="32" loading="lazy" />
                  } @else {
                    <span class="review-avatar review-avatar-fallback" aria-hidden="true">
                      {{ (review.user?.username ?? '?').charAt(0).toUpperCase() }}
                    </span>
                  }
                  <span class="fw-semibold">{{ review.user?.username ?? 'Unknown user' }}</span>
                  @if (isMine(review)) {
                    <span class="mine-chip">You</span>
                  }
                  <span class="review-rating ms-auto" [title]="review.rating + ' out of 10'">★ {{ review.rating }}/10</span>
                </div>
                @if (review.content) {
                  <p class="review-content mb-1">{{ displayContent(review) }}</p>
                  @if (isLongReview(review.content)) {
                    <button type="button" class="btn-link-toggle mb-1" (click)="toggleReviewExpand(review.id)">
                      {{ isReviewExpanded(review.id) ? 'Show less' : 'Show more' }}
                    </button>
                  }
                }
                <div class="d-flex align-items-center gap-2 review-meta">
                  <span>{{ review.createdAt | date: 'mediumDate' }}</span>
                  @if (isMine(review)) {
                    <button type="button" class="btn-link-danger ms-auto" [disabled]="deletingId() === review.id" (click)="deleteReview(review)">
                      {{ deletingId() === review.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  }
                </div>
              </li>
            }
          </ul>

          @if (hasMore()) {
            <div class="text-center mt-3">
              <button type="button" class="btn btn-outline-glass btn-sm px-3" [disabled]="isLoading()" (click)="loadMore()">
                {{ isLoading() ? 'Loading...' : 'Show more' }}
              </button>
            </div>
          }
        }
      </section>
    </app-liquid-glass>
  `,
  styles: [
    GAME_DETAILS_STYLES,
    `
    .review-count { color: var(--tb-text-muted); font-weight: 600; font-size: 0.95rem; }
    .review-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .review-item {
      padding: 0.75rem 0.9rem;
      border-radius: 14px;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-glass-inner-bg);
    }
    .review-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .review-avatar-fallback {
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--tb-btn-gradient); color: #fff; font-weight: 700; font-size: 0.85rem;
    }
    .mine-chip {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--tb-accent); border: 1px solid var(--tb-accent); border-radius: 999px; padding: 1px 7px;
    }
    .review-rating { color: #facc15; font-weight: 700; font-size: 0.9rem; white-space: nowrap; }
    .review-content { white-space: pre-line; font-size: 0.92rem; overflow-wrap: anywhere; }
    .review-meta { font-size: 0.78rem; color: var(--tb-text-muted); }
    .btn-link-danger {
      background: none; border: none; padding: 0; font-size: 0.78rem; font-weight: 600; color: #ef4444;
    }
    .btn-link-danger:hover:not(:disabled) { text-decoration: underline; }
    .btn-link-toggle {
      background: none; border: none; padding: 0; font-size: 0.8rem; font-weight: 600;
      color: var(--tb-accent); cursor: pointer;
    }
    .btn-link-toggle:hover { text-decoration: underline; }
    .btn-outline-glass {
      border: 1px solid var(--tb-glass-border); color: var(--tb-text); background: var(--tb-glass-bg); border-radius: 12px;
    }
  `,
  ],
})
export class GameReviewsComponent implements OnChanges {
  readonly gameId = input.required<number>(); // IGDB id

  private readonly reviewService = inject(ReviewService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly actions = inject(GridGameActionsService);

  protected readonly reviews = signal<ReviewResponseDTO[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly expandedReviewIds = signal<Record<number, boolean>>({});
  protected readonly hasMore = computed(() => this.reviews().length < this.totalCount());
  private page = 1;
  private requestVersion = 0; // ignores answers for a game we already left

  constructor() {
    this.actions.reviewPublished.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((id) => {
      if (id === this.gameId()) this.reload();
    });
  }

  ngOnChanges(): void {
    this.reload();
  }

  protected isMine(review: ReviewResponseDTO): boolean {
    const userId = this.authService.currentUser()?.id;
    return userId !== undefined && review.user?.id === userId;
  }

  protected isLongReview(content: string | null | undefined): boolean {
    if (!content) return false;
    return content.length > REVIEW_PREVIEW_CHARS || content.split('\n').length > REVIEW_PREVIEW_LINES;
  }

  protected isReviewExpanded(reviewId: number): boolean {
    return Boolean(this.expandedReviewIds()[reviewId]);
  }

  protected toggleReviewExpand(reviewId: number): void {
    this.expandedReviewIds.update((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  }

  protected displayContent(review: ReviewResponseDTO): string {
    const content = review.content ?? '';
    if (!this.isLongReview(content) || this.isReviewExpanded(review.id)) {
      return content;
    }

    const lines = content.split('\n');
    const previewByLines =
      lines.length > REVIEW_PREVIEW_LINES ? lines.slice(0, REVIEW_PREVIEW_LINES).join('\n') : content;

    if (previewByLines.length <= REVIEW_PREVIEW_CHARS) {
      return `${previewByLines.trimEnd()}...`;
    }

    const sliced = previewByLines.slice(0, REVIEW_PREVIEW_CHARS);
    const lastSpace = sliced.lastIndexOf(' ');
    const cut = lastSpace > REVIEW_PREVIEW_CHARS * 0.6 ? sliced.slice(0, lastSpace) : sliced;
    return `${cut.trimEnd()}...`;
  }

  protected loadMore(): void {
    if (this.isLoading() || !this.hasMore()) return;
    this.page++;
    this.fetch();
  }

  protected deleteReview(review: ReviewResponseDTO): void {
    if (this.deletingId() !== null || !confirm('Delete your review?')) return;
    this.deletingId.set(review.id);
    this.reviewService.deleteReview(this.gameId(), review.id).subscribe({
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
    this.expandedReviewIds.set({});
    this.fetch();
  }

  private fetch(): void {
    const version = ++this.requestVersion;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.reviewService.getGameReviews(this.gameId(), this.page, PAGE_SIZE).subscribe({
      next: (response) => {
        if (version !== this.requestVersion) return;
        this.reviews.update((current) => (this.page === 1 ? response.items : [...current, ...response.items]));
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        if (version !== this.requestVersion) return;
        this.isLoading.set(false);
        this.errorMessage.set('Could not load the reviews right now.');
      },
    });
  }
}
