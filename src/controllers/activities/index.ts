import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { OK } from 'http-status';

export const getAllActivities = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const activities = await service.activity.getAllActivities();
    return res.status(OK).json({ activities });
  },
);
