import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import {
  APP_NOTIFICATION_TYPE,
  postNotificationType,
} from '../types/notification';
import { Account } from '@prisma/client';
import service from '../services';
import { OK } from 'http-status';
import { omit, pick } from 'lodash';

export const postNotificationToken = catchAsync(
  async (
    req: Request<object, object, postNotificationType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { token } = req.body;
    const { aId } = req.user as Account;
    await service.token.updateNotificationToken(aId, token);
    return res.status(OK).json({});
  },
);

export const getNotifications = catchAsync(async (req, res, _next) => {
  const { aId } = req.user as Account;
  const { uId } = await service.user.findUserByAId(aId);

  const notifications =
    await service.notification.findNotificationsUpdateSeen(uId);

  // map to different types of app notifications
  const baseInformation = ['ntId', 'timeStamp', 'seen', 'type'];
  const userInformation = ['uId', 'aId', 'account.userName'];
  const hostInformation = ['hId', 'aId', 'companyName', 'account.userName'];
  const groupInformation = ['_count.members', 'gId', 'name'];
  const eventInformation = [
    'eId',
    'name',
    'startDate',
    'description',
    'location.postCode',
    'location.city',
  ];

  const mapped = notifications.map((n) => ({
    base: pick(n, baseInformation),
    user: pick(n.user, userInformation),
    event: pick(n.event, eventInformation),
    host: pick(n.host, hostInformation),
    group: pick(n.group, groupInformation),
  }));

  const accountMapper = (data: {
    account?: { userName?: string };
  }): object => ({
    ...omit(data, 'account'),
    userName: data?.account?.userName,
  });

  const locationMapper = (data: {
    location?: { city?: string; postCode?: string };
  }): object => ({
    ...omit(data, 'location'),
    city: data.location?.city,
    postCode: data.location?.postCode,
  });

  const friendNots = mapped
    .filter(
      (m) =>
        m.base.type === APP_NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPTED ||
        m.base.type === APP_NOTIFICATION_TYPE.FRIEND_REQUEST_RECEIVED,
    )
    .map((m) => ({ ...m.base, ...m.user }))
    .map(accountMapper);

  const eventNots = mapped
    .filter((m) => m.base.type === APP_NOTIFICATION_TYPE.EVENT_PUBLICATION)
    .map((m) => ({ ...m.base, ...m.event, ...m.host }))
    .map(locationMapper)
    .map(accountMapper);

  const groupNots = mapped
    .filter((m) => m.base.type === APP_NOTIFICATION_TYPE.GROUP_INVITATION)
    .map((m) => ({ ...m.base, ...m.group, ...m.user }))
    .map((m) => ({ ...omit(m, '_count'), memberCount: m._count?.members }))
    .map(accountMapper);

  return res.status(OK).json({ friendNots, eventNots, groupNots });
});
