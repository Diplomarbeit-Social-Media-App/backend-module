import { BAD_REQUEST, CONFLICT, NOT_FOUND } from 'http-status';
import { ApiError } from '../utils/apiError';
import db from '../utils/db';
import assert from 'assert';
import { Activity, Token, User } from '@prisma/client';
import service from '.';
import query from '../query';
import logger from '../logger';
import { BasicAccountRepresentation } from '../types/abo';

export const verifyAccountByHId = async (hId: number) => {
  return db.host.update({
    where: { hId },
    data: { verified: true },
  });
};

export const hasHostProfileByAId = async (aId: number): Promise<boolean> => {
  const host = await db.host.findFirst({ where: { aId } });
  return !!host;
};

export const findFollowersByHId = async (hId: number) => {
  const host = await db.host.findFirst({
    where: {
      hId,
    },
    select: {
      followedBy: true,
      hId: true,
    },
  });
  assert(host, new ApiError(NOT_FOUND, `Host ${hId} not found`));
  return host;
};

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
  description: string | null,
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

export const findAllFollowedHostsByUid = async (
  uId: number,
): Promise<BasicAccountRepresentation[]> => {
  const hosts = await db.host.findMany({
    where: {
      followedBy: {
        some: {
          uId,
        },
      },
    },
    select: query.host.mutualHostSelection,
  });
  return hosts.map((h) => {
    return { ...h, isUserAccount: false, uId: null };
  });
};

export const findMutualHosts = async (uId1: number, uId2: number) => {
  const mutualHosts = await db.host.findMany({
    where: {
      AND: [
        { followedBy: { some: { uId: uId1 } } },
        { followedBy: { some: { uId: uId2 } } },
      ],
    },
    select: query.host.mutualHostSelection,
  });
  logger.debug('mutual hosts length: ' + mutualHosts.length);
  const mapped = mutualHosts.map((host) => ({
    ...host,
    isUserAccount: false,
    uId: null,
  }));
  return mapped;
};

/**
 * The main idea of this fn is to return all necessary information of host followers
 * in order to send them notifications if xxx happens.
 * Only tokens of type "Notification" (FCM) are found in this token array!
 * @throws { ApiError(404) } if host not found with #hId
 * @param hId Primary key of host
 */
export const findHostFollowers = async (
  hId: number,
): Promise<{
  followedBy?: { uId: number; account: { aId: number; token: Token[] } }[];
}> => {
  const host = await db.host.findFirst(
    query.host.completeHostFollowerQuery(hId),
  );
  assert(host, new ApiError(NOT_FOUND, 'Host nicht gefunden'));
  return host;
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
          verified: true,
          companyName: true,
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
  const events = await service.event.loadEventsFromHost(account.host.hId);
  // TODO: as soon as possible, fix load real activities
  const activitys: Activity[] = [];
  return {
    host: account.host,
    events,
    activitys,
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

export const findNonMutualHostFollowings = async (
  target: number,
  origin: number,
): Promise<BasicAccountRepresentation[]> => {
  const originHostFollowings = await db.host.findMany({
    where: {
      followedBy: {
        some: {
          uId: origin,
        },
      },
    },
    select: {
      hId: true,
    },
  });
  const originIds: number[] = originHostFollowings.map((h) => h.hId);
  logger.debug('Origin host followings' + originIds);

  const targetHostFollowings = await db.host.findMany({
    where: {
      followedBy: {
        some: {
          uId: target,
        },
      },
      NOT: {
        hId: {
          in: originIds,
        },
      },
    },
    select: query.host.mutualHostSelection,
  });

  const mapped = targetHostFollowings.map((h) => ({
    hId: h.hId,
    uId: null,
    isUserAccount: false,
    account: h.account,
  }));

  return mapped;
};
