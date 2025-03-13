import { Token } from '@prisma/client';
import db from '../utils/db';
import { TOKEN_TYPES } from '../types/token';
import dayjs from 'dayjs';
import { ApiError } from '../utils/apiError';
import { INTERNAL_SERVER_ERROR, TOO_EARLY } from 'http-status';
import config from '../config/config';
import assert from 'assert';
import service from '.';

const activationExpMinutes = config.ACTIVATION_EXP_MINUTES;

export const findNotificationTokenByUId = async (uId: number) => {
  const token = await db.token.findFirst({
    where: {
      account: {
        user: {
          uId,
        },
      },
      type: TOKEN_TYPES.NOTIFICATION.toString(),
    },
  });
  return token;
};

export const updateNotificationToken = async (aId: number, token: string) => {
  await db.token.deleteMany({
    where: {
      OR: [
        { type: TOKEN_TYPES.NOTIFICATION.toString(), token },
        { type: TOKEN_TYPES.NOTIFICATION.toString(), aId },
      ],
    },
  });

  const created = await createToken(
    aId,
    dayjs().add(270, 'day').toDate(),
    dayjs().toDate(),
    token,
    TOKEN_TYPES.NOTIFICATION,
  );

  setImmediate(() => service.notification.handleUserSubscription(aId));

  return created;
};

export const findNotificationToken = async (
  aId: number,
): Promise<string | null> => {
  const token = await db.token.findFirst({
    where: {
      account: {
        aId,
      },
      type: TOKEN_TYPES.NOTIFICATION.toString(),
    },
    orderBy: {
      iat: 'asc',
    },
  });
  return token ? token.token : null;
};

export const deleteTokensOfType = async (
  aId: number,
  type: TOKEN_TYPES,
): Promise<void> => {
  await db.token.deleteMany({
    where: {
      account: {
        aId,
      },
      type: type.toString(),
    },
  });
};

export const createToken = async (
  aId: number,
  exp: Date,
  iat: Date,
  token: string,
  type: TOKEN_TYPES,
): Promise<Token> => {
  const created = await db.token.create({
    data: {
      aId,
      exp,
      iat,
      token,
      type: type.toString(),
      backlisted: false,
    },
  });
  assert(
    created != null,
    new ApiError(INTERNAL_SERVER_ERROR, 'Could not create notification token'),
  );
  return created;
};

export const upsertActivationToken = async (aId: number) => {
  const foundToken = await db.token.findFirst({
    where: {
      aId,
      type: TOKEN_TYPES.ACTIVATION.toString(),
      exp: {
        gt: dayjs().toDate(),
      },
    },
    orderBy: {
      iat: 'desc',
    },
  });
  if (foundToken != null) {
    const diffInSec = dayjs(foundToken.exp).diff(dayjs(), 'seconds');
    throw new ApiError(TOO_EARLY, `Bitte warte ${diffInSec} Sekunden`);
  }
  const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const token = await db.token.create({
    data: {
      backlisted: false,
      exp: dayjs().add(activationExpMinutes, 'minutes').toDate(),
      aId,
      type: TOKEN_TYPES.ACTIVATION.toString(),
      iat: dayjs().toDate(),
      token: otp.toString(),
    },
  });
  return { otp, token };
};

export const deleteAuthTokens = async (accountId: number) => {
  await db.token.deleteMany({
    where: {
      aId: accountId,
      OR: [
        {
          type: TOKEN_TYPES.ACCESS.toString(),
        },
        {
          type: TOKEN_TYPES.REFRESH.toString(),
        },
      ],
    },
  });
};

export const saveAccountToken = async (token: Omit<Token, 'tId'>) => {
  return await db.token.create({
    data: {
      ...token,
    },
  });
};
