import { NextFunction, Request, Response } from 'express';
import { ApiError } from './apiError';
import { INTERNAL_SERVER_ERROR } from 'http-status';

const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: Error) =>
      next(new ApiError(INTERNAL_SERVER_ERROR, err.message)),
    );
  };

export default catchAsync;
