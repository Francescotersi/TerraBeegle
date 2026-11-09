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
              <li class="text-muted small px-3 py-1">Nessun genere trovato</li>
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
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    :host-context([data-bs-theme="light"]) .sidebar-desktop-card {
      filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.12));
    }

    .mobile-filter-bar {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .mobile-filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 1.15rem;
      border-radius: 20px;
      background: var(--tb-glass-bg);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid var(--tb-glass-border);
      color: var(--tb-text);
      font-weight: 600;
      font-size: 0.88rem;
      box-shadow: 0 4px 14px var(--tb-glass-shadow);
      transition: all 0.25s ease;
      cursor: pointer;
      outline: none;
    }

    .mobile-filter-btn:hover {
      background: var(--tb-accent-subtle);
      border-color: var(--tb-accent);
      color: var(--tb-accent);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px var(--tb-glass-shadow);
    }

    .mobile-filter-btn:focus-visible {
      box-shadow: 0 0 0 3px var(--tb-accent-glow);
    }

    .mobile-filter-btn .filter-icon {
      color: var(--tb-accent);
      transition: transform 0.25s ease;
    }

    .mobile-filter-btn:hover .filter-icon {
      transform: scale(1.12);
    }

    .sidebar-mobile-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1040;
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.32s ease, visibility 0.32s ease;
    }

    .sidebar-mobile-backdrop.show {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .sidebar-drawer-clip {
      position: fixed;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1060;
    }

    .sidebar-menu-panel {
      position: absolute;
      top: 5.5rem;
      left: 1rem;
      width: min(340px, calc(100vw - 2rem));
      max-height: calc(100dvh - 6.75rem);
      z-index: 1060;
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(22px) saturate(190%);
      -webkit-backdrop-filter: blur(22px) saturate(190%);
      border: 1px solid var(--tb-glass-border);
      box-shadow:
        0 24px 48px rgba(0, 0, 0, 0.16),
        0 4px 16px rgba(0, 0, 0, 0.08),
        inset 1px 1px 2px rgba(255, 255, 255, 0.9);

      transform: translateX(calc(-100% - 2rem));
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition:
        transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
        opacity 0.28s ease,
        visibility 0.4s;
    }

    :host-context([data-bs-theme="dark"]) .sidebar-menu-panel {
      background: rgba(7, 31, 73, 0.92);
      box-shadow:
        0 22px 48px rgba(0, 0, 0, 0.65),
        inset 1px 1px 2px rgba(46, 217, 231, 0.2);
    }

    .sidebar-menu-panel.show {
      transform: translateX(0);
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .sidebar-panel-header {
      border-color: var(--bs-border-color) !important;
      flex-shrink: 0;
    }

    .filter-header-icon {
      color: var(--tb-accent);
    }

    .sidebar-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-glass-border);
      color: var(--tb-text);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }

    .sidebar-close-btn:hover {
      background: var(--tb-accent-subtle);
      color: var(--tb-accent);
      border-color: var(--tb-accent);
      transform: scale(1.05);
    }

    .sidebar-panel-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: var(--tb-accent) transparent;
      padding-right: 0.25rem;
    }

    .sidebar-panel-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-panel-scroll::-webkit-scrollbar-thumb {
      background: var(--tb-accent-glow);
      border-radius: 4px;
    }

    .sidebar-content {
      background: transparent;
      width: 100%;
    }

    .sidebar-search {
      background-color: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      border-radius: 20px;
      font-size: 0.85rem;
      padding: 0.4rem 0.75rem;
      color: var(--tb-text);
      transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .sidebar-search::placeholder {
      color: var(--tb-text-muted);
      opacity: 0.8;
    }

    .sidebar-search:focus {
      background-color: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      box-shadow: 0 0 0 0.25rem var(--tb-accent-glow);
      color: var(--tb-text);
    }

    :host-context([data-bs-theme="light"]) .sidebar-search {
      background-color: rgba(255, 255, 255, 0.85);
      border-color: rgba(51, 65, 85, 0.32);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    :host-context([data-bs-theme="light"]) .border-light-subtle {
      border-color: rgba(51, 65, 85, 0.35) !important;
    }

    .category-btn {
      background: transparent;
      color: var(--tb-text);
      transition: background 0.2s ease, color 0.2s ease;
    }

    .category-btn:hover {
      background-color: var(--tb-accent-subtle);
      color: var(--tb-accent);
    }

    .chevron {
      font-size: 0.9rem;
      transition: transform 0.2s ease, color 0.2s ease;
      display: inline-block;
      transform: rotate(-90deg);
      color: var(--tb-text-muted);
    }

    .chevron.open {
      transform: rotate(0deg);
      color: var(--tb-accent);
    }

    .category-list {
      max-height: 180px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--tb-accent) transparent;
      padding-left: 0.5rem;
      padding-right: 0.25rem;
    }

    .category-list::-webkit-scrollbar {
      width: 4px;
    }

    .category-list::-webkit-scrollbar-thumb {
      background: var(--tb-accent-glow);
      border-radius: 4px;
    }

    .category-item {
      margin-bottom: 2px;
    }

    .sidebar-list-link {
      color: var(--tb-text-muted);
      font-size: 0.85rem;
      padding: 0.35rem 0.65rem;
      text-decoration: none;
      display: flex;
      width: 100%;
      transition: all 0.15s ease;
    }

    .sidebar-list-link:hover {
      background-color: var(--tb-accent-subtle);
      color: var(--tb-accent);
      transform: translateX(4px);
    }

    .sidebar-list-link.active {
      background: var(--tb-btn-gradient) !important;
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 3px 10px var(--tb-btn-gradient-shadow);
    }

    .sidebar-item {
      color: var(--tb-text);
      padding: 0.5rem 0.75rem;
      text-decoration: none;
      display: flex;
      transition: all 0.15s ease;
    }

    .sidebar-item:hover {
      background-color: var(--tb-accent-subtle);
      color: var(--tb-accent);
    }

    .sidebar-item.active {
      background-color: var(--tb-accent-subtle);
      color: var(--tb-accent);
      font-weight: 600;
    }
  `,
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

  // --- DATI DI ESEMPIO ---
  protected readonly genres = [
    { id: 1, name: 'Azione', slug: 'action' },
    { id: 2, name: 'RPG', slug: 'role-playing-games-rpg' },
    { id: 3, name: 'Avventura', slug: 'adventure' },
    { id: 4, name: 'Strategia', slug: 'strategy' },
    { id: 5, name: 'Sparatutto', slug: 'shooter' },
    { id: 6, name: 'Indie', slug: 'indie' },
    { id: 7, name: 'Piattaforme', slug: 'platformer' },
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

