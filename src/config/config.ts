import { env as envSchema } from "../schema/env-schema";
import dotenv from "dotenv";
dotenv.config();

const env = envSchema.parse(process.env);

export default env;