export type GameCollectionType = 'wishlist' | 'favorites';

export interface GameGenreItem {
  id: number;
  name: string;
  slug: string;
}

export interface GamePlatformItem {
  apiPlatformId: number;
  name: string;
  slug: string;
  abbreviation?: string;
  logo?: string | null;
}

export interface GameCardDTO {
  apiGameId: number;
  name: string;
  slug: string;
  cover: string | null;
  rating: number | null;
  criticRating: number | null;
  gameType: string | null;
  gameStatus: string | null;
  releaseDate: string | null;
  genres: GameGenreItem[] | null;
  platforms: GamePlatformItem[] | null;
  themes: GameGenreItem[] | null;
  trailer?: string | null; // YouTube video id, played on the card hover
}

export interface GameSearchResponse {
  items: GameCardDTO[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  previousPageUrl: string | null;
  nextPageUrl: string | null;
}

export interface GameSearchParams {
  page?: number;
  pageSize?: number;
  name?: string;
  sortBy?: 'name' | 'released' | 'rating' | 'critic_rating';
  ascending?: boolean;
  genres?: number[];
  themes?: number[];
  platforms?: number[];
  platformsFamily?: number[];
  releaseYearMin?: number;
  releaseYearMax?: number;
  ratingMin?: number;
  ratingMax?: number;
  criticRatingMin?: number;
  criticRatingMax?: number;
  minRatingCount?: number;
  minCriticRatingCount?: number;
}

export interface GameCompanyItem {
  apiCompanyId: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface GameReleaseDateItem {
  date: string | null;
  human: string | null;
  status: string | null;
  platformName: string | null;
}

export interface GameVideoItem {
  name: string;
  videoUrl: string;
}

export interface GameWebsiteItem {
  type: number;
  url: string;
}

export interface GameLanguageItem {
  language: string | null;
  languageSupportType: string | null;
}

// Same fields as GameDetailsDTO in the backend (GET /api/games/{id}); IGDB leaves out the ones it does not have
export interface GameDetailsDTO {
  apiGameId: number;
  name: string;
  slug: string;
  summary: string | null;
  storyline: string | null;
  cover: string | null;
  artworks: string[] | null;
  screenshots: string[] | null;
  releaseDate: string | null;
  releaseDates: GameReleaseDateItem[] | null;
  rating: number | null;
  ratingCount: number | null;
  criticRating: number | null;
  criticRatingCount: number | null;
  pegiRating: string | null;
  pegiRatingDescription: string[] | null;
  gameType: string | null;
  gameStatus: string | null;
  genres: GameGenreItem[] | null;
  themes: GameGenreItem[] | null;
  gameModes: GameGenreItem[] | null;
  perspectives: GameGenreItem[] | null;
  keywords: GameGenreItem[] | null;
  franchises: GameGenreItem[] | null;
  platforms: GamePlatformItem[] | null;
  developers: GameCompanyItem[] | null;
  publishers: GameCompanyItem[] | null;
  videos: GameVideoItem[] | null;
  officialWebsite: string | null;
  websites: GameWebsiteItem[] | null;
  stores: GameWebsiteItem[] | null;
  languageSupports: GameLanguageItem[] | null;
  similarGames: GameCardDTO[] | null;
  dlcs: GameCardDTO[] | null;
  expansions: GameCardDTO[] | null;
}
