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

emitter.on(
  event.GROUP_MESSAGE,
  async (gId: number, userName: number, uId: number) => {
    try {
      const members = await service.group.findMembersOfGroup(gId);
      const filtered = members?.filter((m) => m.uId !== uId);
      const fcmTokens = filtered
        .flatMap((v) => v.account.token)
        .filter((t) => t?.token !== null)
        .map((t) => t.token);
      if (fcmTokens.length === 0) return;
      await pushNotifications.sendNotifications(
        'Neue Nachricht',
        `${userName} hat eine Nachricht gesendet`,
        true,
        ...fcmTokens,
      );
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

emitter.on(
  event.GROUP_INVITATION,
  async (gId: number, targetUId: number, originUId: number) => {
    try {
      const group = await service.group.loadAllData(gId);
      const { name } = group;

      const fcmToken =
        await service.token.findNotificationTokenByUId(targetUId);
      await appNotifications.sendGroupInvitationNotification(
        targetUId,
        gId,
        originUId,
      );

      if (!fcmToken?.token) return;
      await pushNotifications.sendNotification(
        'Gruppeneinladung',
        `Du hast eine Einladung für die Gruppe ${name} erhalten`,
        false,
        fcmToken.token,
      );
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

emitter.on(event.FRIEND_REQ_RECEIVED, async (frId: number) => {
  try {
    const req = await service.abo.findFriendRequestByFRId(frId);
    if (!req) return;

    const target = req.toUser;
    const origin = req.fromUser;

    const fcmToken = await service.token.findNotificationTokenByUId(target.uId);

    appNotifications.sendAboReceiveNotification(target.uId, origin.uId, frId);

    if (!fcmToken?.token) return;

    await pushNotifications.sendNotification(
      'Freundschaftsanfrage',
      `Du hast eine Freundschaftsanfrage von ${origin.account.userName} bekommen`,
      false,
      fcmToken.token,
    );
  } catch (e) {
    logger.error((e as Error).message);
  }
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

      appNotifications.sendAboAcceptNotification(
        friends.userId,
        friends.friendId,
      );

      if (!token?.token)
        return logger.warn(
          'Could not send accepted friend req bc token is missing',
        );
      await pushNotifications.sendNotification(
        'Freundschaft akzeptiert',
        `${friends.friend.account.userName} hat deine Freundschaftsanfrage angenommen`,
        false,
        token.token,
      );
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

emitter.on(
  event.EVENT_PUBLISHED,
  async (eId: number, hId: number, eventName: string) => {
    try {
      const host = await service.host.findHostFollowers(hId);

      await appNotifications.sendEventPublishedNotification(eId);

      const fcmTokens =
        host.followedBy?.flatMap((user) =>
          user.account.token
            .map((t) => t.token)
            .filter((token) => token.length > 0)
            .filter((token) => token !== ''),
        ) || [];

      if (fcmTokens.length <= 0) return;
      await pushNotifications.sendNotifications(
        'Neues Event',
        `${eventName} wurde gerade veröffentlicht`,
        false,
        ...fcmTokens,
      );
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

emitter.on(
  event.CUSTOM_PUSH,
  (title: string, body: string, ...tokens: string[]) =>
    pushNotifications.sendNotifications(title, body, false, ...tokens),
);

export default emitter;
