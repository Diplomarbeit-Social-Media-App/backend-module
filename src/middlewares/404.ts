import httpStatus from "http-status";
import { ApiError } from "../utils/apiError";
import { NextFunction, Request, Response } from "express";

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  const statusCode = httpStatus.NOT_FOUND;
  return next(new ApiError(statusCode, httpStatus[statusCode], true));
};
