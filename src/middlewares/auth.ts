import {
  Strategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import passport, { DoneCallback } from 'passport';
import { TOKEN_TYPES, tokenSchema } from '../types/token';
import { ApiError } from '../utils/apiError';
import httpStatus, { UNAUTHORIZED } from 'http-status';
import * as accountService from '../services/account';
import { NextFunction, Request, Response } from 'express';
import config from '../config/config';

const jwtOptions: StrategyOptionsWithoutRequest = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const verifyAccessToken = async (payload: tokenSchema, done: DoneCallback) => {
  try {
    if (payload.type !== TOKEN_TYPES.ACCESS)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Token must be an access token!',
        false,
      );
    const account = await accountService.findAccountByPk(payload.sub);
    done(null, account);
  } catch (e) {
    done(e, null);
  }
};

const verifyAuth =
  (
    req: Request,
    resolve: (value: unknown) => void,
    reject: (value: unknown) => void,
  ) =>
  (err: Error, user: unknown, info: unknown) => {
    if (err || !user || info)
      reject(new ApiError(UNAUTHORIZED, 'Bitte logge dich erneut ein!'));
    req.user = user!;
    resolve(user);
  };

export const auth = async (req: Request, res: Response, next: NextFunction) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyAuth(req, resolve, reject),
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) =>
      next(
        new ApiError(UNAUTHORIZED, `Anmeldung fehlgeschlagen! ${err.message}`),
      ),
    );

const JwtStrategy = new Strategy(jwtOptions, verifyAccessToken);

export default JwtStrategy;
