import logger from '../logger';
import service from '../services';
import * as appNotifications from './app.notification';
import * as pushNotifications from './push.notification';

export enum GENERIC_NOT_EVENT {
  GROUP_MESSAGE = 'group_message',
  GROUP_INVITATION = 'group_invitation',
  FRIEND_REQ_RECEIVED = 'friend_req_received',
  FRIEND_REQ_ACCEPTED = 'friend_req_accepted',
  EVENT_PUBLISHED = 'event_published',
  CUSTOM_PUSH = 'custom_push',
}

import { EventEmitter } from 'events';

const emitter = new EventEmitter();
const event = GENERIC_NOT_EVENT;

emitter.on(event.GROUP_MESSAGE, () => {});
emitter.on(event.GROUP_INVITATION, () => {});
emitter.on(event.FRIEND_REQ_RECEIVED, async (frId: number) => {
  const req = await service.abo.findFriendRequestByFRId(frId);
  if (!req) return;

  const target = req.toUser;
  const origin = req.fromUser;

  appNotifications.sendAboReceiveNotification(target.uId, origin.uId);
});

emitter.on(
  event.FRIEND_REQ_ACCEPTED,
  async (acceptorUId: number, senderUId: number) => {
    try {
      const friends = await service.friend.findFriendshipByUIds(
        acceptorUId,
        senderUId,
      );
      const tokenUId = friends.userId;
      const token = await service.token.findNotificationTokenByUId(tokenUId);
      if (!token?.token)
        return logger.warn(
          'Could not send accepted friend req bc token is missing',
        );
      await pushNotifications.sendNotification(
        'Freundschaft akzeptiert',
        `${friends.friend.account.userName} hat deine Freundschaftsanfrage angenommen`,
        token.token,
      );
      appNotifications.sendAboAcceptNotification(
        friends.userId,
        friends.friendId,
      );
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

emitter.on(event.EVENT_PUBLISHED, async (hId: number, eventName: string) => {
  try {
    const host = await service.host.findHostFollowers(hId);
    console.table(host.followedBy);
    const fcmTokens =
      host.followedBy?.flatMap((user) =>
        user.account.token
          .map((t) => t.token)
          .map((t) => {
            console.log(t);
            return t;
          })
          .filter((token) => token.length > 0)
          .filter((token) => token !== ''),
      ) || [];

    if (fcmTokens.length <= 0) return;
    pushNotifications.sendNotifications(
      'Neues Event',
      `${eventName} wurde gerade veröffentlicht`,
      ...fcmTokens,
    );
  } catch (e) {
    logger.error((e as Error).message);
  }
});

emitter.on(
  event.CUSTOM_PUSH,
  (title: string, body: string, ...tokens: string[]) =>
    pushNotifications.sendNotifications(title, body, ...tokens),
);

export default emitter;
