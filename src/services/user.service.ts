import { ApiError } from '../utils/apiError';
import db from '../utils/db';
import httpStatus, { NOT_FOUND, UNAUTHORIZED } from 'http-status';
import service from './index';
import { User } from '@prisma/client';
import assert from 'node:assert';
import { PublicUserInformationResponse } from '../types/user';
import query from '../query';

export const findUserByUId = async (uId: number): Promise<User> => {
  const user = await db.user.findUnique({
    where: {
      uId,
    },
  });
  assert(
    user != null,
    new ApiError(NOT_FOUND, 'Kein User-Profil für die ID gefunden'),
  );
  return user;
};

export const findUserByUserName = async (userName: string) => {
  const found = await db.account.findFirst({ where: { userName } });
  if (!found || found.disabled)
    return Promise.reject('User nicht gefunden oder gesperrt');
  return found;
};

export const findUser = async (userName: string, password: string) => {
  const found = await db.account.findFirst({
    where: {
      userName,
    },
    include: {
      user: {
        select: { uId: true },
      },
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

export const findUserByAId = async (aId: number) => {
  assert(aId != null, new ApiError(NOT_FOUND, 'Account-ID ist null'));
  const user = await db.user.findUnique({
    where: {
      aId,
    },
  });
  assert(
    user != null,
    new ApiError(NOT_FOUND, 'Kein User-Profil für die ID gefunden'),
  );
  return user;
};

/**
 * Please notice that this function mostly returns data saved in 'Account' table
 * @param uId unique pk of user
 * @throws ApiError 404 if no user was found with this uId
 */
export const getUserPublicInformation = async (
  uId: number,
): Promise<PublicUserInformationResponse> => {
  const user = await db.user.findFirst({
    where: {
      uId,
    },
    select: query.user.publicInformationSelection,
  });
  assert(user && user.account, new ApiError(NOT_FOUND, 'User not found'));
  return user.account;
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
