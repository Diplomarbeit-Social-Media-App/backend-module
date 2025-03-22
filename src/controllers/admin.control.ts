import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import { CONFLICT, OK } from 'http-status';
import { adminNotificationType, aIdType, userNameType } from '../types/admin';
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

export const getUsers = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const getUsers = await service.admin.getUsersByFormat();

    return res.status(OK).json(getUsers);
  },
);

export const deleteAccountByAId = catchAsync(
  async (req: Request<aIdType>, res: Response, _next: NextFunction) => {
    const { aId } = req.params;
    const { email } = await service.account.findAccountByPk(aId);
    await service.auth.deleteAccount(aId);
    await service.mail.sendAccountDeletionByAdmin(email);

    return res.status(OK).json({});
  },
);

export const putToggleBanAccount = catchAsync(
  async (req: Request<aIdType>, res: Response, _next: NextFunction) => {
    const { aId } = req.params;
    const { disabled, email } = await service.account.findAccountByPk(aId);
    await service.account.disableAccount(aId, !disabled);
    await service.mail.sendAccountDisabledByAdmin(email);

    return res.status(OK).json({});
  },
);

export const putVerifyAccount = catchAsync(
  async (req: Request<aIdType>, res: Response, _next: NextFunction) => {
    const { aId } = req.params;
    const host = await service.host.findHostByAId(aId);

    assert(
      !host.verified,
      new ApiError(CONFLICT, 'Account bereits verifiziert'),
    );

    await service.host.verifyAccountByHId(host.hId);

    return res.status(OK).json({});
  },
);
