import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { CREATED, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status';
import { createActivityType, deleteActivityType } from '../../types/activity';
import { Account } from '@prisma/client';
import assert from 'assert';
import { ApiError } from '../../utils/apiError';

export const getAllActivities = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const activities = await service.activity.getAllActivities();
    return res.status(OK).json({ activities });
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
    return res.status(CREATED).json({ activity });
  },
);

export const deleteActivity = catchAsync(
  async (
    req: Request<deleteActivityType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const activityId = req.params.aId;
    const { aId } = req.user as Account;
    const host = await service.host.findHostByAId(aId);
    const activity = await service.activity.findActivityByAId(activityId);
    assert(
      activity != null,
      new ApiError(NOT_FOUND, 'Aktivität nicht gefunden'),
    );
    assert(
      host.hId == activity?.creatorId,
      new ApiError(UNAUTHORIZED, 'Nicht deine Aktivität'),
    );
    await service.activity.deleteActivityByAId(activityId);
    return res.status(OK).json({});
  },
);
