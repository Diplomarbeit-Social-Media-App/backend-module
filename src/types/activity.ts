import { createActivitySchema } from '../schema/activity';

type createActivityBody = typeof createActivitySchema.shape.body;
export type createActivityType = Zod.infer<createActivityBody>;
