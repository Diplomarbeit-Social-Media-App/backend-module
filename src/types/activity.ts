import { JsonValue } from '@prisma/client/runtime/library';
import {
  activityIdOnlySchema,
  createActivitySchema,
  deleteActivitySchema,
  participationSchema,
  searchSchema,
} from '../schema/activity.schema';

type OpeningDay = {
  id: number;
  name: string;
  isOpen: boolean;
  hours: string;
};

export type OpeningTimesFormat = OpeningDay[];

export type UserActivityFormat = {
  coverImage: string | null;
  name: string;
  participationDate: string | Date;
  acId: number;
  location: {
    city: string;
    postCode: string;
  };
  participationCount: number;
}[];

type createActivityBody = typeof createActivitySchema.shape.body;
export type createActivityType = Zod.infer<createActivityBody>;

type deleteActivityParams = typeof deleteActivitySchema.shape.params;
export type deleteActivityType = Zod.infer<deleteActivityParams>;

type participationSchema = typeof participationSchema.shape.body;
export type participationType = Zod.infer<participationSchema>;

type searchSchema = typeof searchSchema.shape.params;
export type searchType = Zod.infer<searchSchema>;

type activityIdOnlySchema = typeof activityIdOnlySchema.shape.params;
export type idOnlyType = Zod.infer<activityIdOnlySchema>;

// ################### DETAIL- FORMAT ###############

type Participation = {
  apId: number;
  uId: number;
  acId: number;
  on: string | Date; // ISO date string
};

type Location = {
  city: string;
  country: string;
  houseNumber: string;
  postCode: string;
  street: string;
  lId: number;
};

type OpeningTime = {
  index: number;
  isClosed: boolean;
  openTime: string; // "HH:MM" format
  closeTime: string; // "HH:MM" format
};

type Host = {
  userName: string;
  picture: string;
  companyName: string;
  verified: boolean;
  aId: number;
  hId: number;
};

export type ActivityDetailResponse = {
  myParticipations: Participation[];
  isClosed: boolean;
  closureNote: string | null;
  location: Location;
  name: string;
  description: string | null;
  coverImage: string | null;
  galleryImages: string[];
  openingTimes: OpeningTime[] | JsonValue;
  minAge: number;
  acId: number;
  host: Host;
};
