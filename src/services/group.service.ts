import dayjs from 'dayjs';
import db from '../utils/db';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';

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

// export const isAssociatedWithGroup = async (gId: number, uId: number) => {
//   const group = await db.group.findFirst({
//     where: {
//       gId,
//     },
//     include: {
//       members: true,
//     },
//   });
//   assert(group, new ApiError(NOT_FOUND, `Gruppe ${gId} existiert nicht`));
//   return group.owningUser === uId || group.members.some((m) => m.uId === uId);
// };

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

export const inviteByUserName = async (gId: number, userName: string) => {
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
    },
  });
};

export const loadAllData = async (gId: number) => {
  return await db.group.findFirst({
    where: {
      gId,
    },
    select: {
      gId: true,
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
