import zod, { nativeEnum, object, string } from 'zod';
import { ABO_FILTER_SCHEMA } from '../types/abo';
import { ApiError } from '../utils/apiError';
import { BAD_REQUEST } from 'http-status';

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
