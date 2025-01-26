import { OK } from 'http-status';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';

export const postCreateGroup = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    return res.status(OK);
  },
);
