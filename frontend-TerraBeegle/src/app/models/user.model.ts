export type Theme = 'light' | 'dark';

export interface User {
  id: number;
  name: string;
  familyName: string;
  username: string;
  email: string;
  imageProfile?: string | null;
  theme?: Theme;
}

export interface UserPublicResponseDTO {
  id: number;
  username: string;
  imageProfile?: string | null;
}

export interface RegisterPayload {
  name: string;
  familyName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
