import db from '../../utils/db';

export const getAllActivities = async () => {
  const activities = await db.activity.findMany({
    select: {
      category: true,
      minAge: true,
      openingTimes: true,
      host: {
        select: {
          companyName: true,
          verified: true,
        },
      },
      description: true,
      location: {
        select: {
          postCode: true,
          city: true,
        },
      },
    },
    take: 100,
  });
  return activities;
};
