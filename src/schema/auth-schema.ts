import validator from "validator";
import isEmail from "validator/lib/isEmail";
import { date, object, string } from "zod";

export const loginSchema = object({
  body: object({
    userName: string().min(3),
    password: string().refine((data) => validator.isStrongPassword(data), {
      message: "Please use a strong password!",
    }),
  }),
});

export const signUpSchema = object({
  body: object({
    userName: string().min(3).max(15),
    password: string().refine((data) => validator.isStrongPassword(data), {
      message: "Please use a strong password!",
    }),
    email: string().email({ message: "Please use a valid email address" }),
    dateOfBirth: date().min(new Date("2009-01-01"), { message: "You are too young to use our app!"}),
    firstName: string().min(2),
    lastName: string().min(2),
  }),
});
