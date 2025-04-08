import assert from 'node:assert';
import service from '.';
import { ActivityDetailResponse, createActivityType } from '../types/activity';
import db from '../utils/db';
import { ApiError } from '../utils/apiError';
import { CONFLICT, NOT_FOUND } from 'http-status';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import query from '../query';

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

/**
 * Checks if acId is valid and throws an error if not found.
 * Made for GET /activity/{id} - Activity detail endpoint.
 * @param {number} acId - Activity id.
 * @param {number} uId - Id of requesting user.
 * @returns {Promise<ActivityDetailResponse>} - Detailed information of activity acId in the given ActivityDetailFormat.
 */
export const findActivityDetailsByAcId = async (
  acId: number,
  uId: number,
): Promise<ActivityDetailResponse> => {
  const raw = await db.activity.findFirst({
    where: { acId },
    select: query.activity.activityDetailSelection(uId),
  });
  assert(raw, new ApiError(NOT_FOUND, `Aktivität ${acId} nicht gefunden`));
  return {
    myParticipations: raw.participations,
    isClosed: raw.closed,
    closureNote: raw.closureNote,
    location: {
      ...raw.location,
      lId: raw.lId,
    },
    name: raw.name,
    description: raw.description,
    coverImage: raw.coverImage,
    galleryImages: raw.galleryImages,
    openingTimes: raw.openingTimes,
    minAge: raw.minAge,
    acId,
    host: {
      // @ts-expect-error prisma orm doesn't generate types for joined host account
      userName: raw.host?.account?.userName,
      // @ts-expect-error prisma orm doesn't generate types for joined host account
      picture: raw.host?.account?.picture,
      ...omit(raw.host, 'account'),
      hId: raw.hId,
    },
  };
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

export const findActivityByName = async (query: string) => {
  return db.activity.findMany({
    where: { name: { mode: 'insensitive', equals: query } },
    orderBy: { closed: 'desc' },
  });
};

export const loadActivitiesFromHost = async (hId: number) => {
  return db.activity.findMany({
    where: { hId },
    include: {
      location: true,
      participations: {
        select: {
          on: true,
          user: {
            select: {
              account: {
                select: {
                  userName: true,
                },
              },
            },
          },
        },
      },
    },
  });
};
