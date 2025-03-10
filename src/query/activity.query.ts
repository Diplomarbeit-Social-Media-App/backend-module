import { Prisma } from '@prisma/client';

const activityDetailSelection = (uId: number): Prisma.ActivitySelect => ({
  participations: {
    where: {
      uId,
    },
  },
  closed: true,
  closureNote: true,
  coverImage: true,
  description: true,
  openingTimes: true,
  name: true,
  minAge: true,
  acId: true,
  galleryImages: true,
  hId: true,
  host: {
    select: {
      companyName: true,
      verified: true,
      aId: true,
      hId: true,
      account: {
        select: {
          userName: true,
          picture: true,
        },
      },
    },
  },
  lId: true,
  location: {
    select: {
      city: true,
      country: true,
      houseNumber: true,
      postCode: true,
      street: true,
    },
  },
});

const queries = {
  activityDetailSelection,
};

export default queries;
