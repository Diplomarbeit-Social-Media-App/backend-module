import { OK } from 'http-status';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import { createGroupType } from '../types/group';
import { Account } from '@prisma/client';
import service from '../services';

export const postCreateGroup = catchAsync(
  async (
    req: Request<object, object, createGroupType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { description, name, picture } = req.body;
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    const group = await service.group.createGroup(
      name,
      description,
      picture,
      user.uId,
    );
    return res.status(OK).json(group);
  },
);
