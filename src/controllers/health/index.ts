import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { healthCheck } from "../../services/health";
import httpStatus, { INTERNAL_SERVER_ERROR, OK } from "http-status";

export const getHealthCheck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isDbHealth = !!(await healthCheck());
    const code = !isDbHealth ? INTERNAL_SERVER_ERROR : OK;
    const message = httpStatus[code];
    return res.status(code).json({ message, healthy: isDbHealth });
  }
);
