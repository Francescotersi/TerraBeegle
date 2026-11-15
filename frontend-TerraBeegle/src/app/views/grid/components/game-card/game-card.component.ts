import { Component, DestroyRef, ElementRef, computed, effect, input, output, inject, signal, untracked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GridComponentProps } from '../../grid.model';
import { GameCardInfoComponent } from './game-card-info.component';

/** Game card with cover, 16:9 hover trailer expansion, and expandable details footer. */
@Component({
  imports: [GameCardInfoComponent],
  selector: 'app-game-card',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'hoverEnd.emit()',
  },
  template: `
    <div
      class="card game-card"
      [class.is-hovered]="isActive()"
      [class.is-closing]="isClosing()"
      [class.is-expanded]="isExpanded()"
      [class.is-mobile-selected]="isMobileSelected()"
      [style.width.px]="isExpanded() ? expansion()!.width : null"
      [style.left.px]="isExpanded() ? expansion()!.left : null"
      (click)="cardClick.emit($event)"
    >
      <div
        class="game-cover-container"
        [style.height.px]="isExpanded() ? expansion()!.height : null"
        [style.clip-path]="coverClip()"
      >
        <img
          [src]="game().coverImage"
          [alt]="game().name"
          class="card-img game-cover"
          [attr.loading]="index() === 0 ? 'eager' : 'lazy'"
          [attr.fetchpriority]="index() === 0 ? 'high' : 'low'"
          width="264"
          height="374"
          decoding="async"
        />

        @if (isExpanded() && trailerUrl(); as url) {
          <iframe
            class="game-trailer"
            [src]="url"
            [title]="game().name + ' trailer'"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerpolicy="strict-origin-when-cross-origin"
            tabindex="-1"
          ></iframe>
        }

        <div class="card-img-overlay d-flex flex-column justify-content-end p-2.5 card-overlay-title">
          <h3 class="card-title fw-bold mb-0 text-white text-truncate" [title]="game().name">
            {{ game().name }}
          </h3>
        </div>
      </div>

      @if (isActive()) {
        <div class="game-details-liquid">
          <app-game-card-info [game]="game()" (detailsClick)="detailsClick.emit()" />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
    }

    .game-card {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 14px;
      border: none;
      background: transparent;
      box-shadow: none;
      cursor: pointer;
      transform-origin: center top;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (min-width: 992px) {
      .game-card.is-hovered.is-expanded {
        transform: none;
      }

      .game-card.is-expanded .card-overlay-title {
        display: none !important;
      }

      .game-card.is-expanded .game-cover-container {
        aspect-ratio: auto;
        transition: clip-path 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .game-card.is-closing {
        z-index: 999 !important;
        transform: none !important;
        pointer-events: none;
      }

      .game-card.is-closing.is-expanded .game-cover-container {
        transition-duration: 0.26s;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      .game-card.is-closing .game-trailer {
        animation: trailerFadeOut 0.18s ease forwards;
      }

      .game-card.is-closing .game-details-liquid {
        animation: detailsCollapseOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      .game-card.is-hovered {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: auto;
        z-index: 1000;
        overflow: visible;
        transform: scale(1.15);
      }

      .game-card.is-hovered .game-cover-container {
        border-radius: 14px 14px 0 0;
        border-bottom: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
    }

    @media (max-width: 991.98px) {
      .game-details-liquid {
        display: none !important;
      }

      .game-card.is-mobile-selected .game-cover-container {
        border-color: var(--tb-accent);
        box-shadow: 0 0 16px var(--tb-accent-glow);
      }
    }

    .game-cover-container {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      transition: border-radius 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .game-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .game-trailer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      pointer-events: none;
      background: #000;
      animation: trailerFadeIn 0.4s ease 0.15s both;
    }

    @keyframes trailerFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes trailerFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes detailsCollapseOut {
      from {
        opacity: 1;
        clip-path: inset(0 0 0 0);
      }
      to {
        opacity: 0;
        clip-path: inset(0 0 100% 0);
      }
    }

    .card-overlay-title .card-title {
      font-size: 1rem;
      display: block;
    }

    .card-overlay-title {
      background: linear-gradient(
        to top,
        rgba(10, 10, 10, 0.72) 0%,
        rgba(10, 10, 10, 0.15) 45%,
        transparent 100%
      );
      pointer-events: none;
    }

    .game-details-liquid {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      border-radius: 0 0 14px 14px;
      overflow: hidden;
      transform-origin: center top;
      animation: detailsExpandIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 16px 32px rgba(244, 114, 182, 0.2), 0 8px 16px rgba(0, 0, 0, 0.08);
    }

    @keyframes detailsExpandIn {
      from {
        opacity: 0.9;
        transform: translateY(-2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class GameCardComponent {
  readonly game = input.required<GridComponentProps>();
  readonly index = input<number>(0);
  readonly isHovered = input<boolean>(false);
  readonly isMobileSelected = input<boolean>(false);
  readonly expandable = input<boolean>(true);

  readonly hoverStart = output<void>();
  readonly detailsClick = output<void>();
  readonly hoverEnd = output<void>();
  readonly cardClick = output<MouseEvent>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly expansion = signal<{ width: number; height: number; left: number; clipLeft: number; clipRight: number } | null>(null);
  protected readonly isClosing = signal(false);
  protected readonly isActive = computed(() => this.isHovered() || this.isClosing());
  protected readonly isExpanded = computed(() => this.isActive() && this.expansion() !== null);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly clipOpen = signal(false);
  private openFrame = 0;
  protected readonly coverClip = computed(() => {
    const e = this.expansion();
    if (!this.isExpanded() || !e) return null;
    return this.clipOpen()
      ? 'inset(0px 0px 0px 0px round 14px 14px 0px 0px)'
      : `inset(0px ${e.clipRight}px 0px ${e.clipLeft}px round 14px)`;
  });
  private static readonly CLOSE_MS = 260;

  constructor() {
    let wasHovered = false;
    effect(() => {
      const hovered = this.isHovered();
      untracked(() => {
        if (wasHovered && !hovered) this.startClosing();
        if (!wasHovered && hovered) this.openClip();
        wasHovered = hovered;
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.clearCloseTimer();
      cancelAnimationFrame(this.openFrame);
    });
  }

  private openClip(): void {
    this.clipOpen.set(false);
    cancelAnimationFrame(this.openFrame);
    this.openFrame = requestAnimationFrame(() => {
      this.openFrame = requestAnimationFrame(() => this.clipOpen.set(true));
    });
  }

  private startClosing(): void {
    this.clearCloseTimer();
    cancelAnimationFrame(this.openFrame);
    this.isClosing.set(true);
    this.clipOpen.set(false);
    this.closeTimer = setTimeout(() => {
      this.closeTimer = null;
      this.isClosing.set(false);
      if (!this.isHovered()) this.expansion.set(null);
    }, GameCardComponent.CLOSE_MS);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  protected readonly trailerUrl = computed<SafeResourceUrl | null>(() => {
    const id = this.game().trailer;
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    const params = `autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}?${params}`);
  });

  protected onMouseEnter(): void {
    this.clearCloseTimer();
    this.isClosing.set(false);
    this.expansion.set(null);
    if (this.expandable() && this.game().trailer && window.innerWidth >= 992) {
      const card = this.host.nativeElement.getBoundingClientRect();
      const area = (this.host.nativeElement.closest('.grid-wrapper') ?? document.body).getBoundingClientRect();
      const width = Math.min((card.height * 16) / 9, area.width);
      let left = (card.width - width) / 2;
      if (card.left + left < area.left) left = area.left - card.left;
      if (card.left + left + width > area.right) left = area.right - width - card.left;
      this.expansion.set({
        width,
        height: card.height,
        left,
        clipLeft: -left,
        clipRight: width - card.width + left,
      });
    }
    this.hoverStart.emit();
  }
}
