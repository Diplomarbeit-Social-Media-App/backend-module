import dayjs from 'dayjs';
import { UserList } from '../types/admin';
import db from '../utils/db';

export const findAdminProfileByAId = async (aId: number) => {
  const admin = await db.adminProfile.findUnique({
    where: {
      aId,
    },
  });
  return admin;
};

export const hasAdminPermissionByAId = async (
  aId: number,
): Promise<boolean> => {
  return (await findAdminProfileByAId(aId)) != null;
};

export const getUsersByFormat = async (): Promise<UserList> => {
  const user = await db.account.findMany({
    select: {
      aId: true,
      userName: true,
      email: true,
      host: true,
      user: true,
      activated: true,
      disabled: true,
      createdAt: true,
      admin: true,
    },
  });

  const format: UserList = user.map((u) => ({
    aId: u.aId,
    email: u.email,
    isActivated: u.activated,
    isBanned: u.disabled,
    isHost: u.host != null,
    isVerified: u.host?.verified ?? false,
    joined: dayjs(u.createdAt).format('DD-MM-YYYY'),
    role: u.user != null ? 'User' : 'Host',
    userName: u.userName,
    isAdmin: u.admin != null,
  }));

  return format;
};
