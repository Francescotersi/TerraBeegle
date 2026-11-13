import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, ParamMap, Params, Router } from '@angular/router';
import { filter } from 'rxjs';
import { GameSearchParams } from '../models-services/game.model';

export type CatalogSortBy = 'rating' | 'released' | 'name' | 'critic_rating';

// Everything the catalog can be filtered by; it lives in the URL (/?genres=12&platforms=6&sort=released...)
export interface CatalogFilters {
  search: string;
  genres: number[];
  themes: number[];
  platforms: number[];
  yearMin: number | null;
  yearMax: number | null;
  ratingMin: number | null; // user rating out of 10 (IGDB uses 0-100)
  ratingMax: number | null;
  criticMax: number | null;
  criticMin: number | null; // critic score 0-100
  sortBy: CatalogSortBy;
  ascending: boolean;
}

const DEFAULT_SORT: CatalogSortBy = 'rating';
const SORT_OPTIONS: CatalogSortBy[] = ['rating', 'released', 'name', 'critic_rating'];
export const MIN_YEAR = 1950;
export const MAX_YEAR = new Date().getFullYear() + 2;

// Reads and writes the catalog filters in the URL; used by the sidebar (writes) and the catalog page (reads)
@Injectable({ providedIn: 'root' })
export class CatalogFiltersService {
  private readonly router = inject(Router);

  // Filters of the current URL, updated after every navigation
  readonly filters = signal<CatalogFilters>(this.parse(this.router.routerState.snapshot.root.queryParamMap));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.filters.set(this.parse(this.router.routerState.snapshot.root.queryParamMap));
    });
  }

  // URL query params -> filters (invalid values are ignored)
  parse(params: ParamMap): CatalogFilters {
    const ids = (key: string) =>
      params.getAll(key).map(Number).filter((id) => Number.isInteger(id) && id > 0);
    const year = (key: string) => {
      const value = Number(params.get(key));
      return Number.isInteger(value) && value >= MIN_YEAR && value <= MAX_YEAR ? value : null;
    };
    const range = (key: string, max: number) => {
      const value = Number(params.get(key));
      return params.has(key) && Number.isFinite(value) && value >= 0 && value <= max ? value : null;
    };
    const rating = [range('rating', 10) ?? 0, range('ratingMax', 10) ?? 10].sort((a, b) => a - b);
    const critic = [range('critic', 100) ?? 0, range('criticMax', 100) ?? 100].sort((a, b) => a - b);
    const sort = params.get('sort') as CatalogSortBy | null;

    return {
      search: params.get('search')?.trim() ?? '',
      genres: ids('genres'),
      themes: ids('themes'),
      platforms: ids('platforms'),
      yearMin: year('yearMin'),
      yearMax: year('yearMax'),
      ratingMin: rating[0] || null,
      ratingMax: rating[1] < 10 ? rating[1] : null,
      criticMin: critic[0] || null,
      criticMax: critic[1] < 100 ? critic[1] : null,
      sortBy: sort && SORT_OPTIONS.includes(sort) ? sort : DEFAULT_SORT,
      ascending: params.get('asc') === 'true',
    };
  }

  // True when something narrows the results (the search text and the sorting do not count)
  hasFilters(filters: CatalogFilters): boolean {
    return (
      filters.genres.length > 0 ||
      filters.themes.length > 0 ||
      filters.platforms.length > 0 ||
      filters.yearMin !== null ||
      filters.yearMax !== null ||
      filters.ratingMin !== null ||
      filters.ratingMax !== null ||
      filters.criticMax !== null ||
      filters.criticMin !== null
    );
  }

  // Filters -> parameters for GET /api/games
  toSearchParams(filters: CatalogFilters, page: number, pageSize: number): GameSearchParams {
    // The years can be typed in the wrong order (2024 -> 2020)
    const [yearMin, yearMax] =
      filters.yearMin !== null && filters.yearMax !== null && filters.yearMin > filters.yearMax
        ? [filters.yearMax, filters.yearMin]
        : [filters.yearMin, filters.yearMax];

    return {
      page,
      pageSize,
      name: filters.search || undefined,
      genres: filters.genres.length ? filters.genres : undefined,
      themes: filters.themes.length ? filters.themes : undefined,
      platforms: filters.platforms.length ? filters.platforms : undefined,
      releaseYearMin: yearMin ?? undefined,
      releaseYearMax: yearMax ?? undefined,
      // Out of 10, like the backend expects (it converts to the IGDB 0-100 scale itself)
      ratingMin: filters.ratingMin ?? undefined,
      ratingMax: filters.ratingMax ?? undefined,
      criticRatingMin: filters.criticMin ?? undefined,
      criticRatingMax: filters.criticMax ?? undefined,
      sortBy: filters.sortBy,
      ascending: filters.ascending,
      // Without a minimum, "top rated" starts with unknown games rated 100 by 2 people.
      // Home: well-known games only; with filters a lower minimum, so small platforms still have results;
      // a search by name returns every match (0 = no minimum; the backend default would be 25)
      minRatingCount: filters.search ? 0 : this.hasFilters(filters) ? 10 : 300,
      // Critic reviews only matter when sorting / filtering by critics; otherwise games without them would disappear
      minCriticRatingCount:
        !filters.search && (filters.sortBy === 'critic_rating' || filters.criticMin !== null || filters.criticMax !== null)
          ? 5
          : 0,
    };
  }

  // Changes some filters and opens the catalog with them (the other filters stay)
  update(changes: Partial<CatalogFilters>): void {
    const next = { ...this.filters(), ...changes };
    this.router.navigate(['/'], { queryParams: this.toQueryParams(next) });
  }

  // Adds the id if it is not selected, removes it otherwise
  toggle(key: 'genres' | 'platforms' | 'themes', id: number): void {
    const current = this.filters()[key];
    this.update({ [key]: current.includes(id) ? current.filter((value) => value !== id) : [...current, id] });
  }

  // Removes every filter, keeps the search text and the sorting
  clear(): void {
    this.update({ genres: [], themes: [], platforms: [], yearMin: null, yearMax: null, ratingMin: null, ratingMax: null, criticMin: null, criticMax: null });
  }

  // Default values are left out, so the URL stays short
  private toQueryParams(filters: CatalogFilters): Params {
    return {
      search: filters.search || null,
      genres: filters.genres.length ? filters.genres : null,
      themes: filters.themes.length ? filters.themes : null,
      platforms: filters.platforms.length ? filters.platforms : null,
      yearMin: filters.yearMin,
      yearMax: filters.yearMax,
      rating: filters.ratingMin,
      ratingMax: filters.ratingMax,
      critic: filters.criticMin,
      criticMax: filters.criticMax,
      sort: filters.sortBy === DEFAULT_SORT ? null : filters.sortBy,
      asc: filters.ascending ? true : null,
    };
  }
}
