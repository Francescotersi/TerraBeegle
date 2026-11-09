export type Theme = 'light' | 'dark';

export interface User {
  id: number;
  name: string;
  familyName: string;
  username: string;
  email: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
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
  code?: string; // Optional 2FA code
}

export interface TwoFactorLoginPayload {
  challengeToken: string;
  code: string;
}

export interface TwoFactorResendPayload {
  challengeToken: string;
}

export interface AuthResponse {
  token?: string | null;
  user?: User | null;
  requires2FA?: boolean;
  challengeToken?: string | null;
}

export interface OtpContext {
  type: 'email-verification' | '2fa';
  challengeToken?: string;
  emailOrUsername?: string;
  email?: string;
  password?: string;
  message?: string;
}

export interface UpdateUserPayload{
  name?: string;
  familyName?: string;
  username?: string;
  imageProfile?: string | null;
  theme?: Theme;
}

export interface UpdateEmailPayload {
  email: string;
  password: string;
}

export interface ConfirmEmailPayload {
  code: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
