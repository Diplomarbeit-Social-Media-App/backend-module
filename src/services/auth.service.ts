import bcrypt from 'bcrypt';
import { LOGIN_OS, signUpSchema } from '../types/auth';
import db from '../utils/db';
import { TOKEN_TYPES, tokenSchema } from '../types/token';
import jwt from 'jsonwebtoken';
import dayjs, { ManipulateType } from 'dayjs';
import config from '../config/config';
import pick from 'lodash/pick';
import service from './index';
import { Account } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { GONE, NOT_FOUND, UNAUTHORIZED } from 'http-status';
import assert from 'assert';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { catchPrisma, catchWithTransaction } from '../utils/catchPrisma';

export const findAccountByEmail = async (email: string) => {
  const account = await db.account.findUnique({
    where: {
      email,
    },
  });
  return account;
};

export const updateLoginOs = async (aId: number, os: LOGIN_OS) => {
  await db.account.update({
    where: {
      aId,
    },
    data: {
      loginOs: os.toString(),
    },
  });
};

export const updateAccountData = async (
  aId: number,
  firstName?: string,
  lastName?: string,
  userName?: string,
  description?: string,
) => {
  const origin = { firstName, lastName, userName, description };
  const updatedValues = Object.fromEntries(
    Object.entries(origin).filter(([_, value]) => value !== undefined),
  );

  console.log(updatedValues);
  return await catchPrisma(
    async () =>
      await db.account.update({
        where: {
          aId,
        },
        data: {
          ...updatedValues,
        },
        select: {
          firstName: true,
          lastName: true,
          userName: true,
          description: true,
          aId: true,
        },
      }),
  );
};

export const deleteAccount = async (aId: number) => {
  await db.account.delete({
    where: {
      aId,
    },
  });
};

export const activateAccount = async (aId: number, otp: string) => {
  const foundToken = await db.token.findFirst({
    where: {
      aId,
      type: TOKEN_TYPES.ACTIVATION.toString(),
      backlisted: false,
      token: otp,
    },
  });
  assert(
    foundToken != null,
    new ApiError(NOT_FOUND, 'OTP stimmt nicht überein'),
  );
  const isExpired = dayjs().isAfter(foundToken.exp);
  assert(!isExpired, new ApiError(UNAUTHORIZED, 'OTP ist bereits abgelaufen'));
  await catchWithTransaction(async () => {
    await db.token.delete({
      where: {
        tId: foundToken.tId,
      },
    });
    await db.account.update({
      where: {
        aId,
      },
      data: {
        activated: true,
      },
    });
  });
};

export const handleRequestPwdResetToken = async (userName: string) => {
  const acc = await db.account.findFirst({ where: { userName } });
  assert(acc != null, 'Account wurde nicht gefunden');
  const aId = acc.aId;
  await db.passwordResetToken.deleteMany({ where: { aId: aId } });
  const randomToken =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  await db.passwordResetToken.create({
    data: {
      exp: dayjs().add(30, 'minute').toDate(),
      token: randomToken.toString(),
      aId: aId,
    },
  });
  const account = await service.account.findAccountByPk(aId);

  assert(
    account != null && account.email != null,
    'Fehler ist aufgetreten, da keine Email bei dem Account hinterlegt wurde',
  );

  await service.mail.sendPwdResetMail(randomToken.toString(), account.email);
};

export const updatePassword = async (
  token: string,
  userName: string,
  hashedNewPwd: string,
) => {
  const account = await db.account.findFirst({ where: { userName } });
  assert(account != null, 'Account wurde nicht gefunden');
  const foundToken = await db.passwordResetToken.findFirst({
    where: {
      token,
    },
  });
  assert(
    foundToken?.aId == account.aId,
    new ApiError(NOT_FOUND, 'Token wurde nicht gefunden'),
  );
  assert(
    foundToken != null,
    new ApiError(NOT_FOUND, 'Token wurde nicht gefunden'),
  );
  assert(
    dayjs().isBefore(foundToken.exp),
    new ApiError(GONE, 'Token ist abgelaufen'),
  );
  await db.passwordResetToken.delete({ where: { prtId: foundToken.prtId } });
  await db.account.update({
    where: { aId: account.aId },
    data: { password: hashedNewPwd },
  });
};

