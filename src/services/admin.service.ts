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
