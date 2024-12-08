import { NextFunction, Request, Response } from 'express';
import { RateLimiterPostgres } from 'rate-limiter-flexible';
import db from '../utils/db';
import { ApiError } from '../utils/apiError';
import { TOO_MANY_REQUESTS } from 'http-status';

const bruteLimiter = new RateLimiterPostgres({
  storeClient: db,
  points: 10,
  duration: 60 * 10,
  blockDuration: 60 * 60 * 24,
  dbName: 'limiter',
});

const limitRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ipAddr = req.ip;
  const key = `${req.body.userName}-${ipAddr}`;
  const limit = await Promise.resolve(bruteLimiter.get(key));
  let retrySeconds = 0;
  if (limit && limit.consumedPoints >= 10) {
    retrySeconds = Math.floor(limit.msBeforeNext / 1000) || 1;
  }
  if (retrySeconds > 0) {
    res.set('Retry-After', String(retrySeconds));
    next(new ApiError(TOO_MANY_REQUESTS, 'Too many requests, cool down!'));
  }
  next();
};

export default limitRequests;
