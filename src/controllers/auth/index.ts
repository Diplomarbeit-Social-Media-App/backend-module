import { NextFunction, Request, Response } from "express";
import { loginSchema, signUpSchema } from "../../types/auth-types";
import catchAsync from "@utils/catch-async-util";
import service from "@services/index";
import config from "@config/config";

export const postLogin = catchAsync(
  async (
    req: Request<{}, {}, loginSchema>,
    res: Response,
    _next: NextFunction
  ) => {}
);

export const postSignUp = catchAsync(
  async (
    req: Request<{}, {}, signUpSchema>,
    res: Response,
    next: NextFunction
  ) => {
    let data = req.body;
    const hashedPwd = await service.auth.hashPassword(
      data.password,
      config.SALT
    );
    data.password = hashedPwd;
    const account = await service.auth.createAccount(data);

    const { user } = await service.user.createUserByAccount(account.aId);
  }
);
