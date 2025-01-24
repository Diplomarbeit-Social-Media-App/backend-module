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

const queries = { mutualFriendsSelection };

export default queries;
