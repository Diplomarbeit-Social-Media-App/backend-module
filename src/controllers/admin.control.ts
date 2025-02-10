import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import { CONFLICT, OK } from 'http-status';
import { adminNotificationType, userNameType } from '../types/admin';
import { ApiError } from '../utils/apiError';
import assert from 'assert';

export const postSendNotification = catchAsync(
  async (
    req: Request<userNameType, object, adminNotificationType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { message, title } = req.body;
    const { userName } = req.params;
    const { aId } = await service.user.findUserByUserName(userName);
    const token = await service.token.findNotificationToken(aId);
    assert(token, new ApiError(CONFLICT, 'User besitzt keinen FCM-Token'));
    const success = await service.notification.sendMessage(
      token,
      title,
      message,
    );
    return res.status(OK).json({ success });
  },
);

export const postBroadcastNotification = catchAsync(
  async (
    req: Request<object, object, adminNotificationType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { title, message } = req.body;
    await service.notification.broadcastMessage(title, message);
    return res.status(OK).json({});
  },
);
