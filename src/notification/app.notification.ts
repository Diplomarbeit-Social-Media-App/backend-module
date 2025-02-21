import { APP_NOTIFICATION_TYPE } from '../types/notification';
import db from '../utils/db';

// TODO: LINK Friend Request to table in order to auto delete when accepted/ declined?
export const sendAboReceiveNotification = async (
  targetId: number,
  userId: number,
) => {
  await db.notification.create({
    data: {
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED,
      targetId,
      userId,
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
