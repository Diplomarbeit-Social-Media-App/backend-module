const attendeesInGroupSelection = (uIds: number[]) => {
  return {
    users: {
      where: {
        uId: { in: uIds },
      },
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
};

const queries = { attendeesInGroupSelection };

export default queries;
