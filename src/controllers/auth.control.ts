import { NextFunction, Request, Response } from 'express';
import {
  activateTokenType,
  loginSchema,
  passwordResetSchema,
  putPictureType,
  renewTokenSchema,
  signUpSchema,
  updateAccountType,
} from '../types/auth';
import catchAsync from '../utils/catchAsync';
import service from '../services/index';
import config from '../config/config';
import lodash from 'lodash';
import { Account, User } from '@prisma/client';
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, OK } from 'http-status';
import { ApiError } from '../utils/apiError';
import assert from 'assert';
import dayjs from 'dayjs';

export const updateAccountData = catchAsync(
  async (
    req: Request<object, object, updateAccountType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { description, firstName, lastName, userName } = req.body;
    const { aId } = req.user as Account;
    const updatedAccount = await service.auth.updateAccountData(
      aId,
      firstName,
      lastName,
      userName,
      description,
    );
    return res.status(OK).json(updatedAccount);
  },
);

export const deleteAccount = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    await service.auth.deleteAccount(aId);
    return res.status(OK).json({});
  },
);

export const getVerifyAccount = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId, email, activated } = req.user as Account;
    assert(
      !activated,
      new ApiError(CONFLICT, 'Dein Account ist bereits aktiviert'),
    );
    const { otp } = await service.token.upsertActivationToken(aId);
    await service.mail.sendVerifyEmail(otp.toString(), email);
    return res.status(OK).json({ message: 'E-Mail versendet' });
  },
);

export const postVerifyAccount = catchAsync(
  async (
    req: Request<object, object, activateTokenType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { aId, activated } = req.user as Account;
    const { otp } = req.body;
    assert(
      !activated,
      new ApiError(CONFLICT, 'Dein Account ist bereits aktiviert'),
    );
    await service.auth.activateAccount(aId, otp);
    return res.status(OK).json({ message: 'Account wurde verifiziert' });
  },
);

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
    const account = req.user as Account;
    const user = await service.user.findUserByAId(account.aId);
    const pickedData = lodash.pick(account, [
      'aId',
      'firstName',
      'lastName',
      'email',
      'picture',
      'dateOfBirth',
      'disabled',
      'activated',
      'description',
      'loginOs',
      'userName',
    ]);
    const { received, sent } = await service.abo.loadAllReqWithUser(
      account.aId,
    );
    const friendships = await service.abo.loadFriendships(user.uId);
    const eventParticipationCount = await service.event.findEventCountByUser(
      user.uId,
    );
    return res.status(200).json({
      ...pickedData,
      aboRequests: { received, sent },
      friends: friendships,
      events: eventParticipationCount,
    });
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
    await service.auth.updateLoginOs(foundUser.aId, data.loginOs);

    return res.status(200).json({ access, refresh });
  },
);

export const postSignUp = catchAsync(
  async (req: Request<object, object, signUpSchema>, res: Response) => {
    const data = req.body;
    const foundAccount = await service.auth.findAccountByEmail(data.email);
    if (
      foundAccount &&
      !foundAccount.activated &&
      !foundAccount.disabled &&
      dayjs().isAfter(
        dayjs(foundAccount?.createdAt).add(
          config.ACTIVATION_EXP_MINUTES,
          'minute',
        ),
      )
    ) {
      await service.mail.sendAccountDeletionEmail(data.email);
      await service.auth.deleteAccount(foundAccount.aId);
    }
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

    const { otp } = await service.token.upsertActivationToken(aId);
    await service.mail.sendVerifyEmail(otp.toString(), data.email);

    return res.status(201).json({ access, refresh });
  },
);
