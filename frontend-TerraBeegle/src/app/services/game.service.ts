import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GridComponentProps } from '../views/grid/grid.component';
import {
  GameSearchParams,
  GameCardDTO,
  GameSearchResponse,
  GameDetailsDTO,
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


