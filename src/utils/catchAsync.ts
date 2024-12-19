/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { ApiError } from './apiError';

const catchAsync =
  (fn: (req: Request<any>, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: Error) =>
      next(ApiError.fromError(err)),
    );
  };

export default catchAsync;
