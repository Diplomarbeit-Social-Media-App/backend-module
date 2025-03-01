import { array, coerce, object, string } from 'zod';
import validator from 'validator';

export const kickUserGroupSchema = object({
  query: object({
    gId: coerce.number({ message: 'Gruppen-id ist ungültig' }),
    userName: string({ message: 'Username ist ungültig' }),
  }),
});

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
    invitations: array(string().min(3, 'Username bei Einladung zu kurz'))
      .nullable()
      .optional(),
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
    hasAdminPermission: coerce
      .boolean({
        required_error: 'Admin-Permission fehlt',
        invalid_type_error: 'Admin-Permission Datentyp ungültig',
      })
      .default(false),
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

export const groupIdOnlySchema = object({
  params: object({
    gId: coerce.number({
      invalid_type_error: 'Groupe-Id Datentyp ungültig',
      required_error: 'Gruppen-Id fehlt',
    }),
  }),
});

export const generalEditGroupSchema = object({
  body: object({
    gId: coerce.number({ message: 'Gruppen-Id fehlt' }),
    name: string({ message: 'Bitte gib einen Namen an' })
      .min(2, { message: 'Gruppenname zu kurz' })
      .max(32, { message: 'Gruppenname zu lang' })
      .refine((name) => validator.isAlphanumeric(name), {
        message: 'Keine Sonderzeichen im Namen erlaubt',
      })
      .nullable(),
    description: string({ message: 'Beschreibung fehlt' })
      .default("Let's go partying gurrl!")
      .nullable(),
    picture: string({ message: 'Bild-Link fehlt' }).nullable(),
    setAdmin: object({
      userName: string({ message: 'Username fehlt' }).nullable(),
      admin: coerce.boolean({ message: 'Admin-feld fehlt' }).default(false),
    })
      .optional()
      .refine(
        (data) => {
          if (data) return data.userName != null && data.admin != null;
          return true;
        },
        { message: 'Adminberechtigungen enthalten ungültige Felder' },
      ),
  }),
});

export const postAttachPublicEventSchema = object({
  body: object({
    gId: coerce
      .number({
        invalid_type_error: 'Gruppen-Id ist ungültig',
        required_error: 'Gruppen-Id fehlt',
      })
      .min(0, { message: 'Gruppen-Id muss positiv sein' }),
    eId: coerce
      .number({
        invalid_type_error: 'Event-Id ist ungültig',
        required_error: 'Event-Id fehlt',
      })
      .min(0, { message: 'Event-Id muss positiv sein' }),
  }),
});
