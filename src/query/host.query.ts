import { TOKEN_TYPES } from '../types/token';

const mutualHostSelection = {
  account: {
    select: {
      aId: true,
      userName: true,
      picture: true,
    },
  },
  hId: true,
};

const completeHostFollowerQuery = (hId: number) => ({
  where: {
    hId,
  },
  select: {
    followedBy: {
      where: {
        account: {
          token: {
            some: {
              type: TOKEN_TYPES.NOTIFICATION.toString(),
            },
          },
        },
      },
      select: {
        uId: true,
        account: {
          select: {
            aId: true,
            token: {
              where: {
                type: TOKEN_TYPES.NOTIFICATION.toString(),
              },
            },
          },
        },
      },
    },
  },
});

const queries = { mutualHostSelection, completeHostFollowerQuery };

export default queries;
