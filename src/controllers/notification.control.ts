import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { postNotificationType } from '../types/notification';
import { Account } from '@prisma/client';
import service from '../services';
import { OK } from 'http-status';

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
