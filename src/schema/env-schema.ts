import validator from "validator";
import { coerce, object, string, ZodEnum } from "zod";

export const env = object({
  PORT: coerce
    .number({
      message: "PORT must be a number",
    })
    .min(0)
    .max(65536),
  DATABASE_URL: string(),
  NODE_ENV: ZodEnum.create(["production", "development", "test"]),
  SALT: coerce.number({ message: "SALT must be a number" }),
  JWT_SECRET: string().refine((data) => validator.isStrongPassword(data)),
  JWT_ACCESS_EXPIRATION_MINUTES: coerce.number({
    message: "Access token expiration must be defined in minutes",
  }),
  JWT_REFRESH_EXPIRATION_DAYS: coerce.number({
    message: "Refresh token expiration must be defined in days",
  }),
});
