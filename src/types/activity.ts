import {
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
