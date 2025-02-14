import db from '../utils/db';
import { BasicAccountRepresentation, extendedAboRequest } from '../types/abo';
import { Friendship, Prisma, User } from '@prisma/client';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import { CONFLICT, NOT_FOUND, TOO_EARLY } from 'http-status';
import logger from '../logger';
import query from '../query';
import service from '.';

function shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const deleteFriendship = async (fromUId: number, toUId: number) => {
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { AND: [{ friendId: fromUId, userId: toUId }] },
        { AND: [{ friendId: toUId, userId: fromUId }] },
      ],
    },
  });
  assert(
    friendship != null,
    new ApiError(NOT_FOUND, 'Abo konnte nicht gefunden werden'),
  );
  await db.friendship.delete({
    where: {
      userId_friendId: {
        friendId: friendship.friendId,
        userId: friendship.userId,
      },
    },
  });
};

export const loadFriendships = async (
  uId: number,
): Promise<BasicAccountRepresentation[]> => {
  const selection = {
    account: {
      select: {
        userName: true,
        picture: true,
        aId: true,
      },
    },
  };
  const friends = await db.friendship.findMany({
    where: {
      OR: [
        {
          friendId: uId,
        },
        {
          userId: uId,
        },
      ],
    },
    select: {
      userId: true,
      friendId: true,
      friend: {
        select: selection,
      },
      user: {
        select: selection,
      },
    },
  });
  const mapped = friends?.map((f) =>
    f.friendId == uId
      ? { uId: f.userId, ...f.user }
      : { uId: f.friendId, ...f.friend },
  );
  return mapped.map((acc) => {
    return { ...acc, isUserAccount: true, hId: null };
  });
};

export const findRandomUsersFilterFriends = async (
  USER_COUNT: number = 20,
  fromUId: number,
  friends: number[],
): Promise<BasicAccountRepresentation[]> => {
  const allUserIds = await db.user.findMany({
    select: { uId: true },
    take: 5_000,
  });

  const idArray = allUserIds.map((user) => user.uId);
  if (idArray.length === 0) return [];

  const randomIds = shuffleArray(idArray);

  const users = await db.user.findMany({
    where: {
      uId: { in: randomIds },
      friendedBy: {
        none: { OR: [{ friendId: fromUId }, { userId: fromUId }] },
      },
      friends: { none: { OR: [{ friendId: fromUId }, { userId: fromUId }] } },
      NOT: { uId: fromUId },
    },
    select: {
      uId: true,
      account: {
        select: {
          picture: true,
          userName: true,
          aId: true,
        },
      },
    },
    take: USER_COUNT,
  });

  return users
    .map((user) => ({ ...user, hId: null, isUserAccount: true }))
    .filter((u) => !friends.includes(u.uId));
};

export const findAllFriendsByUId = async (userId: number) => {
  const friendsId = await db.friendship.findMany({
    where: {
      OR: [{ friendId: userId }, { userId: userId }],
    },
    select: {
      friendId: true,
      userId: true,
    },
  });
  const mappedForeignId = friendsId.map(({ friendId, userId: friendedId }) =>
    friendId == userId ? friendedId : friendId,
  );
  const friends = await db.user.findMany({
    where: {
      uId: {
        in: mappedForeignId,
      },
    },
    select: query.abo.friendByUserTableSelection,
  });
  return friends.map((fr) => ({ ...fr, isUserAccount: true, hId: null }));
};

export const findMutualFriends = async (
  fromId: number,
  toId: number,
): Promise<BasicAccountRepresentation[]> => {
  const fromFriends = await db.friendship.findMany({
    where: {
      OR: [{ friendId: fromId }, { userId: fromId }],
    },
    select: query.abo.mutualFriendsSelection,
  });
  const toFriends = await db.friendship.findMany({
    where: {
      OR: [{ friendId: toId }, { userId: toId }],
    },
    select: query.abo.mutualFriendsSelection,
  });
  const mapped: number[] = toFriends.map((fr) => {
    return fr.friendId == toId ? fr.userId : fr.friendId;
  });

  return fromFriends
    .filter((fr) => {
      const valued = fr.friendId == fromId ? fr.userId : fr.friendId;
      return mapped.includes(valued);
    })
    .map((fr) => {
      return { ...fr.user, isUserAccount: true, hId: null };
    });
};

