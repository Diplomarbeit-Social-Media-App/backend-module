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
      groups: true,
      events: true,
    },
  });
  assert(user, new ApiError(NOT_FOUND, 'Kein User-Profil gefunden'));
  const token = user.account.token.find(
    (t) => t.type === TOKEN_TYPES.NOTIFICATION.toString(),
  );
  assert(token, new ApiError(NOT_FOUND, 'Kein Notification-Token present'));

  handleGroupSubscription(token.token, uId);
};

const handleGroupSubscription = async (token: string, uId: number) => {
  const groupTopics = await db.notificationGroupTopic.findMany({
    where: {
      uId,
    },
    select: {
      topic: true,
    },
  });
  await Promise.allSettled(
    groupTopics.map(({ topic }) => messaging.subscribeToTopic(token, topic)),
  );
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
