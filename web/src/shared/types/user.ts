// User and authentication types shared between CRA and Next.js

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  token?: string; // Optional since we're using cookies now
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
  handleAuthError: (error: unknown) => Promise<void>;
  token?: string;
}