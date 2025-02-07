import db from '../utils/db';

export const findAdminProfileByAId = async (aId: number) => {
  const admin = await db.adminProfile.findUnique({
    where: {
      aId,
    },
  });
  return admin;
};
