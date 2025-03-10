import { array, boolean, coerce, number, object, string } from 'zod';
import { isUtf8 } from 'buffer';
import { locationSchema } from './location.schema';
import validator from 'validator';
import dayjs from 'dayjs';

export const openingDay = object({
  index: coerce
    .number({ message: 'Index ist ungültig' })
    .min(0, { message: 'Index kann nicht negativ werden' })
    .max(6, { message: 'Index kann nicht größer als 6 werden' }),
  openTime: coerce
    .string({ message: 'Öffnungszeit ist ungültig' })
    .refine((open) => validator.isTime(open)),
  closeTime: coerce
    .string({ message: 'Schließzeit ist ungültig' })
    .refine((close) => validator.isTime(close)),
  isClosed: coerce
    .boolean({ message: 'Geschlossen ist ungültig' })
    .default(false),
});

export const createActivitySchema = object({
  body: object({
    name: string({ message: 'Name ist erforderlich' })
      .min(2, 'Name ist zu kurz')
      .max(40, 'Name ist zu lang')
      .refine((name) => isUtf8(Buffer.from(name, 'utf-8')), {
        message: 'Name enthält Sonderzeichen',
      }),
    coverImage: string({ message: 'Titelbild ist erforderlich' }),
    description: string({ message: 'Beschreibung ist erforderlich' })
      .max(1024, {
        message: 'Beschreibung zu lang',
      })
      .nullable(),
    galleryImages: array(string(), { message: 'Fotos sind erforderlich' }).max(
      12,
      'Maximal 12 Fotos erlaubt',
    ),
    location: locationSchema,
    isClosed: coerce
      .boolean({
        message: 'Angabe zu "Geschlossen" ist ungültig',
      })
      .default(false),
    closureNote: string({ message: 'Öffnungsnotiz ist ungültig' }).nullable(),
    minAge: coerce.number({ message: 'Mindestalter ist ungültig' }).default(0),
    businessHours: array(openingDay, {
      message: 'Öffnungszeiten ungültig',
    }).refine(
      (opening) => {
        if (opening.length !== 7) return false;
        const indexOfWeek = Array.from({ length: 7 }, (_, i) => i);
        const givenWeek = opening.map((o) => o.index);
        return indexOfWeek.every(
          (w) => givenWeek.find((g) => g === w) !== undefined,
        );
      },
      { message: 'Bitte definiere die Öffnungszeiten für alle Wochentage' },
    ),
  }),
});

export const deleteActivitySchema = object({
  params: object({
    aId: coerce.number({ message: 'ID fehlt' }),
  }),
});

export const participationSchema = object({
  body: object({
    acId: number({ message: 'Aktivität-Id fehlt' }),
    attendance: boolean({ message: 'Teilnehmestatus fehlt' }),
    date: coerce
      .date({ message: 'Teilnahmedatum fehlt' })
      .refine((date) => dayjs().isBefore(date), {
        message: 'Teilnahmedatum darf nicht in der Vergangenheit liegen',
      })
      .refine(
        (date) => {
          const futureYear = dayjs().add(1, 'year');
          return futureYear.isAfter(date);
        },
        { message: 'Teilnahmedatum auf nächstes Jahr beschränkt' },
      ),
  }),
});

export const searchSchema = object({
  params: object({
    search: string().max(100, 'Query zu lange'),
  }),
});
