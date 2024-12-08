import { Prisma } from '@prisma/client';
import { ApiError } from './apiError';
import httpStatus, { BAD_REQUEST } from 'http-status';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import db from '../utils/db';

export const catchPrisma = async <T>(cb: () => T): Promise<T> => {
  try {
    return await cb();
  } catch (err) {
    if (err instanceof PrismaClientValidationError) {
      throw new ApiError(BAD_REQUEST, err.message);
    }
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
    throw new ApiError(500, String(err));
  }
};

export const catchWithTransaction = async <T>(cb: () => T): Promise<T> =>
  await catchPrisma(
    async () => await db.$transaction(async (_tx) => await cb()),
  );
