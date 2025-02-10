import { object, string } from 'zod';

export const postNotificationTokenSchema = object({
  body: object({
    token: string({ message: 'Token ungültig' }).min(1),
  }),
});
