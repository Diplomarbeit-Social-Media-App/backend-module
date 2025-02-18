/**
 * @summary This file is being used only for service routines regarding existing friendships
 * @author @TheConsoleLog
 * @since 02-16-2025
 */

import { NOT_FOUND } from 'http-status';
import query from '../query';
import { ApiError } from '../utils/apiError';
import db from '../utils/db';
import assert from 'assert';

export const findFriendshipByUIds = async (uId1: number, uId2: number) => {
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { friendId: uId1, userId: uId2 },
        { friendId: uId2, userId: uId1 },
      ],
    },
    include: {
      friend: {
        include: {
          account: true,
        },
      },
      user: true,
    },
  });
  assert(
    friendship,
    new ApiError(NOT_FOUND, 'No friendship between Users established'),
  );
  return friendship;
};

/**
 *
 * @param target userId to find non mutual friends for
 * @param origin
 */
export const findNonMutualFriendIds = async (
  target: number,
  origin: number,
) => {
  const originFriends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(origin),
    select: { friendId: true, userId: true },
  });
  const originFriendIds = originFriends.flatMap((friend) => [
    friend.friendId,
    friend.userId,
  ]);
  const nonMutuals = await db.friendship.findMany({
    where: {
      ...query.abo.isFriendedWhereCondition(target),
      friendId: {
        notIn: originFriendIds,
      },
      userId: {
        notIn: originFriendIds,
      },
    },
  });

  return nonMutuals;
};
