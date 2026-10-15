import type { StorageProvider } from 'syzygy-foundation-rn';
import { createStorageKey } from 'syzygy-foundation-rn';
import { FetchNetworkClient } from 'syzygy-services-rn';

import {
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../domain/AuthUseCaseProtocol';

const ACCESS_TOKEN_KEY = createStorageKey<string>('syzygy.auth.accessToken');
const REFRESH_TOKEN_KEY = createStorageKey<string>('syzygy.auth.refreshToken');

interface AuthSessionResponseDto {
  user: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
}

interface RefreshResponseDto {
  access_token: string;
  refresh_token: string;
}

function toUser(dto: AuthSessionResponseDto['user']): User {
  return {
    id: dto.id,
    email: dto.email,
    displayName: dto.display_name,
    avatarUrl: dto.avatar_url,
    createdAt: dto.created_at,
  };
}

function toSession(dto: AuthSessionResponseDto): AuthSession {
  return {
    user: toUser(dto.user),
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
  };
}

/**
 * Data layer for authentication. Talks to the remote API and to the injected
 * StorageProvider; contains no business rules (those live in AuthUseCase).
 */
export class AuthRepository {
  /** Guard: prevents re-entrant refresh calls (401 on the refresh endpoint must not trigger another refresh). */
  private _isRefreshing = false;

  constructor(
    private readonly networkClient: FetchNetworkClient,
    private readonly storage: StorageProvider,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const body = new TextEncoder().encode(
      JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    );
    const { createNetworkRequest } = await import('syzygy-foundation-rn');
    const request = createNetworkRequest({
      url: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const response = await this.networkClient.execute(request);
    const dto = JSON.parse(
      new TextDecoder().decode(response.data),
    ) as AuthSessionResponseDto;
    const session = toSession(dto);
    await this.persistSession(session);
    return session;
  }

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const body = new TextEncoder().encode(
      JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        display_name: credentials.displayName,
      }),
    );
    const { createNetworkRequest } = await import('syzygy-foundation-rn');
    const request = createNetworkRequest({
      url: '/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const response = await this.networkClient.execute(request);
    const dto = JSON.parse(
      new TextDecoder().decode(response.data),
    ) as AuthSessionResponseDto;
    const session = toSession(dto);
    await this.persistSession(session);
    return session;
  }

  async logout(): Promise<void> {
    try {
      const { createNetworkRequest } = await import('syzygy-foundation-rn');
      const request = createNetworkRequest({
        url: '/auth/logout',
        method: 'POST',
        headers: {},
      });
      await this.networkClient.execute(request);
    } finally {
      await this.storage.remove(ACCESS_TOKEN_KEY);
      await this.storage.remove(REFRESH_TOKEN_KEY);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = await this.storage.get(ACCESS_TOKEN_KEY);
    if (!token) {
      return null;
    }
    const { createNetworkRequest } = await import('syzygy-foundation-rn');
    const request = createNetworkRequest({
      url: '/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await this.networkClient.execute(request);
    const dto = JSON.parse(
      new TextDecoder().decode(response.data),
    ) as AuthSessionResponseDto['user'];
    return toUser(dto);
  }

  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    // Prevent re-entrant refresh: a 401 on the refresh endpoint must fail
    // immediately rather than trigger another refresh cycle.
    if (this._isRefreshing) {
      return null;
    }
    this._isRefreshing = true;
    try {
      const body = new TextEncoder().encode(
        JSON.stringify({ refresh_token: refreshToken }),
      );
      const { createNetworkRequest } = await import('syzygy-foundation-rn');
      const request = createNetworkRequest({
        url: '/auth/refresh',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const response = await this.networkClient.execute(request);
      const dto = JSON.parse(
        new TextDecoder().decode(response.data),
      ) as RefreshResponseDto;
      await this.storage.set(dto.access_token, ACCESS_TOKEN_KEY);
      await this.storage.set(dto.refresh_token, REFRESH_TOKEN_KEY);
      const user = await this.getCurrentUser();
      if (!user) return null;
      return {
        user,
        accessToken: dto.access_token,
        refreshToken: dto.refresh_token,
      };
    } catch {
      return null;
    } finally {
      this._isRefreshing = false;
    }
  }

  private async persistSession(session: AuthSession): Promise<void> {
    await this.storage.set(session.accessToken, ACCESS_TOKEN_KEY);
    await this.storage.set(session.refreshToken, REFRESH_TOKEN_KEY);
  }
}
