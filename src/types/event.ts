import { eventSchema, eventSearch, updateSchema } from '../schema/event';

type eventSchemaBody = typeof eventSchema.shape.body;
export type eventType = Zod.infer<eventSchemaBody>;

type eventSearchBody = typeof eventSearch.shape.body;
export type eventSearch = Zod.infer<eventSearchBody>;

type updateEventBody = typeof updateSchema.shape.body;
export type updateEventSchema = Zod.infer<updateEventBody>;
