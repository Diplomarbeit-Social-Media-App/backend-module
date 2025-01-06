import { NOT_FOUND } from 'http-status';
import { createActivityType } from '../../types/activity';
import { ApiError } from '../../utils/apiError';
import db from '../../utils/db';
import assert from 'assert';

export const deleteActivityByAId = async (aId: number) => {
  await db.activity.delete({
    where: {
      aId,
    },
  });
};

export const findActivityByAId = async (aId: number) => {
  const activity = await db.activity.findFirst({
    where: {
      aId,
    },
    include: {
      category: true,
      groups: true,
      host: true,
      location: true,
    },
  });
  return activity;
};

export const createActivity = async (data: createActivityType, hId: number) => {
  const location = await db.location.findFirst({
    where: {
      lId: data.locationId,
    },
  });
  assert(
    location != null,
    new ApiError(
      NOT_FOUND,
      'Location konnte mit dieser ID nicht gefunden werden',
    ),
  );
  return await db.activity.create({
    data: {
      ...data,
      creatorId: hId,
    },
  });
};

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
