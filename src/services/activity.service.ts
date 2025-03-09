import assert from 'node:assert';
import service from '.';
import { createActivityType } from '../types/activity';
import db from '../utils/db';
import { ApiError } from '../utils/apiError';
import { CONFLICT } from 'http-status';
import dayjs from 'dayjs';
import { omit } from 'lodash';

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

export const hasAttendance = async (acId: number, uId: number, day: Date) => {
  const startOfDay = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
  );
  const endOfDay = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1),
  );
  return db.activityParticipation.findFirst({
    where: {
      acId,
      uId,
      on: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });
};

export const findActivityByAcId = async (acId: number) => {
  return db.activity.findFirst({ where: { acId } });
};

export const participateActivity = async (
  acId: number,
  uId: number,
  day: Date,
  attendance: boolean,
) => {
  const currAttendance = await hasAttendance(acId, uId, day);

  const isConflict = !!currAttendance === attendance;
  const attendanceError = new ApiError(
    CONFLICT,
    attendance ? 'Du nimmst bereits teil' : 'Keine Teilnahme an diesem Tag',
  );
  assert(!isConflict, attendanceError);

  const startOfDay = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
  );
  const endOfDay = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1),
  );

  if (!attendance)
    return db.activityParticipation.delete({
      where: {
        on: { gte: startOfDay, lt: endOfDay },
        uId,
        acId,
        apId: currAttendance?.apId,
      },
    });

  return db.activityParticipation.create({
    data: { on: day, uId, acId },
  });
};

export const findUserActivities = async (uId: number) => {
  const participations = await db.activityParticipation.findMany({
    where: { uId },
    include: {
      activity: {
        select: {
          coverImage: true,
          minAge: true,
          name: true,
          description: true,
          host: {
            select: {
              account: {
                select: {
                  userName: true,
                  picture: true,
                },
              },
              companyName: true,
            },
          },
          location: {
            select: {
              city: true,
              postCode: true,
            },
          },
          participations: true,
          closed: true,
          closureNote: true,
        },
      },
      user: true,
    },
    orderBy: [{ on: 'asc' }, { acId: 'desc' }],
  });

  return participations.map((p) => {
    const { on: participationDate } = p;

    const partsOnDate = p.activity.participations.filter((u) =>
      dayjs(u.on).isSame(p.on),
    ).length;

    const generalInfos = omit(p.activity, ['participations', 'host']);
    const host = {
      userName: p.activity.host.account.userName,
      companyName: p.activity.host.companyName,
      picture: p.activity.host.account.picture,
    };

    return {
      ...generalInfos,
      host,
      participationDate,
      participantCount: partsOnDate,
    };
  });
};
