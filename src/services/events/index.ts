import db from "../../utils/db-util";

export const getAllEvents = async () => {
  return await db.event.findMany();
};
