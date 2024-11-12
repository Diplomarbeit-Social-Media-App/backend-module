import { eventSearch } from "../../types/event";
import db from "../../utils/db";

export const getAllEvents = async () => {
  return await db.event.findMany();
};

export const getEventsWithFilter = async (filter: eventSearch) => {
  const events = await db.activity.findMany({
    where: {},
  });
};
