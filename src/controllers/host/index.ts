import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import {
  hostDetailsType,
  hostRatingDeletionType,
  hostRatingType,
} from '../../types/host';
import service from '../../services';
import { CREATED, OK } from 'http-status';
import { Account } from '@prisma/client';

export const deleteHostRating = catchAsync(
  async (
    req: Request<object, object, hostRatingDeletionType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { hId } = req.body;
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
