import { eventSchema } from "../schema/event";

const eventSchemaBody = eventSchema.shape.body;
export type eventType = Zod.infer<typeof eventSchemaBody>;
