import { object, coerce } from 'zod';

export const locationSchema = object({
  plz: coerce
    .number({ message: 'Bitte gib eine Plz ein' })
    .min(1000, { message: 'Plz zu niedrig' })
    .max(9999, { message: 'Plz zu hoch' }),
  street: coerce.string({ message: 'Bitte gib eine Straße an' }).min(3, {
    message: 'Straßenname zu kurz',
  }),
  houseNumber: coerce.string({
    message: 'Bitte gib eine Hausnummer an',
  }),
  city: coerce.string({ message: 'Bitte gib einen Ortsnamen an' }).optional(),
});
