import dayjs from "dayjs";
import { coerce, date, object, string } from "zod";

const eventSchema = object({
  body: object({
    name: string().min(3),
    startsAt: coerce.date().min(new Date(Date.now())),
    endsAt: coerce.date(),
    description: string().trim().min(10),
  }).refine((data) => data.endsAt >= data.startsAt),
});
