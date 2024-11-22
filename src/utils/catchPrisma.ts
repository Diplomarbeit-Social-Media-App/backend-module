import { Prisma } from '@prisma/client';
import { ApiError } from './apiError';
import httpStatus from 'http-status';

export const catchPrisma = async <T>(cb: () => T): Promise<T> => {
  try {
    return await cb();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      let fieldFailed: string = (
        (err.meta?.target?.toString() as string) ?? 'unknown'
      ).toLowerCase();
      if (fieldFailed.length >= 1)
        fieldFailed = `${fieldFailed
          .substring(0, 1)
          .toUpperCase()}${fieldFailed.substring(1)}`;
      throw new ApiError(
        httpStatus.IM_USED,
        `${fieldFailed} ist leider bereits vergeben`,
      );
    }
    throw new ApiError(500, 'Fehler bei der DB');
  }
};
