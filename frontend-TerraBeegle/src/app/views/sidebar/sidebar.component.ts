import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameGenreItem } from '../../models-services/game.model';
import { CatalogFiltersService, CatalogSortBy, MAX_YEAR, MIN_YEAR } from '../../services/catalog-filters.service';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, LiquidGlassComponent],
  template: `
    <ng-template #filtersContent>
      <div class="mb-3">
        <div class="input-group input-group-sm">
          <input
            type="search"
            class="form-control sidebar-search"
            placeholder="Search genres, themes or platforms..."
            aria-label="Search genres, themes or platforms"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
        </div>
      </div>

      <div class="mb-3 pb-2 border-bottom border-light-subtle d-flex align-items-center gap-2">
        <a
          class="nav-link sidebar-item rounded-3 fw-bold flex-grow-1"
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMobileDrawer()"
        >
          All Games
        </a>
        @if (activeCount() > 0) {
          <button type="button" class="clear-btn" (click)="filtersService.clear()">
            Clear filters ({{ activeCount() }})
          </button>
        }
      </div>

      <!-- Sorting -->
      <div class="category-group mb-3">
        <label class="filter-label" for="sidebar-sort">Sort by</label>
        <div class="d-flex gap-2">
          <select
            id="sidebar-sort"
            class="form-select form-select-sm sidebar-search flex-grow-1"
            [value]="filters().sortBy"
            (change)="onSortChange($event)"
          >
            @for (option of sortOptions; track option.value) {
              <option [value]="option.value" [selected]="option.value === filters().sortBy">{{ option.label }}</option>
            }
          </select>
          <button
            type="button"
            class="direction-btn"
            [title]="filters().ascending ? 'Ascending' : 'Descending'"
            [attr.aria-label]="filters().ascending ? 'Sort ascending' : 'Sort descending'"
            (click)="filtersService.update({ ascending: !filters().ascending })"
          >
            {{ filters().ascending ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      @for (section of orderedSections(); track section.key) {
        <div class="category-group mb-2">
          <button
            class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
            type="button"
            (click)="toggleSection(section.key)"
            [attr.aria-expanded]="isSectionOpen(section.key)"
          >
            <span class="fw-bold small text-uppercase">
              {{ section.label }}
              @if (section.selectedIds.length) {
                <span class="count-badge">{{ section.selectedIds.length }}</span>
              }
            </span>
            <span class="chevron" [class.open]="isSectionOpen(section.key)">▾</span>
          </button>
          <div class="collapse" [class.show]="isSectionOpen(section.key)">
            <ul class="category-list list-unstyled mb-0 py-1">
              @for (item of section.items; track item.id) {
                <li class="category-item">
                  <button
                    type="button"
                    class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2"
                    [class.active]="section.selectedIds.includes(item.id)"
                    [attr.aria-pressed]="section.selectedIds.includes(item.id)"
                    (click)="filtersService.toggle(section.key, item.id)"
                  >
                    <span class="text-start">{{ item.name }}</span>
                    @if (section.selectedIds.includes(item.id)) {
                      <span aria-hidden="true">✓</span>
                    }
                  </button>
                </li>
              }
              @if (section.items.length === 0) {
                <li class="text-muted small px-3 py-1">{{ listsError() ? section.errorLabel : section.emptyLabel }}</li>
              }
            </ul>
          </div>
        </div>
      }

      <!-- Release year -->
      <div class="category-group mb-3 mt-3">
        <span class="filter-label">Release year</span>
        <div class="d-flex align-items-center gap-2">
          <input
            type="number"
            class="form-control form-control-sm sidebar-search"
            placeholder="From"
            aria-label="Released from year"
            [min]="minYear"
            [max]="maxYear"
            [value]="filters().yearMin ?? ''"
            (change)="onYearChange('yearMin', $event)"
          />
          <span class="text-body-secondary small">–</span>
          <input
            type="number"
            class="form-control form-control-sm sidebar-search"
            placeholder="To"
            aria-label="Released until year"
            [min]="minYear"
            [max]="maxYear"
            [value]="filters().yearMax ?? ''"
            (change)="onYearChange('yearMax', $event)"
          />
        </div>
      </div>

      <div class="category-group mb-3" role="group" aria-label="User rating range">
        <div class="filter-label d-flex justify-content-between align-items-center">
          <span>User rating</span>
          <span class="rating-value">{{ ratingDraft() }} – {{ ratingMaxDraft() }}</span>
        </div>
        <div class="dual-slider" [style.--range-start]="(ratingDraft() * 10) + '%'"
          [style.--range-end]="(ratingMaxDraft() * 10) + '%'">
          <div class="dual-slider-track" aria-hidden="true"></div>
          <input type="range" class="rating-slider range-min" min="0" max="10" step="0.1"
            aria-label="Minimum user rating" [value]="ratingDraft()"
            [style.z-index]="ratingDraft() > 5 ? 3 : 1"
            [attr.aria-valuemax]="ratingMaxDraft()"
            (input)="onScoreInput('rating', true, $event)"
            (change)="applyScoreRange('rating')" />
          <input type="range" class="rating-slider range-max" min="0" max="10" step="0.1"
            aria-label="Maximum user rating" [value]="ratingMaxDraft()"
            [attr.aria-valuemin]="ratingDraft()"
            (input)="onScoreInput('rating', false, $event)"
            (change)="applyScoreRange('rating')" />
        </div>
        <div class="rating-limits" aria-hidden="true"><span>0</span><span>10</span></div>
      </div>

      <div class="category-group mb-2" role="group" aria-label="Critic score range">
        <div class="filter-label d-flex justify-content-between align-items-center">
          <span>Critic score</span>
          <span class="rating-value">{{ criticDraft() }} – {{ criticMaxDraft() }}</span>
        </div>
        <div class="dual-slider" [style.--range-start]="(criticDraft() * 1) + '%'"
          [style.--range-end]="(criticMaxDraft() * 1) + '%'">
          <div class="dual-slider-track" aria-hidden="true"></div>
          <input type="range" class="rating-slider range-min" min="0" max="100" step="1"
            aria-label="Minimum critic score" [value]="criticDraft()"
            [style.z-index]="criticDraft() > 50 ? 3 : 1"
            [attr.aria-valuemax]="criticMaxDraft()"
            (input)="onScoreInput('critic', true, $event)"
            (change)="applyScoreRange('critic')" />
          <input type="range" class="rating-slider range-max" min="0" max="100" step="1"
            aria-label="Maximum critic score" [value]="criticMaxDraft()"
            [attr.aria-valuemin]="criticDraft()"
            (input)="onScoreInput('critic', false, $event)"
            (change)="applyScoreRange('critic')" />
        </div>
        <div class="rating-limits" aria-hidden="true"><span>0</span><span>100</span></div>
      </div>
    </ng-template>

    <!-- ==================== DESKTOP VIEW ==================== -->
    <div class="d-none d-lg-block w-100 sidebar-desktop-card">
      <app-liquid-glass
        borderRadius="24px"
        blur="2px"
        [scale]="85"
      >
        <nav class="sidebar-content p-3 w-100">
          <ng-container *ngTemplateOutlet="filtersContent" />
        </nav>
      </app-liquid-glass>
    </div>

    <!-- ==================== MOBILE VIEW ==================== -->
    <div class="mobile-filter-bar d-lg-none">
      <button
        class="mobile-filter-btn"
        type="button"
        (click)="openMobileDrawer()"
        aria-label="Filter the catalog"
      >
        <svg
          class="filter-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
      </button>
    </div>

    <div
      class="sidebar-mobile-backdrop d-lg-none"
      [class.show]="isMobileDrawerOpen()"
      (click)="closeMobileDrawer()"
      aria-hidden="true"
    ></div>

    <div class="sidebar-drawer-clip d-lg-none">
      <div
        class="sidebar-menu-panel"
        [class.show]="isMobileDrawerOpen()"
        aria-label="Navigation Filters"
      >
        <div class="sidebar-panel-header d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <svg
              class="filter-header-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span class="fw-bold fs-6">Filters</span>
          </div>
          <button
            type="button"
            class="sidebar-close-btn"
            (click)="closeMobileDrawer()"
            aria-label="Close filters"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="sidebar-panel-scroll">
          <nav class="sidebar-content w-100 py-1">
            <ng-container *ngTemplateOutlet="filtersContent" />
          </nav>
        </div>
      </div>
    </div>
  `,
  styleUrl: './sidebar.component.css',
})
// Catalog filters (advanced search): sorting, genres, themes, platforms, release year and ratings, saved in the URL
export class SidebarComponent implements OnInit {
  protected readonly filtersService = inject(CatalogFiltersService);
  private readonly gameService = inject(GameService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly filters = this.filtersService.filters;
  protected readonly searchQuery = signal('');
  protected readonly isMobileDrawerOpen = signal(false);
  protected readonly themes = signal<GameGenreItem[]>([]);
  protected readonly genres = signal<GameGenreItem[]>([]);
  protected readonly platforms = signal<GameGenreItem[]>([]);
  protected readonly listsError = signal(false);

  protected readonly minYear = MIN_YEAR;
  protected readonly maxYear = MAX_YEAR;

  protected readonly sortOptions: { value: CatalogSortBy; label: string }[] = [
    { value: 'rating', label: 'User rating' },
    { value: 'critic_rating', label: 'Critic score' },
    { value: 'released', label: 'Release date' },
    { value: 'name', label: 'Name' },
  ];
  protected readonly ratingDraft = signal(this.filters().ratingMin ?? 0);
  protected readonly ratingMaxDraft = signal(this.filters().ratingMax ?? 10);
  protected readonly criticMaxDraft = signal(this.filters().criticMax ?? 100);
  protected readonly criticDraft = signal(this.filters().criticMin ?? 0);

  constructor() {
    effect(() => {
      const filters = this.filters();
      this.ratingDraft.set(filters.ratingMin ?? 0);
      this.criticDraft.set(filters.criticMin ?? 0);
      this.ratingMaxDraft.set(filters.ratingMax ?? 10);
      this.criticMaxDraft.set(filters.criticMax ?? 100);
    });
  }

  protected readonly openSections = signal<Record<string, boolean>>({
    genres: false,
    themes: false,
    platforms: false,
  });

  // How many filters are on (shown on "Clear filters")
  protected readonly activeCount = computed(() => {
    const f = this.filters();
    return (
      f.genres.length +
      f.themes.length +
      f.platforms.length +
      (f.yearMin !== null || f.yearMax !== null ? 1 : 0) +
      (f.ratingMin !== null || f.ratingMax !== null ? 1 : 0) +
      (f.criticMin !== null || f.criticMax !== null ? 1 : 0)
    );
  });

  protected readonly filteredThemes = computed(() => this.byName(this.themes()));
  protected readonly filteredGenres = computed(() => this.byName(this.genres()));
  protected readonly filteredPlatforms = computed(() => this.byName(this.platforms()));

  // Orders dropdown sections by search match accuracy when a query is active (exact > prefix > substring)
  protected readonly orderedSections = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const f = this.filters();
    const sections = [
      {
        key: 'genres' as const,
        label: 'Genres',
        items: this.filteredGenres(),
        selectedIds: f.genres,
        emptyLabel: 'No genres found',
        errorLabel: 'Could not load the genres.',
      },
      {
        key: 'themes' as const,
        label: 'Themes',
        items: this.filteredThemes(),
        selectedIds: f.themes,
        emptyLabel: 'No themes found',
        errorLabel: 'Could not load the themes.',
      },
      {
        key: 'platforms' as const,
        label: 'Platforms',
        items: this.filteredPlatforms(),
        selectedIds: f.platforms,
        emptyLabel: 'No platform found',
        errorLabel: 'Could not load the platforms.',
      },
    ];

    if (!query) {
      return sections;
    }

    return [...sections].sort((a, b) => this.sectionScore(b.items, query) - this.sectionScore(a.items, query));
  });

  ngOnInit(): void {
    // During SSR the relative /api URL cannot be called; the browser loads the lists after hydration
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    forkJoin([this.gameService.getGenres(), this.gameService.getPlatforms(), this.gameService.getThemes()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([genres, platforms, themes]) => {
          this.genres.set(genres);
          this.themes.set(themes);
          this.platforms.set(platforms);
        },
        error: () => this.listsError.set(true),
      });
  }

  protected onScoreInput(score: 'rating' | 'critic', isMinimum: boolean, event: Event): void {
    const input = event.target as HTMLInputElement;
    const minimum = score === 'rating' ? this.ratingDraft : this.criticDraft;
    const maximum = score === 'rating' ? this.ratingMaxDraft : this.criticMaxDraft;
    const value = isMinimum
      ? Math.min(input.valueAsNumber, maximum())
      : Math.max(input.valueAsNumber, minimum());
    (isMinimum ? minimum : maximum).set(value);
    input.value = String(value);
  }

  protected applyScoreRange(score: 'rating' | 'critic'): void {
    if (score === 'rating') {
      this.filtersService.update({ ratingMin: this.ratingDraft() || null,
        ratingMax: this.ratingMaxDraft() === 10 ? null : this.ratingMaxDraft() });
    } else {
      this.filtersService.update({ criticMin: this.criticDraft() || null,
        criticMax: this.criticMaxDraft() === 100 ? null : this.criticMaxDraft() });
    }
  }

  protected openMobileDrawer(): void {
    this.isMobileDrawerOpen.set(true);
  }

  protected closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // A new sorting gets its natural direction: names A-Z, everything else best / newest first
  protected onSortChange(event: Event): void {
    const sortBy = (event.target as HTMLSelectElement).value as CatalogSortBy;
    this.filtersService.update({ sortBy, ascending: sortBy === 'name' });
  }

  // Empty or out-of-range years remove that side of the interval
  protected onYearChange(key: 'yearMin' | 'yearMax', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    const year = Number.isInteger(value) && value >= MIN_YEAR && value <= MAX_YEAR ? value : null;
    this.filtersService.update({ [key]: year });
  }

  protected toggleSection(section: string): void {
    this.openSections.update((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  protected isSectionOpen(sectionKey: string): boolean {
    if (this.searchQuery().trim().length > 0) {
      switch (sectionKey) {
        case 'genres':
          return this.filteredGenres().length > 0;
        case 'themes':
          return this.filteredThemes().length > 0;
        case 'platforms':
          return this.filteredPlatforms().length > 0;
      }
      return true;
    }
    return !!this.openSections()[sectionKey];
  }

  private byName(items: GameGenreItem[]): GameGenreItem[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return items;
    return items
      .filter((item) => item.name.toLowerCase().includes(query))
      .sort((a, b) => this.matchScore(b.name, query) - this.matchScore(a.name, query));
  }

  private matchScore(name: string, query: string): number {
    const lower = name.toLowerCase();
    if (lower === query) return 3;
    if (lower.startsWith(query)) return 2;
    const idx = lower.indexOf(query);
    return idx !== -1 ? 1 - idx * 0.001 : 0;
  }

  private sectionScore(items: GameGenreItem[], query: string): number {
    if (items.length === 0) return 0;
    const best = this.matchScore(items[0].name, query);
    const sameTierCount = items.filter((item) => Math.floor(this.matchScore(item.name, query)) === Math.floor(best)).length;
    return best * 1000 + sameTierCount;
  }
}
