import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GameCardDTO, GameSearchResponse } from '../../models-services/game.model';
import { WishlistFavoritesService } from '../../services/wishlist-favorites.service';
import { AlertService } from '../../services/alert.service';

interface StatisticItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface FavoritesPage {
  items: GameCardDTO[];
  totalCount: number;
}

@Component({
  selector: 'app-profile-statistics',
  standalone: true,
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
        <section class="stat-card">
          <div class="stat-card-heading">
            <div>
              <h2 class="stat-title">Favorite genres</h2>
              <p class="stat-subtitle">The genres represented in your favorites.</p>
            </div>
            <span class="stat-total">{{ favoriteCount() }} games</span>
          </div>
          <div class="chart-layout">
            <div class="donut-chart" [style.background]="genreChartBackground()">
              <span>{{ genreItems().length }}</span>
              <small>genres</small>
            </div>
            <div class="legend">
              @for (item of genreItems(); track item.label) {
                <div class="legend-row">
                  <span class="legend-label">
                    <i class="legend-dot" [style.background]="item.color"></i>{{ item.label }}
                  </span>
                  <strong>{{ item.count }}</strong>
                </div>
              }
            </div>
          </div>
        </section>

        <section class="stat-card">
          <div class="stat-card-heading">
            <div>
              <h2 class="stat-title">Playing style</h2>
              <p class="stat-subtitle">Singleplayer or multiplayer favorites.</p>
            </div>
          </div>
          <div class="chart-layout">
            <div class="donut-chart" [style.background]="modeChartBackground()">
              <span>{{ favoriteCount() }}</span>
              <small>games</small>
            </div>
            <div class="legend">
              @for (item of modeItems(); track item.label) {
                <div class="legend-row">
                  <span class="legend-label">
                    <i class="legend-dot" [style.background]="item.color"></i>{{ item.label }}
                  </span>
                  <strong>{{ item.count }}</strong>
                </div>
              }
            </div>
          </div>
          <p class="metadata-note">Based on the multiplayer metadata available for each game.</p>
        </section>

        <section class="stat-card stat-card-wide">
          <div class="stat-card-heading">
            <div>
              <h2 class="stat-title">Favorite platforms</h2>
              <p class="stat-subtitle">The platforms represented in your favorites.</p>
            </div>
          </div>
          <div class="bar-list">
            @for (item of platformItems(); track item.label) {
              <div class="bar-row">
                <div class="bar-label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.count }}</strong>
                </div>
                <div class="bar-track">
                  <span class="bar-fill" [style.width.%]="item.percentage"
                    [style.background]="item.color"></span>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: `
    :host { display: block; width: 100%; position: relative; }
    .statistics-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .stat-card {
      min-width: 0;
      padding: 1.25rem;
      border: 1px solid var(--tb-glass-border);
      border-radius: 16px;
      background: var(--tb-glass-inner-bg, var(--tb-glass-bg));
      box-shadow: 0 4px 14px var(--tb-glass-shadow);
    }
    .stat-card-wide { grid-column: 1 / -1; }
    .stat-card-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem; }
    .stat-title { margin: 0; color: var(--tb-text); font-size: 1.05rem; font-weight: 700; }
    .stat-subtitle { margin: .25rem 0 0; color: var(--tb-text-muted); font-size: .82rem; }
    .stat-total { color: var(--tb-accent); font-size: .8rem; font-weight: 700; white-space: nowrap; }
    .chart-layout { display: flex; align-items: center; gap: 1.25rem; min-width: 0; }
    .donut-chart {
      width: 132px;
      height: 132px;
      flex: 0 0 132px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: relative;
      color: var(--tb-text);
      font-size: 1.35rem;
      font-weight: 800;
    }
    .donut-chart::after {
      content: '';
      position: absolute;
      inset: 14px;
      border-radius: 50%;
      background: var(--tb-glass-inner-bg, var(--tb-glass-bg));
    }
    .donut-chart span, .donut-chart small { z-index: 1; }
    .donut-chart small { color: var(--tb-text-muted); font-size: .7rem; font-weight: 600; }
    .legend { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: .55rem; }
    .legend-row, .legend-label, .bar-label { display: flex; align-items: center; }
    .legend-row { justify-content: space-between; gap: .75rem; color: var(--tb-text); font-size: .85rem; }
    .legend-label { min-width: 0; gap: .45rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .legend-dot { width: 10px; height: 10px; flex: 0 0 10px; border-radius: 50%; }
    .metadata-note { margin: 1rem 0 0; color: var(--tb-text-muted); font-size: .7rem; }
    .bar-list { display: flex; flex-direction: column; gap: .85rem; }
    .bar-label { justify-content: space-between; margin-bottom: .3rem; color: var(--tb-text); font-size: .85rem; }
    .bar-track { height: 9px; overflow: hidden; border-radius: 999px; background: var(--tb-accent-subtle); }
    .bar-fill { display: block; height: 100%; min-width: 4px; border-radius: inherit; }
    .statistics-state { padding: 2rem 1rem; text-align: center; }
    @media (max-width: 767.98px) {
      .statistics-grid { grid-template-columns: 1fr; }
      .stat-card-wide { grid-column: auto; }
    }
    @media (min-width: 2000px) {
      .stat-card { padding: 1.5rem; }
      .stat-title { font-size: 1.3rem; }
      .stat-subtitle, .legend-row, .bar-label { font-size: 1.05rem; }
    }
  `,
})
export class ProfileStatisticsComponent {
  private readonly favoritesService = inject(WishlistFavoritesService);
  private readonly alertService = inject(AlertService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly favoriteCount = signal(0);
  readonly genreItems = signal<StatisticItem[]>([]);
  readonly modeItems = signal<StatisticItem[]>([]);
  readonly platformItems = signal<StatisticItem[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    this.favoritesService.getFavorites(1, 50).subscribe({
      next: (firstPage) => this.loadRemainingPages(firstPage),
      error: (error) => this.handleError(error),
    });
  }

  genreChartBackground(): string {
    return this.toChartBackground(this.genreItems());
  }

  modeChartBackground(): string {
    return this.toChartBackground(this.modeItems());
  }

  private loadRemainingPages(firstPage: GameSearchResponse): void {
    const normalizedFirstPage = this.normalizePage(firstPage);
    const totalPages = Math.ceil(normalizedFirstPage.totalCount / 50);
    if (totalPages <= 1) {
      this.buildStatistics(normalizedFirstPage.items);
      return;
    }

    forkJoin(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        this.favoritesService.getFavorites(index + 2, 50)
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
    const response = page as GameSearchResponse & {
      items?: GameCardDTO[];
      totalCount?: number;
    };

    return {
      items: response.items ?? response.results ?? [],
      totalCount: response.totalCount ?? response.count ?? 0,
    };
  }

  private buildStatistics(games: GameCardDTO[]): void {
    this.favoriteCount.set(games.length);
    this.genreItems.set(this.createItems(this.countValues(games.flatMap((game) =>
      game.genres.map((genre) => genre.name)
    )), ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fb7185']));

    const multiplayer = games.filter((game) => this.isMultiplayer(game)).length;
    this.modeItems.set([
      this.createItem('Singleplayer', games.length - multiplayer, '#a78bfa', games.length),
      this.createItem('Multiplayer', multiplayer, '#2ed9e7', games.length),
    ]);

    this.platformItems.set(this.createItems(this.countValues(games.flatMap((game) =>
      game.platforms.map((platform) => platform.name)
    )), ['#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa']));
    this.isLoading.set(false);
  }

  private countValues(values: string[]): Map<string, number> {
    return values.reduce((counts, value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
  }

  private createItems(counts: Map<string, number>, colors: string[]): StatisticItem[] {
    const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
    return [...counts.entries()]
      .sort(([, first], [, second]) => second - first)
      .slice(0, 8)
      .map(([label, count], index) => this.createItem(
        label,
        count,
        colors[index % colors.length],
        total
      ));
  }

  private createItem(label: string, count: number, color: string, total: number): StatisticItem {
    return { label, count, percentage: total ? (count / total) * 100 : 0, color };
  }

  private isMultiplayer(game: GameCardDTO): boolean {
    const metadata = game.genres.map((genre) => `${genre.name} ${genre.slug}`).join(' ').toLowerCase();
    return ['multiplayer', 'massively-multiplayer', 'co-op', 'online', 'fighting', 'racing', 'sports']
      .some((keyword) => metadata.includes(keyword));
  }

  private toChartBackground(items: StatisticItem[]): string {
    if (!items.length) return 'var(--tb-accent-subtle)';
    let start = 0;
    const segments = items.map((item) => {
      const end = start + item.percentage;
      const segment = `${item.color} ${start}% ${end}%`;
      start = end;
      return segment;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }

  private handleError(error: { error?: unknown }): void {
    this.isLoading.set(false);
    this.errorMessage.set('Statistics could not be loaded right now.');
    this.alertService.showAlert(
      typeof error.error === 'string' ? error.error : 'Could not load favorite statistics.'
    );
  }
}
