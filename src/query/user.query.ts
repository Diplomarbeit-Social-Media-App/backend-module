const publicInformationSelection = {
  account: {
    select: {
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
