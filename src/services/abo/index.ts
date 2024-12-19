import db from '../../utils/db';
import { ABO_FILTER_SCHEMA, getFilterValues } from '../../types/abo';

export const loadAboRequests = async (
  filter: ABO_FILTER_SCHEMA,
  aId: number,
) => {
  const filterValues = getFilterValues(filter);
  return await db.aboRequest.findMany({
    where: {
      state: {
        in: filterValues,
      },
      AND: [
        {
          OR: [
            {
              fromUser: {
                aId: Number(aId),
              },
            },
            {
              toUser: {
                aId: Number(aId),
              },
            },
          ],
        },
      ],
    },
    select: {
      frId: true,
      createdAt: true,
      fromUser: {
        select: {
          account: {
            select: {
              aId: true,
              userName: true,
            },
          },
          uId: true,
        },
      },
      toUser: {
        select: {
          account: {
            select: {
              aId: true,
              userName: true,
            },
          },
          uId: true,
        },
      },
    },
  });
};
