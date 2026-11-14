import { Component, HostListener, effect, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LiquidGlassComponent } from '../liquid-glass/liquid-glass.component';

export interface ReviewSubmitPayload {
  rating: number;
  content: string | null;
}

@Component({
  selector: 'app-review-popup',
  standalone: true,
  imports: [DatePipe, LiquidGlassComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop-custom" role="dialog" aria-modal="true" aria-label="Write a review" (click)="onClose()">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <app-liquid-glass
            borderRadius="24px"
            background="var(--tb-glass-bg)"
            [scale]="95"
          >
            <div class="p-4">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                <span class="game-pill" [title]="gameName()">{{ gameName() }}</span>
                <div class="text-end flex-shrink-0">
                  <span class="review-date-label d-block">Review Date</span>
                  <span class="review-date-value">{{ reviewDate | date: 'mediumDate' }}</span>
                </div>
              </div>

              <div class="stars-section mb-3">
                <div class="stars-slider-wrap">
                  <div class="stars-row" aria-hidden="true">
                    @for (star of stars; track star) {
                      <svg class="star-icon" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient [attr.id]="'half-star-' + star">
                            <stop offset="50%" stop-color="#facc15" />
                            <stop offset="50%" stop-color="rgba(148, 163, 184, 0.35)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M12 2.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.4l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.5z"
                          [attr.fill]="starFill(star)"
                          [attr.stroke]="rating() >= star * 2 - 1 ? '#facc15' : 'rgba(148, 163, 184, 0.55)'"
                          stroke-width="1.5"
                          stroke-linejoin="round"
                        />
                      </svg>
                    }
                  </div>
                  <input
                    type="range"
                    class="stars-range-input"
                    min="1"
                    max="10"
                    step="1"
                    aria-label="Rating from 1 to 10"
                    [value]="rating()"
                    (input)="onRatingInput($event)"
                  />
                </div>
                <span class="rating-readout">{{ rating() }} / 10</span>
              </div>

              <div class="mb-3">
                <textarea
                  class="form-control review-textarea"
                  rows="4"
                  placeholder="Write here...."
                  aria-label="Review text (optional)"
                  [value]="content()"
                  (input)="onContentInput($event)"
                ></textarea>
              </div>

              <div class="d-flex justify-content-end align-items-center gap-2">
                <button
                  type="button"
                  class="btn btn-cancel-custom"
                  [disabled]="isSubmitting()"
                  (click)="onClose()"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-publish-custom"
                  [disabled]="isSubmitting()"
                  (click)="onPublish()"
                >
                  {{ isSubmitting() ? 'Publishing...' : 'PUBLISH' }}
                </button>
              </div>
            </div>
          </app-liquid-glass>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
      animation: modalFadeIn 0.25s ease-out;
    }

    .modal-dialog-custom {
      width: 100%;
      max-width: 460px;
      animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .game-pill {
      display: inline-block;
      max-width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-glass-inner-bg);
      color: var(--tb-text);
      font-weight: 700;
      font-size: 0.9rem;
    }

    .review-date-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tb-text-muted);
    }

    .review-date-value {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--tb-text);
    }

    .stars-section {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .stars-slider-wrap {
      position: relative;
      display: inline-block;
      line-height: 1;
    }

    .stars-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .star-icon {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      transition: transform 0.12s ease;
    }

    .stars-range-input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }

    .rating-readout {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--tb-text);
      min-width: 46px;
    }

    .review-textarea {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-glass-border);
      border-radius: 14px;
      color: var(--tb-text);
      font-size: 0.9rem;
      padding: 0.75rem 0.9rem;
      resize: vertical;
    }

    .review-textarea::placeholder {
      color: var(--tb-text-muted);
    }

    .review-textarea:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      box-shadow: 0 0 0 0.2rem var(--tb-accent-glow);
      color: var(--tb-text);
    }

    .btn-cancel-custom {
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-glass-border);
      color: var(--tb-text);
      font-weight: 600;
      padding: 0.48rem 1.1rem;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .btn-cancel-custom:hover:not(:disabled) {
      background: var(--tb-input-bg-focus);
      color: var(--tb-text);
    }

    .btn-publish-custom {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.48rem 1.35rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--tb-btn-gradient-shadow);
      transition: all 0.2s ease;
    }

    .btn-publish-custom:hover:not(:disabled) {
      background: var(--tb-btn-gradient-hover);
      transform: translateY(-1px);
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalScaleUp {
      from {
        opacity: 0;
        transform: scale(0.92);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
})
export class ReviewPopupComponent {
  readonly isOpen = input<boolean>(false);
  readonly gameName = input<string>('Game');
  readonly isSubmitting = input<boolean>(false);

  readonly closed = output<void>();
  readonly published = output<ReviewSubmitPayload>();

  protected readonly stars = [1, 2, 3, 4, 5] as const;
  protected readonly rating = signal(1); // Starts at half a star (1/10)
  protected readonly content = signal('');
  protected reviewDate = new Date();

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.rating.set(1);
        this.content.set('');
        this.reviewDate = new Date();
      }
    });
  }

  protected starFill(star: number): string {
    const r = this.rating();
    if (r >= star * 2) return '#facc15';
    if (r === star * 2 - 1) return `url(#half-star-${star})`;
    return 'rgba(148, 163, 184, 0.35)';
  }

  protected onRatingInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isInteger(value) && value >= 1 && value <= 10) {
      this.rating.set(value);
    }
  }

  protected onContentInput(event: Event): void {
    this.content.set((event.target as HTMLTextAreaElement).value);
  }

  protected onClose(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  protected onPublish(): void {
    if (this.isSubmitting()) return;
    const text = this.content().trim();
    this.published.emit({
      rating: this.rating(),
      content: text.length > 0 ? text : null,
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }
}
