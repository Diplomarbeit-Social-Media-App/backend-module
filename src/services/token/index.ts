import { Token } from '@prisma/client';
import db from '../../utils/db';

export const deleteAccountTokens = async (accountId: number) => {
  await db.token.deleteMany({
    where: {
      aId: accountId,
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
