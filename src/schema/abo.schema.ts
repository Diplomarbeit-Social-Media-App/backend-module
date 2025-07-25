import { coerce, number, object, string } from 'zod';

export const requestStateSchema = object({
  body: object({
    frId: number({ message: 'Abo-Request-Id fehlt' }),
    accept: coerce.boolean({ message: 'Das Feld `accept` fehlt' }),
  }),
});

export const searchSchema = object({
  params: object({
    userName: string({ message: 'Der Username fehlt' }),
  }),
});

export const postAboSchema = object({
  body: object({
    userName: string({ message: 'Username fehlt' })
      .min(3, { message: 'Username zu kurz' })
      .max(15, { message: 'Username zu lang' }),
  }),
});

export const deleteRequestSchema = object({
  params: object({
    frId: coerce.number({
      invalid_type_error: 'Frid ist keine Nummer',
      required_error: 'Frid fehlt',
    }),
  }),
});

export const getForeignProfileSchema = object({
  params: object({
    uId: coerce.number({
      invalid_type_error: 'User-id muss eine Nummer sein',
      required_error: 'User-id fehlt',
    }),
  }),
});

export const deleteAboSchema = object({
  params: object({
    uId: coerce.number({
      invalid_type_error: 'Uid ist keine Nummer',
      required_error: 'Uid fehlt',
    }),
  }),
});
