import { ApiError } from '../../utils/apiError';
import db from '../../utils/db';
import httpStatus, { NOT_FOUND, UNAUTHORIZED } from 'http-status';
import service from '../../services/index';
import { Account } from '@prisma/client';

export const findUserByUserName = async (userName: string) => {
  const found = await db.account.findFirst({ where: { userName } });
  if (!found || found.disabled)
    return Promise.reject('User nicht gefunden oder gesperrt');
  return found;
};

export const findUser = async (
  userName: string,
  password: string,
): Promise<Account> => {
  const found = await db.account.findFirst({
    where: {
      userName,
    },
  });
  if (!found) throw new ApiError(NOT_FOUND, 'Username oder Passwort falsch');
  const pwdCorrect = await service.auth.comparePassword(
    password,
    found.password,
  );
  if (!pwdCorrect)
    throw new ApiError(NOT_FOUND, 'Username oder Passwort falsch');
  if (found.disabled)
    throw new ApiError(UNAUTHORIZED, 'Dein Account wurde gesperrt');
  return found;
};

export const createUserByAccount = async (accountId: number) => {
  const account = await db.account.findFirst({
    where: {
      aId: accountId,
    },
    include: {
      user: true,
    },
  });
  if (!account)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Kein Account wurde mit dieser ID gefundens',
    );
  if (account.user)
    throw new ApiError(
      httpStatus.CONFLICT,
      'User already found with given accound-id',
      true,
    );
  const user = await db.user.create({
    data: {
      account: {
        connect: account,
      },
    },
  });

  return { user, account };
};
