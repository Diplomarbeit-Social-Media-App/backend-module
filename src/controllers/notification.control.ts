import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { postNotificationType } from '../types/notification';
import { Account } from '@prisma/client';
import service from '../services';
import { TOKEN_TYPES } from '../types/token';
import dayjs from 'dayjs';
import { OK } from 'http-status';

const FCM_TOKEN_EXP_DAYS = 270;

export const postNotificationToken = catchAsync(
  async (
    req: Request<object, object, postNotificationType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { token } = req.body;
    const { aId } = req.user as Account;
    const foundToken = await service.token.findNotificationToken(aId);
    if (foundToken != null)
      await service.token.deleteTokensOfType(aId, TOKEN_TYPES.NOTIFICATION);
    await service.token.createToken(
      aId,
      dayjs().add(FCM_TOKEN_EXP_DAYS, 'day').toDate(),
      dayjs().toDate(),
      token,
      TOKEN_TYPES.NOTIFICATION,
    );
    return res.status(OK).json({});
  },
);
