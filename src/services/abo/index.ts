import db from '../../utils/db';
import { ABO_FILTER_SCHEMA, getFilterValues } from '../../types/abo';

export const loadAboRequests = async (filter: ABO_FILTER_SCHEMA) => {
  const filterValues = getFilterValues(filter);
  return await db.aboRequest.findMany({
    where: {
      state: {
        in: filterValues,
      },
    },
  });
};
