import { coerce, object, string } from "zod";
import validator from "validator";
import dayjs from "dayjs";

export const eventSchema = object({
  body: object({
    name: string()
      .trim()
      .min(3, { message: "Eventname zu kurz" })
      .max(40, { message: "Eventname zu lang" })
      .refine((name) => validator.isAlphanumeric(name), {
        message: "Keine Sonderzeichen im Namen erlaubt",
      }),
    startsAt: coerce.date().min(dayjs().add(6, "hour").toDate(), {
      message: "Das Event muss mindestens 6 Stunden vor Beginn angelegt werden",
    }),
    endsAt: coerce.date(),
    description: string().trim().min(10, { message: "Beschreibung zu kurz!" }),
  }).refine((data) => data.endsAt >= data.startsAt, {
    message: "Enddatum darf nicht vor Anfangsdatum sein!",
  }),
});
