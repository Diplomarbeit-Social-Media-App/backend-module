import assert from 'assert';
import getFirebase from '../config/firebase';
import { ApiError } from '../utils/apiError';
import db from '../utils/db';
import { NOT_FOUND } from 'http-status';
import { TOKEN_TYPES } from '../types/token';

const messaging = getFirebase().messaging();

export const handleUserSubscription = async (uId: number) => {
  const user = await db.user.findUnique({
    where: {
      uId,
    },
    include: {
      account: {
        include: {
          token: true,
        },
      },
      joinedGroups: true,
      events: true,
    },
  });
  assert(user, new ApiError(NOT_FOUND, 'Kein User-Profil gefunden'));
  const token = user.account.token.find(
    (t) => t.type === TOKEN_TYPES.NOTIFICATION.toString(),
  );
  assert(token, new ApiError(NOT_FOUND, 'Kein Notification-Token present'));

  subscribeToGroups(token.token, user.joinedGroups);
};

const subscribeToGroups = (token: string, groups: { groupId: number }[]) => {
  groups.forEach(({ groupId }) =>
    messaging.subscribeToTopic(token, `g-${groupId}-all`),
  );
};
