import { CONFLICT, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import {
  createGroupType,
  generalEditGroupType,
  groupIdOnlyType,
  inviteAcceptType,
  inviteGroupType,
} from '../types/group';
import { Account } from '@prisma/client';
import service from '../services';
import { ApiError } from '../utils/apiError';
import assert from 'assert';
import logger from '../logger';
import { omit } from 'lodash';

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

export const putEditGroup = catchAsync(
  async (
    req: Request<object, object, generalEditGroupType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { gId, description, picture, setAdmin, name } = req.body;
    const { aId, userName } = req.user as Account;
    const user = await service.user.findUserByAId(aId);

    const administratorGroups =
      await service.group.findGroupsAdministratedByUId(user.uId);
    logger.debug(
      `{GroupController | putEditGroup} - administration groups of user ${administratorGroups.toString()}`,
    );
    const isAdmin = administratorGroups.some((g) => g.gId === gId);
    assert(
      isAdmin,
      new ApiError(UNAUTHORIZED, 'Keine Berechtigung in dieser Gruppe'),
    );
    assert(
      userName !== setAdmin?.userName,
      new ApiError(CONFLICT, 'Bei eigenem Account nicht möglich'),
    );

    const edit: { name?: string; description?: string; picture?: string } = {};

    if (description) Object.assign(edit, { description });
    if (picture) Object.assign(edit, { picture });
    if (name) Object.assign(edit, { name });

    logger.debug(
      `{GroupController | putEditGroup} - Update obj ${JSON.stringify(edit)}`,
    );

    await service.group.editGroup(gId, edit, setAdmin);

    return res.status(OK).json({});
  },
);

export const getUserGroups = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);

    const raw = await service.group.findGroupsByUIdSimpleFormat(user.uId);
    const groups = raw.map((group) => {
      const member = group.members.at(0);
      assert(member, new ApiError(NOT_FOUND, 'Fehler beim Laden der Gruppen'));

      const { isAdmin, acceptedInvitation: hasAcceptedInvitation } = member;
      const members = group._count.members;
      return {
        ...omit(group, '_count', 'members'),
        members,
        isAdmin,
        hasAcceptedInvitation,
      };
    });

    return res.status(OK).json(groups);
  },
);

export const deleteLeaveGroup = catchAsync(
  async (req: Request<groupIdOnlyType>, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const { gId } = req.params;

    const group = await service.group.findGroupsByUId(uId);
    const foundGroup = group.find((g) => g.gId === gId);
    const memberOfGroup = foundGroup != null;

    assert(
      foundGroup && memberOfGroup,
      new ApiError(NOT_FOUND, 'Gruppe nicht gefunden'),
    );

    const { admins, nonAdmins } = await service.group.leaveGroup(uId, gId);
    if (admins + nonAdmins === 0) await service.group.deleteGroup(gId);
    if (admins === 0 && nonAdmins > 0)
      await service.group.assignRandomAdmin(gId);

    return res.status(OK).json({});
  },
);
