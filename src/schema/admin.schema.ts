import { object, string } from 'zod';

export const postNotificationSchema = object({
  body: object({
    title: string({ message: 'Title invalid' }),
    message: string({ message: 'Message invalid' }),
  }),
});
