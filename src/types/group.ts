import { createGroupSchema } from '../schema/group.schema';

type createGroupBody = typeof createGroupSchema.shape.body;
export type createGroupType = Zod.infer<createGroupBody>;
