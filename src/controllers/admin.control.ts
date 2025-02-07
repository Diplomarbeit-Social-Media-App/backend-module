import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import { OK } from 'http-status';
import { adminNotificationType } from '../types/admin';

export const postSendNotification = catchAsync(
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
