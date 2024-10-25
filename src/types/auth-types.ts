import { loginSchema, signUpSchema } from "../schema/auth-schema";

export type accountSchema = {
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  description: string;
  picture: string;
};

export type userSchema = accountSchema;

export type hostSchema = accountSchema & {
  isVerified: boolean;
};

const loginSchemaBody = loginSchema.shape.body;
export type loginSchema = Zod.infer<typeof loginSchemaBody>;

const signUpSchemaBody = signUpSchema.shape.body;
export type signUpSchema = Zod.infer<typeof signUpSchemaBody> & {
  isUserSignUp: boolean;
};
