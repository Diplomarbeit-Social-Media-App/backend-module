import { eventSearch, eventType, updateEventSchema } from '../types/event';
import { catchPrisma } from '../utils/catchPrisma';
import db from '../utils/db';
import lodash from 'lodash';
import { ApiError } from '../utils/apiError';
import {
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from 'http-status';
import dayjs from 'dayjs';
import { User } from '@prisma/client';
import assert from 'assert';
import notification, { GENERIC_NOT_EVENT } from '../notification';
import { BasicAccountRepresentation } from '../types/abo';
import query from '../query';

/**
 * Finds the attendees of an event who are also members of a specific group.
 *
 * This function retrieves all users who are part of the given group (`gId`) and
 * checks which of them have attended the event (`eId`). It returns an array of
 * attendees formatted as `BasicAccountRepresentation`.
 *
 * @param {number} eId - The ID of the event to search attendees for.
 * @param {number} gId - The ID of the group whose members should be filtered.
 * @returns {Promise<BasicAccountRepresentation[]>} A promise resolving to an array
 * of attendees who are part of the given group.
 */
export const findAttendeesOfGroupByEId = async (
  eId: number,
  gId: number,
): Promise<BasicAccountRepresentation[]> => {
  const groupMembers = await db.groupMember.findMany({
    where: { gId, acceptedInvitation: true },
    select: { uId: true },
  });
  const mappedUId = groupMembers.map((m) => m.uId);

  const event = await db.event.findFirst({
    where: { eId },
    select: query.event.attendeesInGroupSelection(mappedUId),
  });

  const response: BasicAccountRepresentation[] =
    event?.users?.map((u) => ({
      ...u,
      isUserAccount: true,
      hId: null,
    })) ?? [];

  return response;
};

export const findEventByEId = async (eId: number) => {
  const event = await db.event.findFirst({
    where: { eId },
  });
  assert(event, new ApiError(NOT_FOUND, `Event ${eId} nicht gefunden`));
  return event;
};

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

  const blockingGroup = await db.attachedEvent.findFirst({
    where: {
      eId,
      isPublic: true,
      participations: {
        some: {
          aId,
        },
      },
    },
    select: {
      group: {
        select: {
          name: true,
        },
      },
    },
  });

  if (blockingGroup && !attendance) {
    throw new ApiError(
      CONFLICT,
      `Durch Gruppe ${blockingGroup.group.name} blockiert`,
    );
  }

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
          attachedEvents: true,
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

/**
 * Searches for events in which the user participates
 * @param uId User-ID
 * @returns a promised base array of events in the form of the event overview (less information than detail)
 */
export const findEventsPartUser = async (uId: number) => {
  const events = await db.event.findMany({
    where: {
      users: {
        some: {
          uId,
        },
      },
    },
    orderBy: {
      startsAt: 'desc',
    },
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
  });
  return events.map((event) => {
    const participantCount: number = event._count.users;
    return { ...lodash.omit(event, '_count'), participantCount };
  });
};

/**
 * @param uId User-Id
 * @returns Promise of events (amount: number) which the user participates
 */
export const findEventCountByUser = async (uId: number) => {
  const count = await db.event.aggregate({
    where: {
      users: {
        some: {
          uId,
        },
      },
    },
    _count: true,
  });
  return count._count;
};

export const loadEventsFromHost = async (_hId: number) => {
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
  });
  return events.map((event) => {
    const participantCount: number = event._count.users;
    return { ...lodash.omit(event, '_count'), participantCount };
  });
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
    const host = await db.host.findFirst({ where: { account: { aId } } });
    assert(host, new ApiError(FORBIDDEN, 'Keine Host-Berechtigungen'));
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
    notification.emit(
      GENERIC_NOT_EVENT.EVENT_PUBLISHED,
      e.eId,
      host.hId,
      e.name,
    );
    return e;
  });
};
