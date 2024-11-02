import db from "../../utils/db";

export const getAllEvents = async () => {
  return await db.event.findMany();
};
