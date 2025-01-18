import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import {
  hostDetailsType,
  hostRatingDeletionType,
  hostRatingType,
  hostSocialAddType,
  hostSocialDelType,
  hostSubscriptionType,
} from '../types/host';
import service from '../services';
import { CONFLICT, CREATED, NOT_FOUND, OK } from 'http-status';
import { Account } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import assert from 'assert';

export const deleteHostRating = catchAsync(
  async (
    req: Request<hostRatingDeletionType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { hId } = req.params;
    const { aId } = req.user as Account;
    // find uId -> check if user account available
    const user = await service.user.findUserByAId(aId);
    await service.host.deleteHostRating(hId, user.uId);
    return res.status(OK).json({});
  },
);

export const getHostDetails = catchAsync(
  async (req: Request<hostDetailsType>, res: Response, _next: NextFunction) => {
    const { userName } = req.params;
    const { userName: fromName } = req.user as Account;
    const hostDetails = await service.host.loadHostDetails(userName, fromName);
    return res.status(OK).json(hostDetails);
  },
);

export const postHostRating = catchAsync(
  async (
    req: Request<object, object, hostRatingType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { aId } = req.user as Account;
    const { hId, points, description } = req.body;
    // find uId -> check if user account available
    const user = await service.user.findUserByAId(aId);
    await service.host.createHostRating(hId, points, description, user.uId);
    return res.status(CREATED).json({});
  },
);

export const postAddSocial = catchAsync(
  async (
    req: Request<object, object, hostSocialAddType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { type, link } = req.body;
    const { aId } = req.user as Account;
    const host = await service.host.findHostByAId(aId);
    const hasSocialTypeAlready = host.SocialLinks.some(
      (social) => social.type == type,
    );
    assert(
      !hasSocialTypeAlready,
      new ApiError(CONFLICT, 'Bitte lösche zuerst den bestehenden Link'),
    );
    const createdLink = await service.host.createSocialLink(
      host.hId,
      type,
      link,
    );
    const links = [
      ...host.SocialLinks.map((social) => {
        return { type: social.type, link: social.link };
      }),
      createdLink,
    ];
    return res.status(CREATED).json({ links });
  },
);

export const deleteHostSocial = catchAsync(
  async (
    req: Request<hostSocialDelType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { type } = req.params;
    const { aId } = req.user as Account;
    const host = await service.host.findHostByAId(aId);
    const hasSocialType = host.SocialLinks.some(
      (social) => social.type == type,
    );
    assert(
      hasSocialType,
      new ApiError(NOT_FOUND, 'Dieser Link existiert nicht'),
    );
    await service.host.deleteSocialLink(host.hId, type);
    const links = [
      ...host.SocialLinks.filter((social) => social.type != type).map(
        (social) => {
          return { type: social.type, link: social.link };
        },
      ),
    ];
    return res.status(OK).json({ links });
  },
);

export const postSubscribeHost = catchAsync(
  async (
    req: Request<hostSubscriptionType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { hId } = req.params;
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    await service.host.subscribeHost(user, hId);
    return res.status(OK).json({});
  },
);

export const deleteSubscribeHost = catchAsync(
  async (
    req: Request<hostSubscriptionType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { hId } = req.params;
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    await service.host.unsubscribeHost(user, hId);
    return res.status(OK).json({});
  },
);
