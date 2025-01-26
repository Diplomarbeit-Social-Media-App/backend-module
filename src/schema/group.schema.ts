import { object, string } from 'zod';
import validator from 'validator';

export const createGroupSchema = object({
  body: object({
    name: string({ message: 'Gruppenname fehlt' })
      .min(2, { message: 'Gruppenname zu kurz' })
      .max(32, { message: 'Gruppenname zu lang' })
      .refine((name) => validator.isAlphanumeric(name), {
        message: 'Keine Sonderzeichen im Namen erlaubt',
      }),
    description: string({ message: 'Beschreibung fehlt' })
      .nullable()
      .default("Let's go partying gurrl!"),
    picture: string({ required_error: 'Gruppenbild fehlt' }).nullable(),
  }),
});