export const hasSentRequestToUser = async (fromUId: number, toUId: number) => {
  const abos = await db.aboRequest.findMany({
    where: {
      fromUserId: fromUId,
      toUserId: toUId,
    },
  });
  return abos && abos.length > 0;
};

export const findHostSuggestions = async (
  user: User,
): Promise<BasicAccountRepresentation[]> => {
  const HOST_COUNT = 20;
  const hosts = await db.host.findMany({
    where: {
      followedBy: {
        none: {
          aId: user.aId,
        },
      },
    },
    take: HOST_COUNT,
    select: {
      account: {
        select: {
          aId: true,
          picture: true,
          userName: true,
        },
      },
      hId: true,
    },
  });
  return hosts.map((host) => {
    return { ...host, isUserAccount: false, uId: null };
  });
};

const mapToBasicAccountFormat = (user: {
  uId: number;
  account: { aId: number; picture: string | null; userName: string };
}): BasicAccountRepresentation => {
  return { ...user, hId: null, isUserAccount: true };
};

const findUserSuggestionsThroughFriends = async (
  { uId }: User,
  friends: Friendship[],
): Promise<null | BasicAccountRepresentation[]> => {
  if (!friends || friends.length == 0) return null;

  logger.debug(
    `{AboService | findUserSuggestionsThroughFriends} - amount of friends: ${friends?.length ?? 0}`,
  );

  const mappedToUnknownIds = friends.map((f) =>
    f.friendId === uId ? f.userId : f.friendId,
  );

  const foundUnknown = await db.friendship.findMany({
    where: {
      friendId: {
        in: mappedToUnknownIds,
      },
      userId: {
        in: mappedToUnknownIds,
      },
    },
    select: {
      user: {
        select: query.abo.friendByUserTableSelection,
      },
      friend: {
        select: query.abo.friendByUserTableSelection,
      },
    },
  });

  logger.debug(
    `{AboService | findUserSuggestionsThroughFriends} - found friend of friends: ${foundUnknown.length}`,
  );

  const uniqueFiltered = foundUnknown
    .map((f) => (mappedToUnknownIds.includes(f.friend.uId) ? f.user : f.friend))
    .filter((f) => f.uId !== uId)
    .filter(
      (f) =>
        !friends
          .map((friend) =>
            friend.friendId === uId ? friend.userId : friend.friendId,
          )
          .some((friend) => friend === f.uId),
    )
    .map((v) => mapToBasicAccountFormat(v));
  return uniqueFiltered;
};

export const findUniqueUserSuggestions = async (
  user: User,
): Promise<BasicAccountRepresentation[]> => {
  const friends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(user.uId),
  });
  const mappedToUnknownIds = friends.map((f) =>
    f.friendId === user.uId ? f.userId : f.friendId,
  );

  let suggestions: BasicAccountRepresentation[] | null =
    await findUserSuggestionsThroughFriends(user, friends);

  if (!suggestions) suggestions = [];
  if (suggestions.length < 20) {
    const rest = 20 - (suggestions?.length ?? 0);
    const randoms = await findRandomUsersFilterFriends(
      rest,
      user.uId,
      mappedToUnknownIds,
    );
    suggestions.push(...randoms);
  }
  return suggestions;
};

export const modifyRequest = async (
  aboRequest: extendedAboRequest,
  accept: boolean,
) => {
  await db.$transaction(async (tx) => {
    if (accept)
      await tx.friendship.create({
        data: {
          friendId: aboRequest.toUserId,
          userId: aboRequest.fromUserId,
        },
      });
    await tx.aboRequest.delete({
      where: { frId: aboRequest.frId },
    });
  });
};

