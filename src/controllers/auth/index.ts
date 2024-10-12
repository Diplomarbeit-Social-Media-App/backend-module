import { NextFunction, Request, Response } from "express";
import { loginSchema, signUpSchema } from "../../types/auth-types";
import catchAsync from "@utils/catch-async-util";
import * as authService from "@services/auth-services";
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
    const data = req.body;

    const hashedPwd = await authService.hashPassword(
      data.password,
      config.SALT
    );
    data.password = hashedPwd;

    const account = await authService.createAccount(data);

    
  }
);
