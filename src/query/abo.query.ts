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

const queries = { mutualFriendsSelection, friendByUserTableSelection };

export default queries;
