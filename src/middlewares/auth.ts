import {
  Strategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from "passport-jwt";
import passport, { DoneCallback } from "passport";
import { TOKEN_TYPES, tokenSchema } from "../types/token";
import { ApiError } from "../utils/apiError";
import httpStatus, { UNAUTHORIZED } from "http-status";
import * as accountService from "../services/account";
import { NextFunction, Request, Response } from "express";
import config from "../config/config";

const jwtOptions: StrategyOptionsWithoutRequest = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verifyAccessToken = async (payload: tokenSchema, done: DoneCallback) => {
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

const verifyAuth =
  (req: Request, resolve: Function, reject: Function) =>
  (err: Error, user: unknown, info: unknown) => {
    if (err || !user || info)
      throw new ApiError(UNAUTHORIZED, "Bitte logge dich erneut ein!", true);
    req.user = user;
    resolve();
  };

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyAuth(req, resolve, reject)
    )(req, res, next);
  })
    .then(next)
    .catch((err) => next(err));
};

const JwtStrategy = new Strategy(jwtOptions, verifyAccessToken);

export default JwtStrategy;
