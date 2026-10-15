import type { StorageProvider } from 'syzygy-foundation-rn';
import { createStorageKey } from 'syzygy-foundation-rn';

import {
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../domain/AuthUseCaseProtocol';

const ACCESS_TOKEN_KEY = createStorageKey<string>('syzygy.auth.accessToken');
const REFRESH_TOKEN_KEY = createStorageKey<string>('syzygy.auth.refreshToken');

const MOCK_NETWORK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildMockUser(email: string, displayName?: string): User {
  return {
    id: 'mock-user-1',
    email,
    displayName: displayName ?? email.split('@')[0],
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };
}

function buildMockSession(user: User): AuthSession {
  return {
    user,
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
  };
}

/**
 * In-memory stand-in for `AuthRepository` used until a real backend is
 * wired up. Accepts any well-formed credentials (validated upstream by
 * `AuthUseCase`) and simulates network latency, so the rest of the app —
 * navigation, secure storage, error states — behaves exactly as it will
 * once this is swapped for the real network-backed repository.
 */
export class MockAuthRepository {
  private currentUser: User | null = null;

  constructor(private readonly storage: StorageProvider) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(MOCK_NETWORK_DELAY_MS);
    const user = buildMockUser(credentials.email);
    const session = buildMockSession(user);
    this.currentUser = user;
    await this.persistSession(session);
    return session;
  }

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    await delay(MOCK_NETWORK_DELAY_MS);
    const user = buildMockUser(credentials.email, credentials.displayName);
    const session = buildMockSession(user);
    this.currentUser = user;
    await this.persistSession(session);
    return session;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await this.storage.remove(ACCESS_TOKEN_KEY);
    await this.storage.remove(REFRESH_TOKEN_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = await this.storage.get(ACCESS_TOKEN_KEY);
    const isAuthenticated =
      token !== undefined && token !== null && token.length > 0;
    if (!isAuthenticated) {
      return null;
    }
    return this.currentUser ?? buildMockUser('user@example.com');
  }

  async refreshSession(_refreshToken: string): Promise<AuthSession | null> {
    if (!this.currentUser) {
      return null;
    }
    const session = buildMockSession(this.currentUser);
    await this.persistSession(session);
    return session;
  }

  private async persistSession(session: AuthSession): Promise<void> {
    await this.storage.set(session.accessToken, ACCESS_TOKEN_KEY);
    await this.storage.set(session.refreshToken, REFRESH_TOKEN_KEY);
  }
}
