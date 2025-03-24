import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import catchAsync from '../utils/catchAsync';
import { UNAUTHORIZED } from 'http-status';
import service from '../services';
import { Account } from '@prisma/client';
import assert from 'assert';
import { auth } from './auth';

const unauthHostError = new ApiError(
  UNAUTHORIZED,
  'Du musst dich als Partner bewerben, um dies machen zu dürfen!',
);

const unauthActivatedError = new ApiError(
  UNAUTHORIZED,
  'Bitte aktiviere deinen Account zuerst',
);

const unauthBlockedError = new ApiError(
  UNAUTHORIZED,
  'Dein Account wurde gesperrt!',
);

export const hasActivatedAccount = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { activated } = req.user as Account;
    assert(activated, unauthActivatedError);
    return next();
  },
);

export const hasBlockedAccount = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { disabled } = req.user as Account;
    assert(!disabled, unauthBlockedError);
    return next();
  },
);

export const hasHostPermission = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) throw unauthHostError;
    const isHost = await service.account.isHostAccount(user);
    if (!isHost) throw unauthHostError;
    return next();
  },
);

const hasAdminPermission = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { aId } = req.user as Account;
    const admin = await service.admin.findAdminProfileByAId(aId);
    assert(admin, new ApiError(UNAUTHORIZED, 'Unzureichend Rechte'));
    next();
  },
);

export const hasValidAccount = [auth, hasActivatedAccount, hasBlockedAccount];

export const isAdmin = [...hasValidAccount, hasAdminPermission];
