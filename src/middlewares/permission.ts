import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error-util";
import catchAsync from "../utils/catch-async-util";
import { UNAUTHORIZED } from "http-status";
import service from "../services";

export const hasHostPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user)
      throw new ApiError(UNAUTHORIZED, "You have to be authorized to do that!");
    const isHost = await service.account.isHostAccount(user);
    if (!isHost)
      throw new ApiError(
        UNAUTHORIZED,
        "You need to signup as an event host in order to get access to these features"
      );
    return next();
  }
);

export const hasAdminPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    // TODO: implement admin permission
  }
);
