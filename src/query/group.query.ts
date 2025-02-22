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
      members: true,
      messages: true,
    },
  },
};

const queries = { simpleGroupSelection, richFormatSelection };

export default queries;
