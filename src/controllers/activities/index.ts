import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { CREATED, OK } from 'http-status';
import { createActivityType } from '../../types/activity';
import { Account } from '@prisma/client';

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
