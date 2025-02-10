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

const queries = { mutualHostSelection };

export default queries;
