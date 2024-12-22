import { NextFunction, Request, Response } from 'express';
import {
  loginSchema,
  passwordResetSchema,
  putPictureType,
  renewTokenSchema,
  signUpSchema,
} from '../../types/auth';
import catchAsync from '../../utils/catchAsync';
import service from '../../services/index';
import config from '../../config/config';
import { assert } from 'console';
import lodash from 'lodash';
import { Account, User } from '@prisma/client';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from 'http-status';
import { ApiError } from '../../utils/apiError';

export const putProfilePicture = catchAsync(
  async (
    req: Request<object, object, putPictureType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { picture } = req.body;
    const { aId } = req.user as Account;
    const updated = await service.account.updateProfilePicture(aId, picture);
    const status = updated ? OK : INTERNAL_SERVER_ERROR;
    return res.status(status).json({});
  },
);

export const postLogout = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as User;
    await service.auth.handleLogout(user.aId);
    return res.status(200).json({});
  },
);

export const getProfileDetails = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as Account;
    const pickedData = lodash.pick(user, [
      'aId',
      'firstName',
      'lastName',
      'email',
      'picture',
      'dateOfBirth',
      'disabled',
    ]);
    const { received, sent } = await service.abo.loadAllReqWithUser(user.aId);
    return res
      .status(200)
      .json({ ...pickedData, aboRequests: { received, sent } });
  },
);

export const postRequestResetPwdToken = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userName } = req.params;
    assert(userName != null, 'Username wurde nicht mitgegeben');
    await service.auth.handleRequestPwdResetToken(userName);
    return res.status(200).json({ message: 'Token per Mail versendet' });
  },
);

export const postResetPassword = catchAsync(
  async (
    req: Request<object, object, passwordResetSchema>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { token, userName, updatedPassword } = req.body;

    const hashed = await service.auth.hashPassword(
      updatedPassword,
      config.SALT,
    );
    await service.auth.updatePassword(token, userName, hashed);
    return res.status(200).json({ message: 'Passwort wurde aktualisiert' });
  },
);

export const postRenewToken = catchAsync(
  async (req: Request<object, object, renewTokenSchema>, res: Response) => {
    const { refresh } = req.body;

    const tokens = await service.auth.handleRenewToken(refresh);

    return res.status(200).json(tokens);
  },
);

export const postLogin = catchAsync(
  async (req: Request<object, object, loginSchema>, res: Response) => {
    const data = req.body;
    const foundUser = await service.user.findUser(data.userName, data.password);

    const { access, refresh } = await service.auth.generateAndSaveTokens(
      foundUser.aId,
    );

    return res.status(200).json({ access, refresh });
  },
);

export const postSignUp = catchAsync(
  async (req: Request<object, object, signUpSchema>, res: Response) => {
    const data = req.body;
    const hashedPwd = await service.auth.hashPassword(
      data.password,
      config.SALT,
    );
    data.password = hashedPwd;
    const { aId } = await service.auth.createAccount(data);

    if (data.isUserAccount) await service.user.createUserByAccount(aId);
    else {
      assert(
        data.companyDetails != null,
        new ApiError(
          BAD_REQUEST,
          'Company-Details dürfen bei einem Host-Account nicht fehlen',
        ),
      );
      await service.host.createHostByAccount(
        aId,
        data.companyDetails!.companyName,
      );
    }

    const { refresh, access } = await service.auth.generateAndSaveTokens(aId);

    return res.status(201).json({ access, refresh });
  },
);
