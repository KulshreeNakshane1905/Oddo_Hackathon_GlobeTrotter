// ============================================================================
// Type Definitions — User
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  profilePic?: string | null;
  languagePref: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface LoginResponse {
  user: User;
  session: AuthSession;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
