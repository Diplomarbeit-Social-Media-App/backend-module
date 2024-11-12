import { coerce, nativeEnum, object, string } from "zod";
import validator from "validator";
import dayjs from "dayjs";
import category from "../types/categorys";

export const positionSchema = object({
  longitutude: coerce
    .number({ message: "Longtitude muss eine Zahl sein" })
    .min(-180, { message: "Mindestwert für Longtitude ist -180" })
    .max(180, { message: "Maxwert für Longtitude ist 180" }),
  latitude: coerce
    .number({ message: "Latitude muss eine Zahl sein" })
    .min(-90, { message: "Mindestwert für Latitude ist -90" })
    .max(90, { message: "Maxwert für Latitude ist 90" }),
});

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
    description: string().trim().min(10, { message: "Beschreibung zu kurz" }),
    position: positionSchema,
  }).refine((data) => data.endsAt >= data.startsAt, {
    message: "Enddatum darf nicht vor Anfangsdatum sein!",
  }),
});

export const eventSearch = object({
  body: object({
    startDate: coerce
      .date({ message: "Format des Datums nicht korrekt" })
      .nullable(),
    endDate: coerce
      .date({ message: "Format des Datums nicht korrekt" })
      .nullable(),
    location: object({
      radius: coerce
        .number({ message: "Radius muss eine Nummer sein" })
        .min(0, { message: "Minimaler Radius ist 0" })
        .max(400, { message: "Maximaler Radius ist 400" }),
      position: positionSchema,
    }).nullable(),
    category: nativeEnum(category, {
      message: "Eine gültige Kategorie muss ausgewählt werden",
    }).nullable(),
  }),
});
