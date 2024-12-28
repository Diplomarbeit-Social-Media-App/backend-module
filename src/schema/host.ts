import { coerce, nativeEnum, object, string } from 'zod';
import { socials } from '../types/socials';

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

export const hostRatingDeletionSchema = object({
  params: object({
    hId: coerce.number({ message: 'Host-Id fehlt' }),
  }),
});

export const hostAddSocialSchema = object({
  body: object({
    type: nativeEnum(socials, {
      message: `Link muss von Typ [${Object.values(socials)}] sein`,
    }),
    link: string({ message: 'Link fehlt' }).max(512, {
      message: 'Link zu lang',
    }),
  }),
});
