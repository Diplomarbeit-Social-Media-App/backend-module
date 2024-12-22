import { object, string } from 'zod';

export const hostDetailsSchema = object({
  params: object({
    userName: string({ message: 'Der Hostname fehlt' }).trim(),
  }),
});
