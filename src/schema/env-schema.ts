import { coerce, object, string, ZodEnum } from "zod";

export const env = object({
  PORT: coerce
    .number({
      message: "PORT must be a number",
    })
    .min(0)
    .max(65536),
  DATABASE_URL: string(),
  NODE_ENV: ZodEnum.create(["production", "development"]),
});
