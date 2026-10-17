import { InMemoryStorageProvider } from 'syzygy-services-rn';

import { AuthUseCase } from '../../domain/AuthUseCase';
import { DEMO_CREDENTIALS, DemoAuthRepository } from '../DemoAuthRepository';

function createUseCase(): AuthUseCase {
  const storage = new InMemoryStorageProvider();
  return new AuthUseCase(new DemoAuthRepository(storage), storage);
}

describe('DemoAuthRepository', () => {
  it('signs the demo user in with the demo credentials', async () => {
    const useCase = createUseCase();

    const session = await useCase.login({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });

    expect(session.user.email).toBe(DEMO_CREDENTIALS.email);
    expect(await useCase.isAuthenticated()).toBe(true);
  });

  it('rejects a wrong password and stays signed out', async () => {
    const useCase = createUseCase();

    await expect(
      useCase.login({
        email: DEMO_CREDENTIALS.email,
        password: 'not-the-password',
      }),
    ).rejects.toThrow('Invalid email or password.');

    expect(await useCase.isAuthenticated()).toBe(false);
  });

  it('logout clears the demo session', async () => {
    const useCase = createUseCase();
    await useCase.login({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    });

    await useCase.logout();

    expect(await useCase.isAuthenticated()).toBe(false);
    expect(await useCase.getCurrentUser()).toBeNull();
  });
});
