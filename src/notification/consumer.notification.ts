import { EventEmitter } from 'events';
import { GENERIC_NOT_EVENT } from '.';
import logger from '../logger';
import service from '../services';

const consumer = new EventEmitter();

consumer.on(
  GENERIC_NOT_EVENT.GROUP_INVITATION,
  async (gId: number, uId: number, accepted: boolean) => {
    try {
      const not = await service.notification.findGroupInviteNotification(
        gId,
        uId,
      );
      await service.notification.updateConsumed(not.ntId, accepted);
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

consumer.on(
  GENERIC_NOT_EVENT.FRIEND_REQ_RECEIVED,
  async (ntId: number, accept?: boolean) => {
    try {
      await service.notification.updateConsumed(ntId, accept);
    } catch (e) {
      logger.error((e as Error).message);
    }
  },
);

export default consumer;
