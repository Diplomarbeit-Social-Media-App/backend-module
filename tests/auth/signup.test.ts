import service from '../../src/services/index';
import assert from 'assert';
import { signUpSchema } from '../../src/schema/auth';
import type { signUpSchema as signUp } from '../../src/types/auth';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { shouldPass, shouldFail } from '../../src/utils/testUtils';
import { describe, test } from 'vitest';

interface ISignUpSchema {
  body: signUp;
}

const baseSignUp: signUp = {
  dateOfBirth: dayjs(faker.date.birthdate()).subtract(14, 'year').toDate(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  isUserSignUp: true,
  userName: 'UserTest1',
  password: faker.internet.password({ length: 10, prefix: 'a!D:_3' }),
};

const buildSignUp = (values?: Partial<signUp>): ISignUpSchema => {
  return { body: { ...baseSignUp, ...values } };
};

test('if hashing and comparing password functions work properly', async () => {
  const password: string = 'MySecretpassword123<!';
  const SALT: number = 10;

  const hashedPwd = await service.auth.hashPassword(password, SALT);
  assert.notEqual(password, hashedPwd);
  assert.ok(await service.auth.comparePassword(password, hashedPwd));
});

describe('Checking of signup validation', () => {
  test('if validation fails on invalid email', async () => {
    const mailWithoutTopLevelDomain = 'internal.support@bonfire';
    const mailWithoutDomain = 'internal.support.de';
    const mailWithoutAt = 'internal.supportbonfire.de';
    const mailWithoutLocalPart = '@bonfire.de';

    shouldFail(signUpSchema, buildSignUp({ email: mailWithoutTopLevelDomain }));
    shouldFail(signUpSchema, buildSignUp({ email: mailWithoutDomain }));
    shouldFail(signUpSchema, buildSignUp({ email: mailWithoutAt }));
    shouldFail(signUpSchema, buildSignUp({ email: mailWithoutLocalPart }));
  });

  test('if validation fails on invalid firstName', async () => {
    const tooShort = 'a';
    const tooLong = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const empty = '';
    const notDefined = undefined;

    shouldFail(signUpSchema, buildSignUp({ firstName: tooShort }));
    shouldFail(signUpSchema, buildSignUp({ firstName: tooLong }));
    shouldFail(signUpSchema, buildSignUp({ firstName: empty }));
    shouldFail(signUpSchema, buildSignUp({ firstName: notDefined }));
  });

  test('if validation fails on invalid lastName', async () => {
    const tooShort = 'a';
    const tooLong = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const empty = '';
    const notDefined = undefined;

    shouldFail(signUpSchema, buildSignUp({ lastName: tooShort }));
    shouldFail(signUpSchema, buildSignUp({ lastName: tooLong }));
    shouldFail(signUpSchema, buildSignUp({ lastName: empty }));
    shouldFail(signUpSchema, buildSignUp({ lastName: notDefined }));
  });

  test('if invalid password fails', async () => {
    const tooShort = 'Pas1!';
    const onlyLetters = 'passwordpassw';
    const onlyNumbers = '12313312313213';
    const onlySpecialCharacters = '!!!!::!!!:!:!';
    const withoutUpperCase = 'password123!!:';
    const withoutLowerCase = 'PASSWORD123!!:';
    const withoutSpecialChar = 'Password12313';

    shouldFail(signUpSchema, buildSignUp({ password: tooShort }));
    shouldFail(signUpSchema, buildSignUp({ password: onlyLetters }));
    shouldFail(signUpSchema, buildSignUp({ password: onlyNumbers }));
    shouldFail(signUpSchema, buildSignUp({ password: onlySpecialCharacters }));
    shouldFail(signUpSchema, buildSignUp({ password: withoutUpperCase }));
    shouldFail(signUpSchema, buildSignUp({ password: withoutLowerCase }));
    shouldFail(signUpSchema, buildSignUp({ password: withoutSpecialChar }));
  });

  test('if invalid username fails', async () => {
    const tooShort = 'a';
    const tooLong =
      'asdasdasjdajsdjkasjkdajksdjkasjkdajksdjkasjkdjkasdjkasjkdjkasdjk';
    const notDefined = undefined;
    const empty = '';

    shouldFail(signUpSchema, buildSignUp({ userName: tooShort }));
    shouldFail(signUpSchema, buildSignUp({ userName: tooLong }));
    shouldFail(signUpSchema, buildSignUp({ userName: notDefined }));
    shouldFail(signUpSchema, buildSignUp({ userName: empty }));
  });

  test('if valid fields will pass validation', async () => {
    shouldPass(signUpSchema, buildSignUp());
  });
});
