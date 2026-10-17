import type { StorageProvider } from 'syzygy-foundation-rn';
import {
  createStorageKey,
  SyzygyErrorCode,
  SyzygyErrorSeverity,
} from 'syzygy-foundation-rn';
import { NetworkError } from 'syzygy-services-rn';

import {
  AuthRepositoryProtocol,
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../domain/AuthUseCaseProtocol';

/**
 * Demo values only. These are not secrets and grant access to nothing but
 * this example app. Selected in `di/AppModule.ts` by `USE_DEMO_LOGIN`.
 */
export const DEMO_CREDENTIALS = {
  email: 'demo@syzygy.example',
  password: 'demo-password',
} as const;

const ACCESS_TOKEN_KEY = createStorageKey<string>('syzygy.auth.accessToken');
const REFRESH_TOKEN_KEY = createStorageKey<string>('syzygy.auth.refreshToken');

const DEMO_USER: User = {
  id: 'demo-user',
  email: DEMO_CREDENTIALS.email,
  displayName: 'Demo User',
  avatarUrl: null,
  createdAt: '2026-10-16T00:00:00.000Z',
};

/**
 * Offline login for an example app that is not connected to a backend.
 *
 * It accepts only `DEMO_CREDENTIALS`, makes no network calls, and stores the
 * demo session through the same storage keys `AuthUseCase` reads, so
 * `isAuthenticated()` and `logout()` behave as they would with the real
 * repository.
 */
export class DemoAuthRepository implements AuthRepositoryProtocol {
  constructor(private readonly storage: StorageProvider) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const matches =
      credentials.email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      credentials.password === DEMO_CREDENTIALS.password;
    if (!matches) {
      throw new NetworkError(
        'Invalid email or password.',
        SyzygyErrorCode.unauthenticated,
        SyzygyErrorSeverity.Error,
      );
    }
    const session: AuthSession = {
      user: DEMO_USER,
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    };
    await this.storage.set(session.accessToken, ACCESS_TOKEN_KEY);
    await this.storage.set(session.refreshToken, REFRESH_TOKEN_KEY);
    return session;
  }

  async register(_credentials: RegisterCredentials): Promise<AuthSession> {
    throw new NetworkError(
      'Registration is not available in demo mode.',
      SyzygyErrorCode.unknown,
      SyzygyErrorSeverity.Error,
    );
  }

  async logout(): Promise<void> {
    await this.storage.remove(ACCESS_TOKEN_KEY);
    await this.storage.remove(REFRESH_TOKEN_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = await this.storage.get(ACCESS_TOKEN_KEY);
    return token ? DEMO_USER : null;
  }

  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    const stored = await this.storage.get(REFRESH_TOKEN_KEY);
    if (!stored || stored !== refreshToken) {
      return null;
    }
    return this.login({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });
  }
}
