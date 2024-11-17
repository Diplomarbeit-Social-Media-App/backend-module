import validator from 'validator';
import { object, string, coerce } from 'zod';

export const renewTokenSchema = object({
  body: object({
    refresh: string({ message: 'Ein refresh Token muss beigelegt werden!' }),
  }),
});

export const loginSchema = object({
  body: object({
    userName: string({ message: 'Username fehlt' }).trim(),
    password: string({ message: 'Passwort fehlt' }).trim(),
  }),
});

export const passwordResetSchema = object({
  body: object({
    userName: string({ message: 'Username ist ungültig' }),
    token: string({ message: 'Der Token ist ungültig' }).length(6, {
      message: 'Token ist 6 Zeichen lang',
    }),
    updatedPassword: string({ message: 'Neues Passwort muss enthalten sein' })
      .trim()
      .max(256)
      .refine((pwd) => validator.isStrongPassword(pwd), {
        message: 'Bitte verwende ein starkes Passwort',
      }),
  }),
});

export const signUpSchema = object({
  body: object({
    userName: string({ message: 'Username muss enthalten sein' })
      .trim()
      .min(3, { message: 'Username zu kurz' })
      .max(15, { message: 'Username zu lang' })
      .refine((userName) => validator.isAlphanumeric(userName), {
        message: 'Username enthält Sonderzeichen!',
      }),
    password: string({ message: 'Passwort muss enthalten sein' })
      .trim()
      .max(256)
      .refine((pwd) => validator.isStrongPassword(pwd), {
        message: 'Bitte verwende ein starkes Passwort',
      }),
    email: string({ message: 'Email muss enthalten sein' })
      .trim()
      .email({ message: 'Ungültige Email-Adresse' })
      .max(128, { message: 'Maximal 128 Zeichen erlaubt' }),
    dateOfBirth: coerce.date({
      message: 'Bitte gib das Datum im gültigen Format ein',
    }),
    firstName: string({ message: 'Vorname muss enthalten sein' })
      .trim()
      .min(2, { message: 'Vorname zu kurz' })
      .max(30, { message: 'Vorname zu lang' }),
    lastName: string({ message: 'Nachname muss enthalten sein' })
      .trim()
      .min(2, { message: 'Nachname zu kurz' })
      .max(50, { message: 'Nachname zu lang' }),
  }),
});
