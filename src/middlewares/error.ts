import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';
import statusCode, { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status';
import config from '../config/config';
import type errorResFormat from '../types/error';
import { server } from '../index';
import db from '../utils/db';
import logger from '../logger';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

export const convertError = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let error: Error | ApiError = err;

  logger.debug(
    `Error handling middleware invoked: ${error.message.toString()}`,
  );

  if (err instanceof PrismaClientValidationError) {
    const validationError: PrismaClientValidationError = err;
    error = new ApiError(
      INTERNAL_SERVER_ERROR,
      validationError.message.toString(),
      true,
    );
  }

  if (err instanceof PrismaClientKnownRequestError) {
    const dbError: PrismaClientKnownRequestError = err;
    error = new ApiError(
      INTERNAL_SERVER_ERROR,
      'Error occurred with db transaction;' +
        ` code: ${dbError.code} | meta: ${dbError.meta} | message: ${dbError.message}`,
      true,
    );
  }

  if (err instanceof SyntaxError && 'body' in err) {
    error = new ApiError(BAD_REQUEST, 'Dein JSON ist nicht in Ordnung');
  }

  if (!(error instanceof ApiError)) {
    error = new ApiError(statusCode.INTERNAL_SERVER_ERROR, err.message, false);
  }

  next(error);
};

export const handleError = async (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!err.isOperational) {
    return await handleSevereErrors(err.message, err.stack);
  }
  if (res.headersSent) return;
  const errorFormat: errorResFormat = {
    error: true,
    message: err.message,
    name: err.name,
    statusCode: err.statusCode,
  };
  if (config.NODE_ENV === 'development') {
    errorFormat.stack = err.stack;
  }
  return res
    .status(err.statusCode || statusCode.INTERNAL_SERVER_ERROR)
    .json(errorFormat);
};

export const handleSevereErrors = async (e?: string, stack: string = '') => {
  logger.error(`An uncaught problem was encountered! Shutting down...`);
  logger.error(`Error stack: ` + stack);
  if (e) logger.error(`Error message: ${e}`);
  try {
    logger.error(`Closing db connection if open...`);
    await db.$disconnect();
  } catch {
    logger.error(`Uncaught problem encountered! Error disconnecting database`);
  }
  if (server)
    await Promise.resolve(
      new Promise((resolve, _reject) => server.close(resolve)),
    );
  logger.error('Exiting process...');
  process.exit(1);
};
