import {
  SyzygyErrorCode,
  SyzygyErrorSeverity,
  createStorageKey,
} from 'syzygy-foundation-rn';
import type { StorageProvider } from 'syzygy-foundation-rn';
import { NetworkError } from 'syzygy-services-rn';

import {
  isValidEmail,
  isBlank,
} from '../../../core/extensions/stringExtensions';

import {
  AuthRepositoryProtocol,
  AuthSession,
  AuthUseCaseProtocol,
  LoginCredentials,
  RegisterCredentials,
  User,
} from './AuthUseCaseProtocol';

const MIN_PASSWORD_LENGTH = 8;

const REFRESH_TOKEN_KEY = createStorageKey<string>('syzygy.auth.refreshToken');

/**
 * Business-logic implementation of `AuthUseCaseProtocol`. Owns validation
 * rules and orchestrates the repository; the repository owns wire format
 * and persistence details.
 */
export class AuthUseCase implements AuthUseCaseProtocol {
  constructor(
    private readonly authRepository: AuthRepositoryProtocol,
    private readonly storage: StorageProvider,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    this.validateLoginCredentials(credentials);
    return this.authRepository.login(credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    this.validateRegisterCredentials(credentials);
    return this.authRepository.register(credentials);
  }

  async logout(): Promise<void> {
    await this.authRepository.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      if (
        error instanceof NetworkError &&
        error.code === SyzygyErrorCode.unauthenticated
      ) {
        return null;
      }
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.storage.get(REFRESH_TOKEN_KEY);
    return token !== undefined && token !== null && token.length > 0;
  }

  async refreshSession(): Promise<AuthSession | null> {
    const refreshToken = await this.storage.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return null;
    }
    return this.authRepository.refreshSession(refreshToken);
  }

  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (isBlank(credentials.email) || !isValidEmail(credentials.email)) {
      throw new NetworkError(
        'Please enter a valid email address.',
        SyzygyErrorCode.unknown,
        SyzygyErrorSeverity.Error,
      );
    }
    if (isBlank(credentials.password)) {
      throw new NetworkError(
        'Please enter your password.',
        SyzygyErrorCode.unknown,
        SyzygyErrorSeverity.Error,
      );
    }
  }

  private validateRegisterCredentials(credentials: RegisterCredentials): void {
    if (isBlank(credentials.email) || !isValidEmail(credentials.email)) {
      throw new NetworkError(
        'Please enter a valid email address.',
        SyzygyErrorCode.unknown,
        SyzygyErrorSeverity.Error,
      );
    }
    if (isBlank(credentials.displayName)) {
      throw new NetworkError(
        'Please enter your name.',
        SyzygyErrorCode.unknown,
        SyzygyErrorSeverity.Error,
      );
    }
    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      throw new NetworkError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        SyzygyErrorCode.unknown,
        SyzygyErrorSeverity.Error,
      );
    }
  }
}
