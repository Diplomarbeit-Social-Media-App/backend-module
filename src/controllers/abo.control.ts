import { NextFunction, Request, Response } from 'express';
import {
  deleteAboType,
  getForeignProfileType,
  postAboType,
  requestStateType,
  searchType,
} from '../types/abo';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import { Account } from '@prisma/client';
import { CONFLICT, CREATED, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status';
import assert from 'assert';
import { ApiError } from '../utils/apiError';

export const getSuggestions = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    const userSuggestions = await service.abo.findUniqueUserSuggestions(user);
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
    const { frId, accept } = req.body;
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
    await service.abo.modifyRequest(aboRequest, accept);
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
  const { aId } = req.user as Account;
  const { uId } = await service.user.findUserByAId(aId);
  const aboRequests = await service.abo.loadOpenAboRequests(uId);
  return res.status(200).json(aboRequests);
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

export const getForeignProfile = catchAsync(
  async (
    req: Request<getForeignProfileType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { uId } = req.params;
    const { aId } = req.user as Account;

    const foreignUser = await service.user.findUserByUId(uId);
    const requestingUser = await service.user.findUserByAId(aId);
    const [fuId, ruId] = [foreignUser.uId, requestingUser.uId];

    assert(fuId !== ruId, new ApiError(CONFLICT, 'Dein eigenes Profil'));

    const publicInformation = await service.user.getUserPublicInformation(uId);

    const isFriendedWith = await service.abo.isFriendedWith(fuId, ruId);

    const followerCount = (await service.abo.loadFriendships(uId))?.length ?? 0;

    const openAboReq = await service.abo.hasSentRequestToUser(ruId, fuId);

    const mutualFriends = await service.abo.findMutualFriends(fuId, ruId);
    const mutualHosts = await service.host.findMutualHosts(fuId, ruId);

    // let allContacts: null | unknown[] = null;
    let participatingEvents: null | unknown[] = null;
    let nonMutualContacts: null | unknown[] = [];

    const events = await service.event.findEventsPartUser(uId);
    const eventCount = events.length;

    if (isFriendedWith) {
      participatingEvents = [...events];
      const nonMutFriends = await service.friend.findNonMutualFriendIds(
        fuId,
        ruId,
      );
      const nonMutHosts = await service.host.findNonMutualHostFollowings(
        fuId,
        ruId,
      );
      nonMutualContacts = [...nonMutFriends, ...nonMutHosts];
    }

    return res.status(OK).json({
      uId: fuId,
      ...publicInformation,
      isFriendedWith,
      hasPendingAboReq: openAboReq,
      followerCount,
      eventCount,
      mutualContacts: [...mutualFriends, ...mutualHosts],
      nonMutualContacts,
      participatingEvents,
    });
  },
);

export const deleteAbo = catchAsync(
  async (req: Request<deleteAboType>, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const { uId } = req.params;

    const user = await service.user.findUserByAId(aId);

    const isFriendedWith = await service.abo.isFriendedWith(uId, user.uId);
    const hasPendingReq = await service.abo.hasSentRequestToUser(user.uId, uId);

    assert(
      isFriendedWith || hasPendingReq,
      new ApiError(CONFLICT, 'Keine Anfrage oder Freundschaft'),
    );

    if (isFriendedWith) await service.abo.deleteFriendship(user.uId, uId);
    if (hasPendingReq) {
      const requests = await service.abo.loadAllReqWithUser(aId);
      const found = requests.sent?.find((r) => r.toUserId === uId);
      assert(
        found,
        new ApiError(NOT_FOUND, 'Anfrage konnte nicht gefunden werden'),
      );
      await service.abo.deleteAboRequest(found.frId);
    }

    return res.status(OK).json({});
  },
);
