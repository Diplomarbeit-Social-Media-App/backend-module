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
    userName: string(),
    password: string(),
  }),
});

export const signUpSchema = object({
  body: object({
    userName: string({
      errorMap: () => ({
        message: "Username muss 3 bis 15 Zeichen lang sein",
      }),
    })
      .min(3)
      .max(15),
    password: string()
      .max(256)
      .refine((data) => validator.isStrongPassword(data), {
        message: "Bitte verwende ein starkes Passwort",
      }),
    email: string()
      .email({ message: "Ungueltige Email-Adresse" })
      .max(128, { message: "Maximal 128 Zeichen erlaubt" }),
    dateOfBirth: coerce
      .date({ message: "Bitte gib das Datum im gueltigen Format ein" })
      .refine((data) => dayjs().diff(dayjs(data), "year", true) >= 14, {
        message: "Du musst mindestens 14 sein, um die App verwenden zu dürfen",
      }),
    firstName: string({
      errorMap: () => ({
        message: "Vorname ungültig (2 bis 30 Zeichen)",
      }),
    })
      .min(2)
      .max(30),
    lastName: string({
      errorMap: () => ({
        message: "Nachname ungültig (2 bis 30 Zeichen)",
      }),
    })
      .min(2)
      .max(30),
  }),
});
