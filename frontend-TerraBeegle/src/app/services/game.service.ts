import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { GridComponentProps } from '../views/grid/grid.component';
import {
  GameSearchParams,
  GameCardDTO,
  GameSearchResponse,
  GameDetailsDTO,
  GameGenreItem,
} from '../models-services/game.model';

export type {
  GameSearchParams,
  GameCardDTO,
  GameSearchResponse,
  GameDetailsDTO,
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = '/api/games';
  private readonly slugStorageKey = 'tb_game_slugs';
  private readonly slugToId = new Map<string, number>();

  // Downloaded once per visit: the lists for the filters almost never change
  private readonly themes$ = this.http.get<GameGenreItem[]>('/api/themes').pipe(shareReplay(1));

  getThemes(): Observable<GameGenreItem[]> {
    return this.themes$;
  }

  private readonly genres$ = this.http.get<GameGenreItem[]>('/api/genres').pipe(shareReplay(1));
  private readonly platforms$ = this.http.get<GameGenreItem[]>('/api/platforms').pipe(shareReplay(1));

  // All the genres for the advanced search (id, name, slug)
  getGenres(): Observable<GameGenreItem[]> {
    return this.genres$;
  }

  // All the platforms for the advanced search (id, name, slug)
  getPlatforms(): Observable<GameGenreItem[]> {
    return this.platforms$;
  }

  getGames(params?: GameSearchParams): Observable<GameSearchResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // ASP.NET binds int[] from repeated keys: genres=4&genres=5
          value.forEach((item) => (httpParams = httpParams.append(key, item.toString())));
        } else if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<GameSearchResponse>(this.baseUrl, { params: httpParams });
  }

  getGameById(apiGameId: number): Observable<GameDetailsDTO> {
    return this.http.get<GameDetailsDTO>(`${this.baseUrl}/${apiGameId}`).pipe(
      tap(game => this.rememberGameSlug(game.slug, game.apiGameId))
    );
  }

  getGameBySlug(slug: string): Observable<GameDetailsDTO> {
    const normalized = slug.trim();
    const cachedId = this.getGameIdBySlug(normalized);
    if (cachedId !== null) {
      return this.getGameById(cachedId);
    }

    const query = normalized.replace(/-/g, ' ');
    return this.getGames({ name: query, page: 1, pageSize: 20, minRatingCount: 0 }).pipe(
      switchMap(res => {
        const match =
          res.items.find(item => item.slug === normalized) ??
          res.items.find(item => item.slug.toLowerCase() === normalized.toLowerCase());

        if (!match) {
          return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
        }

        this.rememberGameSlug(match.slug, match.apiGameId);
        return this.getGameById(match.apiGameId);
      })
    );
  }

  rememberGameSlug(slug: string | undefined | null, apiGameId: number | undefined | null): void {
    const normalized = slug?.trim();
    if (!normalized || !apiGameId || apiGameId <= 0) {
      return;
    }

    this.slugToId.set(normalized, apiGameId);
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const stored = this.readSlugMap();
      if (stored[normalized] !== apiGameId) {
        stored[normalized] = apiGameId;
        localStorage.setItem(this.slugStorageKey, JSON.stringify(stored));
      }
    } catch {
      // Ignore storage errors (e.g. private mode or quota exceeded)
    }
  }

  private getGameIdBySlug(slug: string): number | null {
    if (!slug) {
      return null;
    }

    const inMemory = this.slugToId.get(slug);
    if (inMemory !== undefined) {
      return inMemory;
    }

    const stored = this.readSlugMap();
    const fromStorage = stored[slug];
    if (typeof fromStorage === 'number' && fromStorage > 0) {
      this.slugToId.set(slug, fromStorage);
      return fromStorage;
    }

    return null;
  }

  private readSlugMap(): Record<string, number> {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    try {
      const raw = localStorage.getItem(this.slugStorageKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  toGridProps(game: GameCardDTO): GridComponentProps {
    this.rememberGameSlug(game.slug, game.apiGameId);
    return {
      rawgGameId: game.apiGameId,
      slug: game.slug,
      name: game.name,
      description: '',
      released: game.releaseDate ?? '',
      tba: false,
      website: '',
      rating: game.rating != null ? Math.round(game.rating) / 10 : 0,
      metacritic: game.criticRating ?? 0,
      coverImage: game.cover || 'https://via.placeholder.com/600x400?text=No+Image',
      developer: '',
      publisher: '',
      platforms: game.platforms?.map(p => p.apiPlatformId) ?? [],
      tags: [],
      genres: game.genres?.map(g => g.name) ?? [],
      trailer: game.trailer ?? null,
    };
  }
}


