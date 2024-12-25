import { hostDetailsSchema, hostRatingSchema } from '../schema/host';

type hostDetailsParams = typeof hostDetailsSchema.shape.params;
export type hostDetailsType = Zod.infer<hostDetailsParams>;

type hostRateBody = typeof hostRatingSchema.shape.body;
export type hostRatingType = Zod.infer<hostRateBody>;
