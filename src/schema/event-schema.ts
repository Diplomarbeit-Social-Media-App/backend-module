import { coerce, object, string } from "zod";

export const eventSchema = object({
  body: object({
    name: string().min(3),
    startsAt: coerce.date().min(new Date(Date.now())),
    endsAt: coerce.date(),
    description: string().trim().min(10),
  }).refine((data) => data.endsAt >= data.startsAt, {
    message: "Start date must be earlier than end date",
  }),
});
