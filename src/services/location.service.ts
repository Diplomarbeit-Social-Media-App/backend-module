import assert from 'assert';
import db from '../utils/db';
import { ApiError } from '../utils/apiError';
import { NOT_FOUND } from 'http-status';
import { locationSchema } from '../schema/location.schema';

export const findLocationByLId = async (lId: number) => {
  const loc = await db.location.findFirst({
    where: {
      lId,
    },
  });
  assert(loc, new ApiError(NOT_FOUND, `Adresse ${lId} nicht gefunden`));
  return loc;
};

export const createLocation = async (
  location: Zod.infer<typeof locationSchema>,
) => {
  return db.location.create({
    data: {
      city: location.city,
      houseNumber: location.houseNumber,
      postCode: String(location.plz),
      street: location.street,
    },
  });
};
