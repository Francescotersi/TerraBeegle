import { Component, OnDestroy, computed, input, signal } from '@angular/core';

/** PEGI age rating badge with a 1s hover submenu displaying content descriptor icons. */
@Component({
  selector: 'app-pegi-badge',
  standalone: true,
  template: `
    <div
      class="pegi-wrapper flex-shrink-0"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <button
        type="button"
        class="pegi-trigger"
        [attr.aria-expanded]="pegiDescriptions().length > 0 ? isMenuOpen() : null"
        [attr.aria-label]="'PEGI ' + rating() + (pegiDescriptions().length ? ' content descriptors' : '')"
        (click)="pegiDescriptions().length > 0 && toggleMenu()"
      >
        @if (ratingIcon(); as iconUrl) {
          @if (!failedIcons().has(iconUrl)) {
            <img
              class="pegi-icon"
              [src]="iconUrl"
              [alt]="'PEGI ' + rating()"
              [title]="pegiTitle()"
              (error)="onIconError(iconUrl)"
            />
          } @else {
            <span class="pegi-box" [title]="pegiTitle()">PEGI {{ rating() }}</span>
          }
        }
        @if (pegiDescriptions().length > 0) {
          <svg
            class="pegi-arrow"
            [class.open]="isMenuOpen()"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        }
      </button>

      @if (pegiDescriptions().length > 0 && isMenuOpen()) {
        <div class="pegi-submenu" role="menu" aria-label="PEGI content descriptors">
          @for (desc of pegiDescriptions(); track desc.label) {
            @if (!failedIcons().has(desc.iconUrl)) {
              <img
                class="pegi-sub-icon"
                [src]="desc.iconUrl"
                [alt]="desc.label"
                [title]="desc.label"
                (error)="onIconError(desc.iconUrl)"
              />
            }
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }

    .pegi-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .pegi-trigger {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--tb-text-muted);
      cursor: pointer;
    }
    .pegi-arrow {
      transition: transform 0.2s ease, color 0.2s ease;
    }
    .pegi-trigger:hover .pegi-arrow,
    .pegi-arrow.open {
      color: var(--tb-accent);
    }
    .pegi-arrow.open {
      transform: rotate(180deg);
    }
    .pegi-submenu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 12px;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-glass-bg);
      backdrop-filter: blur(12px);
      animation: pegiMenuIn 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .pegi-sub-icon {
      height: 36px;
      width: auto;
      object-fit: contain;
      border-radius: 5px;
      display: block;
    }
    @keyframes pegiMenuIn {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .pegi-icon {
      height: 28px;
      width: auto;
      object-fit: contain;
      display: block;
      border-radius: 4px;
    }
    @media (min-width: 768px) {
      .pegi-icon {
        height: 32px;
      }
    }
    .pegi-box {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 7px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 800;
      background: #0f172a;
      color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
  `,
})
export class PegiBadgeComponent implements OnDestroy {
  readonly rating = input.required<string>();
  readonly descriptions = input<string[] | null>(null);

  protected readonly failedIcons = signal<Set<string>>(new Set());
  protected readonly isMenuOpen = signal(false);
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly pegiTitle = computed(() => {
    const list = this.descriptions();
    return list?.length ? list.join(', ') : 'PEGI age rating';
  });

  protected readonly ratingIcon = computed(() => {
    const r = this.rating().trim();
    return r ? `https://www.igdb.com/icons/rating_icons/pegi/pegi_${r.toLowerCase()}.png` : null;
  });

  protected readonly pegiDescriptions = computed(() =>
    (this.descriptions() ?? []).map((label) => {
      const slug = label.trim().toLowerCase().replace(/\s+/g, '-');
      return {
        label,
        iconUrl: `https://www.igdb.com/icons/rating_icons/pegi/pegi_${slug}.png`,
      };
    })
  );

  protected onMouseEnter(): void {
    if (this.pegiDescriptions().length === 0 || this.isMenuOpen()) return;
    this.clearTimer();
    this.hoverTimer = setTimeout(() => {
      this.isMenuOpen.set(true);
      this.hoverTimer = null;
    }, 1000);
  }

  protected onMouseLeave(): void {
    this.clearTimer();
    this.isMenuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.clearTimer();
    this.isMenuOpen.update((open) => !open);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  protected onIconError(url: string): void {
    this.failedIcons.update((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }
}
