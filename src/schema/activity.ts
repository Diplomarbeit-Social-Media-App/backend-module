import { coerce, object, string } from 'zod';

export const createActivitySchema = object({
  body: object({
    name: string({ message: 'Name fehlt' }),
    openingTimes: string({ message: 'Öffnungszeiten fehlen' }).default(''),
    description: string({ message: 'Beschreibung fehlt' }).max(1024, {
      message: 'Beschreibung zu lang',
    }),
    minAge: coerce.number({ message: 'Mindestalter fehlt' }).default(0),
    locationId: coerce.number({ message: 'Location-ID fehlt' }),
  }),
});

export const deleteActivitySchema = object({
  params: object({
    aId: coerce.number({ message: 'ID fehlt' }),
  }),
});
