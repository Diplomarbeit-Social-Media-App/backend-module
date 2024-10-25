import { eventSchema } from "../schema/event-schema";

const eventSchemaBody = eventSchema.shape.body;
export type eventType = Zod.infer<typeof eventSchemaBody>;
