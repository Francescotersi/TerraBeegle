import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameGenreItem } from '../../models-services/game.model';
import { CatalogFiltersService, CatalogSortBy } from '../../services/catalog-filters.service';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';
import { SidebarCategoryListComponent, SidebarCategorySection } from './sidebar-category-list.component';
import { SidebarRangeFiltersComponent } from './sidebar-range-filters.component';

/** Catalog sidebar with search, sorting, taxonomy accordions, range filters, and mobile drawer. */
@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    LiquidGlassComponent,
    SidebarCategoryListComponent,
    SidebarRangeFiltersComponent,
  ],
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

      <app-sidebar-category-list
        [sections]="orderedSections()"
        [openSections]="openSections()"
        [hasSearchQuery]="searchQuery().trim().length > 0"
        [listsError]="listsError()"
        (toggleSection)="toggleSection($event)"
        (toggleItem)="filtersService.toggle($event.key, $event.id)"
      />

      <app-sidebar-range-filters />
    </ng-template>

    <div class="d-none d-lg-block w-100 sidebar-desktop-card">
      <app-liquid-glass borderRadius="24px" blur="2px" [scale]="85">
        <nav class="sidebar-content p-3 w-100">
          <ng-container *ngTemplateOutlet="filtersContent" />
        </nav>
      </app-liquid-glass>
    </div>

    <div class="mobile-filter-bar d-lg-none">
      <button class="mobile-filter-btn" type="button" (click)="openMobileDrawer()" aria-label="Filter the catalog">
        <svg class="filter-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
      </button>
    </div>

    <div class="sidebar-mobile-backdrop d-lg-none" [class.show]="isMobileDrawerOpen()" (click)="closeMobileDrawer()" aria-hidden="true"></div>

    <div class="sidebar-drawer-clip d-lg-none">
      <div class="sidebar-menu-panel" [class.show]="isMobileDrawerOpen()" aria-label="Navigation Filters">
        <div class="sidebar-panel-header d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <svg class="filter-header-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span class="fw-bold fs-6">Filters</span>
          </div>
          <button type="button" class="sidebar-close-btn" (click)="closeMobileDrawer()" aria-label="Close filters">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
  styles: `
    :host { display: block; width: 100%; }
    .sidebar-desktop-card { position: relative; }
    :host-context([data-bs-theme="light"]) .sidebar-desktop-card { filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.12)); }
    .mobile-filter-bar { display: flex; align-items: center; margin-bottom: 0.75rem; }
    .mobile-filter-btn {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.45rem 1.15rem; border-radius: 20px;
      background: var(--tb-glass-bg); backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid var(--tb-glass-border); color: var(--tb-text); font-weight: 600; font-size: 0.88rem;
      box-shadow: 0 4px 14px var(--tb-glass-shadow); transition: all 0.25s ease; cursor: pointer; outline: none;
    }
    .mobile-filter-btn:hover {
      background: var(--tb-accent-subtle); border-color: var(--tb-accent); color: var(--tb-accent);
      transform: translateY(-1px); box-shadow: 0 6px 18px var(--tb-glass-shadow);
    }
    .mobile-filter-btn:focus-visible { box-shadow: 0 0 0 3px var(--tb-accent-glow); }
    .mobile-filter-btn .filter-icon { color: var(--tb-accent); transition: transform 0.25s ease; }
    .mobile-filter-btn:hover .filter-icon { transform: scale(1.12); }
    .sidebar-mobile-backdrop {
      position: fixed; inset: 0; z-index: 1040; background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.32s ease, visibility 0.32s ease;
    }
    .sidebar-mobile-backdrop.show { opacity: 1; visibility: visible; pointer-events: auto; }
    .sidebar-drawer-clip { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 1060; }
    .sidebar-menu-panel {
      position: absolute; top: 5.5rem; left: 1rem; width: min(340px, calc(100vw - 2rem)); max-height: calc(100dvh - 6.75rem);
      z-index: 1060; display: flex; flex-direction: column; padding: 1.25rem; border-radius: 28px;
      background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(22px) saturate(190%); -webkit-backdrop-filter: blur(22px) saturate(190%);
      border: 1px solid var(--tb-glass-border);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9);
      transform: translateX(calc(-100% - 2rem)); opacity: 0; visibility: hidden; pointer-events: none;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease, visibility 0.4s;
    }
    :host-context([data-bs-theme="dark"]) .sidebar-menu-panel {
      background: rgba(7, 31, 73, 0.92); box-shadow: 0 22px 48px rgba(0, 0, 0, 0.65), inset 1px 1px 2px rgba(46, 217, 231, 0.2);
    }
    .sidebar-menu-panel.show { transform: translateX(0); opacity: 1; visibility: visible; pointer-events: auto; }
    .sidebar-panel-header { border-color: var(--bs-border-color) !important; flex-shrink: 0; }
    .filter-header-icon { color: var(--tb-accent); }
    .sidebar-close-btn {
      width: 34px; height: 34px; border-radius: 50%; background: var(--tb-input-bg); border: 1px solid var(--tb-glass-border);
      color: var(--tb-text); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; outline: none;
    }
    .sidebar-close-btn:hover { background: var(--tb-accent-subtle); color: var(--tb-accent); border-color: var(--tb-accent); transform: scale(1.05); }
    .sidebar-panel-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--tb-accent) transparent; padding-right: 0.25rem; }
    .sidebar-panel-scroll::-webkit-scrollbar { width: 4px; }
    .sidebar-panel-scroll::-webkit-scrollbar-thumb { background: var(--tb-accent-glow); border-radius: 4px; }
    .sidebar-content { background: transparent; width: 100%; }
    .sidebar-search {
      background-color: var(--tb-input-bg); border: 1px solid var(--tb-input-border); border-radius: 20px;
      font-size: 0.85rem; padding: 0.4rem 0.75rem; color: var(--tb-text); transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .sidebar-search::placeholder { color: var(--tb-text-muted); opacity: 0.8; }
    .sidebar-search:focus { background-color: var(--tb-input-bg-focus); border-color: var(--tb-accent); box-shadow: 0 0 0 0.25rem var(--tb-accent-glow); color: var(--tb-text); }
    :host-context([data-bs-theme="light"]) .sidebar-search { background-color: rgba(255, 255, 255, 0.85); border-color: rgba(51, 65, 85, 0.32); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06); }
    :host-context([data-bs-theme="light"]) .border-light-subtle { border-color: rgba(51, 65, 85, 0.35) !important; }
    .sidebar-item { color: var(--tb-text); padding: 0.5rem 0.75rem; text-decoration: none; display: flex; transition: all 0.15s ease; }
    .sidebar-item:hover { background-color: var(--tb-accent-subtle); color: var(--tb-accent); }
    .sidebar-item.active { background-color: var(--tb-accent-subtle); color: var(--tb-accent); font-weight: 600; }
    .filter-label { display: block; margin-bottom: 0.4rem; padding-left: 0.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--tb-text); }
    .clear-btn { flex-shrink: 0; border: 1px solid var(--tb-accent); border-radius: 20px; background: transparent; color: var(--tb-accent); font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.65rem; white-space: nowrap; transition: all 0.2s ease; }
    .clear-btn:hover { background: var(--tb-btn-gradient); border-color: transparent; color: #fff; }
    .direction-btn { flex-shrink: 0; width: 34px; border: 1px solid var(--tb-input-border); border-radius: 20px; background: var(--tb-input-bg); color: var(--tb-text); font-weight: 700; transition: all 0.2s ease; }
    .direction-btn:hover { border-color: var(--tb-accent); color: var(--tb-accent); }
  `,
})
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

  protected readonly sortOptions: { value: CatalogSortBy; label: string }[] = [
    { value: 'rating', label: 'User rating' },
    { value: 'critic_rating', label: 'Critic score' },
    { value: 'released', label: 'Release date' },
    { value: 'name', label: 'Name' },
  ];

  protected readonly openSections = signal<Record<string, boolean>>({
    genres: false,
    themes: false,
    platforms: false,
  });

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

  protected readonly orderedSections = computed<SidebarCategorySection[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const f = this.filters();
    const sections: SidebarCategorySection[] = [
      {
        key: 'genres',
        label: 'Genres',
        items: this.filteredGenres(),
        selectedIds: f.genres,
        emptyLabel: 'No genres found',
        errorLabel: 'Could not load the genres.',
      },
      {
        key: 'themes',
        label: 'Themes',
        items: this.filteredThemes(),
        selectedIds: f.themes,
        emptyLabel: 'No themes found',
        errorLabel: 'Could not load the themes.',
      },
      {
        key: 'platforms',
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

  protected onSortChange(event: Event): void {
    const sortBy = (event.target as HTMLSelectElement).value as CatalogSortBy;
    this.filtersService.update({ sortBy, ascending: sortBy === 'name' });
  }

  protected toggleSection(section: string): void {
    this.openSections.update((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
