import { Inject, Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GridComponentProps } from '../views/grid/grid.component';

export interface GameSearchParams {
  page?: number;
  pageSize?: number;
  name?: string;
  sortBy?: 'name' | 'released' | 'added' | 'created' | 'updated' | 'rating' | 'metacritic';
  ascending?: boolean;
  genres?: string;
  platforms?: string;
  releaseDate?: string;
  metacritic?: string;
}

export interface GameCardDTO {
  rawgGameId: number;
  name: string;
  backgroundImage: string | null;
  rating: number | null;
  releaseDate: string | null;
  tba: boolean;
  genres: { rawgGenreId: number; name: string; slug: string }[];
  platforms: { rawgPlatformId: number; name: string; slug: string }[];
}

export interface GameSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GameCardDTO[];
}

export interface GameDetailsDTO {
  rawgGameId: number;
  name: string;
  nameOriginal: string;
  slug: string;
  description: string;
  backgroundImage: string | null;
  releaseDate: string | null;
  tba: boolean;
  website: string;
  rating: number | null;
  metacritic: number | null;
  developer: string | null;
  publisher: string | null;
  genres: { rawgGenreId: number; name: string; slug: string }[];
  platforms: { rawgPlatformId: number; name: string; slug: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/games';

    getGames(params?: GameSearchParams): Observable<GameSearchResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<GameSearchResponse>(this.baseUrl, { params: httpParams });
  }

  getGameById(rawgGameId: number): Observable<GameDetailsDTO> {
    return this.http.get<GameDetailsDTO>(`${this.baseUrl}/${rawgGameId}`);
  }

  toGridProps(game: GameCardDTO): GridComponentProps {
    return {
      rawgGameId: game.rawgGameId,
      name: game.name,
      description: '',
      released: game.releaseDate ?? '',
      tba: game.tba ?? false,
      website: '',
      rating: game.rating ?? 0,
      metacritic: 0,
      coverImage: game.backgroundImage || 'https://via.placeholder.com/600x400?text=No+Image',
      developer: '',
      publisher: '',
      platforms: game.platforms?.map(p => p.rawgPlatformId) ?? [],
      tags: [],
      genres: game.genres?.map(g => g.name) ?? []
    };
  }
}


