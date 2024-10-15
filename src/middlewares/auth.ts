import {
  Strategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from "passport-jwt";
import passport, { DoneCallback } from "passport";
import { TOKEN_TYPES, tokenSchema } from "../types/token-types";
import { ApiError } from "@utils/api-error-util";
import httpStatus from "http-status";
import * as accountService from "@services/account";
import { NextFunction, Request, Response } from "express";
import config from "@config/config";

const jwtOptions: StrategyOptionsWithoutRequest = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verifyJwt = async (payload: tokenSchema, done: DoneCallback) => {
  try {
    if (payload.type !== TOKEN_TYPES.ACCESS)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token must be an access token!",
        false
      );

    const account = await accountService.findAccountByPk(payload.sub);
    done(false, account);
  } catch (e) {
    done(e, false);
  }
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate("jwt", { session: false }, () => {})(req, res, next);
  });
};

const JwtStrategy = new Strategy(jwtOptions, verifyJwt);

export default JwtStrategy;
