import {
  hostAddSocialSchema,
  hostDelSocialSchema,
  hostDetailsSchema,
  hostRatingDeletionSchema,
  hostRatingSchema,
  hostSubscriptionSchema,
} from '../schema/host';

type hostDetailsParams = typeof hostDetailsSchema.shape.params;
export type hostDetailsType = Zod.infer<hostDetailsParams>;

type hostRateBody = typeof hostRatingSchema.shape.body;
export type hostRatingType = Zod.infer<hostRateBody>;

type hostRatingDeletionBody = typeof hostRatingDeletionSchema.shape.params;
export type hostRatingDeletionType = Zod.infer<hostRatingDeletionBody>;

type hostSocialAddBody = typeof hostAddSocialSchema.shape.body;
export type hostSocialAddType = Zod.infer<hostSocialAddBody>;

type hostDelSocialBody = typeof hostDelSocialSchema.shape.params;
export type hostSocialDelType = Zod.infer<hostDelSocialBody>;

type hostSubscriptionParams = typeof hostSubscriptionSchema.shape.params;
export type hostSubscriptionType = Zod.infer<hostSubscriptionParams>;
