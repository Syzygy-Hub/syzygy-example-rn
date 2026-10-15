/**
 * Syzygy DI Container wiring for SyzygyBase.
 *
 * Registers all 5 layer dependencies (Foundation, Core, Services, AI, UI)
 * into a single root Container from syzygy-core-rn.
 *
 * Usage:
 *   Call `initDI()` once at app startup (before rendering), then resolve
 *   dependencies via `AppContainer.resolve('key')`.
 *
 * Testing:
 *   Call `AppContainer.resetRegistrations()` in afterEach, then re-register
 *   test doubles before each test.
 */

import { Container, Lifetime } from 'syzygy-core-rn';
import {
  Logger,
  ConsoleLogDestination,
  LogLevel,
  EventBus,
  StateStore,
  Router,
  DefaultScheduler,
  InMemoryFeatureFlagProvider,
  ConfigRegistry,
  AppLifecycleTracker,
} from 'syzygy-core-rn';
import {
  FetchNetworkClient,
  JWTAuthProvider,
  InMemoryStorageProvider,
} from 'syzygy-services-rn';

import { AuthRepository } from '../features/auth/data/AuthRepository';
import { AuthUseCase } from '../features/auth/domain/AuthUseCase';
import type { AuthUseCaseProtocol } from '../features/auth/domain/AuthUseCaseProtocol';

// ---------------------------------------------------------------------------
// Root application container
// ---------------------------------------------------------------------------

export const AppContainer = new Container();

// ---------------------------------------------------------------------------
// Registration keys
// ---------------------------------------------------------------------------

export const DI_KEYS = {
  logger: 'logger',
  networkClient: 'networkClient',
  storageProvider: 'storageProvider',
  authProvider: 'authProvider',
  stateStore: 'stateStore',
  eventBus: 'eventBus',
  router: 'router',
  scheduler: 'scheduler',
  featureFlagProvider: 'featureFlagProvider',
  configRegistry: 'configRegistry',
  appLifecycleTracker: 'appLifecycleTracker',
  // Feature-level
  authRepository: 'authRepository',
  authUseCase: 'authUseCase',
} as const;

// ---------------------------------------------------------------------------
// initDI — call once at app startup
// ---------------------------------------------------------------------------

