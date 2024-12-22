import { hostDetailsSchema } from '../schema/host';

type hostDetailsParams = typeof hostDetailsSchema.shape.params;
export type hostDetailsType = Zod.infer<hostDetailsParams>;
