import {
  createActivitySchema,
  deleteActivitySchema,
} from '../schema/activity.schema';

type OpeningDay = {
  id: number;
  name: string;
  isOpen: boolean;
  hours: string;
};

export type OpeningTimesFormat = OpeningDay[];

type createActivityBody = typeof createActivitySchema.shape.body;
export type createActivityType = Zod.infer<createActivityBody>;

type deleteActivityParams = typeof deleteActivitySchema.shape.params;
export type deleteActivityType = Zod.infer<deleteActivityParams>;
