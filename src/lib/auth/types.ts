/** Auth context and user shape used by `AuthProvider` and related UI. */

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  token?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

/** Result of an email-based sign-in or sign-up attempt. */
export interface EmailAuthResult {
  error: string | null;
  /** True when sign-up succeeded but the user must confirm their email before a session is issued. */
  needsEmailConfirmation?: boolean;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (credentials: LoginCredentials) => Promise<EmailAuthResult>;
  signUpWithEmail: (credentials: SignUpCredentials) => Promise<EmailAuthResult>;
  logout: (redirectTo?: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
  handleAuthError: (error: unknown) => Promise<void>;
  token?: string;
}
