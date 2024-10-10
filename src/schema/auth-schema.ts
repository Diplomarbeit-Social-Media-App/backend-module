import { object, string } from "zod";

export const loginSchema = object({
  body: object({
    userName: string().min(5),
    password: string().min(10),
  }),
});