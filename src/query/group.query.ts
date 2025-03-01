const simpleGroupSelection = (uId: number) => ({
  _count: {
    select: {
      members: true,
    },
  },
  gId: true,
  name: true,
  picture: true,
  description: true,
  members: {
    where: {
      uId,
    },
    select: {
      acceptedInvitation: true,
      isAdmin: true,
    },
  },
});

const richFormatSelection = {
  gId: true,
  name: true,
  picture: true,
  description: true,
  createdAt: true,
  createdFrom: true,
  _count: {
    select: {
      activities: true,
      events: true,
      members: {
        where: {
          acceptedInvitation: true,
        },
      },
      messages: true,
    },
  },
};

const groupMessageCreationSelection = {
  timeStamp: true,
  user: {
    select: {
      uId: true,
      aId: true,
      account: {
        select: {
          userName: true,
          picture: true,
        },
      },
    },
  },
  text: true,
  gId: true,
  mId: true,
};

const queries = {
  simpleGroupSelection,
  richFormatSelection,
  groupMessageCreationSelection,
};

export default queries;
