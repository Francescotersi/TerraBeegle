import { Component, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
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
            placeholder="Search Filters..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
        </div>
      </div>

      <div class="mb-3 pb-2 border-bottom border-light-subtle">
        <a
          class="nav-link sidebar-item rounded-3 fw-bold"
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeMobileDrawer()"
        >
          All Games
        </a>
      </div>

      <!-- Generi -->
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection('genres')"
        >
          <span class="fw-bold small text-uppercase">
            Genres
          </span>
          <span class="chevron" [class.open]="isSectionOpen('genres')">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen('genres')">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (genre of filteredGenres(); track genre.id) {
              <li class="category-item">
                <a
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2"
                  [routerLink]="['/genre', genre.slug]"
                  routerLinkActive="active"
                  (click)="closeMobileDrawer()"
                >
                  <span>{{ genre.name }}</span>
                </a>
              </li>
            }
            @if (filteredGenres().length === 0) {
              <li class="text-muted small px-3 py-1">No genres found</li>
            }
          </ul>
        </div>
      </div>

      <!-- Tags -->
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection('tags')"
        >
          <span class="fw-bold small text-uppercase">
            Tags
          </span>
          <span class="chevron" [class.open]="isSectionOpen('tags')">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen('tags')">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (tag of filteredTags(); track tag.id) {
              <li class="category-item">
                <a
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2"
                  [routerLink]="['/tag', tag.slug]"
                  routerLinkActive="active"
                  (click)="closeMobileDrawer()"
                >
                  <span>#{{ tag.name }}</span>
                </a>
              </li>
            }
            @if (filteredTags().length === 0) {
              <li class="text-muted small px-3 py-1">No tag found</li>
            }
          </ul>
        </div>
      </div>

      <!-- Piattaforme -->
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection('platforms')"
        >
          <span class="fw-bold small text-uppercase">
            Platforms
          </span>
          <span class="chevron" [class.open]="isSectionOpen('platforms')">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen('platforms')">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (platform of filteredPlatforms(); track platform.id) {
              <li class="category-item">
                <a
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2"
                  [routerLink]="['/platform', platform.slug]"
                  routerLinkActive="active"
                  (click)="closeMobileDrawer()"
                >
                  <span>{{ platform.name }}</span>
                </a>
              </li>
            }
            @if (filteredPlatforms().length === 0) {
              <li class="text-muted small px-3 py-1">No platform found</li>
            }
          </ul>
        </div>
      </div>

      <!-- Publishers -->
      <div class="category-group mb-2">
        <button
          class="category-btn d-flex justify-content-between align-items-center w-100 py-2 px-2 rounded-3 border-0"
          type="button"
          (click)="toggleSection('publishers')"
        >
          <span class="fw-bold small text-uppercase">
            Publishers
          </span>
          <span class="chevron" [class.open]="isSectionOpen('publishers')">▾</span>
        </button>
        <div class="collapse" [class.show]="isSectionOpen('publishers')">
          <ul class="category-list list-unstyled mb-0 py-1">
            @for (pub of filteredPublishers(); track pub.id) {
              <li class="category-item">
                <a
                  class="sidebar-list-link d-flex align-items-center justify-content-between rounded-2"
                  [routerLink]="['/publisher', pub.slug]"
                  routerLinkActive="active"
                  (click)="closeMobileDrawer()"
                >
                  <span>{{ pub.name }}</span>
                </a>
              </li>
            }
            @if (filteredPublishers().length === 0) {
              <li class="text-muted small px-3 py-1">No publisher found</li>
            }
          </ul>
        </div>
      </div>
    </ng-template>

    <!-- ==================== VISTA DESKTOP ==================== -->
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

    <!-- ==================== VISTA MOBILE ==================== -->
    <div class="mobile-filter-bar d-lg-none">
      <button
        class="mobile-filter-btn"
        type="button"
        (click)="openMobileDrawer()"
        aria-label="Filtra catalogo"
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
            aria-label="Closer filters"
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
export class SidebarComponent {
  protected readonly searchQuery = signal('');
  protected readonly isMobileDrawerOpen = signal(false);

  protected readonly openSections = signal<Record<string, boolean>>({
    genres: false,
    tags: false,
    platforms: false,
    publishers: false,
  });

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

  protected readonly filteredGenres = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.genres.filter((genre) => genre.name.toLowerCase().includes(query));
  });

  protected readonly filteredTags = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.tags.filter((tag) => tag.name.toLowerCase().includes(query));
  });

  protected readonly filteredPlatforms = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.platforms.filter((platform) => platform.name.toLowerCase().includes(query));
  });

  protected readonly filteredPublishers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.publishers.filter((publisher) => publisher.name.toLowerCase().includes(query));
  });

  // --- SAMPLE DATA ---
  protected readonly genres = [
    { id: 1, name: 'Action', slug: 'action' },
    { id: 2, name: 'RPG', slug: 'role-playing-games-rpg' },
    { id: 3, name: 'Adventure', slug: 'adventure' },
    { id: 4, name: 'Strategy', slug: 'strategy' },
    { id: 5, name: 'Shooter', slug: 'shooter' },
    { id: 6, name: 'Indie', slug: 'indie' },
    { id: 7, name: 'Platformer', slug: 'platformer' },
  ];
  protected readonly tags = [
    { id: 1, name: 'Open World', slug: 'open-world' },
    { id: 2, name: 'Multiplayer', slug: 'multiplayer' },
    { id: 3, name: 'Singleplayer', slug: 'singleplayer' },
    { id: 4, name: 'Co-op', slug: 'co-op' },
    { id: 5, name: 'Sci-Fi', slug: 'sci-fi' },
    { id: 6, name: 'Dark Fantasy', slug: 'dark-fantasy' },
  ];
  protected readonly platforms = [
    { id: 1, name: 'PC (Windows)', slug: 'pc' },
    { id: 2, name: 'PlayStation 5', slug: 'playstation5' },
    { id: 3, name: 'Xbox Series S/X', slug: 'xbox-series-x' },
    { id: 4, name: 'Nintendo Switch', slug: 'nintendo-switch' },
    { id: 5, name: 'macOS', slug: 'macos' },
  ];
  protected readonly publishers = [
    { id: 1, name: 'Electronic Arts', slug: 'electronic-arts' },
    { id: 2, name: 'Ubisoft', slug: 'ubisoft' },
    { id: 3, name: 'Sony Interactive', slug: 'sony-interactive' },
    { id: 4, name: 'Nintendo', slug: 'nintendo' },
    { id: 5, name: 'CD Projekt RED', slug: 'cd-projekt-red' },
    { id: 6, name: 'Capcom', slug: 'capcom' },
  ];
}
