import dayjs from 'dayjs';
import db from '../utils/db';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import { INTERNAL_SERVER_ERROR } from 'http-status';

export const createGroup = async (
  name: string,
  description: string | null,
  picture: string | null,
  owningUserId: number,
) => {
  const group = await db.group.create({
    data: {
      creationDate: dayjs().toDate(),
      description,
      owningUser: owningUserId,
      name,
      picture,
    },
  });
  assert(
    group,
    new ApiError(INTERNAL_SERVER_ERROR, 'Error occurred creating group'),
  );
  return group;
};
