import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { healthCheck } from '../services/health.service';
import httpStatus, { INTERNAL_SERVER_ERROR, OK } from 'http-status';

export const getHealthCheck = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const isDbHealth = !!(await healthCheck());
    const code = !isDbHealth ? INTERNAL_SERVER_ERROR : OK;
    const message = httpStatus[code];
    return res.status(code).json({ message, healthy: isDbHealth });
  },
);
