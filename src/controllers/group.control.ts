import {
  CONFLICT,
  CREATED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from 'http-status';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import {
  attachPublicEventType,
  createGroupType,
  generalEditGroupType,
  groupIdOnlyType,
  inviteAcceptType,
  inviteGroupType,
  kickUserGroupType,
  participateAttachedEventType,
} from '../types/group';
import { Account } from '@prisma/client';
import service from '../services';
import { ApiError } from '../utils/apiError';
import assert from 'assert';
import logger from '../logger';
import notification, { GENERIC_NOT_EVENT } from '../notification';
import { omit } from 'lodash';
import dayjs from 'dayjs';
import consumer from '../notification/consumer.notification';

export const postCreateGroup = catchAsync(
  async (
    req: Request<object, object, createGroupType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { description, name, picture, invitations } = req.body;
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    const group = await service.group.createGroup(
      name,
      description,
      picture,
      user.uId,
    );
    if (invitations && invitations?.length > 0) {
      const statistic = await Promise.allSettled(
        invitations.map(
          async (invite) =>
            await service.group.inviteByUserName(group.gId, invite, false),
        ),
      );
      const { fulfilled, rejected } = statistic.reduce(
        (acc, result) => {
          if (result.status === 'fulfilled') acc.fulfilled++;
          else acc.rejected++;
          return acc;
        },
        { fulfilled: 0, rejected: 0 },
      );
      Object.assign(group, { invitations: { fulfilled, rejected } });
    }
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
    const { targetUId } = await service.group.inviteByUserName(
      gId,
      userName,
      hasAdminPermission,
    );

    notification.emit(
      GENERIC_NOT_EVENT.GROUP_INVITATION,
      gId,
      targetUId,
      user.uId,
    );

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

    // Update app notification on consumed field
    consumer.emit(GENERIC_NOT_EVENT.GROUP_INVITATION, gId, uId, accept);

    return res
      .status(OK)
      .json({ message: `Einladung ${accept ? 'angenommen' : 'abgelehnt'}` });
  },
);

export const getFriendsNotInGroup = catchAsync(
  async (req: Request<groupIdOnlyType>, res: Response, _next: NextFunction) => {
    const { gId } = req.params;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);

    const isGroupMember = await service.group.isInvitedOrMember(gId, uId);
    assert(
      isGroupMember.isMember,
      new ApiError(CONFLICT, 'Nicht in dieser Gruppe'),
    );

    const friends = await service.group.findFriendsNotInGroup(gId, uId);
    return res.status(OK).json(friends);
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
    const members = await service.group.findMembersAndFormat(gId);
    assert(
      isAssociatedWithGroup,
      new ApiError(UNAUTHORIZED, 'Kein Mitglied der Gruppe'),
    );
    const group = await service.group.loadAllData(gId);

    const isSelfAdmin = await service.group.isAdminOfGroup(gId, uId);
    Object.assign(group, { isSelfAdmin });

    const mappedMembers = members.map((m) => ({ ...m, isSelf: m.uId === uId }));
    Object.assign(group, { members: mappedMembers });

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

export const deleteKickUser = catchAsync(
  async (req, res: Response, _next: NextFunction) => {
    const { gId, userName } = req.query as object as kickUserGroupType;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const isAdmin = await service.group.isAdminOfGroup(gId, uId);
    assert(isAdmin, new ApiError(UNAUTHORIZED, 'Kein Admin dieser Gruppe'));
    const target = await service.user.findUserByUserName(userName);
    assert(
      target.aId !== aId,
      new ApiError(CONFLICT, 'Du darfst dich nicht selbst kicken'),
    );
    const { uId: targetUId } = await service.user.findUserByAId(target.aId);
    const { isInvited, isMember } = await service.group.isInvitedOrMember(
      gId,
      targetUId,
    );
    assert(
      isInvited || isMember,
      new ApiError(NOT_FOUND, `User ${target.userName} nicht in der Gruppe`),
    );
    if (isInvited) await service.group.deleteInvitation(gId, targetUId);
    if (isMember) await service.group.leaveGroup(targetUId, gId);
    return res.status(OK).json({});
  },
);

export const getUserGroups = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);

    const raw = await service.group.findGroupsByUIdSimpleFormat(user.uId);
    const groups = await Promise.allSettled(
      raw.map(async (group) => {
        const member = group.members.at(0);
        assert(
          member,
          new ApiError(NOT_FOUND, 'Fehler beim Laden der Gruppen'),
        );
        const lastMessage = await service.message.findLastMessageByGId(
          group.gId,
        );
        const formatLastMessage = lastMessage
          ? {
              userName: lastMessage?.user?.account?.userName,
              text: lastMessage?.text,
              timeStamp: lastMessage?.timeStamp,
            }
          : null;

        const { isAdmin, acceptedInvitation: hasAcceptedInvitation } = member;
        const members = group._count.members;
        return {
          ...omit(group, '_count', 'members'),
          members,
          isAdmin,
          hasAcceptedInvitation,
          lastMessage: formatLastMessage,
        };
      }),
    );

    const filteredAndMapped = groups
      .filter((g) => g.status === 'fulfilled')
      .map((g) => g.value);

    return res.status(OK).json(filteredAndMapped);
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

export const postAttachEvent = catchAsync(
  async (
    req: Request<object, object, attachPublicEventType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { eId, gId, meetingPoint, meetingTime, pollEndsAt } = req.body;
    const { aId, userName } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const group = await service.group.findGroupByGId(gId);
    const isMember = group.members.find((m) => m.uId === uId);
    assert(
      isMember && isMember.acceptedInvitation,
      new ApiError(UNAUTHORIZED, 'Kein Mitglied der Gruppe'),
    );
    assert(
      isMember.isAdmin,
      new ApiError(UNAUTHORIZED, 'Unzureichend Berechtigungen'),
    );

    const event = await service.event.findEventByEId(eId);
    const hasPassed = dayjs(event.endsAt).isBefore(dayjs());
    assert(!hasPassed, new ApiError(CONFLICT, 'Event bereits vorbei'));

    const location = await service.loc.findLocationByLId(event.lId);

    const eventAttachedYet = group.events
      .filter((e) => e.eId)
      .find((e) => e.eId === eId);
    assert(
      !eventAttachedYet,
      new ApiError(CONFLICT, 'Event bereits in dieser Gruppe'),
    );

    await service.group.attachPublicEvent(gId, userName, event, location, {
      meetingPoint,
      meetingTime,
      pollEndsAt,
    });

    return res.status(CREATED).json({ message: 'Event hinzugefügt' });
  },
);

export const postParticipateAttachedEvent = catchAsync(
  async (
    req: Request<object, object, participateAttachedEventType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { aeId } = req.body;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const attachedEvent = await service.group.findAttachedEventByAEId(aeId);

    const { gId, members } = attachedEvent.Group;
    const { isMember } = await service.group.isInvitedOrMember(gId, uId);
    assert(isMember, new ApiError(UNAUTHORIZED, 'Kein Gruppenmitglied'));
    const member = members.find((m) => m.uId === uId);
    assert(
      member,
      new ApiError(
        INTERNAL_SERVER_ERROR,
        'Konnte Mitglieder der Gruppe nicht richtig zuordnen',
      ),
    );

    const pollEnded = dayjs(attachedEvent.pollEndsAt).isBefore(dayjs());
    assert(
      !pollEnded,
      new ApiError(FORBIDDEN, 'Teilnahme-Umfrage geschlossen'),
    );

    const hasEntryYet = await service.group.hasEventParticipationEntry(
      aeId,
      uId,
    );

    const participation = await service.group.participateAttachedEvent(
      uId,
      member.gmId,
      aId,
      req.body,
      hasEntryYet?.gevId,
    );

    const { eId, event } = attachedEvent;
    if (eId && event)
      await service.event.participateEvent(aId, eId, participation);

    return res.status(OK).json({
      message: `${participation ? 'Teilnahme bestätigt' : 'Teilnahme zurückgezogen'}`,
    });
  },
);
