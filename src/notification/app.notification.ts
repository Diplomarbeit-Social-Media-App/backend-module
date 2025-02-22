import { INTERNAL_SERVER_ERROR } from 'http-status';
import service from '../services';
import { APP_NOTIFICATION_TYPE } from '../types/notification';
import { ApiError } from '../utils/apiError';
import db from '../utils/db';
import assert from 'assert';

export const sendAboReceiveNotification = async (
  targetId: number,
  userId: number,
  frId: number,
) => {
  await db.notification.create({
    data: {
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED,
      targetId,
      userId,
      frId,
    },
  });
};

export const sendAboAcceptNotification = async (
  targetId: number,
  userId: number,
) => {
  await db.notification.create({
    data: {
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED,
      targetId,
      userId,
    },
  });
};

export const sendEventPublishedNotification = async (eId: number) => {
  const event = await service.event.findEventByEId(eId);
  assert(event, new ApiError(INTERNAL_SERVER_ERROR, 'Event not found'));

  const { followedBy } = await service.host.findFollowersByHId(event.creatorId);
  if (followedBy.length === 0) return;

  Promise.allSettled(
    followedBy.map(async (user) => {
      await db.notification.create({
        data: {
          eventId: eId,
          targetId: user.uId,
          hostId: event.creatorId,
          type: APP_NOTIFICATION_TYPE.EVENT_PUBLICATION,
        },
      });
    }),
  );
};

export const sendGroupInvitationNotification = async (
  targetId: number,
  groupId: number,
  userId: number,
) => {
  await db.notification.create({
    data: {
      groupId,
      targetId,
      userId,
      type: APP_NOTIFICATION_TYPE.GROUP_INVITATION,
    },
  });
};
