import { coerce, object, string } from 'zod';
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

export const inviteGroupSchema = object({
  body: object({
    gId: coerce.number({
      invalid_type_error: 'Groupe-Id Datentyp ungültig',
      required_error: 'Gruppen-Id fehlt',
    }),
    userName: string({
      required_error: 'Username fehlt',
      invalid_type_error: 'Username Datentyp ungültig',
    }),
  }),
});

export const inviteAcceptGroupSchema = object({
  body: object({
    gId: coerce.number({
      invalid_type_error: 'Groupe-Id Datentyp ungültig',
      required_error: 'Gruppen-Id fehlt',
    }),
    accept: coerce.boolean({
      required_error: 'Acceptance fehlt',
      invalid_type_error: 'Acceptance Datentyp ungültig',
    }),
  }),
});

export const groupDataSchema = object({
  params: object({
    gId: coerce.number({
      invalid_type_error: 'Groupe-Id Datentyp ungültig',
      required_error: 'Gruppen-Id fehlt',
    }),
  }),
});
