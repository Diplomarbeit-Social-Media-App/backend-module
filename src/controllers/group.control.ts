import {
  BAD_REQUEST,
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
  attendancePrivateEventType,
  createGroupType,
  generalEditGroupType,
  groupIdOnlyType,
  inviteAcceptType,
  inviteGroupType,
  kickUserGroupType,
  privateEventCreationType,
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

export const postParticipatePrivateEvent = catchAsync(
  async (
    req: Request<object, object, attendancePrivateEventType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const { aeId, attendance } = req.body;

    const ae = await service.group.findAttachedEventByAEId(aeId);
    const group = await service.group.isInvitedOrMember(ae.gId, uId);
    assert(
      group.isMember,
      new ApiError(FORBIDDEN, 'Kein Mitglied dieser Gruppe'),
    );
    const gm = await service.group.findGroupMemberByUId(uId, ae.gId);
    assert(
      gm && gm?.gmId,
      new ApiError(INTERNAL_SERVER_ERROR, 'Fehler durch Gruppenmitgliedsid'),
    );

    const currAttend = await service.group.findAttendancePrivateEvent(
      aeId,
      uId,
    );
    const validAttendance = currAttend !== attendance;
    assert(
      validAttendance,
      new ApiError(
        BAD_REQUEST,
        currAttend
          ? 'Event bereits beigreteten'
          : 'Keine Teilnahme an diesem Event',
      ),
    );

    await service.group.participatePrivateEvent(aeId, uId, aId, gm?.gmId);

    return res.status(OK).json({});
  },
);

export const postPrivateEvent = catchAsync(
  async (
    req: Request<object, object, privateEventCreationType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { gId } = req.body;
    const { aId, userName } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);

    // checks if group exists and req user has admin permissions
    const _group = await service.group.findGroupByGId(gId);
    const isAdminOfGroup = await service.group.isAdminOfGroup(gId, uId);
    assert(isAdminOfGroup, new ApiError(FORBIDDEN, 'Adminrechte notwendig'));

    const ae = await service.group.createPrivateAttachedEvent(
      req.body,
      userName,
    );
    assert(ae, new ApiError(INTERNAL_SERVER_ERROR, 'Bitte probiere es erneut'));

    return res.status(CREATED).json({});
  },
);

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

export const getAttachedEvents = catchAsync(
  async (req: Request<groupIdOnlyType>, res: Response, _next: NextFunction) => {
    const { gId } = req.params;
    const { aId } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);

    const allowed = await service.group.isInvitedOrMember(gId, uId);
    assert(
      allowed.isMember,
      new ApiError(FORBIDDEN, 'Kein Mitglied der Gruppe'),
    );

    const { privateEvents, publicEvents } =
      await service.group.findAttachedEvents(gId);

    const groupMemberCount = (await service.group.findMembersOfGroup(gId))
      .length;

    const publicWithAttendees = await Promise.all(
      publicEvents.map(async (e) => {
        const attendees = await service.event.findAttendeesOfGroupByEId(
          e.eId!,
          gId,
        );
        return { ...e, participations: attendees };
      }),
    );

    const privateWithAttendees = privateEvents?.map((e) => ({
      ...e,
      participations: e.participations?.map((u) => ({
        ...u,
        hId: null,
        isUserAccount: true,
      })),
    }));

    return res.status(OK).json({
      privateEvents: privateWithAttendees,
      publicEvents: publicWithAttendees,
      groupMemberCount,
    });
  },
);

export const getChatInformations = catchAsync(
  async (req: Request<groupIdOnlyType>, res: Response, _next: NextFunction) => {
    const { aId, userName } = req.user as Account;
    const { uId } = await service.user.findUserByAId(aId);
    const { gId } = req.params;

    const { isMember, isInvited } = await service.group.isInvitedOrMember(
      gId,
      uId,
    );
    assert(!isInvited, new ApiError(FORBIDDEN, 'Nimm zuerst die Einladung an'));
    assert(isMember, new ApiError(FORBIDDEN, 'Nicht in dieser Gruppe'));

    const grossGroupChatData = await service.group.findGroupChatData(gId, uId);

    await service.group.updateReadTimeStamp(uId, gId);

    const closestEvent = await service.group.findClosestAttachedEvent(gId);

    const data = {
      ...grossGroupChatData,
      closestEvent,
      uId,
      userName,
    };

    return res.status(OK).json(data);
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
        const unreadMessageCount =
          await service.message.findUnreadMessageCountByGId(
            group.gId,
            user.uId,
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
          unreadMessageCount,
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
    const { eId, gId } = req.body;
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

    await service.group.attachPublicEvent(gId, userName, event, location);

    return res.status(CREATED).json({ message: 'Event hinzugefügt' });
  },
);
