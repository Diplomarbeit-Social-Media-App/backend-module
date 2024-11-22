import { eventSchema, eventSearch } from '../schema/event';

type eventSchemaBody = typeof eventSchema.shape.body;
export type eventType = Zod.infer<eventSchemaBody>;

type eventSearchBody = typeof eventSearch.shape.body;
export type eventSearch = Zod.infer<eventSearchBody>;
