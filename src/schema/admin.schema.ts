import { coerce, object, string } from 'zod';

export const postNotificationSchema = object({
  body: object({
    title: string({ message: 'Title invalid' }),
    message: string({ message: 'Message invalid' }),
  }),
});

export const userNameParamSchema = object({
  params: object({
    userName: string({ message: 'Username invalid' }),
  }),
});

export const aIdParamsSchema = object({
  params: object({
    aId: coerce.number({ message: 'AId ist ungültig' }),
  }),
});
