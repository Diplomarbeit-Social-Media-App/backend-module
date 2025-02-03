import { CONFLICT, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import {
  createGroupType,
  groupIdOnlyType,
  inviteAcceptType,
  inviteGroupType,
} from '../types/group';
import { Account } from '@prisma/client';
import service from '../services';
import { ApiError } from '../utils/apiError';
import assert from 'assert';

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

export const postInviteGroup = catchAsync(
  async (req: Request<object, object, inviteGroupType>, res, _next) => {
    const { gId, userName, hasAdminPermission } = req.body;
    const { aId, userName: ownUserName } = req.user as Account;

    const user = await service.user.findUserByAId(aId);
    const groups = await service.group.findGroupsAdministratedByUId(user.uId);

    assert(
      userName !== ownUserName,
      new ApiError(CONFLICT, 'Du kannst dich nicht selbst einladen'),
    );

    const found = groups.find((g) => g.gId == gId);
    assert(
      found,
      new ApiError(NOT_FOUND, `Du bist nicht der Besitzer einer Gruppe ${gId}`),
    );
    await service.group.inviteByUserName(gId, userName, hasAdminPermission);

    return res.status(OK).json({});
  },
);

export const putInviteAcceptGroup = catchAsync(
  async (req: Request<object, object, inviteAcceptType>, res, _next) => {
    const { accept, gId } = req.body;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const { isInvited, isMember } = await service.group.isInvitedOrMember(
      gId,
      uId,
    );
    assert(
      isInvited && !isMember,
      new ApiError(CONFLICT, 'Einladung bereits angenommen'),
    );
    if (!accept) await service.group.deleteInvitation(gId, uId);
    else await service.group.acceptInvitation(gId, uId);
    return res
      .status(OK)
      .json({ message: `Einladung ${accept ? 'angenommen' : 'abgelehnt'}` });
  },
);

export const getGroupData = catchAsync(
  async (req: Request<groupIdOnlyType>, res: Response, _next: NextFunction) => {
    const { gId } = req.params;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const isAssociatedWithGroup = await service.group.isInvitedOrMember(
      gId,
      uId,
    );
    assert(
      isAssociatedWithGroup,
      new ApiError(UNAUTHORIZED, 'Kein Mitglied der Gruppe'),
    );
    const group = await service.group.loadAllData(gId);
    return res.status(OK).json(group);
  },
);

export const deleteGroup = catchAsync(
  async (req: Request<groupIdOnlyType>, res: Response, _next: NextFunction) => {
    const { gId } = req.params;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);

    const groupExists = await service.group.checkGroupExists(gId);
    assert(groupExists, new ApiError(NOT_FOUND, 'Gruppe existiert nicht'));
    const groupsAdministratedBy =
      await service.group.findGroupsAdministratedByUId(uId);
    console.log(groupsAdministratedBy);
    const hasAdminRights = groupsAdministratedBy.some((g) => g.gId === gId);
    assert(hasAdminRights, new ApiError(UNAUTHORIZED, 'Kein Admin der Gruppe'));

    await service.group.deleteGroup(gId);

    return res.status(OK).json({ message: 'Gruppe gelöscht' });
  },
);
