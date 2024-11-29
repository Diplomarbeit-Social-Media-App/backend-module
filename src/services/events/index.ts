import { assert } from 'console';
import { eventSearch, eventType } from '../../types/event';
import { catchPrisma } from '../../utils/catchPrisma';
import db from '../../utils/db';
import lodash from 'lodash';
import { ApiError } from '../../utils/apiError';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import dayjs from 'dayjs';

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
      _count: {
        select: {
          users: true,
        },
      },
    },
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
