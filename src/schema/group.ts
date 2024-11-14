import { array, object, string } from 'zod';
import validator from 'validator';

const member = object({
  userName: string().trim(),
});

export const createGroupSchema = object({
  body: object({
    name: string()
      .min(2, { message: 'Gruppenname zu kurz' })
      .max(32, { message: 'Gruppenname zu lang' })
      .refine((name) => validator.isAlphanumeric(name), {
        message: 'Keine Sonderzeichen im Namen erlaubt',
      }),
    description: string().nullable().default("Let's go partying gurrl!"),
    members: array(member).nullable(),
  }),
});
