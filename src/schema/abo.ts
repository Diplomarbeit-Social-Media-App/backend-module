import zod, { nativeEnum, object } from 'zod';
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
