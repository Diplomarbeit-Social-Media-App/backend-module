import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import catchAsync from "../utils/catchAsync";
import { UNAUTHORIZED } from "http-status";
import service from "../services";

const unauthorizedError = new ApiError(
  UNAUTHORIZED,
  "Du musst dich als Partner bewerben, um dies machen zu dürfen!"
);

export const hasHostPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) throw unauthorizedError;
    const isHost = await service.account.isHostAccount(user);
    if (!isHost) throw unauthorizedError;
    return next();
  }
);

export const hasAdminPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    // TODO: implement admin permission
  }
);
