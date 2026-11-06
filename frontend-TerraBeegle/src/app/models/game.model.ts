export type GameCollectionType = 'wishlist' | 'favorites';

export interface GameGenreItem {
  rawgGenreId: number;
  name: string;
  slug: string;
}

export interface GamePlatformItem {
  rawgPlatformId: number;
  name: string;
  slug: string;
}

export interface GameCardDTO {
  rawgGameId: number;
  name: string;
  backgroundImage: string | null;
  rating: number | null;
  releaseDate: string | null;
  tba: boolean;
  genres: GameGenreItem[];
  platforms: GamePlatformItem[];
}

export interface GameSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GameCardDTO[];
}

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
  genres: GameGenreItem[];
  platforms: GamePlatformItem[];
}
