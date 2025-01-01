import { BAD_REQUEST, CONFLICT, NOT_FOUND } from 'http-status';
import { ApiError } from '../../utils/apiError';
import db from '../../utils/db';
import assert from 'assert';
import { User } from '@prisma/client';

export const unsubscribeHost = async (user: User, hId: number) => {
  const host = await db.host.findFirst({
    where: {
      hId,
    },
    include: {
      followedBy: true,
    },
  });
  assert(host != null, new ApiError(NOT_FOUND, 'Kein Veranstalter gefunden'));
  const isFollowing = host.followedBy.some((f) => f.uId == user.uId);
  assert(
    isFollowing,
    new ApiError(CONFLICT, 'Du folgst dem Veranstalter nicht'),
  );
  await db.host.update({
    where: {
      hId,
    },
    data: {
      followedBy: {
        disconnect: {
          uId: user.uId,
        },
      },
    },
  });
};

export const subscribeHost = async (user: User, hId: number) => {
  const host = await db.host.findFirst({
    where: {
      hId,
    },
    include: {
      followedBy: true,
    },
  });
  assert(host != null, new ApiError(NOT_FOUND, 'Kein Veranstalter gefunden'));
  const isFollowing = host.followedBy.some((f) => f.uId == user.uId);
  assert(
    !isFollowing,
    new ApiError(CONFLICT, 'Du folgst dem Veranstalter bereits'),
  );
  await db.host.update({
    where: {
      hId,
    },
    data: {
      followedBy: {
        connect: {
          uId: user.uId,
        },
      },
    },
  });
};

export const deleteSocialLink = async (hId: number, type: string) => {
  return await db.socialLinks.deleteMany({
    where: {
      hId,
      type,
    },
  });
};

export const createSocialLink = async (
  hId: number,
  type: string,
  link: string,
) => {
  return await db.socialLinks.create({
    select: {
      link: true,
      type: true,
    },
    data: {
      link,
      type,
      hId,
    },
  });
};

export const findHostByAId = async (aId: number) => {
  const account = await db.account.findFirst({
    where: {
      aId,
    },
    select: {
      host: {
        select: {
          verified: true,
          Activity: true,
          companyName: true,
          Event: true,
          followedBy: true,
          aId: true,
          HostRating: true,
          SocialLinks: true,
          account: true,
          hId: true,
        },
      },
    },
  });
  assert(
    account != null,
    new ApiError(NOT_FOUND, 'Account mit dieser ID nicht gefunden'),
  );
  assert(
    account.host != null,
    new ApiError(NOT_FOUND, 'Benutzer hat kein Host-Profil'),
  );
  return account.host;
};

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

export const loadHostDetails = async (hostName: string, fromName: string) => {
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
          HostRating: {
            select: {
              description: true,
              points: true,
              createdAt: true,
              user: {
                select: {
                  account: {
                    select: {
                      userName: true,
                    },
                  },
                },
              },
            },
          },
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
          SocialLinks: {
            select: {
              type: true,
              link: true,
            },
          },
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
  account.host.HostRating = account.host.HostRating.map((rating) => {
    return { ...rating, isFromUser: rating.user.account.userName == fromName };
  });
  const hostRatingAgg = await db.hostRating.aggregate({
    where: {
      hostId: account.host.hId,
    },
    _avg: {
      points: true,
    },
  });
  const isFollowing = account.host.followedBy.some(
    (f) => f.account.userName == fromName,
  );
  return {
    host: account.host,
    rating: hostRatingAgg._avg.points,
    userName: account.userName,
    picture: account.picture,
    description: account.description,
    isFollowing,
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
