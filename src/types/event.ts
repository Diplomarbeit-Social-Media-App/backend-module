import {
  attendanceSchema,
  eventSchema,
  eventSearch,
  nameSearchSchema,
  participationSchema,
  updateSchema,
} from '../schema/event';

type eventSchemaBody = typeof eventSchema.shape.body;
export type eventType = Zod.infer<eventSchemaBody>;

type eventSearchBody = typeof eventSearch.shape.body;
export type eventSearch = Zod.infer<eventSearchBody>;

type updateEventBody = typeof updateSchema.shape.body;
export type updateEventSchema = Zod.infer<updateEventBody>;

type nameSearchParams = typeof nameSearchSchema.shape.params;
export type nameSearchType = Zod.infer<nameSearchParams>;

type participationBody = typeof participationSchema.shape.body;
export type participationType = Zod.infer<participationBody>;

type attendanceParams = typeof attendanceSchema.shape.params;
export type attendanceType = Zod.infer<attendanceParams>;
