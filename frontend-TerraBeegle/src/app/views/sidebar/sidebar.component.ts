import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
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
            placeholder="Search genres or platforms..."
            aria-label="Search genres or platforms"
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

      <!-- Genres -->
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection('genres')"
          [attr.aria-expanded]="isSectionOpen('genres')"
        >
          <span class="fw-bold small text-uppercase">
            Genres
            @if (filters().genres.length) {
              <span class="count-badge">{{ filters().genres.length }}</span>
            }
          </span>
          <span class="chevron" [class.open]="isSectionOpen('genres')">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen('genres')">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (genre of filteredGenres(); track genre.id) {
              <li class="category-item">
                <button
                  type="button"
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2 border-0"
                  [class.active]="filters().genres.includes(genre.id)"
                  [attr.aria-pressed]="filters().genres.includes(genre.id)"
                  (click)="filtersService.toggle('genres', genre.id)"
                >
                  <span class="text-start">{{ genre.name }}</span>
                  @if (filters().genres.includes(genre.id)) {
                    <span aria-hidden="true">✓</span>
                  }
                </button>
              </li>
            }
            @if (filteredGenres().length === 0) {
              <li class="text-muted small px-3 py-1">{{ listsError() ? 'Could not load the genres.' : 'No genres found' }}</li>
            }
          </ul>
        </div>
      </div>

      <!-- Platforms -->
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection('platforms')"
          [attr.aria-expanded]="isSectionOpen('platforms')"
        >
          <span class="fw-bold small text-uppercase">
            Platforms
            @if (filters().platforms.length) {
              <span class="count-badge">{{ filters().platforms.length }}</span>
            }
          </span>
          <span class="chevron" [class.open]="isSectionOpen('platforms')">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen('platforms')">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (platform of filteredPlatforms(); track platform.id) {
              <li class="category-item">
                <button
                  type="button"
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2 border-0"
                  [class.active]="filters().platforms.includes(platform.id)"
                  [attr.aria-pressed]="filters().platforms.includes(platform.id)"
                  (click)="filtersService.toggle('platforms', platform.id)"
                >
                  <span class="text-start">{{ platform.name }}</span>
                  @if (filters().platforms.includes(platform.id)) {
                    <span aria-hidden="true">✓</span>
                  }
                </button>
              </li>
            }
            @if (filteredPlatforms().length === 0) {
              <li class="text-muted small px-3 py-1">{{ listsError() ? 'Could not load the platforms.' : 'No platform found' }}</li>
            }
          </ul>
        </div>
      </div>

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

      <!-- Minimum user rating (out of 10) -->
      <div class="category-group mb-3">
        <span class="filter-label">User rating</span>
        <div class="d-flex flex-wrap gap-1">
          @for (option of ratingOptions; track option.label) {
            <button
              type="button"
              class="filter-chip"
              [class.active]="filters().ratingMin === option.value"
              [attr.aria-pressed]="filters().ratingMin === option.value"
              (click)="filtersService.update({ ratingMin: option.value })"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </div>

      <!-- Minimum critic score (out of 100) -->
      <div class="category-group mb-2">
        <span class="filter-label">Critic score</span>
        <div class="d-flex flex-wrap gap-1">
          @for (option of criticOptions; track option.label) {
            <button
              type="button"
              class="filter-chip"
              [class.active]="filters().criticMin === option.value"
              [attr.aria-pressed]="filters().criticMin === option.value"
              (click)="filtersService.update({ criticMin: option.value })"
            >
              {{ option.label }}
            </button>
          }
        </div>
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
// Catalog filters (advanced search): sorting, genres, platforms, release year and ratings, saved in the URL
export class SidebarComponent implements OnInit {
  protected readonly filtersService = inject(CatalogFiltersService);
  private readonly gameService = inject(GameService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly filters = this.filtersService.filters;
  protected readonly searchQuery = signal('');
  protected readonly isMobileDrawerOpen = signal(false);
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
  protected readonly ratingOptions = [
    { value: null, label: 'Any' },
    { value: 6, label: '6+' },
    { value: 7, label: '7+' },
    { value: 8, label: '8+' },
    { value: 9, label: '9+' },
  ];
  protected readonly criticOptions = [
    { value: null, label: 'Any' },
    { value: 60, label: '60+' },
    { value: 70, label: '70+' },
    { value: 80, label: '80+' },
    { value: 90, label: '90+' },
  ];

  protected readonly openSections = signal<Record<string, boolean>>({
    genres: false,
    platforms: false,
  });

  // How many filters are on (shown on "Clear filters")
  protected readonly activeCount = computed(() => {
    const f = this.filters();
    return (
      f.genres.length +
      f.platforms.length +
      (f.yearMin !== null || f.yearMax !== null ? 1 : 0) +
      (f.ratingMin !== null ? 1 : 0) +
      (f.criticMin !== null ? 1 : 0)
    );
  });

  protected readonly filteredGenres = computed(() => this.byName(this.genres()));
  protected readonly filteredPlatforms = computed(() => this.byName(this.platforms()));

  ngOnInit(): void {
    // During SSR the relative /api URL cannot be called; the browser loads the lists after hydration
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    forkJoin([this.gameService.getGenres(), this.gameService.getPlatforms()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([genres, platforms]) => {
          this.genres.set(genres);
          this.platforms.set(platforms);
        },
        error: () => this.listsError.set(true),
      });
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
      return true;
    }
    return !!this.openSections()[sectionKey];
  }

  // The text of "Search genres or platforms..." filters both lists
  private byName(items: GameGenreItem[]): GameGenreItem[] {
    const query = this.searchQuery().toLowerCase().trim();
    return query ? items.filter((item) => item.name.toLowerCase().includes(query)) : items;
  }
}
