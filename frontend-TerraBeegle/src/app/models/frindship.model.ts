export type FriendshipStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface UserPublicResponseDTO {
  id: number;
  username: string;
  imageProfile?: string | null;
}

export interface FriendshipResponseDTO {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendshipStatus;
  updatedAt: string;
  user: UserPublicResponseDTO;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  previousPageUrl?: string | null;
  nextPageUrl?: string | null;
}

export interface FriendshipCreateDTO {
  senderId: number;
  receiverId: number;
}

export interface FriendshipUpdateDTO {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendshipStatus;
}