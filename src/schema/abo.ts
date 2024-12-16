import zod, { object } from 'zod';
import { ABO_FILTER_SCHEMA } from '../types/abo';

export const getAboSchema = object({
  body: object({
    filter: zod.nativeEnum(ABO_FILTER_SCHEMA, {
      message: 'Gib einen gültigen Filter an',
    }),
  }),
});
