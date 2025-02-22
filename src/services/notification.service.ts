import assert from 'assert';
import getFirebase from '../config/firebase';
import { ApiError } from '../utils/apiError';
import db from '../utils/db';
import { NOT_FOUND } from 'http-status';
import { TOKEN_TYPES } from '../types/token';
import service from '.';
import dayjs from 'dayjs';
import { APP_NOTIFICATION_TYPE } from '../types/notification';
import logger from '../logger';

const messaging = getFirebase().messaging();

export const deleteFriendReqNot = async (frId: number) => {
  const deleted = await db.notification.deleteMany({
    where: {
      frId,
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED,
    },
  });
  logger.debug('friend req received deleted: ' + deleted.count);
};

export const findFriendReqNot = async (frId: number) => {
  const not = await db.notification.findFirst({
    where: {
      frId,
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED,
    },
  });
  assert(not, new ApiError(NOT_FOUND, `FA ${frId} not found`));
  return not;
};

export const handleUserSubscription = async (aId: number) => {
  const user = await db.user.findUnique({
    where: {
      aId,
    },
    include: {
      account: {
        include: {
          token: true,
        },
      },
      groups: true,
      events: true,
    },
  });
  assert(user, new ApiError(NOT_FOUND, 'Kein User-Profil gefunden'));
  const token = user.account.token.find(
    (t) => t.type === TOKEN_TYPES.NOTIFICATION.toString(),
  );
  assert(token, new ApiError(NOT_FOUND, 'Kein Notification-Token vorhanden'));

  handleGroupSubscription(token.token, user.uId);
};

const handleGroupSubscription = async (token: string, uId: number) => {
  const groups = await service.group.findGroupsByUId(uId);
  groups.forEach((g) => messaging.subscribeToTopic(token, `g-${g.gId}`));
};

export const findAllFcmTokens = async () => {
  const tokens = await db.token.findMany({
    where: {
      type: TOKEN_TYPES.NOTIFICATION.toString(),
    },
    select: {
      token: true,
    },
  });
  return tokens.map((t) => t.token);
};

export const broadcastMessage = async (title: string, message: string) => {
  const tokens = await findAllFcmTokens();
  return await messaging.sendEachForMulticast({
    notification: { title, body: message },
    tokens,
  });
};

export const sendMessage = async (
  token: string,
  title: string,
  message: string,
) => {
  return await messaging.send({
    notification: { title, body: message },
    token,
  });
};

export const updateConsumed = async (ntId: number, consumed?: boolean) => {
  return db.notification.update({
    where: { ntId },
    data: { consumed },
  });
};

/**
 * Finds group invitation app notification by gId and uId
 * @param gId Group id
 * @param uId User id
 * @returns notification
 */
export const findGroupInviteNotification = async (gId: number, uId: number) => {
  const not = await db.notification.findFirst({
    where: {
      groupId: gId,
      targetId: uId,
    },
  });
  assert(not, new ApiError(NOT_FOUND, `Gruppe ${gId} nicht gefunden`));
  return not;
};

/**
 * This service method not only searches for all in app notifications
 * less or equal than 30 days old, but also sets seen to true
 * @param uId target uid
 */
export const findNotificationsUpdateSeen = async (uId: number) => {
  const notifications = await db.$transaction(async (tx) => {
    const userNots = await tx.notification.findMany({
      where: {
        targetId: uId,
        timeStamp: {
          gte: dayjs().subtract(30, 'day').toDate(),
        },
      },
      orderBy: [
        {
          seen: 'asc',
        },
        {
          timeStamp: 'desc',
        },
      ],
      include: {
        event: {
          include: {
            location: true,
          },
        },
        group: {
          select: {
            gId: true,
            name: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        host: {
          include: {
            account: true,
          },
        },
        target: true,
        user: {
          include: {
            account: true,
          },
        },
      },
    });
    const notIds = userNots.map((n) => n.ntId);
    await tx.notification.updateMany({
      where: { ntId: { in: notIds } },
      data: { seen: true },
    });
    return userNots;
  });
  return notifications;
};
