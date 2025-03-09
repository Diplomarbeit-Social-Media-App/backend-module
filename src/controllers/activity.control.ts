import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import { CONFLICT, CREATED, NOT_FOUND, OK } from 'http-status';
import {
  createActivityType,
  deleteActivityType,
  participationType,
} from '../types/activity';
import { Account } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import assert from 'assert';

export const getTrendingActivities = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    await service.user.findUserByAId(aId);
    const loaded = await service.activity.findTrendingActivities();
    return res.status(OK).json(loaded);
  },
);

export const postCreateActivity = catchAsync(
  async (
    req: Request<object, object, createActivityType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { aId } = req.user as Account;
    const host = await service.host.findHostByAId(aId);
    const activity = await service.activity.createActivity(req.body, host.hId);
    return res.status(CREATED).json(activity);
  },
);

export const deleteActivity = catchAsync(
  async (
    req: Request<deleteActivityType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const acId = req.params.aId;
    const { aId } = req.user as Account;
    const { hId } = await service.host.findHostByAId(aId);

    const deletion = await service.activity.deleteActivityByAcId(acId, hId);
    const result =
      deletion.count > 0
        ? { status: OK, message: 'Aktivität gelöscht' }
        : {
            status: CONFLICT,
            message: 'Aktivität konnte nicht gelöscht werden',
          };

    return res.status(result.status).json({ message: result.message });
  },
);

export const postParticipateActivity = catchAsync(
  async (req: Request<object, object, participationType>, res, _next) => {
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const { acId, attendance, date } = req.body;

    const activity = await service.activity.findActivityByAcId(acId);
    assert(activity, new ApiError(NOT_FOUND, 'Aktivität nicht gefunden'));

    await service.activity.participateActivity(acId, uId, date, attendance);

    return res.status(OK).json({});
  },
);
