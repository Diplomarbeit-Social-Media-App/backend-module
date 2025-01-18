import { NextFunction, Request, Response } from 'express';
import {
  ABO_FILTER_SCHEMA,
  postAboType,
  requestStateType,
  searchType,
} from '../types/abo';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import { Account } from '@prisma/client';
import { CONFLICT, CREATED, OK, UNAUTHORIZED } from 'http-status';
import assert from 'assert';
import { ApiError } from '../utils/apiError';

export const getSuggestions = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    const userSuggestions = await service.abo.findUserSuggestions(user);
    const hostSuggestions = await service.abo.findHostSuggestions(user);
    return res
      .status(OK)
      .json({ suggestions: [...userSuggestions, ...hostSuggestions] });
  },
);

export const putRequestState = catchAsync(
  async (
    req: Request<object, object, requestStateType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { frId, state } = req.body;
    const { aId } = req.user as Account;
    const aboRequest = await service.abo.loadRequestById(frId);
    const { fromUser, toUser } = aboRequest;
    assert(
      toUser.aId == aId,
      new ApiError(UNAUTHORIZED, 'Nicht deine Anfrage'),
    );
    const isFriendedAlready = await service.abo.isFriendedWith(
      fromUser.uId,
      toUser.uId,
    );
    assert(
      !isFriendedAlready,
      new ApiError(CONFLICT, 'Ihr seid bereits befreundet'),
    );
    await service.abo.modifyRequest(aboRequest, state);
    return res.status(OK).json({});
  },
);

export const getSearchByUserName = catchAsync(
  async (req: Request<searchType>, res, _next) => {
    const { userName } = req.params;
    const found = await service.abo.searchByUserName(userName);
    return res.status(OK).json(found);
  },
);

export const getAboRequests = catchAsync(async (req: Request, res, _next) => {
  const { filter } = req.params;
  const { aId } = req.user as Account;
  const aboRequests = await service.abo.loadAboRequests(
    filter as unknown as ABO_FILTER_SCHEMA,
    aId,
  );
  return res.status(200).json({ requests: aboRequests });
});

/**
 * Should check if userName is
 * - assigned
 * - not the same user as the requests comes from
 * - req. user has user account
 * - not already friended with user
 * - does not have a open/closed/declined request to this user
 */
export const postAboRequests = catchAsync(
  async (req: Request<object, object, postAboType>, res, _next) => {
    const { userName } = req.body;
    const { aId } = req.user as Account;

    const user = await service.user.findUserByAId(aId);
    await service.abo.sendAboRequest(user, userName);
    return res.status(CREATED).json({});
  },
);