export const loadRequestById = async (frId: number) => {
  const aboReq = await db.aboRequest.findFirst({
    where: {
      frId,
    },
    include: {
      fromUser: true,
      toUser: true,
    },
  });
  assert(aboReq != null, new ApiError(NOT_FOUND, 'Anfrage nicht gefunden'));
  return aboReq;
};

/**
 * Checks if user is friended with another user
 * Won't check if any of those ids are valid and linked to a real account
 * @param uId1 number
 * @param uId2 number
 */
export const isFriendedWith = async (uId1: number, uId2: number) => {
  const isFriended = await db.friendship.findFirst({
    where: {
      OR: [
        {
          AND: [
            {
              userId: uId1,
            },
            {
              friendId: uId2,
            },
          ],
        },
        {
          AND: [
            {
              userId: uId2,
            },
            {
              friendId: uId1,
            },
          ],
        },
      ],
    },
  });
  return isFriended != null;
};

export const searchByUserName = async (userName: string, take: number = 50) => {
  const condition = {
    userName: {
      contains: userName,
      mode: 'insensitive',
    },
  } as Prisma.AccountWhereInput;
  const selectedFields = {
    userName: true,
    picture: true,
    aId: true,
  };

  const found = await db.account.findMany({
    where: {
      AND: [
        condition,
        {
          OR: [
            {
              host: {
                isNot: null,
              },
            },
            {
              user: {
                isNot: null,
              },
            },
          ],
        },
      ],
    },
    select: {
      ...selectedFields,
      host: {
        select: {
          hId: true,
        },
      },
      user: {
        select: {
          uId: true,
        },
      },
    },
    take,
  });

  return found?.map((acc) => {
    const isUserAccount = acc.user != null;
    return {
      uId: acc.user?.uId ?? null,
      hId: acc.host?.hId ?? null,
      account: {
        picture: acc.picture,
        userName: acc.userName,
        aId: acc.aId,
      },
      isUserAccount,
    };
  });
};

/**
 * the goal is to return all abo requests in which the user appears
 * @param aId valid account-id
 */
export const loadAllReqWithUser = async (aId: number) => {
  const user = await db.user.findFirst({
    where: {
      account: {
        aId,
      },
    },
    include: {
      receivedAboRequests: true,
      sentAboRequests: true,
    },
  });
  return { received: user?.receivedAboRequests, sent: user?.sentAboRequests };
};

/**
 * @param fromUser User-Account model, whoose owner wants to send the request
 * @param toUser the userName of user -> wants the be friended with
 */
export const sendAboRequest = async (from: User, target: string) => {
  const toAccount = await service.user.findUserByUserName(target);
  const to = await service.user.findUserByAId(toAccount.aId);

  // check if user not the same as username
  assert(
    from.uId !== to.uId,
    new ApiError(CONFLICT, 'Du kannst dir nicht selbst folgen'),
  );

  // check if both are friended already
  const aboEstablished = await isFriendedWith(from.uId, to.uId);
  assert(
    !aboEstablished,
    new ApiError(CONFLICT, `Bereits mit ${target} befreundet`),
  );

  // check if friend request has been sent to target
  const reqSent = await db.aboRequest.findFirst({
    where: {
      fromUserId: from.uId,
      toUserId: to.uId,
    },
  });
  assert(
    !reqSent,
    new ApiError(TOO_EARLY, `Deine Anfrage an ${target} wartet noch`),
  );

  return await db.aboRequest.create({
    data: {
      fromUserId: from.uId,
      toUserId: to.uId,
    },
  });
};

export const loadOpenAboRequests = async (uId: number) => {
  return await db.aboRequest.findMany({
    where: {
      toUserId: uId,
    },
    select: {
      frId: true,
      createdAt: true,
      fromUser: {
        select: {
          account: {
            select: {
              aId: true,
              userName: true,
            },
          },
          uId: true,
        },
      },
      toUser: {
        select: {
          account: {
            select: {
              aId: true,
              userName: true,
            },
          },
          uId: true,
        },
      },
    },
  });
};

export const deleteAboRequest = async (frId: number) => {
  await db.aboRequest.delete({
    where: {
      frId,
    },
  });
};
