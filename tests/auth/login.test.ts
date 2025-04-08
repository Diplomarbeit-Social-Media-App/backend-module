import { LOGIN_OS, loginSchema } from '../../src/types/auth';
import { loginSchema as loginValidation } from '../../src/schema/auth.schema';
import { shouldFail, shouldPass } from '../../src/utils/testUtils';
import { describe, test, expect } from 'vitest';

interface IBodyLoginSchema {
  body: loginSchema;
}

const dummyLoginData: loginSchema = {
  userName: 'TestDummy1',
  password: 'Passwort123!',
  loginOs: LOGIN_OS.IOS,
};

const buildDummyLogin = (val?: Partial<loginSchema>): IBodyLoginSchema => {
  return { body: { ...dummyLoginData, ...val } };
};

describe('Test check validation', () => {
  test('should fail without a username', async () => {
    const test = buildDummyLogin({ userName: undefined });
    const parsed = shouldFail(loginValidation, test);
    expect(parsed.error?.message).toContain('Username fehlt');
  });

  test('should fail without a password', async () => {
    const test = buildDummyLogin({ password: undefined });
    const parsed = shouldFail(loginValidation, test);
    expect(parsed.error?.message).toContain('Passwort fehlt');
  });

  test('should pass with dummy login data', async () => {
    const test = buildDummyLogin();
    shouldPass(loginValidation, test);
  });
});
