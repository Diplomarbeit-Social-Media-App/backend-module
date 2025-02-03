import dayjs from 'dayjs';
import db from '../utils/db';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';

export const createGroup = async (
  name: string,
  description: string | null,
  picture: string | null,
  owningUserId: number,
) => {
  const group = await db.group.create({
    data: {
      creationDate: dayjs().toDate(),
      description,
      owningUser: owningUserId,
      name,
      picture,
    },
  });
  assert(
    group,
    new ApiError(INTERNAL_SERVER_ERROR, 'Error occurred creating group'),
  );
  return group;
};

export const findGroupsOwnedByUId = async (uId: number) => {
  return await db.group.findMany({
    where: {
      owningUser: uId,
    },
  });
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

export const isAssociatedWithGroup = async (gId: number, uId: number) => {
  const group = await db.group.findFirst({
    where: {
      gId,
    },
    include: {
      members: true,
    },
  });
  assert(group, new ApiError(NOT_FOUND, `Gruppe ${gId} existiert nicht`));
  return group.owningUser === uId || group.members.some((m) => m.uId === uId);
};

export const deleteInvitation = async (gId: number, uId: number) => {
  await db.groupMember.deleteMany({
    where: {
      acceptedInvitation: false,
      groupId: gId,
      uId,
    },
  });
};

export const acceptInvitation = async (gId: number, uId: number) => {
  await db.groupMember.updateMany({
    where: {
      groupId: gId,
      uId,
    },
    data: {
      acceptedInvitation: true,
    },
  });
};

export const inviteByUserName = async (gId: number, userName: string) => {
  const acc = await db.account.findUnique({
    where: {
      userName,
    },
    include: {
      GroupMember: true,
      user: true,
    },
  });
  assert(acc, new ApiError(NOT_FOUND, `User ${userName} nicht gefunden`));
  assert(acc.user, new ApiError(NOT_FOUND, 'Account besitzt kein User-Profil'));
  const invitedOrMember = acc.GroupMember.find((g) => g.groupId == gId);
  if (invitedOrMember) {
    assert(
      !invitedOrMember.acceptedInvitation,
      new ApiError(CONFLICT, 'Bereits in der Gruppe'),
    );
    throw new ApiError(CONFLICT, 'Einladung bereits gesendet');
  }
  await db.groupMember.create({
    data: {
      groupId: gId,
      aId: acc.aId,
      uId: acc.user.uId,
    },
  });
};

export const loadAllData = async (gId: number) => {
  return await db.group.findFirst({
    where: {
      gId,
    },
    select: {
      name: true,
      picture: true,
      description: true,
      _count: {
        select: {
          activities: true,
          events: true,
          members: true,
          messages: true,
        },
      },
    },
  });
};
