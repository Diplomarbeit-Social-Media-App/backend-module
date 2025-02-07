import dayjs from 'dayjs';
import db from '../utils/db';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';
import {
  generalAttachmentDataType,
  generalEditGroupType,
} from '../types/group';
import query from '../query';
import { omit } from 'lodash';
import { Event, Location } from '@prisma/client';

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
      creationDate: dayjs().toDate(),
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

export const findGroupsByUIdSimpleFormat = async (uId: number) => {
  return await db.group.findMany({
    select: query.group.simpleGroupSelection(uId),
    where: {
      members: {
        some: {
          uId,
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
  additionalData: generalAttachmentDataType,
) => {
  const { city, country, houseNumber, postCode, street } = loc;
  const { meetingPoint, meetingTime, pollEndsAt } = additionalData;
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
      meetingPoint,
      meetingTime: String(meetingTime),
      pollEndsAt,
    },
  });
  return attached;
};

export const findGroupsByUId = async (uId: number) => {
  return await db.group.findMany({
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
  assert(member, new ApiError(CONFLICT, `Keine Einladung erhalten`));
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
  await db.groupMember.updateMany({
    where: {
      gId,
      uId,
    },
    data: {
      acceptedInvitation: true,
    },
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
    activityCount: count.activities,
    eventCount: count.events,
    memberCount: count.members,
    messageCount: count.messages,
  };
  return { ...omit(group, '_count'), ...data };
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
