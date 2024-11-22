import httpStatus from 'http-status';
import { ApiError } from '../../utils/apiError';
import db from '../../utils/db';
import { Account } from '@prisma/client';
import { catchPrisma } from '../../utils/catchPrisma';

export const findAccountByPk = async (aId: number) => {
  const found = await catchPrisma(async () =>
    db.account.findFirst({
      where: {
        aId: Number(aId),
      },
    }),
  );
  if (!found)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Account with account id not found!',
      true,
    );
  return found;
};

export const isHostAccount = async (
  account: Partial<Account>,
): Promise<boolean> => {
  return !!(await db.host.findFirst({ where: { aId: account.aId } }));
};
