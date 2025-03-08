import service from '.';
import { createActivityType } from '../types/activity';
import db from '../utils/db';

export const createActivity = async (
  data: createActivityType,
  hostId: number,
) => {
  const location = await service.loc.createLocation(data.location);
  return db.activity.create({
    data: {
      coverImage: data.coverImage,
      minAge: data.minAge,
      name: data.name,
      openingTimes: data.businessHours,
      closureNote: data.closureNote,
      closed: data.isClosed,
      description: data.description,
      hId: hostId,
      galleryImages: data.galleryImages,
      lId: location.lId,
    },
  });
};

export const findTrendingActivities = async () => {
  const LOAD_MAX = 50;
  return db.activity.findMany({
    where: {
      closed: { equals: false },
    },
    take: LOAD_MAX,
  });
};

export const deleteActivityByAcId = async (acId: number, hId: number) => {
  return db.activity.deleteMany({
    where: {
      acId,
      hId,
    },
  });
};
