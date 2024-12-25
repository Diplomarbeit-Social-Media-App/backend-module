import { eventSearch, eventType, updateEventSchema } from '../../types/event';
import { catchPrisma } from '../../utils/catchPrisma';
import db from '../../utils/db';
import lodash from 'lodash';
import { ApiError } from '../../utils/apiError';
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from 'http-status';
import dayjs from 'dayjs';
import { User } from '@prisma/client';
import assert from 'assert';

export const hasAttendance = async (
  aId: number,
  eId: number,
): Promise<boolean> => {
  const account = await db.account.findFirst({
    where: {
      aId,
    },
    include: {
      user: {
        select: {
          events: true,
        },
      },
    },
  });
  assert(
    account != null,
    new ApiError(NOT_FOUND, 'Kein passender Account gefunden'),
  );
  assert(
    account.user != null,
    new ApiError(CONFLICT, 'Du hast kein User-Profil'),
  );
  const events = account.user.events;
  if (!events || events.length == 0) return false;
  return events.some((e) => Number(e.eId) === Number(eId));
};

/**
 * @param aId Account (id) who wants to join
 * @param eId The id of the event which should be joined
 */
export const participateEvent = async (
  aId: number,
  eId: number,
  attendance: boolean,
) => {
  const account = await db.account.findFirst({
    where: {
      aId,
    },
    include: {
      user: {
        select: {
          events: true,
          uId: true,
        },
      },
    },
  });
  assert(
    account != null,
    new ApiError(NOT_FOUND, 'Kein passender Account gefunden'),
  );
  assert(
    account.user != null,
    new ApiError(CONFLICT, 'Du hast kein User-Profil'),
  );
  const event = await db.event.findFirst({
    where: {
      eId,
    },
    include: {
      users: true,
    },
  });
  assert(
    event != null,
    new ApiError(NOT_FOUND, 'Kein passendes Event gefunden'),
  );
  const eventPassed = dayjs().isAfter(event.startsAt);
  assert(
    !eventPassed,
    new ApiError(CONFLICT, 'Nach dem Eventstart nicht mehr möglich'),
  );
  const hasAttendance = event?.users.some((u) => u.aId == aId);

  if (hasAttendance == attendance)
    throw new ApiError(
      CONFLICT,
      hasAttendance ? 'Du nimmst bereits teil' : 'Du nimmst gerade nicht teil',
    );

  const action = attendance ? { connect: { aId } } : { disconnect: { aId } };

  await db.event.update({
    where: {
      eId,
    },
    data: {
      users: action,
    },
    select: {
      users: {
        select: {
          account: {
            select: {
              aId: true,
              userName: true,
            },
          },
        },
      },
      _count: {
        select: {
          users: true,
          groups: true,
        },
      },
    },
  });
  return attendance;
};

export const updateEvent = async (update: updateEventSchema, user: User) => {
  const { eId } = update;
  const eventFound = await catchPrisma(
    async () => await db.event.findFirst({ where: { eId } }),
  );
  assert(eventFound != null, new ApiError(NOT_FOUND, 'Event nicht gefunden'));

  if (eventFound?.creatorId != user.aId)
    throw new ApiError(
      UNAUTHORIZED,
      'Du darfst ein anderes Event nicht bearbeiten',
    );

  return await db.event.update({
    where: {
      eId,
    },
    data: {
      coverImage: update.coverImage ?? eventFound?.coverImage,
      description: update.description ?? eventFound?.description,
      name: update.name ?? eventFound?.name,
      galleryImages: update.galleryImages ?? eventFound?.galleryImages,
      minAge: update.minAge ?? eventFound?.minAge,
    },
  });
};

export const searchByName = async (query: string) => {
  return await catchPrisma(
    async () =>
      await db.event.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        include: {
          _count: true,
          location: true,
        },
      }),
  );
};

export const getEventDetails = async (eId: number) => {
  return await db.event.findFirst({
    where: {
      eId,
    },
    select: {
      coverImage: true,
      name: true,
      users: true,
      minAge: true,
      galleryImages: true,
      isPublic: true,
      location: true,
      startsAt: true,
      endsAt: true,
      description: true,
      host: {
        select: {
          companyName: true,
          verified: true,
          account: {
            select: {
              userName: true,
              picture: true,
            },
          },
        },
      },
    },
  });
};

export const getAllEvents = async () => {
  const events = await db.event.findMany({
    select: {
      coverImage: true,
      name: true,
      startsAt: true,
      eId: true,
      location: {
        select: {
          city: true,
          postCode: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
    take: 100,
  });
  return events.map((event) => {
    const participantCount: number = event._count.users;
    return { ...lodash.omit(event, '_count'), participantCount };
  });
};

export const getEventsWithFilter = async (_filter: eventSearch) => {
  await db.activity.findMany({
    where: {},
  });
};

export const createEvent = async (event: eventType, aId: number) => {
  return await catchPrisma(async () => {
    const { city, houseNumber, plz: postCode, street } = event.location;
    const location = await db.location.create({
      data: {
        city,
        houseNumber,
        postCode: String(postCode),
        street,
        country: 'Austria',
      },
    });
    assert(
      location != null,
      new ApiError(
        INTERNAL_SERVER_ERROR,
        'Location konnte nicht erzeugt werden',
      ),
    );
    const e = await db.event.create({
      data: {
        startsAt: dayjs(event.startsAt).toDate(),
        endsAt: dayjs(event.endsAt).toDate(),
        description: event.description,
        lId: location.lId,
        minAge: event.minAge,
        name: event.name,
        coverImage: event.coverImage,
        galleryImages: event.galleryImages,
        location: {
          connect: {
            lId: location.lId,
          },
        },
        host: {
          connect: {
            aId,
          },
        },
      },
    });
    return e;
  });
};
