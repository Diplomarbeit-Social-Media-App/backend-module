import assert from 'assert';
import db from '../utils/db';
import { ApiError } from '../utils/apiError';
import { NOT_FOUND } from 'http-status';

export const findLocationByLId = async (lId: number) => {
  const loc = await db.location.findFirst({
    where: {
      lId,
    },
  });
  assert(loc, new ApiError(NOT_FOUND, `Adresse ${lId} nicht gefunden`));
  return loc;
};