export const handleRenewToken = async (
  refresh: string,
): Promise<{ access: string }> => {
  try {
    const tokenFound = await db.token.findFirst({
      where: {
        token: refresh,
        type: TOKEN_TYPES.REFRESH.toString(),
      },
    });
    assert.ok(tokenFound != null);

    const exp = dayjs(tokenFound.exp);
    const expired: boolean = exp.isBefore(dayjs());
    assert.ok(!expired);

    const accountFound = await db.account.findFirst({
      where: {
        aId: tokenFound.aId,
      },
    });
    assert.ok(accountFound != null);

    await db.token.deleteMany({
      where: {
        aId: tokenFound.aId,
        type: TOKEN_TYPES.ACCESS.toString(),
      },
    });

    return {
      access: await generateToken(accountFound.aId, TOKEN_TYPES.ACCESS),
    };
  } catch (_err) {
    throw new ApiError(UNAUTHORIZED, 'Anmeldung abgelaufen');
  }
};

export const hashPassword = async (password: string, salt: number) => {
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};

export const handleLogout = async (aId: number) => {
  await db.token.deleteMany({
    where: {
      aId,
    },
  });
};

export const createAccount = async (
  account: signUpSchema,
): Promise<Account> => {
  const {
    dateOfBirth,
    email,
    firstName,
    lastName,
    userName,
    password,
    picture,
  } = pick(account, [
    'dateOfBirth',
    'email',
    'firstName',
    'lastName',
    'userName',
    'password',
    'picture',
  ]);

  const date: Date = dayjs(dateOfBirth).toDate();
  try {
    return await db.account.create({
      data: {
        dateOfBirth: date,
        description: '',
        email,
        firstName,
        lastName,
        userName,
        password,
        picture,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const fields = error.meta?.target as string[] | undefined;
        const formatted =
          fields && fields?.length > 0
            ? fields?.map((str, index) =>
                index === 0
                  ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
                  : str.toLowerCase(),
              )
            : fields;
        throw new ApiError(400, `Bitte verwende andere Werte für ${formatted}`);
      }
    }
    throw new ApiError(500, 'Leider ist etwas schief gelaufen!');
  }
};

export const generateToken = async (accountId: number, type: TOKEN_TYPES) => {
  const expiresFormat: { unit: ManipulateType; value: number } =
    type === TOKEN_TYPES.ACCESS
      ? { unit: 'minute', value: config.JWT_ACCESS_EXPIRATION_MINUTES }
      : { unit: 'day', value: config.JWT_REFRESH_EXPIRATION_DAYS };

  const currDate = dayjs();
  const exp = currDate.add(expiresFormat.value, expiresFormat.unit);
  const iat = currDate;

  const payload: tokenSchema = {
    iat: iat.unix(),
    exp: exp.unix(),
    sub: accountId,
    type,
  };
  const token: string = await new Promise((resolve, reject) =>
    jwt.sign(
      {
        ...payload,
      },
      config.JWT_SECRET,
      {},
      (err, jwt) => {
        if (err || !jwt) return reject(err);
        resolve(jwt);
      },
    ),
  );
  await service.token.saveAccountToken({
    aId: accountId,
    backlisted: false,
    exp: exp.toDate(),
    iat: iat.toDate(),
    token,
    type: type.toString(),
  });
  return token;
};

export const generateAndSaveTokens = async (
  accountId: number,
): Promise<{ refresh: string; access: string }> => {
  await service.token.deleteAuthTokens(accountId);

  const refresh = await generateToken(accountId, TOKEN_TYPES.REFRESH);
  const access = await generateToken(accountId, TOKEN_TYPES.ACCESS);

  return { refresh, access };
};
