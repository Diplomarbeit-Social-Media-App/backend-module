import { eventSchema, eventSearch } from "../schema/event";

const eventSchemaBody = eventSchema.shape.body;
export type eventType = Zod.infer<typeof eventSchemaBody>;

const eventSearchBody = eventSearch.shape.body;
export type eventSearch = Zod.infer<typeof eventSearchBody>;
