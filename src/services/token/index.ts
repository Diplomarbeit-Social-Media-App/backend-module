import { Token } from '@prisma/client';
import db from '../../utils/db';
import { TOKEN_TYPES } from '../../types/token';
import dayjs from 'dayjs';
import { ApiError } from '../../utils/apiError';
import { TOO_EARLY } from 'http-status';
import config from '../../config/config';

const activationExpMinutes = config.ACTIVATION_EXP_MINUTES;

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
