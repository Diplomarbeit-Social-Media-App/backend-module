import validator from 'validator';
import { coerce, object, string, ZodEnum } from 'zod';

export const env = object({
  PORT: coerce
    .number({
      message: 'PORT must be a number',
    })
    .min(0)
    .max(65536),
  DATABASE_URL: string(),
  NODE_ENV: ZodEnum.create(['production', 'development', 'test']),
  SALT: coerce.number({ message: 'SALT must be a number' }),
  JWT_SECRET: string().refine((data) => validator.isStrongPassword(data)),
  JWT_ACCESS_EXPIRATION_MINUTES: coerce.number({
    message: 'Access token expiration must be defined in minutes',
  }),
  JWT_REFRESH_EXPIRATION_DAYS: coerce.number({
    message: 'Refresh token expiration must be defined in days',
  }),
  EMAIL_TOKEN: string({ message: 'Mail token must be specified' }),
  EMAIL_FROM_ADDRESS: string({
    message: 'From mail address must be specified',
  }).refine((email) => validator.isEmail(email), {
    message: 'Value not a valid email',
  }),
  EMAIL_FROM_NAME: string({ message: 'Mail sender name must be specified' }),
  EMAIL_HOST: string({ message: 'Please provide email service host' }),
  MAPS_TOKEN: string({ message: 'Maps API-Token msut be defined' }),
  ACTIVATION_EXP_MINUTES: coerce.number({
    message: 'Activation expiration in minutes must be provided',
  }),
  FIREBASE_ADMIN: string({
    message:
      'FIREBASE_ADMIN must be defined either as path to file (not prod) or a string representing the object in prod',
  }),
});
