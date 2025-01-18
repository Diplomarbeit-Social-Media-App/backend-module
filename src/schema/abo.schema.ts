import zod, { coerce, nativeEnum, number, object, string } from 'zod';
import { ABO_FILTER_SCHEMA, ABO_REQUEST_MODIFY } from '../types/abo';
import { ApiError } from '../utils/apiError';
import { BAD_REQUEST } from 'http-status';

export const requestStateSchema = object({
  body: object({
    frId: number({ message: 'Abo-Request-Id fehlt' }),
    state: nativeEnum(ABO_REQUEST_MODIFY, {
      message: 'State-Wert ist von 0 bis 2',
    }),
  }),
});

export const searchSchema = object({
  params: object({
    userName: string({ message: 'Der Username fehlt' }),
  }),
});

export const getAboSchema = object({
  params: object({
    filter: zod.preprocess(
      (val) => {
        const num = Number(val);
        if (isNaN(num)) {
          throw new ApiError(
            BAD_REQUEST,
            'Filter muss als Zahl mitgegeben werden',
          );
        }
        return num;
      },
      nativeEnum(ABO_FILTER_SCHEMA, {
        message: 'Gib einen gültigen Filter an',
      }),
    ),
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
