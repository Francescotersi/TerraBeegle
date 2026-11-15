export interface GridComponentProps {
  rawgGameId: number;
  name: string;
  description: string;
  released: string;
  tba: boolean;
  website: string;
  rating: number;
  metacritic: number;
  coverImage: string;
  developer: string;
  publisher: string;
  platforms: number[];
  tags: string[];
  genres: string[];
  trailer?: string | null; // YouTube video id: on hover the card plays it instead of the cover
}
