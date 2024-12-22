import db from '../../utils/db';
import {
  ABO_FILTER_SCHEMA,
  ABO_REQUEST_STATE,
  getFilterValues,
} from '../../types/abo';
import { Prisma, User } from '@prisma/client';
import assert from 'assert';
import { ApiError } from '../../utils/apiError';
import {
  ACCEPTED,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status';
import logger from '../../logger/logger';
import { assign, omit } from 'lodash';

export const searchByUserName = async (userName: string, take: number = 50) => {
  const condition = {
    userName: {
      contains: userName,
      mode: 'insensitive',
    },
  } as Prisma.AccountWhereInput;
  const selectedFields = {
    firstName: true,
    userName: true,
    picture: true,
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
    const omitted = omit(acc, ['host', 'user']);
    return assign(omitted, { isUserAccount });
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
export const sendAboRequest = async (fromUser: User, toUser: string) => {
  assert(
    fromUser && toUser,
    new ApiError(
      INTERNAL_SERVER_ERROR,
      'Beide Argumente müssen gültige Werte besitzen',
    ),
  );
  const requestedUser = await db.account.findUnique({
    where: {
      userName: toUser,
    },
    include: {
      user: true,
    },
  });
  assert(
    requestedUser && requestedUser.user,
    new ApiError(NOT_FOUND, 'Account oder User nicht gefunden'),
  );
  // has sent abo req to user
  const aboRequests = await db.aboRequest.findMany({
    where: {
      fromUser: {
        aId: fromUser.aId,
      },
      toUser: {
        aId: requestedUser.aId,
      },
    },
  });

  if (!aboRequests || aboRequests.length == 0) {
    logger.debug('New friend request is being created...');
    return await db.aboRequest.create({
      data: {
        fromUserId: fromUser.uId,
        toUserId: requestedUser.user.uId,
      },
      include: {
        fromUser: true,
        toUser: true,
      },
    });
  }

  const hasOpenRequests = aboRequests.some(
    (r) => r.state == ABO_REQUEST_STATE.PENDING,
  );
  const hasClosedRequests = aboRequests.some(
    (r) =>
      r.state == ABO_REQUEST_STATE.DECLINED ||
      r.state == ABO_REQUEST_STATE.DELETED,
  );
  const isFriendedAlready = aboRequests.some((r) => r.state == ACCEPTED);

  if (hasOpenRequests)
    throw new ApiError(CONFLICT, 'Du hast bereits offene Anfrangen');
  if (isFriendedAlready)
    throw new ApiError(CONFLICT, 'Du bist bereits mit der Person befreundet');
  if (hasClosedRequests)
    throw new ApiError(
      CONFLICT,
      'Warte, bis die Person dir eine Anfrage schickt',
    );
};

export const loadAboRequests = async (
  filter: ABO_FILTER_SCHEMA,
  aId: number,
) => {
  const filterValues = getFilterValues(filter);
  return await db.aboRequest.findMany({
    where: {
      state: {
        in: filterValues,
      },
      AND: [
        {
          OR: [
            {
              fromUser: {
                aId: Number(aId),
              },
            },
            {
              toUser: {
                aId: Number(aId),
              },
            },
          ],
        },
      ],
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
