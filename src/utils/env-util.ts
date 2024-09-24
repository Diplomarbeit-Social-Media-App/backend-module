import { coerce, object, string } from "zod";
import dotenv from "dotenv";

dotenv.config();

const env = object({
  PORT: coerce
    .number({
      message: "PORT must be a number",
    })
    .min(0)
    .max(65536),
  DATABASE_URL: string(),
});

export default env.parse(process.env);
