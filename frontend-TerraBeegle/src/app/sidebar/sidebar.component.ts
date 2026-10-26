import { Component, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar-card p-3 shadow-sm rounded-4">

      <!-- Barra di ricerca -->
      <div class="mb-3">
        <div class="input-group input-group-sm">
          <input
            type="search"
            class="form-control sidebar-search rounded-3"
            placeholder="Search Filters..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
        </div>
      </div>

      <div class="mb-3 pb-2 border-bottom">
        <a
          class="nav-link sidebar-item rounded-3 fw-bold"
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
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
            Genres ({{ filteredGenres().length }})
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
            Tags ({{ filteredTags().length }})
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
                >
                  <span>#{{ tag.name }}</span>
                </a>
              </li>
            }
            @if (filteredTags().length === 0) {
              <li class="text-muted small px-3 py-1">Nessun tag trovato</li>
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
            Platforms ({{ filteredPlatforms().length }})
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
                >
                  <span>{{ platform.name }}</span>
                </a>
              </li>
            }
            @if (filteredPlatforms().length === 0) {
              <li class="text-muted small px-3 py-1">Nessuna piattaforma</li>
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
            Publishers ({{ filteredPublishers().length }})
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
                >
                  <span>{{ pub.name }}</span>
                </a>
              </li>
            }
            @if (filteredPublishers().length === 0) {
              <li class="text-muted small px-3 py-1">Nessun publisher</li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: `
    .sidebar-card {
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .sidebar-search {
      background-color: rgba(248, 250, 252, 0.8);
      border: 1px solid rgba(0, 0, 0, 0.1);
      font-size: 0.85rem;
      padding: 0.4rem 0.75rem;
    }
    .sidebar-search:focus {
      border-color: #c16dc9;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
    }
    /* Pulsante dell'intestazione categoria */
    .category-btn {
      background: transparent;
      color: #334155;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .category-btn:hover {
      background-color: rgba(56, 189, 248, 0.08);
      color: #0284c7;
    }
    /* Freccetta che ruota quando la sezione è aperta */
    .chevron {
      font-size: 0.9rem;
      transition: transform 0.2s ease;
      display: inline-block;
      transform: rotate(-90deg);
    }
    .chevron.open {
      transform: rotate(0deg);
    }
    /* Elenco interno a tendina in vera lista verticale con scrollbar sottile */
    .category-list {
      max-height: 180px;
      overflow-y: auto;
      scrollbar-width: thin;
      padding-left: 0.5rem;
      padding-right: 0.25rem;
    }
    .category-item {
      margin-bottom: 2px;
    }
    /* Singola voce della lista verticale */
    .sidebar-list-link {
      color: #475569;
      font-size: 0.85rem;
      padding: 0.35rem 0.65rem;
      text-decoration: none;
      display: flex;
      width: 100%;
      transition: all 0.15s ease;
    }
    .sidebar-list-link:hover {
      background-color: rgba(56, 189, 248, 0.12);
      color: #0284c7;
      transform: translateX(4px);
    }
    .sidebar-list-link.active {
      background-color: #38bdf8 !important;
      color: #ffffff !important;
      font-weight: 600;
    }
    .sidebar-item {
      color: #1e293b;
      padding: 0.5rem 0.75rem;
      text-decoration: none;
      display: flex;
      transition: all 0.15s ease;
    }
    .sidebar-item:hover {
      background-color: rgba(56, 189, 248, 0.12);
      color: #0284c7;
    }
    .sidebar-item.active {
      background-color: #38bdf8 !important;
      color: #ffffff !important;
    }
  `,
})
export class SidebarComponent {
  protected readonly searchQuery = signal('');

  protected readonly openSections = signal<Record<string, boolean>>({
    genres: false,
    tags: false,
    platforms: false,
    publishers: false,
  });

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
  })

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