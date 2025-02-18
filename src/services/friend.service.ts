/**
 * @summary This file is being used only for service routines regarding existing friendships
 * @author @TheConsoleLog
 * @since 02-16-2025
 */

import query from '../query';
import db from '../utils/db';

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
