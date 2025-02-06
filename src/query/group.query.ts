const simpleGroupSelection = {
  _count: {
    select: {
      members: true,
    },
  },
  gId: true,
  name: true,
  picture: true,
  description: true,
};

const queries = { simpleGroupSelection };

export default queries;
