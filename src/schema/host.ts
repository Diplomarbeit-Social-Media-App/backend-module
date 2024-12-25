import { coerce, object, string } from 'zod';

export const hostDetailsSchema = object({
  params: object({
    userName: string({ message: 'Der Hostname fehlt' }).trim(),
  }),
});

export const hostRatingSchema = object({
  body: object({
    points: coerce.number({ message: 'Punktezahl fehlt' }).min(1).max(5),
    description: coerce
      .string()
      .max(1024, { message: 'Beschreibung zu lang' })
      .optional(),
    hId: coerce.number({ message: 'Host-Id fehlt' }),
  }),
});
