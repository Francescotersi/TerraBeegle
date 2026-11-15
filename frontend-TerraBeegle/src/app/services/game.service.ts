import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
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
  private readonly baseUrl = '/api/games';

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
    return this.http.get<GameDetailsDTO>(`${this.baseUrl}/${apiGameId}`);
  }

  toGridProps(game: GameCardDTO): GridComponentProps {
    return {
      rawgGameId: game.apiGameId,
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


