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

const queries = { simpleGroupSelection };

export default queries;
