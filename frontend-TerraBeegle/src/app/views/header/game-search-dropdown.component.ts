import { Component, input, output } from '@angular/core';
import { GameCardDTO } from '../../models-services/game.model';

/** Autocomplete dropdown displaying live game search suggestions and a "See all results" action. */
@Component({
  selector: 'app-game-search-dropdown',
  standalone: true,
  template: `
    <div class="suggestions" id="game-search-suggestions" role="listbox" aria-label="Game suggestions">
      @if (suggestions().length > 0) {
        @for (game of suggestions(); track game.apiGameId; let i = $index) {
          <button
            type="button"
            class="suggestion d-flex align-items-center gap-2 w-100"
            role="option"
            [id]="'game-suggestion-' + i"
            [class.active]="activeIndex() === i"
            [attr.aria-selected]="activeIndex() === i"
            (mouseenter)="activeIndexChange.emit(i)"
            (click)="selectGame.emit(game)"
          >
            @if (game.cover) {
              <img class="suggestion-cover" [src]="game.cover" [alt]="''" width="36" height="48" loading="lazy" />
            } @else {
              <span class="suggestion-cover placeholder-cover" aria-hidden="true">🎮</span>
            }
            <span class="suggestion-text d-flex flex-column text-start">
              <span class="suggestion-name" [title]="game.name">{{ game.name }}</span>
              <span class="suggestion-meta">
                @if (game.releaseDate) {
                  {{ game.releaseDate.slice(0, 4) }}
                }
                @if (game.rating != null) {
                  <span class="suggestion-rating">★ {{ toTen(game.rating) }}</span>
                }
              </span>
            </span>
          </button>
        }
        <button type="button" class="see-all w-100" (click)="seeAll.emit()" [title]="'See all results for ' + term().trim()">
          See all results for “{{ term().trim() }}”
        </button>
      } @else if (isSearching()) {
        <div class="suggestions-state">Searching games...</div>
      } @else {
        <div class="suggestions-state text-truncate">No games found for “{{ term().trim() }}”.</div>
      }
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .suggestions {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: min(340px, 90vw);
      z-index: 1100;
      padding: 4px;
      border-radius: 14px;
      background: var(--bs-body-bg);
      border: 1px solid var(--tb-glass-border);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
      animation: dropIn 0.18s ease;
    }
    :host-context([data-bs-theme="dark"]) .suggestions {
      background: #0d1e3d;
      border-color: rgba(46, 217, 231, 0.35);
    }

    .suggestion {
      min-width: 0;
      overflow: hidden;
      padding: 6px 8px;
      border: none;
      border-radius: 10px;
      background: none;
      color: var(--tb-text);
      transition: background 0.15s ease;
    }
    .suggestion.active {
      background: var(--tb-accent-subtle);
    }

    .suggestion-cover {
      width: 36px;
      height: 48px;
      flex-shrink: 0;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--tb-glass-border);
    }
    .placeholder-cover {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--tb-accent-subtle);
      font-size: 1rem;
    }

    .suggestion-text {
      flex: 1 1 auto;
      min-width: 0;
    }

    .suggestion-name {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 0.88rem;
      font-weight: 600;
    }
    .suggestion-meta {
      display: flex;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--tb-text-muted);
    }
    .suggestion-rating {
      color: #e6a700;
      font-weight: 700;
    }

    .see-all {
      margin-top: 2px;
      padding: 8px;
      border: none;
      border-top: 1px solid var(--tb-glass-border);
      border-radius: 0 0 10px 10px;
      background: none;
      color: var(--tb-accent);
      font-size: 0.82rem;
      font-weight: 600;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .see-all:hover {
      background: var(--tb-accent-subtle);
    }

    .suggestions-state {
      padding: 12px;
      text-align: center;
      font-size: 0.85rem;
      color: var(--tb-text-muted);
    }

    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 991.98px) {
      .suggestions {
        left: 0;
        right: auto;
        width: min(340px, calc(100vw - 2rem));
      }
    }
  `,
})
export class GameSearchDropdownComponent {
  readonly suggestions = input.required<GameCardDTO[]>();
  readonly activeIndex = input.required<number>();
  readonly isSearching = input.required<boolean>();
  readonly term = input.required<string>();

  readonly activeIndexChange = output<number>();
  readonly selectGame = output<GameCardDTO>();
  readonly seeAll = output<void>();

  protected toTen(rating: number): number {
    return Math.round(rating) / 10;
  }
}
