import {
  hostDetailsSchema,
  hostRatingDeletionSchema,
  hostRatingSchema,
} from '../schema/host';

type hostDetailsParams = typeof hostDetailsSchema.shape.params;
export type hostDetailsType = Zod.infer<hostDetailsParams>;

type hostRateBody = typeof hostRatingSchema.shape.body;
export type hostRatingType = Zod.infer<hostRateBody>;

type hostRatingDeletionBody = typeof hostRatingDeletionSchema.shape.params;
export type hostRatingDeletionType = Zod.infer<hostRatingDeletionBody>;
