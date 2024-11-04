import dayjs from "dayjs";
import validator from "validator";
import { object, string, coerce } from "zod";

export const renewTokenSchema = object({
  body: object({
    refresh: string({ message: "Ein refresh Token muss beigelegt werden!" }),
  }),
});

export const loginSchema = object({
  body: object({
    userName: string().trim(),
    password: string().trim(),
  }),
});

export const signUpSchema = object({
  body: object({
    userName: string()
      .trim()
      .min(3, { message: "Username zu kurz" })
      .max(15, { message: "Username zu lang" })
      .refine((userName) => validator.isAlphanumeric(userName), {
        message: "Username enthält Sonderzeichen!",
      }),
    password: string()
      .trim()
      .max(256)
      .refine((pwd) => validator.isStrongPassword(pwd), {
        message: "Bitte verwende ein starkes Passwort",
      }),
    email: string()
      .trim()
      .email({ message: "Ungültige Email-Adresse" })
      .max(128, { message: "Maximal 128 Zeichen erlaubt" }),
    dateOfBirth: coerce
      .date({ message: "Bitte gib das Datum im gültigen Format ein" })
      .refine((data) => dayjs().diff(dayjs(data), "year", true) >= 14, {
        message: "Du musst mindestens 14 sein, um die App verwenden zu dürfen",
      }),
    firstName: string()
      .trim()
      .min(2, { message: "Vorname zu kurz" })
      .max(30, { message: "Vorname zu lang" }),
    lastName: string()
      .trim()
      .min(2, { message: "Nachname zu kurz" })
      .max(50, { message: "Nachname zu lang" }),
  }),
});
