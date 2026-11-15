import { GameCardDTO } from './game.model';
import { UserPublicResponseDTO } from './user.model';

export interface ReviewCreateDTO {
  rating: number; // 1-10
  gameId: number;
  content?: string | null;
}

export interface ReviewUpdateDTO {
  id: number;
  rating: number; // 1-10
  content?: string | null;
}

export interface ReviewResponseDTO {
  id: number;
  rating: number; // 1-10
  content?: string | null;
  createdAt: string;
  user?: UserPublicResponseDTO | null;
  game?: GameCardDTO | null; // only in a user's review list
}
