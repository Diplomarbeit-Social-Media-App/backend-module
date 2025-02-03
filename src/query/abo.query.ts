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

const queries = {
  mutualFriendsSelection,
  friendByUserTableSelection,
  isFriendedWhereCondition,
  suggestionAccountIncludation,
};

export default queries;
