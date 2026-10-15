import { initDI, AppContainer, DI_KEYS } from '../../di/AppModule';

describe('DI Graph', () => {
  beforeEach(() => {
    initDI();
  });

  afterEach(() => {
    AppContainer.resetRegistrations?.();
  });

  it('resolves logger without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.logger)).not.toThrow();
  });

  it('resolves eventBus without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.eventBus)).not.toThrow();
  });

  it('resolves scheduler without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.scheduler)).not.toThrow();
  });

  it('resolves featureFlagProvider without throwing', () => {
    expect(() =>
      AppContainer.resolve(DI_KEYS.featureFlagProvider),
    ).not.toThrow();
  });

  it('resolves configRegistry without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.configRegistry)).not.toThrow();
  });

  it('resolves appLifecycleTracker without throwing', () => {
    expect(() =>
      AppContainer.resolve(DI_KEYS.appLifecycleTracker),
    ).not.toThrow();
  });

  it('resolves router without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.router)).not.toThrow();
  });

  it('resolves storageProvider without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.storageProvider)).not.toThrow();
  });

  it('resolves networkClient without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.networkClient)).not.toThrow();
  });

  it('resolves authProvider without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.authProvider)).not.toThrow();
  });

  it('resolves authRepository without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.authRepository)).not.toThrow();
  });

  it('resolves authUseCase without throwing', () => {
    expect(() => AppContainer.resolve(DI_KEYS.authUseCase)).not.toThrow();
  });
});
