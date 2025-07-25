import db from '../utils/db';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import {
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status';
import {
  BasicGroupMemberPresentation,
  generalEditGroupType,
  privateEventCreationType,
} from '../types/group';
import query from '../query';
import { omit } from 'lodash';
import { Event, Location } from '@prisma/client';
import { TOKEN_TYPES } from '../types/token';
import { BasicAccountRepresentation } from '../types/abo';
import dayjs from 'dayjs';
import notification, { GENERIC_NOT_EVENT } from '../notification/index';
import service from '.';

export const findAttachedEvents = async (gId: number) => {
  const attachedEvents = await db.attachedEvent.findMany({
    where: { gId },
    select: query.group.groupAttachedEventParticipationsSelection,
    orderBy: [{ startsAt: 'desc' }, { isPublic: 'desc' }],
  });

  const privateEvents = attachedEvents.filter((e) => !e.isPublic);
  const publicEvents = attachedEvents.filter((e) => e.isPublic);

  return { publicEvents, privateEvents };
};

/**
 * @param gId group id
 * @param originId user id (requester)
 * @returns gross group chat data needed for group chat endpoint
 */
export const findGroupChatData = async (gId: number, originId: number) => {
  const memberData = await db.groupMember.findFirst({
    where: { gId, uId: originId },
    select: { lastReadAt: true },
  });

  const messages = await db.message.findMany({
    where: { gId },
    select: {
      mId: true,
      text: true,
      timeStamp: true,
      user: {
        select: { account: { select: { userName: true, picture: true } } },
      },
      uId: true,
    },
    orderBy: { timeStamp: 'desc' },
  });
  const flattendMessages = messages.map(
    ({ text, timeStamp, uId, user, mId }) => ({
      text,
      timeStamp,
      uId,
      mId,
      userName: user.account.userName,
      picture: user.account.picture,
      isOwnMessage: uId === originId,
    }),
  );

  const memberCount = await db.groupMember.count({
    where: { gId, acceptedInvitation: true },
  });

  return {
    lastReadAt: memberData?.lastReadAt,
    messages: flattendMessages,
    memberCount,
    gId,
  };
};

export const updateReadTimeStamp = async (uId: number, gId: number) => {
  return db.groupMember.updateMany({
    where: {
      uId,
      gId,
    },
    data: {
      lastReadAt: dayjs().toDate(),
    },
  });
};

export const findClosestAttachedEvent = async (gId: number) => {
  const futureEvent = await db.attachedEvent.findFirst({
    where: {
      gId,
      startsAt: {
        gte: dayjs().toDate(),
      },
    },
    orderBy: {
      startsAt: 'desc',
    },
    select: query.group.groupAttachedEventSelection,
  });
  if (futureEvent) return { ...futureEvent, isFutureEvent: true };

  const pastEvent = await db.attachedEvent.findFirst({
    where: {
      gId,
      startsAt: {
        lte: dayjs().toDate(),
      },
    },
    orderBy: {
      startsAt: 'asc',
    },
    select: query.group.groupAttachedEventSelection,
  });
  if (pastEvent) return { ...pastEvent, isFutureEvent: false };

  return null;
};

/**
 * Lists friends of user uId who are not yet invited/ member of group gId
 * @param gId Group id
 * @param uId User id
 * @returns array of friends - BasicAccountRepresentation[]
 */
export const findFriendsNotInGroup = async (
  gId: number,
  uId: number,
): Promise<BasicAccountRepresentation[]> => {
  const friends = await db.friendship.findMany({
    where: query.abo.isFriendedWhereCondition(uId),
    select: { friendId: true, userId: true },
  });
  const uniqueMapped = friends.map((f) =>
    f.friendId === uId ? f.userId : f.friendId,
  );
  const friendsNotInGroup = await db.user.findMany({
    where: {
      uId: {
        in: uniqueMapped,
      },
      groups: {
        none: {
          gId,
        },
      },
    },
    select: query.abo.friendByUserTableSelection,
  });
  return friendsNotInGroup.map((f) => ({
    isUserAccount: true,
    hId: null,
    ...f,
  }));
};

export const createGroup = async (
  name: string,
  description: string | null,
  picture: string | null,
  uId: number,
) => {
  const account = await db.account.findFirst({
    where: {
      user: {
        uId,
      },
    },
  });
  assert(account, new ApiError(NOT_FOUND, 'Account wurde nicht gefunden'));
  const group = await db.group.create({
    data: {
      createdFrom: account.userName,
      description,
      name,
      picture,
      members: {
        create: {
          aId: account.aId,
          uId,
          isAdmin: true,
          acceptedInvitation: true,
        },
      },
    },
  });
  assert(
    group,
    new ApiError(INTERNAL_SERVER_ERROR, 'Fehler beim Erstellen der Gruppe'),
  );
  return group;
};

/**
 * Searches for groups where the User uId has admin permissions
 * Won't check if uId is valid or not
 * Only checks groups where the user accepted the invitation
 * @param uId User id
 * @returns standard group format
 */
export const findGroupsAdministratedByUId = async (uId: number) => {
  const groups = await db.group.findMany({
    where: {
      members: {
        some: {
          uId,
          isAdmin: true,
          acceptedInvitation: true,
        },
      },
    },
  });
  return groups;
};

export const checkGroupExists = async (gId: number) => {
  return (await db.group.findFirst({ where: { gId } })) != null;
};

export const deleteGroup = async (gId: number) => {
  await db.group.delete({
    where: {
      gId,
    },
  });
};

export const isAdminOfGroup = async (gId: number, uId: number) => {
  const groups = await findGroupsAdministratedByUId(uId);
  return groups.some((g) => g.gId === gId);
};

export const findGroupByGId = async (gId: number) => {
  const group = await db.group.findFirst({
    where: {
      gId,
    },
    include: {
      events: true,
      members: true,
    },
  });
  assert(group, new ApiError(NOT_FOUND, `Gruppe ${gId} nicht gefunden`));
  return group;
};

export const createPrivateAttachedEvent = async (
  data: privateEventCreationType,
  userName: string,
) => {
  return db.attachedEvent.create({
    data: {
      ...omit(data, 'plz'),
      isPublic: false,
      suggestedBy: userName,
      gId: data.gId,
      postCode: String(data.plz),
    },
  });
};

export const sendMessage = async (
  uId: number,
  gId: number,
  message: string,
) => {
  const msg = await db.message.create({
    data: {
      gId,
      text: message,
      uId,
    },
    select: query.group.groupMessageCreationSelection,
  });
  const account = await service.auth.findAccountByUId(uId);
  notification.emit(
    GENERIC_NOT_EVENT.GROUP_MESSAGE,
    gId,
    account.userName,
    uId,
  );
  return msg;
};

export const findGroupsByUIdSimpleFormat = async (uId: number) => {
  return db.group.findMany({
    select: query.group.simpleGroupSelection(uId),
    where: {
      members: {
        some: {
          AND: [{ uId }, { acceptedInvitation: true }],
        },
      },
    },
  });
};

export const attachPublicEvent = async (
  gId: number,
  userName: string,
  event: Event,
  loc: Location,
) => {
  const { city, country, houseNumber, postCode, street } = loc;
  const attached = await db.attachedEvent.create({
    data: {
      isPublic: true,
      suggestedBy: userName,
      name: event.name,
      description: event.description,
      image: event.coverImage,
      gId,
      city,
      houseNumber,
      postCode,
      country,
      street,
      eId: event.eId,
      startsAt: event.startsAt!,
    },
  });
  return attached;
};

export const findGroupsByUId = async (uId: number) => {
  return db.group.findMany({
    where: {
      members: {
        some: {
          uId,
        },
      },
    },
  });
};

export const isInvitedOrMember = async (gId: number, uId: number) => {
  const group = await db.group.findFirst({
    where: {
      gId,
    },
    include: {
      members: true,
    },
  });
  assert(group, new ApiError(NOT_FOUND, `Gruppe ${gId} existiert nicht`));
  const member = group.members.find((m) => m.uId == uId);
  assert(
    member,
    new ApiError(CONFLICT, `Keine Einladung noch Mitglied der Gruppe`),
  );
  return {
    isInvited: !member.acceptedInvitation,
    isMember: member.acceptedInvitation,
  };
};

export const assignRandomAdmin = async (gId: number) => {
  const member = await db.groupMember.findFirst({
    where: { gId, isAdmin: false },
  });
  if (!member) throw new ApiError(INTERNAL_SERVER_ERROR, 'Kein Admin ernannt');
  await db.groupMember.update({
    where: {
      gmId: member.gmId,
    },
    data: {
      isAdmin: true,
    },
  });
};

export const leaveGroup = async (uId: number, gId: number) => {
  await db.groupMember.deleteMany({
    where: { uId, gId },
  });
  const remaining = await db.groupMember.findMany({
    where: { gId },
    select: {
      isAdmin: true,
    },
  });
  const data = remaining.reduce(
    (acc, user) =>
      user.isAdmin
        ? { admins: acc.admins + 1, nonAdmins: acc.nonAdmins }
        : { nonAdmins: acc.nonAdmins + 1, admins: acc.admins },
    { admins: 0, nonAdmins: 0 },
  );
  return data;
};

export const deleteInvitation = async (gId: number, uId: number) => {
  await db.groupMember.deleteMany({
    where: {
      acceptedInvitation: false,
      gId,
      uId,
    },
  });
};

export const acceptInvitation = async (gId: number, uId: number) => {
  const member = await db.groupMember.findFirst({
    where: { uId, gId },
  });
  assert(member, new ApiError(NOT_FOUND, 'Einladung nicht gefunden'));

  await db.groupMember.update({
    where: {
      gmId: member.gmId,
    },
    data: {
      acceptedInvitation: true,
    },
  });
};

export const findAttachedEventByAEId = async (aeId: number) => {
  const event = await db.attachedEvent.findFirst({
    where: { aeId },
    include: { event: true, group: { include: { members: true } } },
  });
  assert(event, new ApiError(NOT_FOUND, `Event ${aeId} not found`));
  return event;
};

export const findAttendancePrivateEvent = async (aeId: number, uId: number) => {
  const event = await db.attachedEvent.findFirst({
    where: { aeId },
    select: { isPublic: true, participations: { where: { uId } } },
  });
  assert(!event?.isPublic, new ApiError(BAD_REQUEST, 'Event ist öffentlich'));
  const part = event?.participations;
  return part && part.length > 0;
};

export const participatePrivateEvent = async (
  aeId: number,
  uId: number,
  aId: number,
  gmId: number,
) => {
  return db.privateEventParticipation.create({
    data: { aeId, uId, aId, gmId },
  });
};

export const inviteByUserName = async (
  gId: number,
  userName: string,
  adminPerm: boolean,
) => {
  const acc = await db.account.findUnique({
    where: {
      userName,
    },
    include: {
      groupMember: true,
      user: true,
    },
  });
  assert(acc, new ApiError(NOT_FOUND, `User ${userName} nicht gefunden`));
  assert(acc.user, new ApiError(NOT_FOUND, 'Account besitzt kein User-Profil'));
  const invitedOrMember = acc.groupMember.find((g) => g.gId == gId);
  if (invitedOrMember) {
    assert(
      !invitedOrMember.acceptedInvitation,
      new ApiError(CONFLICT, 'Bereits in der Gruppe'),
    );
    throw new ApiError(CONFLICT, 'Einladung bereits gesendet');
  }
  await db.groupMember.create({
    data: {
      gId,
      aId: acc.aId,
      uId: acc.user.uId,
      isAdmin: adminPerm,
    },
  });

  return { gId, targetUId: acc.user.uId };
};

/**
 * Searches for all group members of group gId who accepted the invitation
 * @param gId group id
 * @returns array of group members;
 */
export const findMembersAndFormat = async (
  gId: number,
): Promise<BasicGroupMemberPresentation[]> => {
  const group = await db.groupMember.findMany({
    where: {
      gId,
      acceptedInvitation: true,
    },
    select: { ...query.abo.friendByUserTableSelection, isAdmin: true },
  });
  return group.map((m) => ({ hId: null, isUserAccount: true, ...m }));
};

/**
 * Only returns members who accepted the invitation
 * Should be used to send messages; includes account and token
 */
export const findMembersOfGroup = async (gId: number) => {
  const group = await db.group.findUnique({
    where: {
      gId,
    },
    select: {
      members: {
        select: {
          uId: true,
          account: {
            select: {
              token: {
                where: {
                  type: TOKEN_TYPES.NOTIFICATION.toString(),
                },
              },
            },
          },
        },
        where: {
          acceptedInvitation: true,
        },
      },
    },
  });
  assert(group, new ApiError(NOT_FOUND, "Group wasn't found"));
  return group.members;
};

export const loadAllData = async (gId: number) => {
  const group = await db.group.findFirst({
    where: {
      gId,
    },
    select: query.group.richFormatSelection,
  });
  assert(group, new ApiError(NOT_FOUND, `Gruppe ${gId} existiert nicht`));
  const count = group._count;
  const data = {
    eventCount: count.events,
    memberCount: count.members,
    messageCount: count.messages,
  };
  return { ...omit(group, '_count'), ...data };
};

export const findGroupMemberByUId = async (uId: number, gId: number) => {
  return db.groupMember.findFirst({
    where: { gId, uId },
  });
};

export const editGroup = async (
  gId: number,
  data: { name?: string; description?: string; picture?: string },
  adminSettings: generalEditGroupType['setAdmin'],
) => {
  if (adminSettings) {
    const { admin, userName } = adminSettings;
    const userExists = await db.groupMember.findFirst({
      where: {
        gId,
        user: {
          account: {
            userName: userName!,
          },
        },
      },
    });
    assert(userExists, new ApiError(NOT_FOUND, `User ${userName} not found`));
    await updateAdminStatus(userExists.gmId, admin);
  }

  await db.group.update({
    where: {
      gId,
    },
    data,
  });
};

const updateAdminStatus = async (gmId: number, admin: boolean) => {
  await db.groupMember.update({
    where: {
      gmId: gmId,
    },
    data: {
      isAdmin: admin,
    },
  });
};
