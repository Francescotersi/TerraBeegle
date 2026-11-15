import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GameCardDTO, GameSearchResponse } from '../../../models-services/game.model';
import { WishlistFavoritesService } from '../../../services/wishlist-favorites.service';
import { AlertService } from '../../../services/alert.service';
import { DonutCardComponent, RankedItem } from './donut-card/donut-card.component';

export type { RankedItem };

interface StatisticsChart {
  key: 'genres' | 'platforms' | 'themes' | 'style';
  title: string;
  subtitle: string;
  items: RankedItem[];
  emptyMessage: string;
}

interface FavoritesPage {
  items: GameCardDTO[];
  totalCount: number;
}

const PAGE_SIZE = 50;

// Statistics of the user's favorites: 4 donut cards in a 2 x 2 grid (genres, platforms, themes, playing style)
@Component({
  selector: 'app-profile-statistics',
  standalone: true,
  imports: [DonutCardComponent],
  template: `
    @if (isLoading()) {
      <div class="statistics-state text-body-secondary">Loading your statistics...</div>
    } @else if (errorMessage()) {
      <div class="statistics-state text-body-secondary">{{ errorMessage() }}</div>
    } @else if (favoriteCount() === 0) {
      <div class="statistics-state text-body-secondary">
        Add games to your favorites to see your statistics.
      </div>
    } @else {
      <div class="statistics-grid">
        @for (chart of charts(); track chart.key) {
          <app-donut-card
            [title]="chart.title"
            [subtitle]="chart.subtitle"
            [items]="chart.items"
            [centerValue]="favoriteCount()"
            centerLabel="Favorites"
            [emptyMessage]="chart.emptyMessage"
          />
        }
      </div>
    }
  `,
  styleUrl: './profile-statistics.component.css',
})
export class ProfileStatisticsComponent implements OnInit {
  private readonly favoritesService = inject(WishlistFavoritesService);
  private readonly alertService = inject(AlertService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly favoriteCount = signal(0);
  readonly genreItems = signal<RankedItem[]>([]);
  readonly platformItems = signal<RankedItem[]>([]);
  readonly themeItems = signal<RankedItem[]>([]);
  readonly multiplayerCount = signal(0);

  // Singleplayer / multiplayer, largest first like the other charts
  private readonly styleItems = computed<RankedItem[]>(() => {
    const multi = this.multiplayerCount();
    return [
      { label: 'Singleplayer', count: this.favoriteCount() - multi },
      { label: 'Multiplayer', count: multi },
    ]
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  readonly charts = computed<StatisticsChart[]>(() => [
    {
      key: 'genres',
      title: 'Favorite genres',
      subtitle: 'Share of the genres across your favorites.',
      items: this.genreItems(),
      emptyMessage: 'No genre data for your favorites yet.',
    },
    {
      key: 'platforms',
      title: 'Favorite platforms',
      subtitle: 'Where your favorite games can be played.',
      items: this.platformItems(),
      emptyMessage: 'No platform data for your favorites yet.',
    },
    {
      key: 'themes',
      title: 'Favorite themes',
      subtitle: 'Share of the themes across your favorites.',
      items: this.themeItems(),
      emptyMessage: 'No theme data for your favorites yet.',
    },
    {
      key: 'style',
      title: 'Playing style',
      subtitle: 'Singleplayer or multiplayer, estimated from the genres.',
      items: this.styleItems(),
      emptyMessage: 'No playing style data yet.',
    },
  ]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    this.favoritesService.getFavorites(1, PAGE_SIZE).subscribe({
      next: (firstPage) => this.loadRemainingPages(firstPage),
      error: (error) => this.handleError(error),
    });
  }

  // The favorites come in pages of 50: download the other pages too, then build the statistics once
  private loadRemainingPages(firstPage: GameSearchResponse): void {
    const normalizedFirstPage = this.normalizePage(firstPage);
    const totalPages = Math.ceil(normalizedFirstPage.totalCount / PAGE_SIZE);
    if (totalPages <= 1) {
      this.buildStatistics(normalizedFirstPage.items);
      return;
    }

    forkJoin(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        this.favoritesService.getFavorites(index + 2, PAGE_SIZE)
      )
    ).subscribe({
      next: (pages) => this.buildStatistics(
        [normalizedFirstPage, ...pages.map((page) => this.normalizePage(page))].flatMap(
          (page) => page.items
        )
      ),
      error: (error) => this.handleError(error),
    });
  }

  private normalizePage(page: GameSearchResponse): FavoritesPage {
    return {
      items: page?.items ?? [],
      totalCount: page?.totalCount ?? 0,
    };
  }

  private buildStatistics(games: GameCardDTO[]): void {
    this.favoriteCount.set(games.length);
    this.genreItems.set(this.rank(games.map((game) => (game.genres ?? []).map((g) => g.name))));
    this.platformItems.set(this.rank(games.map((game) => (game.platforms ?? []).map((p) => p.name))));
    this.themeItems.set(this.rank(games.map((game) => (game.themes ?? []).map((t) => t.name))));
    this.multiplayerCount.set(games.filter((game) => this.isMultiplayer(game)).length);
    this.isLoading.set(false);
  }

  // Each game counts once per name, sorted from the most common (same count: alphabetical)
  private rank(namesPerGame: string[][]): RankedItem[] {
    const counts = new Map<string, number>();
    for (const names of namesPerGame) {
      for (const name of new Set(names.filter(Boolean))) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([firstName, first], [secondName, second]) => second - first || firstName.localeCompare(secondName))
      .map(([label, count]) => ({ label, count }));
  }

  private isMultiplayer(game: GameCardDTO): boolean {
    const metadata = (game.genres ?? []).map((genre) => `${genre.name} ${genre.slug}`).join(' ').toLowerCase();
    return ['multiplayer', 'massively-multiplayer', 'co-op', 'online', 'fighting', 'racing', 'sports']
      .some((keyword) => metadata.includes(keyword));
  }

  private handleError(error: { error?: unknown }): void {
    this.isLoading.set(false);
    this.errorMessage.set('Statistics could not be loaded right now.');
    this.alertService.showAlert(
      typeof error.error === 'string' ? error.error : 'Could not load favorite statistics.'
    );
  }
}
