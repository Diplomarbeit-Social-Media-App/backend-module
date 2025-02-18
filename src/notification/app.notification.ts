import { APP_NOTIFICATION_TYPE } from '../types/notification';
import db from '../utils/db';

// TODO: LINK Friend Request to table in order to auto delete when accepted/ declined?
export const sendAboReceiveNotification = (
  targetId: number,
  userId: number,
) => {
  db.notification.create({
    data: {
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED,
      targetId,
      userId,
    },
  });
};

export const sendAboAcceptNotification = (targetId: number, userId: number) => {
  db.notification.create({
    data: {
      type: APP_NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED,
      targetId,
      userId,
    },
  });
};
