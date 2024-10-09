import { NextFunction, Request, Response } from "express";
import { loginSchema } from "../../types/auth-types";
import catchAsync from "../../utils/catch-async-util";

export const postLogin = catchAsync(
  async (
    req: Request<{}, {}, loginSchema>,
    res: Response,
    next: NextFunction
  ) => {
    const { password, userName } = req.body;
    const foundUsers = "aASd"; //asd;
    return res.json({ message: "Jello world" });
  }
);
