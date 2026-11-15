import { Component, DestroyRef, ElementRef, HostListener, OnInit, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { GameService } from '../../services/game.service';
import { CatalogFiltersService } from '../../services/catalog-filters.service';
import { GameCardDTO } from '../../models-services/game.model';
import { GameSearchDropdownComponent } from './game-search-dropdown.component';

const MIN_LENGTH = 2;
const MAX_SUGGESTIONS = 6;

/** Header search bar with debounced live game suggestions and keyboard navigation. */
@Component({
  selector: 'app-game-search-box',
  standalone: true,
  imports: [GameSearchDropdownComponent],
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
          <app-game-search-dropdown
            [suggestions]="suggestions()"
            [activeIndex]="activeIndex()"
            [isSearching]="isSearching()"
            [term]="term()"
            (activeIndexChange)="activeIndex.set($event)"
            (selectGame)="openGame($event)"
            (seeAll)="onSubmit()"
          />
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

    @media (max-width: 991.98px) {
      .search-field {
        flex: 1;
      }
      .search-input,
      .search-input:focus {
        width: 100% !important;
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

  readonly navigated = output<void>();

  protected readonly term = signal('');
  protected readonly suggestions = signal<GameCardDTO[]>([]);
  protected readonly isSearching = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);

  private readonly input$ = new Subject<string>();

  ngOnInit(): void {
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

  protected onInput(value: string): void {
    this.term.set(value);
    this.isOpen.set(value.trim().length >= MIN_LENGTH);
    this.input$.next(value);
  }

  protected onFocus(): void {
    if (this.term().trim().length >= MIN_LENGTH) {
      this.isOpen.set(true);
    }
  }

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

  protected onSubmit(): void {
    const search = this.term().trim();
    this.close();
    this.filtersService.update({ search });
    this.navigated.emit();
  }

  protected openGame(game: GameCardDTO): void {
    this.close();
    this.term.set('');
    this.suggestions.set([]);
    this.input$.next('');
    this.gameService.rememberGameSlug(game.slug, game.apiGameId);
    this.router.navigate(['/game', game.slug || game.apiGameId]);
    this.navigated.emit();
  }

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
