import { Component, DestroyRef, ElementRef, HostListener, OnInit, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { GameService } from '../../services/game.service';
import { CatalogFiltersService } from '../../services/catalog-filters.service';
import { GameCardDTO } from '../../models-services/game.model';

const MIN_LENGTH = 2;
const MAX_SUGGESTIONS = 6;

// Header search bar with live suggestions (like Steam): typing shows a few games, Enter shows all the results
@Component({
  selector: 'app-game-search-box',
  standalone: true,
  template: `
    <form
      class="search-form d-flex align-items-center"
      role="search"
      (submit)="$event.preventDefault(); onSubmit()"
    >
      <div class="search-field">
        <input
          #searchInput
          class="form-control me-2 search-input"
          type="search"
          placeholder="Search games..."
          aria-label="Search games"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="game-search-suggestions"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-activedescendant]="activeIndex() >= 0 ? 'game-suggestion-' + activeIndex() : null"
          [value]="term()"
          (input)="onInput(searchInput.value)"
          (focus)="onFocus()"
          (keydown)="onKeydown($event)"
        />

        @if (isOpen()) {
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
                  (mouseenter)="activeIndex.set(i)"
                  (click)="openGame(game)"
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
              <button type="button" class="see-all w-100" (click)="onSubmit()" [title]="'See all results for ' + term().trim()">
                See all results for “{{ term().trim() }}”
              </button>
            } @else if (isSearching()) {
              <div class="suggestions-state">Searching games...</div>
            } @else {
              <div class="suggestions-state text-truncate">No games found for “{{ term().trim() }}”.</div>
            }
          </div>
        }
      </div>

      <button class="btn search-btn" type="submit">Search</button>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }

    .search-field {
      position: relative;
    }

    /* Same look as the old header search bar */
    .search-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      border-radius: 20px;
      padding: 0.375rem 0.85rem;
      color: var(--tb-text);
      width: 170px;
      transition: background 0.2s ease, width 0.2s ease, border-color 0.2s ease;
    }
    .search-input::placeholder {
      color: var(--tb-text-muted);
      opacity: 0.8;
    }
    .search-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      box-shadow: none;
      outline: none;
      color: var(--tb-text);
      width: 200px;
    }

    .search-btn {
      border-radius: 20px;
      white-space: nowrap;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      color: var(--tb-accent);
      background: var(--tb-glass-bg);
      border: 1px solid var(--tb-accent);
      transition: all 0.2s ease;
    }
    .search-btn:hover {
      background: var(--tb-btn-gradient);
      color: #ffffff;
      border-color: transparent;
      transform: translateY(-1px);
    }

    /* Dropdown in the same style as the friend search autocomplete */
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

    /* A flex child does not shrink under its text without min-width: 0, so long names overflowed the list */
    .suggestion-text {
      flex: 1 1 auto;
      min-width: 0;
    }

    /* Long names end with "..." (the full name is in the tooltip) */
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

    /* Mobile menu: the bar takes the whole width, so the dropdown too */
    @media (max-width: 991.98px) {
      .search-field {
        flex: 1;
      }
      .search-input,
      .search-input:focus {
        width: 100% !important;
      }
      .suggestions {
        left: 0;
        right: auto;
        width: min(340px, calc(100vw - 2rem));
      }
    }

    @media (min-width: 2000px) {
      .search-input {
        width: 220px;
        font-size: 1.4rem;
        padding: 0.55rem 1rem;
      }
      .search-input:focus {
        width: 260px;
      }
      .search-btn {
        font-size: 1.4rem;
        padding: 0.5rem 1rem;
      }
    }
  `,
})
export class GameSearchBoxComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly filtersService = inject(CatalogFiltersService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  // Emitted after a search or a click on a game (the header closes the mobile menu)
  readonly navigated = output<void>();

  protected readonly term = signal('');
  protected readonly suggestions = signal<GameCardDTO[]>([]);
  protected readonly isSearching = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);

  private readonly input$ = new Subject<string>();

  ngOnInit(): void {
    // 300 ms after the last key; switchMap cancels the previous request, so old results never replace new ones
    this.input$
      .pipe(
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap((value) => {
          this.activeIndex.set(-1);
          this.isSearching.set(value.length >= MIN_LENGTH);
          if (value.length < MIN_LENGTH) {
            this.suggestions.set([]);
          }
        }),
        switchMap((value) =>
          value.length < MIN_LENGTH
            ? of([])
            : this.gameService
                .getGames({
                  name: value,
                  pageSize: MAX_SUGGESTIONS,
                  sortBy: 'rating',
                  ascending: false,
                  // No minimum of votes / critic reviews: every game with that name can be suggested
                  minRatingCount: 0,
                  minCriticRatingCount: 0,
                })
                .pipe(
                  map((response) => response.items ?? []),
                  catchError(() => of([]))
                )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((games) => {
        this.isSearching.set(false);
        this.suggestions.set(games);
        this.isOpen.set(this.term().trim().length >= MIN_LENGTH);
      });
  }

  // Every key typed in the bar
  protected onInput(value: string): void {
    this.term.set(value);
    if (value.trim().length < MIN_LENGTH) {
      this.isOpen.set(false);
    } else {
      this.isOpen.set(true);
    }
    this.input$.next(value);
  }

  // Shows the last suggestions again when the bar gets the focus back
  protected onFocus(): void {
    if (this.term().trim().length >= MIN_LENGTH) {
      this.isOpen.set(true);
    }
  }

  // Arrows move through the suggestions, Enter opens the selected one, Escape closes the list
  protected onKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;

    if (event.key === 'ArrowDown' && count > 0) {
      event.preventDefault();
      this.isOpen.set(true);
      this.activeIndex.update((index) => (index + 1) % count);
    } else if (event.key === 'ArrowUp' && count > 0) {
      event.preventDefault();
      this.activeIndex.update((index) => (index <= 0 ? count - 1 : index - 1));
    } else if (event.key === 'Enter' && this.isOpen() && this.activeIndex() >= 0) {
      event.preventDefault();
      this.openGame(this.suggestions()[this.activeIndex()]);
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  // Enter or "Search": the catalog with all the results (/?search=...), the sidebar filters stay
  protected onSubmit(): void {
    const search = this.term().trim();
    this.close();
    this.filtersService.update({ search });
    this.navigated.emit();
  }

  // A suggestion: straight to the details page
  protected openGame(game: GameCardDTO): void {
    this.close();
    this.term.set('');
    this.suggestions.set([]);
    // Also reset the stream, otherwise typing the same text again would be ignored by distinctUntilChanged
    this.input$.next('');
    this.gameService.rememberGameSlug(game.slug, game.apiGameId);
    this.router.navigate(['/game', game.slug || game.apiGameId]);
    this.navigated.emit();
  }

  protected toTen(rating: number): number {
    return Math.round(rating) / 10;
  }

  // A click anywhere outside the search bar closes the list
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }
}