export function initDI(): void {
  // --- Core: Logger ---
  AppContainer.register(DI_KEYS.logger, Lifetime.Singleton, () => {
    const logger = new Logger();
    logger.addDestination(new ConsoleLogDestination(), LogLevel.Debug);
    return logger;
  });

  // --- Core: EventBus ---
  AppContainer.register(
    DI_KEYS.eventBus,
    Lifetime.Singleton,
    () => new EventBus(),
  );

  // --- Core: DefaultScheduler ---
  AppContainer.register(
    DI_KEYS.scheduler,
    Lifetime.Singleton,
    () => new DefaultScheduler(),
  );

  // --- Core: InMemoryFeatureFlagProvider ---
  AppContainer.register(
    DI_KEYS.featureFlagProvider,
    Lifetime.Singleton,
    () => new InMemoryFeatureFlagProvider(),
  );

  // --- Core: ConfigRegistry ---
  AppContainer.register(
    DI_KEYS.configRegistry,
    Lifetime.Singleton,
    () => new ConfigRegistry(),
  );

  // --- Core: AppLifecycleTracker ---
  AppContainer.register(
    DI_KEYS.appLifecycleTracker,
    Lifetime.Singleton,
    () => new AppLifecycleTracker(),
  );

  // --- Core: Router ---
  AppContainer.register(DI_KEYS.router, Lifetime.Singleton, () => new Router());

  // --- Services: StorageProvider (InMemoryStorageProvider) ---
  // Replace with AsyncStorage-backed provider for production persistence.
  AppContainer.register(
    DI_KEYS.storageProvider,
    Lifetime.Singleton,
    () => new InMemoryStorageProvider(),
  );

  // --- Services: NetworkClient (FetchNetworkClient) ---
  AppContainer.register(DI_KEYS.networkClient, Lifetime.Singleton, c => {
    const logger = c.resolve<Logger>(DI_KEYS.logger);
    return new FetchNetworkClient({ logger });
  });

  // --- Services: AuthProvider (JWTAuthProvider) ---
  AppContainer.register(DI_KEYS.authProvider, Lifetime.Singleton, c => {
    const storage = c.resolve<InMemoryStorageProvider>(DI_KEYS.storageProvider);
    const network = c.resolve<FetchNetworkClient>(DI_KEYS.networkClient);
    return new JWTAuthProvider({
      storage,
      network,
      refreshUrl: 'https://api.syzygyhub.base/v1/auth/refresh',
    });
  });

  // ── StateStore ──────────────────────────────────────────────────────────────
  // StateStore<S, A> is generic. The base template registers a no-op store.
  // Replace with your real app state once you define AppState and AppAction:
  //
  // interface AppState { isLoggedIn: boolean; user: User | null; }
  // type AppAction = { type: 'LOGIN'; user: User } | { type: 'LOGOUT' };
  // const appReducer = (state: AppState, action: AppAction): AppState => {
  //   switch (action.type) {
  //     case 'LOGIN':  return { ...state, isLoggedIn: true, user: action.user };
  //     case 'LOGOUT': return { ...state, isLoggedIn: false, user: null };
  //     default:       return state;
  //   }
  // };
  // AppContainer.register('stateStore', Lifetime.Singleton, () =>
  //   new StateStore({ isLoggedIn: false, user: null }, appReducer));
  //
  // See syzygy-core-rn src/state/StateStore.ts for the full API.
  AppContainer.register(
    DI_KEYS.stateStore,
    Lifetime.Singleton,
    () =>
      new StateStore<Record<string, unknown>, { type: string }>(
        {},
        (state, _action) => state,
      ),
  );

  // ── AI Layer registrations (add after syzygy-ai-rn is available on npm) ──────
  // import { LLMProvider, DefaultAgent, EmbeddingProvider, RAGProvider, MemoryManager, NamespacedMemoryManager } from 'syzygy-ai-rn';
  //
  // AppContainer.register('llmProvider', Lifetime.Singleton, () => new DefaultLLMProvider());
  // AppContainer.register('agent', Lifetime.Singleton, (c) => new DefaultAgent({ llm: c.resolve('llmProvider') }));
  // AppContainer.register('embeddingProvider', Lifetime.Singleton, () => new DefaultEmbeddingProvider());
  // AppContainer.register('ragProvider', Lifetime.Singleton, (c) => new DefaultRAGProvider({ embeddings: c.resolve('embeddingProvider') }));
  // AppContainer.register('memoryManager', Lifetime.Singleton, () => new DefaultMemoryManager());
  // AppContainer.register('namespacedMemoryManager', Lifetime.Singleton, (c) => new NamespacedMemoryManager({ base: c.resolve('memoryManager') }));

  // --- Feature: AuthRepository (real implementation backed by FetchNetworkClient) ---
  AppContainer.register(DI_KEYS.authRepository, Lifetime.Singleton, c => {
    const network = c.resolve<FetchNetworkClient>(DI_KEYS.networkClient);
    const storage = c.resolve<InMemoryStorageProvider>(DI_KEYS.storageProvider);
    return new AuthRepository(network, storage);
  });

  // --- Feature: AuthUseCase ---
  AppContainer.register(DI_KEYS.authUseCase, Lifetime.Singleton, c => {
    const repo = c.resolve<AuthRepository>(DI_KEYS.authRepository);
    const storage = c.resolve<InMemoryStorageProvider>(DI_KEYS.storageProvider);
    return new AuthUseCase(repo, storage);
  });
}

// ---------------------------------------------------------------------------
// Convenience accessor (mirrors the old AppModule API)
// ---------------------------------------------------------------------------

/**
 * Convenience object that resolves the most-used dependencies by name.
 * Prefer calling AppContainer.resolve() directly for new code.
 */
export const AppModule = {
  get authUseCase(): AuthUseCaseProtocol {
    return AppContainer.resolve<AuthUseCaseProtocol>(DI_KEYS.authUseCase);
  },
  get logger(): Logger {
    return AppContainer.resolve<Logger>(DI_KEYS.logger);
  },
  get networkClient(): FetchNetworkClient {
    return AppContainer.resolve<FetchNetworkClient>(DI_KEYS.networkClient);
  },
  get storageProvider(): InMemoryStorageProvider {
    return AppContainer.resolve<InMemoryStorageProvider>(
      DI_KEYS.storageProvider,
    );
  },
};
