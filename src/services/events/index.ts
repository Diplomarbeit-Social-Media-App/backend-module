import { assert } from 'console';
import { eventSearch, eventType } from '../../types/event';
import { catchPrisma } from '../../utils/catchPrisma';
import db from '../../utils/db';
import lodash from 'lodash';
import { ApiError } from '../../utils/apiError';
import { INTERNAL_SERVER_ERROR } from 'http-status';

export const getAllEvents = async () => {
  const events = await db.event.findMany({
    include: {
      _count: {
        select: { users: true },
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
        description: event.description,
        lId: location.lId,
        minAge: event.minAge,
        name: event.name,
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
