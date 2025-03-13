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
import { BasicAccountRepresentation } from '../types/abo';
import logger from '../logger';

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
 * Finds mutual friends between `target` and `origin`, excluding `origin` and `target` themselves.
 *
 * @param target userId to find mutual friends for
 * @param origin userId whose friends should be checked for mutuality
 * @returns List of mutual friends
 */
export const findMutualFriendIds = async (
  target: number,
  origin: number,
): Promise<BasicAccountRepresentation[]> => {
  const originFriends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(origin),
    include: { user: true, friend: true },
  });

  const originFriendIds: number[] = originFriends.map((k) =>
    k.friendId === origin ? k.userId : k.friendId,
  );
  originFriendIds.push(origin);
  logger.debug("Origin's friends: " + originFriendIds);

  const targetFriends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(target),
    include: { user: true, friend: true },
  });

  const targetFriendIds: number[] = targetFriends.map((f) =>
    f.friendId === target ? f.userId : f.friendId,
  );
  targetFriendIds.push(target);
  logger.debug("Target's friends: " + targetFriendIds);

  const mutualFriendIds = targetFriendIds.filter(
    (id) => originFriendIds.includes(id) && id !== origin && id !== target,
  );

  logger.debug('Mutual friends: ' + mutualFriendIds);
  const mutualFriends = await db.user.findMany({
    where: { uId: { in: mutualFriendIds } },
    select: query.abo.friendByUserTableSelection,
  });

  return mutualFriends.map((f) => ({
    isUserAccount: true,
    uId: f.uId,
    hId: null,
    account: {
      userName: f.account.userName,
      picture: f.account.picture,
      aId: f.account.aId,
    },
  }));
};

/**
 * Finds friends of `target` that are not `target`, `origin`, or friends of `origin`.
 *
 * @param target userId to find non-mutual friends for
 * @param origin userId whose friends should be excluded
 * @returns List of non-mutual friends
 */
export const findNonMutualFriendIds = async (
  target: number,
  origin: number,
): Promise<BasicAccountRepresentation[]> => {
  const originFriends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(origin),
    include: { user: true, friend: true },
  });

  const originFriendIds: number[] = originFriends.map((k) =>
    k.friendId === origin ? k.userId : k.friendId,
  );
  originFriendIds.push(origin);
  logger.debug("Origin's friends: " + originFriendIds);

  const targetFriends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(target),
    include: { user: true, friend: true },
  });

  const targetFriendIds: number[] = targetFriends.map((f) =>
    f.friendId === target ? f.userId : f.friendId,
  );
  logger.debug("Target's friends: " + targetFriendIds);

  const nonMutualFriendIds = targetFriendIds.filter(
    (id) => !originFriendIds.includes(id),
  );

  logger.debug('Non-mutual friends: ' + nonMutualFriendIds);
  const nonMutualFriends = await db.user.findMany({
    where: { uId: { in: nonMutualFriendIds } },
    select: query.abo.friendByUserTableSelection,
  });

  return nonMutualFriends.map((f) => ({
    isUserAccount: true,
    uId: f.uId,
    hId: null,
    account: {
      userName: f.account.userName,
      picture: f.account.picture,
      aId: f.account.aId,
    },
  }));
};
