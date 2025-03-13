const mutualFriendsSelection = {
  friendId: true,
  userId: true,
  user: {
    select: {
      uId: true,
      account: {
        select: {
          userName: true,
          picture: true,
          aId: true,
        },
      },
    },
  },
};

const friendByUserTableSelection = {
  account: {
    select: {
      userName: true,
      picture: true,
      aId: true,
    },
  },
  uId: true,
};

const isFriendedWhereCondition = (uId: number) => {
  return {
    OR: [
      {
        friendId: uId,
      },
      {
        userId: uId,
      },
    ],
  };
};

const suggestionAccountIncludation = {
  friend: {
    include: {
      friendedBy: true,
    },
  },
  user: {
    include: {
      friendedBy: true,
    },
  },
};

const isFriendedDoubleCondition = (uId1: number, uId2: number) => ({
  OR: [
    {
      friendId: uId1,
      userId: uId2,
    },
    {
      userId: uId1,
      friendId: uId2,
    },
  ],
});

const queries = {
  mutualFriendsSelection,
  friendByUserTableSelection,
  isFriendedWhereCondition,
  suggestionAccountIncludation,
  isFriendedDoubleCondition,
};

export default queries;
