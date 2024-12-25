import { BAD_REQUEST, CONFLICT, NOT_FOUND } from 'http-status';
import { ApiError } from '../../utils/apiError';
import db from '../../utils/db';
import assert from 'assert';

export const deleteHostRating = async (hostId: number, fromId: number) => {
  const host = await db.host.findFirst({
    where: {
      hId: hostId,
    },
  });

  assert(host != null, new ApiError(NOT_FOUND, 'Host-Id ist ungültig'));

  const hostRating = await db.hostRating.findFirst({
    where: {
      userId: fromId,
      hostId: hostId,
    },
  });

  assert(
    hostRating != null,
    new ApiError(NOT_FOUND, 'Du hast für diesen Host keine Bewertung'),
  );

  await db.hostRating.delete({
    where: {
      hrId: hostRating.hrId,
    },
  });
};

export const createHostRating = async (
  hostId: number,
  points: number,
  description: string | undefined,
  fromId: number,
) => {
  const hasRatedYet = await db.hostRating.findMany({
    where: {
      userId: fromId,
      hostId,
    },
  });

  assert(
    !hasRatedYet || hasRatedYet.length == 0,
    new ApiError(CONFLICT, 'Du hast für diesen Host bereits abgestimmt'),
  );
  assert(
    points >= 1 && points <= 5,
    new ApiError(BAD_REQUEST, 'Punkteanzahl nicht zwischen 1 und 5'),
  );
  const host = await db.host.findFirst({
    where: {
      hId: hostId,
    },
  });

  assert(host != null, new ApiError(NOT_FOUND, 'Host-Id ist ungültig'));

  return await db.hostRating.create({
    data: {
      points,
      description,
      userId: fromId,
      hostId,
    },
  });
};

export const loadHostDetails = async (hostName: string) => {
  assert(
    hostName != null && hostName.length > 0,
    new ApiError(BAD_REQUEST, 'Hostname darf nicht leer sein'),
  );
  const account = await db.account.findFirst({
    where: {
      userName: hostName,
    },
    include: {
      host: {
        select: {
          Activity: true,
          verified: true,
          companyName: true,
          Event: true,
          followedBy: {
            select: {
              _count: true,
              account: {
                select: {
                  userName: true,
                },
              },
            },
          },
          hId: true,
        },
      },
    },
  });
  assert(
    account != null,
    new ApiError(NOT_FOUND, 'Kein Account mit diesem Usernamen gefunden'),
  );
  assert(
    account.host != null,
    new ApiError(NOT_FOUND, 'Account besitzt kein Host-Profil'),
  );
  return {
    host: account.host,
    userName: account.userName,
    picture: account.picture,
    description: account.description,
  };
};

export const createHostByAccount = async (aId: number, companyName: string) => {
  const account = await db.account.findUnique({
    where: {
      aId,
    },
    include: {
      host: true,
      user: true,
    },
  });
  assert(
    account != null,
    new ApiError(NOT_FOUND, 'Account mit Account-ID nicht gefunden'),
  );
  assert(
    !account.user,
    new ApiError(CONFLICT, 'Ein User-Account kann kein Host-Profil erstellen'),
  );
  assert(
    account.host == null,
    new ApiError(CONFLICT, 'Es gibt bereits ein Host-Profil'),
  );
  const host = await db.host.create({
    data: {
      companyName,
      account: {
        connect: account,
      },
    },
  });
  return host;
};
