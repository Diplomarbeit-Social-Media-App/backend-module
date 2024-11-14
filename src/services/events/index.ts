import { eventSearch } from '../../types/event';
import db from '../../utils/db';
import lodash from 'lodash';

export const getAllEvents = async () => {
  const events = await db.event.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
  return events.map((event) => {
    const participantCount: Number = event._count.users;
    return { ...lodash.omit(event, '_count'), participantCount };
  });
};

export const getEventsWithFilter = async (filter: eventSearch) => {
  const events = await db.activity.findMany({
    where: {},
  });
};
