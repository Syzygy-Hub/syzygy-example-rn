import { initDI, AppContainer, DI_KEYS } from '../di/AppModule';

describe('App smoke', () => {
  it('initDI completes without throwing', () => {
    expect(() => initDI()).not.toThrow();
  });

  it('AppModule authUseCase is non-null after initDI', () => {
    initDI();
    const uc = AppContainer.resolve(DI_KEYS.authUseCase);
    expect(uc).not.toBeNull();
  });
});
