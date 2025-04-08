import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { ApiError } from '../utils/apiError';
import logger from '../logger';
import httpStatus from 'http-status';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (parsed.error) {
      const validationError = parsed.error.errors?.at(0)?.message;
      logger.debug(`Validation failed: ${validationError}`);
      return next(
        new ApiError(httpStatus.BAD_REQUEST, `${validationError}`, true),
      );
    }
    Object.assign(req, parsed.data);
    return next();
  };
