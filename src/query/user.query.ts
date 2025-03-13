const publicInformationSelection = {
  account: {
    select: {
      aId: true,
      picture: true,
      firstName: true,
      userName: true,
      description: true,
      loginOs: true,
    },
  },
};

const queries = {
  publicInformationSelection,
};

export default queries;
